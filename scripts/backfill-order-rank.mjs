// scripts/backfill-order-rank.mjs
//
// Phase D (2026-10-05): gives every photo, clearance item, price tag, question,
// font and shop category an `orderRank`, so the new drag-to-reorder lists in the
// Studio open in the order the website already shows.
//
// ORDER OF OPERATIONS: run this BEFORE the Studio with the drag lists is
// deployed. The site queries are tolerant (`order(orderRank asc, displayOrder
// asc)`, src/lib/queries.ts), so the live site is the same before and after:
// the ranks copy `displayOrder asc, _id asc`, which is how GROQ already broke
// ties (checked 2026-10-05 on the fonts, which have pairs of equal numbers).
//
// Rules (same as every live write in this repo):
//   - Dry run by default (sanity-lib gate); `--apply` writes.
//   - setIfMissing on the published document AND its `drafts.<id>` twin when
//     one exists. The draft matters: publishing a draft replaces the published
//     copy, so a draft without the rank would wipe it on her next Publish.
//   - A document that already has a valid rank is never renumbered.
//   - A second `--apply` reports 0 changes.
//   - Backup first: npx sanity dataset export production tmp/backups/production-<date>-order-rank.tar.gz
//
//   node scripts/backfill-order-rank.mjs           # dry run
//   node scripts/backfill-order-rank.mjs --apply   # write
//
// Thread colors are left out on purpose: the chart sorts them by hue in code.

import { client, apply, done, APPLY } from './lib/sanity-lib.mjs';
import { planRanks, isValidRank } from './lib/order-rank.mjs';

export const RANKED_TYPES = [
  'galleryItem',
  'clearanceItem',
  'pricingTier',
  'faqItem',
  'font',
  'itemCategory',
];

let changes = 0;
for (const type of RANKED_TYPES) {
  const docs = await client.fetch(
    `*[_type == $type && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{ _id, displayOrder, orderRank }`,
    { type },
  );
  const drafts = await client.fetch(
    `*[_type == $type && _id in path("drafts.**")]{ _id, orderRank }`,
    { type },
  );
  const draftRank = new Map(drafts.map((d) => [d._id, d.orderRank]));
  const plan = planRanks(docs);
  // The rank each published doc will have after this run (old or new).
  const finalRank = new Map(docs.map((d) => [d._id, d.orderRank]));
  for (const p of plan) finalRank.set(p._id, p.orderRank);

  console.log(
    `\n${type}: ${docs.length} published, ${drafts.length} with unpublished changes, ${plan.length} need a rank`,
  );
  for (const p of plan) {
    changes++;
    await apply(`${p._id}: setIfMissing orderRank ${p.orderRank}`, () =>
      client.patch(p._id).setIfMissing({ orderRank: p.orderRank }).commit(),
    );
  }
  // Drafts: give each the rank its published twin has (or will have).
  for (const [draftId, rank] of draftRank) {
    if (isValidRank(rank)) continue;
    const pubId = draftId.slice('drafts.'.length);
    const want = finalRank.get(pubId);
    if (!isValidRank(want)) {
      // A brand-new item that was never published: rank it after everything.
      console.log(`SKIP ${draftId}: never published; it takes a rank when she opens the list.`);
      continue;
    }
    changes++;
    await apply(`${draftId}: setIfMissing orderRank ${want}`, () =>
      client.patch(draftId).setIfMissing({ orderRank: want }).commit(),
    );
  }
}

console.log(APPLY ? '' : '(dry run: nothing was written)');
done(changes);
