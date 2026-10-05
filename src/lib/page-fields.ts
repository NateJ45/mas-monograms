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
// What is left is the text card, on every line of words the real pages render.
//
// -----------------------------------------------------------------------------
// WHY THESE FIELD NAMES AND NO OTHERS (rewritten 2026-10-05, Phase C)
// -----------------------------------------------------------------------------
// Since 2026-10-05 the canvas renders the REAL pages (the preview route renders
// each page file itself, src/pages/preview/[...slug].astro), so every line Mary
// Ann reads on her site is a line she can point at. Every page here is a
// fixed-field singleton, so a line is a TOP-LEVEL FIELD on the page document
// and the studio path is just its name. Three rules decided the list:
//
//   1. The field must be declared by a REGISTERED page singleton, and be a
//      plain line of words (string or text). Photos, lists and addresses are
//      not text cards: photos and list items get click targets instead
//      (src/lib/edit-target.ts), and addresses are edited in the form.
//   2. The page must RENDER it as visible words. A field that only feeds an
//      attribute (a placeholder, a screen-reader label, a template such as
//      "{count} left") has no line for a card to hang on, so it is left to the
//      form. Neither are obsolete fields a page no longer draws.
//   3. `onTypes` lists the page types that both declare AND render it, and the
//      card checks the document's own `_type` against that list. Carrying the
//      field is a per-TYPE fact; `heroItalicWord` is on the home page only, and
//      offering it anywhere else would write a field that page has no box for.
//
// src/lib/page-fields.test.ts checks all three against the schemas and the
// page files, so the list cannot drift from what the pages draw.
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
 * The registry: the hero lines first, then each page's own lines, then the
 * closing banner shared by most pages. Labels are the words the card shows, in
 * plain language.
 */
