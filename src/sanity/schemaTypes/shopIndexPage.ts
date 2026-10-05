// Shop by Item page singleton. This page shows the grid of item categories.
// The categories themselves live in the itemCategory collection.
//
// 2026-10-05, Mary Ann's Studio pass: page order with Google last, only the
// headline required, plain titles from ./_copy.ts. The closing banner here is
// ALSO the fallback banner on every item page (src/pages/[slug].astro reads
// shopPage.cta*), which the banner tab now says.

import { defineType, defineField } from 'sanity';
import { BasketIcon } from '@sanity/icons';
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
  BANNER_EYEBROW,
  BANNER_HEADLINE,
  BANNER_SUBHEAD,
  BANNER_BUTTON,
  BANNER_LINK,
} from './_copy';
import { SEO_PREVIEW } from './_seoPreview';

export const shopIndexPage = defineType({
  name: 'shopIndexPage',
  title: 'Shop by Item page',
  type: 'document',
  icon: BasketIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'page', title: 'Top of the page' },
    { name: 'cta', title: 'Closing banner (also on every item page)' },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
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
      name: 'gridIntro',
      title: 'A few words above the item cards',
      type: 'text',
      rows: 2,
      group: 'page',
      description:
        'The item cards come from Fonts, threads and categories, under Shop categories. Leave this empty to hide it.',
    }),

    // ── Closing banner (also the fallback on every item page) ────────────────
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
      description:
        'The big words in the dark banner at the bottom of this page. Every item page (Hats, Totes...) uses this banner too, unless that item has its own banner words.',
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
    // Phase D: the live Google and shared-link preview (writes nothing).
    defineField({
      name: 'seoPreview',
      ...SEO_PREVIEW,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
    }),
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
      title: 'Shop by Item page',
      subtitle: 'The page at /shop-by-item, with a card for each item',
    }),
  },
});
