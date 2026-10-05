// Satin-column direction field from the medial axis. Pure (typed arrays only).
//
// A digitiser stitches a letter as a set of satin COLUMNS, one per stroke: the
// stem, each bowl, the arm, the leg. Every row of a column runs straight across
// the stroke, square to the stroke's own centre line, from the stroke's start
// right into its serifs; where two columns meet they simply butt (a mitre).
//
// This module rebuilds that on the coarse grid:
//   1. thin each element to its medial axis (Zhang and Suen thinning),
//   2. prune the short spurs that serifs, brackets and corners grow on a medial
//      axis, so a stem's column runs on into its serif instead of fanning into
//      the corners (the old "mitred patch" at every serif),
//   3. measure the axis direction at every axis cell (local principal axis of
//      the axis cells within a few steps ALONG the axis, so a neighbouring
//      stroke never bends it), and drop the cells near a junction, where no
//      single direction exists,
//   4. lay the columns (sweepColumns): each straight run is fitted as one
//      column (centre line, span, a half-width that may widen steadily) and
//      sweeps square rays across the element over its span and on past its
//      ends through the junction zones; pointed tips are dropped so strokes
//      run on to the point; a cell goes to the column whose centre line it is
//      nearest relative to that column's half-width, which puts the mitre where
//      two columns meet; what no ray reaches is flooded from its neighbours.
//      The field is constant across a stroke and changes only on the mitres.
//
// The result is a tensor field (n n^T, n = the satin direction, square to the
// axis) that tensorField() blurs and samples like its other sources.

const N8X = [1, 1, 0, -1, -1, -1, 0, 1];
const N8Y = [0, 1, 1, 1, 0, -1, -1, -1];

/**
 * Zhang and Suen thinning of a binary mask (1 = inside), in place on a copy.
 * Returns a 1-cell-wide, 8-connected skeleton that keeps the topology (holes
 * stay holes). Border cells are treated as outside.
 */
export function thinMask(mask: Uint8Array, w: number, h: number): Uint8Array {
  const m = Uint8Array.from(mask);
  for (let x = 0; x < w; x++) {
    m[x] = 0;
    m[(h - 1) * w + x] = 0;
  }
  for (let y = 0; y < h; y++) {
    m[y * w] = 0;
    m[y * w + w - 1] = 0;
  }
  // candidate list: only inside cells are ever looked at
  let list: number[] = [];
  for (let i = 0; i < w * h; i++) if (m[i]) list.push(i);
  const del: number[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      del.length = 0;
      for (const i of list) {
        if (!m[i]) continue;
        // P2..P9 clockwise from north
        const p2 = m[i - w];
        const p3 = m[i - w + 1];
        const p4 = m[i + 1];
        const p5 = m[i + w + 1];
        const p6 = m[i + w];
        const p7 = m[i + w - 1];
        const p8 = m[i - 1];
        const p9 = m[i - w - 1];
        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (b < 2 || b > 6) continue;
        const a =
          (!p2 && p3 ? 1 : 0) +
          (!p3 && p4 ? 1 : 0) +
          (!p4 && p5 ? 1 : 0) +
          (!p5 && p6 ? 1 : 0) +
          (!p6 && p7 ? 1 : 0) +
          (!p7 && p8 ? 1 : 0) +
          (!p8 && p9 ? 1 : 0) +
          (!p9 && p2 ? 1 : 0);
        if (a !== 1) continue;
        if (pass === 0) {
          if (p2 && p4 && p6) continue;
          if (p4 && p6 && p8) continue;
        } else {
          if (p2 && p4 && p8) continue;
          if (p2 && p6 && p8) continue;
        }
        del.push(i);
      }
      if (del.length) {
        changed = true;
        for (const i of del) m[i] = 0;
      }
    }
    list = list.filter((i) => m[i]);
  }
  return m;
}

/**
 * A skeleton cell where three or more branches meet: three or more separate
 * runs of skeleton cells around it (crossing number), so a staircase step on
 * a plain line never counts as one.
 */
export function isJunction(s: Uint8Array, w: number, i: number): boolean {
  // neighbours clockwise from east
  let runs = 0;
  let prev = s[i + N8Y[7] * w + N8X[7]];
  for (let k = 0; k < 8; k++) {
    const v = s[i + N8Y[k] * w + N8X[k]];
    if (v && !prev) runs++;
    prev = v;
  }
  return runs >= 3;
}

function degree(s: Uint8Array, w: number, i: number): number {
  let d = 0;
  for (let k = 0; k < 8; k++) if (s[i + N8Y[k] * w + N8X[k]]) d++;
  return d;
}

/**
 * Remove short spurs from a skeleton, in place. A spur is a run of cells from
 * an end point to the first branching cell; it goes when it is shorter than
 * `factor` times the stroke radius at the branching cell (`radius(i)`, in
 * cells) plus `extra` cells. Repeats a few times, since removing one spur can
 * expose another. Isolated pieces shorter than `extra` cells are removed too.
 */
