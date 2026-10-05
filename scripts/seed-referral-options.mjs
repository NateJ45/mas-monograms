// scripts/seed-referral-options.mjs
//
// Adds the "how did you hear about me" answers the Get found handbook tells Mary
// Ann about (src/sanity/guides/getFound.ts, 2026-10-05) to
// requestAQuotePage.referralOptions: Pinterest, Nextdoor, Google Maps and
// "A QR code on a tag or card".
//
// Append-if-missing, on the published document AND its `drafts.` twin when one
// exists:
//   - an answer already in her list (compared ignoring case and spaces) is never
//     added twice, and nothing she has is removed, renamed or reordered;
//   - new answers go just before "Other" when she has it, else at the end;
//   - the write is pinned to the revision that was read (ifRevisionId), so an
//     edit she makes at the same moment cannot be overwritten;
//   - a second run changes nothing (it prints 0 changes).
//
// Dry run is the default (sanity-lib gate); `--apply` writes.
//
//   node scripts/seed-referral-options.mjs            # dry run
//   node scripts/seed-referral-options.mjs --apply    # write
//
// Needs PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env (bare token).
// Take a dataset backup first (tmp/backups/). NEVER run scripts/seed-core.mjs.

import { client, apply, done, APPLY } from './lib/sanity-lib.mjs';

export const NEW_OPTIONS = ['Pinterest', 'Nextdoor', 'Google Maps', 'A QR code on a tag or card'];

const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/** The new list, or null when nothing is missing. Pure (exported for reading). */
export function withNewOptions(current) {
  const list = Array.isArray(current) ? current : [];
  const have = new Set(list.map(norm));
  const missing = NEW_OPTIONS.filter((o) => !have.has(norm(o)));
  if (!missing.length) return null;
  const at = list.findIndex((o) => norm(o) === 'other');
  return at === -1 ? [...list, ...missing] : [...list.slice(0, at), ...missing, ...list.slice(at)];
}

let changes = 0;
for (const id of ['requestAQuotePage', 'drafts.requestAQuotePage']) {
  const doc = await client.getDocument(id);
  if (!doc) {
    console.log(`SKIP ${id}: no document.`);
    continue;
  }
  const next = withNewOptions(doc.referralOptions);
  if (!next) {
    console.log(`SKIP ${id}: all four answers are already there.`);
    continue;
  }
  changes++;
  console.log(`${id} (rev ${doc._rev})`);
  console.log(`  now:   ${JSON.stringify(doc.referralOptions ?? [])}`);
  console.log(`  after: ${JSON.stringify(next)}`);
  await apply(`${id}: set referralOptions (append only)`, () =>
    client.patch(id).ifRevisionId(doc._rev).set({ referralOptions: next }).commit(),
  );
}

console.log(APPLY ? '' : '(dry run: nothing was written)');
done(changes);
