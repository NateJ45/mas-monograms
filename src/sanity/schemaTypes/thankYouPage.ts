// Thank You page singleton. Shown after a successful quote form submission.
// Every word — confirmation message, what-to-expect copy, next steps —
// comes from here so Mary Ann can keep it current.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { CheckmarkCircleIcon } from '@sanity/icons';

export const thankYouPage = defineType({
  name: 'thankYouPage',
  title: 'Thank You Page',
  type: 'document',
  icon: CheckmarkCircleIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',     title: 'Google & sharing' },
    { name: 'content', title: 'Content', default: true },
  ],
  fieldsets: [{ name: 'seo', title: 'Google & sharing — you rarely need to touch this', options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({ name: 'seoTitle', title: 'Google & browser-tab title', type: 'string', group: 'seo', fieldset: 'seo',
      initialValue: 'Quote request received — MAS Monograms',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),

    defineField({ name: 'eyebrow', title: 'Small label above the heading', type: 'string', group: 'content',
      description: 'E.g. "Your request is in!" or "Got it!".',
      initialValue: 'Request received!',
      validation: (R) => R.required().max(80) }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', group: 'content',
      initialValue: "Thank you — I'll be in touch soon.",
      validation: (R) => R.required().max(100) }),
    defineField({
      name: 'body',
      title: 'Body copy',
      type: 'array',
      group: 'content',
      description: 'Warm confirmation paragraph. Tell them what to expect next.',
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
      validation: (R) => R.required(),
    }),
    defineField({ name: 'expectedResponseTime', title: 'Expected response time', type: 'string', group: 'content',
      description: 'E.g. "I respond to all requests within 1–2 business days."',
      validation: (R) => R.required() }),

    defineField({
      name: 'nextSteps',
      title: 'Next steps',
      type: 'array',
      group: 'content',
      description: 'Optional numbered list of what happens next. E.g. "I\'ll review your request", "I\'ll send a quote by email".',
      of: [defineArrayMember({ type: 'string' })],
    }),

    defineField({ name: 'image', title: 'Photo (optional)', type: 'image', group: 'content',
      description: 'A warm, on-brand photo to go alongside the confirmation message.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Photo description (helps screen readers & Google)', type: 'string', validation: (R) => R.required() })] }),

    defineField({ name: 'ctaLabel', title: 'Continue browsing CTA label', type: 'string', group: 'content',
      description: 'Link back to the homepage or style gallery.',
      initialValue: 'Explore the gallery', validation: (R) => R.required() }),
    defineField({ name: 'ctaHref', title: 'Continue browsing CTA destination', type: 'string', group: 'content',
      initialValue: '/style-gallery', validation: (R) => R.required() }),

    defineField({ name: 'secondaryCtaLabel', title: 'Second button text (optional)', type: 'string', group: 'content',
      description: 'A second onward path shown beside the main button. E.g. "See how it works". Leave blank to hide it.',
      initialValue: 'Browse the style gallery' }),
    defineField({ name: 'secondaryCtaHref', title: 'Second button link (optional)', type: 'string', group: 'content',
      description: 'Where the secondary link goes. E.g. /style-gallery.',
      initialValue: '/style-gallery' }),
  ],
  preview: { prepare: () => ({ title: 'Thank You Page' }) },
});
