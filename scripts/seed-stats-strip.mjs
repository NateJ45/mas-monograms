// scripts/seed-stats-strip.mjs
//
// Patches ONLY homePage.statsItems with real, sourced credibility stats.
// Does NOT touch any other homePage field — deliberately narrower than
// re-running scripts/seed-content.mjs, since that would risk overwriting
// any homePage field hand-edited in Sanity Studio since the original seed.
//
// Idempotent: uses stable _key values and .set() (full-array replace), so
// re-running this script produces no diff and no duplicate entries.
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

// Each stat traces to a real, already-established fact — see
// docs/superpowers/specs/2026-07-01-stats-strip-design.md for sourcing.
const statsItems = [
  { _key: 'years', _type: 'statItem', number: 3, suffix: '+', label: 'Years Perfecting the Craft' },
  { _key: 'handstitched', _type: 'statItem', number: 100, suffix: '%', label: 'Hand-Stitched, By Me' },
  { _key: 'reply', _type: 'statItem', number: 1, suffix: '', label: 'Business Day Average Reply' },
  { _key: 'colors', _type: 'statItem', number: 40, suffix: '+', label: 'Thread Colors' },
];

async function main() {
  await client.patch('homePage').set({ statsItems }).commit();
  console.log(`Patched homePage.statsItems with ${statsItems.length} stat(s).`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
