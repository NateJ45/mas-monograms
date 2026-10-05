// scripts/seed-pending-fields.mjs
//
// Seeds the production words for the optional fields added on 2026-10-04 to pay
// off the "Sanity fields the page work wanted but could not add" list in
// docs/PENDING.md (labels that used to be hard-coded in the pages).
//
// Every write is setIfMissing, on the published document AND its
// `drafts.<id>` twin when one exists, so:
//   - a value Mary Ann has already typed is never overwritten;
//   - publishing a draft she has open cannot erase the new words;
//   - a second run changes nothing (it prints 0 changes).
//
// Dry run is the default (sanity-lib gate); `--apply` writes.
//
//   node scripts/seed-pending-fields.mjs            # dry run, prints every write
//   node scripts/seed-pending-fields.mjs --apply    # write
//
// Needs PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env (bare token,
// no quotes). Take a dataset backup first. NEVER run scripts/seed-core.mjs.
//
// Copy rules: short, plain, in the site's existing words. Where a label used to
// be hard-coded, the old wording is kept ("Most Popular" became "Most popular",
// "from", "Popular", "Last updated", "Expected response time", "What's next",
// "Request this", "Request something like this", "Explore Other Items",
// "{count} left", "Search colors", "At the bench"). Nothing new is claimed.
// The 2026-10-05 pass added the /style-gallery leftovers ("Start your quote",
// "{font} font", "Filter gallery", "Filters", "+ {count} more", "Less"); a doc
// that already had the first pass gets only these.

import { client, apply, done, APPLY } from './lib/sanity-lib.mjs';

/** One planned patch: which documents, and which fields (function of the doc). */
const plans = [];
const plan = (label, query, fields) => plans.push({ label, query, fields });

// ── Singletons ───────────────────────────────────────────────────────────────
plan('pricingPage', `*[_id == "pricingPage"]`, () => ({ tierPricePrefix: 'from' }));

plan('fontGuidePage', `*[_id == "fontGuidePage"]`, () => ({
  popularLabel: 'Popular',
  tryItLabel: 'Try it in the preview',
}));

plan('thankYouPage', `*[_id == "thankYouPage"]`, () => ({
  responseTimeLabel: 'Expected response time',
  nextStepsLabel: "What's next",
}));

plan('styleGalleryPage', `*[_id == "styleGalleryPage"]`, () => ({
  filterToggleLabel: 'Filter photos',
  resultsAnnouncement: '{filter}: showing {count} of {total} photos',
  requestLabel: 'Request this',
  lightboxLabel: 'Photo viewer',
  lightboxCloseLabel: 'Close',
  lightboxPrevLabel: 'Previous photo',
  lightboxNextLabel: 'Next photo',
  // Second pass (2026-10-05): the last hard-coded words on /style-gallery.
  introCtaLabel: 'Start your quote',
  fontCaption: '{font} font',
  filterGroupName: 'Filter gallery',
  filterFallbackHeading: 'Filters',
  moreTagsLabel: '+ {count} more',
  lessTagsLabel: 'Less',
}));

plan('clearancePage', `*[_id == "clearancePage"]`, () => ({ quantityLeftLabel: '{count} left' }));

plan('threadChartPage', `*[_id == "threadChartPage"]`, () => ({ filterLabel: 'Search colors' }));

plan('atelierSettings', `*[_id == "atelierSettings"]`, () => ({
  pauseLabel: 'Pause',
  playLabel: 'Play',
}));

plan('siteSettings', `*[_id == "siteSettings"]`, () => ({ menuContactLabel: 'At the bench' }));

// ── Collections ──────────────────────────────────────────────────────────────
// The badge only shows on a highlighted tier, so only those get one.
plan(
  'pricingTier (highlighted)',
  `*[_type == "pricingTier" && highlighted == true && !(_id in path("drafts.**"))]`,
  () => ({
    highlightLabel: 'Most popular',
  }),
);

plan('legalPage', `*[_type == "legalPage" && !(_id in path("drafts.**"))]`, () => ({
  lastUpdatedLabel: 'Last updated',
}));

plan('itemCategory', `*[_type == "itemCategory" && !(_id in path("drafts.**"))]`, (doc) => ({
  galleryHeading: `${doc.name} Gallery`,
  requestSimilarLabel: 'Request something like this',
  crossSellHeading: 'Explore Other Items',
}));

// Fonts: the closest live-preview style, by the font's own Style tag. Script
// fonts map to the Script preview; the circle monogram, the block font and the
// font named Classic map to Circle, Block and Classic Trio. Fonts with no
// close match (the "modern" ones, and Fishtail) are left blank: no link.
const FONT_STYLE_BY_ID = {
  'font-master-circle': 'circle',
  'font-ca-liberty': 'block',
  'font-classic': 'classic',
};
plan('font (atelierStyle)', `*[_type == "font" && !(_id in path("drafts.**"))]`, (doc) => {
  const key = FONT_STYLE_BY_ID[doc._id] ?? (doc.styleTag === 'script' ? 'script' : null);
  return key ? { atelierStyle: key } : {};
});

// ── Run ──────────────────────────────────────────────────────────────────────
let changes = 0;
// Same rule as setIfMissing: only an absent (or null) field counts as missing.
// An empty string Mary Ann left on purpose is respected.
const isEmpty = (v) => v === undefined || v === null;

for (const p of plans) {
  const docs = await client.fetch(`${p.query}{...}`);
  if (!docs.length) {
    console.log(`SKIP ${p.label}: no document found.`);
    continue;
  }
  for (const published of docs) {
    const wanted = p.fields(published);
    for (const id of [published._id, `drafts.${published._id}`]) {
      const doc = id === published._id ? published : await client.getDocument(id);
      if (!doc) continue; // no draft open: nothing to do
      const missing = Object.fromEntries(
        Object.entries(wanted).filter(([field]) => isEmpty(doc[field])),
      );
      const names = Object.keys(missing);
      if (!names.length) {
        console.log(
          `SKIP ${id}: ${Object.keys(wanted).length ? 'already set' : 'no field for it'}.`,
        );
        continue;
      }
      changes++;
      console.log(`${id}: ${JSON.stringify(missing)}`);
      // setIfMissing again at write time, so a concurrent edit cannot be clobbered.
      await apply(`${id}: setIfMissing ${names.join(', ')}`, () =>
        client.patch(id).setIfMissing(missing).commit(),
      );
    }
  }
}

console.log(APPLY ? '' : '(dry run: nothing was written)');
done(changes);
