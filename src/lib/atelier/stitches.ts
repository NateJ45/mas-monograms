// Stitch generation for the Atelier engine. Pure (typed arrays only).
//
// How it works: the lettering mask is filled with EVENLY SPACED STREAMLINES of a
// direction field that runs across each stroke (Jobard and Lefer, 1997). Each
// streamline is one row of thread. Short rows become satin stitches (one thread
// from edge to edge); rows longer than a real satin can span are split into a
// staggered tatami fill, the way an embroidery digitiser would do it.
//
// With `rays` (the top satin layer since 2026-10-04) a row is not a curved
// streamline cut short by its neighbours but one STRAIGHT thread from edge to
// edge along the column direction (columns.ts), stopping only at the element
// edge, where the field turns (a mitre) or where it would cross a row running
// another way. Rows may lie over near-parallel neighbours on the inside of a
// curve, as real satin does, so heavy letters no longer break into stubs.

import { sampleCell, sampleCoh, sampleDir, type TensorField } from './field.ts';
import { rng } from './noise.ts';

export const KIND_SATIN = 0;
export const KIND_FILL = 1;
export const KIND_FUZZ = 2;
export const KIND_RUN = 3;
export const KIND_UNDER = 4;

/** Struct-of-arrays stitch list. `count` entries are valid. */
export interface Stitches {
  count: number;
  x0: Float32Array;
  y0: Float32Array;
  x1: Float32Array;
  y1: Float32Array;
  /** thread width in px */
  w: Float32Array;
  /** brightness jitter, around 1 */
  j: Float32Array;
  label: Uint8Array;
  kind: Uint8Array;
  /** reveal order key (lower = earlier) */
  key: Float32Array;
  /**
   * bit 0: the start (x0, y0) ends against another column (a mitre), not at
   * the element edge; bit 1: the same for the end (x1, y1). The rasteriser
   * leaves such ends unshaded, so a mitre does not read as a dark line.
   */
  cap: Uint8Array;
}

export function makeStitches(capacity: number): Stitches {
  return {
    count: 0,
    x0: new Float32Array(capacity),
    y0: new Float32Array(capacity),
    x1: new Float32Array(capacity),
    y1: new Float32Array(capacity),
    w: new Float32Array(capacity),
    j: new Float32Array(capacity),
    label: new Uint8Array(capacity),
    kind: new Uint8Array(capacity),
    key: new Float32Array(capacity),
    cap: new Uint8Array(capacity),
  };
}

function grow(s: Stitches): Stitches {
  const n = makeStitches(Math.max(64, s.x0.length * 2));
  n.count = s.count;
  n.x0.set(s.x0);
  n.y0.set(s.y0);
  n.x1.set(s.x1);
  n.y1.set(s.y1);
  n.w.set(s.w);
  n.j.set(s.j);
  n.label.set(s.label);
  n.kind.set(s.kind);
  n.key.set(s.key);
  n.cap.set(s.cap);
  return n;
}

export function pushStitch(
  s: Stitches,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w: number,
  j: number,
  label: number,
  kind: number,
  key = 0,
  cap = 0,
): Stitches {
  if (s.count >= s.x0.length) s = grow(s);
  const i = s.count++;
  s.x0[i] = x0;
  s.y0[i] = y0;
  s.x1[i] = x1;
  s.y1[i] = y1;
  s.w[i] = w;
  s.j[i] = j;
  s.label[i] = label;
  s.kind[i] = kind;
  s.key[i] = key;
  s.cap[i] = cap;
  return s;
}

