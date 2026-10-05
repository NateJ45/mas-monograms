import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  THREAD_LUM_MAX,
  THREAD_LUM_MIN,
  hexToRgb,
  luminance,
  rgbToHsl,
  hslToRgb,
  threadPalette,
} from './color.ts';
import { downsample, tensorField } from './field.ts';
import {
  chordLen,
  columnField,
  isJunction,
  pruneSpurs,
  settleRuns,
  thinMask,
  trimEnds,
} from './columns.ts';
import { KIND_FILL, KIND_SATIN, fillRegions, orderStitches } from './stitches.ts';
import { clearBuffers, emptyRect, makeBuffers, rasterize } from './raster.ts';
import { buildGeometry, dsepFor } from './geometry.ts';

test('hexToRgb parses long, short and bad input', () => {
  assert.deepEqual(hexToRgb('#ff0000'), [1, 0, 0]);
  assert.deepEqual(hexToRgb('0f0'), [0, 1, 0]);
  assert.deepEqual(hexToRgb('nope', [0.1, 0.2, 0.3]), [0.1, 0.2, 0.3]);
});

test('HSL round trip', () => {
  const c: [number, number, number] = [0.55, 0.23, 0.18];
  const back = hslToRgb(rgbToHsl(c));
  back.forEach((v, i) => assert.ok(Math.abs(v - c[i]) < 1e-6));
});

test('thread palette keeps white and black inside the shading window', () => {
  for (const hex of ['#ffffff', '#000000', '#8c3a2e', '#d9b15f', '#1c3550']) {
    const p = threadPalette(hex);
    const l = luminance(p.base);
    assert.ok(l <= THREAD_LUM_MAX + 1e-3, `${hex} too bright: ${l}`);
    assert.ok(l >= THREAD_LUM_MIN - 1e-3, `${hex} too dark: ${l}`);
    assert.ok(luminance(p.sheen) > l, `${hex} sheen should be lighter than base`);
  }
});

test('thread palette preserves hue', () => {
  const p = threadPalette('#c02020');
  assert.ok(p.base[0] > p.base[1] * 3, 'red stays red');
});

/** A horizontal bar mask: stitches should run vertically (across the stroke). */
function bar(W: number, H: number, y0: number, y1: number, x0: number, x1: number) {
  const labels = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) labels[y * W + x] = 1;
  return labels;
}

test('satin stitches run across a stroke and stay inside it', () => {
  const W = 200;
  const H = 80;
  const labels = bar(W, H, 30, 50, 20, 180);
  const c = downsample(labels, W, H, 2);
  const field = tensorField(c, 4, () => [1, 0]);
  const s = fillRegions(labels, W, H, field, {
    dsep: 3,
    maxSatin: 40,
    fillLen: 15,
    widthRatio: 1.3,
    fillDir: () => [1, 0],
    seed: 1,
    labels: [1],
  });
  assert.ok(s);
  assert.ok(s.count > 30, `expected many stitches, got ${s.count}`);
  let vertical = 0;
  let long = s.count;
  for (let i = 0; i < s.count; i++) {
    for (const [x, y] of [
      [s.x0[i], s.y0[i]],
      [s.x1[i], s.y1[i]],
    ]) {
      assert.ok(labels[(y | 0) * W + (x | 0)] === 1, 'endpoint inside mask');
    }
    const dx = Math.abs(s.x1[i] - s.x0[i]);
    const dy = Math.abs(s.y1[i] - s.y0[i]);
    // ignore the short tacking stitches the gap pass tucks into corners
    if (Math.hypot(dx, dy) < 6) {
      long--;
      continue;
    }
    if (dy > dx * 3) vertical++;
    assert.equal(s.kind[i], KIND_SATIN);
  }
  assert.ok(vertical / long > 0.75, `most stitches vertical (${vertical}/${long})`);
  // spacing: about one row per dsep along the bar
  assert.ok(s.count < (160 / 3) * 1.6 && s.count > (160 / 3) * 0.6);
});

