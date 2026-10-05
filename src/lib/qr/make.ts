// Safe to edit by hand
// =============================================================================
// QR codes: the whole recipe in one call (what the Studio tool runs)
// =============================================================================
// destination + placement + her choices -> the tagged link, the matrix, whether
// the seal fits, the SVG and the print size. The Studio tool
// (src/sanity/components/QrCodeTool.tsx) only adds buttons around this, and
// src/lib/qr/qr.test.ts runs it for every destination and placement.
// =============================================================================

import { destinationUrl, type DestinationId, type OutsideLinks } from './destinations.ts';
import { encodeQr, type QrMatrix } from './encode.ts';
import { logoFit, type LogoFit } from './logo.ts';
import { PLACEMENTS, printInchesFor, type PlacementId } from './placements.ts';
import { buildQrSvg, type QrBackground } from './svg.ts';
import { qrLink } from './url.ts';

export interface MakeQrInput {
  destination: DestinationId;
  placement: PlacementId;
  links?: OutsideLinks;
  /** Batch name for the link; empty = this month. */
  campaign?: string;
  label?: string;
  /** Ask for the seal. It is only drawn when it fits (see logo.ts). */
  seal?: boolean;
  /** The seal's SVG markup (src/lib/brand/brandSvg.js sealSvg). */
  sealSvg?: string;
  background?: QrBackground;
  now?: Date;
}

export interface MadeQr {
  link: string;
  matrix: QrMatrix;
  fit: LogoFit;
  /** The seal is actually drawn. */
  sealShown: boolean;
  printInches: number;
  /** The SVG with no physical size (scales to its box). */
  svg: string;
  /** The same SVG with its print size in inches set, for downloads and print. */
  printSvg: string;
  /** Pixel width for the PNG download: 300 dots per inch at print size, at least 1200. */
  pngWidth: number;
  /** The SVG sized in pixels, for drawing onto a canvas. */
  pngSvg: string;
}

/** Smallest PNG width, so even a hang-tag code prints crisply. */
export const MIN_PNG_WIDTH = 1200;

/** Null when the destination needs an address she has not given yet. */
export function makeQr(input: MakeQrInput): MadeQr | null {
  const target = destinationUrl(input.destination, input.links);
  if (!target) return null;
  const placement = PLACEMENTS[input.placement];
  const link = qrLink(target, {
    medium: placement.medium,
    campaign: input.campaign,
    now: input.now,
  });
  const matrix = encodeQr(link, 'H');
  const fit = logoFit(matrix);
  const sealShown = Boolean(input.seal && input.sealSvg && fit.fits);
  const seal = sealShown ? { svg: input.sealSvg!, fit } : null;
  const printInches = printInchesFor(placement, matrix.size);
  const base = {
    qr: matrix,
    quietZone: placement.quietZone,
    background: input.background,
    label: input.label,
    seal,
    title: input.label || 'QR code',
  };
  // The print size is for the code itself; the whole image is wider by the
  // blank border on each side.
  const totalInches = (printInches * (matrix.size + 2 * placement.quietZone)) / matrix.size;
  const pngWidth = Math.max(MIN_PNG_WIDTH, Math.round(totalInches * 300));
  return {
    link,
    matrix,
    fit,
    sealShown,
    printInches,
    svg: buildQrSvg(base).svg,
    printSvg: buildQrSvg({ ...base, widthInches: totalInches }).svg,
    pngWidth,
    pngSvg: buildQrSvg({ ...base, widthPx: pngWidth }).svg,
  };
}
