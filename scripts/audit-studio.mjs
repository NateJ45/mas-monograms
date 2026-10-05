// scripts/audit-studio.mjs
//
// The Studio audit, as a command: `npm run audit:studio`.
// Ported from stonesteps-50k/scripts/audit-studio.mjs on 2026-10-05 for Mary
// Ann's Studio (docs/superpowers/specs/2026-10-05-studio-direction.md, Phase A).
//
// WHY THIS EXISTS. Mary Ann is not technical, and anything wrong in her Studio
// is discovered by her, alone, as a red mark she cannot explain. None of the
// faults below show up in a build, a type check or a test:
//
//   1. A field that is `hidden: true` AND required. Sanity validates the
//      document, not the form, so the document is permanently invalid and the
//      error names a field that is nowhere on screen.
//
//   2. A preview title selected from a number (or other non-string). Sanity
//      lowercases the title to index it, so the whole list renders as a red
//      runtime error. Stone Steps' Numbers Row did exactly that.
//
//   3. A stored key the schema does not declare. The Studio shows "Unknown
//      field found" with a REMOVE FIELD button that deletes the value from
//      every document of the type, with no undo.
//
//   4. A required field that is blank in the live document. Either a real job
//      for Mary Ann or a requirement that is wrong; both put a red mark on her
//      form, which is the thing the spec says must never happen for something
//      she cannot fix.
//
//   5. Editor-facing words she should never read: an em-dash, or developer
//      jargon (<em>, slug, schema, "field", dataset, HTML...) in a title,
//      description or validation message. Plain words are principle 2 of the
//      spec; this is how it stays true after the next schema edit.
//
// It reads the schema as TEXT rather than importing it, because importing the
// schema pulls in @sanity/ui and a React renderer. Only the files that
// src/sanity/schemaTypes/index.ts actually imports are read: the folder still
// holds unregistered starter schemas (sections.ts, page.ts...), and auditing
// files the Studio never loads would be noise.
//
// Exit code 1 if anything is found. It is READ-ONLY: it never writes to the
// dataset (it only runs GROQ fetches through scripts/lib/sanity-lib.mjs).

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMA_DIR = resolve(root, 'src/sanity/schemaTypes');

/** Sanity's own object types, whose keys we do not police. */
const BUILT_IN = new Set([
  'reference',
  'image',
  'file',
  'slug',
  'block',
  'span',
  'geopoint',
  'crop',
  'hotspot',
]);

const SYSTEM_KEYS = new Set([
  '_id',
  '_type',
  '_key',
  '_ref',
  '_rev',
  '_createdAt',
  '_updatedAt',
  '_weak',
  '_strengthenOnPublish',
  '_originalId',
  // Platform-written document metadata, not drift.
  '_system',
  'orderRank',
]);

/** A required rule, in either of the two spellings this repo uses. */
const REQUIRED = /\b(?:R|Rule)\.required\(\)/;

// ── Read the schema ────────────────────────────────────────────────────────

/** The schema files the Studio really loads, from index.ts's imports. */
export function registeredFiles(indexSource) {
  return [...indexSource.matchAll(/from\s+'\.\/([A-Za-z0-9_]+)'/g)].map((m) => `${m[1]}.ts`);
}

const read = (file) => readFileSync(resolve(SCHEMA_DIR, file), 'utf8');
const REGISTERED = registeredFiles(read('index.ts'));
// Plus the shared helper files they import (./_copy.ts holds the wording every
// page repeats), so check 5 reads those words too.
const FILES = [...new Set([...REGISTERED, ...REGISTERED.flatMap((f) => registeredFiles(read(f)))])];

/** Every declared field name inside one block of schema source. */
function fieldNames(body) {
  return new Set([...body.matchAll(/name:\s*'([A-Za-z0-9_]+)'/g)].map((m) => m[1]));
}

