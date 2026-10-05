// 404 page singleton: the page people see when they follow a broken link.
// Every word on /404 comes from here.
//
// 2026-10-05, Mary Ann's Studio pass: only the headline is required; plain
// titles. `body` is HIDDEN (data kept): src/pages/404.astro reads `page.subhead`,
// which this schema has never declared, so the line under the headline always
// shows its built-in words and editing `body` changed nothing on the website.
// docs/PENDING.md tracks the one-line fix (read `body` in 404.astro); unhide
// `body` in the same change.

import { defineType, defineField } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons';
import {
  SEO_FIELDSET,
  SEO_GROUP,
  SEO_TITLE,
  SEO_TITLE_TOO_LONG,
  SEO_DESCRIPTION,
  SEO_DESCRIPTION_TOO_LONG,
  TOO_LONG,
  BUTTON_LINK_HELP,
} from './_copy';

export const notFoundPage = defineType({
  name: 'notFoundPage',
  title: '"Page not found" page',
  type: 'document',
  icon: HelpCircleIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'content', title: 'The message' },
    { name: 'ctas', title: 'Buttons' },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description:
        'The big heading people see when they follow a broken or mistyped link, for example "That page wandered off."',
      initialValue: 'That page wandered off.',
      validation: (R) => [
        R.required().error('Please type a headline. It is the big heading on this page.'),
        R.max(100).warning(TOO_LONG),
      ],
    }),

    // ── Buttons ──────────────────────────────────────────────────────────────
    defineField({
      name: 'primaryCtaLabel',
      title: 'Words on the main button',
      type: 'string',
      group: 'ctas',
      description: 'Leave it empty to use "Request a Quote".',
      initialValue: 'Back to home',
    }),
    defineField({
      name: 'primaryCtaHref',
      title: 'Where the main button goes',
      type: 'string',
      group: 'ctas',
      description: `${BUTTON_LINK_HELP} Leave it empty to go to the quote form.`,
      initialValue: '/',
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Words on the second button',
      type: 'string',
      group: 'ctas',
      description: 'Leave it empty to use "Shop by Item".',
      initialValue: 'Request a quote',
    }),
    defineField({
      name: 'secondaryCtaHref',
      title: 'Where the second button goes',
      type: 'string',
      group: 'ctas',
      description: `${BUTTON_LINK_HELP} Leave it empty to go to Shop by Item.`,
      initialValue: '/request-a-quote',
    }),

    // ── Google and sharing ───────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      ...SEO_TITLE,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      initialValue: 'Page not found | MAS Monograms',
      validation: (R) => R.max(60).warning(SEO_TITLE_TOO_LONG),
    }),
    defineField({
      name: 'seoDescription',
      ...SEO_DESCRIPTION,
      type: 'text',
      rows: 2,
      group: 'seo',
      fieldset: 'seo',
      initialValue: 'That page wandered off. Head back to the homepage or request a quote.',
      validation: (R) => R.max(160).warning(SEO_DESCRIPTION_TOO_LONG),
    }),

    // ── Hidden: the page does not read it yet (see the header) ───────────────
    defineField({
      name: 'body',
      title: 'Line under the headline (not shown yet)',
      type: 'text',
      rows: 3,
      hidden: true,
    }),
  ],
  preview: {
    prepare: () => ({
      title: '"Page not found" page',
      subtitle: 'Shown when someone follows a broken link',
    }),
  },
});
