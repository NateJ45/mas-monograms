// =============================================================================
// page-fields - the registry, and the DRIFT GATE that keeps it honest
// =============================================================================
// src/lib/page-fields.ts duplicates knowledge that lives in the schema, because
// the preview island cannot ask the Studio which fields a page has. The
// duplication is only safe while something checks it, so the first half of this
// file READS FOUR SOURCES and fails when they and the registry disagree:
//
//   - src/sanity/schemaTypes/index.ts, for which page singletons are
//     REGISTERED. An unregistered schema is a file, not a page.
//   - each page schema, for which top-level text fields each page declares.
//   - the PAGE FILES (and the home page's section components), for which of
//     those fields each page actually draws as words. Since 2026-10-05 the
//     canvas renders those very files (src/pages/preview/[...slug].astro), so
//     "the page draws it" is "the canvas draws it".
//   - the preview route, for whether every page is really rendered from its
//     own file.
//
// Coverage runs both ways: every registered line must be declared AND drawn on
// exactly the pages it claims, and every text field a page draws must be either
// registered or listed in NOT_A_CARD with the reason. A new line on a page
// therefore forces a decision instead of quietly having no card.
//
// It also gates the two controls this site deliberately does NOT have. Those
// absences are decisions, not oversights, and a decision that nothing measures
// quietly becomes a bug the day somebody adds a `tone` field.
// =============================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  EDITABLE_LINES,
  PAGE_TYPES,
  cleanLine,
  overlayControlsForPath,
  resolveTextTarget,
} from './page-fields.ts';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const SCHEMA_INDEX = read('../sanity/schemaTypes/index.ts');
const PREVIEW_ROUTE = read('../pages/preview/[...slug].astro');
const HERO = read('../components/Hero.astro');
const HOME_HERO = read('../components/home/HomeHero.astro');

/**
 * Where each page's words are drawn. The page file itself, plus, for the home
 * page, the section components it is built from (each takes `page` whole). The
 * 404 is the one page drawn by a body component (see src/pages/404.astro).
 */
const RENDER_SOURCES: Record<string, string[]> = {
  homePage: [
    '../pages/index.astro',
    '../components/home/HomeHero.astro',
    '../components/home/HoopWall.astro',
    '../components/home/MakerBand.astro',
    '../components/home/ProcessPath.astro',
    '../components/home/StudioWall.astro',
    '../components/home/FinalCta.astro',
  ],
  howItWorksPage: ['../pages/how-it-works.astro'],
  pricingPage: ['../pages/pricing.astro'],
  aboutPage: ['../pages/about.astro'],
  requestAQuotePage: ['../pages/request-a-quote.astro'],
  shopIndexPage: ['../pages/shop-by-item.astro'],
  styleGalleryPage: ['../pages/style-gallery.astro'],
  fontGuidePage: ['../pages/font-lettering-guide.astro'],
  threadChartPage: ['../pages/thread-color-chart.astro'],
  clearancePage: ['../pages/clearance.astro'],
  thankYouPage: ['../pages/thank-you.astro'],
  notFoundPage: ['../components/pages/NotFoundBody.astro'],
};

/**
 * Text fields a page DOES read, deliberately left to the form, with the reason.
 * Each is a value that never shows as a line of words of its own.
 */
const NOT_A_CARD: Record<string, string> = {
  namePlaceholder: 'a placeholder inside an empty box, not a line on the page',
  emailPlaceholder: 'a placeholder inside an empty box',
  phonePlaceholder: 'a placeholder inside an empty box',
  itemDescriptionPlaceholder: 'a placeholder inside an empty box',
  quantityPlaceholder: 'a placeholder inside an empty box',
  monogramDetailsPlaceholder: 'a placeholder inside an empty box',
  placementPlaceholder: 'a placeholder inside an empty box',
  colorPreferencePlaceholder: 'a placeholder inside an empty box',
  specialInstructionsPlaceholder: 'a placeholder inside an empty box',
  noScriptMessage: 'only shown to a visitor whose browser has JavaScript off',
  resultsAnnouncement: 'a {filter}/{count} template read aloud to screen readers',
  fontCaption: 'a {font} template filled in per photo',
  moreTagsLabel: 'a {count} template on a button',
  quantityLeftLabel: 'a {count} template filled in per item',
  filterGroupName: 'a screen-reader name for the filter group',
  lightboxLabel: 'a screen-reader name for the photo viewer',
  lightboxCloseLabel: 'a screen-reader name for a button',
  lightboxPrevLabel: 'a screen-reader name for a button',
  lightboxNextLabel: 'a screen-reader name for a button',
};

