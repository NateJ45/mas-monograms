import { crest, crestMark, crestLockup } from './c4-crest.mjs';
import { sheet, save } from './sheet.mjs';
import { HERE } from './lib.mjs';
import { join } from 'node:path';

const items = [
  { name: 'crest-light', svg: crest({ dark: false }), dark: false },
  { name: 'crest-dark', svg: crest({ dark: true, id: 'c4d' }), dark: true },
  { name: 'mark-light', svg: crestMark({ dark: false }), dark: false },
  { name: 'mark-dark', svg: crestMark({ dark: true, id: 'c4md' }), dark: true },
];
for (const it of items) save(`c4-${it.name}.svg`, it.svg);
await sheet(join(HERE, 'out/c4.png'), items, [400, 120, 48, 28]);
const lock = [
  { name: 'header-light', svg: crestLockup({ dark: false }), dark: false },
  { name: 'header-dark', svg: crestLockup({ dark: true, id: 'c4hd' }), dark: true },
];
for (const it of lock) save(`c4-${it.name}.svg`, it.svg);
await sheet(join(HERE, 'out/c4-lockup.png'), lock, [140, 56, 40, 28]);
console.log('ok');
