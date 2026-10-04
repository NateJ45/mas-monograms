// Colour helpers for the Monogram Atelier engine. Pure (no DOM), unit-tested in
// atelier.test.ts. Shading happens in LINEAR light; these helpers convert the
// sRGB hex values that come from Sanity into linear triples and build the thread
// and fabric palettes the renderer multiplies by.

export type RGB = [number, number, number];

/** Parse '#rgb', '#rrggbb' (with or without '#'). Bad input falls back to `fallback`. */
export function hexToRgb(hex: string, fallback: RGB = [0.5, 0.5, 0.5]): RGB {
  const h = String(hex || '')
    .trim()
    .replace(/^#/, '');
  let full = h;
  if (/^[0-9a-f]{3}$/i.test(h)) full = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-f]{6}$/i.test(full)) return fallback;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c: number): number {
  if (c <= 0) return 0;
  if (c >= 1) return 1;
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function luminance(lin: RGB): number {
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** sRGB [0..1] to HSL, h in [0,1). */
export function rgbToHsl(rgb: RGB): RGB {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb(hsl: RGB): RGB {
  const [h, s, l] = hsl;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function toLinear(rgb: RGB): RGB {
  return [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])];
}

export interface ThreadPalette {
  /** Diffuse albedo, linear. Luminance clamped so white never blows out and black keeps form. */
  base: RGB;
  /** Specular sheen tint, linear (light, desaturated version of the hue). */
  sheen: RGB;
  /** Deep shade used for the needle's trailing thread shadow side, linear. */
  shade: RGB;
  /** Overall sheen strength: darker threads read glossier, pale ones less. */
  sheenGain: number;
}

/** Albedo luminance window: below it black loses all form, above it white clips. */
export const THREAD_LUM_MIN = 0.018;
export const THREAD_LUM_MAX = 0.8;

/**
 * Build the thread palette from any hex via HSL ramps. The diffuse base keeps the
 * hue and saturation but has its lightness pulled into a window where both the
 * lit and the shaded side of a satin column stay visible; the sheen is the same
 * hue lifted towards white (rayon and silk reflect a pale version of their dye).
 */
export function threadPalette(hex: string): ThreadPalette {
  const srgb = hexToRgb(hex, [0.55, 0.23, 0.18]);
  const [h, s, l] = rgbToHsl(srgb);
  let lin = toLinear(srgb);
  let lum = luminance(lin);
  if (lum > THREAD_LUM_MAX || lum < THREAD_LUM_MIN) {
    // Walk lightness in HSL until the linear luminance sits inside the window.
    const target = lum > THREAD_LUM_MAX ? THREAD_LUM_MAX : THREAD_LUM_MIN;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      const cand = toLinear(hslToRgb([h, s, mid]));
      if (luminance(cand) < target) lo = mid;
      else hi = mid;
    }
    lin = toLinear(hslToRgb([h, s, (lo + hi) / 2]));
    lum = luminance(lin);
  }
  const sheenSrgb = hslToRgb([h, s * 0.55, clamp01(Math.max(l, 0.55) * 0.35 + 0.62)]);
  const shadeSrgb = hslToRgb([h, clamp01(s * 1.1), clamp01(l * 0.45)]);
  // Glossier on dark threads (contrast of the highlight is what reads as satin).
  const sheenGain = 0.55 + 0.6 * (1 - Math.sqrt(lum / THREAD_LUM_MAX));
  return { base: lin, sheen: toLinear(sheenSrgb), shade: toLinear(shadeSrgb), sheenGain };
}

/** Fabric ground as linear RGB (no clamping: a white towel is meant to be bright). */
export function fabricLinear(hex: string): RGB {
  return toLinear(hexToRgb(hex, [0.93, 0.9, 0.84]));
}

/**
 * Linear [0..LUT_RANGE] to sRGB byte lookup with a soft highlight shoulder, so a
 * specular peak rolls off instead of clipping to a flat white blob.
 */
export const LUT_RANGE = 2;
export const LUT_SIZE = 4096;
let lut: Uint8ClampedArray | null = null;
export function toneLut(): Uint8ClampedArray {
  if (lut) return lut;
  lut = new Uint8ClampedArray(LUT_SIZE);
  for (let i = 0; i < LUT_SIZE; i++) {
    const x = (i / (LUT_SIZE - 1)) * LUT_RANGE;
    const knee = 0.78;
    const y = x < knee ? x : knee + (1 - knee) * (1 - Math.exp(-(x - knee) / (1 - knee)));
    lut[i] = Math.round(linearToSrgb(y) * 255);
  }
  return lut;
}
