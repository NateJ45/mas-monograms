// Safe to edit by hand (the words); edit the shapes with care
// =============================================================================
// "+ New" starting points (initial-value templates), 2026-10-05
// =============================================================================
// Pattern from ReidDesignAstro/reid-design-site src/sanity/templates.ts. The
// three things Mary Ann makes most often start filled in the way she would
// fill them in, so she edits rather than composes. Registered in
// sanity.config.ts through `schema.templates`; the desk lists use them for
// their "+" button and the Welcome card "Add a photo of my work" opens the
// first one directly.
//
// Placeholder words are [in square brackets] so nothing reads as finished, and
// they are written in her voice. A box still holding [square brackets] gets a
// gentle yellow note before Publish (bracketsLeft in schemaTypes/_copy.ts).
//
// Photos are never pre-filled. A photo of her work has no free-text box outside
// the photo itself (its words live inside the picture), so its template only
// sets the sensible choices.
//
// tests: src/lib/studio-templates.test.ts holds every template to the schema
// (real types, real fields, no em-dashes, brackets where there is free text).
// =============================================================================
import type { Template } from 'sanity';

/** One paragraph of Portable Text. */
const para = (key: string, text: string) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s`, marks: [], text }],
});

/**
 * The seasons of her shop, each a starting point for a gift guide or season
 * page (schemaTypes/collection.ts). Words in [square brackets] are hers to
 * fill in; nothing here claims a price, a date or a promise for her.
 */
const SEASONS = [
  {
    id: 'christmas',
    title: 'Christmas gift guide',
    description: 'Personalized gifts for the holidays.',
    name: 'Christmas gift guide',
    eyebrow: 'Holiday gifts',
    intro:
      '[Who these are for, and what you can stitch on them: names, initials, a family monogram.]',
    orderBy: 'Order by [the date] for Christmas',
    tags: ['christmas'],
  },
  {
    id: 'wedding',
    title: 'Wedding season',
    description: 'For the bride, the wedding party and the new home.',
    name: 'Wedding season',
    eyebrow: 'Weddings',
    intro: '[What you make for weddings: bridal party gifts, the new monogram, towels and totes.]',
    orderBy: 'Order [how many weeks] before the big day',
    tags: ['wedding'],
  },
  {
    id: 'graduation',
    title: 'Graduation',
    description: 'Gifts for the graduate, in school colors.',
    name: 'Graduation gifts',
    eyebrow: 'Graduation',
    intro: '[What you make for graduates: totes, towels and hats in their school colors.]',
    orderBy: 'Order by [the date] for graduation',
    tags: ['graduation', 'collegiate'],
  },
  {
    id: 'back-to-school',
    title: 'Back to school',
    description: 'Names on bags, lunch totes and more.',
    name: 'Back to school',
    eyebrow: 'Back to school',
    intro: '[What you make for school: names on backpacks, lunch totes and bag tags.]',
    orderBy: 'Order by [the date] for the first day of school',
    tags: ['back-to-school', 'bag-tag'],
  },
  {
    id: 'mothers-day',
    title: "Mother's Day",
    description: 'Gifts for mothers and grandmothers.',
    name: "Mother's Day gifts",
    eyebrow: "Mother's Day",
    intro: '[What you make for mothers and grandmothers: names, initials, the grandchildren.]',
    orderBy: "Order by [the date] for Mother's Day",
    tags: ['mothers-day'],
  },
  {
    id: 'baby',
    title: 'Baby gifts',
    description: 'For a new baby and the baby shower.',
    name: 'Baby gifts',
    eyebrow: 'For a new baby',
    intro: "[What you make for babies: blankets, bibs and burp cloths with the baby's name.]",
    orderBy: '',
    tags: ['baby'],
  },
];

/** The season page starting points, for the "+" of "Gift guides and seasons". */
export const SEASON_TEMPLATES = SEASONS.map((s) => `new-collection-${s.id}`);

/** The notice starting points, for the "+" of "Notices across the top". */
export const NOTICE_TEMPLATES = ['new-notice-order-by', 'new-notice-clearance', 'new-notice-away'];

export const STARTING_TEMPLATES: Template[] = [
  {
    id: 'new-photo',
    title: 'New photo of my work',
    description: 'A photo for your Style Gallery.',
    schemaType: 'galleryItem',
    value: {
      featured: false,
      hoopFit: 'good',
      displayOrder: 99,
    },
  },
  {
    id: 'new-clearance-item',
    title: 'New clearance item',
    description: 'A ready-made item for sale, with its own Buy button.',
    schemaType: 'clearanceItem',
    value: {
      name: '[What it is, for example "Set of 4 napkins, JKL"]',
      description:
        '[A few words about it: the colors, the font, how many are in the set, and what it is made of.]',
      sold: false,
      quantityAvailable: 1,
      displayOrder: 99,
    },
  },
  {
    id: 'new-question',
    title: 'New question and answer',
    description: 'A question for your How It Works page.',
    schemaType: 'faqItem',
    value: {
      question: '[The question, the way a customer would ask it]',
      answer: [para('tpl-answer-p1', '[Your answer, in your own words. Two or three sentences.]')],
      // A new question shows on How It Works straight away; she can turn on
      // Pricing too. Starting with both off would make a question that shows
      // nowhere, which is the one result nobody wants.
      showOnHowItWorks: true,
      showOnPricing: false,
      displayOrder: 99,
    },
  },

  // ── The seasons of her shop (2026-10-18) ─────────────────────────────────
  // Notices across the top: three she will reach for every year. Dates are left
  // empty on purpose: she picks them when she makes one.
  {
    id: 'new-notice-order-by',
    title: 'Notice: order by a date for a holiday',
    description: 'For example "Order by December 1 for Christmas".',
    schemaType: 'announcement',
    value: {
      message: 'Order by [the date] for [the holiday]. Request a quote today.',
      style: 'highlight',
      enabled: true,
      link: { label: 'Request a Quote', url: '/request-a-quote/' },
    },
  },
  {
    id: 'new-notice-clearance',
    title: 'Notice: new clearance items',
    description: 'Tell everyone new clearance items are up.',
    schemaType: 'announcement',
    value: {
      message: 'New clearance items are up: [what they are].',
      style: 'highlight',
      enabled: true,
      link: { label: 'See the clearance', url: '/clearance/' },
    },
  },
  {
    id: 'new-notice-away',
    title: 'Notice: I am away for a while',
    description: 'A vacation or a busy week. Set the last day and it comes down by itself.',
    schemaType: 'announcement',
    value: {
      message: 'I am away until [the date]. Quote requests will be answered when I am back.',
      style: 'urgent',
      enabled: true,
    },
  },
  // Gift guides and season pages: one starting point per season. The photos
  // come from the tags (a photo tagged "wedding" shows on the wedding page).
  ...SEASONS.map((season) => ({
    id: `new-collection-${season.id}`,
    title: `Season page: ${season.title}`,
    description: season.description,
    schemaType: 'collection',
    value: {
      name: season.name,
      eyebrow: season.eyebrow,
      intro: season.intro,
      ...(season.orderBy ? { orderBy: season.orderBy } : {}),
      photoTags: season.tags,
      ctaLabel: 'Request a Quote',
      itemsHeading: 'Start from one of these',
    },
  })),
];
