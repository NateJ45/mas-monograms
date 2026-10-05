// Request a Quote page singleton. The words on the /request-a-quote page,
// including the questions on the form, their hints and the Send button.
//
// 2026-10-05, Mary Ann's Studio pass (Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md):
//   - Nine tabs became four plus Google, in the order the form reads: the top of
//     the page, the questions about the order, the questions about the
//     customer, then photos, notes and the Send button.
//   - NOTHING here is required except the headline. Every question label has a
//     built-in fallback in src/pages/request-a-quote.astro (the `L` table), so
//     an empty box never breaks the form. Seven of them were required AND empty
//     in the live data, which put a red mark on her form for nothing. Each
//     description now says what shows when the box is left empty, copied from
//     that `L` table, so the words stay honest. Change one, change the other.
//   - HIDDEN (data kept): the boxes the redesigned form never reads. The form
//     reads personalization*, threadColor*, attachments* and notes* names that
//     this schema does not declare (they always use their built-in words), and
//     no longer reads emailHelp, phoneHelp, itemTypeOtherLabel,
//     monogramDetails*, placement* (the typed-in one), fontPreferenceGuideLink /
//     OtherLabel, colorPreference*, fileUpload*, specialInstructions* or
//     errorMessage. See docs/PENDING.md for the follow-up that would give the
//     new names boxes of their own.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons';
import {
  SEO_FIELDSET,
  SEO_GROUP,
  SEO_TITLE,
  SEO_TITLE_TOO_LONG,
  SEO_DESCRIPTION,
  SEO_DESCRIPTION_TOO_LONG,
  SEO_IMAGE,
  PHOTO_WORDS,
  HERO_EYEBROW,
  HERO_HEADLINE,
  HEADLINE_NEEDED,
  HERO_SUBHEAD,
  TOO_LONG,
} from './_copy';
import { SEO_PREVIEW } from './_seoPreview';

/** "Leave it empty to use ..." for a box with a built-in fallback. */
const orDefault = (words: string) => `Leave it empty to use "${words}".`;
const HINT = 'Small help line under this question. Leave it empty to show none.';

