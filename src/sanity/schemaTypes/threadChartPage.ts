// Thread Color Chart page singleton. The color swatches come from the
// threadColor collection. This singleton holds all the words around them.
//
// 2026-10-05, Mary Ann's Studio pass: page order with Google last, only the
// headline required, plain titles from ./_copy.ts.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ColorWheelIcon } from '@sanity/icons';
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

export const threadChartPage = defineType({
  name: 'threadChartPage',
  title: 'Thread Color Chart page',
  type: 'document',
  icon: ColorWheelIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'page', title: 'Top of the page' },
    { name: 'chart', title: 'Beside the thread colors' },
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
      group: 'page',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroHeadline',
      ...HERO_HEADLINE,
      type: 'string',
      group: 'page',
      validation: (R) => [R.required().error(HEADLINE_NEEDED), R.max(100).warning(TOO_LONG)],
    }),
    defineField({
      name: 'heroSubhead',
      ...HERO_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'page',
    }),
    defineField({
      name: 'intro',
      title: 'A few words about the chart',
      type: 'array',
      group: 'page',
      description: 'What the chart shows and how to use it.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
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

    // ── Beside the thread colors ─────────────────────────────────────────────
    defineField({
      name: 'filterLabel',
      title: 'Label on the color search box',
      type: 'string',
      group: 'chart',
      description:
        'The words above the box visitors type in to find a color, for example "Search colors". The colors themselves are in Fonts, threads and categories.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'matchingNote',
      title: 'Note about matching colors',
      type: 'text',
      rows: 2,
      group: 'chart',
      description:
        'How close a screen color is to the real thread, or how to ask for a color that is not listed.',
    }),
    defineField({
      name: 'customColorNote',
      title: 'One line about asking for other colors',
      type: 'string',
      group: 'chart',
      description:
        'For example "Need a specific color? Just ask in your quote request." Leave it empty to hide it.',
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
  ],
  preview: {
    prepare: () => ({
      title: 'Thread Color Chart page',
      subtitle: 'The page at /thread-color-chart',
    }),
  },
});
