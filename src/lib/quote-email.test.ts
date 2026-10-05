// Unit tests for the quote emails (src/lib/quote-email.ts): escaping, the header
// art, the one-business-day promise and the required content of both bodies.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCustomerEmail,
  buildOwnerEmail,
  EMAIL_SEAL_URL,
  EMAIL_WORDMARK_URL,
  escapeHtml,
  formatNeededBy,
  parseInitials,
  telHref,
  type QuoteSubmission,
} from './quote-email.ts';

const base: QuoteSubmission = {
  submissionId: '1759641600000-a1b2c3',
  submittedAt: new Date('2026-10-05T14:32:00Z'),
  name: 'Jane Whitfield',
  email: 'jane@example.com',
  phone: '(803) 555-0142',
  referral: 'A friend',
  itemType: 'Towels & Linens',
  ownership: 'Yes',
  itemDescription: 'Hand towels\nFabric: White linen',
  quantity: '2',
  personalization: 'Your initials: JAW\nStyle: Classic trio',
  monogramStyle: 'Three-letter monogram',
  placement: 'Centered',
  size: 'About 3 inches',
  threadCount: '1',
  fontPreference: 'Classic',
  threadColor: 'Navy',
  neededBy: '2026-11-20',
  isRush: true,
  isGift: true,
  notes: 'Gift wrap please',
  attachmentNames: ['towel.jpg'],
};

const hostile: QuoteSubmission = {
  ...base,
  name: '<script>alert(1)</script>"Max"',
  email: 'x"onmouseover="alert(1)@example.com',
  phone: '"><img src=x>',
  itemType: '<img src=x onerror=alert(1)>Totes',
  personalization: '<b>bold</b>\n</td></tr></table>',
  notes: '<iframe src="https://evil.example"></iframe>',
  attachmentNames: ['<svg onload=alert(1)>.jpg'],
  referral: "'><a href=javascript:alert(1)>",
};

const both = (s: QuoteSubmission) => [buildOwnerEmail(s), buildCustomerEmail(s)];

test('escapeHtml escapes the five HTML metacharacters', () => {
  assert.equal(
    escapeHtml(`<a href="x">'&'</a>`),
    '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
  );
});

test('hostile form values never reach either body as markup', () => {
  for (const e of both(hostile)) {
    assert.ok(
      !/<script|<img src=x|<iframe|<svg|<b>bold|onmouseover="|<a href=javascript/i.test(e.html),
      e.subject,
    );
    assert.ok(
      e.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;') || e.html.includes('&lt;img src=x'),
    );
    // the layout tables survive a value that tries to close them
    assert.equal((e.html.match(/<table/g) ?? []).length, (e.html.match(/<\/table>/g) ?? []).length);
  }
});

test('both bodies carry the hosted logo with the production URL and alt text', () => {
  for (const e of both(base)) {
    assert.ok(e.html.includes(`src="${EMAIL_SEAL_URL}"`));
    assert.ok(e.html.includes(`src="${EMAIL_WORDMARK_URL}"`));
    assert.match(
      e.html,
      /<img src="https:\/\/mas-monograms\.com\/brand\/email-wordmark-v1\.png" width="220" height="31" alt="MAS Monograms" style="display:block;border:0;/,
    );
    assert.match(
      e.html,
      /<img src="https:\/\/mas-monograms\.com\/brand\/email-seal-v1\.png" width="72" height="72" alt=""/,
    );
    assert.ok(!/<svg|data:image/.test(e.html), 'no inline SVG or data: URIs');
    assert.ok(e.text.startsWith('MAS Monograms'), 'plain text opens with the name');
    assert.ok(Buffer.byteLength(e.html) < 60_000, 'well under Gmail clipping (102 KB)');
    assert.ok(!e.html.includes('—') && !e.text.includes('—'), 'no em-dashes');
  }
});

test('the customer is promised a reply within 1 business day, never 1 to 2', () => {
  const c = buildCustomerEmail(base);
  for (const body of [c.html, c.text]) {
    assert.ok(body.includes('within 1 business day'));
    assert.ok(!/1\s*[–-]\s*2 business|two business/i.test(body));
  }
});

test('customer email: summary, initials set large, next steps and every field', () => {
  const c = buildCustomerEmail(base, {
    email: 'mastone37@gmail.com',
    phone: '(803) 707-8576',
    city: 'St. Matthews',
    state: 'SC',
  });
  assert.ok(c.html.includes('Thank you, Jane.'));
  assert.ok(c.html.includes('>JAW</p>'));
  for (const v of [
    'Towels &amp; Linens (2)',
    'Classic',
    'Navy',
    'Fri, Nov 20, 2026',
    'towel.jpg',
    'White linen',
    'a rush fee may apply',
  ]) {
    assert.ok(c.html.includes(v), v);
  }
  assert.ok(c.html.includes('href="tel:8037078576"'));
  assert.ok(c.html.includes('St. Matthews, SC'));
  assert.match(c.text, /1\. I'll review your request/);
});

test('owner email: rush badge, reply button, tap to call, needed-by near the top, submission id', () => {
  const o = buildOwnerEmail(base);
  assert.equal(o.subject, 'New Quote Request from Jane Whitfield');
  assert.ok(o.html.includes('RUSH REQUESTED'));
  assert.ok(
    o.html.includes('href="mailto:jane@example.com?subject=Your%20MAS%20Monograms%20quote"'),
  );
  assert.ok(o.html.includes('href="tel:8035550142"'));
  assert.ok(o.html.indexOf('Fri, Nov 20, 2026') < o.html.indexOf('>Contact</h2>'));
  assert.ok(o.html.includes('1759641600000-a1b2c3'));
  for (const v of ['A friend', 'Gift wrap please', 'towel.jpg', 'About 3 inches', 'Centered']) {
    assert.ok(o.html.includes(v) && o.text.includes(v), v);
  }
  const plain = buildOwnerEmail({ ...base, isRush: false, phone: '', neededBy: '' });
  assert.ok(!plain.html.includes('RUSH REQUESTED'));
  assert.ok(!plain.html.includes('tel:'));
  assert.ok(plain.html.includes('No date given'));
});

test('helpers', () => {
  assert.equal(parseInitials('Your initials: ABC\nStyle: Script'), 'ABC');
  assert.equal(parseInitials('Just my name please'), null);
  assert.equal(formatNeededBy('2026-11-20'), 'Fri, Nov 20, 2026');
  assert.equal(formatNeededBy('next month'), 'next month');
  assert.equal(formatNeededBy('2026-02-31'), '2026-02-31');
  assert.equal(telHref('(803) 707-8576'), 'tel:8037078576');
  assert.equal(telHref('call me'), null);
});
