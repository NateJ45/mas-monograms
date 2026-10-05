// "What needs attention": the checkup's pure logic, without Sanity.
// Each check is a query plus a pure evaluate(); these tests feed evaluate() the
// shapes the queries return and check what Mary Ann would read.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHECKS,
  HEADLINE_PAGES,
  isAllClear,
  isStripeLink,
  listNames,
  runChecks,
  TYPE_NAMES,
  type Check,
} from './studio-checkup.ts';
import { DESK } from '../sanity/studioTargets.ts';
import { JARGON } from '../../scripts/audit-studio.mjs';

const NOW = Date.parse('2026-10-05T12:00:00Z');
const check = (id: string): Check => {
  const c = CHECKS.find((x) => x.id === id);
  assert.ok(c, `no check "${id}"`);
  return c;
};

test('every check id is unique', () => {
  const ids = CHECKS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every check reports nothing on an empty answer', () => {
  for (const c of CHECKS) {
    for (const empty of [null, [], 0]) {
      assert.equal(c.evaluate(empty, NOW), null, `${c.id} reported on ${JSON.stringify(empty)}`);
    }
  }
});

test('photos with no description: one opens the photo on its photo box', () => {
  const r = check('photo-description-missing').evaluate([{ _id: 'g1' }], NOW);
  assert.equal(r?.severity, 'Needs doing');
  assert.deepEqual(r?.target, { doc: 'g1', type: 'galleryItem', field: 'image' });
  const many = check('photo-description-missing').evaluate([{ _id: 'a' }, { _id: 'b' }], NOW);
  assert.match(many!.label, /^2 photos/);
  assert.deepEqual(many?.target, { pane: DESK.photos });
});

test('isStripeLink accepts buy.stripe.com and refuses anything else', () => {
  assert.equal(isStripeLink('https://buy.stripe.com/abc123'), true);
  assert.equal(isStripeLink('https://stripe.com/x'), true);
  assert.equal(isStripeLink('http://buy.stripe.com/abc'), false);
  assert.equal(isStripeLink('https://notstripe.com/abc'), false);
  assert.equal(isStripeLink('https://buy.stripe.com.evil.example/abc'), false);
  assert.equal(isStripeLink(''), false);
  assert.equal(isStripeLink(null), false);
  assert.equal(isStripeLink('not a link'), false);
});

test('a broken Buy button is "Needs doing" and names the item', () => {
  const r = check('stripe-link-broken').evaluate(
    [
      { _id: 'ok', name: 'Fine', stripePaymentLink: 'https://buy.stripe.com/x' },
      { _id: 'c1', name: 'Napkins JKL', stripePaymentLink: '' },
    ],
    NOW,
  );
  assert.equal(r?.severity, 'Needs doing');
  assert.match(r!.detail, /Napkins JKL/);
  assert.deepEqual(r?.target, { doc: 'c1', type: 'clearanceItem', field: 'stripePaymentLink' });
  assert.equal(
    check('stripe-link-broken').evaluate(
      [{ _id: 'ok', name: 'Fine', stripePaymentLink: 'https://buy.stripe.com/x' }],
      NOW,
    ),
    null,
  );
});

test('a missing headline names the page in her words and opens its headline box', () => {
  const r = check('headline-missing').evaluate(
    [
      { _id: 'homePage', _type: 'homePage', heroHeadline: 'Hello' },
      { _id: 'thankYouPage', _type: 'thankYouPage', headline: '  ' },
    ],
    NOW,
  );
  assert.match(r!.detail, /Thank You page/);
  assert.deepEqual(r?.target, { doc: 'thankYouPage', type: 'thankYouPage', field: 'headline' });
  for (const type of Object.keys(HEADLINE_PAGES)) assert.ok(TYPE_NAMES[type], type);
});

