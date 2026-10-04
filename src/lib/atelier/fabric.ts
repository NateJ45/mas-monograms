// Procedural woven fabric for the Atelier engine. Pure (typed arrays only).
//
// The weave is generated as a grey "shade" map (1.0 = fabric's own colour in
// full light) and cached per texture and size; tinting it with the fabric hex is
// a separate cheap pass, so switching fabric colour never regenerates the weave.

import { LUT_RANGE, LUT_SIZE, toneLut, type RGB } from './color.ts';
import { hash2, noise1, noise2 } from './noise.ts';

export type FabricTexture = 'linen' | 'canvas' | 'cotton' | 'terry';

export const FABRIC_TEXTURES: FabricTexture[] = ['linen', 'canvas', 'cotton', 'terry'];

export function isFabricTexture(v: unknown): v is FabricTexture {
  return typeof v === 'string' && (FABRIC_TEXTURES as string[]).includes(v);
}

export interface FabricJob {
  tex: FabricTexture;
  W: number;
  H: number;
  /** thread pitch, px */
  pitch: number;
  seed: number;
  shade: Float32Array;
}

export function fabricJob(
  tex: FabricTexture,
  W: number,
  H: number,
  pitch: number,
  seed = 7,
): FabricJob {
  return { tex, W, H, pitch, seed, shade: new Float32Array(W * H) };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** One woven thread's cross-section shade, d in [0,1] from its centre line. */
function threadProfile(d: number, along: number, side: number): number {
  const c = Math.sqrt(1 - d * d);
  // `along` 0..1 across the crossing: the thread rises between the threads it dives under
  const bump = Math.sqrt(Math.sin(Math.PI * clamp01(along)));
  return 0.5 + 0.42 * c * (0.45 + 0.55 * bump) + 0.07 * side;
}

/** Fill rows [y0, y1) of the job's shade map. */
export function fabricRows(job: FabricJob, y0: number, y1: number) {
  const { tex, W, H, seed, shade } = job;
  const p = job.pitch;
  const basket = tex === 'canvas';
  const twill = tex === 'cotton';
  const slubAmt = tex === 'linen' ? 1 : tex === 'canvas' ? 0.45 : 0.2;
  const baseT = tex === 'linen' ? 0.66 : tex === 'canvas' ? 0.84 : 0.9;
  const contrast = tex === 'cotton' ? 0.45 : tex === 'canvas' ? 1.05 : 1;
  const iw = 1 / W;
  const ih = 1 / H;

  for (let y = y0; y < y1; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      let v: number;
      if (tex === 'terry') {
        v = terryAt(x, y, p, seed);
      } else {
        // gentle waviness so the grid never looks machine-perfect
        const wob = (noise2(x / (p * 26), y / (p * 11), seed) - 0.5) * p * 0.7;
        const wobY = (noise2(x / (p * 11), y / (p * 26), seed + 3) - 0.5) * p * 0.7;
        const xw = x + wob;
        const yw = y + wobY;
        const fi = xw / p;
        const fj = yw / p;
        const i = Math.floor(fi);
        const j = Math.floor(fj);
        const fx = fi - i;
        const fy = fj - j;
        // thread thickness with slubs (thick, irregular runs: the soul of linen)
        const slubW = Math.max(0, noise1(y / (p * 9) + i * 7.13, seed + 11) - 0.62) * 2.2 * slubAmt;
        const slubH = Math.max(0, noise1(x / (p * 9) + j * 5.71, seed + 17) - 0.62) * 2.2 * slubAmt;
        const tW = clamp01(
          baseT + (noise1(y / (p * 4.5) + i * 13.7, seed + 5) - 0.5) * 0.24 * slubAmt + slubW,
        );
        const tH = clamp01(
          baseT + (noise1(x / (p * 4.5) + j * 9.3, seed + 7) - 0.5) * 0.24 * slubAmt + slubH,
        );
        const dW = Math.abs(fx - 0.5) * 2;
        const dH = Math.abs(fy - 0.5) * 2;
        let warpTop: boolean;
        if (basket) warpTop = (((i >> 1) + (j >> 1)) & 1) === 0;
        else if (twill) warpTop = (((i - j) % 3) + 3) % 3 !== 0;
        else warpTop = ((i + j) & 1) === 0;
        // along-coordinate across the crossing (basket weave crosses every 2 threads)
        const alongW = basket ? ((j & 1) + fy) / 2 : fy;
        const alongH = basket ? ((i & 1) + fx) / 2 : fx;
        const inW = dW < tW;
        const inH = dH < tH;
        // per-thread tone (yarn dyed lots are never perfectly even)
        const toneW = 0.95 + hash2(i, 77, seed) * 0.1;
        const toneH = 0.95 + hash2(j, 91, seed) * 0.1;
        if (warpTop && inW) {
          v = threadProfile(dW / tW, alongW, -(fx - 0.5) * 2) * toneW;
        } else if (!warpTop && inH) {
          v = threadProfile(dH / tH, alongH, -(fy - 0.5) * 2) * toneH;
        } else if (inW) {
          v = threadProfile(dW / tW, 0.15, 0) * 0.82 * toneW;
        } else if (inH) {
          v = threadProfile(dH / tH, 0.15, 0) * 0.82 * toneH;
        } else {
          v = 0.42; // the gap between threads
        }
        v = 0.78 + (v - 0.78) * contrast;
      }
      // fibre grain + soft mottling
      v *= 0.94 + hash2(x, y, seed + 1) * 0.1;
      v *= 0.95 + noise2(x / (p * 18), y / (p * 18), seed + 2) * 0.1;
      // light falloff from the upper left and a gentle vignette
      const nx = x * iw - 0.5;
      const ny = y * ih - 0.5;
      v *= 1.06 - 0.12 * (x * iw * 0.6 + y * ih * 0.4);
      v *= 1 - 0.2 * (nx * nx + ny * ny);
      shade[row + x] = v;
    }
  }
}

