// Thread color document. Each color in Mary Ann's thread inventory.
// Displayed on the Thread Color Chart page.

import { defineType, defineField } from 'sanity';
import { ColorWheelIcon } from '@sanity/icons';

export const threadColor = defineType({
  name: 'threadColor',
  title: 'Thread Color',
  type: 'document',
  icon: ColorWheelIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Color name',
      type: 'string',
      description: 'E.g. "Navy Blue" or "Blush Pink".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 50 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hexColor',
      title: 'Hex color',
      type: 'string',
      description: 'The approximate hex value for UI display. E.g. "#1a3a5c". Used for the color swatch chip in the chart.',
      validation: (Rule) =>
        Rule.required().regex(/^#[0-9A-Fa-f]{6}$/, {
          name: 'hex',
          invert: false,
        }).error('Must be a valid hex color like #1a3a5c.'),
    }),
    defineField({
      name: 'dmcNumber',
      title: 'DMC thread number (optional)',
      type: 'string',
      description: 'The DMC thread number for reference, if applicable.',
    }),
    defineField({
      name: 'swatchImage',
      title: 'Swatch photo (optional)',
      type: 'image',
      description: 'A photo of the actual thread or an embroidered swatch. More accurate than the hex color for customer reference.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'colorFamily',
      title: 'Color family',
      type: 'string',
      description: 'Used for grouping and filtering on the Thread Color Chart page.',
      options: {
        list: [
          { title: 'Blues & Navies', value: 'blue' },
          { title: 'Greens', value: 'green' },
          { title: 'Reds & Pinks', value: 'red' },
          { title: 'Oranges & Yellows', value: 'orange' },
          { title: 'Purples', value: 'purple' },
          { title: 'Browns & Tans', value: 'brown' },
          { title: 'Blacks & Grays', value: 'gray' },
          { title: 'Whites & Creams', value: 'white' },
          { title: 'Metallic', value: 'metallic' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first within their color family group.',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'colorFamily', hex: 'hexColor', media: 'swatchImage' },
    prepare: ({ title, subtitle, hex, media }) => ({
      title: title ?? '(unnamed color)',
      subtitle: `${subtitle ?? ''} · ${hex ?? ''}`,
      media,
    }),
  },
  orderings: [
    { title: 'Color family, then order', name: 'familyOrder', by: [{ field: 'colorFamily', direction: 'asc' }, { field: 'displayOrder', direction: 'asc' }] },
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
    { title: 'Name A–Z', name: 'nameAZ', by: [{ field: 'name', direction: 'asc' }] },
  ],
});
