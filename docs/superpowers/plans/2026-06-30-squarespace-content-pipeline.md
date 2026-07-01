# Squarespace Content & Image Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Source the ~80 real product photos, 9 font specimens, and 37 thread color names already catalogued from the live Squarespace site into Sanity, via a new idempotent import script, so the rebuilt MAS Monograms site stops rendering empty image placeholders.

**Architecture:** A pure, unit-testable helper module (`scripts/lib/imageImportHelpers.mjs`) handles deterministic ID generation and Sanity document shaping — no network calls, fully testable. A hand-built JSON manifest (`tmp/image-manifest.json`, gitignored, built by directly inspecting every source photo) is the single source of truth for what goes where. The main script (`scripts/import-squarespace-images.mjs`) reads the manifest, downloads each image, uploads it to Sanity, and upserts the target document — following the exact `createClient`/`loadEnv`/deterministic-`_id` pattern already established in `scripts/seed-core.mjs`.

**Tech Stack:** `@sanity/client` (already a dependency), Node's native `fetch` and `node:test`, the existing `scripts/lib/loadEnv.mjs` helper.

---

## Reference

Full design rationale: `docs/superpowers/specs/2026-06-30-squarespace-content-pipeline-design.md`.

All source image URLs, grouped by category, live in the appendix of `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md` (search that file for "Appendix: sourced image URLs"). Tasks below reference specific sections of that appendix rather than repeating ~80 URLs here.

Existing conventions this plan follows exactly:
- `scripts/seed-core.mjs` — `SANITY_API_WRITE_TOKEN` env var, `createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false })`, `client.createOrReplace()` with deterministic `_id`s for idempotency.
- `scripts/lib/loadEnv.mjs` — shared `.env` loader, already exists, do not modify.
- `itemCategory` documents already exist with `_id: category-${slug}` for these 8 slugs: `tote-bags`, `towels-linens`, `hats-caps`, `shirts-tops`, `jackets-sweatshirts`, `baby-kids`, `home-gifts`, `bring-your-own-item`.

---

### Task 1: Build the pure helper module with unit tests

**Files:**
- Create: `scripts/lib/imageImportHelpers.mjs`
- Create: `scripts/lib/imageImportHelpers.test.mjs`
- Modify: `package.json:25` (the `"test"` script)

This module has zero I/O — it only transforms plain data — so it's fully unit-testable following the existing `node --test` pattern used by `src/lib/*.test.ts`.

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/imageImportHelpers.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  galleryItemId,
  fontId,
  threadColorId,
  filenameFromUrl,
  buildGalleryItemDoc,
  buildFontDoc,
  buildThreadColorDoc,
  buildCategoryImagePatch,
} from './imageImportHelpers.mjs';

test('galleryItemId derives a deterministic id from a filename', () => {
  assert.equal(galleryItemId('monogram-32'), 'galleryItem-monogram-32');
  assert.equal(galleryItemId('Bunny Wreath Sash'), 'galleryItem-bunny-wreath-sash');
});

test('galleryItemId is stable across repeated calls (idempotency)', () => {
  assert.equal(galleryItemId('design-24'), galleryItemId('design-24'));
});

test('fontId derives a deterministic id from a font name', () => {
  assert.equal(fontId('Pillow'), 'font-pillow');
  assert.equal(fontId('CA Liberty'), 'font-ca-liberty');
});

test('threadColorId derives a deterministic id from a color name', () => {
  assert.equal(threadColorId('Navy'), 'threadColor-navy');
  assert.equal(threadColorId('Dusty Rose'), 'threadColor-dusty-rose');
});

test('filenameFromUrl extracts and decodes the basename', () => {
  assert.equal(
    filenameFromUrl('https://images.squarespace-cdn.com/content/v1/x/y/monogram-32.jpg'),
    'monogram-32.jpg',
  );
  assert.equal(
    filenameFromUrl('https://images.squarespace-cdn.com/content/69933a78/a7824a28/Pillow+%281%29.jpg?content-type=image%2Fjpeg'),
    'Pillow (1).jpg',
  );
});

test('buildGalleryItemDoc shapes a complete document with a category reference', () => {
  const doc = buildGalleryItemDoc({
    sourceUrl: 'https://images.squarespace-cdn.com/content/v1/x/y/monogram-32.jpg',
    alt: 'Navy block monogram on a white bath towel',
    caption: null,
    relatedCategorySlug: 'towels-linens',
    relatedFontSlug: null,
    tags: ['monogram', 'towel'],
    featured: false,
    displayOrder: 1,
  }, 'sanity-asset-id-abc123');

  assert.equal(doc._id, 'galleryItem-monogram-32');
  assert.equal(doc._type, 'galleryItem');
  assert.equal(doc.image.asset._ref, 'sanity-asset-id-abc123');
  assert.equal(doc.image.alt, 'Navy block monogram on a white bath towel');
  assert.equal(doc.relatedCategory._ref, 'category-towels-linens');
  assert.equal(doc.relatedFont, undefined);
  assert.deepEqual(doc.tags, ['monogram', 'towel']);
  assert.equal(doc.featured, false);
  assert.equal(doc.displayOrder, 1);
});

