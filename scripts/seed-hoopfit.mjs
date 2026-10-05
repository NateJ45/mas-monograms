// scripts/seed-hoopfit.mjs
//
// Seeds two optional fields added on 2026-10-04:
//
//   1. galleryItem.hoopFit = "poor" on the photos the hotspot pass
//      (scripts/data/hotspots-2026-10-04.json) found cannot make a good round
//      crop. Those photos stay out of every round hoop (src/lib/hoop.ts) and
//      still show in the square gallery views. Every other photo is left unset,
//      which the site reads as "good".
//   2. requestAQuotePage.noScriptMessage, the note shown at the top of the
//      quote form to visitors whose browser has JavaScript switched off.
//
// Every write is setIfMissing, on the published document AND its
// `drafts.<id>` twin when one exists, so a value Mary Ann has chosen is never
// overwritten and a second run reports 0 changes.
//
// Dry run is the default (sanity-lib gate); `--apply` writes.
//
//   node scripts/seed-hoopfit.mjs            # dry run, prints every write
//   node scripts/seed-hoopfit.mjs --apply    # write
//
// Take a dataset backup first:
//   npx sanity dataset export production tmp/backups/production-<date>-hoopfit.tar.gz

import { client, apply, done, APPLY } from './lib/sanity-lib.mjs';

// Why each photo cannot make a good circle (from the hotspot contact sheets).
const POOR_FIT = {
  'galleryItem-20260316-165705': 'two shirts, a bunny at each edge',
  'galleryItem-monogram-39': 'stack of bags with several names',
  'galleryItem-design-25': 'two towels, two designs',
  'galleryItem-design-34': 'baseball bow bigger than the circle',
  'galleryItem-design-29': 'close-up fills the whole circle',
  'galleryItem-greeting-card-03': 'beagle framed, caption clipped',
  'galleryItem-monogram-37': 'name text and two tags spread wide',
  'galleryItem-wreath-sash-05': 'small embroidery in a tall photo',
  'galleryItem-wreath-sash-06': 'small embroidery in a tall photo',
};

const NO_SCRIPT_MESSAGE =
  'The quote form needs JavaScript to send. Turn it on, or email me your idea and photos and I will reply.';

const plans = [
  ...Object.entries(POOR_FIT).map(([id, why]) => ({
    id,
    fields: { hoopFit: 'poor' },
    why,
  })),
  { id: 'requestAQuotePage', fields: { noScriptMessage: NO_SCRIPT_MESSAGE }, why: 'no-JS note' },
];

// Same rule as setIfMissing: only an absent (or null) field counts as missing.
const isEmpty = (v) => v === undefined || v === null;

let changes = 0;
for (const p of plans) {
  for (const id of [p.id, `drafts.${p.id}`]) {
    const doc = await client.getDocument(id);
    if (!doc) {
      if (id === p.id) console.log(`WARN missing document ${id}`);
      continue; // no draft open: nothing to do
    }
    const missing = Object.fromEntries(
      Object.entries(p.fields).filter(([field]) => isEmpty(doc[field])),
    );
    const names = Object.keys(missing);
    if (!names.length) {
      console.log(`SKIP ${id}: already set (${JSON.stringify(pick(doc, p.fields))}).`);
      continue;
    }
    changes++;
    await apply(`${id}: setIfMissing ${JSON.stringify(missing)} (${p.why})`, () =>
      client.patch(id).setIfMissing(missing).commit(),
    );
  }
}

function pick(doc, fields) {
  return Object.fromEntries(Object.keys(fields).map((k) => [k, doc[k]]));
}

console.log(APPLY ? '' : '(dry run: nothing was written)');
done(changes);