test('rows longer than a satin can span become staggered fill', () => {
  const W = 160;
  const H = 160;
  const labels = bar(W, H, 10, 150, 10, 150);
  const c = downsample(labels, W, H, 2);
  const field = tensorField(c, 3, () => [Math.SQRT1_2, Math.SQRT1_2], 0.5);
  const s = fillRegions(labels, W, H, field, {
    dsep: 3,
    maxSatin: 25,
    fillLen: 12,
    widthRatio: 1.3,
    fillDir: () => [Math.SQRT1_2, Math.SQRT1_2],
    seed: 2,
    labels: [1],
  });
  assert.ok(s);
  let fill = 0;
  let maxLen = 0;
  for (let i = 0; i < s.count; i++) {
    if (s.kind[i] === KIND_FILL) fill++;
    maxLen = Math.max(maxLen, Math.hypot(s.x1[i] - s.x0[i], s.y1[i] - s.y0[i]));
  }
  assert.ok(fill > s.count * 0.5, 'big area is mostly tatami fill');
  assert.ok(maxLen < 12 * 2.2, `fill stitches are split (max ${maxLen.toFixed(1)})`);
});

test('ordering follows keys and rasteriser covers stitched pixels', () => {
  const W = 120;
  const H = 60;
  const labels = bar(W, H, 20, 40, 10, 110);
  const c = downsample(labels, W, H, 2);
  const field = tensorField(c, 3, () => [1, 0]);
  const s = fillRegions(labels, W, H, field, {
    dsep: 3,
    maxSatin: 40,
    fillLen: 15,
    widthRatio: 1.3,
    fillDir: () => [1, 0],
    seed: 3,
    labels: [1],
  });
  assert.ok(s);
  for (let i = 0; i < s.count; i++) s.key[i] = (s.x0[i] + s.x1[i]) / 2;
  const o = orderStitches(s);
  for (let i = 1; i < o.count; i++) assert.ok(o.key[i] >= o.key[i - 1]);
  const b = makeBuffers(W, H);
  clearBuffers(b);
  const r = emptyRect();
  rasterize(b, o, 0, o.count, null, r);
  // centre of the bar is solid thread, far from it is empty
  let peak = 0;
  for (let x = 54; x < 66; x++) peak = Math.max(peak, b.A[30 * W + x]);
  assert.ok(peak > 0.9);
  assert.equal(b.A[5 * W + 60], 0);
  assert.ok(r.x0 <= 12 && r.x1 >= 108);
});

test('geometry builds ordered stitches from a label map (worker path, no DOM)', async () => {
  const W = 200;
  const H = 120;
  const labels = new Uint8Array(W * H);
  // two elements: a vertical stem and a horizontal slab touching it (a serif junction)
  for (let y = 20; y < 100; y++) for (let x = 40; x < 70; x++) labels[y * W + x] = 1;
  for (let y = 90; y < 100; y++) for (let x = 20; x < 90; x++) labels[y * W + x] = 1;
  for (let y = 30; y < 90; y++) for (let x = 120; x < 160; x++) labels[y * W + x] = 2;
  const g = await buildGeometry({
    key: 'T|block|200x120|studio',
    quality: 'studio',
    W,
    H,
    labels,
    order: [1, 2],
    fillAngle: [
      [1, 0.66],
      [2, -0.6],
    ],
    letterH: 80,
  });
  assert.ok(g && !g.empty);
  assert.ok(g.stitches.count > 50);
  for (let i = 1; i < g.stitches.count; i++) assert.ok(g.stitches.key[i] >= g.stitches.key[i - 1]);
  // element 1 is sewn before element 2
  const firstOf2 = Array.from(g.stitches.label.subarray(0, g.stitches.count)).indexOf(2);
  const lastOf1 = Array.from(g.stitches.label.subarray(0, g.stitches.count)).lastIndexOf(1);
  assert.ok(lastOf1 < firstOf2);
  // a superseded run stops
  const dead = await buildGeometry(
    { key: 'x', quality: 'hero', W, H, labels, order: [1], fillAngle: [], letterH: 80 },
    { alive: () => false },
  );
  assert.equal(dead, null);
});