test('buildGalleryItemDoc omits relatedCategory/relatedFont when not provided', () => {
  const doc = buildGalleryItemDoc({
    sourceUrl: 'https://images.squarespace-cdn.com/content/v1/x/y/design-24.jpg',
    alt: 'Floral appliqué design on a canvas tote',
    caption: null,
    relatedCategorySlug: null,
    relatedFontSlug: null,
    tags: ['appliqué'],
    featured: true,
    displayOrder: 2,
  }, 'sanity-asset-id-xyz789');

  assert.equal('relatedCategory' in doc, false);
  assert.equal('relatedFont' in doc, false);
});

test('buildFontDoc shapes a complete font document', () => {
  const doc = buildFontDoc({
    sourceUrl: 'https://images.squarespace-cdn.com/content/69933a78/a7824a28/Pillow+%281%29.jpg',
    name: 'Pillow',
    styleTag: 'script',
    alt: 'Pillow font sample — embroidered in cursive script on white fabric',
    displayOrder: 1,
  }, 'sanity-asset-id-font1');

  assert.equal(doc._id, 'font-pillow');
  assert.equal(doc._type, 'font');
  assert.equal(doc.name, 'Pillow');
  assert.equal(doc.slug.current, 'pillow');
  assert.equal(doc.previewImage.asset._ref, 'sanity-asset-id-font1');
  assert.equal(doc.previewImage.alt, 'Pillow font sample — embroidered in cursive script on white fabric');
  assert.equal(doc.styleTag, 'script');
  assert.equal(doc.displayOrder, 1);
});

test('buildThreadColorDoc shapes a text-only document with no image fields', () => {
  const doc = buildThreadColorDoc({
    name: 'Navy',
    hexColor: '#1a2f4d',
    colorFamily: 'blue',
    dmcNumber: null,
    displayOrder: 1,
  });

  assert.equal(doc._id, 'threadColor-navy');
  assert.equal(doc._type, 'threadColor');
  assert.equal(doc.name, 'Navy');
  assert.equal(doc.slug.current, 'navy');
  assert.equal(doc.hexColor, '#1a2f4d');
  assert.equal(doc.colorFamily, 'blue');
  assert.equal('swatchImage' in doc, false);
  assert.equal('dmcNumber' in doc, false);
});

test('buildThreadColorDoc includes dmcNumber when provided', () => {
  const doc = buildThreadColorDoc({
    name: 'Hunter Green',
    hexColor: '#355e3b',
    colorFamily: 'green',
    dmcNumber: '3345',
    displayOrder: 5,
  });
  assert.equal(doc.dmcNumber, '3345');
});

