// =============================================================================
// The Checkup's MAS Monograms rules (src/sanity/checkupRules.ts)
// =============================================================================
// The kit's generic rules have their own test (studio-checkup.test.ts,
// PORTABLE). These are the six rules only this site has, run through the
// kit's own runCheckup() so the shapes are the real ones.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCheckup, type Doc } from './studio-checkup.ts';
import { HEADLINE_PAGES, isStripeLink, MAS_RULES } from '../sanity/checkupRules.ts';

const titles: Record<string, string> = { homePage: 'Home page', clearanceItem: 'Clearance item' };
const run = (docs: Doc[]) =>
  runCheckup(docs, MAS_RULES, {
    nameOf: (d) => String(d.name ?? titles[d._type] ?? d._type),
    typeTitle: (t) => titles[t] ?? t,
  });
const byId = (docs: Doc[], id: string) => run(docs).find((r) => r.id === id);

test('a Stripe link must be https on stripe.com', () => {
  assert.equal(isStripeLink('https://buy.stripe.com/abc'), true);
  assert.equal(isStripeLink('https://stripe.com/x'), true);
  assert.equal(isStripeLink('http://buy.stripe.com/abc'), false);
  assert.equal(isStripeLink('https://stripe.com.evil.example/x'), false);
  assert.equal(isStripeLink(''), false);
  assert.equal(isStripeLink(undefined), false);
});

test('an unsold clearance item with no working link Needs doing, by name', () => {
  const r = byId(
    [
      { _id: 'a', _type: 'clearanceItem', name: 'Blue tote', stripePaymentLink: '' },
      { _id: 'b', _type: 'clearanceItem', name: 'Sold hat', sold: true },
      {
        _id: 'c',
        _type: 'clearanceItem',
        name: 'Good',
        stripePaymentLink: 'https://buy.stripe.com/x',
      },
    ],
    'stripe-link-broken',
  );
  assert.ok(r);
  assert.equal(r.severity, 'Needs doing');
  assert.deepEqual(
    r.items?.map((i) => i.name),
    ['Blue tote'],
  );
  assert.deepEqual(r.target, { doc: 'a', type: 'clearanceItem', field: 'stripePaymentLink' });
});

test('a page with an empty headline is found; a filled one is not', () => {
  const r = byId(
    [
      { _id: 'homePage', _type: 'homePage', heroHeadline: ' ' },
      { _id: 'pricingPage', _type: 'pricingPage', heroHeadline: 'Prices' },
    ],
    'headline-missing',
  );
  assert.ok(r);
  assert.equal(r.items?.length, 1);
  assert.equal(
    r.items?.[0].target && 'field' in r.items[0].target && r.items[0].target.field,
    'heroHeadline',
  );
  assert.equal(HEADLINE_PAGES.thankYouPage, 'headline');
});

test('none left but not Sold is Worth a look; sold items are only for information', () => {
  const docs: Doc[] = [
    {
      _id: 'a',
      _type: 'clearanceItem',
      name: 'Towel',
      quantityAvailable: 0,
      stripePaymentLink: 'https://buy.stripe.com/x',
    },
    { _id: 'b', _type: 'clearanceItem', name: 'Hat', sold: true },
  ];
  assert.equal(byId(docs, 'clearance-none-left')?.severity, 'Worth a look');
  assert.equal(byId(docs, 'clearance-sold-still-shown')?.severity, 'For information');
});

test('a font with no stitched photo, and photos kept out of the hoops', () => {
  const docs: Doc[] = [
    { _id: 'f', _type: 'font', name: 'Script' },
    { _id: 'g', _type: 'font', name: 'Block', previewImage: { asset: { _ref: 'image-x' } } },
    { _id: 'p', _type: 'galleryItem', hoopFit: 'poor' },
  ];
  assert.deepEqual(
    byId(docs, 'font-no-photo')?.items?.map((i) => i.name),
    ['Script'],
  );
  assert.equal(byId(docs, 'photos-kept-out-of-hoops')?.severity, 'For information');
});

test('nothing wrong: no findings at all', () => {
  assert.deepEqual(run([]), []);
});

test('no rule uses an em-dash or the word draft', () => {
  const docs: Doc[] = [
    { _id: 'a', _type: 'clearanceItem', name: 'X', quantityAvailable: 0 },
    { _id: 'b', _type: 'clearanceItem', name: 'Y', sold: true },
    { _id: 'homePage', _type: 'homePage' },
    { _id: 'f', _type: 'font', name: 'Z' },
    { _id: 'p', _type: 'galleryItem', hoopFit: 'poor' },
  ];
  const results = run(docs);
  assert.ok(results.length >= 5);
  for (const r of results) {
    const words = [r.label, r.detail, r.targetLabel ?? '', r.itemLabel ?? ''].join(' ');
    assert.ok(!words.includes('\u2014'), r.id);
    assert.ok(!/\bdraft\b/i.test(words), r.id);
  }
});

test('a season page that would show no photos Needs doing; a tag match or a pick clears it', () => {
  const photo = { _id: 'p', _type: 'galleryItem', tags: ['Christmas'] };
  const empty = { _id: 'c1', _type: 'collection', name: 'Wedding season', photoTags: ['wedding'] };
  const tagged = { _id: 'c2', _type: 'collection', name: 'Christmas', photoTags: ['christmas '] };
  const picked = { _id: 'c3', _type: 'collection', name: 'Baby', photos: [{ _ref: 'p' }] };
  const r = byId([photo, empty, tagged, picked], 'collection-no-photos');
  assert.equal(r?.severity, 'Needs doing');
  assert.deepEqual(
    r?.items?.map((i) => i.name),
    ['Wedding season'],
  );
});

test('a switched-on notice past its last day is only for information', () => {
  const now = Date.now();
  const docs: Doc[] = [
    {
      _id: 'n1',
      _type: 'announcement',
      enabled: true,
      endDate: new Date(now - 86_400_000).toISOString(),
    },
    {
      _id: 'n2',
      _type: 'announcement',
      enabled: false,
      endDate: new Date(now - 86_400_000).toISOString(),
    },
    { _id: 'n3', _type: 'announcement', endDate: new Date(now + 86_400_000).toISOString() },
  ];
  const r = byId(docs, 'ended-notices');
  assert.equal(r?.severity, 'For information');
  assert.equal(r?.label, '1 notice past its last day');
});
