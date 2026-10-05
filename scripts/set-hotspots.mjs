// =============================================================================
// set-hotspots.mjs - give every galleryItem.image and itemCategory.cardImage a
// hotspot so the circular hoop crops centre on the embroidered motif.
// =============================================================================
// Decisions live in scripts/data/hotspots-2026-10-04.json (doc id, image field,
// x, y, width, height, reason). Crop is deliberately left unset.
//
// Never overwrites: uses setIfMissing on `<field>.hotspot`, so an existing
// hotspot (Mary Ann's own, or a later hand edit) is kept. Patches the
// published doc AND a `drafts.<id>` variant when one exists.
//
//   node scripts/set-hotspots.mjs            # dry run (default)
//   node scripts/set-hotspots.mjs --apply    # write
//   node scripts/set-hotspots.mjs --apply --replace-mine
//        # also replace hotspots this script wrote earlier (identical _key
//        # marker is not used; instead pass --replace-mine to overwrite any
//        # hotspot whose values differ from the JSON for docs in the JSON)
// =============================================================================
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { client, ROOT, apply, done } from './lib/sanity-lib.mjs';

const REPLACE = process.argv.includes('--replace-mine');
const { decisions } = JSON.parse(
  readFileSync(resolve(ROOT, 'scripts/data/hotspots-2026-10-04.json'), 'utf8'),
);

const ids = decisions.flatMap((d) => [d.id, `drafts.${d.id}`]);
const existing = await client.fetch(
  `*[_id in $ids]{_id, "image": image{hotspot, asset}, "cardImage": cardImage{hotspot, asset}}`,
  { ids },
);
const byId = new Map(existing.map((d) => [d._id, d]));

let changes = 0;
for (const d of decisions) {
  const hotspot = {
    _type: 'sanity.imageHotspot',
    x: d.x,
    y: d.y,
    width: d.width,
    height: d.height,
  };
  for (const id of [d.id, `drafts.${d.id}`]) {
    const doc = byId.get(id);
    if (!doc) {
      if (id === d.id) console.log(`WARN missing document ${id}`);
      continue;
    }
    const img = doc[d.field];
    if (!img?.asset) {
      console.log(`SKIP ${id}: no ${d.field} asset`);
      continue;
    }
    const has = img.hotspot;
    if (has && !REPLACE) {
      console.log(`SKIP ${id}.${d.field}: hotspot already set`);
      continue;
    }
    if (has && REPLACE && ['x', 'y', 'width', 'height'].every((k) => has[k] === hotspot[k])) {
      continue;
    }
    changes++;
    const p = client.patch(id);
    await apply(
      `${id}.${d.field}.hotspot = x${d.x} y${d.y} w${d.width} h${d.height} (${d.reason})`,
      () =>
        (has
          ? p.set({ [`${d.field}.hotspot`]: hotspot })
          : p.setIfMissing({ [`${d.field}.hotspot`]: hotspot })
        ).commit({ autoGenerateArrayKeys: false }),
    );
  }
}
done(changes);
