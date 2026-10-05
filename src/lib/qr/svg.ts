// Safe to edit by hand
// =============================================================================
// QR codes: the matrix -> one print-ready SVG string
// =============================================================================
// Pure string building, no DOM, so the same function feeds the Studio preview,
// the SVG download, the PNG download (drawn onto a canvas) and the print page,
// and the unit tests check exactly what Mary Ann downloads.
//
// Layout, in "squares" (one QR module = 1 unit):
//   [ quiet zone | code | quiet zone ]   a blank border all round (never inked)
//   [ label ]                            optional words below the border
//
// Colours are Midnight on white or Linen, and it never inverts: phones read a
// dark code on a light ground most reliably, and some cannot read the reverse
// at all. qrColoursOk() is the contrast check the tests hold every pairing to.
// =============================================================================

import { contrastRatio, hexToRgb, relativeLuminance } from '../contrast.ts';
import type { QrMatrix } from './encode.ts';
import { inHole, type LogoFit } from './logo.ts';

/** The brand colours a QR code may use (DESIGN.md: Midnight, Linen). */
export const QR_COLOURS = {
  midnight: '#0F1B2D',
  white: '#FFFFFF',
  linen: '#F4EEE3',
} as const;

export type QrBackground = 'white' | 'linen';

/** The minimum contrast between code and ground (well above WCAG AAA's 7:1 for text). */
export const MIN_QR_CONTRAST = 7;

/** A code colour on a ground colour is safe to scan: dark on light, strong contrast. */
export function qrColoursOk(fg: string, bg: string): boolean {
  const darkOnLight = relativeLuminance(hexToRgb(fg)) < relativeLuminance(hexToRgb(bg));
  return darkOnLight && contrastRatio(fg, bg) >= MIN_QR_CONTRAST;
}

/** The face for the label. A downloaded SVG uses whatever the computer has. */
export const LABEL_FONT = 'Mulish, "Segoe UI", Arial, Helvetica, sans-serif';

/** Escape text for an SVG text node or attribute. */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface QrSvgOptions {
  qr: QrMatrix;
  /** Blank border, in squares. */
  quietZone: number;
  background?: QrBackground;
  /** Words under the code. Empty or missing = no label. */
  label?: string;
  /** The seal: its SVG markup (any viewBox) and where it fits. */
  seal?: { svg: string; fit: LogoFit } | null;
  /** Physical width of the whole image, for print. */
  widthInches?: number;
  /** Pixel width of the whole image, for drawing onto a canvas. */
  widthPx?: number;
  /** Accessible name. */
  title?: string;
}

export interface QrSvg {
  svg: string;
  /** viewBox size in squares. */
  width: number;
  height: number;
  /** Squares cleared for the seal (0 without one). */
  cleared: number;
}

/** Round to 3 decimals, for tidy numbers in the markup. */
const n3 = (n: number) => String(Math.round(n * 1000) / 1000);

/** Font size and band height for a label, so it fits the width on one line. */
export function labelMetrics(label: string, width: number): { fontSize: number; band: number } {
  // About 0.56 em per character for a sans at weight 600.
  const byWidth = (width * 0.92) / Math.max(1, label.length * 0.56);
  const fontSize = Math.min(width * 0.085, byWidth);
  return { fontSize, band: fontSize * 1.7 };
}

export function buildQrSvg(o: QrSvgOptions): QrSvg {
  const { qr, quietZone: q } = o;
  const fg = QR_COLOURS.midnight;
  const bg = QR_COLOURS[o.background ?? 'white'];
  if (!qrColoursOk(fg, bg)) throw new Error(`Unsafe QR colours ${fg} on ${bg}`);

  const n = qr.size;
  const width = n + 2 * q;
  const label = (o.label ?? '').trim();
  const lm = label ? labelMetrics(label, width) : null;
  const height = width + (lm ? lm.band : 0);
  const hole = o.seal?.fit.fits ? o.seal.fit.diameter : 0;

  // Dark squares as one path: a run of dark squares in a row is one rectangle.
  let d = '';
  let cleared = 0;
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (hole && inHole(n, hole, r, c)) {
        cleared++;
        c++;
        continue;
      }
      if (!qr.modules[r][c]) {
        c++;
        continue;
      }
      let len = 0;
      while (c + len < n && qr.modules[r][c + len] && !(hole && inHole(n, hole, r, c + len))) len++;
      d += `M${c + q} ${r + q}h${len}v1h-${len}z`;
      c += len;
    }
  }

  const size =
    o.widthInches != null
      ? ` width="${n3(o.widthInches)}in" height="${n3((o.widthInches * height) / width)}in"`
      : o.widthPx != null
        ? ` width="${Math.round(o.widthPx)}" height="${Math.round((o.widthPx * height) / width)}"`
        : '';
  const title = o.title ? `<title>${escapeXml(o.title)}</title>` : '';

  let seal = '';
  if (hole && o.seal) {
    const cx = q + n / 2;
    const s = o.seal.fit.sealDiameter;
    // Re-root the seal's own <svg> as a nested, positioned one.
    const inner = o.seal.svg
      .replace(
        /^\s*<svg\b/,
        `<svg x="${n3(cx - s / 2)}" y="${n3(cx - s / 2)}" width="${n3(s)}" height="${n3(s)}"`,
      )
      .replace(/\s(role|aria-label)="[^"]*"/g, '');
    seal = `<circle cx="${n3(cx)}" cy="${n3(cx)}" r="${n3(hole / 2)}" fill="${bg}"/>${inner}`;
  }

  const text = lm
    ? `<text x="${n3(width / 2)}" y="${n3(width + lm.fontSize * 0.95)}" text-anchor="middle" font-family="${escapeXml(
        LABEL_FONT,
      )}" font-weight="600" font-size="${n3(lm.fontSize)}" fill="${fg}">${escapeXml(label)}</text>`
    : '';

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n3(width)} ${n3(height)}"${size} role="img">` +
    title +
    `<rect width="${n3(width)}" height="${n3(height)}" fill="${bg}"/>` +
    `<path d="${d}" fill="${fg}" shape-rendering="crispEdges"/>` +
    seal +
    text +
    '</svg>';
  return { svg, width, height, cleared };
}
