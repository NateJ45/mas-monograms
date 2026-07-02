// One-off: point the footer credit at Nixon Creative Studio with a link.
// Patches only siteSettings.footerCredit + footerCreditUrl on the live dataset.
// Run: node scripts/patch-footer-credit.mjs
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Minimal .env loader (KEY=VALUE lines) — the repo has no dotenv dependency.
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: process.env.PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const res = await client
  .patch('siteSettings')
  .set({
    footerCredit: 'Site Designed by Nixon Creative Studio',
    footerCreditUrl: 'https://www.nixoncreativestudio.com',
  })
  .commit();

console.log('patched siteSettings:', res.footerCredit, '→', res.footerCreditUrl);
