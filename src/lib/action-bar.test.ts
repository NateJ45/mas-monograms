// Safe to edit by hand
// The phone action bar on MAS Monograms' own routes (PORTS.md card 191). The starter's
// wayfinding.test.ts is not copied: it treats /pricing/ as a Studio page and routes a `page`
// document, and this site serves /pricing/ itself and has no `page` route. These cases pin
// pickActionBar() (PORTABLE src/lib/wayfinding.ts) against this site's nav-href.ts table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickActionBar } from './wayfinding.ts';

const quote = { label: 'Request a Quote', docType: 'requestAQuotePage' };
const everyPage = { everyPage: true, text: 'I reply within 1 business day', action: quote };

test('the every-page quote bar shows on every page but the quote page itself', () => {
  for (const here of ['/', '/how-it-works/', '/pricing/', '/towels/', '/legal/privacy/']) {
    assert.deepEqual(pickActionBar([everyPage], here), {
      text: 'I reply within 1 business day',
      label: 'Request a Quote',
      href: '/request-a-quote/',
    });
  }
  // Never a button to the page you are on, with or without the trailing slash.
  assert.equal(pickActionBar([everyPage], '/request-a-quote/'), null);
  assert.equal(pickActionBar([everyPage], '/request-a-quote'), null);
});

test("a page's own bar wins over the every-page bar, item categories included", () => {
  const towels = {
    page: { docType: 'itemCategory', slug: 'towels' },
    text: 'Towels in 3 to 7 days',
    action: quote,
  };
  const pricing = { page: { docType: 'pricingPage' }, action: { ...quote, label: 'Get a price' } };
  const bars = [everyPage, towels, pricing];
  assert.equal(pickActionBar(bars, '/towels/')?.text, 'Towels in 3 to 7 days');
  assert.equal(pickActionBar(bars, '/pricing/')?.label, 'Get a price');
  assert.equal(pickActionBar(bars, '/pricing/')?.text, '');
  assert.equal(pickActionBar(bars, '/about/')?.text, 'I reply within 1 business day');
});

test('no bar, a bar with no button words, or no every-page bar draws nothing', () => {
  assert.equal(pickActionBar(null, '/'), null);
  assert.equal(pickActionBar([], '/'), null);
  assert.equal(pickActionBar([{ everyPage: true, text: 'No button' }], '/'), null);
  assert.equal(
    pickActionBar([{ everyPage: true, action: { docType: 'requestAQuotePage' } }], '/'),
    null,
  );
  assert.equal(pickActionBar([{ page: { docType: 'pricingPage' }, action: quote }], '/'), null);
});
