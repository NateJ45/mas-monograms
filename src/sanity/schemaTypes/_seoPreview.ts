// "How this looks on Google" (2026-10-05, Phase D; the seoPreview pattern of
// fbcm's PORTABLE _seoFields.ts, PORTS card 34).
//
// A value-less box: its custom input (components/GooglePreviewInput.tsx) draws
// the Google result and the shared-link card from the boxes below it and writes
// nothing, so no page ever stores a `seoPreview` value. Spread into a LITERAL
// `defineField({ name: 'seoPreview', ... })` at the top of each page's
// "Google and sharing" boxes (scripts/audit-studio.mjs reads the schema files
// as text). Kept out of _copy.ts on purpose: _copy.ts is imported by bare-Node
// tests, and this file pulls in a React component.

import { GooglePreviewInput } from '../components/GooglePreviewInput';

export const SEO_PREVIEW = {
  title: 'How this looks on Google',
  readOnly: true,
  components: { input: GooglePreviewInput },
};
