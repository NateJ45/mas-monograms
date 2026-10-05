// Foundation, edit with care
// =============================================================================
// Studio theme: "Heirloom Coast" colours and Mary Ann's larger, calmer type
// =============================================================================
// Pure data and one pure function, so `npm run test:unit` can check the colour
// contrast with real maths (src/lib/studio-theme.test.ts) without loading
// Sanity. sanity.config.ts feeds these to buildLegacyTheme() and then to
// readableFonts().
//
// WHY buildLegacyTheme, not buildTheme (kept across the Sanity 6 upgrade):
// Mary Ann is a non-technical editor who has used this Heirloom Coast Studio
// since 2026-07, the whole site is a no-dark-mode brand by decision, and stock
// Sanity grey buys a dark mode nobody asked for. The legacy builder is
// light-only; see the sanity.config.ts header for the trade.
//
// WHY THE TYPE IS BIGGER (2026-10-05, Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md, principle 3): Sanity's
// interface text is 13px in lists and 15px in boxes, which is small for an
// older editor. readableFonts() scales the text and label ramps by 1.2, so
// list rows read at about 16px and the boxes she types in at 18px, and the
// headings by 1.1. The legacy theme hands its `fonts` straight to the
// ThemeProvider (sanity's getThemeValues), so scaling the ramp here is the
// supported lever, not a CSS override. The interface uses the system sans
// (fbcm learned on 2026-09-22 that a serif at Studio sizes is hard to read);
// the pane headings alone use a serif, via ToolHeading.
// =============================================================================

/** The Heirloom Coast palette, mirroring src/styles/globals.css. */
export const HEIRLOOM = {
  ink: '#26312E', // Heirloom Ink: darkest text
  paper: '#FBF8F1', // Paper: lightest surface
  linen: '#F4EEE3', // Linen: card and panel backgrounds
  taupe: '#5A5148', // Secondary Taupe: the warm neutral ramp
  indigo: '#28486B', // Heritage Indigo: links, selections, the navbar
  claret: '#8C3A2E', // Claret: the Publish button (the site's call to action)
  success: '#3F7A4B',
  brass: '#B98A3E', // decorative only, never text
  brassText: '#835A24', // Brass for text (AA-safe)
  danger: '#B3261E',
} as const;

/** The system sans the whole interface uses. */
export const SANS_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** buildLegacyTheme's CSS-variable input. */
export const STUDIO_THEME_PROPS: Record<string, string> = {
  '--black': HEIRLOOM.ink,
  '--white': HEIRLOOM.paper,
  '--gray-base': HEIRLOOM.taupe, // the grey ramp leans warm, not cold

  '--brand-primary': HEIRLOOM.indigo,
  '--brand-primary--inverted': HEIRLOOM.paper,
  '--focus-color': HEIRLOOM.indigo,

  '--input-bg': HEIRLOOM.paper,
  '--component-bg': HEIRLOOM.linen,
  '--component-text-color': HEIRLOOM.ink,

  '--default-button-color': HEIRLOOM.taupe,
  '--default-button-primary-color': HEIRLOOM.claret,
  '--default-button-success-color': HEIRLOOM.success,
  '--default-button-warning-color': HEIRLOOM.brass,
  '--default-button-danger-color': HEIRLOOM.danger,

  '--state-success-color': HEIRLOOM.success,
  '--state-warning-color': HEIRLOOM.brassText,
  '--state-danger-color': HEIRLOOM.danger,

  '--main-navigation-color': HEIRLOOM.indigo, // echoes the live site header band
  '--main-navigation-color--inverted': HEIRLOOM.paper,

  // The interface face: the system sans (see the header).
  '--font-family-base': SANS_STACK,
};

/**
 * The serif for pane headings only. The site's Fraunces is not loaded in the
 * Studio (no font request, no CSP grant needed), so this is the closest calm
 * book serif every computer already has.
 */
export const HEADING_STACK = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

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
  [key: string]: unknown;
}
interface Fonts {
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

/** Text and labels 1.2x, headings 1.1x; the interface stays in the system sans. */
export const TEXT_SCALE = 1.2;
export const HEADING_SCALE = 1.1;

/** A theme whose fonts are Mary Ann's larger, calmer ramp. Never mutates its input. */
export function readableFonts<T extends { fonts?: unknown }>(theme: T): T {
  // Typed loosely on the way in: Sanity's StudioTheme types its fonts as a
  // readonly @sanity/ui ThemeFonts, which this shape matches at runtime.
  const fonts = theme.fonts as Fonts;
  const ramp = (r: FontRamp, k: number, family?: string): FontRamp => ({
    ...r,
    ...(family ? { family } : {}),
    sizes: r.sizes.map((s) => scaleSize(s, k)),
  });
  return {
    ...theme,
    fonts: {
      ...fonts,
      text: ramp(fonts.text, TEXT_SCALE, SANS_STACK),
      label: ramp(fonts.label, TEXT_SCALE, SANS_STACK),
      heading: ramp(fonts.heading, HEADING_SCALE, SANS_STACK),
    },
  } as T;
}
