// =============================================================================
// Mary Ann's handbook: every guide agrees with the real Studio (2026-10-05)
// =============================================================================
// Adapted from stonesteps-50k/src/lib/studio-guides.test.ts. The guides are
// prose, so nothing else checks them, and these are the mistakes that would
// ship silently:
//   - a "Take me there" card pointing at a pane the desk does not have, a page
//     that does not exist, a box the form does not have, or a tool that is gone;
//   - a step telling her to click `Something` the Studio does not show (a menu
//     renamed in structure.ts, a box retitled in the schema);
//   - an em-dash or a developer word (the list in scripts/audit-studio.mjs);
//   - a guide with no badge, no time, or nothing to follow;
//   - a "See also" naming a guide that no longer exists.
// It covers ALL guides (content.ts, getFound.ts, brandAndPrint.ts).
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ALL_GUIDES,
  GUIDE_BADGES,
  GUIDE_CATEGORIES,
  GUIDE_ICON_NAMES,
  searchGuides,
  type Guide,
  type GuideBlock,
} from '../sanity/guides/index.ts';
import { editingGuides } from '../sanity/guides/content.ts';
import { DESK } from '../sanity/studioTargets.ts';
import { WELCOME_TASKS } from '../sanity/welcomeTasks.ts';
import { JARGON } from '../../scripts/audit-studio.mjs';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const STRUCTURE = read('../sanity/structure.ts');
const CONFIG = read('../../sanity.config.ts');
const TEMPLATES = read('../sanity/templates.ts');
const SCHEMA_DIR = fileURLToPath(new URL('../sanity/schemaTypes/', import.meta.url));
const SCHEMA_FILES = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.ts'));
const SCHEMA = SCHEMA_FILES.map((f) => readFileSync(SCHEMA_DIR + f, 'utf8')).join('\n');

/** The source of the schema file that defines `type`. */
function schemaOf(type: string): string | undefined {
  for (const f of SCHEMA_FILES) {
    const src = readFileSync(SCHEMA_DIR + f, 'utf8');
    if (new RegExp(`defineType\\(\\{\\s*name:\\s*'${type}'`).test(src)) return src;
  }
  return undefined;
}

// ── Every string Mary Ann reads in a guide ────────────────────────────────────

function blockText(b: GuideBlock): string[] {
  switch (b.kind) {
    case 'h':
    case 'p':
      return [b.text];
    case 'steps':
      return b.items.flatMap((s) =>
        typeof s === 'string' ? [s] : [s.text, s.see ?? '', s.picture ?? ''],
      );
    case 'bullets':
      return b.items;
    case 'path':
      return [b.label, b.detail ?? ''];
    case 'callout':
      return [b.title ?? '', b.text];
    default:
      return [];
  }
}
const guideText = (g: Guide) => [
  g.title,
  g.summary,
  g.time,
  g.cost ?? '',
  ...(g.before ?? []),
  ...g.blocks.flatMap(blockText),
];

// ── Shape ─────────────────────────────────────────────────────────────────────

