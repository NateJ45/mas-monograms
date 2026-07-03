// 404 page singleton. Every word on the /404 page — headline, body,
// and CTA links — comes from here. Mary Ann can keep it on-brand.

import { defineType, defineField } from 'sanity';

export const notFoundPage = defineType({
  name: 'notFoundPage',
  title: '404 Page',
  type: 'document',
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',     title: 'Google & sharing' },
    { name: 'content', title: 'Content', default: true },
    { name: 'ctas',    title: 'Links' },
  ],
  fieldsets: [{ name: 'seo', title: 'Google & sharing — you rarely need to touch this', options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({ name: 'seoTitle', title: 'Google & browser-tab title', type: 'string', group: 'seo', fieldset: 'seo',
      initialValue: 'Page not found — MAS Monograms',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'Google search description', type: 'text', rows: 2, group: 'seo', fieldset: 'seo',
      initialValue: "That page wandered off. Head back to the homepage or request a quote.",
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),

    defineField({ name: 'headline', title: 'Headline', type: 'string', group: 'content',
      initialValue: "That page wandered off.",
      validation: (R) => R.required().max(100) }),
    defineField({ name: 'body', title: 'Body copy', type: 'text', rows: 3, group: 'content',
      initialValue: "It happens! Maybe a link got stale or the URL has a small typo. Here's where to head next.",
      validation: (R) => R.required() }),

    defineField({ name: 'primaryCtaLabel', title: 'Main button text', type: 'string', group: 'ctas',
      initialValue: 'Back to home', validation: (R) => R.required() }),
    defineField({ name: 'primaryCtaHref', title: 'Main button link', type: 'string', group: 'ctas',
      initialValue: '/', validation: (R) => R.required() }),
    defineField({ name: 'secondaryCtaLabel', title: 'Second button text', type: 'string', group: 'ctas',
      initialValue: 'Request a quote', validation: (R) => R.required() }),
    defineField({ name: 'secondaryCtaHref', title: 'Second button link', type: 'string', group: 'ctas',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: '404 Page' }) },
});