test('none left but not sold is worth a look; sold items are only information', () => {
  const r = check('clearance-none-left').evaluate([{ _id: 'c', name: 'Tote' }], NOW);
  assert.equal(r?.severity, 'Worth a look');
  const s = check('clearance-sold-still-shown').evaluate([{ _id: 'c', name: 'Tote' }], NOW);
  assert.equal(s?.severity, 'For information');
});

test('unpublished changes list what they are, and ignore system records', () => {
  const c = check('unpublished-changes');
  assert.equal(c.evaluate([{ _id: 'drafts.secret', _type: 'sanity.previewUrlSecret' }], NOW), null);
  const r = c.evaluate(
    [
      { _id: 'drafts.homePage', _type: 'homePage' },
      { _id: 'drafts.g1', _type: 'galleryItem' },
      { _id: 'drafts.g2', _type: 'galleryItem' },
    ],
    NOW,
  );
  assert.match(r!.label, /^3 changes not on your website yet/);
  assert.match(r!.detail, /Home page and 2 photos of your work/);
  assert.deepEqual(r?.target, { doc: 'homePage', type: 'homePage' });
  assert.ok(c.query.includes('!(_type match "sanity.*")'));
});

test('the last publish reads as today, yesterday or N days ago', () => {
  const c = check('last-publish');
  assert.match(c.evaluate({ _updatedAt: '2026-10-05T09:00:00Z' }, NOW)!.label, /today$/);
  assert.match(c.evaluate({ _updatedAt: '2026-10-04T09:00:00Z' }, NOW)!.label, /yesterday$/);
  assert.match(c.evaluate({ _updatedAt: '2026-09-25T09:00:00Z' }, NOW)!.label, /10 days ago$/);
  assert.equal(c.evaluate({ _updatedAt: 'nonsense' }, NOW), null);
});

test('runChecks survives a failing check and sorts by severity', async () => {
  const checks: Check[] = [
    {
      id: 'info',
      query: 'i',
      evaluate: () => ({ severity: 'For information', label: 'i', detail: '' }),
    },
    {
      id: 'boom',
      query: 'b',
      evaluate: () => ({ severity: 'Needs doing', label: 'b', detail: '' }),
    },
    {
      id: 'must',
      query: 'm',
      evaluate: () => ({ severity: 'Needs doing', label: 'm', detail: '' }),
    },
  ];
  const results = await runChecks(
    async (q) => {
      if (q === 'b') throw new Error('network');
      return [];
    },
    NOW,
    checks,
  );
  assert.deepEqual(
    results.map((r) => r.id),
    ['must', 'info'],
  );
  assert.equal(isAllClear(results), false);
  assert.equal(isAllClear(results.filter((r) => r.id === 'info')), true);
});

test('listNames reads naturally', () => {
  assert.equal(listNames(['a']), 'a');
  assert.equal(listNames(['a', 'b']), 'a and b');
  assert.equal(listNames(['a', 'b', 'c']), 'a, b and c');
  assert.equal(listNames(['a', 'b', 'c', 'd', 'e', 'f'], 4), 'a, b, c, d and 2 more');
});

test('no finding she reads uses an em-dash or a developer word', () => {
  const samples: unknown[] = [
    [{ _id: 'a', name: 'X', stripePaymentLink: '' }],
    [{ _id: 'homePage', _type: 'homePage', heroHeadline: '' }],
    [{ _id: 'drafts.homePage', _type: 'homePage' }],
    { _updatedAt: '2026-10-01T00:00:00Z' },
    3,
    [{ _id: 'a', name: 'X' }],
  ];
  for (const c of CHECKS) {
    for (const s of samples) {
      let r;
      try {
        r = c.evaluate(s, NOW);
      } catch {
        continue; // a sample shaped for another check
      }
      if (!r) continue;
      for (const text of [r.label, r.detail, r.targetLabel ?? '']) {
        for (const j of JARGON) assert.ok(!j.re.test(text), `${c.id}: ${j.why} in "${text}"`);
      }
    }
  }
});
