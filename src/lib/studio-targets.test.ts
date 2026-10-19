// =============================================================================
// Mary Ann's Studio: deep links, Home's buttons and the desk agree
// =============================================================================
// Home's big buttons and "Your pages" (src/sanity/kit.config.ts), the guides
// and the desk all name panes by id. A button whose pane id the desk no longer
// has is a dead button she will press and wonder about, and nothing else would
// notice: the build, the type check and the site tests all pass. This file
// holds them together (2026-10-05, Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md; Home replaced the
// Welcome pane on 2026-10-18).
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DESK, studioTargetPath } from '../sanity/studioTargets.ts';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const STRUCTURE = read('../sanity/structure.ts');
// Read as text: kit.config.ts pulls in the Studio's React icons.
const KIT = read('../sanity/kit.config.ts');

// ── studioTargetPath ──────────────────────────────────────────────────────────

test('a document target is an edit intent, with the field to focus', () => {
  assert.equal(
    studioTargetPath('/studio', { doc: 'siteSettings', field: 'phone' }),
    '/studio/intent/edit/id=siteSettings;type=siteSettings;path=phone',
  );
  assert.equal(
    studioTargetPath('/studio/', { doc: 'abc', type: 'galleryItem' }),
    '/studio/intent/edit/id=abc;type=galleryItem',
  );
});

test('a create target is a create intent, with the template when there is one', () => {
  assert.equal(
    studioTargetPath('/studio', { create: 'galleryItem', template: 'new-photo' }),
    '/studio/intent/create/type=galleryItem;template=new-photo',
  );
  assert.equal(studioTargetPath('/studio', { create: 'font' }), '/studio/intent/create/type=font');
});

test('pane and tool targets are plain paths', () => {
  assert.equal(
    studioTargetPath('/studio', { pane: 'clearance-and-prices;price-tags' }),
    '/studio/structure/clearance-and-prices;price-tags',
  );
  assert.equal(studioTargetPath('/studio', { tool: 'presentation' }), '/studio/presentation');
});

// ── The desk has every pane anything links to ─────────────────────────────────

test('every DESK id is given to a pane in structure.ts', () => {
  for (const [key, id] of Object.entries(DESK)) {
    const byConstant = STRUCTURE.includes(`DESK.${key}`);
    const byLiteral = STRUCTURE.includes(`'${id}'`);
    assert.ok(byConstant || byLiteral, `DESK.${key} ('${id}') is not used in structure.ts`);
  }
});

test('every pane Home links to is one the desk has', () => {
  const used = [...KIT.matchAll(/DESK\.(\w+)/g)].map((m) => m[1]);
  assert.ok(used.length > 5, 'the check found the pane links');
  for (const key of used) {
    assert.ok(key in DESK, `kit.config.ts names DESK.${key}, which does not exist`);
  }
});

// Five since 2026-10-19: her quote requests joined them (docs/agent/studio-plan.md).
test("Home's big buttons are the jobs she does most", () => {
  const quick = KIT.slice(KIT.indexOf('quickActions: ['), KIT.indexOf('tourSteps: ['));
  const titles = [...quick.matchAll(/^\s+title: '([^']+)',$/gm)].map((m) => m[1]);
  assert.deepEqual(titles, [
    'Add a photo of my work',
    'Mark a clearance item sold, or add one',
    'Change a price',
    'See my quote requests',
    'Change my phone number or email',
  ]);
});

test('the old Welcome jobs all have a home on Home', () => {
  // The other cards of the 2026-10-05 Welcome page: the home page words, Edit
  // on the page (Home's "Edit the website" button), the QR tool, the brand kit,
  // help (the Site Guide button) and the checkup (the Fix-it list).
  for (const target of [
    "{ doc: 'homePage' }",
    "{ tool: 'qr-codes' }",
    "{ tool: 'brand-kit' }",
    "{ tool: 'checkup' }",
  ]) {
    assert.ok(KIT.includes(target), `Home has no link to ${target}`);
  }
});

test('every list item and pane in the desk has an explicit id', () => {
  // A derived id comes from the title and breaks deep links (see the header of
  // structure.ts). Every `S.listItem()` and `S.list()` must be followed by `.id(`.
  const calls = [
    ...STRUCTURE.matchAll(/S\.(listItem|list|component|documentTypeList)\(([^)]*)\)\s*\.(\w+)/g),
  ];
  assert.ok(calls.length > 10, 'the check found the builder calls');
  for (const m of calls) {
    assert.equal(m[3], 'id', `S.${m[1]}(${m[2]}) is not followed by .id(...)`);
  }
});

// ── Words she reads ───────────────────────────────────────────────────────────

const BANNED = [/—/, /\bslug\b/i, /\bschema\b/i, /\bdocument\b/i, /\bsingleton\b/i, /\bdataset\b/i];

test('no word on Home or in the tour uses an em-dash or a developer word', () => {
  const words = [...KIT.matchAll(/(?:title|detail|body|explain): '([^']+)'/g)].map((m) => m[1]);
  assert.ok(words.length > 20, 'the check found the words');
  for (const w of words) {
    for (const re of BANNED) assert.ok(!re.test(w), `"${w}" fails ${re}`);
  }
});

test('no new Studio file for Mary Ann contains an em-dash', () => {
  for (const file of [
    '../sanity/structure.ts',
    '../sanity/kit.config.ts',
    '../sanity/checkupRules.ts',
    '../sanity/studioEdges.config.ts',
    '../sanity/tables.config.ts',
    '../sanity/components/HelpPane.tsx',
    '../sanity/components/documentBadges.tsx',
    '../sanity/schemaTypes/_copy.ts',
  ]) {
    assert.ok(!read(file).includes('—'), `${file} contains an em-dash`);
  }
});

test('the desk titles say what she does, not what the data is called', () => {
  // Titles are written two ways in structure.ts: `.title('...')` and the
  // `title: '...'` option of the list() helper. Read both.
  const titles = [
    ...STRUCTURE.matchAll(/\.title\('([^']+)'\)/g),
    ...STRUCTURE.matchAll(/^\s+title: '([^']+)',$/gm),
  ].map((m) => m[1]);
  for (const expected of ['Photos of my work', 'My business details', 'Pages on my website']) {
    assert.ok(titles.includes(expected), `no desk title "${expected}"`);
  }
  for (const t of titles) {
    for (const re of BANNED) assert.ok(!re.test(t), `desk title "${t}" fails ${re}`);
    assert.ok(!/[a-z][A-Z]/.test(t), `desk title "${t}" looks like a code name`);
  }
});
