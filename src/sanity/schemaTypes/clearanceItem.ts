// Clearance item document. Ready-made or discounted items for sale on the
// Clearance page. Each item links straight to its own Stripe Payment Link:
// no cart, no checkout code on the site.
//
// 2026-10-05, Mary Ann's Studio pass: plain titles, in the order she fills
// them in, with "Sold" near the top because marking an item sold is the job
// she does most. Required now means needed for the item to work on the page:
// a name, a photo, a sale price and the payment link. `featured` is hidden:
// the page sorts by position and sold-ness only and never reads it (data kept).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TagIcon } from '@sanity/icons';
import { PHOTO_WORDS, PHOTO_WORDS_NEEDED, bracketsLeft } from './_copy';

export const clearanceItem = defineType({
  name: 'clearanceItem',
  title: 'Clearance item',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name of the item',
      type: 'string',
      description: 'Shown on the Clearance page, for example "Set of 4 monogrammed napkins, JKL".',
      validation: (Rule) => [
        Rule.required().error('Please give this item a name.'),
        Rule.custom(bracketsLeft).warning(),
      ],
    }),
    defineField({
      name: 'sold',
      title: 'Sold',
      type: 'boolean',
      description:
        'Turn this on when it sells. The item stays on the page with a "Sold" badge, moves to the end, and the Buy button goes away.',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description: 'One or more photos. The first one is the main photo. Drag to change the order.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              ...PHOTO_WORDS,
              type: 'string',
              validation: (R) =>
                R.custom((value, ctx: any) =>
                  ctx.parent?.asset && !value ? PHOTO_WORDS_NEEDED : true,
                ),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1).error('Please add at least one photo.'),
    }),
    defineField({
      name: 'description',
      title: 'A few words about it',
      type: 'text',
      rows: 4,
      description: 'Colors, font, how many in the set, what it is made of.',
      validation: (Rule) => Rule.custom(bracketsLeft).warning(),
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale price, in dollars',
      type: 'number',
      description: 'Just the number, for example 25 or 19.50. The $ sign is added for you.',
      validation: (Rule) => [
        Rule.required().error('Please type the sale price, for example 25.'),
        Rule.min(0).precision(2).warning('Please type a price like 25 or 19.50.'),
      ],
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original price, in dollars',
      type: 'number',
      description:
        'What it used to cost. It is shown crossed out next to the sale price. Leave it empty to show only the sale price.',
      validation: (Rule) =>
        Rule.min(0).precision(2).warning('Please type a price like 40 or 35.50.'),
    }),
    defineField({
      name: 'stripePaymentLink',
      title: 'Stripe payment link',
      type: 'url',
      description:
        'The Buy button opens this. Copy it from your Stripe account: it starts with https://buy.stripe.com/',
      validation: (Rule) =>
        Rule.required()
          .uri({ scheme: ['https'] })
          .error('Please paste the Stripe payment link. It starts with https://buy.stripe.com/'),
    }),
    defineField({
      name: 'quantityAvailable',
      title: 'How many are left',
      type: 'number',
      description:
        'Shown on the item if the Clearance page has a "how many left" line set up. Turn on Sold when the last one goes.',
      initialValue: 1,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1 or 2.'),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Position on the page',
      type: 'number',
      description: 'Smaller numbers come first. Sold items always go to the end.',
      initialValue: 99,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1, 2 or 3.'),
    }),

    // ── Hidden: the page does not read it (data kept) ────────────────────────
    defineField({
      name: 'featured',
      title: 'Old "show first" switch (not used)',
      type: 'boolean',
      hidden: true,
    }),
  ],
  __experimental_search: [
    { path: 'name', weight: 10 },
    { path: 'description', weight: 2 },
  ],
  preview: {
    select: { title: 'name', price: 'salePrice', sold: 'sold', media: 'images.0' },
    prepare: ({ title, price, sold, media }) => ({
      title: title ?? '(no name yet)',
      subtitle: sold
        ? 'Sold'
        : typeof price === 'number'
          ? `For sale at $${price.toFixed(2)}`
          : 'No price yet',
      media,
    }),
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'newestFirst',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    {
      title: 'Position on the page',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
});
