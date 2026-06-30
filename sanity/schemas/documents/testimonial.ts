import {defineField, defineType} from 'sanity'

/**
 * testimonial (document)
 * =============================================================================
 * A customer review. Two placement controls decide where it shows:
 *   - `featured` true    makes it eligible for the homepage reviews strip.
 *   - `relatedCategory`  optionally pins it to one shop page so the review shows
 *                        in context (for example a towel review on /towels-linens).
 * A testimonial can be both featured and tied to a category at the same time.
 *
 * Launch note: the Squarespace build shipped with "[Customer Name]" placeholder
 * reviews. Replace those with real ones before going live (see the pending
 * items in the README).
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorLocation',
      title: 'Author location',
      type: 'string',
      description: 'Optional, for example "Columbia, SC".',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Stars out of 5.',
      initialValue: 5,
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'featured',
      title: 'Feature on homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'relatedCategory',
      title: 'Related category',
      type: 'reference',
      description: 'Optional. Pin this review to one shop page.',
      to: [{type: 'itemCategory'}],
    }),
  ],
  preview: {
    select: {title: 'authorName', quote: 'quote'},
    prepare({title, quote}) {
      const snippet = quote ? `"${quote.slice(0, 60)}${quote.length > 60 ? '...' : ''}"` : ''
      return {title: title || 'Testimonial', subtitle: snippet}
    },
  },
})
