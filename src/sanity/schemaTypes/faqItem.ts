// FAQ item document ("Question and answer"). Shown on the How It Works page
// and the Pricing page, wherever its switches say.
//
// 2026-10-05, Mary Ann's Studio pass: plain titles, the two "show on" switches
// moved up beside the answer (they decide whether the question shows at all),
// and only the question and answer are required. The topic is optional: the
// pages show one plain list and only use it to keep related questions together.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';
import { bracketsLeft } from './_copy';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Question and answer',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'The question the way a customer would ask it.',
      validation: (Rule) => [
        Rule.required().error('Please type the question.'),
        Rule.custom(bracketsLeft).warning(),
      ],
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      description: 'Your answer in your own words. You can add a list or a link.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Small heading', value: 'h4' },
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
                  { name: 'href', type: 'url', title: 'Web address' },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in a new tab',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required().error('Please type the answer.'),
        Rule.custom(bracketsLeft).warning(),
      ],
    }),
    defineField({
      name: 'showOnHowItWorks',
      title: 'Show on the How It Works page',
      type: 'boolean',
      description: 'Turn on to show this question on How It Works.',
      initialValue: false,
    }),
    defineField({
      name: 'showOnPricing',
      title: 'Show on the Pricing page',
      type: 'boolean',
      description: 'Turn on to show this question on Pricing. It can show on both pages.',
      initialValue: false,
    }),
    defineField({
      name: 'category',
      title: 'Topic',
      type: 'string',
      description: 'Questions on the same topic are kept together on the page.',
      options: {
        list: [
          { title: 'Ordering and getting started', value: 'Ordering' },
          { title: 'Pricing', value: 'Pricing' },
          { title: 'How long it takes', value: 'Turnaround' },
          { title: 'Shipping and pickup', value: 'Shipping' },
          { title: 'What I can embroider', value: 'Items' },
          { title: 'Design and fonts', value: 'Design' },
          { title: 'Care', value: 'Care' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'displayOrder',
      title: 'Position in the list',
      type: 'number',
      description: 'Smaller numbers come first within the topic. 1 is first.',
      initialValue: 99,
      validation: (Rule) =>
        Rule.integer().min(0).warning('Please use a whole number, like 1, 2 or 3.'),
    }),
  ],
  __experimental_search: [{ path: 'question', weight: 10 }],
  preview: {
    select: { question: 'question', how: 'showOnHowItWorks', pricing: 'showOnPricing' },
    prepare: ({ question, how, pricing }) => {
      const where = [how ? 'How It Works' : '', pricing ? 'Pricing' : ''].filter(Boolean);
      return {
        title: question ?? '(no question yet)',
        subtitle: where.length ? `Shown on ${where.join(' and ')}` : 'Not shown on any page yet',
      };
    },
  },
  orderings: [
    {
      title: 'Topic, then position',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'displayOrder', direction: 'asc' },
      ],
    },
    {
      title: 'Position in the list',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
});
