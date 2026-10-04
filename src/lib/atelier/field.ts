// Scalar and direction fields for the Atelier engine. Pure (typed arrays only).
//
// Everything here runs on a COARSE grid (the full-resolution label map reduced
// by an integer factor) because the fields are smooth by construction and the
// cost scales with pixel count.

export interface Coarse {
  w: number;
  h: number;
  f: number;
  /** Fraction of the block covered by any label, 0..1. */
  cov: Float32Array;
  /** Dominant label of the block (0 = empty). */
  lab: Uint8Array;
}

/** Reduce a full-resolution label map by factor f. */
export function downsample(labels: Uint8Array, W: number, H: number, f: number): Coarse {
  const w = Math.ceil(W / f);
  const h = Math.ceil(H / f);
  const cov = new Float32Array(w * h);
  const lab = new Uint8Array(w * h);
  const counts = new Uint16Array(256);
  for (let cy = 0; cy < h; cy++) {
    for (let cx = 0; cx < w; cx++) {
      let n = 0;
      let tot = 0;
      let best = 0;
      let bestN = 0;
      const y1 = Math.min(H, (cy + 1) * f);
      const x1 = Math.min(W, (cx + 1) * f);
      for (let y = cy * f; y < y1; y++) {
        const row = y * W;
        for (let x = cx * f; x < x1; x++) {
          tot++;
          const l = labels[row + x];
          if (l) {
            n++;
            const c = ++counts[l];
            if (c > bestN) {
              bestN = c;
              best = l;
            }
          }
        }
      }
      if (n) {
        // reset only the labels we touched
        for (let y = cy * f; y < y1; y++) {
          const row = y * W;
          for (let x = cx * f; x < x1; x++) counts[labels[row + x]] = 0;
        }
      }
      const i = cy * w + cx;
      cov[i] = tot ? n / tot : 0;
      lab[i] = n * 4 >= tot ? best : 0;
    }
  }
  return { w, h, f, cov, lab };
}

/** Separable box blur, `passes` times (3 passes approximates a Gaussian). Returns a new array. */
export function boxBlur(
  src: Float32Array,
  w: number,
  h: number,
  r: number,
  passes = 3,
): Float32Array {
  r = Math.max(0, Math.round(r));
  const a = Float32Array.from(src);
  if (r === 0) return a;
  const b = new Float32Array(src.length);
  const inv = 1 / (2 * r + 1);
  for (let p = 0; p < passes; p++) {
    // horizontal a -> b
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += a[row + Math.min(w - 1, Math.max(0, k))];
      for (let x = 0; x < w; x++) {
        b[row + x] = acc * inv;
        const add = a[row + Math.min(w - 1, x + r + 1)];
        const sub = a[row + Math.max(0, x - r)];
        acc += add - sub;
      }
    }
    // vertical b -> a
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += b[Math.min(h - 1, Math.max(0, k)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc * inv;
        const add = b[Math.min(h - 1, y + r + 1) * w + x];
        const sub = b[Math.max(0, y - r) * w + x];
        acc += add - sub;
      }
    }
  }
  return a;
}

/** 1D squared distance transform (Felzenszwalb and Huttenlocher). */
function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/** Exact Euclidean distance (in cells) from each inside cell to the nearest outside cell. */
export function distanceInside(inside: (i: number) => boolean, w: number, h: number): Float32Array {
  const INF = 1e12;
  const grid = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) grid[i] = inside(i) ? INF : 0;
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
  }
  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = Math.sqrt(grid[i]);
  return out;
}

export interface TensorField {
  w: number;
  h: number;
  f: number;
  jxx: Float32Array;
  jxy: Float32Array;
  jyy: Float32Array;
  /** per-label distance to the element edge, in coarse cells (dt source only) */
  dt?: Float32Array;
}

/**
 * Smoothed structure tensor of the coverage gradient. Its major eigenvector is
 * the direction ACROSS the local stroke, which is the direction a satin stitch
 * runs. Where the stroke is too wide for the edges to agree (big flat areas) a
 * small bias towards `bias` (per label) takes over, which gives an even tatami
 * fill angle there.
 */
