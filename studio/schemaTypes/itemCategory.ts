// Item category document. Each category (Shirts, Hats, Golf Bags, etc.)
// gets its own page at /{slug} and a card in the Shop by Item grid.
// Everything on that page — heading, intro, trust strip — comes from here.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { PackageIcon } from '@sanity/icons';

export const itemCategory = defineType({
  name: 'itemCategory',
  title: 'Item Category',
  type: 'document',
  icon: PackageIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Category name',
      type: 'string',
      description: 'Shown as the page heading and grid card title. E.g. "Polos & Shirts".',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      description: 'The URL for this page. E.g. "shirts" → mas-monograms.com/shirts.',
      options: { source: 'name', maxLength: 50 },
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow label (optional)',
      type: 'string',
      description: 'Small label above the heading. E.g. "Most popular" or "Great for gifts".',
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Intro paragraph shown at the top of the category page.',
      group: 'content',
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero images',
      type: 'array',
      group: 'content',
      description: 'One to three photos for the hero. Two or more creates a slow cross-fade slideshow.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
    defineField({
      name: 'cardImage',
      title: 'Grid card image',
      type: 'image',
      group: 'content',
      description: 'Thumbnail shown in the Shop by Item category grid. Square crop works best.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'trustItems',
      title: 'Trust strip items',
      type: 'array',
      group: 'content',
      description: 'Short reassuring lines shown in the trust strip below the hero. E.g. "Starting at $12 per piece" or "Minimum 12 pieces".',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(2).max(5),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      group: 'content',
      description: 'Text on the quote request button. E.g. "Request a quote for shirts".',
      initialValue: 'Request a quote',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      group: 'content',
      description: 'Lower numbers appear first in the Shop by Item grid.',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'featured',
      title: 'Featured on home page',
      type: 'boolean',
      group: 'content',
      description: 'When on, this category appears in the homepage categories preview.',
      initialValue: false,
    }),

    // SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Browser tab and Google title. Aim for 50–60 characters.',
      validation: (Rule) => Rule.max(60).warning('Over 60 characters may be cut off in search results.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Shown under the title in Google. Aim for 150–160 characters.',
      validation: (Rule) => Rule.max(160).warning('Over 160 characters may be cut off in search results.'),
    }),
    defineField({
      name: 'seoImage',
      title: 'Social share image',
      type: 'image',
      group: 'seo',
      description: 'Image shown when this page is shared. ~1200 × 630 px. Overrides the site default.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'slug.current', media: 'cardImage' },
    prepare: ({ title, subtitle, media }) => ({
      title: title ?? '(unnamed category)',
      subtitle: subtitle ? `/${subtitle}` : '(no slug)',
      media,
    }),
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
    { title: 'Name A–Z', name: 'nameAZ', by: [{ field: 'name', direction: 'asc' }] },
  ],
});
