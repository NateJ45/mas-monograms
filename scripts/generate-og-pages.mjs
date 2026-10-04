// Generates one social card per page at public/og/<slug>.png (the Hoop Seal beside the page's
// own headline from Sanity), plus src/lib/brand/ogPages.json, the route -> card map that
// BaseLayout reads. A route with no card falls back to og-default.png, and an editor's own
// share image (seoImage) always wins over a generated card.
//
// Run `npm run og:pages` after a page headline or a category changes in Sanity. The PNGs and
// the map are committed, so builds never need this script or its fonts.
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';
import { renderCard } from './lib/og-card.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnv(root);
if (!env.PUBLIC_SANITY_PROJECT_ID) {
  console.error('PUBLIC_SANITY_PROJECT_ID not set. Skipping page OG generation.');
  process.exit(0);
}
const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01',
  useCdn: true,
  perspective: 'published',
});

// Page singletons and their routes. The headline is the page's own hero headline (and its
// italic swash line where the page has one); `fallback` is used only if Sanity has neither.
const PAGES = [
  { type: 'homePage', route: '/', slug: 'home', fallback: 'Custom monogramming' },
  { type: 'aboutPage', route: '/about', slug: 'about', fallback: 'About' },
  {
    type: 'howItWorksPage',
    route: '/how-it-works',
    slug: 'how-it-works',
    fallback: 'How it works',
  },
  { type: 'pricingPage', route: '/pricing', slug: 'pricing', fallback: 'Pricing' },
  {
    type: 'requestAQuotePage',
    route: '/request-a-quote',
    slug: 'request-a-quote',
    fallback: 'Request a quote',
  },
  { type: 'shopIndexPage', route: '/shop-by-item', slug: 'shop-by-item', fallback: 'Shop by item' },
  {
    type: 'styleGalleryPage',
    route: '/style-gallery',
    slug: 'style-gallery',
    fallback: 'Style gallery',
  },
  {
    type: 'fontGuidePage',
    route: '/font-lettering-guide',
    slug: 'font-lettering-guide',
    fallback: 'Font and lettering guide',
  },
  {
    type: 'threadChartPage',
    route: '/thread-color-chart',
    slug: 'thread-color-chart',
    fallback: 'Thread color chart',
  },
  { type: 'clearancePage', route: '/clearance', slug: 'clearance', fallback: 'Clearance' },
];

const settings = await client.fetch(`*[_type == "siteSettings"][0]{ address }`).catch(() => null);
const place =
  [settings?.address?.city, settings?.address?.state].filter(Boolean).join(', ') ||
  'St. Matthews, SC';

const map = {};
for (const p of PAGES) {
  const doc = await client
    .fetch(`*[_type == $type][0]{ heroHeadline, heroItalicWord }`, { type: p.type })
    .catch(() => null);
  const headline = doc?.heroHeadline || p.fallback;
  const italic = doc?.heroItalicWord || undefined;
  await renderCard({ outPath: resolve(root, `public/og/${p.slug}.png`), headline, italic, place });
  map[p.route] = `/og/${p.slug}.png`;
  console.log(`  og/${p.slug}.png  ${headline}${italic ? ` / ${italic}` : ''}`);
}

// Item categories (/[slug]): the category name.
const cats = await client
  .fetch(`*[_type == "itemCategory" && defined(slug.current)]{ name, "slug": slug.current }`)
  .catch(() => []);
for (const c of cats) {
  if (!c?.name || !c?.slug) continue;
  await renderCard({ outPath: resolve(root, `public/og/${c.slug}.png`), headline: c.name, place });
  map[`/${c.slug}`] = `/og/${c.slug}.png`;
  console.log(`  og/${c.slug}.png  ${c.name}`);
}

writeFileSync(resolve(root, 'src/lib/brand/ogPages.json'), JSON.stringify(map, null, 2) + '\n');
console.log(`\nDone. ${Object.keys(map).length} cards, map in src/lib/brand/ogPages.json`);
