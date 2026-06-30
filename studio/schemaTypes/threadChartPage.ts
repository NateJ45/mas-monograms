// Thread Color Chart page singleton. The color swatches come from the
// threadColor collection. This singleton controls all surrounding copy.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ColorWheelIcon } from '@sanity/icons';

export const threadChartPage = defineType({
  name: 'threadChartPage',
  title: 'Thread Color Chart Page',
  type: 'document',
  icon: ColorWheelIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',  title: 'SEO' },
    { name: 'page', title: 'Page content', default: true },
    { name: 'cta',  title: 'CTA' },
  ],
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Social share image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),

    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', group: 'page', validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'page', validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Subhead (optional)', type: 'text', rows: 2, group: 'page' }),

    defineField({
      name: 'intro',
      title: 'Intro text',
      type: 'array',
      group: 'page',
      description: 'Short intro explaining what the chart shows and how to use it.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({ name: 'matchingNote', title: 'Color matching note', type: 'text', rows: 2, group: 'page',
      description: 'Note about how accurate color matching works or how to request a color not listed.' }),
    defineField({ name: 'customColorNote', title: 'Custom color note (optional)', type: 'string', group: 'page',
      description: 'One-line note about requesting custom or unlisted colors. E.g. "Need a specific color? Just ask in your quote request."' }),

    defineField({ name: 'ctaEyebrow', title: 'CTA eyebrow', type: 'string', group: 'cta', validation: (R) => R.required().max(60) }),
    defineField({ name: 'ctaHeadline', title: 'CTA headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'CTA body (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button destination', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'Thread Color Chart Page' }) },
});
