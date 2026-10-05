// Style Gallery page singleton. The photos live in the galleryItem collection
// (Photos of my work). This singleton holds the words around them and the
// labels on the filters and the photo viewer.
//
// 2026-10-05, Mary Ann's Studio pass: page order with Google last, only the
// headline required, plain titles from ./_copy.ts. `additionalFilterTags` is
// hidden: the redesigned page builds its filters from `filterGroups` and never
// reads it (data kept).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ImagesIcon } from '@sanity/icons';
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

export const styleGalleryPage = defineType({
  name: 'styleGalleryPage',
  title: 'Style Gallery page',
  type: 'document',
  icon: ImagesIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Top of the page' },
    { name: 'filters', title: 'Filters above the photos' },
    { name: 'viewer', title: 'Words under and around the photos' },
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
    defineField({
      name: 'introCtaLabel',
      title: 'Button under the intro',
      type: 'string',
      group: 'hero',
      description:
        'The button that takes people to the quote form, for example "Start your quote". Leave it empty to hide it.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),

    // ── Filters above the photos ─────────────────────────────────────────────
    defineField({
      name: 'filterGroups',
      title: 'Filter groups',
      type: 'array',
      group: 'filters',
      description:
        'The filter buttons above the photos, sorted under small headings like "Item" or "Theme and Occasion". Each heading lists the tags (from your photos) that belong under it. A tag only shows once a photo uses it, so you can list one early. Tags you leave out of every group stay hidden, which is handy for private tags like "closeup".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'filterGroup',
          fields: [
            defineField({
              name: 'groupLabel',
              title: 'Heading for this group',
              type: 'string',
              description: 'Shown above this group of buttons, for example "Item" or "Recipient".',
              validation: (R) => [
                R.required().error('Please give this group a heading.'),
                R.max(40).warning(TOO_LONG),
              ],
            }),
            defineField({
              name: 'tags',
              title: 'Tags in this group',
              type: 'array',
              description:
                'Type each tag exactly as it is written on your photos, for example "tote" or "baby-hat". The buttons show them with capital letters on their own, and the most used tags come first.',
              of: [defineArrayMember({ type: 'string' })],
            }),
          ],
          preview: {
            select: { title: 'groupLabel', tags: 'tags' },
            prepare: ({ title, tags }) => ({
              title: title ?? '(no heading yet)',
              subtitle: Array.isArray(tags)
                ? `${tags.length} tag${tags.length === 1 ? '' : 's'}`
                : 'No tags yet',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'filterAllLabel',
      title: 'Words on the "show everything" button',
      type: 'string',
      group: 'filters',
      description: 'For example "All styles" or "All".',
      initialValue: 'All',
      validation: (R) => R.max(30).warning(TOO_LONG),
    }),
    defineField({
      name: 'filterToggleLabel',
      title: 'Filter button on phones',
      type: 'string',
      group: 'filters',
      description:
        'On a phone the filters fold away behind one button. These are the words on it, for example "Filter photos".',
      validation: (R) => R.max(30).warning(TOO_LONG),
    }),
    defineField({
      name: 'moreTagsLabel',
      title: '"Show more" button in a long group',
      type: 'string',
      group: 'filters',
      description:
        'A long group shows its first few buttons and folds the rest away. Write {count} where the number of hidden ones goes, for example "+ {count} more".',
      validation: (R) => R.max(30).warning(TOO_LONG),
    }),
    defineField({
      name: 'lessTagsLabel',
      title: '"Show fewer" button',
      type: 'string',
      group: 'filters',
      description: 'The same button once everything is showing, for example "Less".',
      validation: (R) => R.max(30).warning(TOO_LONG),
    }),
    defineField({
      name: 'filterFallbackHeading',
      title: 'Heading when there are no filter groups',
      type: 'string',
      group: 'filters',
      description:
        'Only used if "Filter groups" above is empty: then every tag shows under this one heading, for example "Filters".',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'emptyStateMessage',
      title: 'Message when a filter finds no photos',
      type: 'string',
      group: 'filters',
      description: 'For example "No photos for that filter yet. Check back soon."',
      initialValue: 'No photos for that filter yet. Check back soon.',
    }),
    defineField({
      name: 'filterGroupName',
      title: 'Name of the filter area, read aloud',
      type: 'string',
      group: 'filters',
      description:
        'People who use a screen reader hear the filter buttons announced by this name, for example "Filter gallery".',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'resultsAnnouncement',
      title: 'What is read aloud after picking a filter',
      type: 'string',
      group: 'filters',
      description:
        'For people who use a screen reader. Write {filter} for the filter name, {count} for the photos shown and {total} for all photos, for example "{filter}: showing {count} of {total} photos".',
      validation: (R) => R.max(120).warning(TOO_LONG),
    }),

    // ── Words under and around the photos ────────────────────────────────────
    defineField({
      name: 'requestLabel',
      title: 'Small link under each photo',
      type: 'string',
      group: 'viewer',
      description:
        'The link under a photo that starts a quote for that kind of item. Leave it empty to use "Request this".',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'fontCaption',
      title: 'Font line under each photo',
      type: 'string',
      group: 'viewer',
      description:
        'Names the embroidery font under a photo. Write {font} where the font name goes, for example "{font} font". Also used on the item pages and in the large photo view.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'lightboxLabel',
      title: 'Name of the large photo view, read aloud',
      type: 'string',
      group: 'viewer',
      description:
        'Clicking a photo opens it large. Screen readers announce it by this name, for example "Photo viewer". Also used on the item pages.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'lightboxCloseLabel',
      title: 'Close button, read aloud',
      type: 'string',
      group: 'viewer',
      description: 'The button shows an ×. Screen readers say these words, for example "Close".',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'lightboxPrevLabel',
      title: 'Previous photo button, read aloud',
      type: 'string',
      group: 'viewer',
      description: 'For example "Previous photo".',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'lightboxNextLabel',
      title: 'Next photo button, read aloud',
      type: 'string',
      group: 'viewer',
      description: 'For example "Next photo".',
      validation: (R) => R.max(40).warning(TOO_LONG),
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

    // ── Hidden: not read by the redesigned page (data kept) ──────────────────
    defineField({
      name: 'additionalFilterTags',
      title: 'Old extra filter buttons (not used)',
      type: 'array',
      hidden: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'filterTag',
          fields: [
            defineField({ name: 'label', title: 'Words on the button', type: 'string' }),
            defineField({ name: 'tag', title: 'Tag', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'tag' } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Style Gallery page',
      subtitle: 'The page at /style-gallery: the words around your photos',
    }),
  },
});
