// About page singleton. Tells Mary Ann's story: who she is, why she started
// MAS Monograms, and what she cares about. Every word comes from here.
//
// 2026-10-05, Mary Ann's Studio pass: fields in page order (top with her
// portrait, her story, the values, the closing banner) with Google last; only
// the headline is required; plain titles from ./_copy.ts. `heroImage` is hidden:
// the page shows `makerPhoto` as the portrait and only falls back to heroImage
// when makerPhoto is empty (about.astro), and makerPhoto is set. Data kept.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { UserIcon } from '@sanity/icons';
import {
  SEO_FIELDSET,
  SEO_GROUP,
  SEO_TITLE,
  SEO_TITLE_TOO_LONG,
  SEO_DESCRIPTION,
  SEO_DESCRIPTION_TOO_LONG,
  SEO_IMAGE,
  PHOTO_WORDS,
  PHOTO_WORDS_NEEDED,
  HERO_EYEBROW,
  HERO_HEADLINE,
  HEADLINE_NEEDED,
  HERO_SUBHEAD,
  TOO_LONG,
  BANNER_GROUP_TITLE,
  BANNER_EYEBROW,
  BANNER_HEADLINE,
  BANNER_SUBHEAD,
  BANNER_BUTTON,
  BANNER_LINK,
} from './_copy';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  icon: UserIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Top of the page' },
    { name: 'story', title: 'Your story' },
    { name: 'values', title: 'What you care about' },
    { name: 'cta', title: BANNER_GROUP_TITLE },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    // ── Top of the page ──────────────────────────────────────────────────────
    defineField({
      name: 'heroEyebrow',
      ...HERO_EYEBROW,
      type: 'string',
      group: 'hero',
      description: 'For example "About Mary Ann" or "Meet the Maker". Leave it empty to hide it.',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroHeadline',
      ...HERO_HEADLINE,
      type: 'string',
      group: 'hero',
      validation: (R) => [R.required().error(HEADLINE_NEEDED), R.max(100).warning(TOO_LONG)],
    }),
    defineField({
      name: 'heroSubhead',
      ...HERO_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'makerPhoto',
      title: 'Your photo',
      type: 'image',
      group: 'hero',
      description:
        'Your portrait, shown in the arched frame at the top of the page. A tall (portrait) photo works best.',
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
    defineField({
      name: 'makerAttribution',
      title: 'Your name and title under the photo',
      type: 'string',
      group: 'hero',
      description: 'For example "Mary Ann Stone · Founder, MAS Monograms".',
    }),

    // ── Your story ───────────────────────────────────────────────────────────
    defineField({
      name: 'storyHeadline',
      title: 'Heading above your story',
      type: 'string',
      group: 'story',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'storyContent',
      title: 'Your story',
      type: 'array',
      group: 'story',
      description: 'Your story in your own words. Press Enter to start a new paragraph.',
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
    }),
    defineField({
      name: 'studioNote',
      title: 'One short line about your studio',
      type: 'string',
      group: 'story',
      description:
        'Shown on a small card beside your story, for example "Handcrafted in St. Matthews, SC."',
    }),
    defineField({
      name: 'recentWorkHeadline',
      title: 'Heading above the recent work photos',
      type: 'string',
      group: 'story',
      description:
        'The strip of photos comes from Photos of my work (the ones marked as a favorite). Leave it empty to use "Recent work from the studio".',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),

    // ── What you care about ──────────────────────────────────────────────────
    defineField({
      name: 'valuesHeadline',
      title: 'Heading above your values',
      type: 'string',
      group: 'values',
    }),
    defineField({
      name: 'values',
      title: 'Your values',
      type: 'array',
      group: 'values',
      description:
        'Three or four short things you care about, for example "Quality over quantity". Each shows as a hang tag. Drag to change the order.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'valueItem',
          fields: [
            defineField({
              name: 'label',
              title: 'The value',
              type: 'string',
              validation: (R) => R.required().error('Please type the value in a few words.'),
            }),
            defineField({ name: 'body', title: 'A sentence about it', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label', subtitle: 'body' } },
        }),
      ],
    }),

    // ── Closing banner ───────────────────────────────────────────────────────
    defineField({
      name: 'ctaEyebrow',
      ...BANNER_EYEBROW,
      type: 'string',
      group: 'cta',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'ctaHeadline',
      ...BANNER_HEADLINE,
      type: 'string',
      group: 'cta',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'ctaSubhead',
      ...BANNER_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'cta',
    }),
    defineField({
      name: 'ctaLabel',
      ...BANNER_BUTTON,
      type: 'string',
      group: 'cta',
      initialValue: 'Request a Quote',
      validation: (R) => R.max(50).warning(TOO_LONG),
    }),
    defineField({
      name: 'ctaHref',
      ...BANNER_LINK,
      type: 'string',
      group: 'cta',
      initialValue: '/request-a-quote',
    }),

    // ── Google and sharing ───────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      ...SEO_TITLE,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      validation: (R) => R.max(60).warning(SEO_TITLE_TOO_LONG),
    }),
    defineField({
      name: 'seoDescription',
      ...SEO_DESCRIPTION,
      type: 'text',
      rows: 3,
      group: 'seo',
      fieldset: 'seo',
      validation: (R) => R.max(160).warning(SEO_DESCRIPTION_TOO_LONG),
    }),
    defineField({
      name: 'seoImage',
      ...SEO_IMAGE,
      type: 'image',
      group: 'seo',
      fieldset: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
    }),

    // ── Hidden: backup only (see the header) ─────────────────────────────────
    defineField({
      name: 'heroImage',
      title: 'Old top-of-page photo (backup only)',
      type: 'image',
      hidden: true,
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
    }),
  ],
  preview: { prepare: () => ({ title: 'About page', subtitle: 'The page at /about: your story' }) },
});
