// The logo drawing (src/lib/brand/brandSvg.js): ids never collide between instances, the
// adaptive mode paints only through --logo-* custom properties, and the standalone cuts carry
// plain colours (favicons and rasterisers cannot read custom properties).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sealSvg, wordmarkSvg, tabIconSvg, LIGHT, DARK } from './brand/brandSvg.js';

const ids = (svg: string) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const refs = (svg: string) => [...svg.matchAll(/(?:url\(#|href="#)([^)"]+)/g)].map((m) => m[1]);

for (const [name, make] of [
  ['mark', (idp: string) => sealSvg({ idp, cut: 'bold' })],
  ['seal', (idp: string) => sealSvg({ idp, ring: true, cut: 'regular' })],
  ['wordmark', (idp: string) => wordmarkSvg({ idp })],
  ['tab icon', (idp: string) => tabIconSvg({ idp })],
] as const) {
  test(`${name}: every id carries the instance prefix and every reference resolves`, () => {
    const svg = make('zz');
    const own = ids(svg);
    assert.ok(own.length > 0);
    for (const id of own) assert.ok(id.startsWith('zz-'), `${id} is not prefixed`);
    assert.equal(new Set(own).size, own.length, 'duplicate id inside one logo');
    for (const r of refs(svg)) assert.ok(own.includes(r), `dangling reference #${r}`);
  });
  test(`${name}: two instances share no id`, () => {
    const a = new Set(ids(make('a1')));
    for (const id of ids(make('b2'))) assert.ok(!a.has(id));
  });
  test(`${name}: no NaN or undefined in the markup`, () => {
    const svg = make('n');
    assert.ok(!/NaN|undefined/.test(svg));
  });
}

test('adaptive logos paint through --logo-* with the palette as fallback', () => {
  const svg = sealSvg({ idp: 'ad', adaptive: true, palette: LIGHT });
  assert.match(svg, /var\(--logo-letters,#0F1B2D\)/);
  assert.match(svg, /var\(--logo-ring-a,#28486B\)/);
  const plain = sealSvg({ idp: 'pl', palette: DARK });
  assert.ok(!plain.includes('var('), 'a standalone logo must not depend on custom properties');
  assert.ok(!tabIconSvg({ idp: 't' }).includes('var('));
});

test('decorative by default, named when a title is given', () => {
  assert.match(wordmarkSvg({ idp: 'd' }), /aria-hidden="true"/);
  assert.match(
    wordmarkSvg({ idp: 'e', title: 'MAS Monograms' }),
    /role="img" aria-label="MAS Monograms"/,
  );
});
