// Phase D (2026-10-05): Trash, drag order, share link, Google preview, locked
// addresses. Bare Node: the pure halves are imported, the wiring is read as text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ARCHIVABLE_TYPES,
  TRASH_KIND,
  buildTrashRecord,
  parseTrashPayload,
  publishedId,
  referrersMessage,
  restoreDocs,
  trashTitle,
} from '../sanity/lib/trash.ts';
import {
  FIXED_PREVIEW_PATHS,
  SHARE_COPIED,
  SHARE_LABEL,
  SHARE_LOCAL_ONLY,
  canPreviewPath,
  shareLinksWorkHere,
} from '../sanity/lib/previewable.ts';
import { descriptionHint, titleHint } from '../sanity/lib/googlePreview.ts';
import { CHECKS } from './studio-checkup.ts';
import { DESK } from '../sanity/studioTargets.ts';
import { JARGON } from '../../scripts/audit-studio.mjs';

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');
const NOW = '2026-10-05T12:00:00.000Z';

// ── Trash ─────────────────────────────────────────────────────────────────────

const photo = {
  _id: 'galleryItem-1',
  _type: 'galleryItem',
  _rev: 'r1',
  _createdAt: '2026-01-01',
  _updatedAt: '2026-02-01',
  image: { _type: 'image', asset: { _ref: 'image-abc-10x10-jpg' }, alt: 'Navy towel' },
  orderRank: '0|100008:',
  displayOrder: 1,
};

test('categories, pages and the Trash itself are never archivable', () => {
  for (const t of ['itemCategory', 'legalPage', 'homePage', 'siteSettings', 'trashedItem']) {
    assert.ok(!ARCHIVABLE_TYPES.has(t), t);
  }
  for (const t of ARCHIVABLE_TYPES) assert.ok(TRASH_KIND[t], `${t} has a plain name`);
});

test('a trash record keeps the published copy and the unpublished changes apart', () => {
  const draft = {
    ...photo,
    _id: 'drafts.galleryItem-1',
    image: { ...photo.image, alt: 'Navy towel, new words' },
  };
  const rec = buildTrashRecord('galleryItem', 'drafts.galleryItem-1', photo, draft, NOW);
  assert.equal(rec._type, 'trashedItem');
  assert.equal(rec.originalId, 'galleryItem-1');
  assert.equal(rec.originalType, 'galleryItem');
  assert.equal(rec.kind, 'Photo of my work');
  assert.equal(rec.title, 'Navy towel, new words');
  assert.equal(rec.wasPublished, true);
  const back = parseTrashPayload(rec.payload, rec.originalId);
  assert.equal(back.published?._id, 'galleryItem-1');
  assert.equal(back.published?.image.alt, 'Navy towel');
  assert.equal(back.draft?._id, 'drafts.galleryItem-1');
  assert.equal(back.draft?.image.alt, 'Navy towel, new words');
  // System fields are gone, so `create` cannot clash on _rev.
  for (const d of restoreDocs(back)) {
    assert.ok(!('_rev' in d) && !('_createdAt' in d) && !('_updatedAt' in d));
  }
  // The drag position comes back with it.
  assert.equal(back.published?.orderRank, '0|100008:');
});

test('restoring a never-published item does not publish it', () => {
  const draft = { ...photo, _id: 'drafts.galleryItem-2' };
  const rec = buildTrashRecord('galleryItem', 'drafts.galleryItem-2', null, draft, NOW);
  assert.equal(rec.wasPublished, false);
  const docs = restoreDocs(parseTrashPayload(rec.payload, rec.originalId));
  assert.deepEqual(
    docs.map((d) => d._id),
    ['drafts.galleryItem-2'],
  );
});

