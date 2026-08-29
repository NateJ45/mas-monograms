// =============================================================================
// page-fields - which lines the in-canvas card may edit (2026-08-28, card 28)
// =============================================================================
// The in-canvas control layer is the floating card that hovers over a line in
// the Presentation preview and lets Mary Ann type the words where the words
// are, instead of clicking them, watching the editor panel scroll to the right
// box, and typing while looking away from the thing she is changing.
//
// Before it draws anything it has to answer one question: IS THIS LINE ONE WE
// MAY EDIT? The overlay cannot ask the Studio, because it runs inside the
// preview iframe in the site's own bundle while the schema lives in the parent
// window. So the answer is a REGISTRY, here, and the registry is kept honest by
// src/lib/page-fields.test.ts, which reads the page schemas and the preview
// route and FAILS when a page gains or loses one of these fields without this
// file being updated.
//
// -----------------------------------------------------------------------------
// WHAT THIS SITE ACTUALLY HAS, AND WHAT IT DOES NOT
// -----------------------------------------------------------------------------
// The sister sites in this family (presacademy, West Chester Preschool) give
// their in-canvas layer three controls: a band-colour card, a pick-a-word
// accent picker, and a text card. Two of those three have nothing to stand on
// here, and pretending otherwise would put knobs on the page that change
// nothing:
//
//   NO BAND COLOUR. No page schema on this site carries a background, tone or
//   surface field. Every band colour is written into the Astro components
//   (CtaBanner's indigo drench, the Linen and Sage alternation), which is the
//   brand lock working as designed. Giving an editor a colour here would be a
//   design decision, not a control, and it belongs to whoever takes the
//   appearance-controls card.
//
//   NO ACCENT-WORD PICKER. `splitScriptAccent` (src/lib/scriptAccent.ts) and
//   SectionHeading's `.font-script` branch exist, but NO Sanity field feeds
//   them: Hero.astro has no `scriptAccent` prop, so no page can pass one. The
//   one live heading flourish is `heroItalicWord`, and it is not a word picked
//   out of the headline - Hero APPENDS it in italics after the headline. A
//   pick-a-word control would therefore be a lie about what the renderer does,
//   so `heroItalicWord` gets a plain text card like any other line.
//
// What is left is the text card, on the lines the preview surface really
// renders. That is a small result, and it is the honest one.
//
// -----------------------------------------------------------------------------
// WHY THESE FIELD NAMES AND NO OTHERS
// -----------------------------------------------------------------------------
// Every page here is a fixed-field singleton, so a line is a TOP-LEVEL FIELD on
// the page document and the studio path is just its name. Three rules decided
// the list:
//
//   1. The field must be declared by at least one REGISTERED page singleton.
//      `finalCtaHeadline`, which the preview route coalesces, is declared by no
//      registered schema, so it is not here.
//   2. The preview route must RENDER it. `ctaEyebrow` is a real field that the
//      live CtaBanner draws, but the preview's closing band leaves it out, so
//      there is no element for a card to hang on. Add it here on the day the
//      preview band grows an eyebrow.
//   3. `onTypes` lists the page types that declare it, and the card checks the
//      document's own `_type` against that list. Carrying the field is a
//      per-TYPE fact; `heroItalicWord` is on the home page only, and offering
//      it anywhere else would write a field that page has no box for.
// =============================================================================

// Explicit `.ts` extensions: the test command is bare Node
// (`node --experimental-strip-types --test`), which resolves neither the `@/`
// alias nor an extensionless specifier. Vite reads these happily either way.
import { plain } from './nav-href.ts';
import { parseSanityPath, type PathSegment } from './sanity-path.ts';

/** Every page singleton the Studio registers, in registration order. */
export const PAGE_TYPES: readonly string[] = [
  'homePage',
  'howItWorksPage',
  'pricingPage',
  'aboutPage',
  'requestAQuotePage',
  'shopIndexPage',
  'styleGalleryPage',
  'fontGuidePage',
  'threadChartPage',
  'clearancePage',
  'thankYouPage',
  'notFoundPage',
];

/** The ten pages that carry the shared `hero*` set. */
const HERO_PAGES: readonly string[] = [
  'homePage',
  'howItWorksPage',
  'pricingPage',
  'aboutPage',
  'requestAQuotePage',
  'shopIndexPage',
  'styleGalleryPage',
  'fontGuidePage',
  'threadChartPage',
  'clearancePage',
];

/** The nine pages that carry the shared closing-banner set. */
const BANNER_PAGES: readonly string[] = [
  'homePage',
  'howItWorksPage',
  'pricingPage',
  'aboutPage',
  'shopIndexPage',
  'styleGalleryPage',
  'fontGuidePage',
  'threadChartPage',
  'clearancePage',
];

