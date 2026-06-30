import {defineField, defineType} from 'sanity'

/**
 * siteSettings (singleton)
 * =============================================================================
 * Global values used across the header, footer, and page metadata. There should
 * be exactly ONE of these.
 *
 * SINGLETON SETUP REMINDER:
 * A singleton is not enforced by the schema alone. In sanity.config.ts you wire
 * the studio's structure (the desk / structure builder) to show this as a single
 * fixed document at a known id (for example "siteSettings"), instead of the
 * default "create as many as you like" list. You also typically hide the
 * "duplicate" and "delete" document actions for it. Do the same for the page
 * singletons (homepage, aboutPage, and so on). The full singleton list is in
 * docs/06.
 *
 * `contactEmail` does double duty: it is the address shown to visitors AND the
 * recipient of quote-form notifications. The backend can read the recipient
 * from here or from an environment variable; whichever you choose, keep the two
 * in sync. See docs/05.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site title',
      type: 'string',
      initialValue: 'MAS Monograms',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      description:
        'Shown to visitors AND used as the quote-notification recipient. Keep this in sync with the backend (docs/05).',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description:
        'For example "St. Matthews, SC". Note: not Mason, OH. That was a content bug on the old site (see README).',
      initialValue: 'St. Matthews, SC',
    }),
    defineField({
      name: 'hours',
      title: 'Hours / response time',
      type: 'string',
      description: 'For example "Mon to Fri, replies within 1 business day".',
    }),
    defineField({
      name: 'socialFacebook',
      title: 'Facebook URL',
      type: 'url',
      description:
        'Real URL still pending from Mary Ann. The old site pointed at a Squarespace demo account, so do not copy that over.',
    }),
    defineField({
      name: 'socialInstagram',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'socialPinterest',
      title: 'Pinterest URL',
      type: 'url',
    }),
    defineField({
      name: 'footerBlurb',
      title: 'Footer blurb',
      type: 'text',
      rows: 3,
      description: 'The short paragraph shown in the footer.',
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO & social sharing',
      type: 'seo', // object type defined in schemas/objects/seo.ts
      description: 'Used as the fallback whenever a page leaves its own SEO fields blank.',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
