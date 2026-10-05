// Style Gallery page singleton. The gallery images live in the galleryItem
// collection. This singleton controls all the copy and filter labels.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { ImagesIcon } from '@sanity/icons';

export const styleGalleryPage = defineType({
  name: 'styleGalleryPage',
  title: 'Style Gallery Page',
  type: 'document',
  icon: ImagesIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'Google & sharing' },
    { name: 'hero', title: 'Top of the page', default: true },
    { name: 'filters', title: 'Filter labels' },
    { name: 'viewer', title: 'Photo viewer' },
    { name: 'cta', title: 'CTA' },
  ],
  fieldsets: [
    {
      name: 'seo',
      title: 'Google & sharing — you rarely need to touch this',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Google & browser-tab title',
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Google search description',
      type: 'text',
      rows: 3,
      group: 'seo',
      fieldset: 'seo',
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

    defineField({
      name: 'heroEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'hero',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      validation: (R) => R.required().max(100),
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Short line under the heading (optional)',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'introCtaLabel',
      title: 'Button under the intro (optional)',
      type: 'string',
      group: 'hero',
      description:
        'The button under the short intro that takes people to the quote form, e.g. "Start your quote".',
      validation: (R) => R.max(40),
    }),

    defineField({
      name: 'filterAllLabel',
      title: '"All" filter chip label',
      type: 'string',
      group: 'filters',
      description: 'Label for the "show everything" chip. E.g. "All styles" or "All items".',
      initialValue: 'All',
      validation: (R) => R.required().max(30),
    }),
    defineField({
      name: 'additionalFilterTags',
      title: 'Additional filter tags',
      type: 'array',
      group: 'filters',
      description:
        'Custom tag filters shown in addition to the item category filters. E.g. "Wedding", "Gifts", "Teams".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'filterTag',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'tag',
              title: 'Tag value (matches galleryItem tags)',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'tag' } },
        }),
      ],
    }),
    defineField({
      name: 'filterGroups',
      title: 'Filter groups',
      type: 'array',
      group: 'filters',
      description:
        'Group the gallery filter tags under headings (e.g. "Item", "Theme & Occasion") so browsers see a tidy, organized filter instead of one long wall of tags. Each heading lists the raw tags that should appear beneath it. Only tags that actually appear on a photo will show — you can safely list a tag here before any photo uses it. Tags you leave out of every group are hidden from the filter entirely, which is handy for internal-only tags like "closeup" or "customer-photo".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'filterGroup',
          fields: [
            defineField({
              name: 'groupLabel',
              title: 'Group heading',
              type: 'string',
              description:
                'Shown above this group of filter chips. E.g. "Item", "Theme & Occasion", "Technique & Style", "Recipient".',
              validation: (R) => R.required().max(40),
            }),
            defineField({
              name: 'tags',
              title: 'Tags in this group',
              type: 'array',
              description:
                'The raw galleryItem tag values that belong under this heading (e.g. "tote", "napkin", "baby-hat"). Chips display in title case automatically. Order does not matter — the site shows the most-photographed tags first.',
              of: [defineArrayMember({ type: 'string' })],
              validation: (R) => R.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'groupLabel', tags: 'tags' },
            prepare: ({ title, tags }) => ({
              title: title ?? '(no heading)',
              subtitle: Array.isArray(tags)
                ? `${tags.length} tag${tags.length === 1 ? '' : 's'}`
                : 'No tags',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'emptyStateMessage',
      title: 'Empty state message',
      type: 'string',
      group: 'filters',
      description: 'Shown when no gallery items match the current filter.',
      initialValue: 'No photos for that filter yet — check back soon!',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'filterToggleLabel',
      title: 'Filter button on phones (optional)',
      type: 'string',
      group: 'filters',
      description:
        'On a phone the filters fold away behind one button. These are the words on it, e.g. "Filter photos".',
      validation: (R) => R.max(30),
    }),
    defineField({
      name: 'resultsAnnouncement',
      title: 'What screen readers hear after a filter (optional)',
      type: 'string',
      group: 'filters',
      description:
        'Read aloud to people using a screen reader when they pick a filter. Use {filter} for the filter name, {count} for the photos shown and {total} for all photos, e.g. "{filter}: showing {count} of {total} photos".',
      validation: (R) => R.max(120),
    }),
    defineField({
      name: 'requestLabel',
      title: '"Request this" link under each photo (optional)',
      type: 'string',
      group: 'filters',
      description:
        'The small link under a photo that starts a quote for that kind of item, e.g. "Request this". Leave blank to use "Request this".',
      validation: (R) => R.max(40),
    }),
    defineField({
      name: 'fontCaption',
      title: 'Font line under each photo (optional)',
      type: 'string',
      group: 'filters',
      description:
        'The line under a photo that names the embroidery font. Use {font} for the font name, e.g. "{font} font". Also used on the shop category pages and in the photo viewer.',
      validation: (R) => R.max(40),
    }),
    defineField({
      name: 'filterGroupName',
      title: 'Name of the filter area (for screen readers)',
      type: 'string',
      group: 'filters',
      description:
        'Screen readers announce the block of filter buttons by this name, e.g. "Filter gallery".',
      validation: (R) => R.max(40),
    }),
    defineField({
      name: 'filterFallbackHeading',
      title: 'Filter heading when no groups are set up (optional)',
      type: 'string',
      group: 'filters',
      description:
        'Only shown if "Filter groups" above is empty: then every tag shows under this one heading, e.g. "Filters".',
      validation: (R) => R.max(40),
    }),
    defineField({
      name: 'moreTagsLabel',
      title: '"Show more tags" button (optional)',
      type: 'string',
      group: 'filters',
      description:
        'A long group of filters shows the first few and folds the rest behind this button. Use {count} for how many are hidden, e.g. "+ {count} more".',
      validation: (R) => R.max(30),
    }),
    defineField({
      name: 'lessTagsLabel',
      title: '"Show fewer tags" button (optional)',
      type: 'string',
      group: 'filters',
      description: 'The same button once the extra filters are showing, e.g. "Less".',
      validation: (R) => R.max(30),
    }),

    defineField({
      name: 'lightboxLabel',
      title: 'Name of the photo viewer (optional)',
      type: 'string',
      group: 'viewer',
      description:
        'Clicking a photo opens it large. Screen readers announce the viewer by this name, e.g. "Photo viewer". Also used on the shop category pages.',
      validation: (R) => R.max(40),
    }),
    defineField({
      name: 'lightboxCloseLabel',
      title: 'Close button (for screen readers)',
      type: 'string',
      group: 'viewer',
      description: 'The button shows an ×; screen readers say these words, e.g. "Close".',
      validation: (R) => R.max(40),
    }),
    defineField({
      name: 'lightboxPrevLabel',
      title: 'Previous photo button (for screen readers)',
      type: 'string',
      group: 'viewer',
      description: 'E.g. "Previous photo".',
      validation: (R) => R.max(40),
    }),
    defineField({
      name: 'lightboxNextLabel',
      title: 'Next photo button (for screen readers)',
      type: 'string',
      group: 'viewer',
      description: 'E.g. "Next photo".',
      validation: (R) => R.max(40),
    }),

    defineField({
      name: 'ctaEyebrow',
      title: 'Small label above the banner',
      type: 'string',
      group: 'cta',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'ctaHeadline',
      title: 'Banner headline',
      type: 'string',
      group: 'cta',
      validation: (R) => R.required().max(100),
    }),
    defineField({
      name: 'ctaSubhead',
      title: 'Banner text (optional)',
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
  ],
  preview: { prepare: () => ({ title: 'Style Gallery Page' }) },
});