test('the payload cannot move an item to a different id', () => {
  const rec = buildTrashRecord(
    'font',
    'font-a',
    { _id: 'font-a', _type: 'font', name: 'A' },
    null,
    NOW,
  );
  const tampered = JSON.stringify({
    published: { _id: 'homePage', _type: 'font', name: 'A' },
    draft: null,
  });
  const back = parseTrashPayload(tampered, rec.originalId);
  assert.equal(back.published?._id, 'font-a');
});

test("Reid's older single-copy payload still restores, as published", () => {
  const back = parseTrashPayload(
    JSON.stringify({ _id: 'faq-1', _type: 'faqItem', question: 'Q?' }),
    'faq-1',
  );
  assert.equal(back.published?._id, 'faq-1');
  assert.equal(back.draft, null);
});

test('nothing to trash is an error, not an empty Trash row', () => {
  assert.throws(() => buildTrashRecord('font', 'font-a', null, null, NOW));
});

test('trash titles are readable and never blank', () => {
  assert.equal(trashTitle(photo), 'Navy towel');
  assert.equal(trashTitle({ _type: 'faqItem', question: 'How long?' }), 'How long?');
  assert.equal(trashTitle({ _type: 'pricingTier', label: 'Basic' }), 'Basic');
  assert.equal(trashTitle({ _type: 'font' }), 'Embroidery font with no name');
  assert.equal(trashTitle(null), 'Something with no name');
  assert.equal(publishedId('drafts.x'), 'x');
});

test('an item another item uses is refused in plain words', () => {
  assert.equal(referrersMessage([]), null);
  const one = referrersMessage([{ _id: 'g1', _type: 'galleryItem', name: 'Navy towel' }]);
  assert.match(one!, /^Another item uses this one: Navy towel\./);
  const many = referrersMessage([
    { _id: 'g1', _type: 'galleryItem', name: 'A' },
    { _id: 'g2', _type: 'galleryItem', name: 'B' },
    { _id: 'g3', _type: 'galleryItem', name: 'C' },
    { _id: 'g4', _type: 'galleryItem', name: null },
  ]);
  assert.match(many!, /4 other items use this one: A, B, C and 1 more/);
});

test('the Trash words she reads use no jargon and no em-dash', () => {
  const action = read('../sanity/actions/trash.tsx');
  const words = [
    ...[
      ...action.matchAll(
        /(?:message|label|title|description|confirmButtonText|cancelButtonText|header):\s*\n?\s*['`]([^'`]+)['`]/g,
      ),
    ].map((m) => m[1]),
    ...[...action.matchAll(/export const TRASH_\w+ =\s*\n?\s*'([^']+)'/g)].map((m) => m[1]),
    referrersMessage([{ _id: 'g1', _type: 'galleryItem', name: 'X' }])!,
    ...Object.values(TRASH_KIND),
  ];
  assert.ok(words.length > 10, 'found the words');
  for (const w of words) for (const j of JARGON) assert.ok(!j.re.test(w), `"${w}": ${j.why}`);
  assert.ok(
    action.includes(
      'Move this to Trash? It comes off your website, and you can bring it back from Trash if you change your mind.',
    ),
  );
});

test('editorActions swaps Delete for Move to Trash and gives the Trash only two actions', () => {
  const src = read('../sanity/editorActions.ts');
  assert.match(src, /schemaType === TRASH_TYPE\) return \[RestoreAction, DeleteForeverAction\]/);
  assert.match(src, /action !== 'delete'\), MoveToTrashAction\]/);
  const desk = read('../sanity/structure.ts');
  assert.match(desk, /\.id\(DESK\.trash\)/);
  assert.match(desk, /\.title\('Trash \(bring things back\)'\)/);
  assert.match(desk, /'trashedItem',/); // in PLACED, so the safety net never lists it
});

test('the site never reads the Trash', () => {
  assert.ok(!read('./queries.ts').includes('trashedItem'));
});

