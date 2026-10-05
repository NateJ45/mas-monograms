// Monogram Atelier settings singleton. Every word the live embroidery preview
// shows (section copy, control labels, style and fabric names, sample initials,
// the "this is a preview" line) comes from here, so Mary Ann can edit it all.
// Rendering logic (which font backs which style) lives in code, never the copy.
//
// 2026-10-05, Mary Ann's Studio pass: seven tabs became five, plain titles.
// UNLIKE the page singletons, the control labels here stay required: the
// preview has no built-in words for them (AtelierStudio.astro), so an empty one
// would leave a choice on the website with no name, which is worse than a red
// note she can fix by typing. Every one is filled in today.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { SparklesIcon } from '@sanity/icons';
import { TOO_LONG } from './_copy';

/** Friendly "please fill this in" for the labels the preview cannot do without. */
const NEEDED =
  'Please fill this in. The monogram preview shows these words and has nothing to use instead.';

export const atelierSettings = defineType({
  name: 'atelierSettings',
  title: 'Monogram preview',
  type: 'document',
  icon: SparklesIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'section', title: 'Words above the preview' },
    { name: 'controls', title: 'Labels on the choices' },
    { name: 'styles', title: 'Styles and fabrics' },
    { name: 'buttons', title: 'Buttons and notice' },
    { name: 'hero', title: 'Top of the home page' },
  ],
  fields: [
    // ── Words above the preview ──────────────────────────────────────────────
    defineField({
      name: 'eyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'section',
      description:
        'The monogram preview is the section on your home page where visitors type their initials and watch them stitched. For example "The monogram studio".',
      validation: (R) => R.max(60).warning(TOO_LONG),
    }),
    defineField({
      name: 'headline',
      title: 'Heading',
      type: 'string',
      group: 'section',
      description: 'The big heading above the live preview.',
      validation: (R) => R.max(100).warning(TOO_LONG),
    }),
    defineField({
      name: 'subhead',
      title: 'Line under the heading',
      type: 'text',
      rows: 2,
      group: 'section',
      validation: (R) => R.max(240).warning(TOO_LONG),
    }),

    // ── Labels on the choices ────────────────────────────────────────────────
    defineField({
      name: 'initialsLabel',
      title: 'Label on the initials box',
      type: 'string',
      group: 'controls',
      validation: (R) => [R.required().error(NEEDED), R.max(40).warning(TOO_LONG)],
    }),
    defineField({
      name: 'initialsHint',
      title: 'Hint under the initials box',
      type: 'string',
      group: 'controls',
      description: 'For example "One to three letters".',
      validation: (R) => [R.required().error(NEEDED), R.max(100).warning(TOO_LONG)],
    }),
    defineField({
      name: 'styleLabel',
      title: 'Label on the style choice',
      type: 'string',
      group: 'controls',
      validation: (R) => [R.required().error(NEEDED), R.max(40).warning(TOO_LONG)],
    }),
    defineField({
      name: 'threadLabel',
      title: 'Label on the thread color choice',
      type: 'string',
      group: 'controls',
      validation: (R) => [R.required().error(NEEDED), R.max(40).warning(TOO_LONG)],
    }),
    defineField({
      name: 'fabricLabel',
      title: 'Label on the fabric choice',
      type: 'string',
      group: 'controls',
      validation: (R) => [R.required().error(NEEDED), R.max(40).warning(TOO_LONG)],
    }),

    // ── Styles and fabrics ───────────────────────────────────────────────────
    defineField({
      name: 'styles',
      title: 'Monogram styles',
      type: 'array',
      group: 'styles',
      description:
        'The five lettering looks the preview can show. You can rename them and change the one-line description. Please leave "Which lettering" as it is, because the website uses it to draw the letters.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'atelierStyle',
          fields: [
            defineField({
              name: 'key',
              title: 'Which lettering (please do not change)',
              type: 'string',
              description: 'Tells the website which lettering to draw.',
              options: {
                list: [
                  { title: 'Classic (big middle letter)', value: 'classic' },
                  { title: 'Script', value: 'script' },
                  { title: 'Block', value: 'block' },
                  { title: 'Circle', value: 'circle' },
                  { title: 'Single letter', value: 'single' },
                ],
                layout: 'dropdown',
              },
              validation: (R) => R.required().error('Please pick which lettering this is.'),
            }),
            defineField({
              name: 'label',
              title: 'Name customers see',
              type: 'string',
              validation: (R) => [
                R.required().error('Please give this style a name.'),
                R.max(40).warning(TOO_LONG),
              ],
            }),
            defineField({
              name: 'blurb',
              title: 'One-line description',
              type: 'string',
              validation: (R) => R.max(120).warning(TOO_LONG),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'blurb' } },
        }),
      ],
      validation: (R) =>
        R.min(1)
          .max(5)
          .custom((items: any[] | undefined) => {
            const keys = (items ?? []).map((i) => i?.key).filter(Boolean);
            return new Set(keys).size === keys.length
              ? true
              : 'Each lettering can only be used once. Please remove the copy.';
          }),
    }),
    defineField({
      name: 'fabrics',
      title: 'Fabrics',
      type: 'array',
      group: 'styles',
      description:
        'The cloth colors visitors can try their monogram on. The color only paints the preview picture. Drag to change the order.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'atelierFabric',
          fields: [
            defineField({
              name: 'key',
              title: 'Short name for the website (please do not change later)',
              type: 'string',
              description: 'Small letters and dashes only, for example "navy-canvas".',
              validation: (R) =>
                R.required()
                  .regex(/^[a-z0-9-]+$/, { name: 'id', invert: false })
                  .error('Please use small letters, numbers and dashes only, like "navy-canvas".'),
            }),
            defineField({
              name: 'label',
              title: 'Fabric name',
              type: 'string',
              validation: (R) => [
                R.required().error('Please give this fabric a name.'),
                R.max(40).warning(TOO_LONG),
              ],
            }),
            defineField({
              name: 'color',
              title: 'Fabric color code',
              type: 'string',
              description:
                'A color code starting with #, for example "#e8dcc8". Used to paint the cloth in the preview.',
              validation: (R) =>
                R.required()
                  .regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex', invert: false })
                  .error('Please type a color code like #e8dcc8 (a # and six letters or numbers).'),
            }),
            defineField({
              name: 'note',
              title: 'Short note',
              type: 'string',
              validation: (R) => R.max(120).warning(TOO_LONG),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'color' } },
        }),
      ],
      validation: (R) => R.min(2).max(12).warning('The preview works best with 2 to 12 fabrics.'),
    }),

    // ── Buttons and notice ───────────────────────────────────────────────────
    defineField({
      name: 'replayLabel',
      title: 'Words on the replay button',
      type: 'string',
      group: 'buttons',
      validation: (R) => [R.required().error(NEEDED), R.max(30).warning(TOO_LONG)],
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Words on the request button',
      type: 'string',
      group: 'buttons',
      description: 'The button that sends their design to the quote form.',
      validation: (R) => [R.required().error(NEEDED), R.max(40).warning(TOO_LONG)],
    }),
    defineField({
      name: 'disclaimer',
      title: 'Note that this is only a preview',
      type: 'text',
      rows: 3,
      group: 'buttons',
      description:
        'Shown near the preview so nobody mistakes it for a final proof. Keep the idea that you confirm the lettering and colors before stitching.',
      validation: (R) => R.max(300).warning(TOO_LONG),
    }),
    defineField({
      name: 'pauseLabel',
      title: 'Pause button, read aloud',
      type: 'string',
      group: 'buttons',
      description:
        'Anything that moves on its own (the stitching on the home page, the moving ribbon of item names) has a small pause button. Screen readers say these words, for example "Pause".',
      validation: (R) => R.max(30).warning(TOO_LONG),
    }),
    defineField({
      name: 'playLabel',
      title: 'Play button, read aloud',
      type: 'string',
      group: 'buttons',
      description: 'The same button once it has been paused, for example "Play".',
      validation: (R) => R.max(30).warning(TOO_LONG),
    }),

    // ── Top of the home page ─────────────────────────────────────────────────
    defineField({
      name: 'sampleMonograms',
      title: 'Sample initials that stitch themselves',
      type: 'array',
      group: 'hero',
      description:
        'Initials the top of your home page stitches one after another. Please use made-up initials only, never a real customer.',
      of: [
        defineArrayMember({
          type: 'string',
          validation: (R) =>
            R.required()
              .min(1)
              .max(3)
              .regex(/^[A-Za-z]+$/, { name: 'letters', invert: false })
              .error('Please use one to three letters, with no spaces.'),
        }),
      ],
      validation: (R) => R.min(3).max(16).warning('The animation works best with 3 to 16 sets.'),
    }),
    defineField({
      name: 'heroTryLabel',
      title: 'Label on the small try-it box',
      type: 'string',
      group: 'hero',
      description:
        'The small box at the top of your home page where visitors type their own initials.',
      validation: (R) => [R.required().error(NEEDED), R.max(60).warning(TOO_LONG)],
    }),
    defineField({
      name: 'heroPlaceholder',
      title: 'Faint example inside the try-it box',
      type: 'string',
      group: 'hero',
      description: 'For example "MAS".',
      validation: (R) => R.max(20).warning(TOO_LONG),
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Monogram preview',
      subtitle: 'On your home page: visitors type initials and watch them stitched',
    }),
  },
});
