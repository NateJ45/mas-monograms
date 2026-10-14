// One-off: attach real font + thread-color references to the seeded popular
// combinations so each recipe card shows a distinct specimen + colour.
// Dry run by default (scripts/lib/write-gate.mjs, starter PORTS.md card 86):
//   node scripts/patch-combos.mjs                                   # prints the plan
//   NCS_PRODUCTION_WRITE=yes node scripts/patch-combos.mjs --apply  # writes (backup + dry run first)
import { createClient } from '@sanity/client';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadEnv } from './lib/loadEnv.mjs';
import { writeGate, apiHostOption } from './lib/write-gate.mjs';

const env = loadEnv(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const APPLY = writeGate({ dataset });

const ref = (id) => ({ _type: 'reference', _ref: id });
const combos = [
  // description names the ACTUAL referenced font, so the card text matches.
  {
    _id: 'combo-classic',
    font: 'font-classic',
    thread: 'threadColor-navy',
    description: 'Classic font · three-letter monogram · perfect for towels and linens.',
  },
  {
    _id: 'combo-gift',
    font: 'font-fishtail',
    thread: 'threadColor-blush-pink',
    description: 'Fishtail font · first name · ideal for totes and baby items.',
  },
  {
    _id: 'combo-bold',
    font: 'font-vine-heirloom',
    thread: 'threadColor-forest-green',
    description: 'Vine Heirloom font · three-letter monogram · great for sweatshirts.',
  },
];

if (!APPLY) {
  for (const c of combos) console.log('would patch', c._id, '→', c.font, '+', c.thread);
  process.exit(0);
}

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: '2024-01-01',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  ...apiHostOption(env),
});

for (const c of combos) {
  const res = await client
    .patch(c._id)
    .set({ font: ref(c.font), threadColor: ref(c.thread), description: c.description })
    .commit();
  console.log('patched', res._id, '→', c.font, '+', c.thread);
}