export function pruneSpurs(
  s: Uint8Array,
  w: number,
  h: number,
  radius: (i: number) => number,
  factor: number,
  extra = 2,
  rounds = 3,
): void {
  const path: number[] = [];
  const doomed: number[] = [];
  const seen = new Uint8Array(w * h);
  for (let r = 0; r < rounds; r++) {
    let removed = false;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const e = y * w + x;
        if (!s[e] || degree(s, w, e) !== 1) continue;
        // walk from the end point
        path.length = 0;
        path.push(e);
        seen[e] = 1;
        let cur = e;
        let junction = -1;
        for (;;) {
          const nb: number[] = [];
          for (let k = 0; k < 8; k++) {
            const j = cur + N8Y[k] * w + N8X[k];
            if (s[j] && !seen[j]) nb.push(j);
          }
          if (!nb.length) break;
          // neighbours that all touch each other are one staircase step, not a fork
          let fork = false;
          if (nb.length > 1) {
            for (let a = 0; a < nb.length && !fork; a++) {
              for (let b = a + 1; b < nb.length; b++) {
                const ax = nb[a] % w;
                const bx = nb[b] % w;
                const ay = (nb[a] - ax) / w;
                const by = (nb[b] - bx) / w;
                if (Math.abs(ax - bx) > 1 || Math.abs(ay - by) > 1) {
                  fork = true;
                  break;
                }
              }
            }
          }
          if (fork) {
            junction = cur;
            break;
          }
          // a cell with 3+ skeleton neighbours further along is a junction too
          let nxt = nb[0];
          for (const j of nb) {
            const jx = j % w;
            const cx = cur % w;
            if (jx === cx || (j - jx) / w === (cur - cx) / w) nxt = j;
          }
          for (const j of nb) seen[j] = 1;
          if (degree(s, w, nxt) > 2 && path.length > 1) {
            junction = nxt;
            for (const j of nb) if (j !== nxt) path.push(j);
            break;
          }
          for (const j of nb) if (j !== nxt) path.push(j);
          path.push(nxt);
          cur = nxt;
          if (path.length > 4096) break;
        }
        const len = path.length;
        const limit = junction >= 0 ? factor * radius(junction) + extra : extra;
        if (len < limit) {
          for (const i of path) if (i !== junction) doomed.push(i);
          removed = true;
        }
        for (const i of path) seen[i] = 0;
        if (junction >= 0) seen[junction] = 0;
      }
    }
    // Remove every spur of the round together. Removing them one at a time
    // lets the second fork of a stem end (both serif corners) look like the
    // stem's own continuation once the first has gone, and the axis would
    // then bend into a corner.
    for (const i of doomed) s[i] = 0;
    doomed.length = 0;
    if (!removed) break;
  }
}

/**
 * Cut the bent tail off every free end of a skeleton, in place. Thinning
 * runs the last stretch of a stem's axis diagonally through its bracket and
 * along one serif, so the rows near every stem end would turn with it. Walking
 * in from each end point, the last sharp CORNER (the axis turns more than about
 * 35 degrees within a stroke radius) is found; when the tail beyond it is
 * shorter than `factor` times the stroke radius at the corner, the tail goes and
 * the flood carries the stroke's own direction right to its end. A long tail
 * past a corner is a real stroke (the beak of an F, the foot of an R) and
 * stays. Gentle curves (bowls, the spine of an S) have no corner and are kept
 * whole.
 */
export function trimEnds(
  s: Uint8Array,
  w: number,
  h: number,
  radius: (i: number) => number,
  factor: number,
): void {
  const ends: number[] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const e = y * w + x;
      if (s[e] && degree(s, w, e) === 1) ends.push(e);
    }
  }
  const doomed: number[] = [];
  const seen = new Uint8Array(w * h);
  const COS_CORNER = Math.cos((35 * Math.PI) / 180);
  for (const e of ends) {
    const path = [e];
    const touched = [e];
    seen[e] = 1;
    let cur = e;
    let free = false;
    for (;;) {
      let nxt = -1;
      for (let k = 0; k < 8; k++) {
        const j = cur + N8Y[k] * w + N8X[k];
        if (s[j] && !seen[j]) {
          // prefer a 4-neighbour (a staircase step offers both)
          if (nxt < 0 || k % 2 === 0) nxt = j;
        }
      }
      if (nxt < 0) {
        free = true;
        break;
      }
      if (isJunction(s, w, nxt)) break;
      for (let k = 0; k < 8; k++) {
        const j = cur + N8Y[k] * w + N8X[k];
        if (s[j] && !seen[j]) {
          seen[j] = 1;
          touched.push(j);
        }
      }
      path.push(nxt);
      cur = nxt;
      if (path.length > 4096) break;
    }
    for (const i of touched) seen[i] = 0;
    const L = path.length;
    const px = (k: number) => path[k] % w;
    const py = (k: number) => (path[k] / w) | 0;
    // the last corner, scanning in from the free end
    let corner = -1;
    const limit = free ? Math.floor(L / 3) : L - 1;
    for (let k = 1; k < limit; k++) {
      const m = Math.max(3, Math.round(radius(path[k]) * 0.6));
      if (k - m < 0 || k + m >= L) continue;
      const ax = px(k) - px(k - m);
      const ay = py(k) - py(k - m);
      const bx = px(k + m) - px(k);
      const by = py(k + m) - py(k);
      const al = Math.hypot(ax, ay);
      const bl = Math.hypot(bx, by);
      if (!al || !bl) continue;
      if ((ax * bx + ay * by) / (al * bl) < COS_CORNER && k < factor * radius(path[k])) {
        corner = k;
      }
    }
    for (let k = 0; k < corner; k++) doomed.push(path[k]);
  }
  for (const i of doomed) s[i] = 0;
}