export interface FillParams {
  /** separation between thread rows, px */
  dsep: number;
  /** longest single satin stitch, px; longer rows become tatami */
  maxSatin: number;
  /** tatami stitch length, px */
  fillLen: number;
  /** thread width relative to dsep (>1 so neighbours touch) */
  widthRatio: number;
  /** tatami fill direction per label (unit vector) */
  fillDir: (label: number) => [number, number];
  seed: number;
  /** labels to fill, in order */
  labels: number[];
  /** force every stitch to this kind (used for underlay) */
  kind?: number;
  /** optional cooperative yield, called every few ms of work; returning false aborts */
  tick?: () => boolean;
  /**
   * Straight edge-to-edge rows (satin columns) instead of spacing-limited
   * streamlines: a row only stops at the element edge or at a junction seam.
   */
  rays?: boolean;
  /** rays: the row stops where the stroke direction turns more than this, radians */
  seamAngle?: number;
}

interface Pts {
  x: Float32Array;
  y: Float32Array;
  line: Int32Array;
  n: number;
}

/**
 * Fill every listed label region of `labels` (full resolution, W x H) with
 * stitches. Returns null if `tick` asked to abort.
 */
export function fillRegions(
  labels: Uint8Array,
  W: number,
  H: number,
  field: TensorField,
  p: FillParams,
  out: Stitches = makeStitches(4096),
): Stitches | null {
  const dsep = p.dsep;
  const dtest = dsep * 0.56;
  const dseed = dsep * 0.78;
  const minLen = dsep * 0.9;
  const cell = dsep;
  const gw = Math.ceil(W / cell) + 1;
  const gh = Math.ceil(H / cell) + 1;
  const random = rng(p.seed);

  let stitches = out;
  for (const label of p.labels) {
    // per-label spatial hash of committed streamline points
    const head = new Int32Array(gw * gh).fill(-1);
    let next = new Int32Array(1 << 15);
    const pts: Pts = {
      x: new Float32Array(1 << 15),
      y: new Float32Array(1 << 15),
      line: new Int32Array(1 << 15),
      n: 0,
    };
    const lineStart: number[] = [];
    const lineLen: number[] = [];

    const inside = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return false;
      return labels[(y | 0) * W + (x | 0)] === label;
    };

    const nearOther = (x: number, y: number, lineId: number, r: number) => {
      const cx = (x / cell) | 0;
      const cy = (y / cell) | 0;
      const r2 = r * r;
      for (let oy = -1; oy <= 1; oy++) {
        const yy = cy + oy;
        if (yy < 0 || yy >= gh) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const xx = cx + ox;
          if (xx < 0 || xx >= gw) continue;
          let k = head[yy * gw + xx];
          while (k >= 0) {
            if (pts.line[k] !== lineId) {
              const dx = pts.x[k] - x;
              const dy = pts.y[k] - y;
              if (dx * dx + dy * dy < r2) return true;
            }
            k = next[k];
          }
        }
      }
      return false;
    };

    // rays: is (x,y) on a committed row that runs at a clearly different angle?
    // A straight row may lie over its near-parallel neighbours (the inside of a
    // curve), but never crosses a row going another way: that reads as hatching.
    const lineDX: number[] = [];
    const lineDY: number[] = [];
    const nearCross = (x: number, y: number, lineId: number, r: number, dx: number, dy: number) => {
      const cx = (x / cell) | 0;
      const cy = (y / cell) | 0;
      const r2 = r * r;
      for (let oy = -1; oy <= 1; oy++) {
        const yy = cy + oy;
        if (yy < 0 || yy >= gh) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const xx = cx + ox;
          if (xx < 0 || xx >= gw) continue;
          let k = head[yy * gw + xx];
          while (k >= 0) {
            const lk = pts.line[k];
            if (lk !== lineId && Math.abs(lineDX[lk] * dx + lineDY[lk] * dy) < cosCross) {
              const ddx = pts.x[k] - x;
              const ddy = pts.y[k] - y;
              if (ddx * ddx + ddy * ddy < r2) return true;
            }
            k = next[k];
          }
        }
      }
      return false;
    };

    const tmpX = new Float32Array(Math.max(W, H) * 4);
    const tmpY = new Float32Array(Math.max(W, H) * 4);
    const bwdX = new Float32Array(Math.max(W, H) * 2);
    const bwdY = new Float32Array(Math.max(W, H) * 2);
    const maxSteps = Math.max(W, H) * 2 - 2;

    // Trace from (sx,sy) along +/- dir; writes into ax/ay, returns count.
    const fillDirL = p.fillDir(label);
    let fixed: [number, number] | null = null;
    const rays = !!p.rays;
    const cosSeam = Math.cos(p.seamAngle ?? 0.15);
    const cosCross = Math.cos(0.3);
    const overrun = Math.round(dsep * 1.5);
    const mitreCoh = 0.9;
    const blendMax = Math.round(dsep * 2.5);
    const tuckLen = Math.round(dsep * 0.7);
    // rays: did the last traced half stop against another column (a mitre)?
    let halfInterior = false;
    const lineCap: number[] = [];
    const traceHalf = (
      sx: number,
      sy: number,
      dx0: number,
      dy0: number,
      lineId: number,
      ax: Float32Array,
      ay: Float32Array,
    ) => {
      let x = sx;
      let y = sy;
      let px = dx0;
      let py = dy0;
      let n = 0;
      if (rays) {
        // A satin stitch is one straight thread from edge to edge. Run the row
        // straight on until it leaves the element or reaches a junction seam
        // (where the stroke direction turns away); never stop it short because a
        // neighbour is close. On the inside of a curve rows then overlap a little,
        // as real satin does, instead of breaking into stubs and pockets.
        let over = 0;
        let blend = 0;
        // steps left of the tuck: a row that stops against another column runs
        // on a little under it (the bridging overlap a digitiser leaves at every
        // mitre), so no fabric shows between the two columns
        let tuck = -1;
        halfInterior = false;
        for (let s = 0; s < maxSteps; s++) {
          const nx = x + dx0;
          const ny = y + dy0;
          if (!inside(nx, ny)) break;
          if (tuck >= 0) {
            if (tuck-- === 0) {
              halfInterior = true;
              break;
            }
            x = nx;
            y = ny;
            ax[n] = x;
            ay[n] = y;
            n++;
            continue;
          }
          const [vx, vy] = sampleDir(field, nx, ny);
          if (Math.abs(vx * dx0 + vy * dy0) < cosSeam) {
            // On the mitre the field blends the two columns' directions over a
            // few px. Carry the row on through that blend (straight, a short
            // way) and stop only where the other column's own direction is
            // clear, so the rows of both columns meet on the mitre line instead
            // of each stopping short and leaving a pocket of tacking stitches.
            if (sampleCoh(field, nx, ny) > mitreCoh || ++blend > blendMax) {
              tuck = tuckLen;
              continue;
            }
          }
          if (fixed) {
            // gap row: may tuck a short way under its neighbours, then stops
            if (nearOther(nx, ny, lineId, dtest) && ++over > overrun) break;
          } else if (nearCross(nx, ny, lineId, dtest, dx0, dy0)) {
            tuck = tuckLen;
            continue;
          }
          x = nx;
          y = ny;
          ax[n] = x;
          ay[n] = y;
          n++;
        }
        return n;
      }
      for (let s = 0; s < maxSteps; s++) {
        let [vx, vy] = fixed ?? sampleDir(field, x, y);
        if (vx * px + vy * py < 0) {
          vx = -vx;
          vy = -vy;
        }
        let [wx, wy] = fixed ?? sampleDir(field, x + vx * 0.5, y + vy * 0.5);
        if (wx * vx + wy * vy < 0) {
          wx = -wx;
          wy = -wy;
        }
        // refuse hairpin turns at field singularities
        if (wx * px + wy * py < 0.6) break;
        // a satin row is (nearly) straight: stop once it has turned too far
        if (wx * dx0 + wy * dy0 < 0.9) break;
        const nx = x + wx;
        const ny = y + wy;
        if (!inside(nx, ny)) break;
        if (nearOther(nx, ny, lineId, dtest)) break;
        x = nx;
        y = ny;
        px = wx;
        py = wy;
        ax[n] = x;
        ay[n] = y;
        n++;
      }
      return n;
    };

    const ensurePts = (extra: number) => {
      if (pts.n + extra <= pts.x.length) return;
      let cap = pts.x.length;
      while (cap < pts.n + extra) cap *= 2;
      const nx = new Float32Array(cap);
      nx.set(pts.x);
      const ny = new Float32Array(cap);
      ny.set(pts.y);
      const nl = new Int32Array(cap);
      nl.set(pts.line);
      const nn = new Int32Array(cap);
      nn.set(next);
      pts.x = nx;
      pts.y = ny;
      pts.line = nl;
      next = nn;
    };

    // Trace a whole line through a seed and commit it if long enough.
    const traceLine = (sx: number, sy: number, relaxed = false): number => {
      const lineId = lineStart.length;
      // gap rows run straight, so leftover pockets fill as tidy parallel
      // patches instead of a tangle: along the wide-area stroke direction when
      // the field has one (the pocket continues its neighbours), else at the
      // element's calm fill angle
      // (rays: the column field is already one calm direction per column, so a
      // gap row simply carries on its own column)
      // (rays: a row starts in the direction of its own column, read unblended,
      // so a row seeded beside a mitre never takes a halfway angle and fans)
      const own = rays && field.raw ? sampleCell(field.raw, sx, sy) : null;
      // rays: never start a row on the mitre line between two columns, where
      // the two directions cancel and the row would cut across both; a gap row
      // there may start, in the unblended direction of the column it lies in,
      // or the very point of a V-shaped mitre is never covered
      if (rays && sampleCoh(field, sx, sy) < 0.5 && !(relaxed && own)) return -1;
      fixed = relaxed
        ? rays
          ? (own ?? sampleDir(field, sx, sy))
          : field.smooth
            ? sampleDir(field.smooth, sx, sy)
            : fillDirL
        : null;
      const [dx, dy] = fixed ?? own ?? sampleDir(field, sx, sy);
      const nb = traceHalf(sx, sy, -dx, -dy, lineId, bwdX, bwdY);
      const startIn = halfInterior;
      let n = 0;
      for (let i = nb - 1; i >= 0; i--) {
        tmpX[n] = bwdX[i];
        tmpY[n] = bwdY[i];
        n++;
      }
      tmpX[n] = sx;
      tmpY[n] = sy;
      n++;
      const nf = traceHalf(sx, sy, dx, dy, lineId, bwdX, bwdY);
      const endIn = halfInterior;
      for (let i = 0; i < nf; i++) {
        tmpX[n] = bwdX[i];
        tmpY[n] = bwdY[i];
        n++;
      }
      if (n - 1 < minLen) {
        if (!relaxed) return -1;
        // gap filler: a short tacking stitch along the field, centred on the seed
        n = 0;
        for (let k = -2; k <= 2; k++) {
          const qx = sx + dx * k * dsep * 0.22;
          const qy = sy + dy * k * dsep * 0.22;
          if (!inside(qx, qy)) continue;
          tmpX[n] = qx;
          tmpY[n] = qy;
          n++;
        }
        if (n < 2) return -1;
      }
      ensurePts(n);
      const start = pts.n;
      for (let i = 0; i < n; i++) {
        const k = pts.n++;
        pts.x[k] = tmpX[i];
        pts.y[k] = tmpY[i];
        pts.line[k] = lineId;
        const c = ((tmpY[i] / cell) | 0) * gw + ((tmpX[i] / cell) | 0);
        next[k] = head[c];
        head[c] = k;
      }
      lineStart.push(start);
      lineLen.push(n);
      lineCap.push(rays && !relaxed ? (startIn ? 1 : 0) | (endIn ? 2 : 0) : 0);
      lineDX.push(dx);
      lineDY.push(dy);
      return lineId;
    };

    const validSeed = (x: number, y: number) => inside(x, y) && !nearOther(x, y, -1, dseed);

    const queue: number[] = [];
    let qHead = 0;
    const flood = (relaxed = false) => {
      while (qHead < queue.length) {
        const id = queue[qHead++];
        const s = lineStart[id];
        const n = lineLen[id];
        const stride = Math.max(1, Math.round(dsep * 0.75));
        for (let i = 0; i < n; i += stride) {
          const a = s + Math.max(0, i - 1);
          const b = s + Math.min(n - 1, i + 1);
          let tx = pts.x[b] - pts.x[a];
          let ty = pts.y[b] - pts.y[a];
          const tl = Math.hypot(tx, ty) || 1;
          tx /= tl;
          ty /= tl;
          const x = pts.x[s + i];
          const y = pts.y[s + i];
          for (const sg of [1, -1]) {
            const sx = x - ty * dsep * sg;
            const sy = y + tx * dsep * sg;
            if (validSeed(sx, sy)) {
              const nid = traceLine(sx, sy, relaxed);
              if (nid >= 0) queue.push(nid);
            }
          }
        }
        if (p.tick && !p.tick()) return false;
      }
      return true;
    };

    // Raster scan for seeds so every disconnected piece gets filled.
    const step = Math.max(1, dsep * 0.8);
    for (let y = step * 0.5; y < H; y += step) {
      for (let x = step * 0.5; x < W; x += step) {
        if (!validSeed(x, y)) continue;
        const id = traceLine(x, y);
        if (id >= 0) {
          queue.push(id);
          if (!flood()) return null;
        }
      }
    }
    // Prune stubs: where rows fan round a junction (stem into serif, crossbar
    // into stem) they stop after a few px and read as a tangle. Drop rows much
    // shorter than the stroke they sit in; the gap pass refills those pockets
    // at one calm angle, like a digitiser's separate fill object.
    const dead = new Uint8Array(lineStart.length);
    const dtf = field.dt;
    if (dtf) {
      let any = false;
      for (let id = 0; id < lineStart.length; id++) {
        const s0 = lineStart[id];
        const n = lineLen[id];
        const m = s0 + (n >> 1);
        const cx = Math.min(field.w - 1, (pts.x[m] / field.f) | 0);
        const cy = Math.min(field.h - 1, (pts.y[m] / field.f) | 0);
        const width = 2 * dtf[cy * field.w + cx] * field.f;
        // (rays: a row that ends against a neighbouring column is the tapered
        // end of a mitre, not a stub; only crumbs go)
        if (rays ? n - 1 < dsep * 1.5 : n - 1 < width * 0.42 && n - 1 < dsep * 6) {
          dead[id] = 1;
          any = true;
        }
      }
      if (any) {
        head.fill(-1);
        for (let id = 0; id < lineStart.length; id++) {
          if (dead[id]) continue;
          const s0 = lineStart[id];
          for (let k = s0; k < s0 + lineLen[id]; k++) {
            const c = ((pts.y[k] / cell) | 0) * gw + ((pts.x[k] / cell) | 0);
            next[k] = head[c];
            head[c] = k;
          }
        }
      }
    }
    // Gap pass: wherever fanning rows left a hole, tuck in a short stitch.
    const gstep = Math.max(1, dsep * 0.45);
    const gapR = dsep * (rays ? 0.68 : 0.8);
    for (let y = gstep * 0.5; y < H; y += gstep) {
      for (let x = gstep * 0.5; x < W; x += gstep) {
        if (!inside(x, y) || nearOther(x, y, -1, gapR)) continue;
        const id = traceLine(x, y, true);
        if (id >= 0) {
          queue.push(id);
          if (!flood(true)) return null;
        }
      }
    }
    // rays: bridge the seams between two families of parallel rows. Where rows
    // seeded from different places meet, their spacing can come out between
    // about 1.3 and 1.8 rows: too narrow for a seed, wide enough for the fabric
    // to show as a dashed line along the column. Probe three quarters of a row
    // off each row; where nothing lies within about half a row of the probe, lay
    // one more straight row there.
    if (rays) {
      const lines = lineStart.length;
      const probe = dsep * 0.75;
      const clear = dsep * 0.55;
      const stride = Math.max(1, Math.round(dsep));
      for (let id = 0; id < lines; id++) {
        if (id < dead.length && dead[id]) continue;
        const s0 = lineStart[id];
        const n = lineLen[id];
        if (n < 2) continue;
        let tx = pts.x[s0 + n - 1] - pts.x[s0];
        let ty = pts.y[s0 + n - 1] - pts.y[s0];
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        for (let i = 0; i < n; i += stride) {
          for (const sg of [1, -1]) {
            const sx = pts.x[s0 + i] - ty * probe * sg;
            const sy = pts.y[s0 + i] + tx * probe * sg;
            if (!inside(sx, sy) || nearOther(sx, sy, -1, clear)) continue;
            const nid = traceLine(sx, sy, true);
            if (nid >= 0 && p.tick && !p.tick()) return null;
          }
        }
      }
    }

    // Lines to stitches.
    const fd = p.fillDir(label);
    const perpX = -fd[1];
    const perpY = fd[0];
    const tw = dsep * p.widthRatio;
    for (let id = 0; id < lineStart.length; id++) {
      if (id < dead.length && dead[id]) continue;
      const s = lineStart[id];
      const n = lineLen[id];
      const total = n - 1;
      const isFill = total > p.maxSatin;
      // tatami: break where the along-fill projection crosses a staggered grid
      const row = Math.round((pts.x[s] * perpX + pts.y[s] * perpY) / dsep);
      const phase = ((((row * 2) % 5) + 5) % 5) / 5 + (random() - 0.5) * 0.08;
      let a = 0;
      let lastCell = isFill
        ? Math.floor((pts.x[s] * fd[0] + pts.y[s] * fd[1]) / p.fillLen + phase)
        : 0;
      for (let i = 1; i < n; i++) {
        let brk = i === n - 1;
        if (!brk && isFill) {
          const c = Math.floor((pts.x[s + i] * fd[0] + pts.y[s + i] * fd[1]) / p.fillLen + phase);
          if (c !== lastCell) {
            lastCell = c;
            brk = i - a > p.fillLen * 0.3 && n - 1 - i > p.fillLen * 0.3;
          }
        }
        if (!brk && i - a > 3) {
          // straightness: chord from a to i vs the midpoint of the run
          const m = s + ((a + i) >> 1);
          const ax = pts.x[s + a];
          const ay = pts.y[s + a];
          const cx = pts.x[s + i] - ax;
          const cy = pts.y[s + i] - ay;
          const cl = Math.hypot(cx, cy) || 1;
          const dev = Math.abs((pts.x[m] - ax) * cy - (pts.y[m] - ay) * cx) / cl;
          if (dev > (isFill ? 1 : Math.max(1, dsep * 0.5))) brk = true;
        }
        if (brk) {
          const jit = 0.93 + random() * 0.14;
          const lc = lineCap[id] ?? 0;
          const cap = (a === 0 ? lc & 1 : 0) | (i === n - 1 ? lc & 2 : 0);
          stitches = pushStitch(
            stitches,
            pts.x[s + a],
            pts.y[s + a],
            pts.x[s + i],
            pts.y[s + i],
            tw * (0.94 + random() * 0.12),
            jit,
            label,
            p.kind ?? (isFill ? KIND_FILL : KIND_SATIN),
            0,
            cap,
          );
          a = i;
        }
      }
    }
  }
  return stitches;
}

