// Safe to edit by hand
// =============================================================================
// QR codes: text -> a grid of dark and light squares
// =============================================================================
// The encoder is `qrcode-generator` (Kazuhiko Arase, MIT, zero dependencies,
// about 7.5 KB gzipped once bundled), run entirely in the browser: no network,
// no outside QR service. This file only wraps it in a plain matrix so the rest
// of the code (logo fit, SVG, the tests) never touches the library.
//
// Error correction defaults to H, the highest level: about 30% of the code can
// be covered or worn and it still reads. That is what lets the seal sit in the
// middle, and it forgives a smudged tag or a crumpled card.
// =============================================================================

import qrcode from 'qrcode-generator';

export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrMatrix {
  /** The QR version, 1 to 40 (bigger = more squares). */
  version: number;
  /** Squares per side (17 + 4 x version). */
  size: number;
  errorCorrection: ErrorCorrection;
  /** modules[row][col]: true = dark. */
  modules: boolean[][];
}

/** Encode plain ASCII text (a web address) as a QR matrix. */
export function encodeQr(text: string, errorCorrection: ErrorCorrection = 'H'): QrMatrix {
  if (!text) throw new Error('Nothing to encode');
  // The library's default byte conversion keeps only the low 8 bits of each
  // character, so anything outside ASCII would be silently garbled. Web
  // addresses from qrLink() are always ASCII; refuse anything else.
  if (!/^[\x20-\x7e]+$/.test(text)) throw new Error('Only plain ASCII text can be encoded');
  const qr = qrcode(0, errorCorrection);
  qr.addData(text, 'Byte');
  qr.make();
  const size = qr.getModuleCount();
  const modules: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) row.push(qr.isDark(r, c));
    modules.push(row);
  }
  return { version: (size - 17) / 4, size, errorCorrection, modules };
}