/** One line the card may edit. */
export interface EditableLine {
  /** The field name, exactly as the schema declares it. */
  name: string;
  /**
   * What the card calls it. Plain words, and the Studio's own wording wherever
   * the Studio has some, so the box in the canvas and the box in the editor
   * panel read the same.
   */
  label: string;
  /** Rows in the box. A headline needs two; a button label needs one. */
  rows: number;
  /** The page types that declare this field. */
  onTypes: readonly string[];
}

/**
 * The registry, in the order the preview surface draws them: the hero from the
 * top down, then the closing banner.
 */
export const EDITABLE_LINES: readonly EditableLine[] = [
  { name: 'heroEyebrow', label: 'Small label above the heading', rows: 1, onTypes: HERO_PAGES },
  { name: 'eyebrow', label: 'Small label above the heading', rows: 1, onTypes: ['thankYouPage'] },
  { name: 'heroHeadline', label: 'Headline', rows: 2, onTypes: HERO_PAGES },
  { name: 'headline', label: 'Headline', rows: 2, onTypes: ['thankYouPage', 'notFoundPage'] },
  { name: 'heroItalicWord', label: 'Word to slant (italic)', rows: 1, onTypes: ['homePage'] },
  {
    name: 'heroSubhead',
    label: 'Short line under the heading',
    rows: 3,
    onTypes: HERO_PAGES,
  },
  { name: 'ctaHeadline', label: 'Banner headline', rows: 2, onTypes: BANNER_PAGES },
  { name: 'ctaSubhead', label: 'Banner text', rows: 3, onTypes: BANNER_PAGES },
  {
    name: 'ctaLabel',
    label: 'Button text',
    rows: 1,
    onTypes: [...BANNER_PAGES, 'thankYouPage'],
  },
];

/** The registry, by field name. */
const BY_NAME: Readonly<Record<string, EditableLine>> = Object.fromEntries(
  EDITABLE_LINES.map((line) => [line.name, line]),
);

/**
 * The visible half of a preview string.
 *
 * A preview page carries invisible stega markers on every string, which is what
 * makes click-to-edit work. They must come OFF before the text reaches the box:
 * a value saved with a marker still inside it would store the marker, and the
 * next preview would encode a second one on top of it.
 */
export function cleanLine(value: unknown): string {
  return plain(typeof value === 'string' ? value : '');
}

// -----------------------------------------------------------------------------
// What the in-canvas layer offers on a given element
// -----------------------------------------------------------------------------
// The overlay resolver runs SYNCHRONOUSLY, the instant an element is pointed
// at, and all it holds is the element's path. That is enough to decide which
// control is even a CANDIDATE. The card then confirms against the document's
// real `_type` once the snapshot arrives, and renders nothing if the answer is
// no. Two gates, in that order, because the cheap one runs on every hover and
// the accurate one costs a read.

/** The controls this layer can put on one element. Exactly one, so far. */
export type OverlayControl = 'text';

/**
 * Which control a path is a candidate for. An empty list means the element gets
 * nothing and the host's own overlay is left exactly as it was.
 *
 * A path with more than one segment is never offered. Every line here is a
 * top-level field on the page document; anything deeper is an array item, and
 * the preview draws those as a plain list rather than as the real page, so a
 * card there would promise an edit against markup the live site never renders.
 */
export function overlayControlsForPath(path?: string | null): OverlayControl[] {
  const segments = parseSanityPath(path);
  if (segments.length !== 1) return [];
  const name = segments[0];
  if (typeof name !== 'string') return [];
  return BY_NAME[name] ? ['text'] : [];
}

/** The resolved subject of the text card. */
export interface TextTarget {
  /** Where the value is written. */
  path: PathSegment[];
  /** The current value, with its stega markers removed. */
  text: string;
  /** The field's name as the card shows it. */
  label: string;
  /** Rows for the box. */
  rows: number;
}

/**
 * Work out what a pointed-at element edits, from the path it carries and the
 * document as it currently stands. Returns null for anything the card does not
 * offer, which is what makes the pencil disappear rather than write somewhere
 * unexpected.
 */
export function resolveTextTarget(
  doc: Record<string, unknown> | null | undefined,
  path?: string | null,
): TextTarget | null {
  if (!doc) return null;
  const segments = parseSanityPath(path);
  if (segments.length !== 1) return null;
  const name = segments[0];
  if (typeof name !== 'string') return null;

  const line = BY_NAME[name];
  if (!line) return null;

  // PER INSTANCE, not per field name. `heroItalicWord` is declared by the home
  // page alone: on any other page there is no box for it, and a card that wrote
  // one would put a value in a document the Studio form cannot show.
  const type = typeof doc._type === 'string' ? doc._type : '';
  if (!line.onTypes.includes(type)) return null;

  return { path: [name], text: cleanLine(doc[name]), label: line.label, rows: line.rows };
}
