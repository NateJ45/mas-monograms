// One-off: pull Mary Ann's headshot from the old Squarespace site and set it on
// the About page (makerPhoto) + homepage meet-the-maker slot (aboutPhoto).
// Dry run by default (scripts/lib/write-gate.mjs, starter PORTS.md card 86):
//   node scripts/upload-headshot.mjs                                   # prints the plan
//   NCS_PRODUCTION_WRITE=yes node scripts/upload-headshot.mjs --apply  # uploads + writes (backup + dry run first)
import { createClient } from '@sanity/client';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadEnv } from './lib/loadEnv.mjs';
import { writeGate, apiHostOption } from './lib/write-gate.mjs';

const env = loadEnv(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const APPLY = writeGate({ dataset });

const SRC =
  'https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/f21fb1fe-48a2-447d-9f73-637137ec5814/Mary+Ann+Stone_JPG.jpg';
const ALT = 'Mary Ann Stone, founder of MAS Monograms';

if (!APPLY) {
  console.log(`Would download ${SRC}`);
  console.log(
    'Would upload it as mary-ann-stone.jpg and set aboutPage.makerPhoto + homePage.aboutPhoto.',
  );
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

const resp = await fetch(SRC, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
const buf = Buffer.from(await resp.arrayBuffer());
console.log(
  `downloaded ${(buf.length / 1024).toFixed(0)} KB, type ${resp.headers.get('content-type')}`,
);

const asset = await client.assets.upload('image', buf, { filename: 'mary-ann-stone.jpg' });
console.log('uploaded asset:', asset._id, asset.metadata?.dimensions);

const imageValue = {
  _type: 'image',
  asset: { _type: 'reference', _ref: asset._id },
  alt: ALT,
};

const aboutId = await client.fetch(`*[_type == "aboutPage"][0]._id`);
const homeId = await client.fetch(`*[_type == "homePage"][0]._id`);
if (aboutId) {
  await client.patch(aboutId).set({ makerPhoto: imageValue }).commit();
  console.log('set aboutPage.makerPhoto on', aboutId);
}
if (homeId) {
  await client.patch(homeId).set({ aboutPhoto: imageValue }).commit();
  console.log('set homePage.aboutPhoto on', homeId);
}