/**
 * Tiny loose fibres around the edges of the stitched area (thread ends and
 * fuzz). `edge` gives coarse coverage; fibres start just inside the edge and
 * point roughly outward.
 */
export function addFuzz(
  s: Stitches,
  cov: Float32Array,
  lab: Uint8Array,
  w: number,
  h: number,
  f: number,
  density: number,
  len: number,
  seed: number,
): Stitches {
  const random = rng(seed ^ 0x5bd1e995);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const c = cov[i];
      if (c < 0.15 || c > 0.85) continue;
      if (random() > density) continue;
      const gx = cov[i + 1] - cov[i - 1];
      const gy = cov[i + w] - cov[i - w];
      const gl = Math.hypot(gx, gy);
      if (gl < 1e-3) continue;
      // outward = down the coverage gradient
      let ox = -gx / gl;
      let oy = -gy / gl;
      const rot = (random() - 0.5) * 2.2;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const nx = ox * cr - oy * sr;
      const ny = ox * sr + oy * cr;
      ox = nx;
      oy = ny;
      const px = (x + 0.5) * f - ox * len * 0.45;
      const py = (y + 0.5) * f - oy * len * 0.45;
      const l = len * (0.5 + random());
      let label = lab[i];
      if (!label) {
        // edge cell may be mostly empty; borrow a neighbour's label
        label = lab[i - 1] || lab[i + 1] || lab[i - w] || lab[i + w] || 1;
      }
      s = pushStitch(
        s,
        px,
        py,
        px + ox * l,
        py + oy * l,
        0.55 + random() * 0.35,
        0.85 + random() * 0.3,
        label,
        KIND_FUZZ,
      );
    }
  }
  return s;
}

