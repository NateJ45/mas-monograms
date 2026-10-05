// Home page singleton. Every piece of text on the homepage comes from here.
// No pageBuilder: this page has a fixed section order designed for conversion.
//
// 2026-10-05, Mary Ann's Studio pass (Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md):
//   - Fields are in the order a visitor meets them on the redesigned page
//     (src/pages/index.astro and src/components/home/*), in six tabs named after
//     what she sees, with "Google and sharing" last.
//   - Obsolete boxes are HIDDEN, never deleted (the data stays):
//       heroImages: the Direction D hero draws live stitching, not photos. It
//         was required, so it put a red "No items" error on her form.
//       gallery*: the old "gallery preview" band is gone from the page.
//       cta*: the old bottom banner. The closing banner reads final* first and
//         only falls back to cta* (FinalCta.astro), and every final* box is
//         filled in, so cta* never shows. Kept as the fallback, out of sight.
//   - Nothing here is required except the headline. A box the page works
//     without must never put a red mark on her form.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { HomeIcon } from '@sanity/icons';
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
  HEADLINE_NEEDED,
  HERO_SUBHEAD,
  TOO_LONG,
  BUTTON_LINK_HELP,
} from './_copy';
import { SEO_PREVIEW } from './_seoPreview';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Top of the page' },
    { name: 'categories', title: 'Item circles' },
    { name: 'about', title: 'About you' },
    { name: 'process', title: 'How it works' },
    { name: 'final', title: 'Photo wall and closing banner' },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    // ── Top of the page (HomeHero.astro) ─────────────────────────────────────
    defineField({
      name: 'heroEyebrow',
      ...HERO_EYEBROW,
      type: 'string',
      group: 'hero',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      description:
        'The big heading at the very top of your home page, for example "Custom monogramming,".',
      // Two rules, not one chain: `.warning()` at the end of a chain would turn
      // the required rule into a warning too.
      validation: (R) => [R.required().error(HEADLINE_NEEDED), R.max(100).warning(TOO_LONG)],
    }),
    defineField({
      name: 'heroItalicWord',
      title: 'Words in slanted gold letters after the headline',
      type: 'string',
      group: 'hero',
      description:
        'Shown right after the headline in slanted gold letters, for example "made just for you." Leave it empty to show the headline on its own.',
    }),
    defineField({
      name: 'heroSubhead',
      ...HERO_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'hero',
      validation: (R) => R.max(200).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroPrimaryCtaLabel',
      title: 'Words on the main button',
      type: 'string',
      group: 'hero',
      description: 'For example "Request a Free Quote".',
      initialValue: 'Request a Quote',
      validation: (R) => R.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroPrimaryCtaHref',
      title: 'Where the main button goes',
      type: 'string',
      group: 'hero',
      description: `${BUTTON_LINK_HELP} Leave it empty to go to the quote form.`,
      initialValue: '/request-a-quote',
    }),
    defineField({
      name: 'heroSecondaryCtaLabel',
      title: 'Words on the second button',
      type: 'string',
      group: 'hero',
      description:
        'A quieter second button, for example "Browse by Item". Leave it empty to hide it.',
    }),
    defineField({
      name: 'heroSecondaryCtaHref',
      title: 'Where the second button goes',
      type: 'string',
      group: 'hero',
      description: `${BUTTON_LINK_HELP} Leave it empty to go to Shop by Item.`,
    }),
    defineField({
      name: 'trustItems',
      title: 'Short promises under the buttons',
      type: 'array',
      group: 'hero',
      description:
        'Two or three short reassuring lines, for example "No payment to request a quote". Drag to change the order.',
      of: [defineArrayMember({ type: 'string' })],
      validation: (R) => R.max(6).warning('More than six of these crowds the top of the page.'),
    }),
    defineField({
      name: 'marqueeEyebrow',
      title: 'Small label on the moving ribbon of item names',
      type: 'string',
      group: 'hero',
      description:
        'The slowly moving ribbon of item names (towels, totes, hats...) under the top of the page can carry a small label, for example "Stitched on". It is not shown on phones.',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),

    // ── Item circles (HoopWall.astro) ────────────────────────────────────────
    defineField({
      name: 'categoriesEyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'categories',
      description:
        'Above the row of round item photos, for example "Shop by item". The circles themselves come from your shop categories.',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'categoriesHeadline',
      title: 'Heading',
      type: 'string',
      group: 'categories',
      description: 'For example "What would you like embroidered?"',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'categoriesSubhead',
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'categories',
      description: 'Leave it empty to hide it.',
    }),
    defineField({
      name: 'categoriesNote',
      title: 'Small note under the circles',
      type: 'string',
      group: 'categories',
      description:
        'A short reassurance under the row of item circles, for example about bringing your own item. Leave it empty to hide it.',
      validation: (R) => R.max(160).warning(TOO_LONG),
    }),

    // ── About you (MakerBand.astro) ──────────────────────────────────────────
    defineField({
      name: 'aboutEyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'about',
      description: 'For example "Meet Mary Ann".',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'aboutHeadline',
      title: 'Heading',
      type: 'string',
      group: 'about',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'aboutBody',
      title: 'A few words about you',
      type: 'array',
      group: 'about',
      description: 'Two or three warm sentences about you and your studio.',
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
      name: 'aboutPhoto',
      title: 'Your photo',
      type: 'image',
      group: 'about',
      description: 'Shown beside the words about you.',
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
      name: 'makerQuote',
      title: 'A short quote in your own words',
      type: 'text',
      rows: 3,
      group: 'about',
      description:
        'One or two short sentences shown large beside your photo. Something you would really say.',
      validation: (R) => R.max(220).warning(TOO_LONG),
    }),
    defineField({
      name: 'makerSignature',
      title: 'Signature under the quote',
      type: 'string',
      group: 'about',
      description: 'Shown in handwriting under the quote, for example "Mary Ann".',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'makerFacts',
      title: 'Small facts about your studio',
      type: 'array',
      group: 'about',
      description:
        'Two to four short true statements, shown as a little list. Only things that are true today.',
      of: [defineArrayMember({ type: 'string', validation: (R) => R.max(80).warning(TOO_LONG) })],
      validation: (R) => R.max(5).warning('More than five of these crowds the section.'),
    }),
    defineField({
      name: 'aboutCtaLabel',
      title: 'Words on the button',
      type: 'string',
      group: 'about',
      description: 'For example "Learn about Mary Ann".',
      initialValue: 'Learn about Mary Ann',
      validation: (R) => R.max(50).warning(TOO_LONG),
    }),
    defineField({
      name: 'aboutCtaHref',
      title: 'Where the button goes',
      type: 'string',
      group: 'about',
      description: `${BUTTON_LINK_HELP} Leave it empty to go to your About page.`,
      initialValue: '/about',
    }),

    // ── How it works (ProcessPath.astro) ─────────────────────────────────────
    defineField({
      name: 'processEyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'process',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'processHeadline',
      title: 'Heading',
      type: 'string',
      group: 'process',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'processSubhead',
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'process',
      description: 'Leave it empty to hide it.',
    }),
    defineField({
      name: 'processSteps',
      title: 'The steps',
      type: 'array',
      group: 'process',
      description:
        'Three or four short steps. The full story lives on the How It Works page. Drag to change the order.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          fields: [
            defineField({
              name: 'number',
              title: 'Step number',
              type: 'string',
              description: 'For example "01".',
            }),
            defineField({
              name: 'label',
              title: 'Step name',
              type: 'string',
              validation: (R) => R.required().error('Please give this step a name.'),
            }),
            defineField({
              name: 'body',
              title: 'Short description',
              type: 'text',
              rows: 2,
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'number' } },
        }),
      ],
      validation: (R) => R.max(5).warning('More than five steps crowds this section.'),
    }),
    defineField({
      name: 'processCtaLabel',
      title: 'Words on the button',
      type: 'string',
      group: 'process',
      description: 'For example "See how it works".',
      initialValue: 'See how it works',
      validation: (R) => R.max(50).warning(TOO_LONG),
    }),
    defineField({
      name: 'processCtaHref',
      title: 'Where the button goes',
      type: 'string',
      group: 'process',
      description: `${BUTTON_LINK_HELP} Leave it empty to go to How It Works.`,
      initialValue: '/how-it-works',
    }),

    // ── Photo wall (StudioWall.astro) ────────────────────────────────────────
    defineField({
      name: 'wallEyebrow',
      title: 'Photo wall: small line above the heading',
      type: 'string',
      group: 'final',
      description:
        'The wall of photo cards near the bottom of the page. The photos come from Photos of my work.',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'wallHeadline',
      title: 'Photo wall: heading',
      type: 'string',
      group: 'final',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'wallSubhead',
      title: 'Photo wall: line under the heading',
      type: 'text',
      rows: 2,
      group: 'final',
      validation: (R) => R.max(200).warning(TOO_LONG),
    }),
    defineField({
      name: 'wallCtaLabel',
      title: 'Photo wall: words on the button',
      type: 'string',
      group: 'final',
      description: 'The button goes to your Style Gallery.',
      validation: (R) => R.max(50).warning(TOO_LONG),
    }),

    // ── Closing banner (FinalCta.astro) ──────────────────────────────────────
    defineField({
      name: 'finalEyebrow',
      title: 'Closing banner: small line above the headline',
      type: 'string',
      group: 'final',
      description: 'The dark banner at the very bottom of your home page.',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'finalHeadline',
      title: 'Closing banner: headline',
      type: 'string',
      group: 'final',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'finalSubhead',
      title: 'Closing banner: text',
      type: 'text',
      rows: 2,
      group: 'final',
      validation: (R) => R.max(220).warning(TOO_LONG),
    }),
    defineField({
      name: 'finalCtaLabel',
      title: 'Closing banner: words on the button',
      type: 'string',
      group: 'final',
      validation: (R) => R.max(50).warning(TOO_LONG),
    }),
    defineField({
      name: 'finalCtaHref',
      title: 'Closing banner: where the button goes',
      type: 'string',
      group: 'final',
      description: `${BUTTON_LINK_HELP} Leave it empty to go to the quote form.`,
    }),

    // ── Google and sharing ───────────────────────────────────────────────────
    // Phase D: the live Google and shared-link preview (writes nothing).
    defineField({
      name: 'seoPreview',
      ...SEO_PREVIEW,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
    }),
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

    // ── Hidden: no longer on the page (data kept, see the header) ────────────
    defineField({
      name: 'heroImages',
      title: 'Old top-of-page photos (not used)',
      type: 'array',
      hidden: true,
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
        }),
      ],
    }),
    defineField({
      name: 'galleryEyebrow',
      title: 'Old gallery band: small line (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'galleryHeadline',
      title: 'Old gallery band: heading (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'gallerySubhead',
      title: 'Old gallery band: text (not used)',
      type: 'text',
      rows: 2,
      hidden: true,
    }),
    defineField({
      name: 'galleryCtaLabel',
      title: 'Old gallery band: button (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'galleryCtaHref',
      title: 'Old gallery band: button address (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'ctaEyebrow',
      title: 'Old bottom banner: small line (backup only)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'ctaHeadline',
      title: 'Old bottom banner: headline (backup only)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'ctaSubhead',
      title: 'Old bottom banner: text (backup only)',
      type: 'text',
      rows: 2,
      hidden: true,
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Old bottom banner: button (backup only)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'ctaHref',
      title: 'Old bottom banner: button address (backup only)',
      type: 'string',
      hidden: true,
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Home page',
      subtitle: "Your website's front page: mas-monograms.com",
    }),
  },
});
