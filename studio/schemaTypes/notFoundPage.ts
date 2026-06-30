// 404 page singleton. Every word on the /404 page — headline, body,
// and CTA links — comes from here. Mary Ann can keep it on-brand.

import { defineType, defineField } from 'sanity';

export const notFoundPage = defineType({
  name: 'notFoundPage',
  title: '404 Page',
  type: 'document',
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',     title: 'SEO' },
    { name: 'content', title: 'Content', default: true },
    { name: 'ctas',    title: 'Links' },
  ],
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      initialValue: 'Page not found — MAS Monograms',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, group: 'seo',
      initialValue: "That page wandered off. Head back to the homepage or request a quote.",
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),

    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', group: 'content', initialValue: '404' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', group: 'content',
      initialValue: "That page wandered off.",
      validation: (R) => R.required().max(100) }),
    defineField({ name: 'body', title: 'Body copy', type: 'text', rows: 3, group: 'content',
      initialValue: "It happens! Maybe a link got stale or the URL has a small typo. Here's where to head next.",
      validation: (R) => R.required() }),
    defineField({ name: 'heroImage', title: 'Photo (optional)', type: 'image', group: 'content',
      description: 'An on-brand photo that grounds the page in the studio identity.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })] }),

    defineField({ name: 'primaryCtaLabel', title: 'Primary CTA label', type: 'string', group: 'ctas',
      initialValue: 'Back to home', validation: (R) => R.required() }),
    defineField({ name: 'primaryCtaHref', title: 'Primary CTA destination', type: 'string', group: 'ctas',
      initialValue: '/', validation: (R) => R.required() }),
    defineField({ name: 'secondaryCtaLabel', title: 'Secondary CTA label', type: 'string', group: 'ctas',
      initialValue: 'Request a quote', validation: (R) => R.required() }),
    defineField({ name: 'secondaryCtaHref', title: 'Secondary CTA destination', type: 'string', group: 'ctas',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
    defineField({ name: 'tertiaryCtaLabel', title: 'Tertiary CTA label', type: 'string', group: 'ctas',
      initialValue: 'Browse what I embroider' }),
    defineField({ name: 'tertiaryCtaHref', title: 'Tertiary CTA destination', type: 'string', group: 'ctas',
      initialValue: '/shop-by-item' }),
  ],
  preview: { prepare: () => ({ title: '404 Page' }) },
});
