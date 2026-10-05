// Style gallery item ("Photo of my work"). Each item is a photo of finished
// embroidery, shown on the Style Gallery page, the item pages, the photo wall
// on the home page and (favorites) the About page.
//
// 2026-10-05, Mary Ann's Studio pass: plain titles, the photo first, and the
// one thing that matters most after the photo (a few words about it) right
// under it. The photo and its words stay required: a gallery tile with no
// photo is empty, and a photo with no words cannot be read aloud. Position is
// no longer required (it always has a starting number).

import { defineType, defineField, defineArrayMember } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';
import { ImagesIcon } from '@sanity/icons';
import { PHOTO_WORDS, PHOTO_WORDS_NEEDED } from './_copy';

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Photo of my work',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      description:
        'Drag a photo here, or click Upload. Square photos look best in the gallery. After uploading, you can click the photo and drag the circle to mark the most important part.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          ...PHOTO_WORDS,
          type: 'string',
          description:
            'Read aloud to people who cannot see the picture, and read by Google. For example "Three-letter monogram in navy on white linen napkins".',
          validation: (R) =>
            R.custom((value, ctx: any) =>
              ctx.parent?.asset && !value ? PHOTO_WORDS_NEEDED : true,
            ),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
          description:
            'A short line shown under the photo when it is opened large. Leave it empty to show none.',
        }),
      ],
      validation: (Rule) => Rule.required().error('Please add the photo.'),
    }),
    defineField({
      name: 'relatedCategory',
      title: 'What kind of item is it?',
      type: 'reference',
      to: [{ type: 'itemCategory' }],
      description:
        "Pick the shop category, for example Towels & Linens. The photo then also shows on that item's page.",
      // Only pick an existing category here. Making a new category from inside
      // a photo would create a half-empty shop page.
      options: { disableNew: true },
    }),
    defineField({
      name: 'relatedFont',
      title: 'Which font did you use?',
      type: 'reference',
      to: [{ type: 'font' }],
      description: 'Shown under the photo as the font name. Leave it empty if you are not sure.',
      options: { disableNew: true },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description:
        'Short words people can filter the gallery by, for example "wedding", "initials" or "gift". Press Enter after each one.',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'featured',
      title: 'A favorite',
      type: 'boolean',
      description:
        'Favorites show first in the gallery, and the first few appear in the recent work strip on your About page.',
      initialValue: false,
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
        'Some pages show photos inside a round embroidery hoop, which trims the corners. Pick "No" when the photo would lose too much in a circle, for example two items side by side or a small design in a tall photo. It will still show in the gallery, just never in a round hoop.',
      options: {
        list: [
          { title: 'Yes, it looks good in a circle', value: 'good' },
          { title: 'No, keep it to the square gallery views', value: 'poor' },
        ],
        layout: 'radio',
      },
      initialValue: 'good',
    }),
    // Phase D (2026-10-05): the typed position is replaced by dragging the list
    // (orderRank, below). Hidden, never deleted: the site still orders by it
    // after orderRank, so anything without a rank keeps its old place.
    defineField({
      name: 'displayOrder',
      title: 'Position in the gallery',
      type: 'number',
      description: 'Smaller numbers come first. Favorites always come before the rest.',
      initialValue: 99,
      hidden: true,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1, 2 or 3.'),
    }),
    // Phase D: the drag order, written by @sanity/orderable-document-list. Hidden
    // and read-only; a new item starts at the end of the list.
    orderRankField({ type: 'galleryItem', newItemPosition: 'after' }),
  ],
  // Search weights (Phase A task 6): she finds a photo by what it shows.
  __experimental_search: [
    { path: 'image.alt', weight: 10 },
    { path: 'tags', weight: 5 },
    { path: 'image.caption', weight: 3 },
  ],
  preview: {
    select: {
      media: 'image',
      alt: 'image.alt',
      category: 'relatedCategory.name',
      font: 'relatedFont.name',
      featured: 'featured',
    },
    prepare: ({ media, alt, category, font, featured }) => ({
      title: alt || 'A photo that needs a few words',
      subtitle:
        [featured ? 'Favorite' : '', category, font].filter(Boolean).join(' · ') ||
        'No item type picked yet',
      media,
    }),
  },
  orderings: [
    {
      title: 'In your order',
      name: 'orderRank',
      by: [{ field: 'orderRank', direction: 'asc' }],
    },
    {
      title: 'Newest first',
      name: 'newestFirst',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    {
      title: 'Favorites first, then position',
      name: 'featuredOrder',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'displayOrder', direction: 'asc' },
      ],
    },
  ],
});
