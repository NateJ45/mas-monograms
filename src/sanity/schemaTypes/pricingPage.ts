// Pricing page singleton. All copy on the /pricing page comes from here.
// The price tags themselves are the pricingTier collection; this page holds
// the words around them, the extras, the rush note and the questions heading.
//
// 2026-10-05, Mary Ann's Studio pass: fields in page order with Google last,
// six tabs, only the headline required, plain titles from ./_copy.ts.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { BillIcon } from '@sanity/icons';
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

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing page',
  type: 'document',
  icon: BillIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Top of the page' },
    { name: 'tiers', title: 'Price tags' },
    { name: 'addons', title: 'Extras and rush orders' },
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

    // ── Price tags ───────────────────────────────────────────────────────────
    defineField({
      name: 'tiersHeadline',
      title: 'Heading above the price tags',
      type: 'string',
      group: 'tiers',
      description:
        'The prices themselves are in Clearance and prices, under Price tags. This is only the heading.',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'tiersSubhead',
      title: 'A few words about how pricing works',
      type: 'text',
      rows: 3,
      group: 'tiers',
      description:
        'Shown above the price tags, for example "Price per piece drops with quantity...".',
    }),
    defineField({
      name: 'tierPricePrefix',
      title: 'Small word before each price',
      type: 'string',
      group: 'tiers',
      description:
        'The small word above every price on the tags, for example "from" (as in "from $16"). Leave it empty to show the price on its own.',
      validation: (R) => R.max(20).warning(TOO_LONG),
    }),

    // ── Extras and rush orders ───────────────────────────────────────────────
    defineField({
      name: 'addonsHeadline',
      title: 'Heading above the extras',
      type: 'string',
      group: 'addons',
    }),
    defineField({
      name: 'addons',
      title: 'Extras',
      type: 'array',
      group: 'addons',
      description:
        'Optional extras and what they cost, for example "Extra embroidery spot: +$5 per piece". Drag to change the order.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'addon',
          fields: [
            defineField({
              name: 'label',
              title: 'Name of the extra',
              type: 'string',
              validation: (R) => R.required().error('Please give this extra a name.'),
            }),
            defineField({
              name: 'price',
              title: 'What it costs',
              type: 'string',
              description: 'For example "+$3 per piece" or "ask for a quote".',
            }),
            defineField({ name: 'note', title: 'Small note', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'price' } },
        }),
      ],
    }),
    defineField({
      name: 'rushHeadline',
      title: 'Heading above the rush order note',
      type: 'string',
      group: 'addons',
    }),
    defineField({
      name: 'rushBody',
      title: 'Rush order note',
      type: 'array',
      group: 'addons',
      description: 'Explain the rush option and any extra cost.',
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

    // ── Questions ────────────────────────────────────────────────────────────
    defineField({
      name: 'faqHeadline',
      title: 'Heading above the questions',
      type: 'string',
      group: 'faq',
      description:
        'The questions themselves live in Questions and answers. Tick "Show on Pricing" on a question to show it here.',
      validation: (R) => R.max(100).warning(TOO_LONG),
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
      title: 'Pricing page',
      subtitle: 'The page at /pricing: the words around your price tags',
    }),
  },
});
