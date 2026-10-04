// Stitch geometry for one design: the heavy, pure half of the Atelier pipeline.
//
// Input is the lettering label map (from layout.ts, which needs a DOM canvas and
// so runs on the main thread); output is the ordered stitch list and the padded
// relief. Everything here uses typed arrays only, so it runs unchanged inside
// the Atelier worker (atelier.worker.ts) or, where workers are unavailable, on
// the main thread with cooperative yields between steps.

import {
  boxBlur,
  downsample,
  erodeLabels,
  geodesic,
  relief as makeRelief,
  tensorField,
  type Relief,
} from './field.ts';
import { seedOf } from './noise.ts';
import {
  KIND_FUZZ,
  KIND_UNDER,
  addFuzz,
  addRunningRing,
  fillRegions,
  makeStitches,
  orderStitches,
  type Stitches,
} from './stitches.ts';

export interface GeometryInput {
  /** cache key (text, style, size, quality); also seeds the randomness */
  key: string;
  quality: 'hero' | 'studio';
  W: number;
  H: number;
  labels: Uint8Array;
  order: number[];
  /** [label, angle] pairs (a Map does not survive every structured clone path cheaply) */
  fillAngle: [number, number][];
  letterH: number;
  ring?: { cx: number; cy: number; r: number };
  ringLabel?: number;
}

export interface GeometryResult {
  key: string;
  W: number;
  H: number;
  stitches: Stitches;
  relief: Relief | null;
  dsep: number;
  empty: boolean;
}

export interface Hooks {
  /** called between steps; may yield to the event loop (main-thread fallback) */
  pause?: () => Promise<void> | void;
  /** false = a newer design superseded this one: stop */
  alive?: () => boolean;
}

/** Hero quality trades a little thread density for a much cheaper run. */
export function dsepFor(quality: 'hero' | 'studio', letterH: number): number {
  return Math.max(
    quality === 'hero' ? 2.3 : 3.2,
    Math.min(quality === 'hero' ? 4.2 : 5.6, letterH / (quality === 'hero' ? 95 : 105)),
  );
}

