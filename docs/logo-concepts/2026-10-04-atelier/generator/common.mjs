// Shared drawing pieces for the four concepts: gradients, satin texture, weave, running stitches.
import { C, r } from './lib.mjs';

export const svgOpen = (w, h, title, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" role="img" aria-label="${title}"${extra}>`;

// Thread-gold gradient (gold-deep, gold, gold-light, gold, gold-deep), as --thread-gold.
export const goldGrad = (
  id,
  angle = 90,
) => `<linearGradient id="${id}" gradientTransform="rotate(${angle} .5 .5)">
  <stop offset="0" stop-color="${C.goldDeep}"/><stop offset=".28" stop-color="${C.gold}"/><stop offset=".5" stop-color="${C.goldLight}"/><stop offset=".72" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDeep}"/></linearGradient>`;

// Satin stitch: parallel thread lines (a highlight and a shadow per pitch), rotated.
export const satin = (
  id,
  { pitch = 3.2, angle = -52, hi = 0.28, lo = 0.2, light = '#fff', dark = '#000' } = {},
) =>
  `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${pitch}" height="${pitch}" patternTransform="rotate(${angle})">` +
  `<rect width="${pitch}" height="${r(pitch * 0.34)}" fill="${light}" fill-opacity="${hi}"/>` +
  `<rect y="${r(pitch * 0.62)}" width="${pitch}" height="${r(pitch * 0.2)}" fill="${dark}" fill-opacity="${lo}"/></pattern>`;

// A circle of running stitches.
export const stitchCircle = (
  cx,
  cy,
  rad,
  { dash = 7, gap = 5, w = 1.6, color = 'currentColor', cap = 'round' } = {},
) => {
  // Snap the dash pattern so it closes cleanly around the circumference.
  const circ = 2 * Math.PI * rad;
  const n = Math.round(circ / (dash + gap));
  const k = circ / (n * (dash + gap));
  return `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${r(dash * k)} ${r(gap * k)}" stroke-linecap="${cap}"/>`;
};

export const C2 = C;

// A tapered "thread" stroke: sample a chain of cubic beziers into a polyline, then offset
// each point along its normal by half the width at that point (w(t), t in 0..1 over the
// whole chain), giving a filled calligraphic outline.
export function taper(segs, w, n = 240) {
  // segs: [[x0,y0,x1,y1,x2,y2,x3,y3], ...]
  const pts = [];
  segs.forEach((s, si) => {
    const steps = Math.ceil(n / segs.length);
    for (let i = si === 0 ? 0 : 1; i <= steps; i++) {
      const t = i / steps,
        u = 1 - t;
      const x = u * u * u * s[0] + 3 * u * u * t * s[2] + 3 * u * t * t * s[4] + t * t * t * s[6];
      const y = u * u * u * s[1] + 3 * u * u * t * s[3] + 3 * u * t * t * s[5] + t * t * t * s[7];
      pts.push([x, y]);
    }
  });
  // arc length parameter
  const L = [0];
  for (let i = 1; i < pts.length; i++)
    L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = L[L.length - 1];
  const left = [],
    right = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)],
      b = pts[Math.min(pts.length - 1, i + 1)];
    let nx = -(b[1] - a[1]),
      ny = b[0] - a[0];
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl;
    ny /= nl;
    const hw = w(L[i] / total) / 2;
    left.push([pts[i][0] + nx * hw, pts[i][1] + ny * hw]);
    right.push([pts[i][0] - nx * hw, pts[i][1] - ny * hw]);
  }
  const f = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  const ring = [...left, ...right.reverse()];
  return 'M ' + ring.map(f).join(' L ') + ' Z';
}
