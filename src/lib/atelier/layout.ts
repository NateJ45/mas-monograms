// Lettering layouts for the five Atelier styles. Browser-only (uses a 2D canvas
// to rasterise glyphs). Produces a full-resolution LABEL MAP: 0 = fabric,
// 1..n = one element each (a letter, a ring, a flourish), so every element is
// filled, ordered and stitched on its own like a real digitised design.

import { fontCss, loadFace, type FaceKey } from './fonts.ts';

export type StyleKey = 'classic' | 'script' | 'block' | 'circle' | 'single';
export const STYLE_KEYS: StyleKey[] = ['classic', 'script', 'block', 'circle', 'single'];

export function isStyleKey(v: unknown): v is StyleKey {
  return typeof v === 'string' && (STYLE_KEYS as string[]).includes(v);
}

/** Which lettering face backs each style (rendering logic, not copy). */
export const STYLE_FACE: Record<StyleKey, FaceKey> = {
  classic: 'classic',
  script: 'script',
  block: 'block',
  circle: 'roman',
  single: 'script',
};

export interface Layout {
  W: number;
  H: number;
  labels: Uint8Array;
  /** element labels in stitching order */
  order: number[];
  /** tatami angle (radians) per label */
  fillAngle: Map<number, number>;
  /** representative letter height, px (drives stitch density) */
  letterH: number;
  /** optional running-stitch ring */
  ring?: { cx: number; cy: number; r: number };
  /** label used for the running ring (it has no pixels in the map) */
  ringLabel?: number;
}

/** Uppercase, keep letters and digits, at most 3 characters (surrogate safe). */
export function normaliseText(text: string): string {
  const chars = Array.from(String(text ?? '').normalize('NFC'))
    .filter((c) => /[\p{L}\p{N}&]/u.test(c))
    .map((c) => c.toLocaleUpperCase());
  return chars.slice(0, 3).join('');
}

type Ctx = CanvasRenderingContext2D;

interface Glyph {
  ch: string;
  /** reference metrics at 100px */
  left: number;
  right: number;
  asc: number;
  desc: number;
  adv: number;
}

function measure(ctx: Ctx, face: FaceKey, ch: string): Glyph {
  ctx.font = fontCss(face, 100);
  const m = ctx.measureText(ch);
  return {
    ch,
    left: m.actualBoundingBoxLeft,
    right: m.actualBoundingBoxRight,
    asc: m.actualBoundingBoxAscent,
    desc: m.actualBoundingBoxDescent,
    adv: m.width,
  };
}

class LabelPainter {
  ctx: Ctx;
  labels: Uint8Array;
  W: number;
  H: number;
  next = 1;
  constructor(W: number, H: number) {
    this.W = W;
    this.H = H;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.labels = new Uint8Array(W * H);
  }
  queued: (() => void)[] = [];
  /**
   * Queue one element: `draw` paints it, then its pixels are claimed as a new
   * label. Painting happens in flush(), one element per slice of work.
   */
  element(bounds: [number, number, number, number], draw: (ctx: Ctx) => void): number {
    const id = this.next++;
    this.queued.push(() => this.paint(id, bounds, draw));
    return id;
  }
  /** Paint the queued elements in order, yielding between them. */
  async flush(pause?: () => Promise<void> | void) {
    for (const job of this.queued) {
      job();
      if (pause) await pause();
    }
    this.queued = [];
  }
  private paint(id: number, bounds: [number, number, number, number], draw: (ctx: Ctx) => void) {
    const ctx = this.ctx;
    const pad = 6;
    const x0 = Math.max(0, Math.floor(bounds[0] - pad));
    const y0 = Math.max(0, Math.floor(bounds[1] - pad));
    const x1 = Math.min(this.W, Math.ceil(bounds[2] + pad));
    const y1 = Math.min(this.H, Math.ceil(bounds[3] + pad));
    if (x1 <= x0 || y1 <= y0) return;
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#000';
    draw(ctx);
    ctx.restore();
    const img = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data;
    const bw = x1 - x0;
    for (let y = y0; y < y1; y++) {
      const row = y * this.W;
      const irow = (y - y0) * bw;
      for (let x = x0; x < x1; x++) {
        if (img[(irow + x - x0) * 4 + 3] >= 128) this.labels[row + x] = id;
      }
    }
    ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
  }
}

/** Fill + a hairline stroke so no column is thinner than a digitiser allows. */
function drawGlyph(ctx: Ctx, face: FaceKey, ch: string, x: number, y: number, size: number) {
  ctx.font = fontCss(face, size);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(ch, x, y);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.5, size * 0.014);
  ctx.strokeText(ch, x, y);
}

