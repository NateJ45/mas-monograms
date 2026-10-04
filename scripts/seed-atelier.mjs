// scripts/seed-atelier.mjs
//
// Seeds the content behind the 2026-10-04 "Atelier" redesign:
//
//   1. Creates the new `atelierSettings` singleton (id `atelierSettings`) with
//      createIfNotExists, so a re-run NEVER overwrites words Mary Ann has since
//      edited in the Studio.
//   2. Fills the new optional `homePage` fields with setIfMissing, so no existing
//      authored value is ever touched, and a re-run changes nothing.
//
// If a `drafts.homePage` exists (Mary Ann mid-edit), the same missing-only patch
// is applied to the draft too, so publishing her draft cannot erase the new copy.
//
// Dry-run is the default (sanity-lib gate). `--dry-run` is accepted and is a no-op
// flag for clarity; `--apply` actually writes.
//
//   node scripts/seed-atelier.mjs            # dry run, prints every write
//   node scripts/seed-atelier.mjs --dry-run  # same
//   node scripts/seed-atelier.mjs --apply    # write
//
// Needs PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env (bare token,
// no quotes). NEVER run scripts/seed-core.mjs.
//
// Copy rules: first person as Mary Ann where the site already speaks as her,
// short warm sentences, nothing invented (no years, clients, reviews, awards).

import { client, apply, done, APPLY } from './lib/sanity-lib.mjs';

// ── atelierSettings ──────────────────────────────────────────────────────────
const atelierSettings = {
  _id: 'atelierSettings',
  _type: 'atelierSettings',
  eyebrow: 'The monogram studio',
  headline: 'Watch your monogram being stitched.',
  subhead:
    'Type your initials, choose a style, a thread and a cloth, and watch them sew themselves. When you love it, send it to me as a quote request.',
  initialsLabel: 'Your initials',
  initialsHint: 'One to three letters.',
  styleLabel: 'Style',
  threadLabel: 'Thread color',
  fabricLabel: 'Fabric',
  styles: [
    {
      _key: 'style-classic',
      _type: 'atelierStyle',
      key: 'classic',
      label: 'Classic Trio',
      blurb: 'Three letters with the middle one larger. The traditional monogram.',
    },
    {
      _key: 'style-script',
      _type: 'atelierStyle',
      key: 'script',
      label: 'Script',
      blurb: 'Flowing, joined-up letters with a handwritten feel.',
    },
    {
      _key: 'style-block',
      _type: 'atelierStyle',
      key: 'block',
      label: 'Block',
      blurb: 'Clean, upright capitals that read clearly at a glance.',
    },
    {
      _key: 'style-circle',
      _type: 'atelierStyle',
      key: 'circle',
      label: 'Circle',
      blurb: 'Your letters set in a round, badge-like arrangement.',
    },
    {
      _key: 'style-single',
      _type: 'atelierStyle',
      key: 'single',
      label: 'Single Letter',
      blurb: 'One initial, stitched large. Simple and bold.',
    },
  ],
  fabrics: [
    {
      _key: 'fabric-natural-linen',
      _type: 'atelierFabric',
      key: 'natural-linen',
      label: 'Natural Linen',
      color: '#e8dcc8',
      note: 'Warm and a little rustic. Lovely for towels and napkins.',
    },
    {
      _key: 'fabric-white-cotton',
      _type: 'atelierFabric',
      key: 'white-cotton',
      label: 'White Cotton',
      color: '#f7f5f0',
      note: 'Crisp and bright. Every thread color shows true.',
    },
    {
      _key: 'fabric-ivory',
      _type: 'atelierFabric',
      key: 'ivory',
      label: 'Ivory',
      color: '#f2ead3',
      note: 'A soft cream that feels classic and gentle.',
    },
    {
      _key: 'fabric-blush',
      _type: 'atelierFabric',
      key: 'blush',
      label: 'Blush',
      color: '#efd3d0',
      note: 'A pale pink that suits baby gifts and keepsakes.',
    },
    {
      _key: 'fabric-sage',
      _type: 'atelierFabric',
      key: 'sage',
      label: 'Sage',
      color: '#b9c4b0',
      note: 'A quiet gray-green. Pairs well with cream or gold thread.',
    },
    {
      _key: 'fabric-denim-blue',
      _type: 'atelierFabric',
      key: 'denim-blue',
      label: 'Denim Blue',
      color: '#5b7ea3',
      note: 'A relaxed everyday blue. Light threads stand out nicely.',
    },
    {
      _key: 'fabric-navy-canvas',
      _type: 'atelierFabric',
      key: 'navy-canvas',
      label: 'Navy Canvas',
      color: '#1f3150',
      note: 'Deep and sturdy. Pale and gold threads glow on it.',
    },
    {
      _key: 'fabric-charcoal',
      _type: 'atelierFabric',
      key: 'charcoal',
      label: 'Charcoal',
      color: '#3d4047',
      note: 'A soft black. Bright and metallic threads pop.',
    },
  ],
  sampleMonograms: ['MAS', 'ABC', 'JRM', 'KLW', 'EBT', 'HGP', 'CLM', 'SDW', 'TNB'],
  replayLabel: 'Stitch it again',
  ctaLabel: 'Request this monogram',
  disclaimer:
    'This is an illustration to help you picture it. Real thread and cloth look a little different, and I confirm the lettering and colors with you in a proof before I stitch anything.',
  heroTryLabel: 'Try your own initials',
  heroPlaceholder: 'MAS',
};

