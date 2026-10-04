// Software rasteriser for thread. Pure (typed arrays only).
//
// Each stitch is shaded per pixel as a lit cylinder of twisted thread lying on a
// padded surface, and blended into three premultiplied float buffers:
//   L = diffuse light factor, S = specular sheen factor, A = coverage.
// Colour is applied afterwards (colorize), so a thread-colour change never
// re-rasterises geometry: it is a single cheap pass over the buffers.

import { LUT_RANGE, LUT_SIZE, toneLut, type ThreadPalette } from './color.ts';
import { KIND_FUZZ, KIND_RUN, KIND_UNDER, type Stitches } from './stitches.ts';
import type { Relief } from './field.ts';

export interface ThreadBuffers {
  W: number;
  H: number;
  L: Float32Array;
  S: Float32Array;
  A: Float32Array;
}

export function makeBuffers(W: number, H: number): ThreadBuffers {
  return {
    W,
    H,
    L: new Float32Array(W * H),
    S: new Float32Array(W * H),
    A: new Float32Array(W * H),
  };
}

export function clearBuffers(b: ThreadBuffers) {
  b.L.fill(0);
  b.S.fill(0);
  b.A.fill(0);
}

/** Mutable dirty rectangle, inclusive-exclusive. */
export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const emptyRect = (): Rect => ({ x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 });

// Key light from the upper left, fairly low so the satin direction matters.
const LX0 = -0.5;
const LY0 = -0.62;
const LZ0 = 0.6;
const LN = Math.hypot(LX0, LY0, LZ0);
export const LIGHT: [number, number, number] = [LX0 / LN, LY0 / LN, LZ0 / LN];
const HX0 = LIGHT[0];
const HY0 = LIGHT[1];
const HZ0 = LIGHT[2] + 1;
const HN = Math.hypot(HX0, HY0, HZ0);
const HX = HX0 / HN;
const HY = HY0 / HN;
const HZ = HZ0 / HN;

/**
 * Rasterise stitches [from, to) into the buffers. `relief` tilts the normals so
 * the whole design reads as padded. Grows `dirty` to cover what was touched.
 */
export function rasterize(
  b: ThreadBuffers,
  s: Stitches,
  from: number,
  to: number,
  relief: Relief | null,
  dirty: Rect,
) {
  const { W, H, L, S, A } = b;
  const [LX, LY, LZ] = LIGHT;
  const rw = relief ? relief.w : 0;
  const rh = relief ? relief.h : 0;
  const rf = relief ? relief.f : 1;
  const rgx = relief ? relief.gx : null;
  const rgy = relief ? relief.gy : null;

  for (let i = from; i < to; i++) {
    const kind = s.kind[i];
    const x0 = s.x0[i];
    const y0 = s.y0[i];
    const dx = s.x1[i] - x0;
    const dy = s.y1[i] - y0;
    let len = Math.hypot(dx, dy);
    let tx = 1;
    let ty = 0;
    if (len > 1e-4) {
      tx = dx / len;
      ty = dy / len;
    } else len = 0;
    const ax = -ty;
    const ay = tx;
    const tw = s.w[i];
    const r = tw * 0.5;
    const isFuzz = kind === KIND_FUZZ;
    const isRun = kind === KIND_RUN;
    const inset = isFuzz ? 0 : Math.min(r * 0.55, len * 0.3);
    const lo = inset;
    const hi = Math.max(inset, len - inset);
    const archLen = tw * (isRun ? 1.4 : 1.1);
    const jit = s.j[i] * (kind === KIND_UNDER ? 0.82 : 1);
    const alphaMul = isFuzz ? 0.42 : 1;
    const isUnder = kind === KIND_UNDER;
    const specMul = isFuzz ? 0.35 : isUnder ? 0.6 : isRun ? 1.1 : 1;
    const aa = Math.min(1, r * 0.9);

    const bx0 = Math.max(0, Math.floor(Math.min(x0, x0 + dx) - r - 1));
    const by0 = Math.max(0, Math.floor(Math.min(y0, y0 + dy) - r - 1));
    const bx1 = Math.min(W, Math.ceil(Math.max(x0, x0 + dx) + r + 1));
    const by1 = Math.min(H, Math.ceil(Math.max(y0, y0 + dy) + r + 1));
    if (bx0 >= bx1 || by0 >= by1) continue;
    if (bx0 < dirty.x0) dirty.x0 = bx0;
    if (by0 < dirty.y0) dirty.y0 = by0;
    if (bx1 > dirty.x1) dirty.x1 = bx1;
    if (by1 > dirty.y1) dirty.y1 = by1;

    for (let py = by0; py < by1; py++) {
      const qy = py + 0.5 - y0;
      const row = py * W;
      for (let px = bx0; px < bx1; px++) {
        const qx = px + 0.5 - x0;
        const along = qx * tx + qy * ty;
        const across = qx * ax + qy * ay;
        const ac = along < lo ? lo : along > hi ? hi : along;
        const da = along - ac;
        const d = Math.sqrt(da * da + across * across);
        if (d >= r) continue;
        let cov = (r - d) / aa;
        if (cov > 1) cov = 1;
        cov *= alphaMul;
        // cylinder coordinate (signed), rounded caps use the radial distance
        const u = (across < 0 ? -d : d) / r;
        const cyl = Math.sqrt(1 - u * u);
        // distance from the nearer needle hole, in thread widths
        let e = Math.min(along, len - along) / archLen;
        e = e < 0 ? 0 : e > 1 ? 1 : e;
        const tilt = (1 - e) * (1 - e) * 0.85 * (along < len * 0.5 ? -1 : 1);
        let nx = ax * u * 0.75 + tx * tilt;
        let ny = ay * u * 0.75 + ty * tilt;
        let nz = cyl + 0.15;
        if (rgx && rgy) {
          // padded relief slope (bilinear on the coarse grid)
          let fx = (px + 0.5) / rf - 0.5;
          let fy = (py + 0.5) / rf - 0.5;
          if (fx < 0) fx = 0;
          if (fy < 0) fy = 0;
          let ix = fx | 0;
          let iy = fy | 0;
          if (ix > rw - 2) ix = rw - 2;
          if (iy > rh - 2) iy = rh - 2;
          const gx0 = fx - ix > 1 ? 1 : fx - ix;
          const gy0 = fy - iy > 1 ? 1 : fy - iy;
          const k = iy * rw + ix;
          const w00 = (1 - gx0) * (1 - gy0);
          const w10 = gx0 * (1 - gy0);
          const w01 = (1 - gx0) * gy0;
          const w11 = gx0 * gy0;
          nx -= rgx[k] * w00 + rgx[k + 1] * w10 + rgx[k + rw] * w01 + rgx[k + rw + 1] * w11;
          ny -= rgy[k] * w00 + rgy[k + 1] * w10 + rgy[k + rw] * w01 + rgy[k + rw + 1] * w11;
        }
        const nl = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
        nx *= nl;
        ny *= nl;
        nz *= nl;
        let diff = (nx * LX + ny * LY + nz * LZ + 0.2) / 1.2;
        if (diff < 0) diff = 0;
        const ao = (0.6 + 0.4 * Math.sqrt(cyl)) * (0.7 + 0.3 * Math.sqrt(e));
        let nh = nx * HX + ny * HY + nz * HZ;
        if (nh < 0) nh = 0;
        const nh2 = nh * nh;
        const nh4 = nh2 * nh2;
        const nh8 = nh4 * nh4;
        const nh32 = nh8 * nh8 * nh8 * nh8;
        // plied twist: faint diagonal ripple along the thread
        const twist = 0.92 + 0.08 * Math.sin((along / tw) * 1.3 + u * 1.7 + i * 0.37);
        const spec = (nh32 * nh8 * 1.35 + nh8 * nh8 * 0.16) * twist * (0.35 + 0.65 * e) * specMul;
        const lv = (0.2 + 0.85 * diff) * ao * jit;
        const sv = spec * (0.4 + 0.6 * ao);
        const k = row + px;
        const inv = 1 - cov;
        L[k] = lv * cov + L[k] * inv;
        S[k] = sv * cov + S[k] * inv;
        A[k] = cov + A[k] * inv;
      }
    }
  }
}

