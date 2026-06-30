import {defineField, defineType} from 'sanity'

/**
 * itemCategory (document)
 * =============================================================================
 * THE WORKHORSE TYPE. Each of these powers one shop page at a flat URL such as
 * /tote-bags or /towels-linens. The homepage and the Shop index both pull the
 * full set of these to build their card grids, sorted by `order`.
 *
 * Special cases are handled with flags, not separate types:
 *   - "Bring Your Own Item" sets `isSpecial` true (the front end swaps the
 *     price anchor for a free-assessment framing and softens the CTA).
 *   - The Seasonal page is simply categories with `seasonal` true, optionally
 *     bounded by `activeFrom` / `activeUntil`.
 *
 * This file is a COMPLETE, working example. Use it as the pattern for the other
 * document and singleton types described in docs/06: copy the structure, swap
 * the fields, keep the comments and validation habits.
 */
export const itemCategory = defineType({
  name: 'itemCategory',
  title: 'Shop Category',
  type: 'document',

  // Fieldsets group related fields into collapsible sections in the studio, so
  // a long form does not overwhelm the person editing it. Purely an editing aid.
  fieldsets: [
    {name: 'card', title: 'Card (how it appears in grids)', options: {collapsible: true}},
    {name: 'hero', title: 'Page hero', options: {collapsible: true}},
    {name: 'expect', title: 'What to expect (two columns)', options: {collapsible: true, collapsed: true}},
    {name: 'pricing', title: 'Pricing summary', options: {collapsible: true, collapsed: true}},
    {name: 'flags', title: 'Special behavior', options: {collapsible: true, collapsed: true}},
  ],

  fields: [
    /* --- Identity ----------------------------------------------------------- */
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'For example: "Tote Bags & Pouches".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description:
        'The page address. This MUST match the existing live URL so old links and search rankings keep working, for example "tote-bags". Do not change it once the site is live.',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),

    /* --- Card fields (used in the homepage and Shop grids) ------------------ */
    defineField({
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      fieldset: 'card',
      description: 'A single emoji used on the category card, for example a tote bag.',
    }),
    defineField({
      name: 'priceAnchor',
      title: 'Price anchor',
      type: 'string',
      fieldset: 'card',
      description:
        'Short price hook on the card, for example "from $16". For Bring Your Own Item, use something like "free assessment".',
    }),
    defineField({
      name: 'cardDescription',
      title: 'Card description',
      type: 'text',
      rows: 2,
      fieldset: 'card',
      description: 'The one-line description shown in the homepage and Shop grids.',
    }),

    /* --- Hero --------------------------------------------------------------- */
    defineField({
      name: 'heroHeading',
      title: 'Hero heading',
      type: 'string',
      fieldset: 'hero',
    }),
    defineField({
      name: 'heroBody',
      title: 'Hero body',
      type: 'text',
      rows: 3,
      fieldset: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      fieldset: 'hero',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    /* --- Gallery ------------------------------------------------------------ */
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      description: 'The grid of example photos for this category.',
      of: [{type: 'galleryImage'}], // object type defined in schemas/objects/galleryImage.ts
    }),

    /* --- What to expect (two columns of rich text) -------------------------- */
    // "block" is Sanity's portable text, its rich-text editor. Each of these is
    // one column of the two-column "what to expect" section on the page.
    defineField({
      name: 'whatToExpectLeft',
      title: 'What to expect, left column',
      type: 'array',
      fieldset: 'expect',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'whatToExpectRight',
      title: 'What to expect, right column',
      type: 'array',
      fieldset: 'expect',
      of: [{type: 'block'}],
    }),

    /* --- Pricing summary ---------------------------------------------------- */
    defineField({
      name: 'pricingRangeLow',
      title: 'Pricing range, low end',
      type: 'string',
      fieldset: 'pricing',
      description: 'For example "$16".',
    }),
    defineField({
      name: 'pricingRangeHigh',
      title: 'Pricing range, high end',
      type: 'string',
      fieldset: 'pricing',
      description: 'For example "$45".',
    }),
    defineField({
      name: 'pricingNote',
      title: 'Pricing note',
      type: 'text',
      rows: 2,
      fieldset: 'pricing',
      description: 'Any caveat, for example "Final price depends on size and stitch count."',
    }),

    /* --- Optional related content (references) ------------------------------ */
    // These point at other documents. The referenced types (popularCombination,
    // testimonial) are specified in docs/06. Until those schema files exist, the
    // studio will warn that the type is unknown. That is expected for the seed.
    defineField({
      name: 'popularCombinations',
      title: 'Popular combinations',
      type: 'array',
      description: 'Optional. Cards of popular font and thread pairings for this category.',
      of: [{type: 'reference', to: [{type: 'popularCombination'}]}],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      description: 'Optional. Reviews to show on this specific category page.',
      of: [{type: 'reference', to: [{type: 'testimonial'}]}],
    }),

    /* --- Flags -------------------------------------------------------------- */
    defineField({
      name: 'isSpecial',
      title: 'Is the "Bring Your Own Item" page',
      type: 'boolean',
      fieldset: 'flags',
      description:
        'Turn on only for Bring Your Own Item. The front end then swaps the price anchor for a free-assessment framing.',
      initialValue: false,
    }),
    defineField({
      name: 'seasonal',
      title: 'Seasonal',
      type: 'boolean',
      fieldset: 'flags',
      description: 'Turn on to surface this category on the Seasonal page.',
      initialValue: false,
    }),
    defineField({
      name: 'activeFrom',
      title: 'Active from',
      type: 'datetime',
      fieldset: 'flags',
      description: 'Optional. For seasonal items, the date it should start showing.',
    }),
    defineField({
      name: 'activeUntil',
      title: 'Active until',
      type: 'datetime',
      fieldset: 'flags',
      description: 'Optional. For seasonal items, the date it should stop showing.',
    }),

    /* --- Sort + SEO --------------------------------------------------------- */
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first in grids.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO & social sharing',
      type: 'seo', // object type defined in schemas/objects/seo.ts
    }),
  ],

  // A ready-made sort option in the studio's list view.
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],

  preview: {
    select: {title: 'title', subtitle: 'priceAnchor', media: 'heroImage'},
  },
})