const sources = new Map<string, string>(
  PAGE_TYPES.map((type) => [type, read(`../sanity/schemaTypes/${type}.ts`)]),
);
const rendered = new Map<string, string>(
  PAGE_TYPES.map((type) => [type, (RENDER_SOURCES[type] ?? []).map(read).join('\n')]),
);

/**
 * The TOP-LEVEL field names a page schema declares, in schema order.
 *
 * Top level only, and deliberately: a nested object inside a repeatable array
 * may carry a field of the same name (an array of steps with its own `label`),
 * and a card that matched one of those would write to the document root. The
 * page schemas indent a top-level `defineField` by exactly four spaces, in one
 * of the two shapes below.
 */
function topLevelFields(source: string): string[] {
  const inline = [...source.matchAll(/^ {4}defineField\(\{ name: '(\w+)'/gm)].map((m) => m[1]);
  const wrapped = [...source.matchAll(/^ {4}defineField\(\{\n {6}name: '(\w+)',/gm)].map(
    (m) => m[1],
  );
  return [...inline, ...wrapped];
}

/** The top-level fields whose type is a line of words (string or text). */
function topLevelTextFields(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(/^ {4}defineField\(\{\s*name: '(\w+)',[\s\S]*?type: '(\w+)'/gm)) {
    if (m[2] === 'string' || m[2] === 'text') out.push(m[1]);
  }
  return out;
}

/** Whether a page's markup reads this field off its document. */
function draws(type: string, field: string): boolean {
  return new RegExp(`\\b(page|L|category)(\\?)?\\.${field}\\b`).test(rendered.get(type) ?? '');
}

// Sanity's stega payload is a run of invisible characters appended to a string.
const STEGA_TAIL = '​‌‍﻿​‌';
const encoded = (text: string) => text + STEGA_TAIL;

// =============================================================================
// The drift gate
// =============================================================================

test('the gate parsed the schemas and the pages at all', () => {
  assert.ok(topLevelFields(sources.get('homePage')!).includes('heroHeadline'));
  assert.ok(topLevelFields(sources.get('notFoundPage')!).includes('headline'));
  assert.ok(topLevelTextFields(sources.get('homePage')!).includes('heroHeadline'));
  assert.ok(draws('homePage', 'heroHeadline'));
  assert.ok(draws('notFoundPage', 'headline'));
});

test('PAGE_TYPES lists exactly the page singletons the Studio registers', () => {
  // The registered list is the block between the two section comments in
  // schemaTypes/index.ts. Anything outside it is a collection or a helper doc.
  const block = SCHEMA_INDEX.slice(
    SCHEMA_INDEX.indexOf('Singleton pages'),
    SCHEMA_INDEX.indexOf('Collections'),
  );
  const registered = [...block.matchAll(/^ {2}(\w+),$/gm)]
    .map((m) => m[1])
    .filter((name) => name !== 'siteSettings' && name !== 'atelierSettings');
  assert.deepEqual([...PAGE_TYPES], registered);
  assert.deepEqual(Object.keys(RENDER_SOURCES).sort(), [...PAGE_TYPES].sort());
});

test('every page is rendered in the canvas from its own markup', () => {
  // The preview route imports each page file (or, for the 404, its body) and
  // renders it. A page missing here would preview as nothing at all.
  const files: Record<string, string> = {
    homePage: '../index.astro',
    howItWorksPage: '../how-it-works.astro',
    pricingPage: '../pricing.astro',
    aboutPage: '../about.astro',
    requestAQuotePage: '../request-a-quote.astro',
    shopIndexPage: '../shop-by-item.astro',
    styleGalleryPage: '../style-gallery.astro',
    fontGuidePage: '../font-lettering-guide.astro',
    threadChartPage: '../thread-color-chart.astro',
    clearancePage: '../clearance.astro',
    thankYouPage: '../thank-you.astro',
    notFoundPage: '@/components/pages/NotFoundBody.astro',
  };
  for (const [type, file] of Object.entries(files)) {
    assert.ok(
      PREVIEW_ROUTE.includes(`from '${file}'`),
      `${type}: the route does not import ${file}`,
    );
    assert.ok(PREVIEW_ROUTE.includes(`type: '${type}'`), `${type}: the route has no entry for it`);
  }
  assert.ok(PREVIEW_ROUTE.includes(`from '../[slug].astro'`), 'category pages are not rendered');
});

test('every line in the registry is declared AND drawn on exactly the pages it claims', () => {
  for (const line of EDITABLE_LINES) {
    const expected = PAGE_TYPES.filter(
      (type) => topLevelFields(sources.get(type)!).includes(line.name) && draws(type, line.name),
    );
    assert.ok(expected.length > 0, `${line.name}: no page declares and draws it`);
    assert.deepEqual(
      [...line.onTypes].sort(),
      expected.sort(),
      `${line.name}: onTypes does not match the pages that declare and draw it`,
    );
  }
});

test('every line in the registry is a line of words', () => {
  for (const line of EDITABLE_LINES) {
    for (const type of line.onTypes) {
      assert.ok(
        topLevelTextFields(sources.get(type)!).includes(line.name),
        `${line.name} on ${type} is not a string or text field`,
      );
    }
    assert.ok(line.rows >= 1 && line.rows <= 4, `${line.name}: rows out of range`);
    assert.ok(line.label.trim().length > 0, `${line.name}: no label`);
    assert.ok(!/—/.test(line.label), `${line.name}: an em-dash in a label she reads`);
  }
});

test('every text field a page draws is either a card or deliberately not one', () => {
  const registered = new Set(EDITABLE_LINES.map((line) => line.name));
  const missing: string[] = [];
  for (const type of PAGE_TYPES) {
    for (const field of topLevelTextFields(sources.get(type)!)) {
      if (/^seo/.test(field) || /Href$/.test(field)) continue; // Google words and addresses
      if (!draws(type, field)) continue;
      if (!registered.has(field) && !NOT_A_CARD[field]) missing.push(`${type}.${field}`);
    }
  }
  assert.deepEqual(missing, [], 'decide: add these to EDITABLE_LINES or to NOT_A_CARD');
});

test('nothing in NOT_A_CARD is also a card', () => {
  for (const line of EDITABLE_LINES) assert.ok(!NOT_A_CARD[line.name], line.name);
});

test('finalCtaHeadline is deliberately absent: no registered page declares it', () => {
  // Starter inheritance (the sibling repos' closing banner field). The home
  // page's closing banner here is `finalHeadline`.
  const declaring = PAGE_TYPES.filter((type) =>
    topLevelFields(sources.get(type)!).includes('finalCtaHeadline'),
  );
  assert.deepEqual(declaring, []);
  assert.equal(overlayControlsForPath('finalCtaHeadline').length, 0);
});

test('there is no band colour to offer: no page declares a surface field', () => {
  // The reason this layer has no colour card. If one of these ever appears, the
  // decision about whether an editor may set it has to be made on purpose.
  for (const type of PAGE_TYPES) {
    const fields = topLevelFields(sources.get(type)!);
    for (const banned of ['background', 'backgroundColor', 'tone', 'surface', 'theme']) {
      assert.ok(!fields.includes(banned), `${type} now declares '${banned}'`);
    }
  }
});

test('there is no accent word to pick: no page feeds splitScriptAccent', () => {
  // SectionHeading has a `.font-script` branch, but Hero declares no
  // `scriptAccent` prop and no page schema declares the field, so nothing can
  // reach it. A pick-a-word control would promise a flourish nothing draws.
  for (const type of PAGE_TYPES) {
    const fields = topLevelFields(sources.get(type)!);
    assert.ok(!fields.includes('scriptAccent'), `${type} now declares 'scriptAccent'`);
    assert.ok(!fields.includes('heroScriptAccent'), `${type} now declares 'heroScriptAccent'`);
  }
  assert.ok(!HERO.includes('scriptAccent'), 'Hero.astro now takes a scriptAccent prop');
});

test('heroItalicWord is APPENDED after the headline, not matched inside it', () => {
  // Why it gets a plain text card rather than a pick-a-word picker: the home
  // hero writes the headline, then a space, then the words in the swash italic.
  assert.match(
    HOME_HERO,
    /\{headline\}\s*\{\s*swash && \(\s*<>\s*\{' '\}\s*<em class="swash/,
    'HomeHero no longer appends the italic words; re-decide what control it gets',
  );
});

// =============================================================================
// The lookups
// =============================================================================

test('overlayControlsForPath offers the text card on a registry field', () => {
  assert.deepEqual(overlayControlsForPath('heroHeadline'), ['text']);
  assert.deepEqual(overlayControlsForPath('ctaLabel'), ['text']);
  assert.deepEqual(overlayControlsForPath('heroItalicWord'), ['text']);
  assert.deepEqual(overlayControlsForPath('makerQuote'), ['text']);
  assert.deepEqual(overlayControlsForPath('ctaEyebrow'), ['text']);
});

test('overlayControlsForPath leaves everything else to the host overlay', () => {
  assert.deepEqual(overlayControlsForPath('seoTitle'), []);
  assert.deepEqual(overlayControlsForPath('heroImages'), []);
  assert.deepEqual(overlayControlsForPath('processSteps[_key=="a"].label'), []);
  assert.deepEqual(overlayControlsForPath('hero.heroHeadline'), []);
  assert.deepEqual(overlayControlsForPath('namePlaceholder'), []);
  assert.deepEqual(overlayControlsForPath(''), []);
  assert.deepEqual(overlayControlsForPath(undefined), []);
});

test('never offers two controls on one element, which would stack them', () => {
  for (const line of EDITABLE_LINES) {
    assert.equal(overlayControlsForPath(line.name).length, 1);
  }
  const names = EDITABLE_LINES.map((line) => line.name);
  assert.equal(new Set(names).size, names.length, 'a field is registered twice');
});

test('resolveTextTarget points the card at the field and seeds it', () => {
  const doc = { _type: 'homePage', heroHeadline: 'Made just for you' };
  assert.deepEqual(resolveTextTarget(doc, 'heroHeadline'), {
    path: ['heroHeadline'],
    text: 'Made just for you',
    label: 'Headline',
    rows: 2,
  });
});

test('resolveTextTarget refuses a field this page type does not carry', () => {
  // The per-instance gate. Only the home page has words to slant.
  assert.ok(resolveTextTarget({ _type: 'homePage', heroItalicWord: 'you' }, 'heroItalicWord'));
  assert.equal(
    resolveTextTarget({ _type: 'aboutPage', heroItalicWord: 'you' }, 'heroItalicWord'),
    null,
  );
  assert.equal(resolveTextTarget({ _type: 'notFoundPage' }, 'heroHeadline'), null);
  assert.equal(resolveTextTarget({ _type: 'homePage' }, 'headline'), null);
});

test('resolveTextTarget refuses a document it cannot identify', () => {
  assert.equal(resolveTextTarget(null, 'heroHeadline'), null);
  assert.equal(resolveTextTarget({}, 'heroHeadline'), null);
  assert.equal(resolveTextTarget({ _type: 'homePage' }, 'nothingLikeThis'), null);
});

test('an empty field opens an empty box rather than refusing', () => {
  // A page that has never had a banner headline typed into it is exactly when
  // the card is most useful.
  assert.deepEqual(resolveTextTarget({ _type: 'aboutPage' }, 'ctaHeadline')?.text, '');
});

test('never lets a stega payload into the box', () => {
  const doc = { _type: 'homePage', heroHeadline: encoded('Made just for you') };
  assert.equal(resolveTextTarget(doc, 'heroHeadline')?.text, 'Made just for you');
  assert.equal(cleanLine(encoded('Ask')), 'Ask');
  assert.equal(cleanLine(undefined), '');
  assert.equal(cleanLine(42), '');
});
