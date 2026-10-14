// One-off: point the footer credit at Nixon Creative Studio with a link.
// Patches only siteSettings.footerCredit + footerCreditUrl on the live dataset.
// Dry run by default (scripts/lib/write-gate.mjs, starter PORTS.md card 86):
//   node scripts/patch-footer-credit.mjs                                   # prints the plan
//   NCS_PRODUCTION_WRITE=yes node scripts/patch-footer-credit.mjs --apply  # writes (Nathan only)
import { createClient } from '@sanity/client';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadEnv } from './lib/loadEnv.mjs';
import { writeGate, apiHostOption } from './lib/write-gate.mjs';

const env = loadEnv(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const APPLY = writeGate({ dataset });

const patch = {
  footerCredit: 'Site Designed by Nixon Creative Studio',
  footerCreditUrl: 'https://www.nixoncreativestudio.com',
};

if (!APPLY) {
  console.log('Would set on siteSettings:', JSON.stringify(patch));
  process.exit(0);
}

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: env.PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  ...apiHostOption(env),
});

const res = await client.patch('siteSettings').set(patch).commit();

console.log('patched siteSettings:', res.footerCredit, '→', res.footerCreditUrl);
