// Thank You page singleton. Shown after someone sends the quote form. Every
// word (the thank-you, what happens next, the buttons) comes from here so
// Mary Ann can keep it current.
//
// 2026-10-05, Mary Ann's Studio pass: page order with Google last, only the
// headline required (thank-you.astro hides any part that is empty), plain
// titles from ./_copy.ts.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { CheckmarkCircleIcon } from '@sanity/icons';
import {
  SEO_FIELDSET,
  SEO_GROUP,
  SEO_TITLE,
  SEO_TITLE_TOO_LONG,
  PHOTO_WORDS,
  PHOTO_WORDS_NEEDED,
  TOO_LONG,
  BUTTON_LINK_HELP,
} from './_copy';

export const thankYouPage = defineType({
  name: 'thankYouPage',
  title: 'Thank You page',
  type: 'document',
  icon: CheckmarkCircleIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'content', title: 'The thank-you message' },
    { name: 'buttons', title: 'Buttons' },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    // ── The thank-you message ────────────────────────────────────────────────
    defineField({
      name: 'eyebrow',
      title: 'Small line above the headline',
      type: 'string',
      group: 'content',
      description:
        'Shown in handwriting, for example "Request received!". Leave it empty to hide it.',
      initialValue: 'Request received!',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description:
        'The big heading people see right after they send the quote form, for example "Thank you, I\'ll be in touch soon."',
      initialValue: "Thank you, I'll be in touch soon.",
      validation: (R) => [
        R.required().error('Please type a headline. It is the big heading on this page.'),
        R.max(100).warning(TOO_LONG),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Your thank-you note',
      type: 'array',
      group: 'content',
      description: 'A warm paragraph. Tell them what to expect next.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'responseTimeLabel',
      title: 'Small label before your reply time',
      type: 'string',
      group: 'content',
      description: 'For example "Expected response time". Leave it empty to hide it.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'expectedResponseTime',
      title: 'When you will reply',
      type: 'string',
      group: 'content',
      description:
        'For example "I respond to every request within 1 business day." Leave it empty to hide it.',
    }),
    defineField({
      name: 'nextStepsLabel',
      title: 'Heading above the next steps',
      type: 'string',
      group: 'content',
      description: 'For example "What\'s next". Leave it empty to show the steps with no heading.',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'nextSteps',
      title: 'Next steps',
      type: 'array',
      group: 'content',
      description:
        'A short numbered list of what happens next, for example "I\'ll review your request". Drag to change the order.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      group: 'content',
      description: 'A warm photo shown in a round hoop beside the thank-you.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          ...PHOTO_WORDS,
          type: 'string',
          validation: (R) =>
            R.custom((value, ctx: any) =>
              ctx.parent?.asset && !value ? PHOTO_WORDS_NEEDED : true,
            ),
        }),
      ],
    }),

    // ── Buttons ──────────────────────────────────────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'Words on the main button',
      type: 'string',
      group: 'buttons',
      description:
        'A way to keep browsing, for example "Explore the gallery". Shows only when both this and the box below are filled in.',
      initialValue: 'Explore the gallery',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Where the main button goes',
      type: 'string',
      group: 'buttons',
      description: BUTTON_LINK_HELP,
      initialValue: '/style-gallery',
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Words on the second link',
      type: 'string',
      group: 'buttons',
      description:
        'A quieter second link, for example "See how it works". Shows only when both this and the box below are filled in.',
      initialValue: 'Browse the style gallery',
    }),
    defineField({
      name: 'secondaryCtaHref',
      title: 'Where the second link goes',
      type: 'string',
      group: 'buttons',
      description: BUTTON_LINK_HELP,
      initialValue: '/style-gallery',
    }),

    // ── Google and sharing ───────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      ...SEO_TITLE,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      initialValue: 'Quote request received | MAS Monograms',
      validation: (R) => R.max(60).warning(SEO_TITLE_TOO_LONG),
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Thank You page',
      subtitle: 'Shown right after someone sends the quote form',
    }),
  },
});