test('the checkup says how many things are in the Trash, and nothing else counts them', () => {
  const c = CHECKS.find((x) => x.id === 'things-in-trash');
  assert.ok(c);
  assert.equal(c.evaluate(0, 0), null);
  const r = c.evaluate(2, 0);
  assert.equal(r?.severity, 'For information');
  assert.equal(r?.label, '2 things in the Trash');
  assert.deepEqual(r?.target, { pane: DESK.trash });
  // No other check looks at trashedItem: a trashed original is deleted, so it
  // cannot be counted as a photo, a clearance item or an unpublished change.
  for (const other of CHECKS.filter((x) => x.id !== 'things-in-trash')) {
    assert.ok(!other.query.includes('trashedItem'), other.id);
  }
});

// ── Drag order ────────────────────────────────────────────────────────────────

test('every ordered list on the site uses the tolerant drag order', () => {
  const q = read('./queries.ts');
  assert.match(q, /export const RANK_ORDER = 'orderRank asc, displayOrder asc';/);
  for (const type of [
    'galleryItem',
    'clearanceItem',
    'pricingTier',
    'faqItem',
    'font',
    'itemCategory',
  ]) {
    const bare = new RegExp(`_type == "${type}"[^\`]*?\\| order\\(displayOrder asc\\)`);
    assert.ok(!bare.test(q), `${type} still orders by displayOrder alone`);
  }
  // categories, gallery, featured gallery, fonts, clearance, price tags, FAQ x2
  assert.equal((q.match(/order\(\$\{RANK_ORDER\}\)/g) ?? []).length, 8);
  assert.equal((q.match(/order\(featured desc, \$\{RANK_ORDER\}\)/g) ?? []).length, 1);
  // Threads stay sorted by hue in code, so their query is unchanged.
  assert.match(q, /_type == "threadColor"\] \| order\(colorFamily asc, displayOrder asc\)/);
  // The FAQ hands the accordion its drag position, tolerant of no rank.
  assert.equal((q.match(/\$\{FAQ_POSITION\}/g) ?? []).length, 2);
  assert.match(q, /select\(\s*defined\(orderRank\) => count\(/);
});

test('the six drag-ordered types carry orderRank and hide the old number', () => {
  for (const t of [
    'galleryItem',
    'clearanceItem',
    'pricingTier',
    'faqItem',
    'font',
    'itemCategory',
  ]) {
    const src = read(`../sanity/schemaTypes/${t}.ts`);
    assert.ok(src.includes(`orderRankField({ type: '${t}', newItemPosition: 'after' })`), t);
    const block = src.slice(
      src.indexOf("name: 'displayOrder'"),
      src.indexOf("name: 'displayOrder'") + 400,
    );
    assert.match(block, /hidden: true/, `${t} displayOrder is not hidden`);
  }
  assert.ok(!read('../sanity/schemaTypes/threadColor.ts').includes('orderRankField'));
});

test('the drag lists have no developer menu and say how to use them', () => {
  const desk = read('../sanity/structure.ts');
  assert.match(desk, /DRAG_HINT = 'drag to put them in the order you want'/);
  assert.match(desk, /child\.menuItems = \[/);
  assert.equal((desk.match(/dragList\(S, context, \{/g) ?? []).length, 6);
});

// ── Share link ────────────────────────────────────────────────────────────────

test('share links only for pages the preview route can draw', () => {
  const resolve = read('../sanity/resolve.ts');
  const block = resolve.slice(resolve.indexOf('SINGLETON_PREVIEW_PATHS'), resolve.indexOf('};'));
  const paths = [...block.matchAll(/'(\/preview[^']*)'/g)].map((m) => m[1]);
  assert.deepEqual([...FIXED_PREVIEW_PATHS].sort(), paths.sort());
  assert.ok(canPreviewPath('/preview'));
  assert.ok(canPreviewPath('/preview/pricing'));
  assert.ok(canPreviewPath('/preview/towels-linens'));
  assert.ok(!canPreviewPath('/preview/legal/privacy'));
  assert.ok(!canPreviewPath(null));
  assert.ok(!canPreviewPath('/pricing'));
  assert.ok(shareLinksWorkHere('https:'));
  assert.ok(!shareLinksWorkHere('http:'));
});

test('the share link words are hers', () => {
  assert.equal(SHARE_LABEL, 'Copy a link so someone can see this before it is on your website');
  assert.match(SHARE_COPIED, /about an hour/);
  for (const w of [SHARE_LABEL, SHARE_COPIED, SHARE_LOCAL_ONLY]) {
    for (const j of JARGON) assert.ok(!j.re.test(w), `"${w}": ${j.why}`);
    assert.ok(!/\bdraft\b/i.test(w), `"${w}" says draft`);
  }
  // The PORTABLE file is used for its helpers only, never its words.
  const action = read('../sanity/actions/shareLink.tsx');
  assert.match(action, /import \{ previewPathFor \} from '\.\.\/components\/shareDraftLink'/);
  assert.ok(!action.includes('shareDraftLinkAction'));
});

// ── Google preview ────────────────────────────────────────────────────────────

test('Google length hints are soft and in letters', () => {
  assert.equal(titleHint(0).text, '');
  assert.equal(titleHint(45).tone, 'ok');
  assert.match(
    titleHint(72).text,
    /72 letters\. Google shows about 60, so the end may be cut off\./,
  );
  assert.equal(titleHint(10).tone, 'soft');
  assert.equal(descriptionHint(150).tone, 'ok');
  assert.match(descriptionHint(200).text, /about 160/);
  assert.match(descriptionHint(40).text, /A little short/);
  for (const n of [5, 45, 72, 40, 150, 200]) {
    for (const h of [titleHint(n), descriptionHint(n)]) {
      for (const j of JARGON) assert.ok(!j.re.test(h.text), `"${h.text}": ${j.why}`);
    }
  }
});

test('the Google preview sits in "Google and sharing" on the twelve pages and is an input', () => {
  for (const t of [
    'homePage',
    'aboutPage',
    'howItWorksPage',
    'pricingPage',
    'requestAQuotePage',
    'shopIndexPage',
    'styleGalleryPage',
    'fontGuidePage',
    'threadChartPage',
    'clearancePage',
    'itemCategory',
    'legalPage',
  ]) {
    const src = read(`../sanity/schemaTypes/${t}.ts`);
    const at = src.indexOf("name: 'seoPreview'");
    assert.ok(at > 0, `${t} has no Google preview`);
    // First of the Google boxes: before the title or description box.
    const next = Math.min(
      ...["name: 'seoTitle'", "name: 'seoDescription'"]
        .map((n) => src.indexOf(n))
        .filter((i) => i >= 0),
    );
    assert.ok(at < next, `${t}: the preview is not above the Google boxes`);
  }
  const shared = read('../sanity/schemaTypes/_seoPreview.ts');
  assert.match(shared, /components: \{ input: GooglePreviewInput \}/);
  // An INPUT, never a document view (useFormValue throws outside the form).
  assert.ok(!read('../sanity/structure.ts').includes('GooglePreviewInput'));
});

// ── Locked addresses ──────────────────────────────────────────────────────────

test('shop category and legal page addresses lock once published', () => {
  for (const t of ['itemCategory', 'legalPage']) {
    const src = read(`../sanity/schemaTypes/${t}.ts`);
    const block = src.slice(src.indexOf("name: 'slug'"), src.indexOf("name: 'slug'") + 900);
    assert.match(block, /components: \{ input: LockedAddressInput \}/, t);
  }
  const input = read('../sanity/components/LockedAddressInput.tsx');
  assert.match(input, /Ask Nathan to change this: it changes the page address\./);
  // Locked by the PUBLISHED copy, not by the box's own value.
  assert.match(input, /useEditState\(publishedId, type\)/);
  assert.match(input, /if \(!publishedSlug\) return props\.renderDefault\(props\);/);
});
