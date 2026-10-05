// Clearance page singleton. The clearance items live in the clearanceItem
// collection. This singleton holds all the words on the page.
//
// 2026-10-05, Mary Ann's Studio pass: page order with Google last, only the
// headline required (the intro, the badge, the buy button and the empty
// message all have built-in fallbacks in src/pages/clearance.astro), plain
// titles from ./_copy.ts.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TagIcon } from '@sanity/icons';
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
  BUTTON_LINK_HELP,
} from './_copy';

export const clearancePage = defineType({
  name: 'clearancePage',
  title: 'Clearance page',
  type: 'document',
  icon: TagIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'page', title: 'Top of the page' },
    { name: 'items', title: 'On each item' },
    { name: 'empty', title: 'When nothing is for sale' },
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
      title: 'A few words about clearance',
      type: 'array',
      group: 'page',
      description: 'A short note about the ready-made items for sale.',
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
    defineField({
      name: 'paymentNote',
      title: 'Note about paying',
      type: 'string',
      group: 'page',
      description: 'For example "Each item has its own secure checkout through Stripe."',
    }),
    defineField({
      name: 'pickupNote',
      title: 'Note about pickup or shipping',
      type: 'string',
      group: 'page',
      description: 'For example "Local pickup in St. Matthews, SC only."',
    }),

    // ── On each item ─────────────────────────────────────────────────────────
    defineField({
      name: 'buyButtonLabel',
      title: 'Words on the Buy button',
      type: 'string',
      group: 'items',
      description:
        'The button on each item that opens its Stripe checkout. The items themselves are in Clearance and prices.',
      initialValue: 'Buy now',
    }),
    defineField({
      name: 'soldOutLabel',
      title: 'Badge on a sold item',
      type: 'string',
      group: 'items',
      description: 'Leave it empty to use "Sold Out".',
      initialValue: 'Sold',
    }),
    defineField({
      name: 'quantityLeftLabel',
      title: '"How many left" line',
      type: 'string',
      group: 'items',
      description:
        'Shown on an item when you have said how many are left. Write {count} where the number goes, for example "{count} left". Leave it empty to hide it.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),

    // ── When nothing is for sale ─────────────────────────────────────────────
    defineField({
      name: 'emptyStateMessage',
      title: 'Message when nothing is for sale',
      type: 'string',
      group: 'empty',
      description: 'Shown when there are no clearance items on the page.',
      initialValue: 'Nothing in the clearance section right now. Check back soon.',
    }),
    defineField({
      name: 'emptyStateCtaLabel',
      title: 'Words on the main button',
      type: 'string',
      group: 'empty',
      description: 'A button under that message. Leave it empty to hide it.',
      initialValue: 'Request a custom quote',
    }),
    defineField({
      name: 'emptyStateCtaHref',
      title: 'Where the main button goes',
      type: 'string',
      group: 'empty',
      description: BUTTON_LINK_HELP,
      initialValue: '/request-a-quote',
    }),
    defineField({
      name: 'emptyStateSecondaryLabel',
      title: 'Words on the quieter link',
      type: 'string',
      group: 'empty',
      description: 'A quieter link beside the button. Leave it empty to hide it.',
      initialValue: 'Browse what I make',
    }),
    defineField({
      name: 'emptyStateSecondaryHref',
      title: 'Where the quieter link goes',
      type: 'string',
      group: 'empty',
      description: BUTTON_LINK_HELP,
      initialValue: '/shop-by-item',
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
      initialValue: 'Request a Custom Order',
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
      title: 'Clearance page',
      subtitle: 'The page at /clearance: the words around your items',
    }),
  },
});