/**
 * Axis direction at each skeleton cell: the principal axis of the skeleton
 * cells reachable within `R` steps along the skeleton. Returns the tangent
 * (tx, ty) and its coherence 0..1 (1 = a clean line, near 0 = a junction).
 * Cells flagged in `zone` (the stretch of axis around each junction, where
 * thinning bends every branch towards the meeting point) get coherence 0 and
 * are never part of another cell's window.
 */
export function skeletonTangents(
  s: Uint8Array,
  w: number,
  h: number,
  R: number,
  zone?: Uint8Array,
): { tx: Float32Array; ty: Float32Array; coh: Float32Array } {
  const n = w * h;
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const coh = new Float32Array(n);
  const mark = new Int32Array(n).fill(-1);
  const q: number[] = [];
  const dist: number[] = [];
  const junction = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const x = i % w;
    if (s[i] && x > 0 && x < w - 1 && i >= w && i < n - w && isJunction(s, w, i)) junction[i] = 1;
  }
  for (let i = 0; i < n; i++) {
    if (!s[i] || junction[i] || zone?.[i]) continue;
    q.length = 0;
    dist.length = 0;
    q.push(i);
    dist.push(0);
    mark[i] = i;
    let mx = 0;
    let my = 0;
    for (let head = 0; head < q.length; head++) {
      const c = q[head];
      mx += c % w;
      my += (c / w) | 0;
      // the window never runs on through a junction into another branch
      if (dist[head] >= R || junction[c]) continue;
      for (let k = 0; k < 8; k++) {
        const j = c + N8Y[k] * w + N8X[k];
        if (j < 0 || j >= n || !s[j] || mark[j] === i || zone?.[j]) continue;
        mark[j] = i;
        q.push(j);
        dist.push(dist[head] + 1);
      }
    }
    const m = q.length;
    mx /= m;
    my /= m;
    let a = 0;
    let b = 0;
    let cc = 0;
    for (const c of q) {
      const dx = (c % w) - mx;
      const dy = ((c / w) | 0) - my;
      a += dx * dx;
      b += dx * dy;
      cc += dy * dy;
    }
    const tr = a + cc;
    if (tr < 1e-9) continue;
    const half = (a - cc) * 0.5;
    const root = Math.sqrt(half * half + b * b);
    const lam1 = tr * 0.5 + root;
    const lam2 = tr * 0.5 - root;
    let vx = b;
    let vy = lam1 - a;
    if (Math.abs(vx) + Math.abs(vy) < 1e-9) {
      vx = lam1 - cc;
      vy = b;
    }
    const l = Math.hypot(vx, vy) || 1;
    tx[i] = vx / l;
    ty[i] = vy / l;
    coh[i] = lam1 > 0 ? (lam1 - lam2) / (lam1 + lam2) : 0;
  }
  return { tx, ty, coh };
}

/**
 * Length (cells) of the straight chord through cell (x, y) along (dx, dy), both
 * ways, over cells where `inside` holds; each half stops at `cap` cells. Pure.
 */
export function chordLen(
  inside: (x: number, y: number) => boolean,
  x: number,
  y: number,
  dx: number,
  dy: number,
  cap: number,
): number {
  let L = 1;
  for (const sg of [1, -1]) {
    let px = x + 0.5;
    let py = y + 0.5;
    for (let s = 0; s < cap; s++) {
      px += dx * sg;
      py += dy * sg;
      if (!inside(Math.floor(px), Math.floor(py))) break;
      L++;
    }
  }
  return L;
}

/**
 * Tidy the trusted axis runs (connected stretches of axis cells not flagged in
 * \`bad\`), in place. A run shorter than \`minRun\` stroke radii (the stub of axis
 * that links a K's arm to its stem, a scrap between two junction zones) is
 * flagged bad, so its cells take their direction from the long columns round
 * them instead of cutting a wedge into them; the longest run of an element is
 * always kept. A run that is straight overall (principal-axis coherence at
 * least \`straight\`) gets ONE direction for all its cells, so a long diagonal
 * leg is stitched as one even column rather than several slightly different
 * patches. Curved runs (bowls) keep their own local tangents.
 */
