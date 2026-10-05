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
];