test('stitch spacing stays inside each quality band', () => {
  for (const h of [50, 200, 400, 900]) {
    const hero = dsepFor('hero', h);
    const studio = dsepFor('studio', h);
    assert.ok(hero >= 2.3 && hero <= 4.2);
    assert.ok(studio >= 3.2 && studio <= 5.6);
  }
});

/** A binary mask from a list of filled rectangles [x0, y0, x1, y1). */
function rects(W: number, H: number, rs: [number, number, number, number][]) {
  const m = new Uint8Array(W * H);
  for (const [x0, y0, x1, y1] of rs)
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) m[y * W + x] = 1;
  return m;
}

test('thinning reduces a bar to a one-cell centre line', () => {
  const W = 60;
  const H = 30;
  const s = thinMask(rects(W, H, [[5, 10, 55, 20]]), W, H);
  let n = 0;
  for (let i = 0; i < W * H; i++) {
    if (!s[i]) continue;
    n++;
    const y = (i / W) | 0;
    assert.ok(y >= 13 && y <= 16, `axis cell off centre at y=${y}`);
  }
  assert.ok(n > 30, `axis long enough (${n})`);
  // one cell wide: no column of the straight middle holds two axis cells
  for (let x = 15; x < 45; x++) {
    let col = 0;
    for (let y = 0; y < H; y++) col += s[y * W + x];
    assert.ok(col <= 1, `column ${x} has ${col} axis cells`);
  }
});

test('junctions are counted by branches, not by staircase steps', () => {
  const W = 9;
  const s = new Uint8Array(W * W);
  // a T: horizontal line with a vertical branch down from its middle
  for (let x = 1; x < 8; x++) s[2 * W + x] = 1;
  for (let y = 3; y < 8; y++) s[y * W + 4] = 1;
  assert.equal(isJunction(s, W, 2 * W + 4), true);
  assert.equal(isJunction(s, W, 2 * W + 2), false);
  // a diagonal staircase cell is not a junction
  const d = new Uint8Array(W * W);
  d[1 * W + 1] = d[2 * W + 2] = d[2 * W + 3] = d[3 * W + 4] = 1;
  assert.equal(isJunction(d, W, 2 * W + 3), false);
});

test('chord length measures straight across and along a bar', () => {
  const W = 80;
  const H = 40;
  const m = rects(W, H, [[10, 10, 70, 30]]);
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && !!m[y * W + x];
  assert.equal(chordLen(inside, 40, 20, 0, 1, 100), 20);
  assert.equal(chordLen(inside, 40, 20, 1, 0, 100), 60);
  assert.equal(chordLen(inside, 40, 20, 1, 0, 5), 11, 'each half stops at the cap');
});

test('short spurs are pruned, long branches kept', () => {
  const W = 40;
  const H = 30;
  const s = new Uint8Array(W * H);
  for (let x = 2; x < 38; x++) s[15 * W + x] = 1; // main line
  for (let y = 12; y < 15; y++) s[y * W + 20] = 1; // 3-cell spur up from the middle
  for (let y = 16; y < 28; y++) s[y * W + 10] = 1; // 12-cell branch down
  pruneSpurs(s, W, H, () => 3, 1.6, 2);
  assert.equal(s[12 * W + 20], 0, 'spur gone');
  assert.equal(s[27 * W + 10], 1, 'long branch kept');
  assert.equal(s[15 * W + 30], 1, 'main line kept');
});

