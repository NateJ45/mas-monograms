// Unit tests for src/lib/utm.ts: the whitelist, the email wording and the
// first-touch session store (with a fake window).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanUtmValue,
  describeUtm,
  fillUtmFields,
  pickUtm,
  rememberUtm,
  UTM_STORAGE_KEY,
} from './utm.ts';

test('cleanUtmValue keeps only 1 to 40 letters, digits, hyphens, underscores', () => {
  assert.equal(cleanUtmValue('qr'), 'qr');
  assert.equal(cleanUtmValue(' fall-fair_2026 '), 'fall-fair_2026');
  assert.equal(cleanUtmValue('a'.repeat(40)), 'a'.repeat(40));
  for (const bad of ['', ' ', 'a'.repeat(41), 'fall fair', '<b>', 'x"y', 'café', 'a/b', 'a.b']) {
    assert.equal(cleanUtmValue(bad), null, JSON.stringify(bad));
  }
  assert.equal(cleanUtmValue(42), null);
  assert.equal(cleanUtmValue(null), null);
});

test('pickUtm reads only the three keys, from params, forms and objects', () => {
  const params = new URLSearchParams(
    'utm_source=qr&utm_medium=tag&utm_campaign=<script>&utm_term=x&utm_content=y&item=towels',
  );
  assert.deepEqual(pickUtm(params), { utm_source: 'qr', utm_medium: 'tag' });
  const fd = new FormData();
  fd.set('utm_source', 'qr');
  fd.set('utm_campaign', 'test');
  fd.set('utm_medium', new Blob(['x']));
  assert.deepEqual(pickUtm(fd), { utm_source: 'qr', utm_campaign: 'test' });
  assert.deepEqual(pickUtm({ utm_medium: 'card', other: 'x' }), { utm_medium: 'card' });
  assert.deepEqual(pickUtm(null), {});
});

test('describeUtm: plain words for QR placements, Other for unknown values', () => {
  assert.equal(describeUtm({}), null);
  assert.equal(describeUtm(undefined), null);
  assert.equal(
    describeUtm({ utm_source: 'qr', utm_medium: 'tag', utm_campaign: 'fall-fair' }),
    'QR code on a hang tag or label (campaign fall-fair)',
  );
  const places: Record<string, string> = {
    card: 'a business card',
    flyer: 'a flyer or poster',
    insert: 'a package insert or thank-you card',
    sign: 'a table sign',
    box: 'a shipping box sticker',
  };
  for (const [medium, words] of Object.entries(places)) {
    assert.equal(describeUtm({ utm_source: 'qr', utm_medium: medium }), `QR code on ${words}`);
  }
  assert.equal(describeUtm({ utm_source: 'QR', utm_medium: 'Card' }), 'QR code on a business card');
  assert.equal(describeUtm({ utm_source: 'qr' }), 'QR code');
  assert.equal(describeUtm({ utm_source: 'qr', utm_medium: 'mug' }), 'QR code (Other: mug)');
  assert.equal(describeUtm({ utm_source: 'facebook', utm_medium: 'social' }), 'Facebook (social)');
  assert.equal(describeUtm({ utm_source: 'newsletter' }), 'Other: newsletter');
  assert.equal(describeUtm({ utm_campaign: 'spring' }), 'Not known (campaign spring)');
  // Junk never reaches the words.
  assert.equal(describeUtm({ utm_source: '<img src=x>' }), null);
});

/** A minimal window with location and sessionStorage, installed on globalThis. */
function fakeWindow(search: string, storage: Map<string, string> | 'blocked') {
  const sessionStorage = {
    getItem(k: string) {
      if (storage === 'blocked') throw new Error('blocked');
      return storage.get(k) ?? null;
    },
    setItem(k: string, v: string) {
      if (storage === 'blocked') throw new Error('blocked');
      storage.set(k, v);
    },
  };
  (globalThis as Record<string, unknown>).window = { location: { search }, sessionStorage };
}
const clearWindow = () => delete (globalThis as Record<string, unknown>).window;

test('rememberUtm: first touch wins for the session', () => {
  const store = new Map<string, string>();
  fakeWindow('?utm_source=qr&utm_medium=tag&utm_campaign=test', store);
  const first = { utm_source: 'qr', utm_medium: 'tag', utm_campaign: 'test' };
  assert.deepEqual(rememberUtm(), first);
  assert.ok(store.has(UTM_STORAGE_KEY));
  // A later page without tags keeps the first touch.
  fakeWindow('', store);
  assert.deepEqual(rememberUtm(), first);
  // A later tagged landing does not replace it.
  fakeWindow('?utm_source=facebook', store);
  assert.deepEqual(rememberUtm(), first);
  // Junk on a fresh session stores nothing.
  const fresh = new Map<string, string>();
  fakeWindow('?utm_source=%3Cscript%3E&utm_medium=a%20b', fresh);
  assert.deepEqual(rememberUtm(), {});
  assert.equal(fresh.size, 0);
  // A tampered stored value is validated again.
  fresh.set(UTM_STORAGE_KEY, JSON.stringify({ utm_source: '"><b>' }));
  fakeWindow('?utm_source=qr', fresh);
  assert.deepEqual(rememberUtm(), { utm_source: 'qr' });
  clearWindow();
});

test('rememberUtm survives blocked storage', () => {
  fakeWindow('?utm_source=qr&utm_medium=card', 'blocked');
  assert.deepEqual(rememberUtm(), { utm_source: 'qr', utm_medium: 'card' });
  clearWindow();
});

test('fillUtmFields writes the hidden inputs by name', () => {
  fakeWindow('?utm_source=qr&utm_campaign=test', new Map());
  const inputs: Record<string, { value: string }> = {
    utm_source: { value: 'stale' },
    utm_medium: { value: 'stale' },
    utm_campaign: { value: '' },
  };
  const form = {
    querySelector: (sel: string) => inputs[/name="([^"]+)"/.exec(sel)![1]] ?? null,
  } as unknown as HTMLFormElement;
  fillUtmFields(form);
  assert.deepEqual(Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v.value])), {
    utm_source: 'qr',
    utm_medium: '',
    utm_campaign: 'test',
  });
  clearWindow();
});
