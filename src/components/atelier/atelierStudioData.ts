// Rendering logic shared by the home hero (HomeHero) and the full studio
// (AtelierStudio): which weave backs each fabric, which threads read on which
// cloth, and the hero's sample cycle. No copy lives here; every visible string
// comes from Sanity (atelierSettings, threadColor) and is passed through.

export type StyleKey = 'classic' | 'script' | 'block' | 'circle' | 'single';
export type FabricTexture = 'linen' | 'canvas' | 'cotton' | 'terry';

export const STYLE_ORDER: StyleKey[] = ['classic', 'script', 'circle', 'block', 'single'];

export interface FabricOption {
  key: string;
  label: string;
  color: string;
  note?: string;
}
export interface ThreadOption {
  name: string;
  slug?: string | null;
  hexColor?: string | null;
}

/** Known fabric keys from the seed; anything else falls back to keywords. */
const TEXTURE_BY_KEY: Record<string, FabricTexture> = {
  'natural-linen': 'linen',
  'white-cotton': 'cotton',
  ivory: 'linen',
  blush: 'cotton',
  sage: 'linen',
  'denim-blue': 'canvas',
  'navy-canvas': 'canvas',
  charcoal: 'cotton',
};

/** Map a Sanity fabric to the engine's procedural weave. */
export function textureFor(f: { key?: string | null; label?: string | null }): FabricTexture {
  const key = (f.key ?? '').toLowerCase();
  if (TEXTURE_BY_KEY[key]) return TEXTURE_BY_KEY[key];
  const s = `${key} ${(f.label ?? '').toLowerCase()}`;
  if (/terry|towel/.test(s)) return 'terry';
  if (/canvas|denim|duck|twill|tote/.test(s)) return 'canvas';
  if (/linen|flax|hemp/.test(s)) return 'linen';
  return 'cotton';
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
export function validHex(v: unknown): string | null {
  if (typeof v !== 'string' || !HEX.test(v.trim())) return null;
  let h = v.trim().replace('#', '').toLowerCase();
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return '#' + h;
}

function rgb(hex: string): [number, number, number] {
  const h = (validHex(hex) ?? '#000000').slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function distance(a: string, b: string): number {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

/** A stable identifier for a thread in URLs and form values. */
export function threadId(t: ThreadOption): string {
  return t.slug || t.name;
}

/** Usable threads: real hex only, de-duplicated by id. */
export function cleanThreads(list: ThreadOption[] | null | undefined): ThreadOption[] {
  const seen = new Set<string>();
  const out: ThreadOption[] = [];
  for (const t of list ?? []) {
    const hex = validHex(t?.hexColor);
    if (!t?.name || !hex) continue;
    const id = threadId(t);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ ...t, hexColor: hex });
  }
  return out;
}

export function cleanFabrics(list: FabricOption[] | null | undefined): FabricOption[] {
  return (list ?? [])
    .filter((f) => f?.key && f?.label && validHex(f.color))
    .map((f) => ({ ...f, color: validHex(f.color) as string }));
}

/** The thread nearest a target colour (the studio default is Claret). */
export function nearestThread(threads: ThreadOption[], target: string): ThreadOption | undefined {
  let best: ThreadOption | undefined;
  let bestD = Infinity;
  for (const t of threads) {
    const d = distance(t.hexColor as string, target);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

// Threads that photograph well, by slug, in a pleasing order. Used only to
// choose the hero's sample pairings; anything missing from Sanity is skipped.
const LIGHT_GROUND = [
  'burgundy',
  'navy',
  'hunter-green',
  'deep-rose',
  'royal-blue',
  'plum',
  'crimson',
  'steel-blue',
  'forest-green',
  'wine',
];
const DARK_GROUND = [
  'old-gold',
  'warm-white',
  'blush-pink',
  'bright-gold',
  'ivory',
  'light-yellow',
  'lavender',
  'silver-gray',
  'mint',
];

export interface SampleDesign {
  text: string;
  style: StyleKey;
  thread: string;
  threadName: string;
  threadId: string;
  fabric: string;
  fabricKey: string;
  fabricLabel: string;
  texture: FabricTexture;
}

/**
 * The hero cycle: each sample monogram gets the next style, alternates light
 * and dark cloth, and a thread that reads on that cloth (contrast >= 2.6).
 */
export function heroSamples(
  samples: string[] | null | undefined,
  fabricsIn: FabricOption[],
  threadsIn: ThreadOption[],
  styles: StyleKey[],
): SampleDesign[] {
  const texts = (samples ?? [])
    .map((s) =>
      Array.from(String(s).toLocaleUpperCase())
        .filter((c) => /\p{L}/u.test(c))
        .slice(0, 3)
        .join(''),
    )
    .filter(Boolean);
  const fabrics = cleanFabrics(fabricsIn);
  const threads = cleanThreads(threadsIn);
  if (!texts.length || !fabrics.length || !threads.length) return [];
  const order = STYLE_ORDER.filter((k) => styles.includes(k));
  if (!order.length) order.push('classic');

  // interleave light and dark cloth, starting light
  const light = fabrics.filter((f) => luminance(f.color) > 0.3);
  const dark = fabrics.filter((f) => luminance(f.color) <= 0.3);
  const cloth: FabricOption[] = [];
  for (let i = 0; i < Math.max(light.length, dark.length); i++) {
    if (light[i]) cloth.push(light[i]);
    if (dark[i]) cloth.push(dark[i]);
  }

  const bySlug = new Map(threads.map((t) => [t.slug ?? '', t]));
  let li = 0;
  let di = 0;
  return texts.map((text, i) => {
    const f = cloth[i % cloth.length];
    const isDark = luminance(f.color) <= 0.3;
    const prefs = (isDark ? DARK_GROUND : LIGHT_GROUND)
      .map((s) => bySlug.get(s))
      .filter((t): t is ThreadOption => !!t && contrast(t.hexColor as string, f.color) >= 2.6);
    let t: ThreadOption;
    if (prefs.length) {
      t = prefs[(isDark ? di++ : li++) % prefs.length];
    } else {
      t = [...threads].sort(
        (a, b) => contrast(b.hexColor as string, f.color) - contrast(a.hexColor as string, f.color),
      )[0];
    }
    return {
      text,
      style: order[i % order.length],
      thread: t.hexColor as string,
      threadName: t.name,
      threadId: threadId(t),
      fabric: f.color,
      fabricKey: f.key,
      fabricLabel: f.label,
      texture: textureFor(f),
    };
  });
}

/** Text alternative for a stage: data from Sanity, joined with punctuation. */
export function describeDesign(
  text: string,
  style: StyleKey,
  styleLabel: string | undefined,
  threadName: string | undefined,
  fabricLabel: string | undefined,
): string {
  const shown = style === 'single' ? Array.from(text).slice(0, 1).join('') : text;
  return [shown, styleLabel, threadName, fabricLabel].filter(Boolean).join(', ');
}
