// Style Gallery page singleton. The gallery images live in the galleryItem
// collection. This singleton controls all the copy and filter labels.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ImagesIcon } from '@sanity/icons';

export const styleGalleryPage = defineType({
  name: 'styleGalleryPage',
  title: 'Style Gallery Page',
  type: 'document',
  icon: ImagesIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',     title: 'SEO' },
    { name: 'hero',    title: 'Hero', default: true },
    { name: 'filters', title: 'Filter labels' },
    { name: 'cta',     title: 'CTA' },
  ],
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Social share image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),

    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', group: 'hero', validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'hero', validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Subhead (optional)', type: 'text', rows: 2, group: 'hero' }),
    defineField({ name: 'heroImage', title: 'Hero image (optional)', type: 'image', group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })] }),

    defineField({
      name: 'filterAllLabel',
      title: '"All" filter chip label',
      type: 'string',
      group: 'filters',
      description: 'Label for the "show everything" chip. E.g. "All styles" or "All items".',
      initialValue: 'All',
      validation: (R) => R.required().max(30),
    }),
    defineField({
      name: 'additionalFilterTags',
      title: 'Additional filter tags',
      type: 'array',
      group: 'filters',
      description: 'Custom tag filters shown in addition to the item category filters. E.g. "Wedding", "Gifts", "Teams".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'filterTag',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'tag', title: 'Tag value (matches galleryItem tags)', type: 'string', validation: (R) => R.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'tag' } },
        }),
      ],
    }),
    defineField({
      name: 'filterGroups',
      title: 'Filter groups',
      type: 'array',
      group: 'filters',
      description:
        'Group the gallery filter tags under headings (e.g. "Item", "Theme & Occasion") so browsers see a tidy, organized filter instead of one long wall of tags. Each heading lists the raw tags that should appear beneath it. Only tags that actually appear on a photo will show — you can safely list a tag here before any photo uses it. Tags you leave out of every group are hidden from the filter entirely, which is handy for internal-only tags like "closeup" or "customer-photo".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'filterGroup',
          fields: [
            defineField({
              name: 'groupLabel',
              title: 'Group heading',
              type: 'string',
              description: 'Shown above this group of filter chips. E.g. "Item", "Theme & Occasion", "Technique & Style", "Recipient".',
              validation: (R) => R.required().max(40),
            }),
            defineField({
              name: 'tags',
              title: 'Tags in this group',
              type: 'array',
              description: 'The raw galleryItem tag values that belong under this heading (e.g. "tote", "napkin", "baby-hat"). Chips display in title case automatically. Order does not matter — the site shows the most-photographed tags first.',
              of: [defineArrayMember({ type: 'string' })],
              validation: (R) => R.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'groupLabel', tags: 'tags' },
            prepare: ({ title, tags }) => ({
              title: title ?? '(no heading)',
              subtitle: Array.isArray(tags) ? `${tags.length} tag${tags.length === 1 ? '' : 's'}` : 'No tags',
            }),
          },
        }),
      ],
    }),
    defineField({ name: 'emptyStateMessage', title: 'Empty state message', type: 'string', group: 'filters',
      description: 'Shown when no gallery items match the current filter.',
      initialValue: 'No photos for that filter yet — check back soon!',
      validation: (R) => R.required() }),

    defineField({ name: 'ctaEyebrow', title: 'CTA eyebrow', type: 'string', group: 'cta', validation: (R) => R.required().max(60) }),
    defineField({ name: 'ctaHeadline', title: 'CTA headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'CTA body (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button destination', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'Style Gallery Page' }) },
});