/** A running stitch around a circle (dashes of thread with fabric between). */
export function addRunningRing(
  s: Stitches,
  cx: number,
  cy: number,
  r: number,
  dash: number,
  gap: number,
  width: number,
  label: number,
  seed: number,
): Stitches {
  const random = rng(seed ^ 0x27d4eb2d);
  const circ = 2 * Math.PI * r;
  const n = Math.max(12, Math.round(circ / (dash + gap)));
  const per = (2 * Math.PI) / n;
  const dashA = per * (dash / (dash + gap));
  for (let k = 0; k < n; k++) {
    const a0 = -Math.PI / 2 + k * per + (random() - 0.5) * per * 0.04;
    const a1 = a0 + dashA * (0.96 + random() * 0.08);
    const rr = r + (random() - 0.5) * width * 0.15;
    s = pushStitch(
      s,
      cx + Math.cos(a0) * rr,
      cy + Math.sin(a0) * rr,
      cx + Math.cos(a1) * rr,
      cy + Math.sin(a1) * rr,
      width,
      0.94 + random() * 0.12,
      label,
      KIND_RUN,
      k / n,
    );
  }
  return s;
}

/**
 * Sort stitches by key (stable) and make consecutive satin stitches alternate
 * direction, so the needle zig-zags across a column like a real machine.
 */