export function tensorField(
  c: Coarse,
  radius: number,
  biasFor: (label: number) => [number, number],
  biasWeight = 0.04,
  source: 'cov' | 'dt' = 'cov',
): TensorField {
  const { w, h } = c;
  const n = w * h;
  const jxx = new Float32Array(n);
  const jxy = new Float32Array(n);
  const jyy = new Float32Array(n);
  let dtOut: Float32Array | undefined;
  if (source === 'dt') {
    // Distance-transform gradient points at the nearest edge from ANY depth, so
    // rows run straight across even very wide strokes, and where two strokes
    // meet the direction changes along a clean medial seam (as real satin
    // columns do) instead of smearing. Computed per label: each element is
    // stitched on its own, so a neighbouring letter's ink counts as an edge.
    const labels = new Set<number>();
    for (let i = 0; i < n; i++) if (c.lab[i]) labels.add(c.lab[i]);
    const dt = new Float32Array(n);
    for (const l of labels) {
      const d = distanceInside((i) => c.lab[i] === l, w, h);
      for (let i = 0; i < n; i++) if (c.lab[i] === l) dt[i] = d[i];
    }
    dtOut = dt;
    const soft = boxBlur(dt, w, h, 1, 1);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        let gx = (soft[i + 1] - soft[i - 1]) * 0.5;
        let gy = (soft[i + w] - soft[i - w]) * 0.5;
        const gl = Math.hypot(gx, gy);
        if (gl < 1e-6) continue;
        gx /= gl;
        gy /= gl;
        jxx[i] = gx * gx;
        jxy[i] = gx * gy;
        jyy[i] = gy * gy;
      }
    }
  } else {
    const soft = boxBlur(c.cov, w, h, 1, 2);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const gx = (soft[i + 1] - soft[i - 1]) * 0.5;
        const gy = (soft[i + w] - soft[i - w]) * 0.5;
        jxx[i] = gx * gx;
        jxy[i] = gx * gy;
        jyy[i] = gy * gy;
      }
    }
  }
  const bxx = boxBlur(jxx, w, h, radius, 3);
  const bxy = boxBlur(jxy, w, h, radius, 3);
  const byy = boxBlur(jyy, w, h, radius, 3);
  let maxTr = 0;
  for (let i = 0; i < n; i++) {
    const t = bxx[i] + byy[i];
    if (t > maxTr) maxTr = t;
  }
  const eps = biasWeight * maxTr + 1e-9;
  // label-dependent bias, spread a little so it changes smoothly between letters
  for (let i = 0; i < n; i++) {
    const l = c.lab[i];
    const [dx, dy] = biasFor(l);
    // Where edges disagree (junctions, serifs) coherence is low: lean on the
    // bias angle there so the area fills as one calm patch, not a tangle.
    const a = bxx[i];
    const b = bxy[i];
    const cc = byy[i];
    const tr = a + cc;
    const coh = tr > 1e-12 ? Math.sqrt((a - cc) * (a - cc) + 4 * b * b) / tr : 0;
    const w = eps + tr * Math.max(0, 0.45 - coh) * 4;
    bxx[i] += w * dx * dx;
    bxy[i] += w * dx * dy;
    byy[i] += w * dy * dy;
  }
  return { w, h, f: c.f, jxx: bxx, jxy: bxy, jyy: byy, dt: dtOut };
}

/** Major eigenvector of [[a,b],[b,c]] as a unit vector (sign arbitrary). */
export function majorEigen(a: number, b: number, c: number): [number, number] {
  const half = (a - c) * 0.5;
  const lam = (a + c) * 0.5 + Math.sqrt(half * half + b * b);
  let vx = b;
  let vy = lam - a;
  let vx2 = lam - c;
  let vy2 = b;
  const n1 = vx * vx + vy * vy;
  const n2 = vx2 * vx2 + vy2 * vy2;
  if (n2 > n1) {
    vx = vx2;
    vy = vy2;
  }
  const n = Math.sqrt(Math.max(n1, n2));
  if (n < 1e-12) return [1, 0];
  vx2 = vx / n;
  vy2 = vy / n;
  return [vx2, vy2];
}

/** Sample the field's direction at full-resolution coordinates (bilinear tensor). */
export function sampleDir(t: TensorField, x: number, y: number): [number, number] {
  const fx = x / t.f - 0.5;
  const fy = y / t.f - 0.5;
  let ix = Math.floor(fx);
  let iy = Math.floor(fy);
  let ax = fx - ix;
  let ay = fy - iy;
  if (ix < 0) {
    ix = 0;
    ax = 0;
  } else if (ix >= t.w - 1) {
    ix = t.w - 2;
    ax = 1;
  }
  if (iy < 0) {
    iy = 0;
    ay = 0;
  } else if (iy >= t.h - 1) {
    iy = t.h - 2;
    ay = 1;
  }
  const i = iy * t.w + ix;
  const w00 = (1 - ax) * (1 - ay);
  const w10 = ax * (1 - ay);
  const w01 = (1 - ax) * ay;
  const w11 = ax * ay;
  const a = t.jxx[i] * w00 + t.jxx[i + 1] * w10 + t.jxx[i + t.w] * w01 + t.jxx[i + t.w + 1] * w11;
  const b = t.jxy[i] * w00 + t.jxy[i + 1] * w10 + t.jxy[i + t.w] * w01 + t.jxy[i + t.w + 1] * w11;
  const c = t.jyy[i] * w00 + t.jyy[i + 1] * w10 + t.jyy[i + t.w] * w01 + t.jyy[i + t.w + 1] * w11;
  return majorEigen(a, b, c);
}

