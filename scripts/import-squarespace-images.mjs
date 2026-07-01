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
// Note: image uploads themselves are NOT deduped on retry — re-running after
// a partial failure re-uploads already-succeeded images as new Sanity assets
// (the old assets become orphaned, not auto-deleted). Document writes stay
// correct either way since they're idempotent, but a retry after a late
// failure will leave some duplicate assets in the dataset. Acceptable for
// this one-time migration script; not worth an existence-check for a script
// run 0-2 times.
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
  galleryItemId,
  fontId,
  threadColorId,
  filenameFromUrl,
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

  const seenGalleryIds = new Set();
  for (const [i, entry] of manifest.galleryItems.entries()) {
    if (!entry.sourceUrl) errors.push(`galleryItems[${i}]: missing sourceUrl`);
    if (!entry.alt) errors.push(`galleryItems[${i}]: missing alt`);
    if (typeof entry.displayOrder !== 'number') errors.push(`galleryItems[${i}]: displayOrder must be a number`);
    if (entry.sourceUrl) {
      const filename = filenameFromUrl(entry.sourceUrl).replace(/\.[^.]+$/, '');
      const id = galleryItemId(filename);
      if (id === 'galleryItem-') {
        errors.push(`galleryItems[${i}]: sourceUrl "${entry.sourceUrl}" slugifies to an empty id — filename has no alphanumeric characters`);
      } else if (seenGalleryIds.has(id)) {
        errors.push(`galleryItems[${i}]: duplicate derived id "${id}" — another entry already slugifies to this same id, which would silently overwrite it via createOrReplace`);
      } else {
        seenGalleryIds.add(id);
      }
    }
  }

  const seenFontIds = new Set();
  for (const [i, entry] of manifest.fonts.entries()) {
    if (!entry.sourceUrl) errors.push(`fonts[${i}]: missing sourceUrl`);
    if (!entry.name) errors.push(`fonts[${i}]: missing name`);
    if (!entry.alt) errors.push(`fonts[${i}]: missing alt`);
    const validStyles = ['classic', 'script', 'block', 'modern', 'monogram'];
    if (!validStyles.includes(entry.styleTag)) {
      errors.push(`fonts[${i}]: styleTag "${entry.styleTag}" not one of ${validStyles.join(', ')}`);
    }
    if (entry.name) {
      const id = fontId(entry.name);
      if (id === 'font-') {
        errors.push(`fonts[${i}]: name "${entry.name}" slugifies to an empty id`);
      } else if (seenFontIds.has(id)) {
        errors.push(`fonts[${i}]: duplicate derived id "${id}"`);
      } else {
        seenFontIds.add(id);
      }
    }
  }

  for (const [slug, entry] of Object.entries(manifest.categoryImages)) {
    if (!entry.cardImageUrl) errors.push(`categoryImages.${slug}: missing cardImageUrl`);
    if (!entry.cardAlt) errors.push(`categoryImages.${slug}: missing cardAlt`);
    if (!Array.isArray(entry.heroImageUrls) || entry.heroImageUrls.length < 1) {
      errors.push(`categoryImages.${slug}: heroImageUrls must have at least 1 entry`);
    }
    if (!Array.isArray(entry.heroAlts) || entry.heroAlts.length !== (entry.heroImageUrls ?? []).length) {
      errors.push(`categoryImages.${slug}: heroAlts must have exactly one entry per heroImageUrls entry`);
    }
  }

  const seenThreadIds = new Set();
  for (const [i, entry] of manifest.threadColors.entries()) {
    if (!entry.name) errors.push(`threadColors[${i}]: missing name`);
    if (!/^#[0-9A-Fa-f]{6}$/.test(entry.hexColor ?? '')) {
      errors.push(`threadColors[${i}]: hexColor "${entry.hexColor}" is not a valid #rrggbb value`);
    }
    if (entry.name) {
      const id = threadColorId(entry.name);
      if (id === 'threadColor-') {
        errors.push(`threadColors[${i}]: name "${entry.name}" slugifies to an empty id`);
      } else if (seenThreadIds.has(id)) {
        errors.push(`threadColors[${i}]: duplicate derived id "${id}"`);
      } else {
        seenThreadIds.add(id);
      }
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

  console.log('\nUploading images and writing documents...\n');

  let uploaded = 0;
  let skipped = 0;

  async function uploadImage(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = filenameFromUrl(url);
    const asset = await client.assets.upload('image', buffer, { filename });
    return asset._id;
  }

  for (const [i, entry] of manifest.galleryItems.entries()) {
    try {
      const assetId = await uploadImage(entry.sourceUrl);
      const doc = buildGalleryItemDoc(entry, assetId);
      await client.createOrReplace(doc);
      uploaded += 1;
      console.log(`  galleryItem: ${doc._id}`);
    } catch (err) {
      throw new Error(`Failed on galleryItems[${i}] (sourceUrl: ${entry.sourceUrl}): ${err.message}`);
    }
  }

  for (const [i, entry] of manifest.fonts.entries()) {
    try {
      const assetId = await uploadImage(entry.sourceUrl);
      const doc = buildFontDoc(entry, assetId);
      await client.createOrReplace(doc);
      uploaded += 1;
      console.log(`  font: ${doc._id}`);
    } catch (err) {
      throw new Error(`Failed on fonts[${i}] (name: ${entry.name}, sourceUrl: ${entry.sourceUrl}): ${err.message}`);
    }
  }

  for (const [i, entry] of manifest.threadColors.entries()) {
    try {
      const doc = buildThreadColorDoc(entry);
      await client.createOrReplace(doc);
      uploaded += 1;
      console.log(`  threadColor: ${doc._id}`);
    } catch (err) {
      throw new Error(`Failed on threadColors[${i}] (name: ${entry.name}): ${err.message}`);
    }
  }

  for (const [slug, entry] of Object.entries(manifest.categoryImages)) {
    try {
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
    } catch (err) {
      throw new Error(`Failed on categoryImages.${slug}: ${err.message}`);
    }
  }

  if (manifest.categoriesMissingPhotos.length > 0) {
    skipped = manifest.categoriesMissingPhotos.length;
    console.log(`\nSkipped (no fitting photo found): ${manifest.categoriesMissingPhotos.join(', ')}`);
  }

  console.log(`\nDone. ${uploaded} document(s) created/updated, ${skipped} category/categories intentionally skipped.`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
