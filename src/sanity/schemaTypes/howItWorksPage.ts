// How It Works page singleton. Walks through the ordering process step by step.
//
// 2026-10-05, Mary Ann's Studio pass: fields in page order (top, the steps,
// questions, closing banner) with Google last; only the headline is required;
// plain titles from ./_copy.ts. `stepsSubhead` is hidden (the redesigned page
// never draws it; the data is kept).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ControlsIcon } from '@sanity/icons';
import {
  SEO_FIELDSET,
  SEO_GROUP,
  SEO_TITLE,
  SEO_TITLE_TOO_LONG,
  SEO_DESCRIPTION,
  SEO_DESCRIPTION_TOO_LONG,
  SEO_IMAGE,
  PHOTO_WORDS,
  HERO_EYEBROW,
  HERO_HEADLINE,
  HEADLINE_NEEDED,
  HERO_SUBHEAD,
  TOO_LONG,
  BANNER_GROUP_TITLE,
  BANNER_EYEBROW,
  BANNER_HEADLINE,
  BANNER_SUBHEAD,
  BANNER_BUTTON,
  BANNER_LINK,
} from './_copy';

export const howItWorksPage = defineType({
  name: 'howItWorksPage',
  title: 'How It Works page',
  type: 'document',
  icon: ControlsIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Top of the page' },
    { name: 'steps', title: 'The steps' },
    { name: 'faq', title: 'Questions' },
    { name: 'cta', title: BANNER_GROUP_TITLE },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    // ── Top of the page ──────────────────────────────────────────────────────
    defineField({
      name: 'heroEyebrow',
      ...HERO_EYEBROW,
      type: 'string',
      group: 'hero',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroHeadline',
      ...HERO_HEADLINE,
      type: 'string',
      group: 'hero',
      validation: (R) => [R.required().error(HEADLINE_NEEDED), R.max(100).warning(TOO_LONG)],
    }),
    defineField({
      name: 'heroSubhead',
      ...HERO_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'hero',
    }),

    // ── The steps ────────────────────────────────────────────────────────────
    defineField({
      name: 'stepsHeadline',
      title: 'Heading above the steps',
      type: 'string',
      group: 'steps',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'steps',
      title: 'The steps',
      type: 'array',
      group: 'steps',
      description:
        'Each step has a number, a name and a few sentences. Drag a step to change the order.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({
              name: 'number',
              title: 'Step number',
              type: 'string',
              description: 'For example "01".',
            }),
            defineField({
              name: 'label',
              title: 'Step name',
              type: 'string',
              validation: (R) => R.required().error('Please give this step a name.'),
            }),
            defineField({
              name: 'body',
              title: 'What happens in this step',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'block',
                  styles: [{ title: 'Paragraph', value: 'normal' }],
                  marks: {
                    decorators: [
                      { title: 'Bold', value: 'strong' },
                      { title: 'Italic', value: 'em' },
                    ],
                    annotations: [],
                  },
                }),
              ],
            }),
            defineField({
              name: 'image',
              title: 'Photo for this step',
              type: 'image',
              description: 'Leave it empty to show a small stitched drawing instead.',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'number' } },
        }),
      ],
      validation: (R) => R.max(8).warning('More than eight steps is a lot to read.'),
    }),

    // ── Questions ────────────────────────────────────────────────────────────
    defineField({
      name: 'faqHeadline',
      title: 'Heading above the questions',
      type: 'string',
      group: 'faq',
      description:
        'The questions themselves live in Questions and answers. Tick "Show on How It Works" on a question to show it here.',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'faqSubhead',
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'faq',
      description: 'For example "More questions? Send me an email." Leave it empty to hide it.',
    }),

    // ── Closing banner ───────────────────────────────────────────────────────
    defineField({
      name: 'ctaEyebrow',
      ...BANNER_EYEBROW,
      type: 'string',
      group: 'cta',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'ctaHeadline',
      ...BANNER_HEADLINE,
      type: 'string',
      group: 'cta',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'ctaSubhead',
      ...BANNER_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'cta',
    }),
    defineField({
      name: 'ctaLabel',
      ...BANNER_BUTTON,
      type: 'string',
      group: 'cta',
      initialValue: 'Request a Quote',
      validation: (R) => R.max(50).warning(TOO_LONG),
    }),
    defineField({
      name: 'ctaHref',
      ...BANNER_LINK,
      type: 'string',
      group: 'cta',
      initialValue: '/request-a-quote',
    }),

    // ── Google and sharing ───────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      ...SEO_TITLE,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      validation: (R) => R.max(60).warning(SEO_TITLE_TOO_LONG),
    }),
    defineField({
      name: 'seoDescription',
      ...SEO_DESCRIPTION,
      type: 'text',
      rows: 3,
      group: 'seo',
      fieldset: 'seo',
      validation: (R) => R.max(160).warning(SEO_DESCRIPTION_TOO_LONG),
    }),
    defineField({
      name: 'seoImage',
      ...SEO_IMAGE,
      type: 'image',
      group: 'seo',
      fieldset: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
    }),

    // ── Hidden: not on the redesigned page (data kept) ───────────────────────
    defineField({
      name: 'stepsSubhead',
      title: 'Old line under the steps heading (not used)',
      type: 'text',
      rows: 2,
      hidden: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'How It Works page', subtitle: 'The page at /how-it-works' }),
  },
});