test('bent axis tails are cut, straight ends kept', () => {
  const W = 60;
  const H = 60;
  const s = new Uint8Array(W * H);
  // a vertical axis whose bottom 8 cells bend off at 45 degrees
  for (let y = 5; y < 45; y++) s[y * W + 30] = 1;
  for (let k = 1; k <= 8; k++) s[(44 + k) * W + 30 - k] = 1;
  trimEnds(s, W, H, () => 10, 2.2);
  assert.equal(s[52 * W + 22], 0, 'bent tail removed');
  assert.equal(s[30 * W + 30], 1, 'stem axis kept');
  assert.equal(s[5 * W + 30], 1, 'straight top end kept');
});

test('collinear straight runs share one direction; short scraps stop steering', () => {
  const W = 80;
  const H = 20;
  const s = new Uint8Array(W * H);
  const bad = new Uint8Array(W * H);
  for (let x = 2; x < 78; x++) s[10 * W + x] = 1;
  // a junction zone splits the line in two, plus a 2-cell scrap elsewhere
  for (let x = 38; x < 42; x++) bad[10 * W + x] = 1;
  s[3 * W + 5] = s[3 * W + 6] = 1;
  const tx = new Float32Array(W * H);
  const ty = new Float32Array(W * H);
  for (let x = 2; x < 38; x++) [tx[10 * W + x], ty[10 * W + x]] = [Math.cos(0.08), Math.sin(0.08)];
  for (let x = 42; x < 78; x++)
    [tx[10 * W + x], ty[10 * W + x]] = [Math.cos(-0.08), Math.sin(-0.08)];
  tx[3 * W + 5] = tx[3 * W + 6] = 1;
  settleRuns(s, W, H, bad, { tx, ty }, () => 4, 1, 0.98);
  assert.equal(bad[3 * W + 5], 5, 'scrap flagged');
  assert.ok(Math.abs(tx[10 * W + 10] - tx[10 * W + 70]) < 1e-6, 'one direction');
  assert.ok(Math.abs(ty[10 * W + 10] - ty[10 * W + 70]) < 1e-6, 'one direction');
});

test('column field: a stem with a slab foot keeps its own rows to the end', () => {
  // an L-free "T upside down": vertical stem 16 cells wide over a wide foot
  const W = 80;
  const H = 90;
  const lab = rects(W, H, [
    [32, 5, 48, 80],
    [12, 74, 68, 84],
  ]);
  const c = downsample(lab, W, H, 1);
  const dt = tensorField(c, 1, () => [1, 0], 0.015, 'dt').dt as Float32Array;
  const cf = columnField(c.lab, W, H, dt);
  // in the stem, well clear of the foot: rows run horizontally (across)
  for (const y of [15, 40, 60]) {
    const i = y * W + 40;
    assert.ok(cf.jxx[i] > 0.95, `stem row at y=${y} not horizontal (${cf.jxx[i].toFixed(2)})`);
  }
  // the axis exists and some of it steers
  let trusted = 0;
  for (let i = 0; i < W * H; i++) if (cf.skel[i] === 2) trusted++;
  assert.ok(trusted > 20);
});

test('ray satin: rows are straight edge-to-edge threads across a bar', () => {
  const W = 200;
  const H = 80;
  const labels = bar(W, H, 30, 50, 20, 180);
  const c = downsample(labels, W, H, 2);
  const field = tensorField(c, 2, () => [1, 0], 0.015, 'column');
  const s = fillRegions(labels, W, H, field, {
    dsep: 3,
    maxSatin: 40,
    fillLen: 15,
    widthRatio: 1.3,
    fillDir: () => [1, 0],
    seed: 4,
    labels: [1],
    rays: true,
  });
  assert.ok(s && s.count > 30);
  let spanning = 0;
  for (let i = 0; i < s.count; i++) {
    const dy = Math.abs(s.y1[i] - s.y0[i]);
    const dx = Math.abs(s.x1[i] - s.x0[i]);
    if (dy >= 17 && dx < 2) spanning++;
  }
  // nearly every row spans the 20px stroke in one straight stitch
  assert.ok(spanning / s.count > 0.8, `spanning ${spanning}/${s.count}`);
});
