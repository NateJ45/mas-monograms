import { threadWordmark, threadMark } from './c2-thread.mjs';
import { sheet, save } from './sheet.mjs';
import { HERE } from './lib.mjs';
import { join } from 'node:path';

const items = [
  { name: 'wordmark-light', svg: threadWordmark({ dark: false }), dark: false },
  {
    name: 'wordmark-light-ink',
    svg: threadWordmark({ dark: false, id: 'c2i', swashColor: false }),
    dark: false,
  },
  { name: 'wordmark-dark', svg: threadWordmark({ dark: true, id: 'c2d' }), dark: true },
  {
    name: 'header-light',
    svg: threadWordmark({ dark: false, bold: true, id: 'c2b' }),
    dark: false,
  },
  { name: 'header-dark', svg: threadWordmark({ dark: true, bold: true, id: 'c2bd' }), dark: true },
];
for (const it of items) save(`c2-${it.name}.svg`, it.svg);
await sheet(join(HERE, 'out/c2.png'), items, [150, 56, 40, 28]);
const marks = [
  { name: 'mark-light', svg: threadMark({ dark: false }), dark: false },
  { name: 'mark-dark', svg: threadMark({ dark: true, id: 'c2md' }), dark: true },
];
for (const it of marks) save(`c2-${it.name}.svg`, it.svg);
await sheet(join(HERE, 'out/c2-mark.png'), marks, [300, 120, 48, 28, 16]);
console.log('ok');
