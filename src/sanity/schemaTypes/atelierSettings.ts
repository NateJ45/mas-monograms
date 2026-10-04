// Monogram Atelier settings singleton. Every word the live embroidery preview
// shows (section copy, control labels, style and fabric names, sample initials,
// the "this is a preview" line) comes from here, so Mary Ann can edit it all.
// Rendering logic (which font backs which style) lives in code, never the copy.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { SparklesIcon } from '@sanity/icons';

export const atelierSettings = defineType({
  name: 'atelierSettings',
  title: 'Monogram Preview (Atelier)',
  type: 'document',
  icon: SparklesIcon,
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'section', title: 'Section words', default: true },
    { name: 'controls', title: 'Control labels' },
    { name: 'styles', title: 'Monogram styles' },
    { name: 'fabrics', title: 'Fabrics' },
    { name: 'samples', title: 'Sample initials' },
    { name: 'buttons', title: 'Buttons & notice' },
    { name: 'hero', title: 'Home page try-it box' },
  ],
  fields: [
    // ── Section copy ─────────────────────────────────────────────────────────
    defineField({
      name: 'eyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'section',
      description: 'E.g. "The monogram studio".',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'section',
      description: 'The big heading above the live preview.',
      validation: (R) => R.required().max(100),
    }),
    defineField({
      name: 'subhead',
      title: 'Short line under the heading',
      type: 'text',
      rows: 2,
      group: 'section',
      validation: (R) => R.required().max(240),
    }),

    // ── Control labels ───────────────────────────────────────────────────────
    defineField({
      name: 'initialsLabel',
      title: 'Label for the initials box',
      type: 'string',
      group: 'controls',
      validation: (R) => R.required().max(40),
    }),
    defineField({
      name: 'initialsHint',
      title: 'Hint under the initials box',
      type: 'string',
      group: 'controls',
      description: 'E.g. "One to three letters".',
      validation: (R) => R.required().max(100),
    }),
    defineField({
      name: 'styleLabel',
      title: 'Label for the monogram style choice',
      type: 'string',
      group: 'controls',
      validation: (R) => R.required().max(40),
    }),
    defineField({
      name: 'threadLabel',
      title: 'Label for the thread color choice',
      type: 'string',
      group: 'controls',
      validation: (R) => R.required().max(40),
    }),
    defineField({
      name: 'fabricLabel',
      title: 'Label for the fabric choice',
      type: 'string',
      group: 'controls',
      validation: (R) => R.required().max(40),
    }),

    // ── Styles ───────────────────────────────────────────────────────────────
    defineField({
      name: 'styles',
      title: 'Monogram styles',
      type: 'array',
      group: 'styles',
      description:
        'The five lettering looks the preview can show. You can rename them and change the one-line description. The "style key" is fixed by the website, so please do not change it.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'atelierStyle',
          fields: [
            defineField({
              name: 'key',
              title: 'Style key (do not change)',
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
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'label',
              title: 'Name shown to customers',
              type: 'string',
              validation: (R) => R.required().max(40),
            }),
            defineField({
              name: 'blurb',
              title: 'One-line description',
              type: 'string',
              validation: (R) => R.required().max(120),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'blurb' } },
        }),
      ],
      validation: (R) =>
        R.required()
          .min(1)
          .max(5)
          .custom((items: any[] | undefined) => {
            const keys = (items ?? []).map((i) => i?.key).filter(Boolean);
            return new Set(keys).size === keys.length
              ? true
              : 'Each monogram style can only be used once.';
          }),
    }),

    // ── Fabrics ──────────────────────────────────────────────────────────────
    defineField({
      name: 'fabrics',
      title: 'Fabrics',
      type: 'array',
      group: 'fabrics',
      description:
        'The cloth colors customers can preview their monogram on. The color is only for the preview picture.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'atelierFabric',
          fields: [
            defineField({
              name: 'key',
              title: 'Short ID',
              type: 'string',
              description: 'Lowercase, no spaces. E.g. "navy-canvas". Please do not change later.',
              validation: (R) =>
                R.required().regex(/^[a-z0-9-]+$/, {
                  name: 'id',
                  invert: false,
                }),
            }),
            defineField({
              name: 'label',
              title: 'Fabric name',
              type: 'string',
              validation: (R) => R.required().max(40),
            }),
            defineField({
              name: 'color',
              title: 'Fabric color (hex)',
              type: 'string',
              description: 'E.g. "#e8dcc8". Used to paint the cloth in the preview.',
              validation: (R) =>
                R.required()
                  .regex(/^#[0-9A-Fa-f]{6}$/, { name: 'hex', invert: false })
                  .error('Must be a valid hex color like #e8dcc8.'),
            }),
            defineField({
              name: 'note',
              title: 'Short note (optional)',
              type: 'string',
              validation: (R) => R.max(120),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'color' } },
        }),
      ],
      validation: (R) => R.required().min(2).max(12),
    }),

    // ── Sample initials ──────────────────────────────────────────────────────
    defineField({
      name: 'sampleMonograms',
      title: 'Sample initials for the animation',
      type: 'array',
      group: 'samples',
      description:
        'Initials the home page stitches one after another. Use made-up initials only, never a real customer.',
      of: [
        defineArrayMember({
          type: 'string',
          validation: (R) =>
            R.required()
              .min(1)
              .max(3)
              .regex(/^[A-Za-z]+$/, { name: 'letters', invert: false })
              .error('One to three letters, no spaces.'),
        }),
      ],
      validation: (R) => R.required().min(3).max(16),
    }),

    // ── Buttons and notice ───────────────────────────────────────────────────
    defineField({
      name: 'replayLabel',
      title: 'Replay button text',
      type: 'string',
      group: 'buttons',
      validation: (R) => R.required().max(30),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Request button text',
      type: 'string',
      group: 'buttons',
      description: 'The button that sends the design to the quote form.',
      validation: (R) => R.required().max(40),
    }),
    defineField({
      name: 'disclaimer',
      title: 'Preview notice',
      type: 'text',
      rows: 3,
      group: 'buttons',
      description:
        'Shown near the preview so nobody mistakes it for a final proof. Keep the idea that you confirm lettering and colors before stitching.',
      validation: (R) => R.required().max(300),
    }),

    // ── Home page try-it box ─────────────────────────────────────────────────
    defineField({
      name: 'heroTryLabel',
      title: 'Label for the small try-it box on the home page',
      type: 'string',
      group: 'hero',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'heroPlaceholder',
      title: 'Placeholder inside the try-it box',
      type: 'string',
      group: 'hero',
      description: 'Faint example text, e.g. "MAS".',
      validation: (R) => R.required().max(20),
    }),
  ],
  preview: { prepare: () => ({ title: 'Monogram Preview (Atelier)' }) },
});
