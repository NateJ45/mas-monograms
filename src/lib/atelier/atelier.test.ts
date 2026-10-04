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
import { KIND_FILL, KIND_SATIN, fillRegions, orderStitches } from './stitches.ts';
import { clearBuffers, emptyRect, makeBuffers, rasterize } from './raster.ts';

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
