// scripts/backfill-array-types.mjs
//
// 2026-10-05: gives every array item that was stored without a `_type` the one
// it should have, so the Studio can open it (it showed "Item of type object not
// valid for this list" on the footer links). See scripts/lib/array-types.mjs for
// how the type is chosen. Dry run by default; `--apply` writes.
//
//   node_modules/.bin/tsx scripts/backfill-array-types.mjs           # dry run
//   node_modules/.bin/tsx scripts/backfill-array-types.mjs --apply   # write
//
// Rules (same as every live write in this repo):
//   - Backup first: npx sanity dataset export production tmp/backups/<file>.tar.gz
//   - Each document is patched with `set` on only the top-level fields that change,
//     guarded by its current _rev, on the published document AND its drafts. twin.
//   - It never changes a value, only adds `_type`. A second --apply reports 0.
import { Schema } from '@sanity/schema';
import { client, apply, done } from './lib/sanity-lib.mjs';
import { fillTypes, fieldType } from './lib/array-types.mjs';

const { schemaTypes } = await import(
  new URL('../src/sanity/schemaTypes/index.ts', import.meta.url).href
);
const schema = Schema.compile({ name: 'default', types: schemaTypes });

const docs = await client.fetch(
  `*[!(_type match "sanity.*") && !(_type match "system.*") && !(_type match "media.*")]`,
);
let changes = 0;
for (const doc of docs) {
  const type = schema.get(doc._type);
  if (!type) continue;
  const set = {};
  const notes = [];
  for (const field of type.fields ?? []) {
    const ft = fieldType(field);
    if (!ft || doc[field.name] == null) continue;
    const r = fillTypes(doc[field.name], ft, `.${field.name}`);
    r.unplaced.forEach((p) => notes.push(`UNPLACED ${p}`));
    if (r.changed.length) {
      set[field.name] = r.value;
      notes.push(...r.changed);
    }
  }
  if (!Object.keys(set).length && !notes.length) continue;
  notes.filter((n) => n.startsWith('UNPLACED')).forEach((n) => console.log(`  ${doc._id} ${n}`));
  if (!Object.keys(set).length) continue;
  changes += notes.filter((n) => !n.startsWith('UNPLACED')).length;
  await apply(`${doc._id}: ${Object.keys(set).join(', ')} (${notes.length} items)`, () =>
    client.patch(doc._id).ifRevisionId(doc._rev).set(set).commit(),
  );
}
done(changes);
