// Popular combination document. Featured monogram combinations shown on the
// homepage and possibly on category pages. E.g. "Navy thread on white Oxford shirts".

import { defineType, defineField, defineArrayMember } from 'sanity';
import { SparklesIcon } from '@sanity/icons';

export const popularCombination = defineType({
  name: 'popularCombination',
  title: 'Popular Combination',
  type: 'document',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Combination name',
      type: 'string',
      description: 'Short descriptive name. E.g. "Navy on White Oxford Shirts" or "Script Initials on Linen Napkins".',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'description',
      title: 'Description (optional)',
      type: 'text',
      rows: 2,
      description: 'One sentence elaborating on what makes this combination popular.',
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      description: 'A photo of this combination. Square crop works best in the grid.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags (optional)',
      type: 'array',
      description: 'Brief descriptive tags like "Wedding", "Gifts", "Teams".',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'relatedCategory',
      title: 'Related category (optional)',
      type: 'reference',
      to: [{ type: 'itemCategory' }],
      description: 'Link to the item category page for this combination.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured combinations show on the homepage.',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first.',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { title: 'name', media: 'image', featured: 'featured' },
    prepare: ({ title, media, featured }) => ({
      title: title ?? '(unnamed)',
      subtitle: featured ? 'Featured' : '',
      media,
    }),
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
  ],
});
