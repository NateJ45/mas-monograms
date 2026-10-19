// Foundation, edit with care
// =============================================================================
// Mary Ann's Studio: the Heirloom Coast colours her own panes use, and her
// larger, calmer type
// =============================================================================
// Since 2026-10-18 the Studio's theme is the shared kit's (src/sanity/
// studioTheme.ts, starter PORTS.md cards 110 and 116): the brand accent and a
// warm paper from brand/brand.config.json, the Midnight top bar, the site's
// Fraunces and Mulish. It replaced the old buildLegacyTheme() here, which was
// light-only and could not take the brand fonts.
//
// Two things stay this site's own, and live in this file:
//
//   1. HEIRLOOM, the palette her own panes (the Site Guide's handbook, the QR
//      tool, the brand kit) paint with. Pure data, mirroring
//      src/styles/globals.css; contrast-checked in src/lib/studio-readable.test.ts.
//
//   2. THE BIGGER TYPE (2026-10-05, Phase A of
//      docs/superpowers/specs/2026-10-05-studio-direction.md, principle 3).
//      Sanity's interface text is 13px in lists and 15px in boxes, which is
//      small for an older editor. readableFontConfig() scales the text and
//      label ramps by 1.2 (list rows about 16px, the boxes she types in 18px)
//      and the headings by 1.1. @sanity/ui 4 bakes its CSS from the font config
//      at build time, so the scale goes INTO buildTheme({ font }) here, never
//      as a patch on a built theme (a patch is ignored): readableTheme.ts
//      builds it. The navbar keeps the kit's unscaled chrome theme.
//
// Pure data and pure functions, so src/lib/studio-readable.test.ts can load
// this file without Sanity.
// =============================================================================

import type { StudioFonts } from './studioTheme';

/** The Heirloom Coast palette, mirroring src/styles/globals.css. */
export const HEIRLOOM = {
  ink: '#26312E', // Heirloom Ink: darkest text
  paper: '#FBF8F1', // Paper: lightest surface
  linen: '#F4EEE3', // Linen: card and panel backgrounds
  taupe: '#5A5148', // Secondary Taupe: the warm neutral ramp
  indigo: '#28486B', // Heritage Indigo: links, selections
  claret: '#8C3A2E', // Claret: the site's call to action
  success: '#3F7A4B',
  brass: '#B98A3E', // decorative only, never text
  brassText: '#835A24', // Brass for text (AA-safe)
  danger: '#B3261E',
} as const;

/**
 * The serif for her panes' headings: the site's own Fraunces (loaded in the
 * Studio by src/sanity/studioFonts.css since card 116), then calm book serifs
 * every computer has.
 */
export const HEADING_STACK =
  '"Fraunces Variable", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

interface FontSize {
  fontSize: number;
  lineHeight: number;
  ascenderHeight: number;
  descenderHeight: number;
  iconSize: number;
  letterSpacing?: number;
}
interface FontRamp {
  family: string;
  sizes: FontSize[];
  weights?: Record<string, number>;
  [key: string]: unknown;
}
interface FontConfig {
  text: FontRamp;
  label: FontRamp;
  heading: FontRamp;
  [key: string]: unknown;
}

/** One size step, scaled and rounded to the half pixel. */
export function scaleSize(size: FontSize, k: number): FontSize {
  const r = (n: number) => Math.round(n * k * 2) / 2;
  return {
    ...size,
    fontSize: r(size.fontSize),
    lineHeight: r(size.lineHeight),
    ascenderHeight: r(size.ascenderHeight),
    descenderHeight: r(size.descenderHeight),
    iconSize: r(size.iconSize),
  };
}

/** Text and labels 1.2x, headings 1.1x. */
export const TEXT_SCALE = 1.2;
export const HEADING_SCALE = 1.1;

/**
 * @sanity/ui's font config with Mary Ann's larger ramp and the brand's two
 * families. `headingWeight` caps the heading weights at what the display face
 * ships (null: a variable font, every weight exists). Never mutates its input.
 */
export function readableFontConfig<T extends FontConfig>(
  font: T,
  fonts: StudioFonts,
  headingWeight: number | null = null,
): T {
  const ramp = (r: FontRamp, k: number, family: string): FontRamp => ({
    ...r,
    family,
    sizes: r.sizes.map((s) => scaleSize(s, k)),
  });
  const heading = ramp(font.heading, HEADING_SCALE, fonts.display);
  if (headingWeight && heading.weights) {
    heading.weights = Object.fromEntries(
      Object.entries(heading.weights).map(([k, w]) => [k, Math.min(w, headingWeight)]),
    );
  }
  return {
    ...font,
    text: ramp(font.text, TEXT_SCALE, fonts.body),
    label: ramp(font.label, TEXT_SCALE, fonts.body),
    heading,
  };
}
