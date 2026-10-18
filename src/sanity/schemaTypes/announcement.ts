// Safe to edit by hand (the words); field names hold data, never rename them
// =============================================================================
// "Notice across the top": a short line above the header on every page
// =============================================================================
// Registered for Mary Ann on 2026-10-18 (the file was a starter leftover that
// BaseLayout already knew how to draw; the query is getActiveNotices() in
// src/lib/queries.ts). For the seasons of her shop: "Order by December 1 for
// Christmas", "New clearance items are up", "I am away until January 5".
//
// One notice shows at a time: the most important one inside its dates. The
// site is built ahead of time, so the dates are honoured TWICE: at build time
// (a notice outside its dates is drawn hidden) and in the visitor's browser (a
// small script in BaseLayout shows or hides each notice by the clock), so a
// notice appears on its first day and comes down after its last without a
// rebuild. With JavaScript off, the build-time choice stands.
//
// The Quick update tool's "Put up a notice" and "I am away" forms make these
// (src/lib/quick-updates.ts). Words: plain, no em-dashes, no developer words.
// =============================================================================

import { defineType, defineField } from 'sanity';
import { previewDate, previewSubtitle } from '../../lib/studio-icons';
import { bracketsLeft } from './_copy';

/** The three looks, in her words. The values are stored data: never rename them. */
export const NOTICE_STYLES = [
  { title: 'Calm (a soft linen band)', value: 'info' },
  { title: 'Good news (an indigo band)', value: 'highlight' },
  { title: 'Important (a midnight blue band)', value: 'urgent' },
] as const;

export const announcement = defineType({
  name: 'announcement',
  title: 'Notice across the top',
  type: 'document',
  fields: [
    defineField({
      name: 'message',
      title: 'What the notice says',
      type: 'string',
      description:
        'One or two short sentences, shown across the top of every page. For example "Order by December 1 for Christmas delivery."',
      validation: (Rule) => [
        Rule.required().error('Please type what the notice says.'),
        Rule.max(160).warning('This is getting long, so it may not fit nicely on a phone.'),
        Rule.custom(bracketsLeft).warning(),
      ],
    }),
    defineField({
      name: 'enabled',
      title: 'Show it on my website',
      type: 'boolean',
      description:
        'Turn this off to take the notice down straight away. You can turn it on again later.',
      initialValue: true,
    }),
    defineField({
      name: 'style',
      title: 'How it looks',
      type: 'string',
      options: { list: [...NOTICE_STYLES], layout: 'radio' },
      initialValue: 'info',
    }),
    defineField({
      name: 'startDate',
      title: 'First day to show it',
      type: 'datetime',
      description: 'Leave it empty to show the notice as soon as you press Publish.',
    }),
    defineField({
      name: 'endDate',
      title: 'Take it down after',
      type: 'datetime',
      description:
        'After this time the notice disappears by itself. Leave it empty to keep it up until you turn it off.',
    }),
    defineField({
      name: 'link',
      title: 'A link for more (you can leave this empty)',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'label',
          title: 'Words on the link',
          type: 'string',
          description: 'For example "See the gift guide".',
        }),
        defineField({
          name: 'url',
          title: 'Where the link goes',
          type: 'string',
          description:
            'A page on your website, written like /clearance/, or a full web address starting with https://',
        }),
      ],
    }),
    defineField({
      name: 'internalTitle',
      title: 'Name for you',
      type: 'string',
      description:
        'Only you see this, in the list of notices. For example "Christmas order deadline". Leave it empty to use the notice itself.',
    }),
  ],
  preview: {
    select: {
      message: 'message',
      name: 'internalTitle',
      enabled: 'enabled',
      start: 'startDate',
      end: 'endDate',
    },
    prepare: ({ message, name, enabled, start, end }) => {
      const now = Date.now();
      const status =
        enabled === false
          ? 'Off'
          : end && Date.parse(end) < now
            ? 'Ended'
            : start && Date.parse(start) > now
              ? `Starts ${previewDate(start)}`
              : end
                ? `Shows until ${previewDate(end)}`
                : 'Showing';
      return {
        title: name || message || 'A notice with no words yet',
        subtitle: previewSubtitle(status, name ? message : null),
      };
    },
  },
  orderings: [
    { title: 'Ending soonest', name: 'endAsc', by: [{ field: 'endDate', direction: 'asc' }] },
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
});