/** Write colour for `rect` into an RGBA buffer (un-premultiplied, sRGB). */
export function colorize(
  b: ThreadBuffers,
  pal: ThreadPalette,
  out: Uint8ClampedArray,
  rect?: Rect,
) {
  const { W, H, L, S, A } = b;
  const lut = toneLut();
  const scale = (LUT_SIZE - 1) / LUT_RANGE;
  const max = LUT_SIZE - 1;
  const [br, bg, bb] = pal.base;
  const g = pal.sheenGain;
  const sr = pal.sheen[0] * g;
  const sg = pal.sheen[1] * g;
  const sb = pal.sheen[2] * g;
  const x0 = rect ? Math.max(0, rect.x0) : 0;
  const y0 = rect ? Math.max(0, rect.y0) : 0;
  const x1 = rect ? Math.min(W, rect.x1) : W;
  const y1 = rect ? Math.min(H, rect.y1) : H;
  for (let y = y0; y < y1; y++) {
    let k = y * W + x0;
    let o = k * 4;
    for (let x = x0; x < x1; x++, k++, o += 4) {
      const a = A[k];
      if (a <= 0.002) {
        out[o + 3] = 0;
        continue;
      }
      const ia = 1 / a;
      const l = L[k] * ia;
      const s = S[k] * ia;
      let r = (br * l + sr * s) * scale;
      let gg = (bg * l + sg * s) * scale;
      let bl = (bb * l + sb * s) * scale;
      if (r > max) r = max;
      if (gg > max) gg = max;
      if (bl > max) bl = max;
      out[o] = lut[r | 0];
      out[o + 1] = lut[gg | 0];
      out[o + 2] = lut[bl | 0];
      out[o + 3] = a >= 1 ? 255 : a * 255;
    }
  }
}

/** Specular-only white layer (alpha = sheen) used for the finishing glint; `rect` limits it. */
export function sheenMask(b: ThreadBuffers, out: Uint8ClampedArray, rect?: Rect) {
  const { W, H, S, A } = b;
  const x0 = rect ? Math.max(0, rect.x0) : 0;
  const y0 = rect ? Math.max(0, rect.y0) : 0;
  const x1 = rect ? Math.min(W, rect.x1) : W;
  const y1 = rect ? Math.min(H, rect.y1) : H;
  for (let y = y0; y < y1; y++) {
    let k = y * W + x0;
    let o = k * 4;
    for (let x = x0; x < x1; x++, k++, o += 4) {
      const a = A[k];
      if (a <= 0.002) {
        out[o + 3] = 0;
        continue;
      }
      const s = (S[k] / a) * 2.2 + 0.4;
      out[o] = 255;
      out[o + 1] = 250;
      out[o + 2] = 238;
      out[o + 3] = Math.min(1, s) * a * 255;
    }
  }
}
