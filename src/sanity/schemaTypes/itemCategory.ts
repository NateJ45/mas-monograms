// Item category document. Each category (Shirts, Hats, Golf Bags, etc.)
// gets its own page at /{slug} and a card in the Shop by Item grid.
// Everything on that page (heading, intro, promises, banner) comes from here.
//
// 2026-10-05, Mary Ann's Studio pass: four tabs in page order plus Google,
// plain titles. Photos are no longer required: an item page with no photos of
// its own borrows photos of that item from the gallery ([slug].astro,
// pickHoopImages), and the card falls back to the first top photo
// (pickCardImage). "Bring Your Own Item" has neither on purpose, and the two
// required rules were a permanent red mark on it. `featured` is hidden: the
// home page now shows every category, so the switch changed nothing (data kept).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { PackageIcon } from '@sanity/icons';
import {
  SEO_FIELDSET,
  SEO_GROUP,
  SEO_TITLE,
  SEO_TITLE_TOO_LONG,
  SEO_DESCRIPTION,
  SEO_DESCRIPTION_TOO_LONG,
  SEO_IMAGE,
  PHOTO_WORDS,
  PHOTO_WORDS_NEEDED,
  TOO_LONG,
} from './_copy';

/** The alt box under a category photo: only asked for once there is a photo. */
const altField = defineField({
  name: 'alt',
  ...PHOTO_WORDS,
  type: 'string',
  validation: (R) =>
    R.custom((value, ctx: any) => (ctx.parent?.asset && !value ? PHOTO_WORDS_NEEDED : true)),
});

export const itemCategory = defineType({
  name: 'itemCategory',
  title: 'Shop category',
  type: 'document',
  icon: PackageIcon,
  groups: [
    { name: 'content', title: 'Top of the item page' },
    { name: 'card', title: 'Card on Shop by Item' },
    { name: 'photos', title: 'Photos and buttons' },
    { name: 'banner', title: 'Closing banner' },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    // ── Top of the item page ─────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Name of this item',
      type: 'string',
      description: 'The heading on its own page and on its card, for example "Polos & Shirts".',
      group: 'content',
      validation: (Rule) => Rule.required().error('Please give this item a name.'),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The end of this page\'s address, for example "shirts" makes mas-monograms.com/shirts. Press Generate to make one from the name. Changing it later breaks old links, so set it once.',
      options: { source: 'name', maxLength: 50 },
      group: 'content',
      validation: (Rule) =>
        Rule.required().error('Please press Generate so this item has a web address.'),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading',
      type: 'string',
      description: 'For example "Most popular" or "Great for gifts". Leave it empty to hide it.',
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'A few words about this item',
      type: 'text',
      rows: 4,
      description: 'The short paragraph at the top of its page.',
      group: 'content',
      validation: (Rule) => Rule.max(500).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroImages',
      title: 'Top-of-page photos',
      type: 'array',
      group: 'content',
      description:
        "One to three photos for the top of this item's page. Leave it empty to use photos of this item from Photos of my work.",
      of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [altField] })],
      validation: (Rule) =>
        Rule.max(4).warning('More than four photos is a lot for the top of a page.'),
    }),
    defineField({
      name: 'trustItems',
      title: 'Short promises under the top',
      type: 'array',
      group: 'content',
      description:
        'Short reassuring lines, for example "Starting at $12 per piece". Drag to change the order.',
      of: [defineArrayMember({ type: 'string' })],
      // Sensible starter lines for a new category: keep, tweak, or replace.
      initialValue: ['Hand-stitched to order', 'Local pickup or shipping'],
      validation: (Rule) => Rule.max(5).warning('More than five crowds the top of the page.'),
    }),

    // ── Card on Shop by Item ─────────────────────────────────────────────────
    defineField({
      name: 'cardImage',
      title: 'Photo on its card',
      type: 'image',
      group: 'card',
      description:
        "The photo on this item's card on Shop by Item and in the circles on your home page. A square photo works best. Leave it empty to use the first top-of-page photo.",
      options: { hotspot: true },
      fields: [altField],
    }),
    defineField({
      name: 'startingPrice',
      title: 'Starting price',
      type: 'string',
      group: 'card',
      description:
        'A short "from" price on its card, for example "from $16". Leave it empty to hide it.',
      validation: (Rule) => Rule.max(30).warning(TOO_LONG),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Position in the list',
      type: 'number',
      group: 'card',
      description: 'Smaller numbers come first, on Shop by Item and on your home page. 1 is first.',
      initialValue: 99,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1, 2 or 3.'),
    }),

    // ── Photos and buttons ───────────────────────────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'Words on the quote button',
      type: 'string',
      group: 'photos',
      description:
        'For example "Request a quote for shirts". Leave it empty to use "Request a Quote".',
      initialValue: 'Request a quote',
      validation: (Rule) => Rule.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'galleryHeading',
      title: "Heading above this item's photos",
      type: 'string',
      group: 'photos',
      description:
        'Shown above the photos of this item from Photos of my work, for example "Towels & Linens Gallery". Leave it empty to use the item name.',
      validation: (Rule) => Rule.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'requestSimilarLabel',
      title: 'Button under the photos',
      type: 'string',
      group: 'photos',
      description:
        'Starts a quote for this item, for example "Request something like this". Leave it empty to use the quote button words.',
      validation: (Rule) => Rule.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'crossSellHeading',
      title: 'Heading above the other items',
      type: 'string',
      group: 'photos',
      description:
        'Shown above the circles linking to your other items, for example "Explore Other Items". Leave it empty to use "More items".',
      validation: (Rule) => Rule.max(60).warning(TOO_LONG),
    }),

    // ── Closing banner ───────────────────────────────────────────────────────
    defineField({
      name: 'bannerEyebrow',
      title: 'Small line above the banner headline',
      type: 'string',
      group: 'banner',
      description:
        "The dark banner at the bottom of this item's page. Leave all three banner boxes empty to use the closing banner from the Shop by Item page.",
      validation: (Rule) => Rule.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'bannerHeadline',
      title: 'Banner headline',
      type: 'string',
      group: 'banner',
      validation: (Rule) => Rule.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'bannerSubhead',
      title: 'Banner text',
      type: 'text',
      rows: 2,
      group: 'banner',
    }),

    // ── Google and sharing ───────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      ...SEO_TITLE,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      validation: (Rule) => Rule.max(60).warning(SEO_TITLE_TOO_LONG),
    }),
    defineField({
      name: 'seoDescription',
      ...SEO_DESCRIPTION,
      type: 'text',
      rows: 3,
      group: 'seo',
      fieldset: 'seo',
      validation: (Rule) => Rule.max(160).warning(SEO_DESCRIPTION_TOO_LONG),
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

    // ── Hidden: no longer changes anything (data kept) ───────────────────────
    defineField({
      name: 'featured',
      title: 'Old "show on home page" switch (not used)',
      type: 'boolean',
      hidden: true,
    }),
  ],
  // Search weights (Phase A task 6): her own word for it is the item name.
  __experimental_search: [{ path: 'name', weight: 10 }],
  preview: {
    select: { title: 'name', subtitle: 'slug.current', media: 'cardImage', backup: 'heroImages.0' },
    prepare: ({ title, subtitle, media, backup }) => ({
      title: title ?? '(no name yet)',
      subtitle: subtitle ? `mas-monograms.com/${subtitle}` : 'No web address yet',
      media: media ?? backup,
    }),
  },
  orderings: [
    {
      title: 'Position in the list',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
    { title: 'Name A to Z', name: 'nameAZ', by: [{ field: 'name', direction: 'asc' }] },
  ],
});
