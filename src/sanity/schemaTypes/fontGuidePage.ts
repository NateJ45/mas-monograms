// Font & Lettering Guide page singleton. The font cards come from the font
// collection. This singleton holds the heading, intro and the words around
// the cards.
//
// 2026-10-05, Mary Ann's Studio pass: page order with Google last, only the
// headline required, plain titles from ./_copy.ts.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TextIcon } from '@sanity/icons';
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
import { SEO_PREVIEW } from './_seoPreview';

export const fontGuidePage = defineType({
  name: 'fontGuidePage',
  title: 'Font and Lettering Guide page',
  type: 'document',
  icon: TextIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'page', title: 'Top of the page' },
    { name: 'fonts', title: 'The font cards' },
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
      title: 'Your note before the fonts',
      type: 'array',
      group: 'page',
      description: 'One or two short paragraphs, for example tips on choosing a style.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
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

    // ── The font cards ───────────────────────────────────────────────────────
    defineField({
      name: 'fontGridEyebrow',
      title: 'Small line above the font cards',
      type: 'string',
      group: 'fonts',
      description:
        'The fonts themselves are in Fonts, threads and categories. A font only shows here once it has a photo.',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'fontGridHeadline',
      title: 'Heading above the font cards',
      type: 'string',
      group: 'fonts',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'popularLabel',
      title: 'Badge on popular fonts',
      type: 'string',
      group: 'fonts',
      description:
        'Shown on every font marked as a popular pick, for example "Popular". Leave it empty for no badge.',
      validation: (R) => R.max(30).warning(TOO_LONG),
    }),
    defineField({
      name: 'tryItLabel',
      title: '"Try it" link on a font card',
      type: 'string',
      group: 'fonts',
      description:
        'Opens the monogram preview on your home page with a matching style, for example "Try this style". Only fonts with a closest style picked get the link. Leave it empty to hide the links.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'customFontNote',
      title: 'Note about fonts that are not shown',
      type: 'text',
      rows: 2,
      group: 'fonts',
      description:
        'For example "Don\'t see the style you want? Just ask." Leave it empty to hide it.',
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
      title: 'Font and Lettering Guide page',
      subtitle: 'The page at /font-lettering-guide',
    }),
  },
});
