// Rendering logic shared by the thread colour chart and the quote form's
// Atelier hand-off. No copy lives here: names and labels come from Sanity.
//
//   sortThreads(colors)        hue order for the spool rack (chromatic first,
//                              then neutrals light to dark)
//   textureForFabric(key)      atelierSettings.fabrics[].key -> engine texture
//   normHex(value)             '#rrggbb' or null

export type FabricTexture = 'linen' | 'canvas' | 'cotton' | 'terry';

export interface ThreadColor {
  _id?: string;
  name?: string | null;
  slug?: string | null;
  hexColor?: string | null;
  dmcNumber?: string | null;
  colorFamily?: string | null;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normHex(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!HEX.test(t)) return null;
  let h = t.replace(/^#/, '').toLowerCase();
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return '#' + h;
}

function hsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

/**
 * Hue order reads like a real thread rack: reds and pinks, oranges and golds,
 * greens, blues, purples, then the neutrals from white to black. Hues are
 * bucketed in 30 degree bands (offset so 345..15 is one "red" band) and each
 * band runs light to dark, which avoids the zig-zag a raw hue sort gives.
 * Threads without a usable hex keep their Sanity order at the very end.
 */
export function sortThreads<T extends ThreadColor>(colors: T[]): T[] {
  const keyed = colors.map((c, i) => {
    const hex = normHex(c.hexColor);
    if (!hex) return { c, i, group: 2, band: 0, l: 0 };
    const { h, s, l } = hsl(hex);
    // near-greys and the very palest creams sit with the neutrals
    const neutral = s < 0.14 || (l > 0.9 && s < 0.6) || (l > 0.8 && s < 0.42) || l < 0.09;
    if (neutral) return { c, i, group: 1, band: 0, l };
    const band = Math.floor(((h + 15) % 360) / 30);
    return { c, i, group: 0, band, l };
  });
  keyed.sort((a, b) => a.group - b.group || a.band - b.band || b.l - a.l || a.i - b.i);
  return keyed.map((k) => k.c);
}

/** Map an atelierSettings fabric key to the engine's procedural weave. */
export function textureForFabric(key: string | null | undefined): FabricTexture {
  const k = (key ?? '').toLowerCase();
  if (/terry|towel/.test(k)) return 'terry';
  if (/canvas|denim|duck|twill/.test(k)) return 'canvas';
  if (/linen|ivory|sage|oat|natural/.test(k)) return 'linen';
  return 'cotton';
}

/** Perceived lightness 0..1, for choosing ink on a swatch. */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

/** Distance in RGB, used to pick a default thread close to the brand Claret. */
export function rgbDistance(a: string, b: string): number {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const dr = ((x >> 16) & 255) - ((y >> 16) & 255);
  const dg = ((x >> 8) & 255) - ((y >> 8) & 255);
  const db = (x & 255) - (y & 255);
  return dr * dr + dg * dg + db * db;
}

/** Initials as the engine reads them: letters, digits and &, at most 3. */
export function cleanInitials(v: unknown): string {
  if (typeof v !== 'string') return '';
  return Array.from(v.slice(0, 64).toLocaleUpperCase())
    .filter((c) => /[\p{L}\p{N}&]/u.test(c))
    .slice(0, 3)
    .join('');
}
