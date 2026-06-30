import {defineField, defineType} from 'sanity'

/**
 * galleryImage (object)
 * =============================================================================
 * One image inside a category page's gallery grid. Used as an array member on
 * itemCategory.gallery.
 *
 * Why an object and not a document: these images only ever live inside one
 * category and are not reused elsewhere, so there is no reason to manage them
 * as standalone records. The separate, filterable Style Gallery page uses the
 * `galleryItem` DOCUMENT type instead (see docs/06).
 */
export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      // hotspot lets the editor pick the focal point so automatic crops stay sensible.
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        // Alt text lives ON the image so it travels with it wherever the image is used.
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description:
            'Describe the image for screen readers and search engines, for example: "Navy monogram on a white waffle towel."',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional short caption shown beneath the image.',
    }),
    defineField({
      name: 'priceIndicator',
      title: 'Price indicator',
      type: 'string',
      description: 'Optional visual hint such as "from $16". This is a label only, not a real price.',
    }),
  ],
  preview: {
    select: {title: 'caption', subtitle: 'priceIndicator', media: 'image'},
    prepare({title, subtitle, media}) {
      return {title: title || 'Gallery image', subtitle, media}
    },
  },
})
