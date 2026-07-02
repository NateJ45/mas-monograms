// One-off: pull Mary Ann's headshot from the old Squarespace site and set it on
// the About page (makerPhoto) + homepage meet-the-maker slot (aboutPhoto).
// Run: node scripts/upload-headshot.mjs
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
  apiVersion: process.env.PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const SRC = 'https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/f21fb1fe-48a2-447d-9f73-637137ec5814/Mary+Ann+Stone_JPG.jpg';
const ALT = 'Mary Ann Stone, founder of MAS Monograms';

const resp = await fetch(SRC, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
const buf = Buffer.from(await resp.arrayBuffer());
console.log(`downloaded ${(buf.length / 1024).toFixed(0)} KB, type ${resp.headers.get('content-type')}`);

const asset = await client.assets.upload('image', buf, { filename: 'mary-ann-stone.jpg' });
console.log('uploaded asset:', asset._id, asset.metadata?.dimensions);

const imageValue = {
  _type: 'image',
  asset: { _type: 'reference', _ref: asset._id },
  alt: ALT,
};

const aboutId = await client.fetch(`*[_type == "aboutPage"][0]._id`);
const homeId = await client.fetch(`*[_type == "homePage"][0]._id`);
if (aboutId) { await client.patch(aboutId).set({ makerPhoto: imageValue }).commit(); console.log('set aboutPage.makerPhoto on', aboutId); }
if (homeId)  { await client.patch(homeId).set({ aboutPhoto: imageValue }).commit();  console.log('set homePage.aboutPhoto on', homeId); }
