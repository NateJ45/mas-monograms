// Pricing page singleton. All copy on the /pricing page comes from here.
// The actual pricing tiers are the pricingTier collection — this page
// controls all surrounding text, add-on descriptions, and FAQ.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { BillIcon } from '@sanity/icons';

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing Page',
  type: 'document',
  icon: BillIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',    title: 'SEO' },
    { name: 'hero',   title: 'Hero', default: true },
    { name: 'tiers',  title: 'Pricing tiers' },
    { name: 'addons', title: 'Add-ons' },
    { name: 'rush',   title: 'Rush orders' },
    { name: 'faq',    title: 'FAQ' },
    { name: 'cta',    title: 'Final CTA' },
  ],
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Social share image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),

    // Hero
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', group: 'hero', validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'hero', validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Subhead (optional)', type: 'text', rows: 2, group: 'hero' }),
    defineField({ name: 'heroImage', title: 'Hero image (optional)', type: 'image', group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })] }),

    // Pricing tiers section
    defineField({ name: 'tiersHeadline', title: 'Tiers section headline', type: 'string', group: 'tiers', validation: (R) => R.required().max(100) }),
    defineField({ name: 'tiersSubhead', title: 'Intro paragraph', type: 'text', rows: 3, group: 'tiers',
      description: 'Explain the pricing model before the table. E.g. "Price per piece drops with quantity..."' }),

    // Add-ons
    defineField({ name: 'addonsHeadline', title: 'Add-ons section headline', type: 'string', group: 'addons' }),
    defineField({
      name: 'addons',
      title: 'Add-on services',
      type: 'array',
      group: 'addons',
      description: 'Optional upcharges or extras. E.g. "Extra embroidery position — +$X per piece".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'addon',
          fields: [
            defineField({ name: 'label', title: 'Name', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'price', title: 'Price description', type: 'string', description: 'E.g. "+$3 per piece" or "call for quote"', validation: (R) => R.required() }),
            defineField({ name: 'note', title: 'Note (optional)', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'price' } },
        }),
      ],
    }),

    // Rush orders
    defineField({ name: 'rushHeadline', title: 'Rush orders headline', type: 'string', group: 'rush' }),
    defineField({
      name: 'rushBody',
      title: 'Rush orders body',
      type: 'array',
      group: 'rush',
      description: 'Explain the rush option and any upcharge.',
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
    }),

    // FAQ
    defineField({ name: 'faqHeadline', title: 'FAQ headline', type: 'string', group: 'faq', validation: (R) => R.required().max(100) }),

    // CTA
    defineField({ name: 'ctaEyebrow', title: 'CTA eyebrow', type: 'string', group: 'cta', validation: (R) => R.required().max(60) }),
    defineField({ name: 'ctaHeadline', title: 'CTA headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'CTA body (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button destination', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'Pricing Page' }) },
});
