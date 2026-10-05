// Thread color document. Each color in Mary Ann's thread inventory.
// Displayed on the Thread Color Chart page and in the monogram preview.
//
// 2026-10-05, Mary Ann's Studio pass: plain titles. `swatchImage` is hidden:
// the chart draws a spool in the color code and never shows the photo (data
// kept). `slug` stays (the monogram preview and the chart's search use it) but
// is no longer required, and moves to the bottom.

import { createElement } from 'react';
import { defineType, defineField } from 'sanity';
import { ColorWheelIcon } from '@sanity/icons';
import { PHOTO_WORDS } from './_copy';

export const threadColor = defineType({
  name: 'threadColor',
  title: 'Thread color',
  type: 'document',
  icon: ColorWheelIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Color name',
      type: 'string',
      description: 'For example "Navy Blue" or "Blush Pink".',
      validation: (Rule) => Rule.required().error('Please give this color a name.'),
    }),
    defineField({
      name: 'hexColor',
      title: 'Color code',
      type: 'string',
      description:
        'A color code starting with #, for example "#1a3a5c". It paints the spool on the chart. Any color picker online will give you one.',
      validation: (Rule) =>
        Rule.required()
          .regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex', invert: false })
          .error('Please type a color code like #1a3a5c (a # and six letters or numbers).'),
    }),
    defineField({
      name: 'colorFamily',
      title: 'Color family',
      type: 'string',
      description: 'The chart sorts colors by family.',
      options: {
        list: [
          { title: 'Blues and navies', value: 'blue' },
          { title: 'Greens', value: 'green' },
          { title: 'Reds and pinks', value: 'red' },
          { title: 'Oranges and yellows', value: 'orange' },
          { title: 'Purples', value: 'purple' },
          { title: 'Browns and tans', value: 'brown' },
          { title: 'Blacks and grays', value: 'gray' },
          { title: 'Whites and creams', value: 'white' },
          { title: 'Metallic', value: 'metallic' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'dmcNumber',
      title: 'DMC thread number',
      type: 'string',
      description: 'Shown under the color name, for example "DMC 336". Leave it empty to hide it.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Position in its family',
      type: 'number',
      description: 'Smaller numbers come first within the color family.',
      initialValue: 99,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1, 2 or 3.'),
    }),
    defineField({
      name: 'slug',
      title: 'Short name for the website',
      type: 'slug',
      description: 'Made from the color name. Press Generate if it is empty.',
      options: { source: 'name', maxLength: 50 },
    }),

    // ── Hidden: the chart does not show it (data kept) ───────────────────────
    defineField({
      name: 'swatchImage',
      title: 'Old swatch photo (not used)',
      type: 'image',
      hidden: true,
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
    }),
  ],
  __experimental_search: [
    { path: 'name', weight: 10 },
    { path: 'dmcNumber', weight: 5 },
  ],
  preview: {
    select: { title: 'name', family: 'colorFamily', hex: 'hexColor', dmc: 'dmcNumber' },
    prepare: ({ title, family, hex, dmc }) => ({
      title: title ?? '(no name yet)',
      subtitle: [dmc ? `DMC ${dmc}` : '', family ?? '', hex ?? ''].filter(Boolean).join(' · '),
      // A round dot in the thread's own color, so the list reads like the chart.
      media: /^#[0-9A-Fa-f]{6}$/.test(hex ?? '')
        ? createElement('span', {
            'aria-hidden': true,
            style: {
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: hex,
              boxShadow: 'inset 0 0 0 1px rgba(38, 49, 46, 0.25)',
            },
          })
        : undefined,
    }),
  },
  orderings: [
    {
      title: 'Color family, then position',
      name: 'familyOrder',
      by: [
        { field: 'colorFamily', direction: 'asc' },
        { field: 'displayOrder', direction: 'asc' },
      ],
    },
    { title: 'Name A to Z', name: 'nameAZ', by: [{ field: 'name', direction: 'asc' }] },
  ],
});
