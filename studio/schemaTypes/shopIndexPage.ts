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
    { name: 'seo',  title: 'Google & sharing' },
    { name: 'page', title: 'Page content', default: true },
    { name: 'cta',  title: 'CTA' },
  ],
  fieldsets: [{ name: 'seo', title: 'Google & sharing — you rarely need to touch this', options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({ name: 'seoTitle', title: 'Google & browser-tab title', type: 'string', group: 'seo', fieldset: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'Google search description', type: 'text', rows: 3, group: 'seo', fieldset: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Photo shown when the page is shared', type: 'image', group: 'seo', fieldset: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Photo description (helps screen readers & Google)', type: 'string' })] }),

    defineField({ name: 'heroEyebrow', title: 'Small label above the heading', type: 'string', group: 'page',
      validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'page',
      validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Short line under the heading (optional)', type: 'text', rows: 2, group: 'page' }),

    defineField({ name: 'gridIntro', title: 'Grid intro text (optional)', type: 'text', rows: 2, group: 'page',
      description: 'Short paragraph above the category grid.' }),

    defineField({ name: 'ctaEyebrow', title: 'Small label above the banner', type: 'string', group: 'cta' }),
    defineField({ name: 'ctaHeadline', title: 'Banner headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'Banner text (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button text', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button link (where it goes)', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'Shop by Item Page' }) },
});
