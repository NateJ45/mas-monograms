// Regenerates the default social-share card public/og-default.png (1200x630): the Hoop Seal
// beside the Signature Thread wordmark on Midnight, with the Site Settings tagline and place.
// Re-runnable: npm run og (needs no fonts or network; reads Sanity only for the words, and
// falls back to the built-in wording below when Sanity is unreachable).
// Card drawing: scripts/lib/og-card.mjs. Logo: src/lib/brand/brandSvg.js.
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';
import { renderCard } from './lib/og-card.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnv(root);

let tagline = 'Hand-stitched monograms and embroidery, made locally in St. Matthews, SC.';
let place = 'St. Matthews, SC';
if (env.PUBLIC_SANITY_PROJECT_ID) {
  const client = createClient({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
    apiVersion: env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01',
    useCdn: true,
    perspective: 'published',
  });
  const s = await client
    .fetch(`*[_type == "siteSettings"][0]{ tagline, address }`)
    .catch(() => null);
  if (s?.tagline) tagline = s.tagline;
  const where = [s?.address?.city, s?.address?.state].filter(Boolean).join(', ');
  if (where) place = where;
}

const out = await renderCard({ outPath: resolve(root, 'public/og-default.png'), tagline, place });
console.log(`wrote ${out} (1200x630)`);
