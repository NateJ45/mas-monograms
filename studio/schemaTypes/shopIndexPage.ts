// Shop by Item page singleton. This page shows the grid of item categories.
// The categories themselves live in the itemCategory collection.

import { defineType, defineField } from 'sanity';
import { BasketIcon } from '@sanity/icons';

export const shopIndexPage = defineType({
  name: 'shopIndexPage',
  title: 'Shop by Item Page',
  type: 'document',
  icon: BasketIcon,
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

    defineField({ name: 'gridIntro', title: 'Grid intro text (optional)', type: 'text', rows: 2, group: 'page',
      description: 'Short paragraph above the category grid.' }),

    defineField({ name: 'ctaEyebrow', title: 'CTA eyebrow', type: 'string', group: 'cta' }),
    defineField({ name: 'ctaHeadline', title: 'CTA headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'CTA body (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button destination', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'Shop by Item Page' }) },
});