export function settleRuns(
  s: Uint8Array,
  w: number,
  h: number,
  bad: Uint8Array,
  t: { tx: Float32Array; ty: Float32Array },
  radius: (i: number) => number,
  minRun: number,
  straight: number,
): ColumnGroup[] {
  const n = w * h;
  const groups: ColumnGroup[] = [];
  const run = new Int32Array(n).fill(-1);
  const runs: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (!s[i] || bad[i] || run[i] >= 0) continue;
    const cells = [i];
    run[i] = runs.length;
    for (let head = 0; head < cells.length; head++) {
      const c = cells[head];
      for (let k = 0; k < 8; k++) {
        const j = c + N8Y[k] * w + N8X[k];
        if (j < 0 || j >= n || !s[j] || bad[j] || run[j] >= 0) continue;
        run[j] = runs.length;
        cells.push(j);
      }
    }
    runs.push(cells);
  }
  const lines: {
    cells: number[];
    mx: number;
    my: number;
    dx: number;
    dy: number;
    rad: number;
    parent: number;
  }[] = [];
  let longest = -1;
  for (let r = 0; r < runs.length; r++) {
    if (longest < 0 || runs[r].length > runs[longest].length) longest = r;
  }
  for (let r = 0; r < runs.length; r++) {
    const cells = runs[r];
    let rad = 0;
    let mx = 0;
    let my = 0;
    for (const c of cells) {
      rad += radius(c);
      mx += c % w;
      my += (c / w) | 0;
    }
    const m = cells.length;
    rad /= m;
    mx /= m;
    my /= m;
    if (r !== longest && m < minRun * rad) {
      for (const c of cells) bad[c] = 5;
      continue;
    }
    let a = 0;
    let b = 0;
    let cc = 0;
    for (const c of cells) {
      const dx = (c % w) - mx;
      const dy = ((c / w) | 0) - my;
      a += dx * dx;
      b += dx * dy;
      cc += dy * dy;
    }
    const tr = a + cc;
    if (tr < 1e-9) {
      groups.push({ cells, straight: false, dx: 0, dy: 0 });
      continue;
    }
    const half = (a - cc) * 0.5;
    const root = Math.sqrt(half * half + b * b);
    if ((2 * root) / tr < straight) {
      // a curved run (a bowl) keeps its own local tangents
      groups.push({ cells, straight: false, dx: 0, dy: 0 });
      continue;
    }
    const lam = tr * 0.5 + root;
    let vx = b;
    let vy = lam - a;
    if (Math.abs(vx) + Math.abs(vy) < 1e-9) {
      vx = lam - cc;
      vy = b;
    }
    const l = Math.hypot(vx, vy) || 1;
    lines.push({ cells, mx, my, dx: vx / l, dy: vy / l, rad, parent: lines.length });
  }
  // Straight runs that lie on one line (a leg cut in two where the crossbar
  // of an A joins it) are one column: they share one direction, so the cells
  // between them meet without a seam.
  const find = (i: number): number => {
    while (lines[i].parent !== i) i = lines[i].parent = lines[lines[i].parent].parent;
    return i;
  };
  const COS_MERGE = Math.cos((8 * Math.PI) / 180);
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const A = lines[i];
      const B = lines[j];
      if (Math.abs(A.dx * B.dx + A.dy * B.dy) < COS_MERGE) continue;
      const tol = 0.5 * Math.max(A.rad, B.rad);
      const offA = Math.abs((B.mx - A.mx) * A.dy - (B.my - A.my) * A.dx);
      const offB = Math.abs((A.mx - B.mx) * B.dy - (A.my - B.my) * B.dx);
      if (offA > tol || offB > tol) continue;
      lines[find(i)].parent = find(j);
    }
  }
  const sum = new Map<number, [number, number]>();
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const r = find(i);
    const ref = lines[r];
    const sg = L.dx * ref.dx + L.dy * ref.dy < 0 ? -1 : 1;
    const acc = sum.get(r) ?? [0, 0];
    acc[0] += sg * L.dx * L.cells.length;
    acc[1] += sg * L.dy * L.cells.length;
    sum.set(r, acc);
  }
  const merged = new Map<number, ColumnGroup>();
  for (let i = 0; i < lines.length; i++) {
    const r = find(i);
    const [sx, sy] = sum.get(r) as [number, number];
    const l = Math.hypot(sx, sy) || 1;
    for (const c of lines[i].cells) {
      t.tx[c] = sx / l;
      t.ty[c] = sy / l;
    }
    let g = merged.get(r);
    if (!g) {
      g = { cells: [], straight: true, dx: sx / l, dy: sy / l };
      merged.set(r, g);
      groups.push(g);
    }
    for (const c of lines[i].cells) g.cells.push(c);
  }
  return groups;
}

/**
 * Flag the columns that are only the POINTED TIP where two strokes meet (the
 * apex of an A, the top corners of an M, the foot of a V): one end of the axis
 * is a free end where the stroke has narrowed to a point (edge distance under
 * `sharp` times the column's widest), and the other end runs into a junction
 * zone. Thinning grows such a stub of axis up the bisector of every pointed
 * corner, and its rows would cut straight across both strokes; dropping it lets
 * the two strokes run on to the point and mitre there instead. Pure.
 */