/** typeName -> Set of field names, across every registered schema file. */
function readSchema() {
  const types = new Map();
  const add = (name, names) => types.set(name, new Set([...(types.get(name) ?? []), ...names]));

  for (const file of FILES) {
    const src = read(file);
    const starts = [...src.matchAll(/defineType\(\{\s*\n?\s*name:\s*'([A-Za-z0-9_]+)'/g)];
    starts.forEach((m, i) => {
      const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
      add(m[1], fieldNames(src.slice(m.index, end)));
    });

    // Named inline object members inside arrays are real types with real keys.
    for (const m of src.matchAll(
      /defineArrayMember\(\{[\s\S]{0,200}?type:\s*'object',[\s\S]{0,200}?name:\s*'([A-Za-z0-9_]+)'/g,
    )) {
      add(m[1], fieldNames(src.slice(m.index, m.index + 3000)));
    }
    for (const m of src.matchAll(
      /defineArrayMember\(\{[\s\S]{0,200}?name:\s*'([A-Za-z0-9_]+)',[\s\S]{0,200}?type:\s*'object'/g,
    )) {
      add(m[1], fieldNames(src.slice(m.index, m.index + 3000)));
    }
  }
  return types;
}

/** The source of the `{...}` object starting at `open`, brace-balanced. */
function objectAt(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  return src.slice(open);
}

/** Preview titles taken straight from a non-string field, with no prepare(). */
function numericPreviewTitles() {
  const out = [];
  const BAD = new Set(['number', 'boolean', 'date', 'datetime', 'array', 'reference', 'image']);
  for (const file of FILES) {
    const src = read(file);
    const fieldTypes = new Map();
    for (const f of src.matchAll(
      // TEMPERED: the gap must not contain another `name:`, or a parent field
      // pairs itself with a child's type (the Stone Steps lesson).
      /name:\s*'([A-Za-z0-9_]+)',(?:(?!name:)[\s\S]){0,240}?type:\s*'([a-zA-Z]+)'/g,
    )) {
      if (BAD.has(f[2])) fieldTypes.set(f[1], f[2]);
    }
    for (const p of src.matchAll(/preview:\s*\{/g)) {
      const open = p.index + p[0].length - 1;
      const block = objectAt(src, open);
      if (/\bprepare\b/.test(block)) continue;
      const title = block.match(/title:\s*'([A-Za-z0-9_]+)'/);
      if (!title) continue;
      const declared = fieldTypes.get(title[1]);
      if (!declared) continue;
      const line = src.slice(0, p.index).split('\n').length;
      out.push(`${file}:${line}  preview title '${title[1]}' is a ${declared}, with no prepare()`);
    }
  }
  return out;
}

/**
 * Top-level `defineField({ ... })` blocks of a schema file, by indentation.
 * A field's own declarations sit at six spaces; anything deeper belongs to an
 * array member or a nested object, whose required rules fire per row and so
 * cannot block a document whose array is empty.
 */
function topLevelFields(src) {
  return [...src.matchAll(/^ {4}defineField\(\{\n([\s\S]*?)\n {4}\}\),?$/gm)].map((m) => ({
    body: m[1],
    index: m.index,
    name: m[1].match(/^ {6}name:\s*'([A-Za-z0-9_]+)'/m)?.[1] ?? '?',
    hidden: /^ {6}hidden:\s*true/m.test(m[1]),
    required: (() => {
      const v = m[1].match(/^ {6}validation:[\s\S]*$/m)?.[0] ?? '';
      // Only the field's own validation line(s), not a nested member's.
      const own = v.split(/\n {6}[a-zA-Z]+:/)[0];
      return REQUIRED.test(own);
    })(),
  }));
}

/** Fields that are hidden and required at once. */
function hiddenRequired() {
  const out = [];
  for (const file of FILES) {
    const src = read(file);
    for (const f of topLevelFields(src)) {
      if (f.hidden && f.required) {
        out.push(`${file}:${src.slice(0, f.index).split('\n').length}  ${f.name}`);
      }
    }
  }
  return out;
}

/** Every visible field marked required, per document type. */
function requiredFields() {
  const out = new Map();
  for (const file of FILES) {
    const src = read(file);
    const starts = [...src.matchAll(/defineType\(\{\s*\n?\s*name:\s*'([A-Za-z0-9_]+)'/g)];
    starts.forEach((m, i) => {
      const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
      const body = src.slice(m.index, end);
      if (!/type:\s*'document'/.test(body.slice(0, 400))) return;
      const names = topLevelFields(body)
        .filter((f) => f.required && !f.hidden)
        .map((f) => f.name);
      if (names.length) out.set(m[1], names);
    });
  }
  return out;
}

/**
 * Words Mary Ann should never read in a title, description or message. Kept
 * conservative: each one has turned up in this Studio's help text before.
 */
export const JARGON = [
  { re: /—/, why: 'em-dash' },
  { re: /<\/?em>|<\/?strong>/i, why: 'HTML tag' },
  { re: /\bslug\b/i, why: '"slug"' },
  { re: /\bschema\b/i, why: '"schema"' },
  { re: /\bdataset\b/i, why: '"dataset"' },
  { re: /\bsingleton\b/i, why: '"singleton"' },
  { re: /\bfield\b/i, why: '"field"' },
  { re: /\bdocument\b/i, why: '"document"' },
  { re: /\bmarkdown\b|\bJSON\b|\bHTML\b|\bGROQ\b/, why: 'tech word' },
  { re: /\balt text\b/i, why: '"alt text"' },
  { re: /\bCTA\b/, why: '"CTA"' },
  { re: /\bhref\b|\bURL\b/, why: 'tech word' },
];

/** The editor-facing strings in one source: titles, descriptions, messages. */
export function editorStrings(src) {
  const out = [];
  const lit = `'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)"`;
  for (const key of ['title', 'description']) {
    for (const m of src.matchAll(new RegExp(`\\b${key}:\\s*(?:${lit})`, 'g'))) {
      out.push({ text: m[1] ?? m[2] ?? '', index: m.index });
    }
  }
  for (const m of src.matchAll(new RegExp(`\\.(?:warning|error|info)\\(\\s*(?:${lit})`, 'g'))) {
    out.push({ text: m[1] ?? m[2] ?? '', index: m.index });
  }
  return out;
}

function jargonHits() {
  const out = [];
  for (const file of FILES) {
    const src = read(file);
    for (const s of editorStrings(src)) {
      for (const j of JARGON) {
        if (j.re.test(s.text)) {
          const line = src.slice(0, s.index).split('\n').length;
          out.push(`${file}:${line}  ${j.why}: "${s.text.slice(0, 70)}"`);
          break;
        }
      }
    }
  }
  return out;
}

/**
 * Every string in a data module's exports (the brand kit's words), checked against JARGON.
 * Links, file paths, color codes and CSS names are skipped: she never reads them as words.
 */
export function kitWordHits(mod) {
  const out = [];
  const walk = (v, where) => {
    if (typeof v === 'string') {
      if (/^(https?:)?\/|^#|^--/.test(v)) return;
      const j = JARGON.find((x) => x.re.test(v));
      if (j) out.push(`${where}  ${j.why}: "${v.slice(0, 70)}"`);
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
    }
  };
  for (const [name, value] of Object.entries(mod)) {
    if (typeof value !== 'function') walk(value, name);
  }
  return out;
}

// ── Walk the data ──────────────────────────────────────────────────────────

function unknownKeys(value, path, docId, schema, hits) {
  if (value == null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => unknownKeys(v, `${path}[${i}]`, docId, schema, hits));
    return;
  }
  const type = value._type;
  if (type && schema.has(type) && !BUILT_IN.has(type)) {
    for (const key of Object.keys(value)) {
      if (SYSTEM_KEYS.has(key)) continue;
      if (!schema.get(type).has(key)) {
        hits.push({ docId, path, type, key, value: JSON.stringify(value[key]).slice(0, 70) });
      }
    }
  }
  for (const [k, v] of Object.entries(value)) {
    if (SYSTEM_KEYS.has(k)) continue;
    unknownKeys(v, `${path}.${k}`, docId, schema, hits);
  }
}

// ── Run ────────────────────────────────────────────────────────────────────

async function main() {
  // Imported here, not at the top, so the pure helpers above can be unit-tested
  // without a .env or a network.
  const { client } = await import('./lib/sanity-lib.mjs');
  const schema = readSchema();
  let problems = 0;
  const section = (title) => console.log(`\n${title}\n${'-'.repeat(title.length)}`);
  const report = (lines) => {
    if (lines.length) {
      problems += lines.length;
      lines.forEach((l) => console.log(`  ${l}`));
    } else {
      console.log('  none');
    }
  };

  section('1. Hidden AND required (an error with no field on screen)');
  report(hiddenRequired());

  section('2. Preview titles that are not strings (crashes the list)');
  report(numericPreviewTitles());

  section('3. Stored keys the schema does not declare ("Remove field" bait)');
  const docTypes = await client.fetch(
    `array::unique(*[!(_type match "sanity.*") && !(_type match "system.*") && !(_type match "media.*")]._type)`,
  );
  const hits = [];
  for (const type of docTypes) {
    if (!schema.has(type)) continue; // an unregistered leftover type has no form
    const docs = await client.fetch(`*[_type==$type][0...200]`, { type });
    for (const doc of docs) {
      for (const key of Object.keys(doc)) {
        if (SYSTEM_KEYS.has(key)) continue;
        if (!schema.get(doc._type).has(key)) {
          hits.push({
            docId: doc._id,
            path: '',
            type: doc._type,
            key,
            value: JSON.stringify(doc[key]).slice(0, 70),
          });
        }
      }
      for (const [k, v] of Object.entries(doc)) {
        if (SYSTEM_KEYS.has(k)) continue;
        unknownKeys(v, `.${k}`, doc._id, schema, hits);
      }
    }
  }
  report(hits.map((h) => `${h.docId}${h.path}  [${h.type}] "${h.key}" = ${h.value}`));

  section('4. Required fields left blank in the live data (a red mark on her form)');
  const blanks = [];
  for (const [type, fields] of requiredFields()) {
    if (!docTypes.includes(type)) continue;
    const docs = await client.fetch(`*[_type==$type][0...300]{_id, ${fields.join(', ')}}`, {
      type,
    });
    for (const field of fields) {
      const missing = docs.filter((d) => {
        const v = d[field];
        return v == null || v === '' || (Array.isArray(v) && v.length === 0);
      });
      if (!missing.length) continue;
      blanks.push(
        `${type}.${field}: blank on ${missing.length}/${docs.length}  e.g. ${missing
          .slice(0, 3)
          .map((d) => d._id)
          .join(', ')}`,
      );
    }
  }
  report(blanks);

  section('5. Words Mary Ann should not have to read (em-dashes, jargon)');
  report(jargonHits());

  // Phase F (2026-10-05): the words of "My brand kit" live in repo data, not in the schema.
  section('6. Words in My brand kit (src/lib/brand/brandKit.ts)');
  report(kitWordHits(await import('../src/lib/brand/brandKit.ts')));

  console.log(`\n${problems === 0 ? 'Studio is clean.' : `${problems} thing(s) to look at.`}`);
  process.exit(problems === 0 ? 0 : 1);
}

// Run only as a script, never on import (the unit test imports the helpers).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