export function orderStitches(s: Stitches): Stitches {
  const n = s.count;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  const key = s.key;
  idx.sort((a, b) => key[a] - key[b] || a - b);
  const o = makeStitches(Math.max(1, n));
  o.count = n;
  let flip = false;
  for (let k = 0; k < n; k++) {
    const i = idx[k];
    let x0 = s.x0[i];
    let y0 = s.y0[i];
    let x1 = s.x1[i];
    let y1 = s.y1[i];
    let cap = s.cap[i];
    if (s.kind[i] === KIND_SATIN || s.kind[i] === KIND_FILL) {
      // put the start nearest the previous stitch's end
      if (k > 0) {
        const px = o.x1[k - 1];
        const py = o.y1[k - 1];
        const d0 = (x0 - px) ** 2 + (y0 - py) ** 2;
        const d1 = (x1 - px) ** 2 + (y1 - py) ** 2;
        flip = d1 < d0;
      } else flip = false;
      if (flip) {
        [x0, x1] = [x1, x0];
        [y0, y1] = [y1, y0];
        cap = ((cap & 1) << 1) | ((cap & 2) >> 1);
      }
    }
    o.x0[k] = x0;
    o.y0[k] = y0;
    o.x1[k] = x1;
    o.y1[k] = y1;
    o.w[k] = s.w[i];
    o.j[k] = s.j[i];
    o.label[k] = s.label[i];
    o.kind[k] = s.kind[i];
    o.key[k] = s.key[i];
    o.cap[k] = cap;
  }
  return o;
}
