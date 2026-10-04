// Deterministic noise for the Atelier engine. Pure. Determinism matters: the same
// design must stitch the same way every time (replay, colour change, toBlob).

/** Seeded PRNG (mulberry32). Returns a function giving floats in [0, 1). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer lattice hash to [0, 1). */
export function hash2(x: number, y: number, seed = 0): number {
  let h =
    (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function hash1(x: number, seed = 0): number {
  return hash2(x, 0x9e37, seed);
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** 1D value noise in [0, 1). */
export function noise1(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = smooth(x - i);
  const a = hash1(i, seed);
  return a + (hash1(i + 1, seed) - a) * f;
}

/** 2D value noise in [0, 1). */
export function noise2(x: number, y: number, seed = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** String to 32-bit seed (FNV-1a). */
export function seedOf(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