/** A tapered swash along a cubic Bezier (used for the single-initial flourish). */
function taperedCurve(ctx: Ctx, p: [number, number][], maxW: number, minW: number, steps = 90) {
  const pt = (t: number) => {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return [
      a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
      a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
    ];
  };
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const [x, y] = pt(t);
    const [xa, ya] = pt(Math.max(0, t - 0.005));
    const [xb, yb] = pt(Math.min(1, t + 0.005));
    let nx = -(yb - ya);
    let ny = xb - xa;
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl;
    ny /= nl;
    const w = minW + (maxW - minW) * Math.pow(Math.sin(Math.PI * t), 1.1);
    left.push([x + nx * w * 0.5, y + ny * w * 0.5]);
    right.push([x - nx * w * 0.5, y - ny * w * 0.5]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (const q of left) ctx.lineTo(q[0], q[1]);
  for (let k = right.length - 1; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1]);
  ctx.closePath();
  ctx.fill();
}

const DEG = Math.PI / 180;

/**
 * Build the label map for a design. Fonts load lazily here. `pause` is called
 * between elements so the main thread can breathe (each one is a glyph paint
 * and a pixel read-back).
 */
export async function layoutDesign(
  rawText: string,
  style: StyleKey,
  W: number,
  H: number,
  pause?: () => Promise<void> | void,
): Promise<Layout> {
  const text = normaliseText(rawText);
  const face = STYLE_FACE[style];
  await loadFace(face);
  const lp = new LabelPainter(W, H);
  const order: number[] = [];
  const fillAngle = new Map<number, number>();
  const cx = W / 2;
  const cy = H / 2;
  const boxW = W * 0.7;
  const boxH = H * 0.56;
  let letterH = H * 0.5;
  const out: Layout = { W, H, labels: lp.labels, order, fillAngle, letterH };
  const chars = Array.from(text);
  if (!chars.length) return out;
  const ctx = lp.ctx;
  const angles = [38 * DEG, -36 * DEG, 52 * DEG];

  // Lay a row of glyphs centred on (cx, cy) with optional per-glyph scales.
  const row = (gl: Glyph[], scales: number[], gapEm: number, fitW: number, fitH: number) => {
    let totalW = 0;
    let maxH = 0;
    gl.forEach((g, k) => {
      totalW += (g.left + g.right) * scales[k];
      maxH = Math.max(maxH, (g.asc + g.desc) * scales[k]);
    });
    totalW += gapEm * 100 * (gl.length - 1);
    const size = Math.min(fitW / totalW, fitH / maxH) * 100;
    let x = cx - (totalW * size) / 100 / 2;
    const placed: { g: Glyph; size: number; x: number; y: number }[] = [];
    gl.forEach((g, k) => {
      const s = size * scales[k];
      const k100 = s / 100;
      const gx = x + g.left * k100;
      // centre the glyph's ink box vertically
      const gy = cy + ((g.asc - g.desc) * k100) / 2;
      placed.push({ g, size: s, x: gx, y: gy });
      x += (g.left + g.right) * k100 + gapEm * size;
    });
    letterH = (maxH * size) / 100;
    return placed;
  };

  const paintGlyph = (pg: { g: Glyph; size: number; x: number; y: number }, k: number) => {
    const k100 = pg.size / 100;
    const b: [number, number, number, number] = [
      pg.x - pg.g.left * k100 - 4,
      pg.y - pg.g.asc * k100 - 4,
      pg.x + pg.g.right * k100 + 4,
      pg.y + pg.g.desc * k100 + 4,
    ];
    const id = lp.element(b, (c) => drawGlyph(c, face, pg.g.ch, pg.x, pg.y, pg.size));
    fillAngle.set(id, angles[k % 3]);
    return id;
  };

  if (style === 'classic' || style === 'block') {
    const gl = chars.map((c) => measure(ctx, face, c));
    const scales = style === 'classic' && gl.length === 3 ? [1, 1.4, 1] : gl.map(() => 1);
    const gap = style === 'classic' ? 0.07 : 0.1;
    const placed = row(gl, scales, gap, boxW * (gl.length === 1 ? 0.6 : 1), boxH);
    placed.forEach((pg, k) => order.push(paintGlyph(pg, k)));
  } else if (style === 'script') {
    ctx.font = fontCss(face, 100);
    const whole = ctx.measureText(text);
    const wW = whole.actualBoundingBoxLeft + whole.actualBoundingBoxRight;
    const wH = whole.actualBoundingBoxAscent + whole.actualBoundingBoxDescent;
    const size = Math.min((boxW * (chars.length === 1 ? 0.7 : 1)) / wW, (boxH * 1.05) / wH) * 100;
    const k100 = size / 100;
    const x0 = cx - (wW * k100) / 2 + whole.actualBoundingBoxLeft * k100;
    const y0 = cy + ((whole.actualBoundingBoxAscent - whole.actualBoundingBoxDescent) * k100) / 2;
    letterH = wH * k100;
    chars.forEach((ch, k) => {
      ctx.font = fontCss(face, size);
      const pre = ctx.measureText(chars.slice(0, k).join('')).width;
      const m = ctx.measureText(ch);
      const gx = x0 + pre;
      const b: [number, number, number, number] = [
        gx - m.actualBoundingBoxLeft - 6,
        y0 - m.actualBoundingBoxAscent - 6,
        gx + m.actualBoundingBoxRight + 6,
        y0 + m.actualBoundingBoxDescent + 6,
      ];
      const id = lp.element(b, (c) => drawGlyph(c, face, ch, gx, y0, size));
      fillAngle.set(id, angles[k % 3]);
      order.push(id);
    });
  } else if (style === 'single') {
    const ch = chars[0];
    const g = measure(ctx, face, ch);
    const size =
      Math.min((boxW * 0.62) / (g.left + g.right), (boxH * 0.92) / (g.asc + g.desc)) * 100;
    const k100 = size / 100;
    const gx = cx - ((g.left + g.right) * k100) / 2 + g.left * k100;
    const gy = cy - H * 0.04 + ((g.asc - g.desc) * k100) / 2;
    letterH = (g.asc + g.desc) * k100;
    order.push(paintGlyph({ g, size, x: gx, y: gy }, 0));
    // flourish: an S-swash under the letter with a dot at each end
    const fw = Math.min(W * 0.62, letterH * 1.35);
    const fy = gy + g.desc * k100 + letterH * 0.1;
    const fh = letterH * 0.11;
    const maxW = Math.max(4, letterH * 0.06);
    const pts: [number, number][] = [
      [cx - fw / 2, fy - fh * 0.6],
      [cx - fw / 5, fy + fh * 2.2],
      [cx + fw / 5, fy - fh * 2.2],
      [cx + fw / 2, fy + fh * 0.6],
    ];
    const id = lp.element(
      [cx - fw / 2 - maxW * 2, fy - fh * 3 - maxW, cx + fw / 2 + maxW * 2, fy + fh * 3 + maxW],
      (c) => {
        taperedCurve(c, pts, maxW, maxW * 0.18);
        for (const [ex, ey, sg] of [
          [pts[0][0], pts[0][1], -1],
          [pts[3][0], pts[3][1], 1],
        ]) {
          c.beginPath();
          c.arc(ex + sg * maxW * 0.5, ey, maxW * 0.5, 0, Math.PI * 2);
          c.fill();
        }
      },
    );
    fillAngle.set(id, 90 * DEG);
    order.push(id);
  } else if (style === 'circle') {
    const R = Math.min(W, H) * 0.44;
    const gl = chars.map((c) => measure(ctx, face, c));
    const scales = gl.length === 3 ? [0.92, 1.12, 0.92] : gl.map(() => 1);
    const inner = R * 0.84;
    if (gl.length === 1) {
      const placed = row(gl, scales, 0, inner * 1.0, inner * 1.05);
      placed.forEach((pg, k) => order.push(paintGlyph(pg, k)));
    } else {
      // letters on a gently arched circular baseline (centre of curvature below)
      const placed = row(gl, scales, 0.05, inner * 1.5, inner * 0.82);
      const arcR = R * 2.1;
      const ox = cx;
      const oy = cy + arcR;
      placed.forEach((pg, k) => {
        const k100 = pg.size / 100;
        const midX = pg.x - pg.g.left * k100 + ((pg.g.left + pg.g.right) * k100) / 2;
        const theta = (midX - cx) / arcR;
        const bx = ox + Math.sin(theta) * arcR;
        const by = oy - Math.cos(theta) * arcR;
        const ext = Math.max(pg.g.left + pg.g.right, pg.g.asc + pg.g.desc) * k100;
        const b: [number, number, number, number] = [bx - ext, by - ext, bx + ext, by + ext];
        const id = lp.element(b, (c) => {
          c.translate(bx, by);
          c.rotate(theta);
          drawGlyph(c, face, pg.g.ch, pg.x - midX, pg.y - cy, pg.size);
        });
        fillAngle.set(id, angles[k % 3]);
        order.push(id);
      });
    }
    // thin satin ring inside the running stitch
    const ringW = Math.max(3, R * 0.03);
    const rr = R * 0.9;
    const ringId = lp.element(
      [cx - rr - ringW, cy - rr - ringW, cx + rr + ringW, cy + rr + ringW],
      (c) => {
        c.lineWidth = ringW;
        c.beginPath();
        c.arc(cx, cy, rr, 0, Math.PI * 2);
        c.stroke();
      },
    );
    fillAngle.set(ringId, 0);
    order.push(ringId);
    out.ring = { cx, cy, r: R };
    out.ringLabel = lp.next++;
    order.push(out.ringLabel);
    letterH = Math.max(letterH, R * 0.55);
  }
  out.letterH = letterH;
  await lp.flush(pause);
  return out;
}
