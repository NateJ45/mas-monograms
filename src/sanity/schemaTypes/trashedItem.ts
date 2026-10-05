// Something Mary Ann moved to the Trash (2026-10-05, Phase D).
//
// Ported from ReidDesignAstro/reid-design-site's trashedItem. Created ONLY by
// "Move to Trash" (src/sanity/actions/trash.tsx); she never makes one by hand,
// so it is in no create menu and the Trash list has no "+" button. The website
// never reads this type: the original was deleted when it came here, which is
// what keeps a trashed photo off the site (see src/sanity/lib/trash.ts).
//
// Everything is read-only. The copy itself (`payload`) is hidden: it is the
// thing "Bring it back" writes back, and a typo in it could not be undone.

import { defineType, defineField } from 'sanity';
import { TrashIcon } from '@sanity/icons';

export const trashedItem = defineType({
  name: 'trashedItem',
  title: 'Something in the Trash',
  type: 'document',
  icon: TrashIcon,
  readOnly: true,
  fields: [
    defineField({
      name: 'title',
      title: 'What it was called',
      type: 'string',
      description:
        'To put it back on your website, press "Bring it back" at the bottom. To get rid of it for good, use "Delete forever" in the menu beside it.',
      readOnly: true,
    }),
    defineField({
      name: 'kind',
      title: 'What kind of thing it is',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'deletedAt',
      title: 'Moved to the Trash on',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'wasPublished',
      title: 'Was it on your website?',
      type: 'boolean',
      readOnly: true,
    }),
    // ── Hidden: what "Bring it back" needs ───────────────────────────────────
    defineField({
      name: 'originalType',
      title: 'Kind (for the Studio)',
      type: 'string',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'originalId',
      title: 'Where it goes back to',
      type: 'string',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'payload',
      title: 'The saved copy',
      type: 'text',
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: 'title', kind: 'kind', deletedAt: 'deletedAt' },
    prepare: ({ title, kind, deletedAt }) => ({
      title: title || 'Something with no name',
      subtitle: [
        kind,
        deletedAt
          ? `moved here ${new Date(deletedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
          : null,
      ]
        .filter(Boolean)
        .join(', '),
    }),
  },
  orderings: [
    {
      title: 'Most recently moved here',
      name: 'deletedAtDesc',
      by: [{ field: 'deletedAt', direction: 'desc' }],
    },
  ],
});
