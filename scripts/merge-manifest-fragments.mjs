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
