// Safe to edit by hand
// =============================================================================
// QR codes: does the seal fit in the middle?
// =============================================================================
// A logo in the middle of a QR code works by DESTROYING the squares under it
// and trusting the error correction to rebuild them. Error correction H can
// rebuild about 30% of the code's data. To leave room for wear, glare and a
// slightly blurry photo, the hole here is capped at 15% of the code's area
// (under the ~18% ceiling the spec allows), and only ever made with H.
//
// The hole is a circle (the seal is round) centred on the code: every square
// whose centre falls inside it is cleared to the background colour, then the
// seal is drawn one square smaller all round, so there is a clear ring between
// the seal and the code. The circle never reaches the three big corner squares
// (the finder patterns) or the timing rows beside them.
//
// The seal is offered (switched on by default) only when the hole is at least
// MIN_LOGO_MODULES squares across: smaller than that, the seal is too small to
// read and only costs scanning margin.
// =============================================================================

import type { QrMatrix } from './encode.ts';

/** Largest share of the code's area the hole may clear. */
export const MAX_LOGO_AREA = 0.15;
/** Smallest hole (in squares across) worth drawing a seal in. */
export const MIN_LOGO_MODULES = 7;

export interface LogoFit {
  /** True when the seal can go in the middle of this code. */
  fits: boolean;
  /** Why not, in a word for the tests (never shown to Mary Ann). */
  reason?: 'error-correction' | 'too-small';
  /** Hole diameter, in squares. */
  diameter: number;
  /** Seal diameter, in squares (the hole less a one-square clear ring). */
  sealDiameter: number;
  /** Centre of the code, in squares from the top-left corner. */
  centre: number;
  /** Share of all squares cleared, 0 to 1. */
  areaFraction: number;
}

/** Is the square at (row, col) inside a centred hole of this diameter? */
export function inHole(size: number, diameter: number, row: number, col: number): boolean {
  if (diameter <= 0) return false;
  const c = size / 2;
  const dx = col + 0.5 - c;
  const dy = row + 0.5 - c;
  return dx * dx + dy * dy <= (diameter / 2) ** 2;
}

/** How many squares a centred hole of this diameter clears. */
export function holeCount(size: number, diameter: number): number {
  let n = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (inHole(size, diameter, r, c)) n++;
  return n;
}

/** The biggest seal that fits this code, if any. */
export function logoFit(qr: Pick<QrMatrix, 'size' | 'errorCorrection'>): LogoFit {
  const { size } = qr;
  const centre = size / 2;
  const none = (reason: LogoFit['reason']): LogoFit => ({
    fits: false,
    reason,
    diameter: 0,
    sealDiameter: 0,
    centre,
    areaFraction: 0,
  });
  if (qr.errorCorrection !== 'H') return none('error-correction');

  // Keep clear of the corner squares (7 wide plus a 1-square separator) and
  // the timing row/column at index 6 on each side.
  const maxByLayout = size - 2 * 8 - 2;
  const total = size * size;
  let best = 0;
  for (let d = 1; d <= maxByLayout; d++) {
    if (holeCount(size, d) / total > MAX_LOGO_AREA) break;
    best = d;
  }
  if (best < MIN_LOGO_MODULES) return { ...none('too-small'), diameter: best };
  return {
    fits: true,
    diameter: best,
    sealDiameter: best - 2,
    centre,
    areaFraction: holeCount(size, best) / total,
  };
}