test('every guide id is unique and kebab-case', () => {
  const seen = new Set<string>();
  for (const g of ALL_GUIDES) {
    assert.match(g.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${g.id} is not kebab-case`);
    assert.ok(!seen.has(g.id), `duplicate guide id: ${g.id}`);
    seen.add(g.id);
  }
});

test('every guide has a category, badge, icon, summary and time estimate', () => {
  for (const g of ALL_GUIDES) {
    assert.ok((GUIDE_CATEGORIES as readonly string[]).includes(g.category), `${g.id} category`);
    assert.ok((GUIDE_BADGES as readonly string[]).includes(g.badge), `${g.id} badge`);
    assert.ok((GUIDE_ICON_NAMES as readonly string[]).includes(g.icon), `${g.id} icon`);
    assert.ok(g.summary.trim().length > 10, `${g.id} has no summary`);
    assert.ok(g.time.trim().length > 0, `${g.id} has no time estimate`);
  }
});

test('every guide has at least 3 steps, or a clear body', () => {
  for (const g of ALL_GUIDES) {
    const steps = g.blocks.reduce((n, b) => n + (b.kind === 'steps' ? b.items.length : 0), 0);
    const prose = g.blocks.flatMap(blockText).join(' ').length;
    assert.ok(steps >= 3 || prose >= 300, `${g.id} has ${steps} steps and little else`);
  }
});

test('the editing categories each have guides', () => {
  for (const c of [
    'Start here',
    'Change my website',
    'Photos and clearance',
    'When something goes wrong',
  ]) {
    assert.ok(
      editingGuides.some((g) => g.category === c),
      `category "${c}" has no guides`,
    );
  }
});

test('the guides the spec asks for are there', () => {
  const ids = new Set(ALL_GUIDES.map((g) => g.id));
  for (const id of [
    'start-here',
    'undo-a-change',
    'edit-on-the-page',
    'business-details',
    'change-a-price',
    'page-words-form',
    'questions',
    'monogram-preview',
    'what-each-page-is',
    'add-a-photo',
    'photo-description',
    'photo-focus',
    'round-hoop',
    'clearance-add',
    'clearance-sold',
    'stripe-link',
    'add-a-font',
    'add-a-thread',
    'add-a-category',
    'nothing-happened',
    'made-a-mistake',
    'cant-find',
    'red-message',
    'deleted-something',
    'before-asking',
    'reorder-photos',
    'share-before-publish',
    'google-preview',
  ]) {
    assert.ok(ids.has(id), `no guide "${id}"`);
  }
});

test('every "See also" names a guide that exists', () => {
  const ids = new Set(ALL_GUIDES.map((g) => g.id));
  for (const g of ALL_GUIDES) {
    for (const b of g.blocks) {
      if (b.kind !== 'seealso') continue;
      for (const id of b.ids) assert.ok(ids.has(id), `${g.id} sees also "${id}", which is gone`);
    }
  }
});

// ── Words ─────────────────────────────────────────────────────────────────────

test('no guide uses an em-dash or a developer word', () => {
  for (const g of ALL_GUIDES) {
    for (const text of guideText(g)) {
      for (const j of JARGON) assert.ok(!j.re.test(text), `${g.id}: ${j.why} in "${text}"`);
    }
  }
});

test('no guide calls an unpublished change a "draft"', () => {
  for (const g of ALL_GUIDES) {
    for (const text of guideText(g)) {
      assert.ok(!/\bdrafts?\b/i.test(text), `${g.id} says "draft": "${text.slice(0, 60)}"`);
    }
  }
});

test('every guide that mentions the publish wait says 2 to 3 minutes', () => {
  for (const g of ALL_GUIDES) {
    for (const text of guideText(g)) {
      assert.ok(
        !/(few seconds|instantly|right away it is live)/i.test(text),
        `${g.id} promises an instant publish: "${text.slice(0, 60)}"`,
      );
    }
  }
});

// ── Every `thing you click` exists in the Studio ──────────────────────────────

/** Sanity's own buttons and menu words that are not in our code. */
const SANITY_WORDS = [
  'Publish',
  'Upload',
  'Generate',
  'Discard changes',
  'Search',
  'Redo',
  'Delete',
];

function studioNames(): Set<string> {
  const names = new Set<string>(SANITY_WORDS);
  const add = (re: RegExp, src: string) => {
    for (const m of src.matchAll(re)) names.add(m[1].replace(/\\'/g, "'"));
  };
  add(/\.title\('((?:[^'\\]|\\.)+)'\)/g, STRUCTURE);
  add(/\btitle: '((?:[^'\\]|\\.)+)'/g, STRUCTURE);
  add(/\btitle: '((?:[^'\\]|\\.)+)'/g, CONFIG);
  add(/:\s*'((?:[^'\\]|\\.)+)',?\s*$/gm, CONFIG.slice(CONFIG.indexOf('TOOL_TITLES')));
  add(/\btitle: '((?:[^'\\]|\\.)+)'/g, SCHEMA);
  add(/\btitle: "((?:[^"\\]|\\.)+)"/g, SCHEMA);
  // Shared wording in _copy.ts is spread into fields as { title: '...' }: covered above.
  // The Undo button's label (PORTABLE components/UndoRedo.tsx).
  add(/label: busy \? '[^']*' : '([^']+)'/g, read('../sanity/components/UndoRedo.tsx'));
  // Phase D actions: Move to Trash / Bring it back / Delete forever and their
  // confirm buttons (actions/trash.tsx), the share link (lib/previewable.ts),
  // and the "+" buttons of the drag lists (addLabel in structure.ts).
  const TRASH = read('../sanity/actions/trash.tsx');
  add(/label: (?:stage === 'busy'|busy) \? '[^']*' : '([^']+)'/g, TRASH);
  add(/confirmButtonText: '([^']+)'/g, TRASH);
  add(/export const SHARE_LABEL = '([^']+)'/g, read('../sanity/lib/previewable.ts'));
  add(/addLabel: '([^']+)'/g, STRUCTURE);
  for (const t of WELCOME_TASKS) names.add(t.title);
  return names;
}

// Scoped to the editing guides (content.ts): they are about the Studio, so
// every chip must be a Studio name. The Get found and brand kit guides also
// chip buttons on OUTSIDE sites (Google, Facebook), which this cannot check.
test('every `thing you click` in an editing guide is a name the Studio really shows', () => {
  const names = studioNames();
  for (const g of editingGuides) {
    for (const text of guideText(g)) {
      for (const m of text.matchAll(/`([^`]+)`/g)) {
        assert.ok(
          names.has(m[1]),
          `${g.id} tells her to click \`${m[1]}\`, which is not in the Studio`,
        );
      }
    }
  }
});

