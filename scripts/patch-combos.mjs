// One-off: attach real font + thread-color references to the seeded popular
// combinations so each recipe card shows a distinct specimen + colour.
// Run: node scripts/patch-combos.mjs
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const ref = (id) => ({ _type: 'reference', _ref: id });
const combos = [
  { _id: 'combo-classic', font: 'font-classic',       thread: 'threadColor-navy' },        // Navy on White
  { _id: 'combo-gift',    font: 'font-fishtail',       thread: 'threadColor-blush-pink' },  // Blush Script
  { _id: 'combo-bold',    font: 'font-vine-heirloom',  thread: 'threadColor-forest-green' },// Forest on Cream
];

for (const c of combos) {
  const res = await client.patch(c._id).set({ font: ref(c.font), threadColor: ref(c.thread) }).commit();
  console.log('patched', res._id, '→', c.font, '+', c.thread);
}