// ── New homePage fields (missing-only) ───────────────────────────────────────
const homePageNew = {
  marqueeEyebrow: 'Stitched on',
  categoriesNote: 'Already have a favorite piece? Bring it to me. Most fabric items work.',
  makerQuote: 'Every order comes straight to me, and I stitch it myself.',
  makerSignature: 'Mary Ann',
  makerFacts: [
    'A home studio in St. Matthews, SC',
    'Every piece stitched by hand, locally',
    'Your message goes straight to me',
    'You approve the price before I stitch',
  ],
  wallEyebrow: 'From the studio',
  wallHeadline: 'Recent work, pinned up',
  wallSubhead:
    'A few pieces I have stitched. Tell me your vibe and we will choose the font and thread together.',
  wallCtaLabel: 'See the whole gallery',
  finalEyebrow: "Let's begin",
  finalHeadline: "Let's stitch something that is yours.",
  finalSubhead:
    'Requesting a quote is free and takes about 2 minutes. I will reply within 1 business day.',
  finalCtaLabel: 'Request a Free Quote',
  finalCtaHref: '/request-a-quote',
};

// ── Run ──────────────────────────────────────────────────────────────────────
let changes = 0;

// 1. atelierSettings (published). Never overwrite an existing one.
const existingAtelier = await client.fetch(
  `*[_id in ["atelierSettings","drafts.atelierSettings"]]{_id}`,
);
if (existingAtelier.length) {
  console.log(
    `SKIP atelierSettings: already exists (${existingAtelier.map((d) => d._id).join(', ')}); not overwriting.`,
  );
} else {
  changes++;
  console.log(JSON.stringify(atelierSettings, null, 2));
  await apply('create atelierSettings (createIfNotExists)', () =>
    client.createIfNotExists(atelierSettings),
  );
}

// 2. homePage: published + draft (if any), missing fields only.
for (const id of ['homePage', 'drafts.homePage']) {
  const doc = await client.getDocument(id);
  if (!doc) {
    console.log(`SKIP ${id}: does not exist.`);
    continue;
  }
  const missing = Object.fromEntries(
    Object.entries(homePageNew).filter(
      ([field]) => doc[field] === undefined || doc[field] === null,
    ),
  );
  const names = Object.keys(missing);
  if (!names.length) {
    console.log(`SKIP ${id}: all new fields already present.`);
    continue;
  }
  changes++;
  console.log(`${id}: would set ${names.length} field(s): ${names.join(', ')}`);
  console.log(JSON.stringify(missing, null, 2));
  // setIfMissing again at write time, so a concurrent edit cannot be clobbered.
  await apply(`${id}: setIfMissing ${names.length} new field(s)`, () =>
    client.patch(id).setIfMissing(missing).commit(),
  );
}

console.log(APPLY ? '' : '(dry run: nothing was written)');
done(changes);
