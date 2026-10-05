// Style gallery item. Each item is a photo of completed embroidery work,
// shown on the Style Gallery page with optional filtering by category or font.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ImagesIcon } from '@sanity/icons';

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      description: 'The embroidery photo. Square crops work best in the gallery grid.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Photo description (helps screen readers & Google)',
          type: 'string',
          description: 'E.g. "Three-letter monogram on white linen napkins — block font in navy".',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption (optional)',
          type: 'string',
          description: 'Short caption shown below the image in a lightbox view.',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relatedCategory',
      title: 'Item type (optional)',
      type: 'reference',
      to: [{ type: 'itemCategory' }],
      description: 'What kind of item is this? Used for the category filter on the gallery page.',
    }),
    defineField({
      name: 'relatedFont',
      title: 'Font used (optional)',
      type: 'reference',
      to: [{ type: 'font' }],
      description: 'Which embroidery font was used? Used for the font filter.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Short descriptive tags for filtering. E.g. "wedding", "initials", "gift".',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured items appear first in the gallery and may be shown on the homepage.',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first. Featured items always appear before non-featured.',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    // hoopFit (2026-10-04): some photos cannot make a good round crop (two items
    // side by side, a small design in a tall photo, a close-up that fills the
    // circle). "poor" keeps the photo out of every round hoop on the site
    // (src/lib/hoop.ts) while it still shows in the square gallery views.
    defineField({
      name: 'hoopFit',
      title: 'Show it in a round hoop?',
      type: 'string',
      description:
        'Some pages show photos inside a round embroidery hoop, which trims the corners. Pick "No" when the photo would lose too much in a circle, for example two items side by side or a small design in a tall photo. It will still show in the gallery, just never in a round hoop. A category photo that uses the same picture is skipped too.',
      options: {
        list: [
          { title: 'Yes, it looks good in a circle', value: 'good' },
          { title: 'No, keep it to the square gallery views', value: 'poor' },
        ],
        layout: 'radio',
      },
      initialValue: 'good',
    }),
  ],
  preview: {
    select: {
      media: 'image',
      alt: 'image.alt',
      category: 'relatedCategory.name',
      font: 'relatedFont.name',
    },
    prepare: ({ media, alt, category, font }) => ({
      title: alt ?? '(no alt text)',
      subtitle: [category, font].filter(Boolean).join(' · ') || 'No category / font',
      media,
    }),
  },
  orderings: [
    {
      title: 'Featured first, then order',
      name: 'featuredOrder',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'displayOrder', direction: 'asc' },
      ],
    },
    {
      title: 'Display order',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
});
