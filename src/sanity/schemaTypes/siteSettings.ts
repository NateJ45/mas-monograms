// Site-wide singleton ("My business details"): name, contact details, menus,
// footer, Google defaults and the business facts Google reads on every page.
// One instance only; enforced in sanity.config.ts + structure.ts.
//
// 2026-10-05, Mary Ann's Studio pass (Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md):
//   - Four tabs in the order she needs them: contact details first (the
//     Welcome card "Change my phone number or email" opens here), then the top
//     menu, the footer, and Google last.
//   - Only the business name and email stay required: both are shown on every
//     page and she can always fix them. Everything else has a fallback.
//   - HIDDEN (data kept): standardTurnaround, rushOrdersAvailable and
//     rushTurnaround (the site reads none of them since the redesign; the reply
//     promise now lives on the quote and thank-you pages).
//   - Get found site pass (later the same day): googleBusinessUrl is visible
//     again ("Your Google listing link", read into the LocalBusiness sameAs),
//     reviewLinkLabel is new (words on the review link the site draws when
//     googleReviewUrl is set), and socialLinks gained Nextdoor.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { CogIcon, LinkIcon, ChevronDownIcon, ListIcon } from '@sanity/icons';
import { SEO_FIELDSET, SEO_GROUP, SEO_DESCRIPTION_TOO_LONG, PHOTO_WORDS, TOO_LONG } from './_copy';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'My business details',
  type: 'document',
  icon: CogIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'identity', title: 'Name and contact details' },
    { name: 'navigation', title: 'Top menu' },
    { name: 'social', title: 'Footer' },
    { ...SEO_GROUP, title: 'Google' },
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    // ── Name and contact details ─────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Business name',
      type: 'string',
      group: 'identity',
      description: 'Shown on the browser tab and read by Google, for example "MAS Monograms".',
      initialValue: 'MAS Monograms',
      validation: (Rule) => Rule.required().error('Please type your business name.'),
    }),
    defineField({
      name: 'phone',
      title: 'Phone number',
      type: 'string',
      group: 'identity',
      description:
        'Shown in the footer and in the menu on phones. Leave it empty to hide it everywhere.',
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      group: 'identity',
      description: 'Shown in the footer and in the menu on phones.',
      validation: (Rule) =>
        Rule.required()
          .regex(/.+@.+\..+/, { name: 'email', invert: false })
          .error('Please type your email address, like name@example.com.'),
    }),
    defineField({
      name: 'address',
      title: 'Business address',
      type: 'object',
      group: 'identity',
      description:
        'Read by Google so people nearby can find you. Not shown as a full address on the page.',
      fields: [
        defineField({ name: 'street', title: 'Street', type: 'string' }),
        defineField({ name: 'city', title: 'Town', type: 'string', initialValue: 'St. Matthews' }),
        defineField({
          name: 'state',
          title: 'State (two letters)',
          type: 'string',
          initialValue: 'SC',
        }),
        defineField({ name: 'zip', title: 'ZIP code', type: 'string' }),
      ],
    }),
    defineField({
      name: 'serviceArea',
      title: 'The area you serve',
      type: 'string',
      group: 'identity',
      description: 'Read by Google, for example "St. Matthews and surrounding Calhoun County."',
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening hours',
      type: 'array',
      group: 'identity',
      description:
        'Read by Google for your listing. Add one row for each set of days with the same hours, for example Monday to Friday, 09:00 to 17:00. Leave it empty to show no hours.',
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
              validation: (R) => R.required().min(1).error('Please tick at least one day.'),
            }),
            defineField({
              name: 'opens',
              title: 'Opens at',
              type: 'string',
              description: 'On the 24-hour clock, for example "09:00".',
              validation: (R) =>
                R.required()
                  .regex(/^\d{2}:\d{2}$/, { name: '24h time (HH:MM)' })
                  .error('Please type a time like 09:00.'),
            }),
            defineField({
              name: 'closes',
              title: 'Closes at',
              type: 'string',
              description: 'On the 24-hour clock, for example "17:00" for 5 in the afternoon.',
              validation: (R) =>
                R.required()
                  .regex(/^\d{2}:\d{2}$/, { name: '24h time (HH:MM)' })
                  .error('Please type a time like 17:00.'),
            }),
          ],
          preview: {
            select: { days: 'days', opens: 'opens', closes: 'closes' },
            prepare: ({ days, opens, closes }) => ({
              title: Array.isArray(days) && days.length ? days.join(', ') : '(no days yet)',
              subtitle: opens && closes ? `${opens} to ${closes}` : '',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Your Facebook, Instagram and other pages',
      type: 'array',
      group: 'identity',
      description:
        'One row for each. They show as small round buttons in the footer and in the menu on phones.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Which site',
              type: 'string',
              options: {
                list: [
                  { title: 'Facebook', value: 'Facebook' },
                  { title: 'Instagram', value: 'Instagram' },
                  { title: 'Pinterest', value: 'Pinterest' },
                  { title: 'TikTok', value: 'TikTok' },
                  { title: 'YouTube', value: 'YouTube' },
                  { title: 'Nextdoor', value: 'Nextdoor' },
                  { title: 'Other', value: 'Other' },
                ],
                layout: 'dropdown',
              },
              validation: (R) => R.required().error('Please pick which site this is.'),
            }),
            defineField({
              name: 'url',
              title: 'Web address of your page',
              type: 'url',
              description:
                'Copy it from your browser, for example https://www.facebook.com/masmonograms',
              validation: (R) =>
                R.required()
                  .uri({ scheme: ['http', 'https'] })
                  .error('Please paste the full address, starting with https://'),
            }),
            defineField({
              name: 'label',
              title: 'Name to show (only for "Other")',
              type: 'string',
            }),
          ],
          preview: {
            select: { platform: 'platform', url: 'url' },
            prepare: ({ platform, url }) => ({
              title: platform ?? 'Social page',
              subtitle: url ?? '',
            }),
          },
        }),
      ],
    }),
    // Phase E (2026-10-05): read by the Studio's "Make a QR code" tool
    // (src/sanity/components/QrCodeTool.tsx) and, since the Get found site pass the
    // same day, by the site: a review link in the footer (Footer.astro) and on the
    // thank-you page. Empty means nothing is drawn. Optional.
    defineField({
      name: 'googleReviewUrl',
      title: 'Your Google review link',
      type: 'url',
      group: 'identity',
      description:
        'The short link people use to leave you a Google review. The "Make a QR code" tool uses it, and your website shows a review link in the footer and on the thank-you page once it is filled in. To find it: on a computer, open your Google Business Profile, press Read reviews, then Get more reviews, then Copy.',
      validation: (R) =>
        R.uri({ scheme: ['http', 'https'] }).warning(
          'Please paste the full address, starting with https://',
        ),
    }),
    defineField({
      name: 'reviewLinkLabel',
      title: 'Words on your review link',
      type: 'string',
      group: 'identity',
      description:
        'The words on the review link in the footer and on the thank-you page, for example "Leave me a review". Leave it empty to use "Leave a review".',
      validation: (Rule) => Rule.max(40).warning(TOO_LONG),
    }),
    // Unhidden 2026-10-05 (Get found): the site adds it to the business facts
    // Google reads on every page (src/lib/schemas.ts, LocalBusiness sameAs).
    defineField({
      name: 'googleBusinessUrl',
      title: 'Your Google listing link',
      type: 'url',
      group: 'identity',
      description:
        'The link to your Google Business Profile. It helps Google connect your website with your listing.',
      validation: (R) =>
        R.uri({ scheme: ['https'] }).warning(
          'Please paste the full address, starting with https://',
        ),
    }),
    defineField({
      name: 'tagline',
      title: 'Your one-line description',
      type: 'string',
      group: 'identity',
      description:
        'Shown under your name in the footer, for example "Custom embroidery from St. Matthews, SC."',
      validation: (Rule) => Rule.max(120).warning(TOO_LONG),
    }),
    defineField({
      name: 'logo',
      title: 'Your logo',
      type: 'image',
      group: 'identity',
      description:
        'Leave this empty and the site keeps the drawn MAS Monograms logo it already uses, which is the one designed for it. If you do add one, trim the empty space around the edges first.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'What the logo says',
          type: 'string',
          description:
            'For people who use a screen reader, and for Google. Usually just "MAS Monograms".',
          validation: (Rule) =>
            Rule.custom((value, ctx: any) =>
              ctx.parent?.asset && !value
                ? 'Please say what the logo says, so screen readers can read it'
                : true,
            ),
        }),
      ],
    }),

    // ── Top menu ─────────────────────────────────────────────────────────────
    defineField({
      name: 'navItems',
      title: 'Links in the top menu',
      type: 'array',
      group: 'navigation',
      description:
        'In order, left to right. Add a Link for one page, or a Dropdown to group a few links. Drag to change the order. Leave it empty to use the built-in menu.',
      of: [
        // The shared link (./navLink.ts). Every link already in this menu is
        // stored as a "navLink", so they all keep working exactly as they are
        // and simply gain the page picker.
        defineArrayMember({ type: 'navLink' }),
        defineArrayMember({
          type: 'object',
          name: 'navGroup',
          title: 'Dropdown',
          icon: ChevronDownIcon,
          fields: [
            defineField({
              name: 'label',
              title: 'Words on the menu',
              type: 'string',
              validation: (R) => R.required().error('Please type the words for this menu.'),
            }),
            defineField({
              name: 'links',
              title: 'Links in this dropdown',
              type: 'array',
              of: [
                // Shared link first, so "Add item" reaches for the one with the
                // page picker.
                defineArrayMember({ type: 'navLink' }),
                // The original typed-address link, kept so the dropdowns that
                // were set up before the picker existed stay editable in place.
                defineArrayMember({
                  type: 'object',
                  name: 'navSubLink',
                  title: 'Link (address typed by hand)',
                  icon: LinkIcon,
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Words on the link',
                      type: 'string',
                      validation: (R) => R.required().error('Please type the words for this link.'),
                    }),
                    defineField({
                      name: 'href',
                      title: 'Address',
                      type: 'string',
                      description: 'A page on your website, written like /pricing.',
                      validation: (R) => R.required().error('Please type where this link goes.'),
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (R) => R.min(1).warning('A dropdown with no links shows nothing.'),
            }),
          ],
          preview: {
            select: { title: 'label', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no words yet)',
              subtitle: `Dropdown: ${Array.isArray(links) ? links.length : 0} links`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'headerCta',
      title: 'The quote button',
      type: 'object',
      group: 'navigation',
      description:
        'The one colored button in the top bar, and the matching button in the phone menu. Leave the boxes empty and it keeps saying what the box below says and goes to the Request a Quote page.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'show',
          title: 'Show the button',
          type: 'boolean',
          description: 'Turn this off to take the button out of the top bar and the phone menu.',
          initialValue: true,
        }),
        defineField({
          name: 'label',
          title: 'Words on the button',
          type: 'string',
          description: 'Leave it empty to use the box below.',
        }),
        defineField({
          name: 'link',
          title: 'Where the button goes',
          type: 'navLink',
          description: 'Leave it empty to keep going to the Request a Quote page.',
        }),
      ],
      preview: {
        select: { show: 'show', label: 'label' },
        prepare: ({ show, label }) => ({
          title: label || 'Request a Quote',
          subtitle: show === false ? 'Hidden' : 'The quote button',
        }),
      },
    }),
    defineField({
      name: 'quoteCtaLabel',
      title: 'Words on the quote button',
      type: 'string',
      group: 'navigation',
      description: 'The colored button in the top bar, for example "Request a Quote".',
      initialValue: 'Request a Quote',
      validation: (Rule) => Rule.max(40).warning(TOO_LONG),
    }),
    defineField({
      name: 'menuContactLabel',
      title: 'Small label above your phone and email in the phone menu',
      type: 'string',
      group: 'navigation',
      description:
        'On a phone, the menu ends with your phone number and email. This small label sits above them, for example "At the bench".',
      validation: (Rule) => Rule.max(40).warning(TOO_LONG),
    }),
    // Small on/off switches for the contact details in the menus. All three are
    // ON unless they are turned off, so a site nobody has touched looks exactly
    // the same as before these switches existed.
    defineField({
      name: 'showEmail',
      title: 'Show your email address in the phone menu',
      type: 'boolean',
      group: 'navigation',
      description:
        'Your email in the "Get in touch" part of the menu on phones. On unless you turn it off.',
      initialValue: true,
    }),
    defineField({
      name: 'showSocials',
      title: 'Show the social buttons in the phone menu',
      type: 'boolean',
      group: 'navigation',
      description:
        'The little Facebook and Instagram buttons at the bottom of the menu on phones. On unless you turn it off.',
      initialValue: true,
    }),

    // ── Footer ───────────────────────────────────────────────────────────────
    defineField({
      name: 'footerColumns',
      title: 'Columns of links in the footer',
      type: 'array',
      group: 'social',
      description:
        'Each column has a heading and a few links. Leave it empty to use the built-in footer.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          title: 'Column',
          icon: ListIcon,
          fields: [
            defineField({
              name: 'title',
              title: 'Column heading',
              type: 'string',
              validation: (R) => R.required().error('Please give this column a heading.'),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                // Shared link first, so "Add item" reaches for the one with the
                // page picker.
                defineArrayMember({ type: 'navLink' }),
                // The original typed-address link, kept so the columns that were
                // set up before the picker existed stay editable in place.
                defineArrayMember({
                  type: 'object',
                  name: 'footerLink',
                  title: 'Link (address typed by hand)',
                  icon: LinkIcon,
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Words on the link',
                      type: 'string',
                      validation: (R) => R.required().error('Please type the words for this link.'),
                    }),
                    defineField({
                      name: 'href',
                      title: 'Address',
                      type: 'string',
                      description: 'A page on your website, written like /pricing.',
                      validation: (R) => R.required().error('Please type where this link goes.'),
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (R) => R.min(1).warning('A column with no links shows only its heading.'),
            }),
          ],
          preview: {
            select: { title: 'title', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no heading yet)',
              subtitle: `${Array.isArray(links) ? links.length : 0} links`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'legalNav',
      title: 'Small-print links at the very bottom',
      type: 'array',
      group: 'social',
      description:
        'The little links on the bottom bar, beside the copyright line. Leave this empty and the site lists your legal pages there on its own, which is usually what you want. Anything you add here is shown instead of that list.',
      validation: (Rule) => Rule.max(6).warning('More than six small-print links is a lot.'),
      of: [defineArrayMember({ type: 'navLink' })],
    }),
    defineField({
      name: 'showFooterSocials',
      title: 'Show the social buttons in the footer',
      type: 'boolean',
      group: 'social',
      description: 'The row of round social buttons down in the footer. On unless you turn it off.',
      initialValue: true,
    }),
    defineField({
      name: 'footerCredit',
      title: 'Website credit line',
      type: 'string',
      group: 'social',
      description: 'The small "website by" line in the footer. You do not need to change it.',
    }),
    defineField({
      name: 'footerCreditUrl',
      title: 'Where the credit line links to',
      type: 'url',
      group: 'social',
      description: 'You do not need to change it.',
    }),

    // ── Google ───────────────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'Usual title in Google',
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      description:
        'Used for any page that has no Google title of its own, for example "MAS Monograms | Custom Embroidery in St. Matthews, SC".',
      validation: (Rule) =>
        Rule.max(70).warning('Google cuts titles longer than about 60 letters short.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Usual description for Google',
      type: 'text',
      rows: 3,
      group: 'seo',
      fieldset: 'seo',
      description:
        'Used for any page that has no Google description of its own. About 150 to 160 letters.',
      validation: (Rule) => Rule.max(160).warning(SEO_DESCRIPTION_TOO_LONG),
    }),
    defineField({
      name: 'seoImage',
      title: 'Usual picture when a page is shared',
      type: 'image',
      group: 'seo',
      fieldset: 'seo',
      description:
        'Shown when someone shares a link to your website on Facebook or in a text message. A wide picture, about 1200 by 630.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
    }),
    defineField({
      name: 'businessType',
      title: 'What kind of business Google should list you as',
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      options: {
        list: [
          { title: 'Local business', value: 'LocalBusiness' },
          { title: 'Store', value: 'Store' },
          { title: 'Professional service', value: 'ProfessionalService' },
          { title: 'Clothing store', value: 'ClothingStore' },
        ],
        layout: 'radio',
      },
      initialValue: 'LocalBusiness',
    }),
    defineField({
      name: 'priceRange',
      title: 'Price range Google shows',
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
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
      name: 'geo',
      title: 'Map pin for Google',
      type: 'object',
      group: 'seo',
      fieldset: 'seo',
      description:
        'Leave it empty until you know the exact spot. To find it in Google Maps, right-click your location: the first line shows the two numbers.',
      fields: [
        defineField({
          name: 'latitude',
          title: 'First number (latitude)',
          type: 'number',
          description: 'For example 33.6640',
        }),
        defineField({
          name: 'longitude',
          title: 'Second number (longitude)',
          type: 'number',
          description: 'For example -80.7776',
        }),
      ],
      options: { collapsible: true, collapsed: true },
    }),

    // ── Hidden: the site no longer reads these (data kept, see the header) ───
    defineField({
      name: 'standardTurnaround',
      title: 'Old usual turnaround time (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'rushOrdersAvailable',
      title: 'Old rush orders switch (not used)',
      type: 'boolean',
      hidden: true,
    }),
    defineField({
      name: 'rushTurnaround',
      title: 'Old rush turnaround time (not used)',
      type: 'string',
      hidden: true,
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'My business details',
      subtitle: 'Phone, email, address, hours, menus and footer',
    }),
  },
});
