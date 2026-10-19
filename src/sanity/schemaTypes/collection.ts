// Safe to edit by hand (the words); field names hold data, never rename them
// =============================================================================
// "Gift guides and seasons": a page of her work for one season or occasion
// =============================================================================
// Added 2026-10-18 for the seasons of her shop: a Christmas gift guide, wedding
// season, graduation, back to school, Mother's Day, baby showers. Each one is a
// page at /collections/<address>/ (src/pages/collections/[slug].astro) drawn in
// the Atelier's own look: the Midnight opening band with a big hoop, her words,
// the "order by" date, then the photos of her work for that season, the items
// to start from, and the quote button.
//
// The photos are DERIVED at build time (rule: anything computable from data is
// never retyped): every photo of her work carrying one of the tags she picks
// here, after any photos she picks by hand. So tagging a new photo "wedding"
// puts it on the wedding page with no second step.
//
// Starting points with her words in [square brackets]: src/sanity/templates.ts
// (one per season). A box still holding brackets gets a gentle yellow note.
// =============================================================================

import { defineArrayMember, defineField, defineType } from 'sanity';
import {
  BANNER_EYEBROW,
  BANNER_GROUP_TITLE,
  BANNER_HEADLINE,
  BANNER_SUBHEAD,
  HERO_EYEBROW,
  PHOTO_WORDS,
  PHOTO_WORDS_NEEDED,
  SEO_DESCRIPTION,
  SEO_DESCRIPTION_TOO_LONG,
  SEO_FIELDSET,
  SEO_GROUP,
  SEO_IMAGE,
  SEO_TITLE,
  SEO_TITLE_TOO_LONG,
  TOO_LONG,
  bracketsLeft,
} from './_copy';
import { SEO_PREVIEW } from './_seoPreview';
import { isReservedSlug } from '../../lib/reservedSlugs';

export const collection = defineType({
  name: 'collection',
  title: 'Gift guide or season page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Top of the page', default: true },
    { name: 'photos', title: 'Photos and items' },
    { name: 'banner', title: BANNER_GROUP_TITLE },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    defineField({
      name: 'name',
      title: 'Name of the page',
      type: 'string',
      group: 'content',
      description:
        'What you call it, for example "Christmas gift guide". It is also the big heading unless you type a different one below.',
      validation: (Rule) => [
        Rule.required().error('Please give the page a name.'),
        Rule.custom(bracketsLeft).warning(),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'content',
      description:
        'The end of the page address: mas-monograms.com/collections/this-part/. Press Generate to make it from the name. Once you have shared the link, leave it alone.',
      options: { source: 'name', maxLength: 60 },
      validation: (Rule) =>
        Rule.required()
          .error('Please press Generate to give the page a web address.')
          .custom((slug) =>
            slug?.current && isReservedSlug(slug.current)
              ? 'That address is already one of your pages. Please pick another.'
              : true,
          ),
    }),
    defineField({
      name: 'eyebrow',
      ...HERO_EYEBROW,
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.custom(bracketsLeft).warning(),
    }),
    defineField({
      name: 'headline',
      title: 'Headline (you can leave this empty)',
      type: 'string',
      group: 'content',
      description:
        'The big heading at the top. Leave it empty to use the name of the page. The first word is stitched in the script letters.',
      validation: (Rule) => [Rule.max(70).warning(TOO_LONG), Rule.custom(bracketsLeft).warning()],
    }),
    defineField({
      name: 'intro',
      title: 'A few words about it',
      type: 'text',
      rows: 4,
      group: 'content',
      description:
        'Two or three sentences under the heading: who these are for, and what you can stitch on them.',
      validation: (Rule) => [Rule.max(320).warning(TOO_LONG), Rule.custom(bracketsLeft).warning()],
    }),
    defineField({
      name: 'orderBy',
      title: 'Order by (you can leave this empty)',
      type: 'string',
      group: 'content',
      description:
        'The date to order by, in your words, for example "Order by December 1 for Christmas". Shown under the words in a stitched box.',
      validation: (Rule) => [Rule.max(90).warning(TOO_LONG), Rule.custom(bracketsLeft).warning()],
    }),
    defineField({
      name: 'heroImage',
      title: 'Photo in the big hoop (you can leave this empty)',
      type: 'image',
      group: 'content',
      description: 'Leave it empty to use the first photo shown below.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          ...PHOTO_WORDS,
          type: 'string',
          validation: (Rule) =>
            Rule.custom((alt, ctx) => {
              const parent = ctx.parent as { asset?: unknown } | undefined;
              return parent?.asset && !alt ? PHOTO_WORDS_NEEDED : true;
            }),
        }),
      ],
    }),
    defineField({
      name: 'photoTags',
      title: 'Show photos of my work with these tags',
      type: 'array',
      group: 'photos',
      description:
        'Type a tag and press Enter, for example "christmas" or "wedding". Every photo of your work with one of these tags shows on this page, so tagging a new photo is enough to add it.',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'photos',
      title: 'And these photos first (you can leave this empty)',
      type: 'array',
      group: 'photos',
      description: 'Pick photos of your work to show first, in this order.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'galleryItem' }],
          options: { disableNew: true },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'itemsHeading',
      title: 'Heading above the items',
      type: 'string',
      group: 'photos',
      initialValue: 'Start from one of these',
      validation: (Rule) => Rule.custom(bracketsLeft).warning(),
    }),
    defineField({
      name: 'categories',
      title: 'Items to start from',
      type: 'array',
      group: 'photos',
      description:
        'The shop categories that suit this season, for example Towels and Totes. Pick just one and the quote button starts the form on that item.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'itemCategory' }],
          options: { disableNew: true },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Words on the quote button',
      type: 'string',
      group: 'photos',
      initialValue: 'Request a Quote',
    }),
    defineField({ name: 'bannerEyebrow', ...BANNER_EYEBROW, type: 'string', group: 'banner' }),
    defineField({ name: 'bannerHeadline', ...BANNER_HEADLINE, type: 'string', group: 'banner' }),
    defineField({
      name: 'bannerSubhead',
      ...BANNER_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'banner',
    }),
    // The live Google and shared-link preview (writes nothing).
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
  ],
  preview: {
    select: {
      name: 'name',
      slug: 'slug.current',
      image: 'heroImage',
      orderBy: 'orderBy',
    },
    prepare: ({ name, slug, image, orderBy }) => ({
      title: name || 'A page with no name yet',
      subtitle: [slug ? `/collections/${slug}/` : 'No web address yet', orderBy]
        .filter(Boolean)
        .join(' · '),
      media: image?.asset ? image : undefined,
    }),
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    { title: 'By name', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
  ],
});
