// Safe to edit by hand
// Deterministic ids for SVG <defs> (gradients, clip paths) inside the motif
// components. A module-level counter instead of Math.random() so two builds of
// the same page emit the same markup (render-parity baselines stay stable).
let counter = 0;

export function motifId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}${counter.toString(36)}`;
}
