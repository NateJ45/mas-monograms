// Client testimonials. Used on the homepage and about page.
// Verbatim quotes — AI must NOT rewrite or "improve" these.

import { defineType, defineField } from 'sanity';
import { StarIcon } from '@sanity/icons';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: StarIcon,
  options: { canvasApp: { exclude: true } },
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      description: "Verbatim. Keep their capitalization and punctuation exactly as written.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Name',
      type: 'string',
      description: 'Their name as they want it shown. E.g. "Sarah M." or "The Johnson Family".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'itemOrdered',
      title: 'What they ordered (optional)',
      type: 'string',
      description: 'Optional context. E.g. "Monogrammed wedding gifts — 50 shirts". Shown in smaller text below the attribution.',
    }),
    defineField({
      name: 'date',
      title: 'Date received',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Where this review came from.',
      options: {
        list: [
          { title: 'Facebook', value: 'Facebook' },
          { title: 'Google', value: 'Google' },
          { title: 'Instagram', value: 'Instagram' },
          { title: 'Direct (email or text)', value: 'Direct' },
          { title: 'Other', value: 'Other' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewUrl',
      title: 'Review URL (optional)',
      type: 'url',
      description: 'Direct link to the original review on Google or Facebook.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured testimonials appear prominently in the homepage section. One or two featured at a time is ideal.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { quote: 'quote', attribution: 'attribution', date: 'date' },
    prepare: ({ quote, attribution, date }) => ({
      title: quote ? (quote.length > 60 ? quote.slice(0, 60) + '…' : quote) : '(no quote)',
      subtitle: `${attribution ?? '?'} · ${date ?? ''}`,
    }),
  },
  orderings: [
    { title: 'Date, newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
});
