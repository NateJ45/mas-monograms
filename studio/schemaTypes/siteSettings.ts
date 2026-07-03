// Site-wide singleton — identity, nav, footer, SEO defaults, social links,
// contact info, and JSON-LD data for every page.
// One instance only; enforced in sanity.config.ts + structure.ts.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { CogIcon, LinkIcon, ChevronDownIcon, ListIcon } from '@sanity/icons';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'identity',   title: 'Identity & contact', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'social',     title: 'Social & footer' },
    { name: 'seo',        title: 'SEO defaults' },
    { name: 'business',   title: 'Business details' },
  ],
  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Site title',
      type: 'string',
      group: 'identity',
      description: 'Used in the browser tab and JSON-LD. E.g. "MAS Monograms".',
      initialValue: 'MAS Monograms',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'identity',
      description: 'Short tagline shown under the logo in the footer. E.g. "Custom embroidery from St. Matthews, SC."',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      group: 'identity',
      description: 'Public email address — shown in the footer and on the quote form.',
      validation: (Rule) =>
        Rule.required().regex(/.+@.+\..+/, { name: 'email', invert: false }),
    }),
    defineField({
      name: 'phone',
      title: 'Phone number (optional)',
      type: 'string',
      group: 'identity',
      description: 'Public phone number. Leave blank to hide.',
    }),
    defineField({
      name: 'address',
      title: 'Business address',
      type: 'object',
      group: 'identity',
      description: 'Used in JSON-LD LocalBusiness schema on every page.',
      fields: [
        defineField({ name: 'street', title: 'Street address', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string', initialValue: 'St. Matthews' }),
        defineField({ name: 'state', title: 'State (2-letter)', type: 'string', initialValue: 'SC' }),
        defineField({ name: 'zip', title: 'ZIP code', type: 'string' }),
      ],
    }),
    defineField({
      name: 'serviceArea',
      title: 'Service area note',
      type: 'string',
      group: 'identity',
      description: 'Short description of service area for footer and SEO. E.g. "St. Matthews and surrounding Calhoun County."',
    }),
    defineField({
      name: 'geo',
      title: 'Map coordinates (optional)',
      type: 'object',
      group: 'business',
      description:
        'Latitude & longitude for the LocalBusiness map pin in Google. Optional — leave blank until you have exact coordinates (find them on Google Maps: right-click your location → the first line is "latitude, longitude").',
      fields: [
        defineField({ name: 'latitude', title: 'Latitude', type: 'number', description: 'E.g. 33.6640' }),
        defineField({ name: 'longitude', title: 'Longitude', type: 'number', description: 'E.g. -80.7776' }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening hours (optional)',
      type: 'array',
      group: 'business',
      description:
        'Business hours for the Google listing. Add one row per set of days that share the same hours (e.g. Mon–Fri 9:00–17:00). Optional — leave empty to omit hours entirely.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'hoursSpec',
          title: 'Hours',
          fields: [
            defineField({
              name: 'days',
              title: 'Days',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              options: {
                list: [
                  { title: 'Monday', value: 'Monday' },
                  { title: 'Tuesday', value: 'Tuesday' },
                  { title: 'Wednesday', value: 'Wednesday' },
                  { title: 'Thursday', value: 'Thursday' },
                  { title: 'Friday', value: 'Friday' },
                  { title: 'Saturday', value: 'Saturday' },
                  { title: 'Sunday', value: 'Sunday' },
                ],
              },
              validation: (R) => R.required().min(1),
            }),
            defineField({
              name: 'opens',
              title: 'Opens',
              type: 'string',
              description: '24-hour time, e.g. "09:00".',
              validation: (R) => R.required().regex(/^\d{2}:\d{2}$/, { name: '24h time (HH:MM)' }),
            }),
            defineField({
              name: 'closes',
              title: 'Closes',
              type: 'string',
              description: '24-hour time, e.g. "17:00".',
              validation: (R) => R.required().regex(/^\d{2}:\d{2}$/, { name: '24h time (HH:MM)' }),
            }),
          ],
          preview: {
            select: { days: 'days', opens: 'opens', closes: 'closes' },
            prepare: ({ days, opens, closes }) => ({
              title: Array.isArray(days) && days.length ? days.join(', ') : '(no days)',
              subtitle: opens && closes ? `${opens}–${closes}` : '',
            }),
          },
        }),
      ],
    }),

    // ── Navigation ────────────────────────────────────────────────────────────
    defineField({
      name: 'navItems',
      title: 'Top menu links',
      type: 'array',
      group: 'navigation',
      description:
        'Header navigation links, in order. Add a Link for a single page, or a Dropdown to group links. Leave empty to use the built-in default menu.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navLink',
          title: 'Link',
          icon: LinkIcon,
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'href', title: 'URL', type: 'string', description: 'E.g. /pricing or /shop-by-item.', validation: (R) => R.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        }),
        defineArrayMember({
          type: 'object',
          name: 'navGroup',
          title: 'Dropdown',
          icon: ChevronDownIcon,
          fields: [
            defineField({ name: 'label', title: 'Menu label', type: 'string', validation: (R) => R.required() }),
            defineField({
              name: 'links',
              title: 'Menu links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'navSubLink',
                  title: 'Link',
                  icon: LinkIcon,
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
                    defineField({ name: 'href', title: 'URL', type: 'string', validation: (R) => R.required() }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (R) => R.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'label', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no label)',
              subtitle: `Dropdown: ${Array.isArray(links) ? links.length : 0} links`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'quoteCtaLabel',
      title: '"Request a Quote" button label',
      type: 'string',
      group: 'navigation',
      description: 'The blush CTA button in the nav bar. E.g. "Request a Quote".',
      initialValue: 'Request a Quote',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer link columns',
      type: 'array',
      group: 'navigation',
      description: 'Titled link columns in the footer. Leave empty to use the built-in default.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          title: 'Column',
          icon: ListIcon,
          fields: [
            defineField({ name: 'title', title: 'Column heading', type: 'string', validation: (R) => R.required() }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'footerLink',
                  title: 'Link',
                  icon: LinkIcon,
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
                    defineField({ name: 'href', title: 'URL', type: 'string', validation: (R) => R.required() }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (R) => R.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'title', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no heading)',
              subtitle: `${Array.isArray(links) ? links.length : 0} links`,
            }),
          },
        }),
      ],
    }),

    // ── Social & footer ───────────────────────────────────────────────────────
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'social',
      description: 'One entry per platform. Shown in the footer and optionally in the nav.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Facebook', value: 'Facebook' },
                  { title: 'Instagram', value: 'Instagram' },
                  { title: 'Pinterest', value: 'Pinterest' },
                  { title: 'TikTok', value: 'TikTok' },
                  { title: 'YouTube', value: 'YouTube' },
                  { title: 'Other', value: 'Other' },
                ],
                layout: 'dropdown',
              },
              validation: (R) => R.required(),
            }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (R) => R.required().uri({ scheme: ['http', 'https'] }) }),
            defineField({ name: 'label', title: 'Custom label (for "Other")', type: 'string' }),
          ],
          preview: {
            select: { platform: 'platform', url: 'url' },
            prepare: ({ platform, url }) => ({ title: platform ?? 'Social link', subtitle: url ?? '' }),
          },
        }),
      ],
    }),
    defineField({
      name: 'googleBusinessUrl',
      title: 'Google Business Profile URL',
      type: 'url',
      group: 'social',
      description: 'Link to the Google Business listing. Used in the LocalBusiness structured data.',
    }),
    defineField({
      name: 'footerCredit',
      title: 'Footer credit',
      type: 'string',
      group: 'social',
      description: 'Optional credit line. E.g. "Site by Nate\'s Creations".',
    }),
    defineField({
      name: 'footerCreditUrl',
      title: 'Footer credit URL',
      type: 'url',
      group: 'social',
      description: 'When set, the credit becomes a link.',
    }),

    // ── SEO defaults ──────────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'Default SEO title',
      type: 'string',
      group: 'seo',
      description: 'Used on pages that don\'t have their own SEO title. E.g. "MAS Monograms — Custom Embroidery in St. Matthews, SC".',
      validation: (Rule) => Rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Used on pages that don\'t have their own SEO description. Aim for 150–160 characters.',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'seoImage',
      title: 'Default social share image',
      type: 'image',
      group: 'seo',
      description: 'Image shown when the site is shared on social media. ~1200 × 630 px.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    // ── Business details (JSON-LD) ─────────────────────────────────────────────
    defineField({
      name: 'businessType',
      title: 'Business type',
      type: 'string',
      group: 'business',
      description: 'Schema.org type for JSON-LD. Affects how Google shows the listing.',
      options: {
        list: [
          { title: 'Local Business (generic)', value: 'LocalBusiness' },
          { title: 'Store',                    value: 'Store' },
          { title: 'Professional Service',     value: 'ProfessionalService' },
          { title: 'Clothing Store',            value: 'ClothingStore' },
        ],
        layout: 'radio',
      },
      initialValue: 'LocalBusiness',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priceRange',
      title: 'Price range',
      type: 'string',
      group: 'business',
      description: 'Schema.org priceRange. E.g. "$" or "$$". Shown in Google local results.',
      options: {
        list: [
          { title: '$ (budget)', value: '$' },
          { title: '$$ (moderate)', value: '$$' },
          { title: '$$$ (premium)', value: '$$$' },
        ],
        layout: 'radio',
      },
      initialValue: '$$',
    }),
    defineField({
      name: 'standardTurnaround',
      title: 'Standard turnaround time',
      type: 'string',
      group: 'business',
      description: 'Shown on the quote form and thank-you page. E.g. "7–10 business days".',
      initialValue: '7–10 business days',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rushOrdersAvailable',
      title: 'Rush orders available',
      type: 'boolean',
      group: 'business',
      description: 'When on, the quote form offers a rush order option.',
      initialValue: true,
    }),
    defineField({
      name: 'rushTurnaround',
      title: 'Rush turnaround time',
      type: 'string',
      group: 'business',
      description: 'Only shown when rush orders are available. E.g. "3–5 business days (additional fee applies)".',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