export function findTips(
  s: Uint8Array,
  w: number,
  groups: ColumnGroup[],
  zone: Uint8Array,
  radius: (c: number) => number,
  sharp = 0.35,
): Uint8Array {
  const n = s.length;
  const tips = new Uint8Array(groups.length);
  if (groups.length < 2) return tips;
  const gOf = new Int32Array(n).fill(-1);
  groups.forEach((g, gi) => {
    for (const c of g.cells) gOf[c] = gi;
  });
  // the group each free end of the axis leads to, and how sharp that end is
  const endR = new Float32Array(groups.length).fill(Infinity);
  const seen = new Int32Array(n).fill(-1);
  for (let e = w; e < n - w; e++) {
    const ex = e % w;
    if (!s[e] || ex === 0 || ex === w - 1 || zone[e] || degree(s, w, e) !== 1) continue;
    // walk in from the free end (outside the junction zones) to the first column cell
    const q = [e];
    seen[e] = e;
    let found = -1;
    for (let head = 0; head < q.length && head < 400 && found < 0; head++) {
      const c = q[head];
      if (gOf[c] >= 0) {
        found = gOf[c];
        break;
      }
      for (let k = 0; k < 8; k++) {
        const j = c + N8Y[k] * w + N8X[k];
        if (j < 0 || j >= n || !s[j] || zone[j] || seen[j] === e) continue;
        seen[j] = e;
        q.push(j);
      }
    }
    if (found >= 0) endR[found] = Math.min(endR[found], radius(e));
  }
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    if (!Number.isFinite(endR[gi])) continue;
    let maxR = 0;
    let touches = false;
    for (const c of g.cells) {
      maxR = Math.max(maxR, radius(c));
      if (touches) continue;
      for (let k = 0; k < 8; k++) {
        const j = c + N8Y[k] * w + N8X[k];
        if (j >= 0 && j < n && zone[j]) {
          touches = true;
          break;
        }
      }
    }
    // (the zone flood can stop a cell short of the column; look one step on)
    if (!touches) {
      for (const c of g.cells) {
        for (let k = 0; k < 8 && !touches; k++) {
          const j = c + N8Y[k] * w + N8X[k];
          if (j < 0 || j >= n || !s[j] || gOf[j] === gi) continue;
          for (let m = 0; m < 8; m++) {
            const jj = j + N8Y[m] * w + N8X[m];
            if (jj >= 0 && jj < n && zone[jj]) touches = true;
          }
        }
        if (touches) break;
      }
    }
    if (touches && endR[gi] < sharp * maxR) tips[gi] = 1;
  }
  return tips;
}

/** One satin column: the trusted axis cells that steer it. */
export interface ColumnGroup {
  cells: number[];
  /** one straight column (a stem, a leg) with one direction (dx, dy) along its axis */
  straight: boolean;
  dx: number;
  dy: number;
}

/**
 * Least-squares fit of a straight column: its centre line (mean point, unit
 * direction) and its half-width as a linear function of the position along it
 * (a wedge-shaped leg widens steadily), plus the span its axis cells cover.
 * `radius(c)` is the edge distance at axis cell c. Pure.
 */
export function fitColumn(
  cells: number[],
  w: number,
  dx: number,
  dy: number,
  radius: (c: number) => number,
): { mx: number; my: number; s0: number; s1: number; a: number; b: number; meanR: number } {
  let mx = 0;
  let my = 0;
  let meanR = 0;
  for (const c of cells) {
    mx += c % w;
    my += (c / w) | 0;
    meanR += radius(c);
  }
  const m = cells.length || 1;
  mx /= m;
  my /= m;
  meanR /= m;
  let s0 = Infinity;
  let s1 = -Infinity;
  let ss = 0;
  let sr = 0;
  for (const c of cells) {
    const s = ((c % w) - mx) * dx + (((c / w) | 0) - my) * dy;
    if (s < s0) s0 = s;
    if (s > s1) s1 = s;
    ss += s * s;
    sr += s * (radius(c) - meanR);
  }
  // the slope of the half-width; a column never narrows or widens faster than
  // its edges could (a 45 degree flare each side)
  let b = ss > 1e-9 ? sr / ss : 0;
  if (b > 0.5) b = 0.5;
  if (b < -0.5) b = -0.5;
  return { mx, my, s0, s1, a: meanR, b, meanR };
}

/**
 * Lay the columns over an element (w x h `mask`): every straight column sweeps
 * square rays across the element from its fitted centre line, edge to edge but
 * never more than a little past its own half-width, along its whole axis span
 * (the CORE) and then on past each end (the EXTENSION, up to `ext` stroke radii)
 * while the centre line stays inside the element. So a wedge leg keeps one clean
 * parallelogram column right through the junction zones that broke its axis, and
 * two legs that meet at an apex mitre there. Curved columns cast one ray from
 * each axis cell along its own normal. A cell claimed by several columns goes to
 * a core before an extension, then to the column whose centre line it is nearest
 * relative to that column's half-width (the mitre between two strokes). A column
 * whose own axis lies mostly inside other columns' extensions (the tip of an
 * apex, the corner where an M's diagonal meets its stem) is dropped.
 * Returns the satin direction per cell (nx, ny), -1 owner where nothing claimed,
 * and the dropped flags per group.
 */
