// The Monogram Atelier: a procedural embroidery renderer.
//
// Pipeline for one design:
//   layout (lettering -> label map, fonts loaded lazily)            main thread, sliced
//   -> fields (coverage, structure-tensor stitch direction, padded relief, sewing order)
//   -> stitches (evenly spaced satin rows, tatami split, edge fuzz, running ring)
//                                                                   worker (geometry.ts)
//   -> raster (each stitch shaded as lit thread into L/S/A float buffers)
//   -> colour (thread palette applied to the buffers; cheap, so recolouring is instant)
//   -> compose (woven fabric + contact and ambient shadow + thread + needle/glint)
//
// Main-thread budget: the heavy pure steps (geometry, the woven fabric) run in a
// module worker (compute.ts; main-thread fallback in short slices). Everything
// left on the main thread is cut into slices of about 8 to 10ms, so no single
// task blocks input. The latest setDesign always wins: a newer design supersedes
// an older one at any stage, and a colour-only change made while a design is
// still being prepared is folded into that run instead of restarting it.
//
// The engine contract is fixed in docs/superpowers/specs/2026-10-04-atelier-direction.md.

import { fabricLinear, threadPalette, type ThreadPalette } from './color.ts';
import { createCompute, slicer } from './compute.ts';
import { isFabricTexture, type FabricTexture } from './fabric.ts';
import type { GeometryResult } from './geometry.ts';
import { isStyleKey, layoutDesign, normaliseText, type StyleKey } from './layout.ts';
import {
  clearBuffers,
  colorize,
  emptyRect,
  makeBuffers,
  rasterize,
  sheenMask,
  type Rect,
  type ThreadBuffers,
} from './raster.ts';

export type { StyleKey } from './layout.ts';
export type { FabricTexture } from './fabric.ts';

export interface Design {
  /** 1 to 3 characters, uppercase handled inside */
  text: string;
  style: StyleKey;
  /** hex, e.g. '#8c3a2e' */
  thread: string;
  /** hex of the fabric ground */
  fabric: string;
  fabricTexture?: FabricTexture;
}

export interface AtelierOptions {
  reducedMotion?: boolean;
  /** hero = cheaper (smaller backing store, coarser thread) */
  quality?: 'hero' | 'studio';
  onProgress?: (p: number) => void;
}

export interface Atelier {
  setDesign(d: Partial<Design>, opts?: { animate?: boolean }): Promise<void>;
  replay(): Promise<void>;
  toBlob(type?: string): Promise<Blob>;
  pause(): void;
  resume(): void;
  destroy(): void;
  /** Extra (not in the original contract): the current normalised design. */
  getDesign(): Design;
}

const DEFAULT_DESIGN: Design = {
  text: 'MAS',
  style: 'classic',
  thread: '#8c3a2e',
  fabric: '#efe6d6',
  fabricTexture: 'linen',
};

