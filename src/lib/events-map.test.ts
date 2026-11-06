// This site only (not PORTABLE). Pins MAS Monograms' own events map
// (src/config/events.ts, PORTS.md card 217) link by link, the privacy wording
// that is derived from it, and the rule that every headline in the Report has an
// event the site really sends (src/config/board.ts, card 218).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyLink } from './track.ts';
import { eventKinds, eventsSentence } from './event-kinds.ts';
import { withEventsSentence } from './privacy-events.ts';
import { eventsConfig } from '../config/events.ts';
import { boardConfig } from '../config/board.ts';

const OWN = 'mas-monograms.com';

function hit(href: string, where = 'footer') {
  return classifyLink(href, new URL(href, `https://${OWN}/page/`).href, OWN, where, eventsConfig);
}

test('email and phone links are contact_click, with the kind and never the address', () => {
  assert.deepEqual(hit('mailto:someone@example.org'), {
    event: 'contact_click',
    params: { method: 'email', location: 'footer' },
  });
  assert.deepEqual(hit('tel:+15555550100'), {
    event: 'contact_click',
    params: { method: 'phone', location: 'footer' },
  });
});

test('social pages are social_click with the network name only', () => {
  assert.deepEqual(hit('https://www.facebook.com/somepage'), {
    event: 'social_click',
    params: { network: 'facebook', location: 'footer' },
  });
  assert.equal(hit('https://instagram.com/somepage')?.params.network, 'instagram');
  assert.equal(hit('https://www.pinterest.com/somepage')?.params.network, 'pinterest');
});

test('videos and maps keep the built-in events', () => {
  assert.equal(hit('https://www.youtube.com/watch?v=abc')?.event, 'watch_click');
  assert.equal(hit('https://www.google.com/maps/search/?api=1&query=x')?.event, 'directions_click');
});

test('other sites and files are left to Enhanced Measurement', () => {
  assert.equal(hit('https://example.com/a'), null);
  assert.equal(hit('https://example.com/colors.pdf'), null);
  assert.equal(hit('/pricing/'), null);
});

test('the privacy sentence names what is counted and nothing that is off', () => {
  const kinds = eventKinds(eventsConfig).join(' | ');
  assert.match(kinds, /email and phone links/);
  assert.match(kinds, /whether a form is seen, used or sent/);
  assert.match(kinds, /social media pages/);
  assert.doesNotMatch(kinds, /links to other sites|file downloads|search|article/);
  assert.match(eventsSentence(eventsConfig), /^It also records what visitors do on the site: /);
});

test('the privacy body gets the sentence on its Google Analytics paragraph', () => {
  const body = [
    { _type: 'block', _key: 'a', style: 'h2', children: [{ _type: 'span', text: 'Analytics' }] },
    {
      _type: 'block',
      _key: 'b',
      style: 'normal',
      markDefs: [],
      children: [
        { _type: 'span', _key: 's1', text: 'We use Google Analytics to count visits.', marks: [] },
      ],
    },
    { _type: 'block', _key: 'c', style: 'normal', children: [{ _type: 'span', text: 'Other.' }] },
  ];
  const out = withEventsSentence(body, eventsConfig, true) as typeof body;
  assert.equal(out.length, 3);
  assert.match(
    out[1].children.map((c) => c.text).join(''),
    /visits\. It also records what visitors do/,
  );
  // The stored body is not changed in place.
  assert.equal(body[1].children.length, 1);
});

test('with no Google Analytics paragraph the sentence stands in a paragraph of its own', () => {
  const body = [{ _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Hello.' }] }];
  const out = withEventsSentence(body, eventsConfig, true) as typeof body;
  assert.equal(out.length, 2);
  assert.match(out[1].children[0].text, /Google Analytics.*It also records/);
});

test('with GA4 off the privacy body is returned as it was stored', () => {
  const body = [{ _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Hi.' }] }];
  assert.equal(withEventsSentence(body, eventsConfig, false), body);
});

test('every event the Report reads is one this site sends, and has its own start day', () => {
  const sent = new Set(['generate_lead', 'form_view', 'contact_click']);
  const used = new Set<string>();
  const visit = (m: string) => m.startsWith('event:') && used.add(m.slice(6));
  for (const t of boardConfig.overview.tiles) visit(t.measure);
  for (const c of boardConfig.overview.charts) visit(c.measure);
  for (const p of boardConfig.parts) {
    for (const t of p.tiles ?? []) visit(t.measure);
    for (const c of [...(p.charts ?? []), ...(p.more ?? [])]) visit(c.measure);
  }
  for (const e of used) {
    assert.ok(sent.has(e), `${e} is on the Report but nothing sends it`);
    assert.ok(boardConfig.since?.[`event:${e}`], `${e} has no since day`);
    assert.ok(!(eventsConfig.off ?? []).includes(e), `${e} is switched off`);
  }
  assert.equal(boardConfig.since?.all, '2026-10-04');
});
