import {defineField, defineType} from 'sanity'

/**
 * font (document)
 * =============================================================================
 * Drives the Font & Lettering Guide page AND the two lettering dropdowns on the
 * quote form. Full background is in docs/04. The key thing to understand:
 * these are NOT web fonts. We cannot render the actual lettering in the
 * browser, so every entry shows as an uploaded PREVIEW IMAGE. That is why
 * `previewImage` is required.
 *
 * `kind` sorts each entry into one of three buckets, which drives both the
 * guide's sections and which form dropdown the entry appears in:
 *   - lineFont       the named script and line fonts (Meadow, Moonlight, ...)
 *   - monogramStyle  multi-letter monogram layouts (Master Circle, Vine, Pillow)
 *   - appliqueFont   the image / applique fonts from the PDF (Golden Valley, ...)
 */
export const font = defineType({
  name: 'font',
  title: 'Font / Lettering Style',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      description: 'Which section of the guide, and which form dropdown, this belongs to.',
      options: {
        list: [
          {title: 'Line font (named script font)', value: 'lineFont'},
          {title: 'Monogram style (multi-letter layout)', value: 'monogramStyle'},
          {title: 'Applique / image font (from the PDF)', value: 'appliqueFont'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'previewImage',
      title: 'Preview image',
      type: 'image',
      description:
        'Required. A picture of the lettering, since we cannot render the real font in the browser. For the PDF applique fonts, this is the individual JPG crop described in docs/04.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'availableSizes',
      title: 'Available sizes',
      type: 'array',
      description:
        'Mainly for line fonts, for example 0.5 inch, 1 inch, 1.5 inch. Add each size as its own entry.',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional. A note about the feel or best use of this style.',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first within the section.',
    }),
  ],
  orderings: [
    {
      title: 'Kind, then display order',
      name: 'kindOrder',
      by: [
        {field: 'kind', direction: 'asc'},
        {field: 'order', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'name', subtitle: 'kind', media: 'previewImage'},
  },
})
