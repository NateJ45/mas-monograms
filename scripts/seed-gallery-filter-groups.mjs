// scripts/seed-gallery-filter-groups.mjs
//
// Two idempotent jobs for the Style Gallery filter taxonomy (Phase E):
//
//   1. Sets styleGalleryPage.filterGroups to four curated headings
//      (Item / Theme & Occasion / Technique & Style / Recipient). This
//      replaces the old flat 71-pill filter wall with a grouped taxonomy
//      Mary Ann can re-curate in the Studio.
//
//   2. Merges the duplicate tag: rewrites the accented "appliqué" to the
//      canonical "applique" on every galleryItem that carries it, so there
//      is a single tag instead of two that mean the same thing.
//
// Both jobs use .set()/full-array replace with stable values, so re-running
// the script produces no further changes (idempotent). It only patches the
// styleGalleryPage.filterGroups field and any galleryItem.tags arrays that
// still contain "appliqué" — no other field is touched.
//
// The site RENDER intersects these group tags with the tags actually present
// on live photos, so listing a tag here that no photo uses is harmless (it
// simply won't render), and the page works even before this script is run.
//
// Prerequisites:
//   - PUBLIC_SANITY_PROJECT_ID in .env
//   - SANITY_API_WRITE_TOKEN in .env (Editor permission or higher)

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('PUBLIC_SANITY_PROJECT_ID is not set. Configure your .env and re-run.');
  process.exit(1);
}
if (!token) {
  console.error('SANITY_API_WRITE_TOKEN is not set. A write token is required to run this seed.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-05-01',
  useCdn: false,
});

// The duplicate tag to merge: accented → canonical.
const DUP_FROM = 'appliqué';
const DUP_TO = 'applique';

// Four curated filter groups. Stable _key values keep the array diff-free on
// re-run. Tags list the raw galleryItem tag values that belong under each
// heading; the site render intersects these with tags present on real photos.
const filterGroups = [
  {
    _key: 'item',
    _type: 'filterGroup',
    groupLabel: 'Item',
    tags: [
      'tote', 'towel', 'napkin', 'kitchen-towel', 'linen', 't-shirt', 'polo',
      'pullover', 'sweatshirt', 'jacket', 'beanie', 'sun-hat', 'baby-blanket',
      'baby-dress', 'baby-hat', 'baby-sweater', 'romper', 'infant-dress',
      'bandana', 'key-fob', 'bag-tag', 'keychain', 'gift-bag', 'duffel-bag',
      'fabric-bucket', 'kids-bag', 'wall-hanging', 'wreath-sash', 'greeting-card',
    ],
  },
  {
    _key: 'themeOccasion',
    _type: 'filterGroup',
    groupLabel: 'Theme & Occasion',
    tags: [
      'christmas', 'christmas-stocking', 'easter', 'seasonal', 'wedding',
      'birthday', 'faith', 'scripture', 'farmhouse', 'chinoiserie', 'palmetto',
      'south-carolina', 'sports', 'collegiate', 'novelty', 'keepsake',
    ],
  },
  {
    _key: 'techniqueStyle',
    _type: 'filterGroup',
    groupLabel: 'Technique & Style',
    tags: [
      'monogram', 'name', 'script', 'block', 'applique', 'logo', 'paw-print',
      'pet-portrait', 'photo-stitch', 'line-art', 'heat-transfer', 'bow',
      'topiary', 'wreath', 'polka-dot', 'multicolor',
    ],
  },
  {
    _key: 'recipient',
    _type: 'filterGroup',
    groupLabel: 'Recipient',
    tags: ['baby', 'pet', 'matching-set'],
  },
];

async function setFilterGroups() {
  await client.patch('styleGalleryPage').set({ filterGroups }).commit();
  console.log(`Set styleGalleryPage.filterGroups (${filterGroups.length} groups).`);
}

async function mergeDuplicateTag() {
  // Find every galleryItem that still carries the accented duplicate.
  const affected = await client.fetch(
    '*[_type == "galleryItem" && $from in tags]{ _id, tags }',
    { from: DUP_FROM },
  );

  if (affected.length === 0) {
    console.log(`No galleryItem carries "${DUP_FROM}" — nothing to merge.`);
    return;
  }

  const tx = client.transaction();
  for (const item of affected) {
    // Rewrite tags: replace the accented value with the canonical one, then
    // de-duplicate in case the item already had the canonical tag too.
    const rewritten = Array.from(
      new Set((item.tags ?? []).map((t) => (t === DUP_FROM ? DUP_TO : t))),
    );
    tx.patch(item._id, (p) => p.set({ tags: rewritten }));
  }
  await tx.commit();
  console.log(
    `Merged "${DUP_FROM}" → "${DUP_TO}" on ${affected.length} galleryItem(s).`,
  );
}

async function main() {
  await setFilterGroups();
  await mergeDuplicateTag();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
