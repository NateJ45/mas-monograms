import {defineField, defineType} from 'sanity'

/**
 * threadColor (document)
 * =============================================================================
 * Drives the Thread Color Chart page and the thread-color dropdown on the quote
 * form. Each color shows as an on-screen swatch. The swatch can come from a
 * `hex` value (quick, approximate) or an uploaded `swatchImage` (closer to the
 * real thread). Prefer the image when color accuracy matters. Either way the
 * chart should carry a "colors are approximate" caveat, since screens and dye
 * lots never match exactly.
 */
export const threadColor = defineType({
  name: 'threadColor',
  title: 'Thread Color',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The thread name as Mary Ann refers to it, for example "Navy".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hex',
      title: 'Hex color',
      type: 'string',
      description:
        'Approximate on-screen color, for example #01457e. Used to draw the swatch when no swatch image is provided.',
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{6})$/, {name: 'hex'}).warning('Use a 6-digit hex value such as #01457e.'),
    }),
    defineField({
      name: 'swatchImage',
      title: 'Swatch image',
      type: 'image',
      description: 'Optional. A photo of the real thread, more accurate than the hex value.',
    }),
    defineField({
      name: 'family',
      title: 'Color family',
      type: 'string',
      description: 'Used to group the chart into sections.',
      options: {
        list: [
          {title: 'Neutrals', value: 'neutrals'},
          {title: 'Blues', value: 'blues'},
          {title: 'Greens', value: 'greens'},
          {title: 'Reds & Pinks', value: 'redsPinks'},
          {title: 'Yellows & Golds', value: 'yellowsGolds'},
          {title: 'Purples', value: 'purples'},
          {title: 'Oranges & Browns', value: 'orangesBrowns'},
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Family, then display order',
      name: 'familyOrder',
      by: [
        {field: 'family', direction: 'asc'},
        {field: 'order', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'name', subtitle: 'family', media: 'swatchImage'},
  },
})
