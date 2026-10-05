// Unit tests for the LocalBusiness JSON-LD (src/lib/schemas.ts): sameAs carries
// the social links and the Google listing, valid https addresses only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localBusinessSchema, sameAsLinks } from './schemas.ts';

const parse = (s: unknown) => JSON.parse(localBusinessSchema(s as never));

test('sameAs is empty with no links (the live state on 2026-10-05)', () => {
  assert.deepEqual(parse({ socialLinks: [], googleBusinessUrl: null }).sameAs, []);
  assert.deepEqual(parse(null).sameAs, []);
});

test('sameAs lists social links then the Google listing, https only, once each', () => {
  const out = parse({
    socialLinks: [
      { platform: 'Facebook', url: 'https://www.facebook.com/masmonograms' },
      { platform: 'Instagram', url: 'http://instagram.com/masmonograms' },
      { platform: 'Other', url: 'javascript:alert(1)' },
      { platform: 'Pinterest', url: 'not a link' },
      { platform: 'Facebook', url: 'https://www.facebook.com/masmonograms' },
      { platform: 'TikTok' },
      null,
    ],
    googleBusinessUrl: 'https://maps.app.goo.gl/abc123',
  });
  assert.deepEqual(out.sameAs, [
    'https://www.facebook.com/masmonograms',
    'https://maps.app.goo.gl/abc123',
  ]);
  for (const u of out.sameAs) assert.equal(new URL(u).protocol, 'https:');
});

test('a bad Google listing link is left out', () => {
  for (const googleBusinessUrl of ['', 'g.page/x', 'http://g.page/x', 'https://localhost']) {
    assert.deepEqual(sameAsLinks({ googleBusinessUrl }), [], googleBusinessUrl);
  }
});

test('the rest of the business facts are unchanged', () => {
  const out = parse({ title: 'MAS Monograms', phone: '(803) 707-8576' });
  assert.equal(out['@type'], 'LocalBusiness');
  assert.equal(out.name, 'MAS Monograms');
  assert.equal(out.telephone, '(803) 707-8576');
  assert.equal(out.url, 'https://mas-monograms.com');
});