/**
 * Geodesic (8-connected BFS) distance inside each label region, from the
 * left-most cell of each connected component. Unreached cells get -1. Components
 * of one label are chained: a later component starts where the previous ended,
 * so the stitching order flows left to right like a hand moving across a letter.
 */
export function geodesic(c: Coarse): Float32Array {
  const { w, h, lab } = c;
  const n = w * h;
  const dist = new Float32Array(n).fill(-1);
  const queue = new Int32Array(n);
  const labelMax = new Map<number, number>();
  // column-major scan so components are discovered left to right
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const s = y * w + x;
      const l = lab[s];
      if (!l || dist[s] >= 0) continue;
      const base = labelMax.has(l) ? (labelMax.get(l) as number) + 4 : 0;
      let head = 0;
      let tail = 0;
      queue[tail++] = s;
      dist[s] = base;
      let maxD = base;
      while (head < tail) {
        const i = queue[head++];
        const d = dist[i];
        if (d > maxD) maxD = d;
        const ix = i % w;
        const iy = (i - ix) / w;
        for (let oy = -1; oy <= 1; oy++) {
          const ny = iy + oy;
          if (ny < 0 || ny >= h) continue;
          for (let ox = -1; ox <= 1; ox++) {
            if (!ox && !oy) continue;
            const nx = ix + ox;
            if (nx < 0 || nx >= w) continue;
            const j = ny * w + nx;
            if (lab[j] !== l || dist[j] >= 0) continue;
            dist[j] = d + 1;
            queue[tail++] = j;
          }
        }
      }
      labelMax.set(l, maxD);
    }
  }
  return dist;
}

export interface Relief {
  w: number;
  h: number;
  f: number;
  /** Surface slope (already scaled), x and y. */
  gx: Float32Array;
  gy: Float32Array;
  /** Padded height 0..1. */
  ht: Float32Array;
}

/** Padded relief: blurred coverage as height, its gradient as the surface slope. */
export function relief(c: Coarse, radius: number, strength: number): Relief {
  const { w, h } = c;
  const blurred = boxBlur(c.cov, w, h, radius, 3);
  const ht = new Float32Array(w * h);
  for (let i = 0; i < ht.length; i++) {
    // rounded shoulder: rises quickly from the edge, flat on top
    const v = Math.min(1, blurred[i] * 1.6);
    ht[i] = v * (2 - v);
  }
  const gx = new Float32Array(w * h);
  const gy = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      gx[i] = (ht[i + 1] - ht[i - 1]) * 0.5 * strength;
      gy[i] = (ht[i + w] - ht[i - w]) * 0.5 * strength;
    }
  }
  return { w, h, f: c.f, gx, gy, ht };
}

/** Cheap erosion: a pixel keeps its label only if 8 probes at radius r share it. */
export function erodeLabels(labels: Uint8Array, W: number, H: number, r: number): Uint8Array {
  const out = new Uint8Array(labels.length);
  const d = Math.max(1, Math.round(r));
  const e = Math.max(1, Math.round(r * 0.7));
  const probes = [
    [d, 0],
    [-d, 0],
    [0, d],
    [0, -d],
    [e, e],
    [-e, e],
    [e, -e],
    [-e, -e],
  ];
  for (let y = d; y < H - d; y++) {
    for (let x = d; x < W - d; x++) {
      const k = y * W + x;
      const l = labels[k];
      if (!l) continue;
      let ok = true;
      for (const [ox, oy] of probes) {
        if (labels[k + oy * W + ox] !== l) {
          ok = false;
          break;
        }
      }
      if (ok) out[k] = l;
    }
  }
  return out;
}

/** Bilinear sample of a coarse scalar field at full-resolution coordinates. */
export function sampleCoarse(
  arr: Float32Array,
  w: number,
  h: number,
  f: number,
  x: number,
  y: number,
): number {
  const fx = x / f - 0.5;
  const fy = y / f - 0.5;
  let ix = Math.floor(fx);
  let iy = Math.floor(fy);
  let ax = fx - ix;
  let ay = fy - iy;
  if (ix < 0) {
    ix = 0;
    ax = 0;
  } else if (ix >= w - 1) {
    ix = w - 2;
    ax = 1;
  }
  if (iy < 0) {
    iy = 0;
    ay = 0;
  } else if (iy >= h - 1) {
    iy = h - 2;
    ay = 1;
  }
  const i = iy * w + ix;
  return (
    arr[i] * (1 - ax) * (1 - ay) +
    arr[i + 1] * ax * (1 - ay) +
    arr[i + w] * (1 - ax) * ay +
    arr[i + w + 1] * ax * ay
  );
}
