// Legal / policy pages (Privacy Policy, Terms of Use, Accessibility Statement).
// A small collection so Mary Ann can edit the wording without touching code.
// Rendered at /legal/<slug> by src/pages/legal/[slug].astro.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { DocumentIcon } from '@sanity/icons';

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal / Policy Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'E.g. "Privacy Policy", "Terms of Use", "Accessibility Statement".',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'The URL path segment, e.g. "privacy" → /legal/privacy.',
      options: { source: 'title', maxLength: 60 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Google search description',
      type: 'text',
      rows: 2,
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.'),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      description: 'Shown near the top of the page so visitors know how current the policy is.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'The full text of the policy. Use headings to break it into sections.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Short line under the heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL', validation: (R) => R.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }) },
                ],
              },
            ],
          },
        }),
      ],
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Order in the footer legal links. Lower first.',
      initialValue: 99,
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
});
