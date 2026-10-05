// studioNotes singleton — drives the static notes in the "Your business at a
// glance" Start Here panel (the live services/settings come straight from those
// documents and are not duplicated here). Plain text, excluded from Canvas.
import { defineType, defineField, defineArrayMember } from 'sanity';

export const studioNotes = defineType({
  name: 'studioNotes',
  title: 'Business Notes (Start Here)',
  type: 'document',
  options: { canvasApp: { exclude: true } },
  fields: [
    defineField({ name: 'businessSummary', title: 'Who you are', type: 'text', rows: 5 }),
    defineField({ name: 'idealClient', title: 'Your ideal client', type: 'text', rows: 5 }),
    defineField({ name: 'voiceSummary', title: 'Your voice', type: 'text', rows: 6 }),
    defineField({
      name: 'wordsToAvoid',
      title: 'Words to skip',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Designer-speak to avoid in writing.',
    }),
    // Phase B (2026-10-05): the Help page's "Still stuck? Ask ..." line reads
    // this. Studio-only, never shown on the website. Left empty, Help says
    // "the person who built your website" (HELP_CONTACT_FALLBACK in
    // src/sanity/components/HelpPane.tsx). Nobody's details are pre-filled.
    defineField({
      name: 'helpContact',
      title: 'Who to ask for help',
      type: 'string',
      description:
        'The name, and an email or phone number, of the person who looks after your website. The Help page shows it so you always know who to ask. It is never shown on your website.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Business Notes' }) },
});
