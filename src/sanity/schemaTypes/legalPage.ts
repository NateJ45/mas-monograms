// Legal / policy pages (Privacy Policy, Terms of Use, Accessibility Statement).
// A small collection so Mary Ann can edit the wording without touching code.
// Rendered at /legal/<slug> by src/pages/legal/[slug].astro.
//
// 2026-10-05, Mary Ann's Studio pass: plain titles. The desk now lists these
// inside "Pages on my website" (src/sanity/structure.ts) instead of as a stray
// top-level "Legal / Policy Page" entry.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { DocumentIcon } from '@sanity/icons';
import { SEO_DESCRIPTION, SEO_DESCRIPTION_TOO_LONG, TOO_LONG } from './_copy';
import { SEO_PREVIEW } from './_seoPreview';
import { LockedAddressInput } from '../components/LockedAddressInput';

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      description: 'For example "Privacy Policy", "Terms of Use" or "Accessibility Statement".',
      validation: (R) => [
        R.required().error('Please give this page a title.'),
        R.max(80).warning(TOO_LONG),
      ],
    }),
    defineField({
      name: 'body',
      title: 'The words on the page',
      type: 'array',
      description: 'The full text. Use headings to break it into parts.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Smaller heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Web address',
                    validation: (R) => R.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
                  },
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      description: 'Shown near the top, so visitors know how current the page is.',
    }),
    defineField({
      name: 'lastUpdatedLabel',
      title: 'Words before the date',
      type: 'string',
      description: 'For example "Last updated".',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The end of the page\'s address, for example "privacy" makes /legal/privacy. Press Generate to make one from the title. Once the page is on your website the address is locked, so old links keep working.',
      options: { source: 'title', maxLength: 60 },
      // Phase D: locked once published (components/LockedAddressInput.tsx).
      components: { input: LockedAddressInput },
      validation: (R) =>
        R.required().error('Please press Generate so this page has a web address.'),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Position in the footer links',
      type: 'number',
      description: 'Smaller numbers come first.',
      initialValue: 99,
    }),
    // Phase D: the live Google and shared-link preview (writes nothing).
    defineField({
      name: 'seoPreview',
      ...SEO_PREVIEW,
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      ...SEO_DESCRIPTION,
      type: 'text',
      rows: 2,
      validation: (R) => R.max(160).warning(SEO_DESCRIPTION_TOO_LONG),
    }),
  ],
  __experimental_search: [{ path: 'title', weight: 10 }],
  orderings: [
    {
      title: 'Position in the footer links',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({
      title: title ?? '(no title yet)',
      subtitle: slug ? `mas-monograms.com/legal/${slug}` : 'No web address yet',
    }),
  },
});
