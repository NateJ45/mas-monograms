// =============================================================================
// patch-studio-guide-presentation.mjs - update Mary Ann's Start Here guide
// for the modern-stack Studio (2026-08-28)
// =============================================================================
// RUN THIS AS PART OF THE MODERN-STACK ACTIVATION, AFTER the dashboard deploy
// command is switched and modern-stack merges to main - NOT BEFORE. The guide
// is live content: until the embedded Studio ships, describing the
// Presentation tool would hand Mary Ann instructions that do not match the
// Studio in front of her. Activation order lives in docs/PENDING.md.
//
// What it changes (three targeted edits, everything else untouched):
//   1. The "Website pages" studio-map row: the removed per-page "Preview" tab
//      becomes the Presentation tool.
//   2. The "You can always undo" tip: same stale Preview-tab mention.
//   3. A new how-to, inserted SECOND (gallery photos stay the first, most
//      common task): seeing changes live before publishing.
//
// Dry-run by default; --apply to write. Idempotent: re-runs detect the new
// how-to _key and the rewritten strings and report nothing to do.
// =============================================================================
import { client, APPLY, apply, done } from './lib/sanity-lib.mjs';

const DOC_ID = 'studioGuide';

const NEW_MAP_SG2 =
  'One document per page of the site - Home, How It Works, Pricing, About, Request a Quote, Shop by Item, Style Gallery, Font & Lettering Guide, Thread Color Chart, Clearance, Thank You, and the 404 page. Open any page to edit its words and images. To SEE a change before anyone else does, use the Presentation tab (the eye icon at the top) - it shows the real page with your unpublished edits.';

const NEW_TIP_SGI =
  'Sanity keeps a history of every document. If you change something and want it back, open the document, use the version history, and restore the earlier version. And you never have to publish blind: the Presentation tab shows the real page with your draft changes before you press Publish.';

const NEW_HOWTO = {
  _key: 'sg-presentation',
  _type: 'howTo',
  title: 'See your changes on the real page before publishing (Presentation)',
  steps: [
    'At the top of the Studio, click "Presentation" (the eye icon).',
    'The left side lists your pages; the right side shows the live page. Click a page to view it.',
    'Make an edit in the panel - the page updates by itself within a second or two. What you see includes your unpublished changes, so you can check everything before it goes live.',
    'Even faster: click any piece of text ON the page itself and the Studio jumps straight to that field.',
    'Happy with it? Click Publish. Not yet? Just leave it - your draft waits, and only you can see it.',
    'If the preview ever says the session ended, reload the browser tab and it reconnects.',
  ],
};

const doc = await client.getDocument(DOC_ID);
if (!doc) {
  console.error(`No ${DOC_ID} document found - nothing to patch.`);
  process.exit(1);
}

let changes = 0;

const sg2 = doc.studioMap?.find((r) => r._key === 'sg-2');
if (sg2 && sg2.description !== NEW_MAP_SG2) {
  changes++;
  await apply('studioMap sg-2: Preview tab -> Presentation tool', () =>
    client
      .patch(DOC_ID)
      .set({ 'studioMap[_key=="sg-2"].description': NEW_MAP_SG2 })
      .commit(),
  );
}

const sgi = doc.tips?.find((t) => t._key === 'sg-i');
if (sgi && sgi.body !== NEW_TIP_SGI) {
  changes++;
  await apply('tip sg-i: Preview tab -> Presentation, drafts visible', () =>
    client
      .patch(DOC_ID)
      .set({ 'tips[_key=="sg-i"].body': NEW_TIP_SGI })
      .commit(),
  );
}

if (!doc.howTos?.some((h) => h._key === NEW_HOWTO._key)) {
  changes++;
  await apply('howTos: insert the Presentation how-to in position 2', () =>
    client
      .patch(DOC_ID)
      .insert('after', 'howTos[0]', [NEW_HOWTO])
      .commit(),
  );
}

done(changes);