let terryLit = 0;

/** Terry pile: a jittered lattice of soft tufts, the topmost wins. */
function terryAt(x: number, y: number, p: number, seed: number): number {
  // Pile loops stand in loose rows; from above each reads as a soft rounded
  // tuft. Tufts overlap (highest wins) and sit in shadowed valleys.
  const q = p * 1.25;
  const gx = Math.floor(x / q);
  const gy = Math.floor(y / q);
  let best = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = gx + ox;
      const cy = gy + oy;
      const h = hash2(cx, cy, seed + 31);
      const px = (cx + 0.15 + 0.7 * hash2(cx, cy, seed + 32)) * q;
      const py = (cy + 0.15 + 0.7 * hash2(cx, cy, seed + 33)) * q;
      const rr = q * (0.7 + 0.4 * h);
      const dx = (x - px) / rr;
      const dy = ((y - py) / rr) * 1.25;
      const d2 = dx * dx + dy * dy;
      if (d2 >= 1) continue;
      const z = Math.sqrt(1 - d2) * (0.75 + 0.25 * h);
      if (z > best) best = z;
      // remember the lighting of the top tuft
      if (z === best) terryLit = 0.5 * (-dx * 0.6 - dy * 0.7) + 0.5 * z;
    }
  }
  if (best === 0) return 0.5;
  return 0.6 + 0.28 * best + 0.2 * terryLit;
}

export interface FabricRequest {
  tex: FabricTexture;
  W: number;
  H: number;
  pitch: number;
  /** linear RGB of the fabric colour */
  lin: RGB;
}

/** Normalise so the fabric reads as its own colour, whatever the weave contrast. */
export function normaliseShade(shade: Float32Array) {
  let sum = 0;
  for (let i = 0; i < shade.length; i += 7) sum += shade[i];
  const gain = 0.97 / (sum / Math.ceil(shade.length / 7));
  for (let i = 0; i < shade.length; i++) shade[i] *= gain;
}

// The weave for the last few sizes and textures (the worker keeps these, so a
// fabric colour change is only a tint pass).
const shadeCache = new Map<string, Float32Array>();

/** The finished RGBA pixels of a fabric (weave generated once per texture and size). */
export function fabricPixels(r: FabricRequest): Uint8ClampedArray {
  const key = `${r.tex}|${r.W}x${r.H}|${r.pitch.toFixed(3)}`;
  let shade = shadeCache.get(key);
  if (!shade) {
    const job = fabricJob(r.tex, r.W, r.H, r.pitch, 7);
    fabricRows(job, 0, r.H);
    shade = job.shade;
    normaliseShade(shade);
    // keep the cache small: the current size, every texture
    for (const k of shadeCache.keys()) if (!k.includes(`|${r.W}x${r.H}|`)) shadeCache.delete(k);
    shadeCache.set(key, shade);
  }
  const out = new Uint8ClampedArray(r.W * r.H * 4);
  tintFabric(shade, r.lin, out);
  return out;
}

/** Tint the shade map with the fabric colour into an RGBA buffer. */
export function tintFabric(shade: Float32Array, lin: RGB, out: Uint8ClampedArray) {
  const lut = toneLut();
  const scale = (LUT_SIZE - 1) / LUT_RANGE;
  const max = LUT_SIZE - 1;
  const [r, g, b] = lin;
  for (let k = 0, o = 0; k < shade.length; k++, o += 4) {
    const s = shade[k] * scale;
    let vr = r * s;
    let vg = g * s;
    let vb = b * s;
    if (vr > max) vr = max;
    if (vg > max) vg = max;
    if (vb > max) vb = max;
    out[o] = lut[vr | 0];
    out[o + 1] = lut[vg | 0];
    out[o + 2] = lut[vb | 0];
    out[o + 3] = 255;
  }
}
