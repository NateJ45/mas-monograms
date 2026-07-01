// Clearance page singleton. The clearance items live in the clearanceItem
// collection. This singleton controls all the page copy.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TagIcon } from '@sanity/icons';

export const clearancePage = defineType({
  name: 'clearancePage',
  title: 'Clearance Page',
  type: 'document',
  icon: TagIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',  title: 'SEO' },
    { name: 'page', title: 'Page content', default: true },
    { name: 'cta',  title: 'CTA' },
  ],
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Social share image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),

    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', group: 'page',
      validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'page',
      validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Subhead (optional)', type: 'text', rows: 2, group: 'page' }),

    defineField({
      name: 'intro',
      title: 'Intro text',
      type: 'array',
      group: 'page',
      description: 'Short intro about the clearance items.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
            annotations: [],
          },
        }),
      ],
      validation: (R) => R.required(),
    }),
    defineField({ name: 'paymentNote', title: 'Payment note', type: 'string', group: 'page',
      description: 'Note about the payment process. E.g. "Each item links directly to a secure Stripe checkout."' }),
    defineField({ name: 'pickupNote', title: 'Pickup / shipping note', type: 'string', group: 'page',
      description: 'Note about how the buyer receives the item. E.g. "Local pickup in St. Matthews, SC only."' }),
    defineField({ name: 'soldOutLabel', title: '"Sold out" badge label', type: 'string', group: 'page',
      initialValue: 'Sold', validation: (R) => R.required() }),
    defineField({ name: 'buyButtonLabel', title: 'Buy button label', type: 'string', group: 'page',
      initialValue: 'Buy now', description: 'Label on the Stripe payment link button.',
      validation: (R) => R.required() }),
    defineField({ name: 'emptyStateMessage', title: 'Empty state message', type: 'string', group: 'page',
      description: 'Shown when no clearance items are active.',
      initialValue: "Nothing in the clearance section right now — check back soon!",
      validation: (R) => R.required() }),
    defineField({ name: 'emptyStateCtaLabel', title: 'Empty state — primary button label', type: 'string', group: 'page',
      description: 'Onward button shown under the empty-state message. Leave blank to hide it.',
      initialValue: 'Request a custom quote' }),
    defineField({ name: 'emptyStateCtaHref', title: 'Empty state — primary button destination', type: 'string', group: 'page',
      description: 'Where the empty-state button links. E.g. /request-a-quote.',
      initialValue: '/request-a-quote' }),
    defineField({ name: 'emptyStateSecondaryLabel', title: 'Empty state — secondary link label', type: 'string', group: 'page',
      description: 'Quieter link shown beside the primary button. Leave blank to hide it.',
      initialValue: 'Browse what I make' }),
    defineField({ name: 'emptyStateSecondaryHref', title: 'Empty state — secondary link destination', type: 'string', group: 'page',
      description: 'Where the secondary link goes. E.g. /shop-by-item.',
      initialValue: '/shop-by-item' }),

    defineField({ name: 'ctaEyebrow', title: 'CTA eyebrow', type: 'string', group: 'cta', validation: (R) => R.required().max(60) }),
    defineField({ name: 'ctaHeadline', title: 'CTA headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'CTA body (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string', group: 'cta',
      initialValue: 'Request a Custom Order', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button destination', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'Clearance Page' }) },
});