const CAPS = {
  studio: { maxW: 1600, maxH: 1200, maxPx: 1600 * 1200, dpr: 2 },
  // the hero is decorative and animates often: a smaller backing store
  hero: { maxW: 720, maxH: 720, maxPx: 640 * 640, dpr: 1.5 },
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const normHex = (v: unknown, fb: string) =>
  typeof v === 'string' && HEX.test(v.trim()) ? '#' + v.trim().replace(/^#/, '').toLowerCase() : fb;

interface Geometry extends GeometryResult {
  /** bounding box of every stitch: the only pixels colour passes need to touch */
  ink: Rect;
}

type Phase = 'idle' | 'prep' | 'finishing' | 'animating';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
}

function ctx2d(c: HTMLCanvasElement, read = false): CanvasRenderingContext2D {
  const x = c.getContext('2d', read ? { willReadFrequently: true } : undefined);
  if (!x) throw new Error('Atelier: 2D canvas unavailable');
  return x;
}

let filterSupport: boolean | null = null;
function canFilter(): boolean {
  if (filterSupport !== null) return filterSupport;
  try {
    const c = ctx2d(makeCanvas(2, 2));
    c.filter = 'blur(1px)';
    filterSupport = c.filter === 'blur(1px)';
  } catch {
    filterSupport = false;
  }
  return filterSupport;
}

function inkOf(g: GeometryResult): Rect {
  const s = g.stitches;
  const r = emptyRect();
  for (let i = 0; i < s.count; i++) {
    const pad = s.w[i] * 0.5 + 2;
    r.x0 = Math.min(r.x0, s.x0[i] - pad, s.x1[i] - pad);
    r.y0 = Math.min(r.y0, s.y0[i] - pad, s.y1[i] - pad);
    r.x1 = Math.max(r.x1, s.x0[i] + pad, s.x1[i] + pad);
    r.y1 = Math.max(r.y1, s.y0[i] + pad, s.y1[i] + pad);
  }
  r.x0 = Math.max(0, Math.floor(r.x0));
  r.y0 = Math.max(0, Math.floor(r.y0));
  r.x1 = Math.min(g.W, Math.ceil(r.x1));
  r.y1 = Math.min(g.H, Math.ceil(r.y1));
  return r;
}

/** Build a renderer bound to `canvas`. */
export function createAtelier(canvas: HTMLCanvasElement, opts: AtelierOptions = {}): Atelier {
  const quality = opts.quality === 'hero' ? 'hero' : 'studio';
  const cap = CAPS[quality];
  const main = ctx2d(canvas);
  const compute = createCompute();

  let design: Design = { ...DEFAULT_DESIGN };
  let destroyed = false;
  let W = 0;
  let H = 0;

  let geo: Geometry | null = null;
  let buffers: ThreadBuffers | null = null;
  let stitchCanvas: HTMLCanvasElement | null = null;
  let stitchImg: ImageData | null = null;
  let fabricCanvas: HTMLCanvasElement | null = null;
  let fabricKey = '';
  let fabricBusy: Promise<void> | null = null;
  let ambient: HTMLCanvasElement | null = null;
  let contact: HTMLCanvasElement | null = null;
  let sheenCanvas: HTMLCanvasElement | null = null;
  let glintCanvas: HTMLCanvasElement | null = null;
  let palette: ThreadPalette = threadPalette(design.thread);
  /** how many stitches are rasterised into the buffers */
  let drawn = 0;

  // lifecycle
  let seq = 0;
  let phase: Phase = 'idle';
  /** the render being prepared (layout, geometry, fabric), if any */
  let prepJob: { token: number; animate: boolean } | null = null;
  let renderPromise: Promise<void> | null = null;
  let raf = 0;
  let paused = false;
  let running: null | {
    token: number;
    resolve: () => void;
    tick: (t: number) => void;
  } = null;
  let lastFrame = 0;

  const reduced = () =>
    !!opts.reducedMotion ||
    (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- sizing ----------
  function measure(): [number, number] {
    const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;
    let cw = canvas.clientWidth;
    let ch = canvas.clientHeight;
    if (!cw || !ch) {
      cw = canvas.width || 800;
      ch = canvas.height || 600;
      return fit(cw, ch);
    }
    const k = Math.min(dpr, cap.dpr);
    return fit(cw * k, ch * k);
  }
  function fit(w: number, h: number): [number, number] {
    let s = Math.min(1, cap.maxW / w, cap.maxH / h, Math.sqrt(cap.maxPx / (w * h)));
    if (!isFinite(s) || s <= 0) s = 1;
    return [Math.max(64, Math.round(w * s)), Math.max(48, Math.round(h * s))];
  }

  function ensureSize(): boolean {
    const [w, h] = measure();
    if (w === W && h === H && stitchCanvas) return false;
    W = w;
    H = h;
    canvas.width = W;
    canvas.height = H;
    buffers = makeBuffers(W, H);
    stitchCanvas = makeCanvas(W, H);
    stitchImg = new ImageData(W, H);
    fabricCanvas = makeCanvas(W, H);
    fabricKey = '';
    const filt = canFilter();
    ambient = makeCanvas(Math.ceil(W / (filt ? 4 : 8)), Math.ceil(H / (filt ? 4 : 8)));
    contact = makeCanvas(Math.ceil(W / (filt ? 2 : 3)), Math.ceil(H / (filt ? 2 : 3)));
    sheenCanvas = null;
    geo = null;
    drawn = 0;
    return true;
  }

  // ---------- fabric ----------
  const fabricWanted = () => `${design.fabricTexture ?? 'linen'}|${design.fabric}|${W}x${H}`;

  /** Make the fabric canvas match the current design (single flight, latest wins). */
  async function ensureFabric(): Promise<void> {
    while (!destroyed && fabricCanvas && fabricWanted() !== fabricKey) {
      if (fabricBusy) {
        await fabricBusy;
        continue;
      }
      const key = fabricWanted();
      const tex: FabricTexture = design.fabricTexture ?? 'linen';
      const w = W;
      const h = H;
      const target = fabricCanvas;
      const pitch = Math.max(2.2, Math.min(w, h) / (quality === 'hero' ? 210 : 230));
      fabricBusy = (async () => {
        const px = await compute.fabric(
          { tex, W: w, H: h, pitch, lin: fabricLinear(design.fabric) },
          () => !destroyed && fabricWanted() === key,
        );
        if (!px || destroyed || target !== fabricCanvas || px.length !== w * h * 4) return;
        ctx2d(target).putImageData(new ImageData(px as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0);
        fabricKey = key;
      })();
      try {
        await fabricBusy;
      } finally {
        fabricBusy = null;
      }
    }
  }

  // ---------- geometry ----------
  async function ensureGeometry(token: number): Promise<boolean> {
    const key = `${design.text}|${design.style}|${W}x${H}|${quality}`;
    if (geo && geo.key === key) return true;
    const alive = () => token === seq && !destroyed;
    const lay = await layoutDesign(design.text, design.style, W, H, slicer(10));
    if (!alive()) return false;
    const res = await compute.geometry(
      {
        key,
        quality,
        W,
        H,
        labels: lay.labels,
        order: lay.order,
        fillAngle: [...lay.fillAngle],
        letterH: lay.letterH,
        ring: lay.ring,
        ringLabel: lay.ringLabel,
      },
      alive,
    );
    if (!res || !alive()) return false;
    geo = { ...res, ink: inkOf(res) };
    drawn = 0;
    return true;
  }

  // ---------- drawing ----------
  function pushStitchPixels(rect: Rect | null) {
    if (!buffers || !stitchImg || !stitchCanvas) return;
    const c = ctx2d(stitchCanvas);
    // null = the whole stitched area (a recolour)
    if (!rect) {
      if (!geo) return;
      rect = geo.ink;
    }
    if (rect.x1 <= rect.x0 || rect.y1 <= rect.y0) return;
    const x0 = Math.max(0, rect.x0);
    const y0 = Math.max(0, rect.y0);
    const x1 = Math.min(W, rect.x1);
    const y1 = Math.min(H, rect.y1);
    colorize(buffers, palette, stitchImg.data, { x0, y0, x1, y1 });
    c.putImageData(stitchImg, 0, 0, x0, y0, x1 - x0, y1 - y0);
  }

  function updateShadows() {
    if (!stitchCanvas || !ambient || !contact) return;
    const u = Math.min(W, H) / 1000;
    const filt = canFilter();
    for (const [cv, blur] of [
      [ambient, 9 * u],
      [contact, 1.6 * u],
    ] as const) {
      const c = ctx2d(cv);
      const sx = cv.width / W;
      c.globalCompositeOperation = 'copy';
      if (filt) c.filter = `blur(${Math.max(0.5, blur * sx).toFixed(2)}px)`;
      c.drawImage(stitchCanvas, 0, 0, cv.width, cv.height);
      if (filt) c.filter = 'none';
      c.globalCompositeOperation = 'source-in';
      c.fillStyle = 'rgb(28,20,14)';
      c.fillRect(0, 0, cv.width, cv.height);
      c.globalCompositeOperation = 'source-over';
    }
  }

  function compose() {
    if (!fabricCanvas || !stitchCanvas || !ambient || !contact) return;
    const u = Math.min(W, H) / 1000;
    main.globalCompositeOperation = 'source-over';
    main.globalAlpha = 1;
    main.drawImage(fabricCanvas, 0, 0);
    main.imageSmoothingEnabled = true;
    main.globalCompositeOperation = 'multiply';
    main.globalAlpha = 0.42;
    main.drawImage(ambient, 7 * u, 10 * u, W, H);
    main.globalAlpha = 0.62;
    main.drawImage(contact, 1.4 * u, 2.2 * u, W, H);
    main.globalCompositeOperation = 'source-over';
    main.globalAlpha = 1;
    main.drawImage(stitchCanvas, 0, 0);
  }

  function threadCss() {
    return design.thread;
  }

  /** Needle, its shadow and the trailing thread, with the tip at (x, y). */
  function drawNeedle(x: number, y: number, t: number) {
    const u = Math.min(W, H) / 1000;
    const len = 170 * u;
    const bob = (0.5 + 0.5 * Math.sin(t * 0.045)) * 9 * u;
    const dx = 0.38;
    const dy = -0.925;
    const tipX = x - dx * bob;
    const tipY = y - dy * bob;
    const topX = tipX + dx * len;
    const topY = tipY + dy * len;
    const eyeX = tipX + dx * len * 0.86;
    const eyeY = tipY + dy * len * 0.86;
    const sw = Math.max(1.6, 5.2 * u);

    // trailing thread: from the eye, sweeping up and out of the frame
    const endX = Math.min(W + 40 * u, eyeX + 260 * u);
    const endY = -30 * u;
    const ctrlX = eyeX + 40 * u + Math.sin(t * 0.003) * 20 * u;
    const ctrlY = eyeY - 30 * u;
    main.lineCap = 'round';
    // thread shadow on the fabric
    main.globalAlpha = 0.22;
    main.strokeStyle = 'rgb(20,14,10)';
    main.lineWidth = Math.max(1, 3 * u);
    main.beginPath();
    main.moveTo(x + 2 * u, y + 3 * u);
    main.quadraticCurveTo(ctrlX + 30 * u, ctrlY + 60 * u, endX + 40 * u, endY + 60 * u);
    main.stroke();
    // needle shadow (meets the needle at the tip)
    main.globalAlpha = 0.14;
    main.lineWidth = sw * 1.8;
    main.beginPath();
    main.moveTo(tipX, tipY);
    main.lineTo(topX + 16 * u, topY + 26 * u);
    main.stroke();
    main.globalAlpha = 1;
    // the thread itself
    main.strokeStyle = threadCss();
    main.lineWidth = Math.max(1, 2.4 * u);
    main.beginPath();
    main.moveTo(tipX + 0.5, tipY);
    main.lineTo(eyeX, eyeY);
    main.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    main.stroke();
    // thread highlight
    main.globalAlpha = 0.35;
    main.strokeStyle = '#fff';
    main.lineWidth = Math.max(0.6, 0.8 * u);
    main.beginPath();
    main.moveTo(eyeX, eyeY);
    main.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    main.stroke();
    main.globalAlpha = 1;
    // needle body: steel with a bright core
    const nx = -dy;
    const ny = dx;
    const g = main.createLinearGradient(
      tipX - nx * sw,
      tipY - ny * sw,
      tipX + nx * sw,
      tipY + ny * sw,
    );
    g.addColorStop(0, '#5d6268');
    g.addColorStop(0.35, '#e9edf0');
    g.addColorStop(0.55, '#ffffff');
    g.addColorStop(1, '#4a4f55');
    main.fillStyle = g;
    main.beginPath();
    main.moveTo(tipX, tipY);
    main.lineTo(tipX + dx * len * 0.18 + (nx * sw) / 2, tipY + dy * len * 0.18 + (ny * sw) / 2);
    main.lineTo(topX + (nx * sw) / 2, topY + (ny * sw) / 2);
    main.lineTo(topX - (nx * sw) / 2, topY - (ny * sw) / 2);
    main.lineTo(tipX + dx * len * 0.18 - (nx * sw) / 2, tipY + dy * len * 0.18 - (ny * sw) / 2);
    main.closePath();
    main.fill();
    // eye
    main.fillStyle = 'rgba(30,30,34,0.85)';
    main.beginPath();
    main.ellipse(eyeX, eyeY, sw * 0.18, sw * 1.6, Math.atan2(dy, dx) + Math.PI / 2, 0, Math.PI * 2);
    main.fill();
    // tip glint
    const glow = main.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10 * u);
    glow.addColorStop(0, 'rgba(255,255,255,0.75)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    main.fillStyle = glow;
    main.beginPath();
    main.arc(tipX, tipY, 10 * u, 0, Math.PI * 2);
    main.fill();
  }

  /**
   * Build the glint's sheen layer a band of rows at a time (it is a full pass
   * over the stitched area). Returns true once complete.
   */
  let sheenImg: ImageData | null = null;
  let sheenRow = 0;
  function sheenStep(budgetMs: number): boolean {
    if (sheenCanvas || !buffers || !geo) return true;
    const ink = geo.ink;
    if (!sheenImg || sheenImg.width !== W || sheenImg.height !== H) {
      sheenImg = new ImageData(W, H);
      sheenRow = ink.y0;
    }
    if (sheenRow < ink.y0) sheenRow = ink.y0;
    const end = now() + budgetMs;
    const band = Math.max(4, Math.floor(30000 / Math.max(1, ink.x1 - ink.x0)));
    while (sheenRow < ink.y1) {
      const y1 = Math.min(ink.y1, sheenRow + band);
      sheenMask(buffers, sheenImg.data, { x0: ink.x0, y0: sheenRow, x1: ink.x1, y1 });
      sheenRow = y1;
      if (now() > end) break;
    }
    if (sheenRow < ink.y1) return false;
    sheenCanvas = makeCanvas(W, H);
    ctx2d(sheenCanvas).putImageData(
      sheenImg,
      0,
      0,
      ink.x0,
      ink.y0,
      ink.x1 - ink.x0,
      ink.y1 - ink.y0,
    );
    sheenRow = 0;
    return true;
  }
  function resetSheen() {
    sheenCanvas = null;
    sheenRow = 0;
    if (sheenImg) sheenImg.data.fill(0);
  }

  function drawGlint(p: number) {
    if (!sheenCanvas) return;
    if (!glintCanvas || glintCanvas.width !== W || glintCanvas.height !== H) {
      glintCanvas = makeCanvas(W, H);
    }
    const band = glintCanvas;
    const c = ctx2d(band);
    c.globalCompositeOperation = 'copy';
    const span = W + H;
    const pos = -0.25 * span + p * 1.5 * span;
    const g = c.createLinearGradient(pos - H * 0.35, 0, pos + H * 0.35, H * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'destination-in';
    c.drawImage(sheenCanvas, 0, 0);
    main.globalCompositeOperation = 'lighter';
    main.globalAlpha = 0.9 * Math.sin(Math.PI * Math.min(1, p));
    main.drawImage(band, 0, 0);
    main.globalAlpha = 1;
    main.globalCompositeOperation = 'source-over';
  }

  /** Empty thread buffers and stitch layer (a fresh piece of cloth). */
  function clearStitches() {
    if (!buffers || !stitchImg || !stitchCanvas) return;
    clearBuffers(buffers);
    stitchImg.data.fill(0);
    ctx2d(stitchCanvas).clearRect(0, 0, W, H);
    drawn = 0;
    resetSheen();
  }

  /** Colour the whole stitched area, a band of rows per slice. */
  async function colorizeSliced(alive: () => boolean): Promise<boolean> {
    if (!geo || !buffers || !stitchImg || !stitchCanvas) return false;
    const ink = geo.ink;
    const tick = slicer(8);
    const band = Math.max(4, Math.floor(40000 / Math.max(1, ink.x1 - ink.x0)));
    for (let y = ink.y0; y < ink.y1; y += band) {
      const r = { x0: ink.x0, y0: y, x1: ink.x1, y1: Math.min(ink.y1, y + band) };
      colorize(buffers, palette, stitchImg.data, r);
      await tick();
      if (!alive()) return false;
    }
    if (ink.x1 > ink.x0 && ink.y1 > ink.y0) {
      ctx2d(stitchCanvas).putImageData(
        stitchImg,
        0,
        0,
        ink.x0,
        ink.y0,
        ink.x1 - ink.x0,
        ink.y1 - ink.y0,
      );
    }
    return true;
  }

  /** Rasterise everything left, in slices, and show the finished piece. */
  async function finishSliced(token: number): Promise<boolean> {
    const alive = () => token === seq && !destroyed;
    if (!geo || !buffers) return false;
    const g = geo;
    const b = buffers;
    const N = g.stitches.count;
    const tick = slicer(8);
    const r = emptyRect();
    while (drawn < N) {
      const step = Math.min(N, drawn + 64);
      rasterize(b, g.stitches, drawn, step, g.relief, r);
      drawn = step;
      await tick();
      if (!alive()) return false;
    }
    if (!(await colorizeSliced(alive))) return false;
    // a colour change made while finishing lands here
    await ensureFabric();
    if (!alive()) return false;
    updateShadows();
    compose();
    return true;
  }

  function stopRunning() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (running) {
      const r = running.resolve;
      running = null;
      r();
    }
  }

  function loop(t: number) {
    raf = 0;
    if (!running || paused || destroyed) return;
    running.tick(t);
    if (running && !paused) raf = requestAnimationFrame(loop);
  }

  function animate(token: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!geo || !buffers) return resolve();
      const g = geo;
      const b = buffers;
      clearStitches();
      const N = g.stitches.count;
      const letters = Math.max(1, Array.from(design.text).length);
      const stitchMs = Math.min(3600, 2500 + letters * 280);
      const glintMs = 950;
      let elapsed = 0;
      let step: 'stitch' | 'sheen' | 'glint' = 'stitch';
      let glintT = 0;
      let frameNo = 0;
      lastFrame = 0;
      const tick = (t: number) => {
        const dt = lastFrame ? Math.min(50, t - lastFrame) : 16;
        lastFrame = t;
        if (step === 'stitch') {
          elapsed += dt;
          const p = Math.min(1, elapsed / stitchMs);
          // mostly linear, softened at both ends
          const q = 0.75 * p + 0.25 * (0.5 - 0.5 * Math.cos(Math.PI * p));
          const target = Math.min(N, Math.ceil(q * N));
          const r = emptyRect();
          const budget = now() + 6;
          while (drawn < target) {
            const next = Math.min(target, drawn + 24);
            rasterize(b, g.stitches, drawn, next, g.relief, r);
            drawn = next;
            if (now() > budget) break;
          }
          pushStitchPixels(r);
          // soft shadows lag a frame behind the thread: invisible, halves the cost
          if ((frameNo++ & 1) === 0 || drawn >= N) updateShadows();
          compose();
          if (drawn > 0 && drawn < N) {
            const k = drawn - 1;
            drawNeedle(g.stitches.x1[k], g.stitches.y1[k], t);
          }
          opts.onProgress?.(Math.min(0.999, drawn / Math.max(1, N)));
          if (drawn >= N && p >= 1) step = 'sheen';
        } else if (step === 'sheen') {
          // the finished piece holds still for a frame or two while its sheen is measured
          if (sheenStep(6)) step = 'glint';
        } else {
          glintT += dt;
          const p = Math.min(1, glintT / glintMs);
          compose();
          drawGlint(p);
          if (p >= 1) {
            compose();
            opts.onProgress?.(1);
            if (running && running.token === token) {
              running = null;
              phase = 'idle';
              resolve();
            }
          }
        }
      };
      running = { token, resolve, tick };
      phase = 'animating';
      if (!paused) raf = requestAnimationFrame(loop);
    });
  }

  async function render(animateIt: boolean, forceGeometry = false): Promise<void> {
    stopRunning();
    const token = ++seq;
    if (destroyed) return;
    if (!canvas.isConnected && !canvas.width) return;
    phase = 'prep';
    const job = { token, animate: animateIt };
    prepJob = job;
    const alive = () => token === seq && !destroyed;
    try {
      ensureSize();
      if (forceGeometry) geo = null;
      const prevGeo = geo;
      await ensureFabric();
      if (!alive()) return;
      const ok = await ensureGeometry(token);
      if (!ok || !alive() || !geo || !buffers) return;
      // a colour change made while the geometry was prepared
      await ensureFabric();
      if (!alive() || !geo) return;
      if (geo !== prevGeo) clearStitches();
    } finally {
      if (prepJob === job) prepJob = null;
      if (token === seq && phase === 'prep') phase = 'idle';
    }
    const g = geo as Geometry;
    if (g.empty) {
      clearStitches();
      updateShadows();
      compose();
      opts.onProgress?.(1);
      return;
    }
    if (job.animate && !reduced()) {
      await animate(token);
    } else {
      phase = 'finishing';
      const done = await finishSliced(token);
      if (token === seq) phase = 'idle';
      if (done) opts.onProgress?.(1);
    }
  }

  function startRender(animateIt: boolean, forceGeometry = false): Promise<void> {
    const p = render(animateIt, forceGeometry);
    renderPromise = p;
    void p.finally(() => {
      if (renderPromise === p) renderPromise = null;
    });
    return p;
  }

  // ---------- resize ----------
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  const ro =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          if (destroyed) return;
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            const [w, h] = measure();
            if (Math.abs(w - W) < 3 && Math.abs(h - H) < 3) return;
            // nothing drawn yet: the first setDesign will size the canvas itself
            if (!W && !renderPromise) return;
            const wasRunning = !!running || !!prepJob?.animate;
            void startRender(wasRunning);
          }, 160);
        })
      : null;
  ro?.observe(canvas);

  // ---------- public API ----------
  function normalise(d: Partial<Design>): Design {
    const n: Design = { ...design };
    if (d.text !== undefined) n.text = normaliseText(d.text);
    if (d.style !== undefined && isStyleKey(d.style)) n.style = d.style;
    if (d.thread !== undefined) n.thread = normHex(d.thread, n.thread);
    if (d.fabric !== undefined) n.fabric = normHex(d.fabric, n.fabric);
    if (d.fabricTexture !== undefined && isFabricTexture(d.fabricTexture))
      n.fabricTexture = d.fabricTexture;
    return n;
  }

  const api: Atelier = {
    async setDesign(d, o) {
      if (destroyed) return;
      const next = normalise(d);
      const geoChanged = next.text !== design.text || next.style !== design.style;
      const threadChanged = next.thread !== design.thread;
      design = next;
      if (threadChanged) palette = threadPalette(design.thread);
      const hasPiece = !!geo || phase === 'prep';
      const animateIt = o?.animate ?? (geoChanged || !hasPiece);

      if (!geoChanged && hasPiece && phase === 'prep' && prepJob) {
        // the piece being prepared already has this lettering: it picks the
        // new colours up itself, so do not restart it
        if (o?.animate) prepJob.animate = true;
        return renderPromise ?? undefined;
      }
      if (!geoChanged && !animateIt && hasPiece) {
        const [w, h] = measure();
        if (phase !== 'idle' || (w === W && h === H)) {
          // colour-only change: recolour in place, no relayout, no restitch
          await ensureFabric();
          if (destroyed) return;
          if (phase === 'animating' || phase === 'idle') {
            if (threadChanged) pushStitchPixels(null);
            if (phase === 'idle') compose();
          }
          // 'finishing' recolours and composes itself at its end
          return;
        }
      }
      await startRender(animateIt);
    },
    replay() {
      if (destroyed) return Promise.resolve();
      return startRender(true);
    },
    toBlob(type = 'image/png') {
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Atelier: toBlob failed'))), type);
      });
    },
    pause() {
      if (paused) return;
      paused = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    resume() {
      if (!paused || destroyed) return;
      paused = false;
      lastFrame = 0;
      if (running && !raf) raf = requestAnimationFrame(loop);
    },
    destroy() {
      if (destroyed) return;
      stopRunning();
      destroyed = true;
      seq++;
      compute.destroy();
      ro?.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      for (const c of [stitchCanvas, fabricCanvas, ambient, contact, sheenCanvas, glintCanvas]) {
        if (c) c.width = c.height = 0;
      }
      stitchCanvas = fabricCanvas = ambient = contact = sheenCanvas = glintCanvas = null;
      buffers = null;
      stitchImg = null;
      sheenImg = null;
      geo = null;
    },
    getDesign() {
      return { ...design };
    },
  };
  return api;
}
