// Home page singleton. Every piece of text on the homepage comes from here.
// No pageBuilder — this page has a fixed section order designed for conversion.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { HomeIcon } from '@sanity/icons';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'Google & sharing' },
    { name: 'hero', title: 'Top of the page', default: true },
    { name: 'trust', title: 'Trust strip' },
    { name: 'categories', title: 'Shop categories' },
    { name: 'about', title: 'About / Maker blurb' },
    { name: 'process', title: 'Process preview' },
    { name: 'gallery', title: 'Gallery preview' },
    { name: 'wall', title: 'Studio wall (photo cards)' },
    { name: 'cta', title: 'Bottom banner' },
    { name: 'final', title: 'Closing thread banner' },
  ],
  fieldsets: [
    {
      name: 'seo',
      title: 'Google & sharing — you rarely need to touch this',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // ── SEO ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'Google & browser-tab title',
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      description: 'Browser tab + Google title. Aim for 50–60 characters.',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Google search description',
      type: 'text',
      rows: 3,
      group: 'seo',
      fieldset: 'seo',
      description: 'Google results sentence. Aim for 150–160 characters.',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.'),
    }),
    defineField({
      name: 'seoImage',
      title: 'Photo shown when the page is shared',
      type: 'image',
      group: 'seo',
      fieldset: 'seo',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Photo description (helps screen readers & Google)',
          type: 'string',
        }),
      ],
    }),

    // ── Hero ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'heroImages',
      title: 'Top-of-page photos',
      type: 'array',
      group: 'hero',
      description:
        'Two or more images create a slow cross-fading slideshow. Landscape orientation works best.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Photo description (helps screen readers & Google)',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'heroEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'hero',
      description: 'Small label above the headline. E.g. "Handcrafted in St. Matthews, SC".',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      description:
        'The main hero headline. Can wrap two lines. Use <em> syntax for italic accent words.',
      validation: (R) => R.required().max(100),
    }),
    defineField({
      name: 'heroItalicWord',
      title: 'Word to slant (italic) — optional',
      type: 'string',
      group: 'hero',
      description:
        'One word from the headline to show in slanted italic. Type it exactly as it appears in the headline.',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Short line under the heading',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'One or two sentences below the headline.',
      validation: (R) => R.required().max(200),
    }),
    defineField({
      name: 'heroPrimaryCtaLabel',
      title: 'Main button text',
      type: 'string',
      group: 'hero',
      initialValue: 'Request a Quote',
      validation: (R) => R.required().max(40),
    }),
    defineField({
      name: 'heroPrimaryCtaHref',
      title: 'Main button link',
      type: 'string',
      group: 'hero',
      initialValue: '/request-a-quote',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'heroSecondaryCtaLabel',
      title: 'Second button text (optional)',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCtaHref',
      title: 'Second button link (optional)',
      type: 'string',
      group: 'hero',
    }),

    // ── Trust strip ───────────────────────────────────────────────────────────
    defineField({
      name: 'trustItems',
      title: 'Trust strip items',
      type: 'array',
      group: 'trust',
      description:
        'Short reassuring lines in the strip below the hero. E.g. "No minimums on custom orders" or "Satisfaction guaranteed".',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(2).max(6),
    }),
    defineField({
      name: 'marqueeEyebrow',
      title: 'Small label on the scrolling item strip (optional)',
      type: 'string',
      group: 'trust',
      description:
        'The slowly scrolling strip of item names (towels, totes, hats...) can carry a small label, e.g. "Stitched on".',
      validation: (R) => R.max(60),
    }),

    // ── Shop categories section ───────────────────────────────────────────────
    defineField({
      name: 'categoriesEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'categories',
      description: 'Small label above the categories heading. E.g. "Shop by item".',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'categoriesHeadline',
      title: 'Headline',
      type: 'string',
      group: 'categories',
      description: 'Section heading. E.g. "What would you like embroidered?"',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'categoriesSubhead',
      title: 'Short line under the heading (optional)',
      type: 'text',
      rows: 2,
      group: 'categories',
    }),
    defineField({
      name: 'categoriesNote',
      title: 'Small note under the item circles (optional)',
      type: 'string',
      group: 'categories',
      description:
        'A short reassurance below the row of item circles. E.g. about bringing your own item.',
      validation: (R) => R.max(160),
    }),

    // ── About / Maker blurb ───────────────────────────────────────────────────
    defineField({
      name: 'aboutEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'about',
      description: 'E.g. "Meet Mary Ann".',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'aboutHeadline',
      title: 'Headline',
      type: 'string',
      group: 'about',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'aboutBody',
      title: 'Body copy',
      type: 'array',
      group: 'about',
      description: 'Two to three sentences about Mary Ann. Warm, personal.',
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
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'aboutPhoto',
      title: 'Photo',
      type: 'image',
      group: 'about',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Photo description (helps screen readers & Google)',
          type: 'string',
          validation: (R) => R.required(),
        }),
      ],
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'aboutCtaLabel',
      title: 'Button text',
      type: 'string',
      group: 'about',
      initialValue: 'Learn about Mary Ann',
      validation: (R) => R.required().max(50),
    }),
    defineField({
      name: 'aboutCtaHref',
      title: 'Button link (where it goes)',
      type: 'string',
      group: 'about',
      initialValue: '/about',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'makerQuote',
      title: 'Pull-quote in your own words (optional)',
      type: 'text',
      rows: 3,
      group: 'about',
      description:
        'One or two short sentences shown large beside your photo. Must be something you would say.',
      validation: (R) => R.max(220),
    }),
    defineField({
      name: 'makerSignature',
      title: 'Signature line (optional)',
      type: 'string',
      group: 'about',
      description: 'Shown in handwriting under the quote. E.g. "Mary Ann".',
      validation: (R) => R.max(60),
    }),
    defineField({
      name: 'makerFacts',
      title: 'Small facts about the studio (optional)',
      type: 'array',
      group: 'about',
      description:
        'Two to four short true statements, shown as a little list. Only things that are true today.',
      of: [defineArrayMember({ type: 'string', validation: (R) => R.max(80) })],
      validation: (R) => R.max(5),
    }),

    // ── Process preview ───────────────────────────────────────────────────────
    defineField({
      name: 'processEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'process',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'processHeadline',
      title: 'Headline',
      type: 'string',
      group: 'process',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'processSubhead',
      title: 'Short line under the heading (optional)',
      type: 'text',
      rows: 2,
      group: 'process',
    }),
    defineField({
      name: 'processSteps',
      title: 'Process steps',
      type: 'array',
      group: 'process',
      description: 'Short preview steps (3–4). More detail lives on the How It Works page.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          fields: [
            defineField({
              name: 'number',
              title: 'Step number',
              type: 'string',
              description: 'E.g. "01"',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'label',
              title: 'Step name',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'body',
              title: 'Short description',
              type: 'text',
              rows: 2,
              validation: (R) => R.required(),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'number' } },
        }),
      ],
      validation: (Rule) => Rule.required().min(2).max(5),
    }),
    defineField({
      name: 'processCtaLabel',
      title: 'Button text',
      type: 'string',
      group: 'process',
      initialValue: 'See how it works',
      validation: (R) => R.required().max(50),
    }),
    defineField({
      name: 'processCtaHref',
      title: 'Button link (where it goes)',
      type: 'string',
      group: 'process',
      initialValue: '/how-it-works',
      validation: (R) => R.required(),
    }),

    // ── Gallery preview ───────────────────────────────────────────────────────
    defineField({
      name: 'galleryEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'gallery',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'galleryHeadline',
      title: 'Headline',
      type: 'string',
      group: 'gallery',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'gallerySubhead',
      title: 'Short line under the heading (optional)',
      type: 'text',
      rows: 2,
      group: 'gallery',
    }),
    defineField({
      name: 'galleryCtaLabel',
      title: 'Button text',
      type: 'string',
      group: 'gallery',
      initialValue: 'View full style gallery',
      validation: (R) => R.required().max(50),
    }),
    defineField({
      name: 'galleryCtaHref',
      title: 'Button link (where it goes)',
      type: 'string',
      group: 'gallery',
      initialValue: '/style-gallery',
      validation: (R) => R.required(),
    }),

    // ── Studio wall (swatch-card photo wall) ──────────────────────────────────
    defineField({
      name: 'wallEyebrow',
      title: 'Small label above the heading (optional)',
      type: 'string',
      group: 'wall',
      validation: (R) => R.max(60),
    }),
    defineField({
      name: 'wallHeadline',
      title: 'Headline (optional)',
      type: 'string',
      group: 'wall',
      validation: (R) => R.max(80),
    }),
    defineField({
      name: 'wallSubhead',
      title: 'Short line under the heading (optional)',
      type: 'text',
      rows: 2,
      group: 'wall',
      validation: (R) => R.max(200),
    }),
    defineField({
      name: 'wallCtaLabel',
      title: 'Button text (optional)',
      type: 'string',
      group: 'wall',
      description: 'The button links to the Style Gallery.',
      validation: (R) => R.max(50),
    }),

    // ── Final CTA banner ──────────────────────────────────────────────────────
    defineField({
      name: 'ctaEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'cta',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'ctaHeadline',
      title: 'Headline',
      type: 'string',
      group: 'cta',
      validation: (R) => R.required().max(100),
    }),
    defineField({
      name: 'ctaSubhead',
      title: 'Body copy (optional)',
      type: 'text',
      rows: 2,
      group: 'cta',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button text',
      type: 'string',
      group: 'cta',
      initialValue: 'Request a Quote',
      validation: (R) => R.required().max(50),
    }),
    defineField({
      name: 'ctaHref',
      title: 'Button link (where it goes)',
      type: 'string',
      group: 'cta',
      initialValue: '/request-a-quote',
      validation: (R) => R.required(),
    }),

    // ── Closing thread banner (the golden thread ends here) ───────────────────
    defineField({
      name: 'finalEyebrow',
      title: 'Small label above the heading (optional)',
      type: 'string',
      group: 'final',
      validation: (R) => R.max(60),
    }),
    defineField({
      name: 'finalHeadline',
      title: 'Headline (optional)',
      type: 'string',
      group: 'final',
      validation: (R) => R.max(100),
    }),
    defineField({
      name: 'finalSubhead',
      title: 'Body copy (optional)',
      type: 'text',
      rows: 2,
      group: 'final',
      validation: (R) => R.max(220),
    }),
    defineField({
      name: 'finalCtaLabel',
      title: 'Button text (optional)',
      type: 'string',
      group: 'final',
      validation: (R) => R.max(50),
    }),
    defineField({
      name: 'finalCtaHref',
      title: 'Button link (optional)',
      type: 'string',
      group: 'final',
      description: 'Usually /request-a-quote.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
