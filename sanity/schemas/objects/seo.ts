import {defineField, defineType} from 'sanity'

/**
 * seo (object)
 * =============================================================================
 * Per-page search and social-share metadata. Embed this on every page type
 * (the singletons and the itemCategory documents) as a field named `seo`.
 *
 * Nothing here is required at the field level, on purpose. If a page leaves a
 * value blank, the front end should fall back to the site-wide defaults in
 * siteSettings.defaultSeo. Keep that fallback logic in the Astro layer, not
 * here, so editors are never forced to retype the same defaults on every page.
 *
 * Plain-language companion: docs/06-sanity-content-model.md.
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO & Social Sharing',
  type: 'object',
  // Collapsed by default so it stays tucked at the bottom of each page form.
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description:
        'Shown in the browser tab and in search results. Aim for roughly 50 to 60 characters. If left blank, the page heading is used instead.',
      validation: (Rule) =>
        Rule.max(70).warning('Titles longer than about 60 characters get cut off in search results.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description:
        'The one or two sentence summary under the title in search results. Around 150 to 160 characters works best.',
      validation: (Rule) =>
        Rule.max(200).warning('Descriptions longer than about 160 characters get cut off in search results.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description:
        'The preview image when this page is shared on Facebook or similar. Ideal size is 1200 x 630. If blank, the site default share image is used.',
    }),
  ],
})
