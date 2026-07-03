// How It Works page singleton. Walks through the ordering process step by step.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ControlsIcon } from '@sanity/icons';

export const howItWorksPage = defineType({
  name: 'howItWorksPage',
  title: 'How It Works Page',
  type: 'document',
  icon: ControlsIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',   title: 'SEO' },
    { name: 'hero',  title: 'Hero', default: true },
    { name: 'steps', title: 'Steps' },
    { name: 'faq',   title: 'FAQ' },
    { name: 'cta',   title: 'Final CTA' },
  ],
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Social share image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),

    // Hero
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', group: 'hero', validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'hero', validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Subhead (optional)', type: 'text', rows: 2, group: 'hero' }),
    defineField({ name: 'heroImage', title: 'Hero image (optional)', type: 'image', group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })] }),

    // Steps intro
    defineField({ name: 'stepsHeadline', title: 'Steps section headline', type: 'string', group: 'steps', validation: (R) => R.required().max(100) }),
    defineField({ name: 'stepsSubhead', title: 'Steps section subhead (optional)', type: 'text', rows: 2, group: 'steps' }),

    // Steps
    defineField({
      name: 'steps',
      title: 'Process steps',
      type: 'array',
      group: 'steps',
      description: 'Ordered steps. Each one has a number, title, and description.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({ name: 'number', title: 'Step number', type: 'string', description: 'E.g. "01"', validation: (R) => R.required() }),
            defineField({ name: 'label', title: 'Step name', type: 'string', validation: (R) => R.required() }),
            defineField({
              name: 'body',
              title: 'Description',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'block',
                  styles: [{ title: 'Paragraph', value: 'normal' }],
                  marks: {
                    decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
                    annotations: [],
                  },
                }),
              ],
              validation: (R) => R.required(),
            }),
            defineField({ name: 'image', title: 'Step image (optional)', type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),
          ],
          preview: { select: { title: 'label', subtitle: 'number' } },
        }),
      ],
      validation: (Rule) => Rule.required().min(2).max(8),
    }),

    // FAQ section
    defineField({ name: 'faqHeadline', title: 'FAQ section headline', type: 'string', group: 'faq', validation: (R) => R.required().max(100) }),
    defineField({ name: 'faqSubhead', title: 'FAQ intro note (optional)', type: 'text', rows: 2, group: 'faq',
      description: 'One line under the heading. E.g. "More questions? Send me an email."' }),

    // Final CTA
    defineField({ name: 'ctaEyebrow', title: 'CTA eyebrow', type: 'string', group: 'cta', validation: (R) => R.required().max(60) }),
    defineField({ name: 'ctaHeadline', title: 'CTA headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'CTA body (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button destination', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'How It Works Page' }) },
});
