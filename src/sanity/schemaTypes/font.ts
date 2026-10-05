// Embroidery font document. NOT a web font: each font is shown as a photo of
// the lettering embroidered on fabric, on the Font & Lettering Guide page.
//
// 2026-10-05, Mary Ann's Studio pass: plain titles. The photo is no longer
// required: a font with no photo is simply left off the guide
// (font-lettering-guide.astro keeps only fonts with a photo), which ten of
// eighteen fonts are today. The required rule put a red mark on each of them;
// the "Needs a photo" badge (components/documentBadges.tsx) now says the same
// thing kindly. `slug` and `styleTag` are no longer required either: the site
// works without them (the slug only names the card's anchor).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TextIcon } from '@sanity/icons';
import { PHOTO_WORDS, PHOTO_WORDS_NEEDED } from './_copy';

export const font = defineType({
  name: 'font',
  title: 'Embroidery font',
  type: 'document',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Font name',
      type: 'string',
      description: 'The name on the font guide, for example "Magnolia Script" or "Classic Block".',
      validation: (Rule) => Rule.required().error('Please give this font a name.'),
    }),
    defineField({
      name: 'previewImage',
      title: 'Photo of the font stitched',
      type: 'image',
      description:
        'A photo of this font embroidered on fabric. This photo IS the font on your website. A font only shows on the font guide once it has one.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          ...PHOTO_WORDS,
          type: 'string',
          description: 'For example "Magnolia Script embroidered in navy on white fabric".',
          validation: (R) =>
            R.custom((value, ctx: any) =>
              ctx.parent?.asset && !value ? PHOTO_WORDS_NEEDED : true,
            ),
        }),
      ],
    }),
    defineField({
      name: 'styleTag',
      title: 'Kind of lettering',
      type: 'string',
      description: 'The font guide groups fonts into rows by this.',
      options: {
        list: [
          { title: 'Classic or traditional', value: 'classic' },
          { title: 'Script or cursive', value: 'script' },
          { title: 'Block or bold', value: 'block' },
          { title: 'Modern or clean', value: 'modern' },
          { title: 'Monogram or interlocking', value: 'monogram' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'description',
      title: 'A sentence about it',
      type: 'text',
      rows: 2,
      description:
        'The look and feel, for example "Elegant thin letters with flowing joins. Great for formal gifts."',
    }),
    defineField({
      name: 'bestFor',
      title: 'Best for',
      type: 'array',
      description: 'Short notes on the items or occasions this font suits best.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'popular',
      title: 'A popular pick',
      type: 'boolean',
      description:
        'Turn on for a font people ask for often. It gets a small badge on the font guide.',
      initialValue: false,
    }),
    defineField({
      name: 'atelierStyle',
      title: 'Closest style in the monogram preview',
      type: 'string',
      description:
        'Pick the preview style that looks most like this font. The font card then gets a "try it" link that opens the monogram preview on your home page with that style. Leave it empty if none is close.',
      options: {
        list: [
          { title: 'Classic Trio', value: 'classic' },
          { title: 'Script', value: 'script' },
          { title: 'Block', value: 'block' },
          { title: 'Circle', value: 'circle' },
          { title: 'Single Letter', value: 'single' },
        ],
      },
    }),
    defineField({
      name: 'displayOrder',
      title: 'Position on the font guide',
      type: 'number',
      description: 'Smaller numbers come first. 1 is first.',
      initialValue: 99,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1, 2 or 3.'),
    }),
    defineField({
      name: 'slug',
      title: 'Short name for the website',
      type: 'slug',
      description: 'Made from the font name. Press Generate if it is empty.',
      options: { source: 'name', maxLength: 50 },
    }),
  ],
  __experimental_search: [{ path: 'name', weight: 10 }],
  preview: {
    select: { title: 'name', media: 'previewImage', hasPhoto: 'previewImage.asset' },
    prepare: ({ title, media, hasPhoto }) => ({
      title: title ?? '(no name yet)',
      subtitle: hasPhoto ? 'On the font guide' : 'Needs a photo before it shows on your website',
      media,
    }),
  },
  orderings: [
    {
      title: 'Position on the font guide',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
    { title: 'Name A to Z', name: 'nameAZ', by: [{ field: 'name', direction: 'asc' }] },
  ],
});