test('buildCategoryImagePatch shapes a patch with cardImage and heroImages', () => {
  const patch = buildCategoryImagePatch({
    cardImageAssetId: 'sanity-asset-card1',
    cardAlt: 'Monogrammed white bath towel folded on a shelf',
    heroImages: [
      { assetId: 'sanity-asset-hero1', alt: 'Stack of monogrammed towels in navy and white' },
    ],
  });

  assert.equal(patch.cardImage.asset._ref, 'sanity-asset-card1');
  assert.equal(patch.cardImage.alt, 'Monogrammed white bath towel folded on a shelf');
  assert.equal(patch.heroImages.length, 1);
  assert.equal(patch.heroImages[0].asset._ref, 'sanity-asset-hero1');
  assert.equal(patch.heroImages[0].alt, 'Stack of monogrammed towels in navy and white');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --experimental-strip-types --test scripts/lib/imageImportHelpers.test.mjs`
Expected: FAIL — `Cannot find module './imageImportHelpers.mjs'` (the module doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/imageImportHelpers.mjs`:

```javascript
// scripts/lib/imageImportHelpers.mjs
//
// Pure, side-effect-free helpers for scripts/import-squarespace-images.mjs.
// No network calls, no Sanity client — everything here is a plain data
// transform, which is what makes it unit-testable without mocking anything.

/**
 * Slugify a string into a lowercase, hyphen-separated form suitable for
 * both Sanity slugs and deterministic document IDs.
 * @param {string} input
 * @returns {string}
 */
function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** @param {string} filenameOrName */
export function galleryItemId(filenameOrName) {
  return `galleryItem-${slugify(filenameOrName)}`;
}

/** @param {string} name */
export function fontId(name) {
  return `font-${slugify(name)}`;
}

/** @param {string} name */
export function threadColorId(name) {
  return `threadColor-${slugify(name)}`;
}

/**
 * Extract and URL-decode the basename (without extension-stripping) from a
 * Squarespace CDN URL, ignoring any query string.
 * @param {string} url
 * @returns {string}
 */
export function filenameFromUrl(url) {
  const withoutQuery = url.split('?')[0];
  const lastSegment = withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1);
  return decodeURIComponent(lastSegment.replace(/\+/g, ' '));
}

/**
 * @param {{
 *   sourceUrl: string,
 *   alt: string,
 *   caption: string | null,
 *   relatedCategorySlug: string | null,
 *   relatedFontSlug: string | null,
 *   tags: string[],
 *   featured: boolean,
 *   displayOrder: number,
 * }} entry
 * @param {string} assetId - the Sanity asset document _id from client.assets.upload()
 */
export function buildGalleryItemDoc(entry, assetId) {
  const filename = filenameFromUrl(entry.sourceUrl).replace(/\.[^.]+$/, '');
  const doc = {
    _id: galleryItemId(filename),
    _type: 'galleryItem',
    image: {
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
      alt: entry.alt,
    },
    tags: entry.tags,
    featured: entry.featured,
    displayOrder: entry.displayOrder,
  };
  if (entry.caption) doc.image.caption = entry.caption;
  if (entry.relatedCategorySlug) {
    doc.relatedCategory = { _type: 'reference', _ref: `category-${entry.relatedCategorySlug}` };
  }
  if (entry.relatedFontSlug) {
    doc.relatedFont = { _type: 'reference', _ref: fontId(entry.relatedFontSlug) };
  }
  return doc;
}

/**
 * @param {{ sourceUrl: string, name: string, styleTag: string, alt: string, displayOrder: number }} entry
 * @param {string} assetId
 */
export function buildFontDoc(entry, assetId) {
  return {
    _id: fontId(entry.name),
    _type: 'font',
    name: entry.name,
    slug: { _type: 'slug', current: slugify(entry.name) },
    previewImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
      alt: entry.alt,
    },
    styleTag: entry.styleTag,
    displayOrder: entry.displayOrder,
  };
}

/**
 * @param {{ name: string, hexColor: string, colorFamily: string, dmcNumber: string | null, displayOrder: number }} entry
 */
export function buildThreadColorDoc(entry) {
  const doc = {
    _id: threadColorId(entry.name),
    _type: 'threadColor',
    name: entry.name,
    slug: { _type: 'slug', current: slugify(entry.name) },
    hexColor: entry.hexColor,
    colorFamily: entry.colorFamily,
    displayOrder: entry.displayOrder,
  };
  if (entry.dmcNumber) doc.dmcNumber = entry.dmcNumber;
  return doc;
}

/**
 * @param {{
 *   cardImageAssetId: string,
 *   cardAlt: string,
 *   heroImages: { assetId: string, alt: string }[],
 * }} entry
 */
export function buildCategoryImagePatch(entry) {
  return {
    cardImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: entry.cardImageAssetId },
      alt: entry.cardAlt,
    },
    heroImages: entry.heroImages.map((h) => ({
      _type: 'image',
      asset: { _type: 'reference', _ref: h.assetId },
      alt: h.alt,
    })),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --experimental-strip-types --test scripts/lib/imageImportHelpers.test.mjs`
Expected: PASS — all 11 tests green.

- [ ] **Step 5: Wire this test file into the project's `npm test` script**

Change `package.json`'s `"test"` script from:
```json
    "test": "node --experimental-strip-types --test src/lib/*.test.ts",
```
to:
```json
    "test": "node --experimental-strip-types --test src/lib/*.test.ts scripts/lib/*.test.mjs",
```

- [ ] **Step 6: Run the full test suite to confirm nothing broke**

Run: `npm test`
Expected: PASS — the existing 82 tests plus these 11 new ones (93 total), 0 failures.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/imageImportHelpers.mjs scripts/lib/imageImportHelpers.test.mjs package.json
git commit -m "feat: add pure helper module for the Squarespace image import"
```

---

### Task 2: Build the manifest schema validator and main script skeleton

**Files:**
- Create: `scripts/import-squarespace-images.mjs`

This task builds the script's structure (env/client setup, manifest loading + validation, a `--dry-run` flag) without the actual upload logic yet — that's Task 9, once the manifest exists (Tasks 3-8) and can be validated against real data.

- [ ] **Step 1: Write the script skeleton**

Create `scripts/import-squarespace-images.mjs`:

```javascript
// scripts/import-squarespace-images.mjs
//
// Imports the Squarespace-sourced photos catalogued in tmp/image-manifest.json
// into Sanity: downloads each image, uploads it as a Sanity asset, and
// creates/patches the target document (galleryItem, font, itemCategory, or
// threadColor).
//
// Prerequisites:
//   - PUBLIC_SANITY_PROJECT_ID in .env
//   - SANITY_API_WRITE_TOKEN in .env (Editor permission or higher)
//   - tmp/image-manifest.json built by the manifest-authoring tasks in
//     docs/superpowers/plans/2026-06-30-squarespace-content-pipeline.md
//
// Idempotent: galleryItem/font/threadColor use deterministic _ids (see
// scripts/lib/imageImportHelpers.mjs) and client.createOrReplace(), so
// re-running after a partial failure is safe. itemCategory image patches use
// client.patch().set() on the existing category-${slug} document.
//
// Usage:
//   node scripts/import-squarespace-images.mjs --dry-run   # validate only, no writes
//   node scripts/import-squarespace-images.mjs             # actually import

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';
import {
  buildGalleryItemDoc,
  buildFontDoc,
  buildThreadColorDoc,
  buildCategoryImagePatch,
} from './lib/imageImportHelpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const manifestPath = resolve(root, 'tmp/image-manifest.json');
const dryRun = process.argv.includes('--dry-run');

const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error('PUBLIC_SANITY_PROJECT_ID is not set. Configure your .env and re-run.');
  process.exit(1);
}
if (!token) {
  console.error('SANITY_API_WRITE_TOKEN is not set. A write token is required to run this import.');
  process.exit(1);
}
if (!existsSync(manifestPath)) {
  console.error(`Manifest not found at ${manifestPath}. Build it first — see the plan doc.`);
  process.exit(1);
}

/** @typedef {{ sourceUrl: string, alt: string, caption: string|null, relatedCategorySlug: string|null, relatedFontSlug: string|null, tags: string[], featured: boolean, displayOrder: number }} GalleryManifestEntry */
/** @typedef {{ sourceUrl: string, name: string, styleTag: string, alt: string, displayOrder: number }} FontManifestEntry */
/** @typedef {{ name: string, slug: string, hexColor: string, colorFamily: string, dmcNumber: string|null, displayOrder: number }} ThreadColorManifestEntry */
/** @typedef {{ cardImageUrl: string, cardAlt: string, heroImageUrls: string[], heroAlts: string[] }} CategoryImageManifestEntry */
/**
 * @typedef {{
 *   galleryItems: GalleryManifestEntry[],
 *   fonts: FontManifestEntry[],
 *   categoryImages: Record<string, CategoryImageManifestEntry>,
 *   categoriesMissingPhotos: string[],
 *   threadColors: ThreadColorManifestEntry[],
 * }} Manifest
 */

/** @returns {Manifest} */
function loadManifest() {
  const raw = readFileSync(manifestPath, 'utf-8');
  /** @type {Manifest} */
  const manifest = JSON.parse(raw);
  const errors = [];

  for (const [i, entry] of manifest.galleryItems.entries()) {
    if (!entry.sourceUrl) errors.push(`galleryItems[${i}]: missing sourceUrl`);
    if (!entry.alt) errors.push(`galleryItems[${i}]: missing alt`);
    if (typeof entry.displayOrder !== 'number') errors.push(`galleryItems[${i}]: displayOrder must be a number`);
  }
  for (const [i, entry] of manifest.fonts.entries()) {
    if (!entry.sourceUrl) errors.push(`fonts[${i}]: missing sourceUrl`);
    if (!entry.name) errors.push(`fonts[${i}]: missing name`);
    if (!entry.alt) errors.push(`fonts[${i}]: missing alt`);
    const validStyles = ['classic', 'script', 'block', 'modern', 'monogram'];
    if (!validStyles.includes(entry.styleTag)) {
      errors.push(`fonts[${i}]: styleTag "${entry.styleTag}" not one of ${validStyles.join(', ')}`);
    }
  }
  for (const [slug, entry] of Object.entries(manifest.categoryImages)) {
    if (!entry.cardImageUrl) errors.push(`categoryImages.${slug}: missing cardImageUrl`);
    if (!entry.cardAlt) errors.push(`categoryImages.${slug}: missing cardAlt`);
    if (!Array.isArray(entry.heroImageUrls) || entry.heroImageUrls.length < 1) {
      errors.push(`categoryImages.${slug}: heroImageUrls must have at least 1 entry`);
    }
  }
  for (const [i, entry] of manifest.threadColors.entries()) {
    if (!entry.name) errors.push(`threadColors[${i}]: missing name`);
    if (!/^#[0-9A-Fa-f]{6}$/.test(entry.hexColor ?? '')) {
      errors.push(`threadColors[${i}]: hexColor "${entry.hexColor}" is not a valid #rrggbb value`);
    }
  }

  if (errors.length > 0) {
    console.error(`Manifest validation failed (${errors.length} issue(s)):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  return manifest;
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-05-01',
  useCdn: false,
});

async function main() {
  const manifest = loadManifest();
  const counts = {
    galleryItems: manifest.galleryItems.length,
    fonts: manifest.fonts.length,
    categoryImages: Object.keys(manifest.categoryImages).length,
    threadColors: manifest.threadColors.length,
  };
  console.log('Manifest loaded and validated:');
  console.log(`  galleryItems:    ${counts.galleryItems}`);
  console.log(`  fonts:           ${counts.fonts}`);
  console.log(`  categoryImages:  ${counts.categoryImages}`);
  console.log(`  threadColors:    ${counts.threadColors}`);
  if (manifest.categoriesMissingPhotos.length > 0) {
    console.log(`  categories missing photos (skipped, not an error): ${manifest.categoriesMissingPhotos.join(', ')}`);
  }

  if (dryRun) {
    console.log('\n--dry-run: validation passed, no writes performed.');
    return;
  }

  console.log('\n--dry-run not set, but upload/write logic is not implemented in this task yet.');
  console.log('This is expected at this stage of the plan — see Task 9.');
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify the skeleton runs and fails gracefully without a manifest**

Run: `node scripts/import-squarespace-images.mjs --dry-run`
Expected: exits with code 1 and prints `Manifest not found at .../tmp/image-manifest.json. Build it first — see the plan doc.` (since `tmp/image-manifest.json` doesn't exist yet — this is correct, expected behavior at this stage).

- [ ] **Step 3: Commit**

```bash
git add scripts/import-squarespace-images.mjs
git commit -m "feat: add import-squarespace-images.mjs skeleton (manifest loading + validation)"
```

---

### Task 3: Build the manifest — Style Gallery batch 1 (monograms)

**Files:**
- Create: `tmp/manifest-fragments/01-monograms.json` (gitignored, matches `tmp/`'s existing status)

- [ ] **Step 1: Confirm `tmp/` is gitignored**

Run: `git check-ignore -q tmp && echo "ignored" || echo "NOT ignored"`
Expected: `ignored` (the existing `tmp/content.ndjson` pattern already relies on this). If it prints `NOT ignored`, add `tmp/` to `.gitignore` before proceeding, since this task is about to write ~90 downloaded images' worth of scratch data there.

- [ ] **Step 2: Fetch and inspect every image in the "Monograms" section**

Open `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md` and find the "Appendix: sourced image URLs" section, "Monograms (style gallery, ~21)" list (21 URLs, `monogram-24.jpg` through `monogram-44.jpg`, plus one duplicate-looking `monogram-32.jpg`/`monogram-35.jpg` already referenced elsewhere in that doc — use the full 21-URL list under that heading as the authoritative source).

For each URL: fetch the image and actually look at it. Determine:
- **Item type**: what physical item is shown (bath towel, hand towel, tote bag, hat, onesie, blanket, burp cloth, sweatshirt, polo, etc.)? If genuinely unclear, use your best judgment and note the uncertainty in a `"qualityNotes"` field rather than guessing silently.
- **Alt text**: one specific sentence, e.g. "Three-letter navy block monogram on a white waffle-weave bath towel" — not "Embroidered towel" or "Monogram design 32."
- **Category fit**: does this image clearly belong to one of these 7 photographable categories — `tote-bags`, `towels-linens`, `hats-caps`, `shirts-tops`, `jackets-sweatshirts`, `baby-kids`, `home-gifts`? Only assign `relatedCategorySlug` if genuinely confident; leave `null` otherwise (it still belongs in the general Style Gallery either way).
- **Tags**: 1-3 short lowercase tags, e.g. `["monogram", "block", "towel"]`.

- [ ] **Step 3: Write the fragment file**

Create `tmp/manifest-fragments/01-monograms.json` with this exact shape (fill in real values from Step 2 — this example shows the structure with 2 sample entries, produce all 21):

```json
{
  "galleryItems": [
    {
      "sourceUrl": "https://images.squarespace-cdn.com/content/v1/69933a78a7a73e7be295c7e1/8dc256a4-12bd-4642-b885-bf3170b8bd96/monogram-24.jpg",
      "alt": "REPLACE: specific description based on what you actually see",
      "caption": null,
      "relatedCategorySlug": "REPLACE: one of the 7 slugs, or null",
      "relatedFontSlug": null,
      "tags": ["REPLACE"],
      "featured": false,
      "displayOrder": 1,
      "qualityNotes": null
    }
  ]
}
```

`displayOrder` should increment sequentially within this fragment (1, 2, 3, ... 21) — the merge task will renumber globally, but keep it internally consistent here. Leave `relatedFontSlug` as `null` for all entries in this batch (font-matching isn't part of this pass). Set `featured: true` for at most 2-3 of the strongest, most representative photos in this batch; `false` for the rest.

- [ ] **Step 4: Verify the fragment is valid JSON with 21 entries**

Run: `node -e "const d = JSON.parse(require('fs').readFileSync('tmp/manifest-fragments/01-monograms.json', 'utf8')); console.log('entries:', d.galleryItems.length); if (d.galleryItems.length !== 21) process.exit(1);"`
Expected: prints `entries: 21` and exits 0.

- [ ] **Step 5: Commit the fragment is NOT required** (it's in `tmp/`, gitignored) — no commit step for this task. Report completion by confirming Step 4's output.

---

### Task 4: Build the manifest — Style Gallery batch 2 (designs)

**Files:**
- Create: `tmp/manifest-fragments/02-designs.json`

Identical process to Task 3, but for the "Designs (style gallery, ~21)" URL list in the same appendix (21 URLs, `design-24.jpg` through `design-44.jpg`). These are described in the design spec as "mixed embroidery designs" — expect more appliqué/decorative work and less pure lettering than the monogram batch; item-type identification still applies the same way.

- [ ] **Step 1: Fetch and inspect all 21 URLs in the "Designs" list**, following the same item-type/alt-text/category-fit/tags process as Task 3, Step 2.
- [ ] **Step 2: Write `tmp/manifest-fragments/02-designs.json`** in the same `{"galleryItems": [...]}` shape as Task 3, `displayOrder` 1-21 within this fragment.
- [ ] **Step 3: Verify**: `node -e "const d = JSON.parse(require('fs').readFileSync('tmp/manifest-fragments/02-designs.json', 'utf8')); console.log('entries:', d.galleryItems.length); if (d.galleryItems.length !== 21) process.exit(1);"` — expect `entries: 21`.

---

### Task 5: Build the manifest — Style Gallery batch 3 (logos, pets, wall hangings, appliqué, key fobs, heat transfer vinyl)

**Files:**
- Create: `tmp/manifest-fragments/03-misc-technique.json`

Same process, covering these appendix sections in one fragment (smaller sections, batched together): "Logos / business embroidery (8)", "Pets (3)", "Wall hangings (2)", "Appliqué (2)", "Key fobs (2)", "Heat transfer vinyl (2)" — 19 URLs total.

- [ ] **Step 1: Fetch and inspect all 19 URLs**, same process as Task 3 Step 2. Logos will typically map to `home-gifts` or stay uncategorized (business/team logos aren't really a shop category by item type — use `null` for `relatedCategorySlug` unless the photo clearly shows a specific wearable item, in which case categorize by THAT item, not "logo").
- [ ] **Step 2: Write `tmp/manifest-fragments/03-misc-technique.json`**, same shape, `displayOrder` 1-19 within this fragment.
- [ ] **Step 3: Verify**: same pattern as Task 3 Step 4, expect `entries: 19`.

---

### Task 6: Build the manifest — Style Gallery batch 4 (seasonal, greeting card, customer photos)

**Files:**
- Create: `tmp/manifest-fragments/04-seasonal-customer.json`

Covers "Seasonal / wreath / holiday (4)", "Greeting card (1)", "Raw customer-order phone photos (4)" — 9 URLs total. Per Nate's explicit decision, the raw customer photos ARE included (not excluded for being unpolished) — write honest, accurate alt text for them same as any other photo (e.g. "Camouflage jacket with an embroidered name over the left collar" rather than commenting on photo quality in the alt text itself; a photo-quality note belongs in `qualityNotes`, not `alt`).

- [ ] **Step 1: Fetch and inspect all 9 URLs**, same process.
- [ ] **Step 2: Write `tmp/manifest-fragments/04-seasonal-customer.json`**, same shape, `displayOrder` 1-9.
- [ ] **Step 3: Verify**: expect `entries: 9`.

---

### Task 7: Build the manifest — font specimens

**Files:**
- Create: `tmp/manifest-fragments/05-fonts.json`

- [ ] **Step 1: Fetch and inspect the 8 individual font specimen URLs** from the appendix's "Font/lettering specimens (9 — note different CDN path...)" section — use only the 8 that are named individual fonts (Pillow, Master Circle, Vine Heirloom, Golden Valley, Fishtail, Curlz, Classic, CA Liberty). Skip the "10 Popular" collage image (`10+Popular+%281%29.jpg`) — it shows multiple fonts in one image and doesn't map to a single `font` document; note this exclusion in your report but don't create a document for it.

For each of the 8: look at the actual lettering style shown and classify `styleTag` as one of `classic` / `script` / `block` / `modern` / `monogram` based on what the letterforms actually look like (not the font's name alone — e.g. "Classic" the font name doesn't necessarily mean `styleTag: "classic"` if it visually reads as a script). Write alt text describing the lettering style and what it's stitched on, e.g. "Pillow font sample — soft rounded script letters embroidered on white fabric."

- [ ] **Step 2: Write `tmp/manifest-fragments/05-fonts.json`**:

```json
{
  "fonts": [
    {
      "sourceUrl": "https://images.squarespace-cdn.com/content/69933a78a7a73e7be295c7e1/a7824a28-c9e9-413f-bbd7-9e5a523fb4fe/Pillow+%281%29.jpg?content-type=image%2Fjpeg",
      "name": "Pillow",
      "styleTag": "REPLACE: classic|script|block|modern|monogram based on what you see",
      "alt": "REPLACE: specific description of the lettering style",
      "displayOrder": 1
    }
  ]
}
```

Produce all 8 entries, `displayOrder` 1-8.

- [ ] **Step 3: Verify**: `node -e "const d = JSON.parse(require('fs').readFileSync('tmp/manifest-fragments/05-fonts.json', 'utf8')); console.log('entries:', d.fonts.length); if (d.fonts.length !== 8) process.exit(1);"` — expect `entries: 8`.

---

### Task 8: Build the manifest — category images, thread colors, and final merge

**Files:**
- Create: `tmp/manifest-fragments/06-categories.json`
- Create: `scripts/merge-manifest-fragments.mjs`
- Create: `tmp/image-manifest.json` (generated by the script, not hand-written)

- [ ] **Step 1: Match category hero/card images from the already-inspected photo pool**

Read back through all four `tmp/manifest-fragments/0{1,2,3,4}-*.json` files you produced in Tasks 3-6. For each of these 7 photographable categories — `tote-bags`, `towels-linens`, `hats-caps`, `shirts-tops`, `jackets-sweatshirts`, `baby-kids`, `home-gifts` — find the strongest-fitting photo(s) already identified with that `relatedCategorySlug` (or, if none was tagged with that exact slug but you recall a clear fit from your inspection notes, use it). A category needs:
- One `cardImageUrl` (the single best representative photo for the grid thumbnail)
- 1-4 `heroImageUrls` (can reuse the card image as the sole hero image if only one good photo exists for that category — that's fine, don't force additional weaker photos in just to hit a higher count)

If a category genuinely has no clearly-fitting photo anywhere in the four fragments, do NOT force a mismatched photo into it — add that category's slug to a `categoriesMissingPhotos` array instead.

- [ ] **Step 2: Write `tmp/manifest-fragments/06-categories.json`**:

```json
{
  "categoryImages": {
    "towels-linens": {
      "cardImageUrl": "REPLACE: URL of the best towels-linens photo",
      "cardAlt": "REPLACE",
      "heroImageUrls": ["REPLACE: 1-4 URLs"],
      "heroAlts": ["REPLACE: one alt per hero URL, same order"]
    }
  },
  "categoriesMissingPhotos": ["REPLACE: any of the 7 slugs with no fitting photo"],
  "threadColors": [
    { "name": "Bright White", "hexColor": "#fefefe", "colorFamily": "white", "dmcNumber": null, "displayOrder": 1 }
  ]
}
```

For `threadColors`: populate all 37 names from `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`'s "Appendix: copy/content notes" section ("Thread color names (8 families, ~37 colors)"), grouped into the 8 `colorFamily` values the `threadColor` schema defines (`blue`, `green`, `red`, `orange`, `purple`, `brown`, `gray`, `white`, `metallic` — the design spec's "golds/yellows" maps to `orange` per the schema's actual option list, not a literal name match; check `studio/schemaTypes/threadColor.ts` if unsure which `colorFamily` value to use for a given name). Assign each a reasonable approximate hex value for a thread of that name (e.g. "Navy" → a navy blue hex, "Blush Pink" → a blush pink hex) — these are display approximations, not exact DMC matches, since no source swatch photography exists. `displayOrder` increments within each family grouping, matching the schema's own "family, then order" default sort.

- [ ] **Step 3: Write the merge script**

Create `scripts/merge-manifest-fragments.mjs`:

```javascript
// scripts/merge-manifest-fragments.mjs
//
// Merges tmp/manifest-fragments/*.json into the single tmp/image-manifest.json
// that scripts/import-squarespace-images.mjs consumes. Renumbers displayOrder
// globally within each collection (galleryItems, fonts, threadColors) so
// per-fragment numbering (which only needed to be locally sequential) becomes
// one consistent site-wide order.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const fragmentsDir = resolve(root, 'tmp/manifest-fragments');
const outPath = resolve(root, 'tmp/image-manifest.json');

const fragmentFiles = readdirSync(fragmentsDir).filter((f) => f.endsWith('.json')).sort();

const merged = {
  galleryItems: [],
  fonts: [],
  categoryImages: {},
  categoriesMissingPhotos: [],
  threadColors: [],
};

for (const file of fragmentFiles) {
  const fragment = JSON.parse(readFileSync(resolve(fragmentsDir, file), 'utf-8'));
  if (fragment.galleryItems) merged.galleryItems.push(...fragment.galleryItems);
  if (fragment.fonts) merged.fonts.push(...fragment.fonts);
  if (fragment.threadColors) merged.threadColors.push(...fragment.threadColors);
  if (fragment.categoryImages) Object.assign(merged.categoryImages, fragment.categoryImages);
  if (fragment.categoriesMissingPhotos) merged.categoriesMissingPhotos.push(...fragment.categoriesMissingPhotos);
  console.log(`Merged ${file}`);
}

merged.galleryItems.forEach((item, i) => { item.displayOrder = i + 1; });
merged.fonts.forEach((item, i) => { item.displayOrder = i + 1; });
merged.threadColors.forEach((item, i) => { item.displayOrder = i + 1; });

writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf-8');
console.log(`\nWrote ${outPath}`);
console.log(`  galleryItems:   ${merged.galleryItems.length}`);
console.log(`  fonts:          ${merged.fonts.length}`);
console.log(`  categoryImages: ${Object.keys(merged.categoryImages).length}`);
console.log(`  threadColors:   ${merged.threadColors.length}`);
if (merged.categoriesMissingPhotos.length) {
  console.log(`  categories missing photos: ${merged.categoriesMissingPhotos.join(', ')}`);
}
```

- [ ] **Step 4: Run the merge**

Run: `node scripts/merge-manifest-fragments.mjs`
Expected: prints merge progress for all 6 fragment files, then a summary. `galleryItems` should total 21+21+19+9 = 70, `fonts` should be 8, `threadColors` should be 37.

- [ ] **Step 5: Validate the merged manifest against the import script's own validator**

Run: `node scripts/import-squarespace-images.mjs --dry-run`
Expected: passes validation (prints the same counts as Step 4) and exits 0 with "validation passed, no writes performed." If it reports validation errors, fix the specific fragment file(s) named in the error output and re-run Step 4 then this step again.

- [ ] **Step 6: Commit the two new scripts (not the generated manifest/fragments — those stay in gitignored `tmp/`)**

```bash
git add scripts/merge-manifest-fragments.mjs
git commit -m "feat: add manifest fragment merge script"
```

---

### Task 9: Implement the actual upload/upsert logic

**Files:**
- Modify: `scripts/import-squarespace-images.mjs`

- [ ] **Step 1: Replace the placeholder ending of `main()` with real upload logic**

In `scripts/import-squarespace-images.mjs`, change:

```javascript
  if (dryRun) {
    console.log('\n--dry-run: validation passed, no writes performed.');
    return;
  }

  console.log('\n--dry-run not set, but upload/write logic is not implemented in this task yet.');
  console.log('This is expected at this stage of the plan — see Task 9.');
}
```

to:

```javascript
  if (dryRun) {
    console.log('\n--dry-run: validation passed, no writes performed.');
    return;
  }

  console.log('\nUploading images and writing documents...\n');

  let uploaded = 0;
  let skipped = 0;

  async function uploadImage(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = url.split('/').pop().split('?')[0];
    const asset = await client.assets.upload('image', buffer, { filename });
    return asset._id;
  }

  for (const entry of manifest.galleryItems) {
    const assetId = await uploadImage(entry.sourceUrl);
    const doc = buildGalleryItemDoc(entry, assetId);
    await client.createOrReplace(doc);
    uploaded += 1;
    console.log(`  galleryItem: ${doc._id}`);
  }

  for (const entry of manifest.fonts) {
    const assetId = await uploadImage(entry.sourceUrl);
    const doc = buildFontDoc(entry, assetId);
    await client.createOrReplace(doc);
    uploaded += 1;
    console.log(`  font: ${doc._id}`);
  }

  for (const entry of manifest.threadColors) {
    const doc = buildThreadColorDoc(entry);
    await client.createOrReplace(doc);
    uploaded += 1;
    console.log(`  threadColor: ${doc._id}`);
  }

  for (const [slug, entry] of Object.entries(manifest.categoryImages)) {
    const cardImageAssetId = await uploadImage(entry.cardImageUrl);
    const heroImages = [];
    for (let i = 0; i < entry.heroImageUrls.length; i++) {
      const assetId = await uploadImage(entry.heroImageUrls[i]);
      heroImages.push({ assetId, alt: entry.heroAlts[i] });
    }
    const patch = buildCategoryImagePatch({ cardImageAssetId, cardAlt: entry.cardAlt, heroImages });
    await client.patch(`category-${slug}`).set(patch).commit();
    uploaded += 1;
    console.log(`  itemCategory patched: category-${slug}`);
  }

  if (manifest.categoriesMissingPhotos.length > 0) {
    skipped = manifest.categoriesMissingPhotos.length;
    console.log(`\nSkipped (no fitting photo found): ${manifest.categoriesMissingPhotos.join(', ')}`);
  }

  console.log(`\nDone. ${uploaded} document(s) created/updated, ${skipped} category/categories intentionally skipped.`);
}
```

- [ ] **Step 2: Verify the build still succeeds (this script isn't part of the Astro build, but confirm no syntax errors)**

Run: `node --check scripts/import-squarespace-images.mjs`
Expected: no output, exit code 0 (Node's syntax checker passes).

- [ ] **Step 3: Commit**

```bash
git add scripts/import-squarespace-images.mjs
git commit -m "feat: implement upload/upsert logic in import-squarespace-images.mjs"
```

---

### Task 10: Run the import and verify

**Files:** none (execution + verification only)

- [ ] **Step 1: Final dry-run check**

Run: `node scripts/import-squarespace-images.mjs --dry-run`
Expected: passes validation with the same counts as Task 8 Step 4.

- [ ] **Step 2: Run the real import**

Run: `node scripts/import-squarespace-images.mjs`
Expected: succeeds, printing one line per document created/patched, ending with a `Done. N document(s) created/updated, M category/categories intentionally skipped.` summary. If any individual upload/write fails partway through (e.g. a permissions error, a 404 on a source URL that's gone stale), the script exits non-zero at that point — note exactly which entry failed and why; do NOT delete or hand-edit the manifest to route around a failure without understanding it first. The script is safe to re-run after fixing the underlying issue (createOrReplace/patch are both idempotent).

- [ ] **Step 3: Verify in Sanity via a query**

Run: `node -e "
import('@sanity/client').then(async ({ createClient }) => {
  const { loadEnv } = await import('./scripts/lib/loadEnv.mjs');
  const env = loadEnv(process.cwd());
  const client = createClient({
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET ?? 'production',
    token: env.SANITY_API_WRITE_TOKEN,
    apiVersion: '2026-05-01',
    useCdn: false,
  });
  const counts = await client.fetch('{\"galleryItems\": count(*[_type==\"galleryItem\"]), \"fonts\": count(*[_type==\"font\"]), \"threadColors\": count(*[_type==\"threadColor\"]), \"categoriesWithCard\": count(*[_type==\"itemCategory\" && defined(cardImage)])}');
  console.log(counts);
});
"`

Expected: `galleryItems: 70`, `fonts: 8`, `threadColors: 37`, `categoriesWithCard` equal to `7 - categoriesMissingPhotos.length` from the manifest.

- [ ] **Step 4: Full site build to confirm the new content renders without errors**

Run: `npm run build:full`
Expected: succeeds. This is the real end-to-end check — Style Gallery, Font Guide, Thread Color Chart, and the shop category pages now pull real Sanity data instead of empty placeholders.

- [ ] **Step 5: Report final counts and any skipped categories back**

No commit needed for this task (it's execution/verification, not a code change) — the report should state the exact final counts from Step 3, list any `categoriesMissingPhotos`, and note any fonts/photos that were deliberately excluded (the "10 Popular" collage from Task 7, the ~10 font names with no specimen photo).

---

## What this plan does NOT cover (intentionally)

- Reshooting, retouching, cropping, or color-correcting any photo.
- The owner portrait photo (About page content).
- Redesigning `Hero.astro`, `index.astro`, or `[slug].astro`'s rendering of this newly-populated image data — that's the page-by-page plan's job, once this plan gives it real data to work with.
- The ~10 font names with no photographed specimen (`previewImage` is a required field on the `font` schema — those names stay untracked until real specimen photos exist).
- `threadColor.swatchImage` — left empty for all 37 colors; the schema's hex-chip fallback covers this pass.
