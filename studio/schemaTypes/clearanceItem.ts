// Clearance item document. Pre-made or discounted items for sale on the
// Clearance page. Each item links directly to its own Stripe Payment Link —
// no cart, no checkout code on the site.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TagIcon } from '@sanity/icons';

export const clearanceItem = defineType({
  name: 'clearanceItem',
  title: 'Clearance Item',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Item name',
      type: 'string',
      description: 'The product name shown on the clearance page. E.g. "Set of 4 Monogrammed Napkins — JKL".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Details about the item — colors, font, quantity, material, etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description: 'One or more product photos. First image is the main display image.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Photo description (helps screen readers & Google)', type: 'string', validation: (R) => R.required() }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original price ($)',
      type: 'number',
      description: 'Original retail price shown with a strikethrough.',
      validation: (Rule) => Rule.required().min(0).precision(2),
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale price ($)',
      type: 'number',
      description: 'The clearance price.',
      validation: (Rule) => Rule.required().min(0).precision(2),
    }),
    defineField({
      name: 'stripePaymentLink',
      title: 'Stripe Payment Link',
      type: 'url',
      description: 'The Stripe-hosted checkout URL for this item. Must start with https://buy.stripe.com/...',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['https'] }).error('Must be a valid https:// Stripe payment link.'),
    }),
    defineField({
      name: 'quantityAvailable',
      title: 'Quantity available',
      type: 'number',
      description: 'How many of this item are in stock. Set to 0 to show "Sold out".',
      initialValue: 1,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'sold',
      title: 'Mark as sold',
      type: 'boolean',
      description: 'When checked, this item shows a "Sold" badge and the purchase button is disabled.',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured items appear first on the clearance page.',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first (after featured items).',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { title: 'name', price: 'salePrice', sold: 'sold', media: 'images.0' },
    prepare: ({ title, price, sold, media }) => ({
      title: title ?? '(unnamed item)',
      subtitle: sold ? 'SOLD' : price != null ? `$${price.toFixed(2)}` : '(no price)',
      media,
    }),
  },
  orderings: [
    { title: 'Featured first, then order', name: 'featuredOrder', by: [{ field: 'featured', direction: 'desc' }, { field: 'displayOrder', direction: 'asc' }] },
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
  ],
});
