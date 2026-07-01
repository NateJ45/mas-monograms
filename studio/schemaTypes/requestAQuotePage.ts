// Request a Quote page singleton. This schema stores EVERY piece of text
// on the /request-a-quote page — including all form field labels, placeholders,
// help text, validation messages, and dropdown options.
//
// Nothing in the form is hardcoded. Mary Ann can rename fields, rewrite
// help text, add new referral source options, or update the submit CTA
// without touching any code.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';

export const requestAQuotePage = defineType({
  name: 'requestAQuotePage',
  title: 'Request a Quote Page',
  type: 'document',
  icon: EnvelopeIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo',       title: 'SEO' },
    { name: 'hero',      title: 'Hero & intro', default: true },
    { name: 'contact',   title: 'Contact fields' },
    { name: 'order',     title: 'Order fields' },
    { name: 'design',    title: 'Design & font fields' },
    { name: 'files',     title: 'File upload' },
    { name: 'logistics', title: 'Rush & special instructions' },
    { name: 'referral',  title: 'Referral source' },
    { name: 'submit',    title: 'Submit & confirmation' },
  ],
  fields: [
    // ── SEO ──────────────────────────────────────────────────────────────────
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo',
      validation: (R) => R.max(60).warning('Over 60 chars may be cut off.') }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo',
      validation: (R) => R.max(160).warning('Over 160 chars may be cut off.') }),
    defineField({ name: 'seoImage', title: 'Social share image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })] }),

    // ── Hero ─────────────────────────────────────────────────────────────────
    defineField({ name: 'heroEyebrow', title: 'Eyebrow', type: 'string', group: 'hero',
      validation: (R) => R.required().max(80) }),
    defineField({ name: 'heroHeadline', title: 'Headline', type: 'string', group: 'hero',
      validation: (R) => R.required().max(100) }),
    defineField({ name: 'heroSubhead', title: 'Subhead (optional)', type: 'text', rows: 2, group: 'hero' }),
    defineField({
      name: 'heroBody',
      title: 'Hero body (optional)',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      group: 'hero',
      description: 'Rich-text paragraph(s) shown under the hero subhead. Use for a warmer intro or extra reassurance.',
    }),
    defineField({
      name: 'heroTrustItems',
      title: 'Hero trust items (optional)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'hero',
      description: 'Short reassurance bullets shown beside the hero with a checkmark. E.g. "Free quotes", "1–2 day reply", "Local, hand-finished work".',
    }),
    defineField({ name: 'heroImage', title: 'Hero image (optional)', type: 'image', group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() })] }),

    defineField({
      name: 'formIntroHeadline',
      title: 'Form section headline',
      type: 'string',
      group: 'hero',
      description: 'Heading directly above the form. E.g. "Tell me about your order".',
      validation: (R) => R.required().max(80),
    }),
    defineField({
      name: 'formIntroBody',
      title: 'Form intro paragraph',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'Short paragraph above the form. Set expectations about turnaround, minimums, etc.',
    }),
    defineField({
      name: 'turnaroundCallout',
      title: 'Turnaround callout (optional)',
      type: 'string',
      group: 'hero',
      description: 'Bold note near the top of the form. E.g. "Standard turnaround: 7–10 business days."',
    }),

    // ── Contact fields ────────────────────────────────────────────────────────
    defineField({ name: 'nameLabel', title: 'Name field label', type: 'string', group: 'contact',
      initialValue: 'Your name', validation: (R) => R.required() }),
    defineField({ name: 'namePlaceholder', title: 'Name field placeholder', type: 'string', group: 'contact',
      initialValue: 'Jane Smith' }),

    defineField({ name: 'emailLabel', title: 'Email field label', type: 'string', group: 'contact',
      initialValue: 'Email address', validation: (R) => R.required() }),
    defineField({ name: 'emailPlaceholder', title: 'Email field placeholder', type: 'string', group: 'contact',
      initialValue: 'you@example.com' }),
    defineField({ name: 'emailHelp', title: 'Email help text', type: 'string', group: 'contact',
      description: 'Small text below the email field.',
      initialValue: "I'll send your quote to this address." }),

    defineField({ name: 'phoneLabel', title: 'Phone field label', type: 'string', group: 'contact',
      initialValue: 'Phone number (optional)', validation: (R) => R.required() }),
    defineField({ name: 'phonePlaceholder', title: 'Phone field placeholder', type: 'string', group: 'contact',
      initialValue: '(803) 555-1234' }),
    defineField({ name: 'phoneHelp', title: 'Phone help text', type: 'string', group: 'contact',
      description: 'Small text below the phone field.',
      initialValue: 'Optional. Only used if I have a quick follow-up question.' }),

    // ── Order fields ──────────────────────────────────────────────────────────
    defineField({ name: 'itemTypeLabel', title: 'Item type field label', type: 'string', group: 'order',
      description: 'The question asking what kind of item they want embroidered.',
      initialValue: 'What would you like embroidered?', validation: (R) => R.required() }),
    defineField({ name: 'itemTypeHelp', title: 'Item type help text', type: 'string', group: 'order',
      initialValue: 'Select the closest match. You can add details in the notes below.' }),
    defineField({ name: 'itemTypeOtherLabel', title: '"Other" option label', type: 'string', group: 'order',
      description: 'Label for the "Other / not listed" option in the item type dropdown.',
      initialValue: 'Other / not listed', validation: (R) => R.required() }),

    defineField({ name: 'quantityLabel', title: 'Quantity field label', type: 'string', group: 'order',
      initialValue: 'Quantity', validation: (R) => R.required() }),
    defineField({ name: 'quantityPlaceholder', title: 'Quantity field placeholder', type: 'string', group: 'order',
      initialValue: 'e.g. 24' }),
    defineField({ name: 'quantityHelp', title: 'Quantity help text', type: 'string', group: 'order',
      description: 'Note about minimums or pricing structure.',
      initialValue: 'Minimum order is 12 pieces. Pricing drops with larger quantities.' }),

    defineField({ name: 'monogramDetailsLabel', title: 'Monogram / text details field label', type: 'string', group: 'order',
      initialValue: 'Monogram or text details', validation: (R) => R.required() }),
    defineField({ name: 'monogramDetailsPlaceholder', title: 'Monogram / text details placeholder', type: 'string', group: 'order',
      initialValue: 'e.g. Three-letter monogram: FJL (last name center)' }),
    defineField({ name: 'monogramDetailsHelp', title: 'Monogram / text details help text', type: 'string', group: 'order',
      initialValue: 'Include the letters or text, and the format if you know it (single initial, three-letter monogram, full name, custom phrase, etc.).' }),

    defineField({ name: 'placementLabel', title: 'Placement / position field label', type: 'string', group: 'order',
      initialValue: 'Embroidery placement', validation: (R) => R.required() }),
    defineField({ name: 'placementPlaceholder', title: 'Placement field placeholder', type: 'string', group: 'order',
      initialValue: 'e.g. Left chest pocket, center chest, hat brim' }),
    defineField({ name: 'placementHelp', title: 'Placement help text', type: 'string', group: 'order',
      initialValue: 'Where on the item would you like the embroidery placed? Common options: left chest, center chest, right sleeve, hat front.' }),

    // ── Design & font fields ──────────────────────────────────────────────────
    defineField({ name: 'fontPreferenceLabel', title: 'Font preference field label', type: 'string', group: 'design',
      initialValue: 'Font preference (optional)', validation: (R) => R.required() }),
    defineField({ name: 'fontPreferenceHelp', title: 'Font preference help text', type: 'string', group: 'design',
      initialValue: 'Browse the Font & Lettering Guide page for examples. Not sure? Leave blank and I\'ll suggest options.' }),
    defineField({ name: 'fontPreferenceGuideLinkLabel', title: 'Font guide link label', type: 'string', group: 'design',
      description: 'Clickable label linking to the font guide page.',
      initialValue: 'Browse the font guide' }),

    defineField({ name: 'colorPreferenceLabel', title: 'Thread color preference field label', type: 'string', group: 'design',
      initialValue: 'Thread color preference (optional)', validation: (R) => R.required() }),
    defineField({ name: 'colorPreferencePlaceholder', title: 'Thread color preference placeholder', type: 'string', group: 'design',
      initialValue: 'e.g. Navy blue, or see thread chart for color #305' }),
    defineField({ name: 'colorPreferenceHelp', title: 'Thread color preference help text', type: 'string', group: 'design',
      initialValue: 'Browse the Thread Color Chart for specific colors. You can also describe the color and I\'ll match as closely as possible.' }),
    defineField({ name: 'colorPreferenceChartLinkLabel', title: 'Thread chart link label', type: 'string', group: 'design',
      description: 'Clickable label linking to the thread color chart page.',
      initialValue: 'Browse the thread color chart' }),

    // ── File upload ───────────────────────────────────────────────────────────
    defineField({ name: 'fileUploadLabel', title: 'File upload field label', type: 'string', group: 'files',
      initialValue: 'Reference photos (optional)', validation: (R) => R.required() }),
    defineField({ name: 'fileUploadHelp', title: 'File upload help text', type: 'string', group: 'files',
      initialValue: 'Upload photos of the item(s) or inspiration images. Accepted formats: JPG, PNG, PDF. Max 10 MB per file, 5 files total.' }),
    defineField({ name: 'fileUploadAcceptedTypes', title: 'Accepted file types note', type: 'string', group: 'files',
      description: 'Short note about accepted formats shown below the upload button.',
      initialValue: 'JPG, PNG, PDF · 10 MB max per file · 5 files max' }),

    // ── Rush & special instructions ───────────────────────────────────────────
    defineField({ name: 'rushLabel', title: 'Rush order checkbox label', type: 'string', group: 'logistics',
      initialValue: 'I need a rush order', validation: (R) => R.required() }),
    defineField({ name: 'rushHelp', title: 'Rush order help text', type: 'string', group: 'logistics',
      description: 'Explanation of the rush option.',
      initialValue: 'Rush orders are available for an additional fee. I\'ll confirm the timeline and cost in my quote.' }),
    defineField({ name: 'neededByLabel', title: '"Needed by" date field label', type: 'string', group: 'logistics',
      description: 'Shown when rush is checked.',
      initialValue: 'Needed by', validation: (R) => R.required() }),
    defineField({ name: 'neededByHelp', title: '"Needed by" date help text', type: 'string', group: 'logistics',
      initialValue: "I'll do my best to meet your deadline. Earlier notice = better chance of availability." }),

    defineField({ name: 'specialInstructionsLabel', title: 'Special instructions field label', type: 'string', group: 'logistics',
      initialValue: 'Special instructions or questions', validation: (R) => R.required() }),
    defineField({ name: 'specialInstructionsPlaceholder', title: 'Special instructions placeholder', type: 'string', group: 'logistics',
      initialValue: 'Any other details, questions, or notes for Mary Ann…' }),
    defineField({ name: 'specialInstructionsHelp', title: 'Special instructions help text (optional)', type: 'string', group: 'logistics' }),

    // ── Referral source ───────────────────────────────────────────────────────
    defineField({ name: 'referralLabel', title: 'Referral source field label', type: 'string', group: 'referral',
      initialValue: 'How did you hear about MAS Monograms? (optional)', validation: (R) => R.required() }),
    defineField({
      name: 'referralOptions',
      title: 'Referral source options',
      type: 'array',
      group: 'referral',
      description: 'Dropdown options for how the customer found Mary Ann. Add or remove options here.',
      of: [defineArrayMember({ type: 'string' })],
      initialValue: [
        'Facebook',
        'Instagram',
        'Google search',
        'Word of mouth / referral',
        'Returning customer',
        'Local event or market',
        'Other',
      ],
      validation: (R) => R.required().min(2),
    }),

    // ── Submit & confirmation ─────────────────────────────────────────────────
    defineField({ name: 'submitLabel', title: 'Submit button label', type: 'string', group: 'submit',
      initialValue: 'Send my quote request', validation: (R) => R.required().max(50) }),
    defineField({ name: 'privacyNote', title: 'Privacy / spam note', type: 'string', group: 'submit',
      description: 'Small text below the submit button. E.g. "Your information is never sold or shared."',
      initialValue: 'Your information is kept private and never shared.' }),
    defineField({ name: 'errorMessage', title: 'General error message', type: 'string', group: 'submit',
      description: 'Shown if the form fails to submit.',
      initialValue: "Something went wrong submitting your request. Please email me directly at the address below.",
      validation: (R) => R.required() }),

    // Required field note
    defineField({ name: 'requiredFieldNote', title: 'Required field note', type: 'string', group: 'hero',
      description: 'Small note near the top of the form indicating required fields.',
      initialValue: 'Fields marked * are required.' }),
  ],
  preview: { prepare: () => ({ title: 'Request a Quote Page' }) },
});
