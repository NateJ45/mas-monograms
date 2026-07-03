// scripts/cleanup-testimonials-stats.mjs
//
// One-off cleanup (2026-07-03): removes the placeholder testimonials feature
// and the homepage stats strip from the live dataset.
//   1. Deletes every `testimonial` document (published + drafts).
//   2. Unsets the now-removed testimonial + stats fields on `homePage`
//      (published + draft): statsItems, testimonialsEyebrow, testimonialsHeadline,
//      testimonialsSubhead, testimonialsReviewsNote.
//
// Reports exactly what it will touch BEFORE mutating. Idempotent: re-running
// after a clean run finds nothing to delete/unset.
//
// Prereqs in .env: PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET (optional,
// defaults to "production"), SANITY_API_WRITE_TOKEN (Editor+).

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const env = loadEnv(root);

const projectId = (env.PUBLIC_SANITY_PROJECT_ID || '').trim();
const dataset = (env.PUBLIC_SANITY_DATASET || 'production').trim().toLowerCase();
const token = (env.SANITY_API_WRITE_TOKEN || '').trim();

if (!projectId || !token) {
  console.error('✖ Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: (env.PUBLIC_SANITY_API_VERSION || '2024-01-01').trim(),
  token,
  useCdn: false,
});

const STATS_TESTIMONIAL_FIELDS = [
  'statsItems',
  'testimonialsEyebrow',
  'testimonialsHeadline',
  'testimonialsSubhead',
  'testimonialsReviewsNote',
];

const run = async () => {
  console.log(`\nDataset: ${projectId}/${dataset}\n`);

  // ── 1. Testimonial documents (published + drafts) ────────────────────────
  const testimonials = await client.fetch(
    `*[_type == "testimonial"]{ _id, attribution, quote }`,
  );
  console.log(`Testimonial documents found: ${testimonials.length}`);
  for (const t of testimonials) {
    console.log(`  · ${t._id}  —  ${t.attribution ?? '?'}: "${(t.quote ?? '').slice(0, 50)}…"`);
  }

  // ── 2. homePage docs carrying the removed fields ─────────────────────────
  const homeDocs = await client.fetch(
    `*[_type == "homePage"]{ _id, "hasStats": defined(statsItems), "hasTestimonialCopy": defined(testimonialsEyebrow) || defined(testimonialsHeadline) || defined(testimonialsSubhead) || defined(testimonialsReviewsNote) }`,
  );
  console.log(`\nhomePage documents: ${homeDocs.length}`);
  for (const h of homeDocs) {
    console.log(`  · ${h._id}  —  statsItems:${h.hasStats}  testimonialCopy:${h.hasTestimonialCopy}`);
  }

  // ── Mutate ───────────────────────────────────────────────────────────────
  let tx = client.transaction();
  let ops = 0;

  for (const t of testimonials) {
    tx = tx.delete(t._id);
    ops++;
  }
  for (const h of homeDocs) {
    tx = tx.patch(h._id, (p) => p.unset(STATS_TESTIMONIAL_FIELDS));
    ops++;
  }

  if (ops === 0) {
    console.log('\n✔ Nothing to do — dataset already clean.');
    return;
  }

  console.log(`\nCommitting ${ops} operation(s)…`);
  await tx.commit();
  console.log('✔ Done.');

  // ── Verify ───────────────────────────────────────────────────────────────
  const remaining = await client.fetch(`count(*[_type == "testimonial"])`);
  const stillHasStats = await client.fetch(
    `count(*[_type == "homePage" && defined(statsItems)])`,
  );
  console.log(`\nVerify → testimonial docs remaining: ${remaining}; homePage with statsItems: ${stillHasStats}`);
};

run().catch((err) => {
  console.error('✖ Cleanup failed:', err.message);
  process.exit(1);
});
