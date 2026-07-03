// About page singleton. Tells Mary Ann's story — who she is, why she
// started MAS Monograms, and what she cares about. Every word comes from here.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { UserIcon } from '@sanity/icons';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  icon: UserIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',    title: 'SEO' },
    { name: 'hero',   title: 'Hero', default: true },
    { name: 'story',  title: 'Story' },
    { name: 'values', title: 'Values' },
    { name: 'cta',    title: 'Final CTA' },
  ],
  fields: [
    // SEO
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Social share image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),

    // Hero
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', group: 'hero',
      description: 'E.g. "About Mary Ann" or "Meet the Maker".',
      validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'hero',
      validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Subhead (optional)', type: 'text', rows: 2, group: 'hero' }),
    defineField({ name: 'heroImage', title: 'Hero image (optional)', type: 'image', group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })] }),

    // Story section
    defineField({ name: 'storyHeadline', title: 'Story headline', type: 'string', group: 'story',
      validation: (R) => R.required().max(100) }),
    defineField({
      name: 'storyContent',
      title: 'Story (paragraphs)',
      type: 'array',
      group: 'story',
      description: "Mary Ann's story in her own words. Multiple paragraphs are supported.",
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                  { name: 'openInNewTab', type: 'boolean', title: 'Open in new tab', initialValue: false },
                ],
              },
            ],
          },
        }),
      ],
      validation: (R) => R.required(),
    }),
    defineField({ name: 'makerPhoto', title: 'Mary Ann photo', type: 'image', group: 'story',
      description: 'Photo of Mary Ann. Shown alongside the story. Portrait orientation works well.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })],
      validation: (R) => R.required() }),
    defineField({ name: 'makerAttribution', title: 'Attribution line', type: 'string', group: 'story',
      description: 'E.g. "Mary Ann Stone · Founder, MAS Monograms".',
      validation: (R) => R.required() }),
    defineField({ name: 'studioNote', title: 'Studio note (optional)', type: 'string', group: 'story',
      description: 'One short line about the studio. E.g. "Handcrafted in St. Matthews, SC since 2015."' }),
    defineField({ name: 'recentWorkHeadline', title: 'Recent work heading (optional)', type: 'string', group: 'story',
      description: 'Heading above the strip of recent work photos (pulled from featured gallery items). Defaults to "Recent work from the studio".',
      validation: (R) => R.max(80) }),

    // Values section
    defineField({ name: 'valuesHeadline', title: 'Values headline', type: 'string', group: 'values' }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      group: 'values',
      description: 'Three to four short value statements. E.g. "Quality over quantity".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'valueItem',
          fields: [
            defineField({ name: 'label', title: 'Value', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Description', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label', subtitle: 'body' } },
        }),
      ],
    }),

    // Final CTA
    defineField({ name: 'ctaEyebrow', title: 'CTA eyebrow', type: 'string', group: 'cta', validation: (R) => R.required().max(60) }),
    defineField({ name: 'ctaHeadline', title: 'CTA headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'CTA body (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button destination', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'About Page' }) },
});