export const EDITABLE_LINES: readonly EditableLine[] = [
  {
    name: 'heroEyebrow',
    label: 'Small label above the heading',
    rows: 1,
    onTypes: [
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
    ],
  },
  { name: 'eyebrow', label: 'Small label above the heading', rows: 1, onTypes: ['thankYouPage'] },
  {
    name: 'heroHeadline',
    label: 'Headline',
    rows: 2,
    onTypes: [
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
    ],
  },
  { name: 'headline', label: 'Headline', rows: 2, onTypes: ['thankYouPage', 'notFoundPage'] },
  {
    name: 'heroItalicWord',
    label: 'Slanted words at the end of the headline',
    rows: 1,
    onTypes: ['homePage'],
  },
  {
    name: 'heroSubhead',
    label: 'Short line under the heading',
    rows: 3,
    onTypes: [
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
    ],
  },
  { name: 'heroPrimaryCtaLabel', label: 'First button', rows: 1, onTypes: ['homePage'] },
  { name: 'heroSecondaryCtaLabel', label: 'Second button', rows: 1, onTypes: ['homePage'] },
  {
    name: 'marqueeEyebrow',
    label: 'Label beside the moving list of items',
    rows: 1,
    onTypes: ['homePage'],
  },
  {
    name: 'categoriesEyebrow',
    label: 'Small label above the item types',
    rows: 1,
    onTypes: ['homePage'],
  },
  { name: 'categoriesHeadline', label: 'Item types heading', rows: 2, onTypes: ['homePage'] },
  {
    name: 'categoriesSubhead',
    label: 'Line under the item types heading',
    rows: 3,
    onTypes: ['homePage'],
  },
  { name: 'categoriesNote', label: 'Note under the item types', rows: 2, onTypes: ['homePage'] },
  {
    name: 'aboutEyebrow',
    label: 'Small label above your introduction',
    rows: 1,
    onTypes: ['homePage'],
  },
  { name: 'aboutHeadline', label: 'Introduction heading', rows: 2, onTypes: ['homePage'] },
  { name: 'makerQuote', label: 'Your quote', rows: 3, onTypes: ['homePage'] },
  { name: 'makerSignature', label: 'Your signature', rows: 1, onTypes: ['homePage'] },
  { name: 'aboutCtaLabel', label: 'Introduction button', rows: 1, onTypes: ['homePage'] },
  { name: 'processEyebrow', label: 'Small label above the steps', rows: 1, onTypes: ['homePage'] },
  { name: 'processHeadline', label: 'Steps heading', rows: 2, onTypes: ['homePage'] },
  { name: 'processSubhead', label: 'Line under the steps heading', rows: 3, onTypes: ['homePage'] },
  { name: 'processCtaLabel', label: 'Steps button', rows: 1, onTypes: ['homePage'] },
  {
    name: 'wallEyebrow',
    label: 'Small label above the photo wall',
    rows: 1,
    onTypes: ['homePage'],
  },
  { name: 'wallHeadline', label: 'Photo wall heading', rows: 2, onTypes: ['homePage'] },
  {
    name: 'wallSubhead',
    label: 'Line under the photo wall heading',
    rows: 3,
    onTypes: ['homePage'],
  },
  { name: 'wallCtaLabel', label: 'Photo wall button', rows: 1, onTypes: ['homePage'] },
  {
    name: 'finalEyebrow',
    label: 'Small label above the closing message',
    rows: 1,
    onTypes: ['homePage'],
  },
  { name: 'finalHeadline', label: 'Closing heading', rows: 2, onTypes: ['homePage'] },
  { name: 'finalSubhead', label: 'Closing words', rows: 3, onTypes: ['homePage'] },
  { name: 'finalCtaLabel', label: 'Closing button', rows: 1, onTypes: ['homePage'] },
  { name: 'stepsHeadline', label: 'Steps heading', rows: 2, onTypes: ['howItWorksPage'] },
  {
    name: 'faqHeadline',
    label: 'Questions heading',
    rows: 2,
    onTypes: ['howItWorksPage', 'pricingPage'],
  },
  {
    name: 'faqSubhead',
    label: 'Line under the questions heading',
    rows: 3,
    onTypes: ['howItWorksPage'],
  },
  { name: 'tiersHeadline', label: 'Prices heading', rows: 2, onTypes: ['pricingPage'] },
  {
    name: 'tiersSubhead',
    label: 'Line under the prices heading',
    rows: 3,
    onTypes: ['pricingPage'],
  },
  {
    name: 'tierPricePrefix',
    label: 'Small word above each price',
    rows: 1,
    onTypes: ['pricingPage'],
  },
  { name: 'addonsHeadline', label: 'Add-ons heading', rows: 2, onTypes: ['pricingPage'] },
  { name: 'rushHeadline', label: 'Rush orders heading', rows: 2, onTypes: ['pricingPage'] },
  { name: 'makerAttribution', label: 'Your name under the photo', rows: 1, onTypes: ['aboutPage'] },
  { name: 'storyHeadline', label: 'Story heading', rows: 1, onTypes: ['aboutPage'] },
  { name: 'studioNote', label: 'Studio note', rows: 3, onTypes: ['aboutPage'] },
  { name: 'recentWorkHeadline', label: 'Recent work heading', rows: 2, onTypes: ['aboutPage'] },
  { name: 'valuesHeadline', label: 'Values heading', rows: 2, onTypes: ['aboutPage'] },
  { name: 'turnaroundCallout', label: 'Turnaround note', rows: 2, onTypes: ['requestAQuotePage'] },
  {
    name: 'requiredFieldNote',
    label: 'Note about required questions',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'orderInfoHeading',
    label: 'Order section heading',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'personalInfoHeading',
    label: 'Contact section heading',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'attachmentsHeading',
    label: 'Photos section heading',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'additionalHeading',
    label: 'Last section heading',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'itemTypeLabel',
    label: 'Question: type of item',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'itemTypeHelp',
    label: 'Help under: type of item',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'ownershipLabel',
    label: 'Question: whose item',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'ownershipHelp',
    label: 'Help under: whose item',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'itemDescriptionLabel',
    label: 'Question: describe the item',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'itemDescriptionHelp',
    label: 'Help under: describe the item',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'monogramStyleLabel',
    label: 'Question: monogram style',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'monogramStyleHelp',
    label: 'Help under: monogram style',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'placementSelectLabel',
    label: 'Question: placement',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'placementSelectHelp',
    label: 'Help under: placement',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  { name: 'sizeLabel', label: 'Question: size', rows: 1, onTypes: ['requestAQuotePage'] },
  { name: 'sizeHelp', label: 'Help under: size', rows: 2, onTypes: ['requestAQuotePage'] },
  {
    name: 'threadCountLabel',
    label: 'Question: thread colors',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'threadCountHelp',
    label: 'Help under: thread colors',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  { name: 'quantityLabel', label: 'Question: how many', rows: 1, onTypes: ['requestAQuotePage'] },
  { name: 'quantityHelp', label: 'Help under: how many', rows: 2, onTypes: ['requestAQuotePage'] },
  {
    name: 'fontPreferenceLabel',
    label: 'Question: lettering',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  {
    name: 'fontPreferenceHelp',
    label: 'Help under: lettering',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  { name: 'neededByLabel', label: 'Question: needed by', rows: 1, onTypes: ['requestAQuotePage'] },
  { name: 'neededByHelp', label: 'Help under: needed by', rows: 2, onTypes: ['requestAQuotePage'] },
  { name: 'rushLabel', label: 'Question: rush order', rows: 1, onTypes: ['requestAQuotePage'] },
  { name: 'rushHelp', label: 'Help under: rush order', rows: 2, onTypes: ['requestAQuotePage'] },
  { name: 'nameLabel', label: 'Question: name', rows: 1, onTypes: ['requestAQuotePage'] },
  { name: 'emailLabel', label: 'Question: email', rows: 1, onTypes: ['requestAQuotePage'] },
  { name: 'phoneLabel', label: 'Question: phone', rows: 1, onTypes: ['requestAQuotePage'] },
  {
    name: 'referralLabel',
    label: 'Question: how did you hear about us',
    rows: 1,
    onTypes: ['requestAQuotePage'],
  },
  { name: 'submitLabel', label: 'Send button', rows: 1, onTypes: ['requestAQuotePage'] },
  {
    name: 'privacyNote',
    label: 'Privacy note under the button',
    rows: 2,
    onTypes: ['requestAQuotePage'],
  },
  { name: 'gridIntro', label: 'Line above the item types', rows: 3, onTypes: ['shopIndexPage'] },
  {
    name: 'introCtaLabel',
    label: 'Button under the heading',
    rows: 1,
    onTypes: ['styleGalleryPage'],
  },
  {
    name: 'filterAllLabel',
    label: 'Show everything button',
    rows: 1,
    onTypes: ['styleGalleryPage'],
  },
  { name: 'filterToggleLabel', label: 'Filter button', rows: 1, onTypes: ['styleGalleryPage'] },
  { name: 'lessTagsLabel', label: 'Show fewer button', rows: 1, onTypes: ['styleGalleryPage'] },
  {
    name: 'filterFallbackHeading',
    label: 'Filter heading',
    rows: 1,
    onTypes: ['styleGalleryPage'],
  },
  {
    name: 'emptyStateMessage',
    label: 'Message when there is nothing to show',
    rows: 2,
    onTypes: ['styleGalleryPage', 'clearancePage'],
  },
  { name: 'requestLabel', label: 'Link under each photo', rows: 1, onTypes: ['styleGalleryPage'] },
  {
    name: 'fontGridEyebrow',
    label: 'Small label above the lettering styles',
    rows: 1,
    onTypes: ['fontGuidePage'],
  },
  {
    name: 'fontGridHeadline',
    label: 'Lettering styles heading',
    rows: 2,
    onTypes: ['fontGuidePage'],
  },
  { name: 'popularLabel', label: 'Popular tag', rows: 1, onTypes: ['fontGuidePage'] },
  { name: 'tryItLabel', label: 'Try it link', rows: 1, onTypes: ['fontGuidePage'] },
  {
    name: 'customFontNote',
    label: 'Note about other lettering',
    rows: 3,
    onTypes: ['fontGuidePage'],
  },
  {
    name: 'filterLabel',
    label: 'Label above the search box',
    rows: 1,
    onTypes: ['threadChartPage'],
  },
  {
    name: 'matchingNote',
    label: 'Note about matching colors',
    rows: 3,
    onTypes: ['threadChartPage'],
  },
  {
    name: 'customColorNote',
    label: 'Note about other colors',
    rows: 2,
    onTypes: ['threadChartPage'],
  },
  { name: 'paymentNote', label: 'Payment note', rows: 2, onTypes: ['clearancePage'] },
  { name: 'pickupNote', label: 'Pickup note', rows: 2, onTypes: ['clearancePage'] },
  { name: 'buyButtonLabel', label: 'Buy button', rows: 1, onTypes: ['clearancePage'] },
  { name: 'soldOutLabel', label: 'Sold out label', rows: 1, onTypes: ['clearancePage'] },
  {
    name: 'emptyStateCtaLabel',
    label: 'Button when nothing is for sale',
    rows: 1,
    onTypes: ['clearancePage'],
  },
  {
    name: 'emptyStateSecondaryLabel',
    label: 'Second button when nothing is for sale',
    rows: 1,
    onTypes: ['clearancePage'],
  },
  {
    name: 'responseTimeLabel',
    label: 'Label above the reply time',
    rows: 1,
    onTypes: ['thankYouPage'],
  },
  { name: 'expectedResponseTime', label: 'Reply time', rows: 1, onTypes: ['thankYouPage'] },
  {
    name: 'nextStepsLabel',
    label: 'Label above what happens next',
    rows: 1,
    onTypes: ['thankYouPage'],
  },
  {
    name: 'secondaryCtaLabel',
    label: 'Second button',
    rows: 1,
    onTypes: ['thankYouPage', 'notFoundPage'],
  },
  { name: 'primaryCtaLabel', label: 'First button', rows: 1, onTypes: ['notFoundPage'] },
  {
    name: 'ctaEyebrow',
    label: 'Small label above the banner',
    rows: 1,
    onTypes: [
      'homePage',
      'howItWorksPage',
      'pricingPage',
      'aboutPage',
      'shopIndexPage',
      'styleGalleryPage',
      'fontGuidePage',
      'threadChartPage',
      'clearancePage',
    ],
  },
  {
    name: 'ctaHeadline',
    label: 'Banner headline',
    rows: 2,
    onTypes: [
      'homePage',
      'howItWorksPage',
      'pricingPage',
      'aboutPage',
      'shopIndexPage',
      'styleGalleryPage',
      'fontGuidePage',
      'threadChartPage',
      'clearancePage',
    ],
  },
  {
    name: 'ctaSubhead',
    label: 'Banner text',
    rows: 3,
    onTypes: [
      'homePage',
      'howItWorksPage',
      'pricingPage',
      'aboutPage',
      'shopIndexPage',
      'styleGalleryPage',
      'fontGuidePage',
      'threadChartPage',
      'clearancePage',
    ],
  },
  {
    name: 'ctaLabel',
    label: 'Button text',
    rows: 1,
    onTypes: [
      'homePage',
      'howItWorksPage',
      'pricingPage',
      'aboutPage',
      'shopIndexPage',
      'styleGalleryPage',
      'fontGuidePage',
      'threadChartPage',
      'clearancePage',
      'thankYouPage',
    ],
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
 * top-level field on the page document; anything deeper is an array item, which
 * the host overlay already opens in the form when it is clicked, and which gets
 * the in-canvas list controls from its `data-sanity` target.
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
