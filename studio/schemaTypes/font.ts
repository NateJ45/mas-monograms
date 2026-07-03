// Embroidery font document. NOT a web font — each font is represented
// by a preview image showing what the lettering looks like when embroidered.
// Displayed on the Font & Lettering Guide page.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TextIcon } from '@sanity/icons';

export const font = defineType({
  name: 'font',
  title: 'Embroidery Font',
  type: 'document',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Font name',
      type: 'string',
      description: 'The name shown on the guide page. E.g. "Magnolia Script" or "Classic Block".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: { source: 'name', maxLength: 50 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'previewImage',
      title: 'Preview image',
      type: 'image',
      description: 'A photo or scan of this font embroidered on fabric. This IS the font — the website never loads font files.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Photo description (helps screen readers & Google)',
          type: 'string',
          description: 'E.g. "Magnolia Script font sample — embroidered on white fabric".',
          validation: (R) => R.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'styleTag',
      title: 'Style',
      type: 'string',
      description: 'The general style of this font.',
      options: {
        list: [
          { title: 'Classic / Traditional', value: 'classic' },
          { title: 'Script / Cursive', value: 'script' },
          { title: 'Block / Bold', value: 'block' },
          { title: 'Modern / Clean', value: 'modern' },
          { title: 'Monogram / Interlock', value: 'monogram' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description (optional)',
      type: 'text',
      rows: 2,
      description: 'One or two sentences describing the look and feel. E.g. "Elegant thin letterforms with flowing connections. Great for formal gifts."',
    }),
    defineField({
      name: 'bestFor',
      title: 'Best for',
      type: 'array',
      description: 'Short notes on what items or occasions this font works best on.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'popular',
      title: 'Popular pick',
      type: 'boolean',
      description: 'Mark as a frequently requested font. May show a "Popular" badge.',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first on the Font Guide page.',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'styleTag', media: 'previewImage' },
    prepare: ({ title, subtitle, media }) => ({
      title: title ?? '(unnamed font)',
      subtitle: subtitle ?? '',
      media,
    }),
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
    { title: 'Name A–Z', name: 'nameAZ', by: [{ field: 'name', direction: 'asc' }] },
    { title: 'Style', name: 'styleTag', by: [{ field: 'styleTag', direction: 'asc' }] },
  ],
});
