// One link in a menu. Shared by the top menu, the footer columns, the
// small-print row at the very bottom, and the quote button.
// (ported from presacademy 2026-08-27; the "chrome options" pattern)
//
// Three ways to say where a link goes:
//   - pick a page from the list. The address comes from the page itself, so
//     renaming a page can never leave a broken link in a menu.
//   - paste a web address for another website.
//   - type the address yourself, the way every menu here was set up before the
//     picker existed. A typed address still WINS, so nothing changes on its own.
//
// Every page type in `internalPage.to[]` must also have an address in
// src/lib/nav-href.ts, or a link to it ends up pointing nowhere and is left out
// of the menu rather than shown as a dead link. Change one, change the other.

import { defineType, defineField } from 'sanity';
import { LinkIcon } from '@sanity/icons';

export const navLink = defineType({
  name: 'navLink',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Words on the link',
      type: 'string',
      description: 'What people see, like "Pricing".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Where does it go?',
      type: 'string',
      options: {
        list: [
          { title: 'A page on this site', value: 'internal' },
          { title: 'Another website', value: 'external' },
          { title: 'An address I type myself', value: 'custom' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
    }),
    defineField({
      name: 'internalPage',
      title: 'Which page?',
      type: 'reference',
      description: 'Pick the page. If the page is renamed later, this link follows it.',
      to: [
        { type: 'homePage' },
        { type: 'howItWorksPage' },
        { type: 'pricingPage' },
        { type: 'aboutPage' },
        { type: 'requestAQuotePage' },
        { type: 'shopIndexPage' },
        { type: 'styleGalleryPage' },
        { type: 'fontGuidePage' },
        { type: 'threadChartPage' },
        { type: 'clearancePage' },
        { type: 'thankYouPage' },
        // Item categories get their own page at /<web address>.
        { type: 'itemCategory' },
        // Legal pages live at /legal/<web address>.
        { type: 'legalPage' },
      ],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'externalUrl',
      title: 'Web address of the other site',
      type: 'url',
      description: 'A full address like https://example.com. It opens in a new tab.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
    defineField({
      name: 'href',
      title: 'Address, typed by hand',
      type: 'string',
      description:
        'An address like /pricing. If there is anything in this box it is used, whatever is picked above. Empty it to use the page picker instead.',
      // Shown while "type it myself" is picked, on links that already have a
      // typed address, and on links where nothing has been chosen yet.
      hidden: ({ parent }) =>
        parent?.linkType !== 'custom' && Boolean(parent?.linkType) && !parent?.href,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      href: 'href',
      externalUrl: 'externalUrl',
      linkType: 'linkType',
      pageTitle: 'internalPage.title',
    },
    prepare: ({ title, href, externalUrl, linkType, pageTitle }) => ({
      title: title || '(no words yet)',
      subtitle: href || (linkType === 'external' ? externalUrl : pageTitle) || 'No destination yet',
    }),
  },
});
