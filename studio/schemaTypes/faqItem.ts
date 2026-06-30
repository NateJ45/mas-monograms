// FAQ item document. Used on the How It Works page, Pricing page, and
// potentially individual category pages for embroidery-specific questions.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'The question as a customer would ask it. Plain English.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      description: 'Answer in Mary Ann\'s voice. Paragraphs and bullet lists are supported.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Sub-heading', value: 'h4' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
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
                  { name: 'href', type: 'url', title: 'URL' },
                  { name: 'openInNewTab', type: 'boolean', title: 'Open in new tab', initialValue: false },
                ],
              },
            ],
          },
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Which group this question belongs in on the FAQ page.',
      options: {
        list: [
          { title: 'Ordering & Getting Started', value: 'Ordering' },
          { title: 'Pricing', value: 'Pricing' },
          { title: 'Turnaround Time', value: 'Turnaround' },
          { title: 'Shipping & Pickup', value: 'Shipping' },
          { title: 'What I Can Embroider', value: 'Items' },
          { title: 'Design & Fonts', value: 'Design' },
          { title: 'Care & Maintenance', value: 'Care' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first within the category.',
      initialValue: 99,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'showOnHowItWorks',
      title: 'Show on How It Works page',
      type: 'boolean',
      description: 'If checked, this question also appears on the How It Works page FAQ section.',
      initialValue: false,
    }),
    defineField({
      name: 'showOnPricing',
      title: 'Show on Pricing page',
      type: 'boolean',
      description: 'If checked, this question also appears on the Pricing page FAQ section.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { question: 'question', category: 'category', displayOrder: 'displayOrder' },
    prepare: ({ question, category, displayOrder }) => ({
      title: question ?? '(no question)',
      subtitle: `${category ?? '?'} · #${displayOrder ?? '?'}`,
    }),
  },
  orderings: [
    { title: 'Category, then order', name: 'categoryOrder', by: [{ field: 'category', direction: 'asc' }, { field: 'displayOrder', direction: 'asc' }] },
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }] },
  ],
});
