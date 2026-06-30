// Pricing tier document. Each tier represents a quantity bracket with a
// price per piece. The pricing page pulls these in display order.

import { defineType, defineField } from 'sanity';
import { BillIcon } from '@sanity/icons';

export const pricingTier = defineType({
  name: 'pricingTier',
  title: 'Pricing Tier',
  type: 'document',
  icon: BillIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Quantity label',
      type: 'string',
      description: 'E.g. "12–23 pieces" or "100+ pieces". Shown as the row header.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'minQuantity',
      title: 'Minimum quantity',
      type: 'number',
      description: 'The smallest order size for this tier.',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'maxQuantity',
      title: 'Maximum quantity (optional)',
      type: 'number',
      description: 'Leave blank if this is the top tier (no upper limit).',
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: 'pricePerPiece',
      title: 'Price per piece ($)',
      type: 'number',
      description: 'Dollar amount per embroidered piece at this quantity.',
      validation: (Rule) => Rule.required().min(0).precision(2),
    }),
    defineField({
      name: 'note',
      title: 'Note (optional)',
      type: 'string',
      description: 'Short clarifying note for this tier. E.g. "Best for sports teams" or "Most popular tier".',
    }),
    defineField({
      name: 'highlighted',
      title: 'Highlighted row',
      type: 'boolean',
      description: 'Mark as the recommended or most popular tier. Shows a visual highlight.',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first in the pricing table.',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { label: 'label', price: 'pricePerPiece', min: 'minQuantity', max: 'maxQuantity' },
    prepare: ({ label, price, min, max }) => ({
      title: label ?? `${min}${max ? `–${max}` : '+'}`,
      subtitle: price != null ? `$${price.toFixed(2)} per piece` : '(no price set)',
    }),
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
    { title: 'Min quantity', name: 'minQty', by: [{ field: 'minQuantity', direction: 'asc' }] },
  ],
});
