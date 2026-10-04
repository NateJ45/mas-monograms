import { seal, sealMark, sealLockup } from './c1-seal.mjs';
import { sheet, save } from './sheet.mjs';
import { HERE } from './lib.mjs';
import { join } from 'node:path';

const items = [
  { name: 'seal-light', svg: seal({ dark: false }), dark: false },
  { name: 'seal-dark', svg: seal({ dark: true, id: 'c1d' }), dark: true },
  { name: 'mark-light', svg: sealMark({ dark: false }), dark: false },
  { name: 'mark-dark', svg: sealMark({ dark: true, id: 'c1md' }), dark: true },
];
for (const it of items) save(`c1-${it.name}.svg`, it.svg);
await sheet(join(HERE, 'out/c1.png'), items, [420, 120, 48, 28]);
const lock = [
  { name: 'lockup-light', svg: sealLockup({ dark: false }), dark: false },
  { name: 'lockup-dark', svg: sealLockup({ dark: true, id: 'c1hd' }), dark: true },
  { name: 'header-light', svg: sealLockup({ dark: false, id: 'c1x', place: false }), dark: false },
  { name: 'header-dark', svg: sealLockup({ dark: true, id: 'c1xd', place: false }), dark: true },
];
for (const it of lock) save(`c1-${it.name}.svg`, it.svg);
await sheet(join(HERE, 'out/c1-lockup.png'), lock, [160, 56, 40, 28]);
console.log('ok');
