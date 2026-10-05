// =============================================================================
// Mary Ann's Studio: deep links, the Welcome cards and the desk agree
// =============================================================================
// The Welcome cards, the help pane and the desk all name panes by id. A card
// whose pane id the desk no longer has is a dead button she will press and
// wonder about, and nothing else would notice: the build, the type check and
// the site tests all pass. This file holds them together (2026-10-05, Phase A
// of docs/superpowers/specs/2026-10-05-studio-direction.md).
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DESK, shouldOpenWelcome, studioTargetPath } from '../sanity/studioTargets.ts';
import { WELCOME_TASKS } from '../sanity/welcomeTasks.ts';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const STRUCTURE = read('../sanity/structure.ts');

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

// ── shouldOpenWelcome ─────────────────────────────────────────────────────────

test('an empty desk opens Welcome; anything open, or another tool, does not', () => {
  assert.equal(shouldOpenWelcome({ tool: 'structure' }), true);
  assert.equal(shouldOpenWelcome({ tool: 'structure', structure: {} }), true);
  assert.equal(shouldOpenWelcome({ tool: 'structure', structure: { panes: [] } }), true);
  assert.equal(
    shouldOpenWelcome({ tool: 'structure', structure: { panes: [[{ id: 'photos' }]] } }),
    false,
  );
  assert.equal(shouldOpenWelcome({ tool: 'presentation' }), false);
  assert.equal(shouldOpenWelcome({}), false);
  assert.equal(shouldOpenWelcome(null), false);
});

test('an edit link being resolved is left alone', () => {
  assert.equal(shouldOpenWelcome({ tool: 'structure', intent: 'edit' }), false);
  assert.equal(
    shouldOpenWelcome({ tool: 'structure', structure: { intent: 'edit', params: {} } }),
    false,
  );
  assert.equal(
    shouldOpenWelcome({ tool: 'structure', structure: { editDocumentId: 'homePage' } }),
    false,
  );
});

// ── The desk has every pane anything links to ─────────────────────────────────

test('every DESK id is given to a pane in structure.ts', () => {
  for (const [key, id] of Object.entries(DESK)) {
    const byConstant = STRUCTURE.includes(`DESK.${key}`);
    const byLiteral = STRUCTURE.includes(`'${id}'`);
    assert.ok(byConstant || byLiteral, `DESK.${key} ('${id}') is not used in structure.ts`);
  }
});

test('every Welcome card that names a pane names one the desk has', () => {
  const ids = new Set<string>(Object.values(DESK));
  for (const task of WELCOME_TASKS) {
    if (!('pane' in task.target)) continue;
    for (const part of task.target.pane.split(';')) {
      assert.ok(ids.has(part), `"${task.title}" points at a pane "${part}" the desk does not have`);
    }
  }
});

test('the Welcome cards cover the jobs the spec names', () => {
  const titles = WELCOME_TASKS.map((t) => t.title);
  for (const job of [
    'Add a photo of my work',
    'Mark a clearance item sold or add one',
    'Change a price',
    'Change my phone number or email',
    'Change the words on my home page',
    'See my website and edit it on the page',
    'Something went wrong? Get help',
  ]) {
    assert.ok(titles.includes(job), `no Welcome card for "${job}"`);
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

test('no Welcome card uses an em-dash or a developer word', () => {
  for (const t of WELCOME_TASKS) {
    for (const re of BANNED) {
      assert.ok(!re.test(t.title) && !re.test(t.blurb), `"${t.title}" fails ${re}`);
    }
  }
});

test('no new Studio file for Mary Ann contains an em-dash', () => {
  for (const file of [
    '../sanity/structure.ts',
    '../sanity/components/WelcomePane.tsx',
    '../sanity/components/HelpPane.tsx',
    '../sanity/components/StudioTour.tsx',
    '../sanity/components/StudioLayout.tsx',
    '../sanity/components/ToolHeading.tsx',
    '../sanity/components/publishNote.tsx',
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
  for (const expected of [
    'Welcome',
    'Photos of my work',
    'My business details',
    'Pages on my website',
  ]) {
    assert.ok(titles.includes(expected), `no desk title "${expected}"`);
  }
  for (const t of titles) {
    for (const re of BANNED) assert.ok(!re.test(t), `desk title "${t}" fails ${re}`);
    assert.ok(!/[a-z][A-Z]/.test(t), `desk title "${t}" looks like a code name`);
  }
});
