// One-off importer for the extracted Squarespace content.
// Walks migration-docs/content/*.json (in dependency order), normalizes each
// document, and writes a single NDJSON file. Then it kicks off
// `sanity dataset import` against the configured project.
//
// The import runs with `--replace`, which OVERWRITES every document with the
// same _id, Mary Ann's edits included: fresh datasets only. Dry run by default
// since 2026-10-13 (scripts/lib/write-gate.mjs, starter PORTS.md card 86): a bare
// run only writes the local NDJSON and prints the import it would run.
//   node scripts/import-content.mjs                                   # NDJSON + plan
//   NCS_PRODUCTION_WRITE=yes node scripts/import-content.mjs --apply  # imports (Nathan only)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { writeGate } from './lib/write-gate.mjs';

// The import below always targets `production`.
const APPLY = writeGate({ dataset: 'production' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const contentDir = resolve(root, 'migration-docs/content');
const outDir = resolve(root, 'tmp');
const outPath = resolve(outDir, 'content.ndjson');

// Import order matters because Sanity references resolve at import time.
// Singletons + atomic collections first, then page singletons that reference them.
const FILES = [
  'site-settings.json',
  'philosophy-points.json',
  'testimonials.json',
  'services.json',
  'process-steps.json',
  'faq-items.json',
  'home-page.json',
  'about-page.json',
  'process-page.json',
  'services-page.json',
  'faq-page.json',
  'contact-page.json',
];

function loadDocs(file) {
  const raw = readFileSync(resolve(contentDir, file), 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

const lines = [];
let total = 0;
for (const file of FILES) {
  const docs = loadDocs(file);
  for (const doc of docs) {
    if (!doc._type)
      throw new Error(`Missing _type in ${file}: ${JSON.stringify(doc).slice(0, 80)}…`);
    if (!doc._id) throw new Error(`Missing _id in ${file}: ${JSON.stringify(doc).slice(0, 80)}…`);
    lines.push(JSON.stringify(doc));
    total += 1;
  }
  console.log(`  ${file}: ${docs.length} docs`);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
console.log(`\nWrote ${total} documents to ${outPath}`);

// Run the import from the repo root, where sanity.cli.ts lives (project ID +
// dataset config) since the nested studio/ package was folded in on 2026-08-28.
const importArgs = ['sanity', 'dataset', 'import', outPath, 'production', '--replace'];
if (!APPLY) {
  console.log(`\nDRY RUN: would run npx ${importArgs.join(' ')}. Re-run with --apply to import.`);
  process.exit(0);
}
console.log('\nRunning sanity dataset import...\n');
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', importArgs, {
  cwd: root,
  stdio: 'inherit',
});
process.exit(result.status ?? 0);
