// scripts/fix-orphan-data.mjs
//
// One-time data cleanup, safe + idempotent to re-run. Fixes two things the
// Studio surfaced as warnings:
//
//   A. "Unknown fields found" — field VALUES left in documents after their
//      schema fields were removed (the 2026-07-03 orphan-content cleanup
//      removed the fields but not the residual data). Unsets them.
//
//   B. "Missing keys" — array items (itemCategory.heroImages) created by the
//      original image import without a `_key`, which blocks editing the list.
//      Adds a unique _key to any object array item that lacks one, preserving
//      order and content. Walks every field so it also catches nested arrays.
//
// Dataset-only: no schema or site changes, nothing to redeploy.
// Unsetting deletes data: back up first. Dry run by default
// (scripts/lib/write-gate.mjs, starter PORTS.md card 86):
//   node scripts/fix-orphan-data.mjs                                   # prints the plan
//   NCS_PRODUCTION_WRITE=yes node scripts/fix-orphan-data.mjs --apply  # writes (backup + dry run first)

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';
import { writeGate, apiHostOption } from './lib/write-gate.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const token = env.SANITY_API_WRITE_TOKEN;
const APPLY = writeGate({ dataset });

if (!projectId || !token) {
  console.log('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.');
  process.exit(0);
}
const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-05-01',
  useCdn: false,
  ...apiHostOption(env),
});

// Fields removed from the schema in the orphan-content cleanup, per document.
// Unsetting is harmless if the value is already gone (idempotent).
const ORPHAN_FIELDS = {
  homePage: [
    'comboPreviewEyebrow',
    'comboPreviewHeadline',
    'comboPreviewSubhead',
    'combosEyebrow',
    'combosHeadline',
    'combosSubhead',
    'combosCtaLabel',
    'combosCtaHref',
    'categoriesCtaLabel',
    'categoriesCtaHref',
    'ctaBackgroundImage',
  ],
  aboutPage: ['storyEyebrow', 'valuesEyebrow'],
  howItWorksPage: ['stepsEyebrow', 'faqEyebrow', 'heroImage'],
  pricingPage: [
    'tiersEyebrow',
    'faqEyebrow',
    'tiersNote',
    'tiersMinimumNote',
    'addonsEyebrow',
    'heroImage',
  ],
  notFoundPage: ['eyebrow', 'tertiaryCtaLabel', 'tertiaryCtaHref', 'heroImage'],
  requestAQuotePage: ['formIntroHeadline', 'formIntroBody', 'heroImage'],
  shopIndexPage: ['heroImage'],
  styleGalleryPage: ['heroImage'],
};

const newKey = () => randomBytes(6).toString('hex');

/** Recursively add _key to any object that is an item of an array and lacks one. Returns true if changed. */
function addMissingKeys(node) {
  let changed = false;
  if (Array.isArray(node)) {
    for (const item of node) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        if (item._key === undefined) {
          item._key = newKey();
          changed = true;
        }
        if (addMissingKeys(item)) changed = true;
      }
    }
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('_')) continue;
      if (addMissingKeys(v)) changed = true;
    }
  }
  return changed;
}

async function run() {
  // ── A. Unset orphan field values (published + draft) ──
  console.log('A. Unsetting orphan fields…');
  for (const [baseId, fields] of Object.entries(ORPHAN_FIELDS)) {
    for (const id of [baseId, `drafts.${baseId}`]) {
      const doc = await client.getDocument(id);
      if (!doc) continue;
      const present = fields.filter((f) => doc[f] !== undefined);
      if (!present.length) continue;
      if (APPLY) await client.patch(id).unset(present).commit();
      console.log(`   ${id}: ${APPLY ? 'unset' : 'would unset'} ${present.join(', ')}`);
    }
  }

  // ── B. Add missing _key to array items across every document ──
  console.log('B. Adding missing array keys…');
  const all = await client.fetch('*[!(_type match "system.**") && !(_type match "sanity.**")]');
  let keyed = 0;
  for (const doc of all) {
    if (addMissingKeys(doc)) {
      if (APPLY) await client.createOrReplace(doc);
      keyed += 1;
      console.log(`   ${doc._id}: ${APPLY ? 'keys added' : 'would add keys'}`);
    }
  }
  console.log(
    APPLY
      ? `\nDone. Orphan fields unset + ${keyed} documents re-keyed.`
      : `\nDRY RUN: ${keyed} document(s) would be re-keyed. Re-run with --apply to write.`,
  );
}

run().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