export async function buildGeometry(
  inp: GeometryInput,
  hooks: Hooks = {},
): Promise<GeometryResult | null> {
  const { key, W, H, quality } = inp;
  const alive = hooks.alive ?? (() => true);
  const step = async () => {
    if (hooks.pause) await hooks.pause();
    return alive();
  };
  const seed = seedOf(key);
  if (!inp.order.length) {
    return { key, W, H, stitches: makeStitches(1), relief: null, dsep: 3, empty: true };
  }
  const angles = new Map(inp.fillAngle);
  const f = 2;
  const coarse = downsample(inp.labels, W, H, f);
  // stroke width estimate: 2 * area / perimeter
  let area = 0;
  let perim = 0;
  for (let y = 1; y < coarse.h - 1; y++) {
    for (let x = 1; x < coarse.w - 1; x++) {
      const i = y * coarse.w + x;
      area += coarse.cov[i];
      perim +=
        Math.hypot(
          coarse.cov[i + 1] - coarse.cov[i - 1],
          coarse.cov[i + coarse.w] - coarse.cov[i - coarse.w],
        ) * 0.5;
    }
  }
  const strokeW = perim > 0 ? (2 * area * f) / perim : 20;
  const dsep = dsepFor(quality, inp.letterH);
  const tensorR = Math.max(2, Math.min(10, Math.round((strokeW * 0.22) / f)));
  const dirOf = (l: number, turn = 0): [number, number] => {
    const a = (angles.get(l) ?? 0.66) + turn;
    return [Math.cos(a), Math.sin(a)];
  };
  if (!(await step())) return null;
  const field = tensorField(coarse, tensorR, (l) => dirOf(l), 0.015, 'dt');
  if (!(await step())) return null;

  const maxSatin = Math.max(dsep * 8, inp.letterH * 0.42);
  const fillLabels = inp.order.filter((l) => l !== inp.ringLabel);

  // Underlay: a sparse, inset lattice laid first (as a digitiser would), so any
  // gap between top stitches shows thread, never bare fabric.
  const underLabels = erodeLabels(inp.labels, W, H, dsep * 1.2);
  const underField = tensorField(coarse, 1, (l) => dirOf(l, Math.PI / 2), 1e4);
  if (!(await step())) return null;
  let stitches = fillRegions(underLabels, W, H, underField, {
    dsep: dsep * 2.6,
    maxSatin: maxSatin * 1.6,
    fillLen: maxSatin * 0.9,
    widthRatio: 0.55,
    fillDir: (l) => dirOf(l, Math.PI / 2),
    seed: seed ^ 0x1234,
    labels: fillLabels,
    kind: KIND_UNDER,
    tick: alive,
  });
  if (!stitches || !(await step())) return null;
  // one label at a time, so the main-thread fallback can yield between letters
  for (const l of fillLabels) {
    stitches = fillRegions(
      inp.labels,
      W,
      H,
      field,
      {
        dsep,
        maxSatin,
        fillLen: maxSatin * 0.42,
        widthRatio: 1.45,
        fillDir: (lab) => dirOf(lab),
        seed: seed + l * 7919,
        labels: [l],
        tick: alive,
      },
      stitches,
    );
    if (!stitches || !(await step())) return null;
  }
  stitches = addFuzz(
    stitches,
    coarse.cov,
    coarse.lab,
    coarse.w,
    coarse.h,
    f,
    quality === 'hero' ? 0.05 : 0.1,
    dsep * 1.1,
    seed,
  );

  // sewing order: element rank, then geodesic distance along the strokes
  const geod = geodesic(coarse);
  const rank = new Map<number, number>();
  inp.order.forEach((l, k) => rank.set(l, k));
  const span = 1e6;
  const lookup = (x: number, y: number, l: number) => {
    const cx = Math.min(coarse.w - 1, Math.max(0, (x / f) | 0));
    const cy = Math.min(coarse.h - 1, Math.max(0, (y / f) | 0));
    const i = cy * coarse.w + cx;
    return coarse.lab[i] === l ? geod[i] : -1;
  };
  let fallback = 0;
  for (let i = 0; i < stitches.count; i++) {
    const l = stitches.label[i];
    const mx = (stitches.x0[i] + stitches.x1[i]) * 0.5;
    const my = (stitches.y0[i] + stitches.y1[i]) * 0.5;
    let d = lookup(mx, my, l);
    if (d < 0) d = lookup(stitches.x0[i], stitches.y0[i], l);
    if (d < 0) d = lookup(stitches.x1[i], stitches.y1[i], l);
    if (d < 0) d = fallback;
    else fallback = d;
    // fuzz lands a moment after the stitches around it
    if (stitches.kind[i] === KIND_FUZZ) d += 6;
    // a digitiser lays the whole underlay of an element first, then the top
    const top = stitches.kind[i] === KIND_UNDER ? 0 : span / 2;
    stitches.key[i] = (rank.get(l) ?? 0) * span + top + d;
  }
  if (inp.ring && inp.ringLabel) {
    const before = stitches.count;
    const runW = dsep * 1.7;
    stitches = addRunningRing(
      stitches,
      inp.ring.cx,
      inp.ring.cy,
      inp.ring.r,
      dsep * 5.5,
      dsep * 3.2,
      runW,
      inp.ringLabel,
      seed,
    );
    const r = (rank.get(inp.ringLabel) ?? 0) * span;
    for (let i = before; i < stitches.count; i++) stitches.key[i] = r + stitches.key[i] * 1000;
  }
  stitches = orderStitches(stitches);
  if (!(await step())) return null;

  const reliefR = Math.max(1, Math.min(10, Math.round((strokeW * 0.32) / f)));
  const rel = makeRelief(coarse, reliefR, reliefR * 1.5);
  // keep a little relief smoothing so the padding never shows grid steps
  rel.gx = boxBlur(rel.gx, rel.w, rel.h, 1, 1);
  rel.gy = boxBlur(rel.gy, rel.w, rel.h, 1, 1);
  return { key, W, H, stitches, relief: rel, dsep, empty: false };
}

/** The typed arrays of a result, for a zero-copy postMessage. */
export function geometryTransfer(g: GeometryResult): Transferable[] {
  const s = g.stitches;
  const t: ArrayBuffer[] = [s.x0, s.y0, s.x1, s.y1, s.w, s.j, s.label, s.kind, s.key].map(
    (a) => a.buffer as ArrayBuffer,
  );
  if (g.relief) t.push(g.relief.gx.buffer as ArrayBuffer, g.relief.gy.buffer as ArrayBuffer);
  return t;
}
