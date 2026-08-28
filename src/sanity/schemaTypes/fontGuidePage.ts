// Font & Lettering Guide page singleton. The font cards come from the font
// collection. This singleton controls the page heading, intro, and guide copy.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { TextIcon } from '@sanity/icons';

export const fontGuidePage = defineType({
  name: 'fontGuidePage',
  title: 'Font & Lettering Guide Page',
  type: 'document',
  icon: TextIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',  title: 'Google & sharing' },
    { name: 'page', title: 'Page content', default: true },
    { name: 'cta',  title: 'CTA' },
  ],
  fieldsets: [{ name: 'seo', title: 'Google & sharing — you rarely need to touch this', options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({ name: 'seoTitle', title: 'Google & browser-tab title', type: 'string', group: 'seo', fieldset: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'Google search description', type: 'text', rows: 3, group: 'seo', fieldset: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Photo shown when the page is shared', type: 'image', group: 'seo', fieldset: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Photo description (helps screen readers & Google)', type: 'string' })] }),

    defineField({ name: 'heroEyebrow', title: 'Small label above the heading', type: 'string', group: 'page', validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'page', validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Short line under the heading (optional)', type: 'text', rows: 2, group: 'page' }),

    defineField({
      name: 'intro',
      title: 'Intro (before the font grid)',
      type: 'array',
      group: 'page',
      description: 'One to two paragraphs introducing the fonts. Tips on choosing a style work well here.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }, { title: 'Heading', value: 'h3' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
            annotations: [],
          },
        }),
      ],
    }),

    defineField({ name: 'fontGridEyebrow', title: 'Font grid section eyebrow', type: 'string', group: 'page',
      description: 'Label above the grid of font cards.',
      validation: (R) => R.required().max(60) }),
    defineField({ name: 'fontGridHeadline', title: 'Font grid section headline', type: 'string', group: 'page',
      validation: (R) => R.required().max(100) }),

    defineField({ name: 'customFontNote', title: 'Custom font note (optional)', type: 'text', rows: 2, group: 'page',
      description: 'Note about requesting a font not shown in the guide. E.g. "Don\'t see the style you want? Contact me."' }),

    defineField({ name: 'ctaEyebrow', title: 'Small label above the banner', type: 'string', group: 'cta', validation: (R) => R.required().max(60) }),
    defineField({ name: 'ctaHeadline', title: 'Banner headline', type: 'string', group: 'cta', validation: (R) => R.required().max(100) }),
    defineField({ name: 'ctaSubhead', title: 'Banner text (optional)', type: 'text', rows: 2, group: 'cta' }),
    defineField({ name: 'ctaLabel', title: 'Button text', type: 'string', group: 'cta',
      initialValue: 'Request a Quote', validation: (R) => R.required().max(50) }),
    defineField({ name: 'ctaHref', title: 'Button link (where it goes)', type: 'string', group: 'cta',
      initialValue: '/request-a-quote', validation: (R) => R.required() }),
  ],
  preview: { prepare: () => ({ title: 'Font & Lettering Guide Page' }) },
});