export function sweepColumns(
  mask: Uint8Array,
  w: number,
  h: number,
  groups: ColumnGroup[],
  t: { tx: Float32Array; ty: Float32Array },
  radius: (c: number) => number,
  ext: number,
  tips?: Uint8Array,
): { owner: Int32Array; nx: Float32Array; ny: Float32Array; dropped: Uint8Array } {
  const n = w * h;
  const best = new Float32Array(n);
  const owner = new Int32Array(n);
  const nx = new Float32Array(n);
  const ny = new Float32Array(n);
  const fits = groups.map((g) => (g.straight ? fitColumn(g.cells, w, g.dx, g.dy, radius) : null));
  const inMask = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && !!mask[y * w + x];
  // cast one square ray from (px, py) (cell units, centre-based) along (rx, ry)
  // `loose`: the ray runs on to the element edge (claiming as class 2), so a
  // bracket or a flared corner beyond a column's half-width is still laid as a
  // continuation of the nearest column instead of a flood of mixed directions
  let loose = false;
  const gR = groups.map((g) => {
    let r = 0;
    for (const c of g.cells) r += radius(c);
    return r / (g.cells.length || 1);
  });
  const heavy = 1.3;
  const ray = (
    px: number,
    py: number,
    rx: number,
    ry: number,
    cap: number,
    cls: number,
    g: number,
  ) => {
    const put = (c: number, score: number) => {
      let v = cls * 100 + score;
      // a clearly heavier stroke runs on through the core of a lighter one and
      // the two mitre on their centre lines (the thick diagonal of an N takes
      // its corners; the thin stems butt into it), as a digitiser lays them
      if (cls === 1 && best[c] < 100 && gR[g] > heavy * gR[owner[c]]) v = score;
      if (v < best[c]) {
        best[c] = v;
        owner[c] = g;
        nx[c] = rx;
        ny[c] = ry;
      }
    };
    // (a centre point just outside the element, past the tip of a pointed
    // apex, still lays the part of its row that falls inside, within the cap)
    const start = inMask(Math.floor(px), Math.floor(py));
    let hit = false;
    if (start) {
      put(Math.floor(py) * w + Math.floor(px), 0);
      hit = true;
    }
    const reach = loose ? w + h : cap;
    for (let sg = -1; sg <= 1; sg += 2) {
      let inside = start;
      for (let d = 0.5; d <= reach; d += 0.5) {
        const qx = Math.floor(px + rx * d * sg);
        const qy = Math.floor(py + ry * d * sg);
        if (!inMask(qx, qy)) {
          if (inside || d > cap) break;
          continue;
        }
        inside = true;
        hit = true;
        put(qy * w + qx, d / cap);
      }
    }
    return hit;
  };
  const gapsOf = groups.map((g, gi) => {
    const f = fits[gi];
    const out: [number, number][] = [];
    if (!f) return out;
    const ss = g.cells
      .map((c) => ((c % w) - f.mx) * g.dx + (((c / w) | 0) - f.my) * g.dy)
      .sort((a, b) => a - b);
    for (let k = 1; k < ss.length; k++) {
      const a = ss[k - 1];
      const b = ss[k];
      if (b - a > 2.5 * Math.max(1, f.a + f.b * (a + b) * 0.5)) out.push([a, b]);
    }
    return out;
  });
  const sweep = (gi: number, core: boolean, extension: boolean) => {
    const g = groups[gi];
    const f = fits[gi];
    const c0 = loose ? 2 : 0;
    const c1 = loose ? 2 : 1;
    if (!f) {
      if (!core) return;
      for (const c of g.cells) {
        ray((c % w) + 0.5, ((c / w) | 0) + 0.5, -t.ty[c], t.tx[c], radius(c) * 1.25 + 1, c0, gi);
      }
      return;
    }
    const rx = -g.dy;
    const ry = g.dx;
    const hw = (s: number) => f.a + f.b * s;
    const at = (s: number, cls: number) => {
      const px = f.mx + 0.5 + g.dx * s;
      const py = f.my + 0.5 + g.dy * s;
      const r = hw(s);
      if (r < 1) return false;
      return ray(px, py, rx, ry, r * 1.25 + 1, cls, gi);
    };
    // A long gap in a merged column (a thin bar cut in two by the heavy stem it
    // crosses) is not core: the bar only runs on into it as an extension, so
    // the stem keeps its own rows. A short gap (a leg cut by a crossbar) is.
    const gaps = gapsOf[gi];
    const inGap = (s: number) => {
      for (const [a, b] of gaps) if (s > a && s < b) return true;
      return false;
    };
    if (core) {
      for (let s = f.s0; s <= f.s1; s += 0.5) if (!inGap(s)) at(s, c0);
    }
    if (extension) {
      for (const [a, b] of gaps) for (let s = a + 0.5; s < b; s += 0.5) at(s, c1);
      const reach = ext * f.meanR;
      for (let s = f.s1 + 0.5; s <= f.s1 + reach; s += 0.5) if (!at(s, c1)) break;
      for (let s = f.s0 - 0.5; s >= f.s0 - reach; s -= 0.5) if (!at(s, c1)) break;
    }
  };
  // 1. which columns lie mostly inside another column's extension?
  const dropped = tips ? Uint8Array.from(tips) : new Uint8Array(groups.length);
  best.fill(Infinity);
  owner.fill(-1);
  for (let gi = 0; gi < groups.length; gi++) if (!dropped[gi]) sweep(gi, false, true);
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    if (dropped[gi]) continue;
    let covered = 0;
    let longer = false;
    for (const c of g.cells) {
      const o = owner[c];
      if (o >= 0 && o !== gi && best[c] < 100 + 0.85) {
        covered++;
        if (groups[o].cells.length > g.cells.length) longer = true;
      }
    }
    if (longer && covered >= g.cells.length * 0.6) dropped[gi] = 1;
  }
  // 2. the real sweep, cores and extensions of the columns that stay
  best.fill(Infinity);
  owner.fill(-1);
  // (every core first, so an extension always meets the cores it competes with)
  for (let gi = 0; gi < groups.length; gi++) if (!dropped[gi]) sweep(gi, true, false);
  for (let gi = 0; gi < groups.length; gi++) if (!dropped[gi]) sweep(gi, false, true);
  // 3. what is left (brackets, flared corners) goes to the nearest column, by
  // the same relative distance, with rays that run on to the element edge
  loose = true;
  for (let gi = 0; gi < groups.length; gi++) if (!dropped[gi]) sweep(gi, true, true);
  loose = false;
  return { owner, nx, ny, dropped };
}