// ── Every "Take me there" goes somewhere real ─────────────────────────────────

const TOOLS = new Set(['structure', 'presentation', 'media']);
for (const m of CONFIG.matchAll(/name: '([a-z-]+)',\s*\n?\s*title:/g)) TOOLS.add(m[1]);

test('every "Take me there" card goes to a real pane, page, box, template or tool', () => {
  const panes = new Set<string>(Object.values(DESK));
  for (const g of ALL_GUIDES) {
    for (const b of g.blocks) {
      if (b.kind !== 'path') continue;
      const to = b.to;
      const where = `${g.id} "${b.label}"`;
      if ('url' in to) {
        assert.match(to.url, /^https:\/\//, `${where}: outside links must be https`);
      } else if ('pane' in to) {
        for (const part of to.pane.split(';')) {
          assert.ok(panes.has(part), `${where}: no desk pane "${part}"`);
        }
      } else if ('tool' in to) {
        assert.ok(TOOLS.has(to.tool), `${where}: no tool "${to.tool}"`);
      } else if ('create' in to) {
        assert.ok(schemaOf(to.create), `${where}: no type "${to.create}"`);
        if (to.template) {
          assert.ok(
            TEMPLATES.includes(`id: '${to.template}'`),
            `${where}: no template "${to.template}"`,
          );
        }
      } else {
        const type = to.type ?? to.doc;
        const src = schemaOf(type);
        assert.ok(src, `${where}: no type "${type}"`);
        assert.ok(
          STRUCTURE.includes(`'${to.doc}'`) || STRUCTURE.includes(`page(S, '${to.doc}')`),
          `${where}: the desk does not open "${to.doc}"`,
        );
        if (to.field) {
          assert.ok(
            src!.includes(`name: '${to.field}'`),
            `${where}: "${type}" has no box "${to.field}"`,
          );
        }
      }
    }
  }
});

test('the TOOLS list read from sanity.config.ts includes the checkup', () => {
  assert.ok(TOOLS.has('checkup'));
});

// ── Search ────────────────────────────────────────────────────────────────────

test('search finds guides by words in the title, summary and steps', () => {
  assert.ok(searchGuides('photo').some((g) => g.id === 'add-a-photo'));
  assert.ok(searchGuides('PHONE number').some((g) => g.id === 'business-details'));
  assert.ok(searchGuides('stripe').some((g) => g.id === 'stripe-link'));
  assert.equal(searchGuides('').length, ALL_GUIDES.length);
  assert.equal(searchGuides('zzzz-nothing').length, 0);
  // Title matches come first.
  assert.equal(searchGuides('sold')[0].id, 'clearance-sold');
});
