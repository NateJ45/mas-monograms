import { wovenLabel, labelMark, labelLockup } from './c3-label.mjs';
import { sheet, save } from './sheet.mjs';
import { HERE } from './lib.mjs';
import { join } from 'node:path';

const items = [
  { name: 'label-light', svg: wovenLabel({ dark: false }), dark: false },
  { name: 'label-dark', svg: wovenLabel({ dark: true, id: 'c3d' }), dark: true },
  { name: 'mark-light', svg: labelMark({ dark: false }), dark: false },
  { name: 'mark-dark', svg: labelMark({ dark: true, id: 'c3md' }), dark: true },
  { name: 'header-light', svg: labelLockup({ dark: false }), dark: false },
  { name: 'header-dark', svg: labelLockup({ dark: true, id: 'c3hd' }), dark: true },
];
for (const it of items) save(`c3-${it.name}.svg`, it.svg);
await sheet(join(HERE, 'out/c3.png'), items, [220, 90, 44, 28]);
console.log('ok');