export interface ColumnField {
  jxx: Float32Array;
  jxy: Float32Array;
  jyy: Float32Array;
  /** the pruned medial axis (1 = axis cell), for debugging and tests */
  skel: Uint8Array;
  // (1 = axis cell, 2 = an axis cell trusted to steer the rows)
}

/**
 * Satin direction for every labelled cell of `lab` (w x h): square to the
 * medial axis of its own element. `dt` is the per-label distance to the edge
 * (cells), used to scale pruning and the tangent window.
 */
export function columnField(
  lab: Uint8Array,
  w: number,
  h: number,
  dt: Float32Array,
  opts: {
    prune?: number;
    trim?: number;
    /** junction zone length, in stroke radii */
    zone?: number;
    /** shortest run of trusted axis that may steer a column, in stroke radii */
    minRun?: number;
    /** a run at least this coherent is one straight column with one direction */
    straightRun?: number;
    minCoh?: number;
    /** widest a cross-section may be, relative to twice the edge distance */
    maxSection?: number;
    /** how far a straight column runs on past its axis ends, in stroke radii */
    ext?: number;
    /**
     * debugging: filled per coarse cell with why an axis cell does not steer
     * (0 = it does, 1 = junction zone, 2 = bent, 3 = slanted cross-section,
     * 4 = no longer along than across, 5 = too short a run)
     */
    why?: Uint8Array;
  } = {},
): ColumnField {
  const trim = opts.trim ?? 2.2;
  const zoneR = opts.zone ?? 0.5;
  const minRun = opts.minRun ?? 0.6;
  const straightRun = opts.straightRun ?? 0.985;
  const maxSection = opts.maxSection ?? 1.3;
  const ext = opts.ext ?? 3;
  const n = w * h;
  const jxx = new Float32Array(n);
  const jxy = new Float32Array(n);
  const jyy = new Float32Array(n);
  const skelAll = new Uint8Array(n);
  const prune = opts.prune ?? 1.6;
  const minCoh = opts.minCoh ?? 0.85;
  const box = new Map<number, [number, number, number, number]>();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const l = lab[y * w + x];
      if (!l) continue;
      const b = box.get(l);
      if (!b) box.set(l, [x, y, x, y]);
      else {
        if (x < b[0]) b[0] = x;
        if (y < b[1]) b[1] = y;
        if (x > b[2]) b[2] = x;
        if (y > b[3]) b[3] = y;
      }
    }
  }
  for (const [l, b] of box) {
    // a margin of 2 empty cells, so thinning never touches the box edge
    const x0 = Math.max(0, b[0] - 2);
    const y0 = Math.max(0, b[1] - 2);
    const bw = Math.min(w - 1, b[2] + 2) - x0 + 1;
    const bh = Math.min(h - 1, b[3] + 2) - y0 + 1;
    const mask = new Uint8Array(bw * bh);
    let area = 0;
    let maxR = 1;
    for (let yy = 0; yy < bh; yy++) {
      for (let xx = 0; xx < bw; xx++) {
        const i = (y0 + yy) * w + x0 + xx;
        if (lab[i] === l) {
          mask[yy * bw + xx] = 1;
          area++;
          if (dt[i] > maxR) maxR = dt[i];
        }
      }
    }
    if (area < 4) continue;
    const local = (k: number) => (y0 + ((k / bw) | 0)) * w + x0 + (k % bw);
    const s = thinMask(mask, bw, bh);
    pruneSpurs(s, bw, bh, (k) => dt[local(k)], prune, 2);
    trimEnds(s, bw, bh, (k) => dt[local(k)], trim);
    // the junction zones: every axis cell within about one stroke radius
    // (along the axis) of a junction
    const zone = new Uint8Array(bw * bh);
    {
      const zq: number[] = [];
      const zd: number[] = [];
      for (let k = bw; k < bw * bh - bw; k++) {
        const kx = k % bw;
        if (!s[k] || kx === 0 || kx === bw - 1 || !isJunction(s, bw, k)) continue;
        const reach = Math.max(2, Math.round(dt[local(k)] * zoneR));
        zq.length = 0;
        zd.length = 0;
        zq.push(k);
        zd.push(0);
        zone[k] = 1;
        for (let head = 0; head < zq.length; head++) {
          const c = zq[head];
          if (zd[head] >= reach) continue;
          for (let d = 0; d < 8; d++) {
            const j = c + N8Y[d] * bw + N8X[d];
            if (j < 0 || j >= bw * bh || !s[j] || zone[j]) continue;
            zone[j] = 1;
            zq.push(j);
            zd.push(zd[head] + 1);
          }
        }
      }
    }
    // tangent window: about one stroke width along the axis
    const R = Math.max(3, Math.min(30, Math.round(maxR * 1.2)));
    const inEl = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < bw && y < bh && !!mask[y * bw + x];
    const cap = Math.ceil(maxR * 6) + 4;
    // A trustworthy axis cell is a true cross-section of a column: a straight
    // stretch of axis (coherent tangent), the chord square to it about the
    // stroke's width there (twice the edge distance) and the chord along it
    // clearly longer. Where thinning has bent the axis through a bracket into a
    // serif corner, the square chord cuts the corner at a slant and runs long,
    // so that cell must not steer the rows around it. Two passes: the second
    // measures every tangent again WITHOUT the untrusted cells in its window,
    // so a straight stem is not tilted by the bend at its end.
    const why = (t: ReturnType<typeof skeletonTangents>, k: number): number => {
      if (t.coh[k] < minCoh) return 2;
      const kx = k % bw;
      const ky = (k - kx) / bw;
      const across = chordLen(inEl, kx, ky, -t.ty[k], t.tx[k], cap);
      if (across > maxSection * 2 * dt[local(k)] + 2) return 3;
      const along = chordLen(inEl, kx, ky, t.tx[k], t.ty[k], cap);
      return along < across * 1.1 ? 4 : 0;
    };
    let t = skeletonTangents(s, bw, bh, R, zone);
    const bad = Uint8Array.from(zone);
    for (let k = 0; k < bw * bh; k++) if (s[k] && !bad[k]) bad[k] = why(t, k);
    t = skeletonTangents(s, bw, bh, R, bad);
    for (let k = 0; k < bw * bh; k++) if (s[k] && !bad[k]) bad[k] = why(t, k);
    const groups = settleRuns(s, bw, bh, bad, t, (k) => dt[local(k)], minRun, straightRun);
    // lay the columns (cores, then extensions through the junction zones)
    const tips = findTips(s, bw, groups, zone, (k) => dt[local(k)]);
    const cols = sweepColumns(mask, bw, bh, groups, t, (k) => dt[local(k)], ext, tips);
    for (let g = 0; g < groups.length; g++) {
      if (cols.dropped[g]) for (const c of groups[g].cells) bad[c] = 6;
    }
    if (opts.why) for (let k = 0; k < bw * bh; k++) if (s[k]) opts.why[local(k)] = bad[k];
    // cells no column reached take the direction of the nearest one that did
    // (a multi-source flood inside the element only)
    const dirX = cols.nx;
    const dirY = cols.ny;
    const got = new Uint8Array(bw * bh);
    const queue = new Int32Array(bw * bh);
    let tail = 0;
    for (let k = 0; k < bw * bh; k++) {
      if (s[k]) skelAll[local(k)] = bad[k] ? 1 : 2;
      if (cols.owner[k] < 0 || !mask[k]) continue;
      got[k] = 1;
      queue[tail++] = k;
    }
    if (!tail) {
      // no clean axis at all (a dot, a blob): leave the cells empty so the
      // blur and the element's bias angle decide
      continue;
    }
    for (let head = 0; head < tail; head++) {
      const k = queue[head];
      const kx = k % bw;
      const ky = (k - kx) / bw;
      // 4-connected first, then diagonals: a rounder Voronoi edge
      for (let d = 0; d < 8; d++) {
        const o = d < 4 ? [0, 2, 4, 6][d] : [1, 3, 5, 7][d - 4];
        const nx = kx + N8X[o];
        const ny = ky + N8Y[o];
        if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) continue;
        const j = ny * bw + nx;
        if (!mask[j] || got[j]) continue;
        got[j] = 1;
        dirX[j] = dirX[k];
        dirY[j] = dirY[k];
        queue[tail++] = j;
      }
    }
    for (let k = 0; k < bw * bh; k++) {
      if (!got[k]) continue;
      // satin direction: square to the column's axis
      const nx = dirX[k];
      const ny = dirY[k];
      const i = local(k);
      jxx[i] = nx * nx;
      jxy[i] = nx * ny;
      jyy[i] = ny * ny;
    }
  }
  return { jxx, jxy, jyy, skel: skelAll };
}
