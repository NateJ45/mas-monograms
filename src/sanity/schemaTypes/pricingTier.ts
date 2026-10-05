// Pricing tier document ("Price tag"). Each one is a hang tag on the Pricing
// page: a name, a starting price per piece and a short note.
//
// 2026-10-05, Mary Ann's Studio pass: plain titles. `minQuantity` and
// `maxQuantity` are hidden: the tags are now kinds of work ("Basic Monogram",
// "Custom Appliqué"), not quantity brackets, and the page never shows them.
// minQuantity was required, which a new tag could not satisfy without a number
// that means nothing to her. Data kept.

import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';
import { BillIcon } from '@sanity/icons';
import { TOO_LONG } from './_copy';

export const pricingTier = defineType({
  name: 'pricingTier',
  title: 'Price tag',
  type: 'document',
  icon: BillIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Name on the tag',
      type: 'string',
      description: 'For example "Basic Monogram" or "Custom Embroidery".',
      validation: (Rule) => Rule.required().error('Please give this price tag a name.'),
    }),
    defineField({
      name: 'pricePerPiece',
      title: 'Price per piece, in dollars',
      type: 'number',
      description: 'Just the number, for example 16 or 12.50. The $ sign is added for you.',
      validation: (Rule) => [
        Rule.required().error('Please type the price, for example 16.'),
        Rule.min(0).precision(2).warning('Please type a price like 16 or 12.50.'),
      ],
    }),
    defineField({
      name: 'note',
      title: 'Short note',
      type: 'string',
      description: 'For example "Up to 3 letters" or "Most popular". Leave it empty to show none.',
    }),
    defineField({
      name: 'highlighted',
      title: 'Make this tag stand out',
      type: 'boolean',
      description: 'Turn on for the one you recommend most. It gets a highlight on the page.',
      initialValue: false,
    }),
    defineField({
      name: 'highlightLabel',
      title: 'Badge on the highlighted tag',
      type: 'string',
      description:
        'A few words on the highlighted tag, for example "Most popular". Only shows when "Make this tag stand out" is on.',
      validation: (Rule) => Rule.max(30).warning(TOO_LONG),
    }),
    // Phase D (2026-10-05): the typed position is replaced by dragging the list
    // (orderRank, below). Hidden, never deleted: the site still orders by it
    // after orderRank, so anything without a rank keeps its old place.
    defineField({
      name: 'displayOrder',
      title: 'Position on the page',
      type: 'number',
      description: 'Smaller numbers come first. 1 is first.',
      initialValue: 99,
      hidden: true,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1, 2 or 3.'),
    }),
    // Phase D: the drag order, written by @sanity/orderable-document-list. Hidden
    // and read-only; a new item starts at the end of the list.
    orderRankField({ type: 'pricingTier', newItemPosition: 'after' }),

    // ── Hidden: from the old quantity price list (data kept) ─────────────────
    defineField({
      name: 'minQuantity',
      title: 'Old smallest order (not used)',
      type: 'number',
      hidden: true,
    }),
    defineField({
      name: 'maxQuantity',
      title: 'Old largest order (not used)',
      type: 'number',
      hidden: true,
    }),
  ],
  __experimental_search: [{ path: 'label', weight: 10 }],
  preview: {
    select: { label: 'label', price: 'pricePerPiece', highlighted: 'highlighted' },
    prepare: ({ label, price, highlighted }) => ({
      title: label ?? '(no name yet)',
      subtitle:
        (typeof price === 'number' ? `$${price.toFixed(2)} per piece` : 'No price yet') +
        (highlighted ? ' · stands out' : ''),
    }),
  },
  orderings: [
    {
      title: 'In your order',
      name: 'orderRank',
      by: [{ field: 'orderRank', direction: 'asc' }],
    },
    {
      title: 'Position on the page',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
});
