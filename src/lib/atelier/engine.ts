// The Monogram Atelier: a procedural embroidery renderer.
//
// Pipeline for one design:
//   layout (lettering -> label map, fonts loaded lazily)
//   -> fields (coverage, structure-tensor stitch direction, padded relief, sewing order)
//   -> stitches (evenly spaced satin rows, tatami split, edge fuzz, running ring)
//   -> raster (each stitch shaded as lit thread into L/S/A float buffers)
//   -> colour (thread palette applied to the buffers; cheap, so recolouring is instant)
//   -> compose (woven fabric + contact and ambient shadow + thread + needle/glint)
//
// The engine contract is fixed in docs/superpowers/specs/2026-10-04-atelier-direction.md.

import { fabricLinear, threadPalette, type ThreadPalette } from './color.ts';
import {
  fabricJob,
  fabricRows,
  isFabricTexture,
  tintFabric,
  type FabricTexture,
} from './fabric.ts';
import {
  boxBlur,
  downsample,
  erodeLabels,
  geodesic,
  relief as makeRelief,
  tensorField,
  type Relief,
} from './field.ts';
import { isStyleKey, layoutDesign, normaliseText, type StyleKey } from './layout.ts';
import { seedOf } from './noise.ts';
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
import {
  KIND_FUZZ,
  KIND_UNDER,
  addFuzz,
  addRunningRing,
  fillRegions,
  makeStitches,
  orderStitches,
  type Stitches,
} from './stitches.ts';

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
  studio: { maxW: 1600, maxH: 1200, maxPx: 1600 * 1200 },
  hero: { maxW: 900, maxH: 900, maxPx: 900 * 700 },
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const normHex = (v: unknown, fb: string) =>
  typeof v === 'string' && HEX.test(v.trim()) ? '#' + v.trim().replace(/^#/, '').toLowerCase() : fb;

interface Geometry {
  key: string;
  W: number;
  H: number;
  stitches: Stitches;
  relief: Relief | null;
  /** stitches whose kind is real thread (excludes fuzz) count, for progress */
  dsep: number;
  empty: boolean;
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
/** Yield to the event loop (not rAF: a hidden tab must still finish a static render). */
// MessageChannel rather than setTimeout: timers are clamped (and throttled to
// 1s in background tabs), message tasks are not.
let yieldChannel: MessageChannel | null = null;
const yieldQueue: (() => void)[] = [];
const nextFrame = () =>
  new Promise<void>((r) => {
    if (typeof MessageChannel !== 'function') {
      setTimeout(r, 0);
      return;
    }
    if (!yieldChannel) {
      yieldChannel = new MessageChannel();
      yieldChannel.port1.onmessage = () => yieldQueue.shift()?.();
    }
    yieldQueue.push(r);
    yieldChannel.port2.postMessage(0);
  });

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

/** Build a renderer bound to `canvas`. */
export function createAtelier(canvas: HTMLCanvasElement, opts: AtelierOptions = {}): Atelier {
  const quality = opts.quality === 'hero' ? 'hero' : 'studio';
  const cap = CAPS[quality];
  const main = ctx2d(canvas);

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
  const shadeCache = new Map<string, Float32Array>();
  let ambient: HTMLCanvasElement | null = null;
  let contact: HTMLCanvasElement | null = null;
  let sheenCanvas: HTMLCanvasElement | null = null;
  let glintCanvas: HTMLCanvasElement | null = null;
  let palette: ThreadPalette = threadPalette(design.thread);
  /** how many stitches are rasterised into the buffers */
  let drawn = 0;

  // animation
  let seq = 0;
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
    return fit(cw * Math.min(dpr, 2), ch * Math.min(dpr, 2));
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
  async function ensureFabric(token: number) {
    const tex: FabricTexture = design.fabricTexture ?? 'linen';
    const key = `${tex}|${design.fabric}|${W}x${H}`;
    if (key === fabricKey) return;
    const shadeKey = `${tex}|${W}x${H}`;
    let shade = shadeCache.get(shadeKey);
    if (!shade) {
      const pitch = Math.max(2.2, Math.min(W, H) / (quality === 'hero' ? 210 : 230));
      const job = fabricJob(tex, W, H, pitch, 7);
      let t0 = now();
      for (let y = 0; y < H; y += 32) {
        fabricRows(job, y, Math.min(H, y + 32));
        if (now() - t0 > 24) {
          await nextFrame();
          if (token !== seq || destroyed) return;
          t0 = now();
        }
      }
      shade = job.shade;
      // normalise so the fabric reads as its own colour, whatever the weave contrast
      let sum = 0;
      for (let i = 0; i < shade.length; i += 7) sum += shade[i];
      const gain = 0.97 / (sum / Math.ceil(shade.length / 7));
      for (let i = 0; i < shade.length; i++) shade[i] *= gain;
      shadeCache.set(shadeKey, shade);
      // keep the cache small: the current size, every texture
      for (const k of shadeCache.keys()) if (!k.endsWith(`${W}x${H}`)) shadeCache.delete(k);
    }
    const img = new ImageData(W, H);
    tintFabric(shade, fabricLinear(design.fabric), img.data);
    ctx2d(fabricCanvas as HTMLCanvasElement).putImageData(img, 0, 0);
    fabricKey = key;
  }

  // ---------- geometry ----------
  async function ensureGeometry(token: number): Promise<boolean> {
    const key = `${design.text}|${design.style}|${W}x${H}|${quality}`;
    if (geo && geo.key === key) return true;
    const lay = await layoutDesign(design.text, design.style, W, H);
    if (token !== seq || destroyed) return false;
    const seed = seedOf(key);
    if (!lay.order.length) {
      geo = { key, W, H, stitches: makeStitches(1), relief: null, dsep: 3, empty: true };
      return true;
    }
    const f = 2;
    const coarse = downsample(lay.labels, W, H, f);
    // stroke width estimate: 2 * area / perimeter
    let area = 0;
    let perim = 0;
    for (let y = 1; y < coarse.h - 1; y++) {
      for (let x = 1; x < coarse.w - 1; x++) {
        const i = y * coarse.w + x;
        area += coarse.cov[i];
        perim +=
          Math.hypot(
            coarse.cov[i + 1] - coarse.cov[i - 1],
            coarse.cov[i + coarse.w] - coarse.cov[i - coarse.w],
          ) * 0.5;
      }
    }
    const strokeW = perim > 0 ? (2 * area * f) / perim : 20;
    const dsep = Math.max(
      quality === 'hero' ? 1.9 : 3.2,
      Math.min(quality === 'hero' ? 4 : 5.6, lay.letterH / 105),
    );
    const tensorR = Math.max(2, Math.min(10, Math.round((strokeW * 0.22) / f)));
    const angles = lay.fillAngle;
    const dirOf = (l: number, turn = 0): [number, number] => {
      const a = (angles.get(l) ?? 0.66) + turn;
      return [Math.cos(a), Math.sin(a)];
    };
    const field = tensorField(coarse, tensorR, (l) => dirOf(l), 0.015, 'dt');
    await nextFrame();
    if (token !== seq || destroyed) return false;

    const maxSatin = Math.max(dsep * 8, lay.letterH * 0.42);
    const fillLabels = lay.order.filter((l) => l !== lay.ringLabel);

    // Underlay: a sparse, inset lattice laid first (as a digitiser would), so any
    // gap between top stitches shows thread, never bare fabric.
    const underLabels = erodeLabels(lay.labels, W, H, dsep * 1.2);
    const underField = tensorField(coarse, 1, (l) => dirOf(l, Math.PI / 2), 1e4);
    let stitches = fillRegions(underLabels, W, H, underField, {
      dsep: dsep * 2.6,
      maxSatin: maxSatin * 1.6,
      fillLen: maxSatin * 0.9,
      widthRatio: 0.55,
      fillDir: (l) => dirOf(l, Math.PI / 2),
      seed: seed ^ 0x1234,
      labels: fillLabels,
      kind: KIND_UNDER,
      tick: () => token === seq && !destroyed,
    });
    if (!stitches || token !== seq || destroyed) return false;
    stitches = fillRegions(
      lay.labels,
      W,
      H,
      field,
      {
        dsep,
        maxSatin,
        fillLen: maxSatin * 0.42,
        widthRatio: 1.45,
        fillDir: (l) => {
          const a = angles.get(l) ?? 0.66;
          return [Math.cos(a), Math.sin(a)];
        },
        seed,
        labels: fillLabels,
        tick: () => token === seq && !destroyed,
      },
      stitches,
    );
    if (!stitches || token !== seq || destroyed) return false;
    stitches = addFuzz(
      stitches,
      coarse.cov,
      coarse.lab,
      coarse.w,
      coarse.h,
      f,
      quality === 'hero' ? 0.05 : 0.1,
      dsep * 1.1,
      seed,
    );

    // sewing order: element rank, then geodesic distance along the strokes
    const geod = geodesic(coarse);
    const rank = new Map<number, number>();
    lay.order.forEach((l, k) => rank.set(l, k));
    const span = 1e6;
    const lookup = (x: number, y: number, l: number) => {
      const cx = Math.min(coarse.w - 1, Math.max(0, (x / f) | 0));
      const cy = Math.min(coarse.h - 1, Math.max(0, (y / f) | 0));
      const i = cy * coarse.w + cx;
      return coarse.lab[i] === l ? geod[i] : -1;
    };
    let fallback = 0;
    for (let i = 0; i < stitches.count; i++) {
      const l = stitches.label[i];
      const mx = (stitches.x0[i] + stitches.x1[i]) * 0.5;
      const my = (stitches.y0[i] + stitches.y1[i]) * 0.5;
      let d = lookup(mx, my, l);
      if (d < 0) d = lookup(stitches.x0[i], stitches.y0[i], l);
      if (d < 0) d = lookup(stitches.x1[i], stitches.y1[i], l);
      if (d < 0) d = fallback;
      else fallback = d;
      // fuzz lands a moment after the stitches around it
      if (stitches.kind[i] === KIND_FUZZ) d += 6;
      // a digitiser lays the whole underlay of an element first, then the top
      const top = stitches.kind[i] === KIND_UNDER ? 0 : span / 2;
      stitches.key[i] = (rank.get(l) ?? 0) * span + top + d;
    }
    if (lay.ring && lay.ringLabel) {
      const before = stitches.count;
      const runW = dsep * 1.7;
      stitches = addRunningRing(
        stitches,
        lay.ring.cx,
        lay.ring.cy,
        lay.ring.r,
        dsep * 5.5,
        dsep * 3.2,
        runW,
        lay.ringLabel,
        seed,
      );
      const r = (rank.get(lay.ringLabel) ?? 0) * span;
      for (let i = before; i < stitches.count; i++) stitches.key[i] = r + stitches.key[i] * 1000;
    }
    stitches = orderStitches(stitches);

    const reliefR = Math.max(1, Math.min(10, Math.round((strokeW * 0.32) / f)));
    const rel = makeRelief(coarse, reliefR, reliefR * 1.5);
    // keep a little relief smoothing so the padding never shows grid steps
    rel.gx = boxBlur(rel.gx, rel.w, rel.h, 1, 1);
    rel.gy = boxBlur(rel.gy, rel.w, rel.h, 1, 1);
    geo = { key, W, H, stitches, relief: rel, dsep, empty: false };
    drawn = 0;
    return true;
  }

  // ---------- drawing ----------
  function pushStitchPixels(rect: Rect | null) {
    if (!buffers || !stitchImg || !stitchCanvas) return;
    const c = ctx2d(stitchCanvas);
    if (!rect) {
      colorize(buffers, palette, stitchImg.data);
      c.putImageData(stitchImg, 0, 0);
      return;
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

  function ensureSheen() {
    if (sheenCanvas || !buffers) return;
    sheenCanvas = makeCanvas(W, H);
    const img = new ImageData(W, H);
    sheenMask(buffers, img.data);
    ctx2d(sheenCanvas).putImageData(img, 0, 0);
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

  /** Rasterise everything left and show the finished piece. */
  function finishInstant() {
    if (!geo || !buffers) return;
    if (drawn < geo.stitches.count) {
      const r = emptyRect();
      rasterize(buffers, geo.stitches, drawn, geo.stitches.count, geo.relief, r);
      drawn = geo.stitches.count;
    }
    pushStitchPixels(null);
    updateShadows();
    compose();
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
      clearBuffers(b);
      drawn = 0;
      sheenCanvas = null;
      pushStitchPixels(null);
      const N = g.stitches.count;
      const letters = Math.max(1, Array.from(design.text).length);
      const stitchMs = Math.min(3600, 2500 + letters * 280);
      const glintMs = 950;
      let elapsed = 0;
      let phase: 'stitch' | 'glint' = 'stitch';
      let glintT = 0;
      let frameNo = 0;
      lastFrame = 0;
      const tick = (t: number) => {
        const dt = lastFrame ? Math.min(50, t - lastFrame) : 16;
        lastFrame = t;
        if (phase === 'stitch') {
          elapsed += dt;
          const p = Math.min(1, elapsed / stitchMs);
          // mostly linear, softened at both ends
          const q = 0.75 * p + 0.25 * (0.5 - 0.5 * Math.cos(Math.PI * p));
          const target = Math.min(N, Math.ceil(q * N));
          const r = emptyRect();
          const budget = now() + 6;
          while (drawn < target) {
            const step = Math.min(target, drawn + 24);
            rasterize(b, g.stitches, drawn, step, g.relief, r);
            drawn = step;
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
          if (drawn >= N && p >= 1) {
            phase = 'glint';
            ensureSheen();
          }
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
              resolve();
            }
          }
        }
      };
      running = { token, resolve, tick };
      if (!paused) raf = requestAnimationFrame(loop);
    });
  }

  async function render(animateIt: boolean, forceGeometry = false): Promise<void> {
    stopRunning();
    const token = ++seq;
    if (destroyed) return;
    if (!canvas.isConnected && !canvas.width) return;
    ensureSize();
    if (forceGeometry) geo = null;
    const prevGeo = geo;
    await ensureFabric(token);
    if (token !== seq || destroyed) return;
    const ok = await ensureGeometry(token);
    if (!ok || token !== seq || destroyed || !geo || !buffers) return;
    const g = geo as Geometry;
    if (g !== prevGeo) {
      clearBuffers(buffers);
      drawn = 0;
      sheenCanvas = null;
    }
    if (g.empty) {
      clearBuffers(buffers);
      pushStitchPixels(null);
      updateShadows();
      compose();
      opts.onProgress?.(1);
      return;
    }
    if (animateIt && !reduced()) {
      await animate(token);
    } else {
      finishInstant();
      opts.onProgress?.(1);
    }
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
            const wasRunning = !!running;
            void render(wasRunning);
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
      const geoChanged = next.text !== design.text || next.style !== design.style || !geo;
      const threadChanged = next.thread !== design.thread;
      const fabricChanged =
        next.fabric !== design.fabric || next.fabricTexture !== design.fabricTexture;
      design = next;
      if (threadChanged) palette = threadPalette(design.thread);
      const animateIt = o?.animate ?? geoChanged;
      // colour-only change on a finished piece: recolour in place, no relayout
      if (!geoChanged && !animateIt && geo && buffers && !running) {
        const token = ++seq;
        const [w, h] = measure();
        if (w === W && h === H) {
          if (fabricChanged) await ensureFabric(token);
          if (token !== seq || destroyed) return;
          if (threadChanged) pushStitchPixels(null);
          compose();
          return;
        }
      }
      if (!geoChanged && !animateIt && running) {
        // mid-animation recolour: keep stitching, just swap colours
        if (fabricChanged) await ensureFabric(seq);
        if (threadChanged) pushStitchPixels(null);
        return;
      }
      await render(animateIt);
    },
    replay() {
      if (destroyed) return Promise.resolve();
      return render(true);
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
      ro?.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      for (const c of [stitchCanvas, fabricCanvas, ambient, contact, sheenCanvas, glintCanvas]) {
        if (c) c.width = c.height = 0;
      }
      stitchCanvas = fabricCanvas = ambient = contact = sheenCanvas = glintCanvas = null;
      buffers = null;
      stitchImg = null;
      geo = null;
      shadeCache.clear();
    },
    getDesign() {
      return { ...design };
    },
  };
  return api;
}