export const requestAQuotePage = defineType({
  name: 'requestAQuotePage',
  title: 'Request a Quote page',
  type: 'document',
  icon: EnvelopeIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'hero', title: 'Top of the page' },
    { name: 'order', title: 'Questions about the order' },
    { name: 'contact', title: 'Questions about them' },
    { name: 'submit', title: 'Photos, notes and the Send button' },
    SEO_GROUP,
  ],
  fieldsets: [SEO_FIELDSET],
  fields: [
    // ── Top of the page ──────────────────────────────────────────────────────
    defineField({
      name: 'heroEyebrow',
      ...HERO_EYEBROW,
      type: 'string',
      group: 'hero',
      validation: (R) => R.max(80).warning(TOO_LONG),
    }),
    defineField({
      name: 'heroHeadline',
      ...HERO_HEADLINE,
      type: 'string',
      group: 'hero',
      validation: (R) => [R.required().error(HEADLINE_NEEDED), R.max(100).warning(TOO_LONG)],
    }),
    defineField({
      name: 'heroSubhead',
      ...HERO_SUBHEAD,
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'heroBody',
      title: 'A few more words under that',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      group: 'hero',
      description: 'A warmer welcome or extra reassurance. Leave it empty to hide it.',
    }),
    defineField({
      name: 'heroTrustItems',
      title: 'Short promises with a tick',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'hero',
      description:
        'Shown beside the top of the page with a tick mark, for example "Free quotes". Drag to change the order.',
    }),
    defineField({
      name: 'turnaroundCallout',
      title: 'Reply-time promise',
      type: 'string',
      group: 'hero',
      description:
        'Shown in bold near the top of the form and again by the Send button, for example "I reply to every request within 1 business day."',
    }),
    defineField({
      name: 'requiredFieldNote',
      title: 'Note about the starred questions',
      type: 'string',
      group: 'hero',
      description: orDefault('Fields marked * are required.'),
      initialValue: 'Fields marked * are required.',
    }),

    // ── Questions about the order ────────────────────────────────────────────
    defineField({
      name: 'orderInfoHeading',
      title: 'Heading for this part of the form',
      type: 'string',
      group: 'order',
      description: orDefault('About Your Order'),
      initialValue: 'About Your Order',
    }),
    defineField({
      name: 'itemTypeLabel',
      title: 'Question: what item?',
      type: 'string',
      group: 'order',
      description: orDefault('What type of item?'),
      initialValue: 'What would you like embroidered?',
    }),
    defineField({
      name: 'itemTypeHelp',
      title: 'Hint: what item?',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'ownershipLabel',
      title: 'Question: do they have the item?',
      type: 'string',
      group: 'order',
      description: orDefault('Do you own the item?'),
      initialValue: 'Do you own the item?',
    }),
    defineField({
      name: 'ownershipHelp',
      title: 'Hint: do they have the item?',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'itemDescriptionLabel',
      title: 'Question: describe the item',
      type: 'string',
      group: 'order',
      description: orDefault('Item description'),
      initialValue: 'Item description (optional)',
    }),
    defineField({
      name: 'itemDescriptionPlaceholder',
      title: 'Faint example inside that box',
      type: 'string',
      group: 'order',
      description: orDefault('Brand, color, fabric, size…'),
      initialValue: 'Brand, color, fabric, size…',
    }),
    defineField({
      name: 'itemDescriptionHelp',
      title: 'Hint: describe the item',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'monogramStyleLabel',
      title: 'Question: monogram style',
      type: 'string',
      group: 'order',
      description: orDefault('Monogram style'),
      initialValue: 'Monogram style',
    }),
    defineField({
      name: 'monogramStyleHelp',
      title: 'Hint: monogram style',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'placementSelectLabel',
      title: 'Question: where on the item?',
      type: 'string',
      group: 'order',
      description: orDefault('Placement on item'),
      initialValue: 'Placement on item',
    }),
    defineField({
      name: 'placementSelectHelp',
      title: 'Hint: where on the item?',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'sizeLabel',
      title: 'Question: how big?',
      type: 'string',
      group: 'order',
      description: orDefault('Approximate size'),
      initialValue: 'Approximate size',
    }),
    defineField({
      name: 'sizeHelp',
      title: 'Hint: how big?',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'threadCountLabel',
      title: 'Question: how many thread colors?',
      type: 'string',
      group: 'order',
      description: orDefault('Number of thread colors'),
      initialValue: 'Number of thread colors',
    }),
    defineField({
      name: 'threadCountHelp',
      title: 'Hint: how many thread colors?',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'quantityLabel',
      title: 'Question: how many pieces?',
      type: 'string',
      group: 'order',
      description: orDefault('Quantity'),
      initialValue: 'Quantity',
    }),
    defineField({
      name: 'quantityPlaceholder',
      title: 'Faint example inside that box',
      type: 'string',
      group: 'order',
      description: orDefault('e.g. 2'),
      initialValue: 'e.g. 1',
    }),
    defineField({
      name: 'quantityHelp',
      title: 'Hint: how many pieces?',
      type: 'string',
      group: 'order',
      description: HINT,
    }),
    defineField({
      name: 'fontPreferenceLabel',
      title: 'Question: which font?',
      type: 'string',
      group: 'order',
      description: orDefault('Font Preference (Optional)'),
      initialValue: 'Font preference (optional)',
    }),
    defineField({
      name: 'fontPreferenceHelp',
      title: 'Hint: which font?',
      type: 'string',
      group: 'order',
      description: orDefault('Not sure? Browse the Font Guide.'),
    }),
    defineField({
      name: 'neededByLabel',
      title: 'Question: needed by what date?',
      type: 'string',
      group: 'order',
      description: orDefault('Date Needed By (Optional)'),
      initialValue: 'Needed by',
    }),
    defineField({
      name: 'neededByHelp',
      title: 'Hint: needed by what date?',
      type: 'string',
      group: 'order',
      description: orDefault('Rush orders may incur additional charges.'),
    }),
    defineField({
      name: 'rushLabel',
      title: 'Tick box: they need it by a certain date',
      type: 'string',
      group: 'order',
      description: orDefault('I need this rushed (a rush fee may apply)'),
      initialValue: 'I need this rushed (a rush fee may apply)',
    }),
    defineField({
      name: 'rushHelp',
      title: 'Hint under that tick box',
      type: 'string',
      group: 'order',
      description: HINT,
    }),

    // ── Questions about them ─────────────────────────────────────────────────
    defineField({
      name: 'personalInfoHeading',
      title: 'Heading for this part of the form',
      type: 'string',
      group: 'contact',
      description: orDefault('Your Information'),
      initialValue: 'Your Information',
    }),
    defineField({
      name: 'nameLabel',
      title: 'Question: their name',
      type: 'string',
      group: 'contact',
      description: orDefault('Your Name'),
      initialValue: 'Your name',
    }),
    defineField({
      name: 'namePlaceholder',
      title: 'Faint example inside that box',
      type: 'string',
      group: 'contact',
      description: orDefault('First and last name'),
      initialValue: 'Jane Smith',
    }),
    defineField({
      name: 'emailLabel',
      title: 'Question: their email',
      type: 'string',
      group: 'contact',
      description: orDefault('Email Address'),
      initialValue: 'Email address',
    }),
    defineField({
      name: 'emailPlaceholder',
      title: 'Faint example inside that box',
      type: 'string',
      group: 'contact',
      description: orDefault('you@example.com'),
      initialValue: 'you@example.com',
    }),
    defineField({
      name: 'phoneLabel',
      title: 'Question: their phone number',
      type: 'string',
      group: 'contact',
      description: orDefault('Phone Number (Optional)'),
      initialValue: 'Phone number',
    }),
    defineField({
      name: 'phonePlaceholder',
      title: 'Faint example inside that box',
      type: 'string',
      group: 'contact',
      description: orDefault('(843) 555-0100'),
      initialValue: '(803) 555-1234',
    }),
    defineField({
      name: 'referralLabel',
      title: 'Question: how did they hear about you?',
      type: 'string',
      group: 'contact',
      description: orDefault('How did you hear about us?'),
      initialValue: 'How did you hear about MAS Monograms? (optional)',
    }),
    defineField({
      name: 'referralOptions',
      title: 'Answers they can pick from',
      type: 'array',
      group: 'contact',
      description:
        'The choices in the "how did you hear about me" list. Add, remove or drag to change the order.',
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
    }),

    // ── Photos, notes and the Send button ────────────────────────────────────
    defineField({
      name: 'attachmentsHeading',
      title: 'Heading above the photo upload',
      type: 'string',
      group: 'submit',
      description: orDefault('Photos (Optional)'),
      initialValue: 'Photos (Optional)',
    }),
    defineField({
      name: 'additionalHeading',
      title: 'Heading above the last notes box',
      type: 'string',
      group: 'submit',
      description: orDefault('Anything Else?'),
      initialValue: 'Anything Else?',
    }),
    defineField({
      name: 'submitLabel',
      title: 'Words on the Send button',
      type: 'string',
      group: 'submit',
      description: orDefault('Send My Quote Request'),
      initialValue: 'Send my quote request',
      validation: (R) => R.max(50).warning(TOO_LONG),
    }),
    defineField({
      name: 'privacyNote',
      title: 'Small privacy note under the Send button',
      type: 'string',
      group: 'submit',
      description:
        'For example "Your information is never sold or shared." Leave it empty to hide it.',
      initialValue: 'Your information is kept private and never shared.',
    }),
    // No-JavaScript note (2026-10-04): the form needs JavaScript to send (the
    // bot check runs in the browser), so visitors with it switched off see this
    // at the top of the form, followed by the email and phone from Site Settings.
    defineField({
      name: 'noScriptMessage',
      title: 'Note for the rare browser that cannot send the form',
      type: 'text',
      rows: 3,
      group: 'submit',
      description:
        'Only shown to the few visitors whose browser has the form switched off. Your email and phone number from My business details appear right under it.',
      initialValue:
        'The quote form needs JavaScript to send. Turn it on, or email me your idea and photos and I will reply.',
    }),

    // ── Google and sharing ───────────────────────────────────────────────────
    // Phase D: the live Google and shared-link preview (writes nothing).
    defineField({
      name: 'seoPreview',
      ...SEO_PREVIEW,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
    }),
    defineField({
      name: 'seoTitle',
      ...SEO_TITLE,
      type: 'string',
      group: 'seo',
      fieldset: 'seo',
      validation: (R) => R.max(60).warning(SEO_TITLE_TOO_LONG),
    }),
    defineField({
      name: 'seoDescription',
      ...SEO_DESCRIPTION,
      type: 'text',
      rows: 3,
      group: 'seo',
      fieldset: 'seo',
      validation: (R) => R.max(160).warning(SEO_DESCRIPTION_TOO_LONG),
    }),
    defineField({
      name: 'seoImage',
      ...SEO_IMAGE,
      type: 'image',
      group: 'seo',
      fieldset: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', ...PHOTO_WORDS, type: 'string' })],
    }),

    // ── Hidden: the redesigned form no longer reads these (data kept) ────────
    defineField({
      name: 'emailHelp',
      title: 'Old email hint (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'phoneHelp',
      title: 'Old phone hint (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'itemTypeOtherLabel',
      title: 'Old "something else" choice (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'monogramDetailsLabel',
      title: 'Old letters question (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'monogramDetailsPlaceholder',
      title: 'Old letters example (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'monogramDetailsHelp',
      title: 'Old letters hint (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'placementLabel',
      title: 'Old typed placement question (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'placementPlaceholder',
      title: 'Old typed placement example (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'placementHelp',
      title: 'Old typed placement hint (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'fontPreferenceGuideLinkLabel',
      title: 'Old font guide link (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'fontPreferenceOtherLabel',
      title: 'Old font "other" choice (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'colorPreferenceLabel',
      title: 'Old thread color question (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'colorPreferencePlaceholder',
      title: 'Old thread color example (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'colorPreferenceHelp',
      title: 'Old thread color hint (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'colorPreferenceChartLinkLabel',
      title: 'Old thread chart link (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'fileUploadLabel',
      title: 'Old photo upload question (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'fileUploadHelp',
      title: 'Old photo upload hint (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'fileUploadAcceptedTypes',
      title: 'Old photo types note (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'specialInstructionsLabel',
      title: 'Old notes question (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'specialInstructionsPlaceholder',
      title: 'Old notes example (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'specialInstructionsHelp',
      title: 'Old notes hint (not used)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'errorMessage',
      title: 'Old sending problem message (not used)',
      type: 'string',
      hidden: true,
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Request a Quote page',
      subtitle: 'The page at /request-a-quote: the quote form',
    }),
  },
});
