// =============================================================================
// preview-stega-filter - which preview strings get click-to-edit markers
// (2026-10-05, split out of src/lib/cms-preview.ts so it can be unit tested)
// =============================================================================
// Stega appends a run of ~1KB of INVISIBLE characters to every string the
// preview client returns, so the overlay knows which field a line came from.
// On words Mary Ann reads that is the whole point. On a value the code USES
// (compares, parses, puts in a colour or an address) it is a preview-only bug:
// `"#8c3a2e" + markers` fails the hex test and the live stitching hero draws
// nothing; `"poor" + markers !== "poor"` and a photo she kept out of the round
// hoops shows up in one.
//
// Since 2026-10-05 the preview renders the REAL page bodies, so every value a
// body uses in logic has to arrive clean. Two lists decide it, checked against
// the LAST NAMED segment of the field's path (an index such as `tags[2]` is
// skipped, so a list of plain words is judged by the list's name):
//
//   - NON_STEGA_FIELDS: fields picked from a fixed list in the Studio, or
//     machine values (colours, keys, addresses). Never prose.
//   - an address suffix: any field named ...Href, ...Url or ...Link (but not
//     ...Label) is an address, and an address must work when it is clicked.
//
// Sanity's own default filter (filterDefault) runs after these and already
// skips slugs, `_` fields, ids, dates, values that parse as URLs, and a
// denylist (color, href, key, url, icon, tag, layout...).
//
// ADD ANY NEW LOGIC-DRIVING FIELD HERE THE DAY YOU ADD IT. The test beside this
// file pins every field the page bodies use in logic today.
// =============================================================================

/** Fields whose exact value the code uses. */
export const NON_STEGA_FIELDS: ReadonlySet<string> = new Set([
  // Dropdowns and machine values in THIS repo's schemas today.
  'atelierStyle', // font -> the Atelier style key the "try it" link carries
  'businessType',
  'category',
  'colorFamily',
  'days',
  'hexColor', // threadColor: parsed as a colour by the thread chart and the Atelier
  'hoopFit', // galleryItem: 'poor' keeps a photo out of round hoops (src/lib/hoop.ts)
  'linkType',
  'navGroup',
  'platform',
  'priceRange',
  'styleTag',
  'tags', // galleryItem: the gallery filter matches them exactly
  'opens', // openingHours: times, parsed for the JSON-LD
  'closes',
  // Standard enum names across the site family. Carried so a section ported from
  // a sibling repo is not a preview-only bug waiting to be found.
  'align',
  'aspect',
  'businessModel',
  'columns',
  'format',
  'headingLevel',
  'heightHint',
  'icon',
  'imageSide',
  'layout',
  'mediaSide',
  'mediaType',
  'overlay',
  'padding',
  'ratio',
  'size',
  'source',
  'sourceType',
  'style',
  'surface',
  'tone',
  'variant',
  'width',
]);

/** An address field: `ctaHref`, `stripePaymentLink`, `footerCreditUrl`. */
const ADDRESS_FIELD = /(Href|Url|URL|Link)$/;

/** The last named segment of a source path (indexes and keyed segments skipped). */
export function lastFieldName(sourcePath: ReadonlyArray<unknown>): string | undefined {
  for (let i = sourcePath.length - 1; i >= 0; i -= 1) {
    const segment = sourcePath[i];
    if (typeof segment === 'string') return segment;
  }
  return undefined;
}

/**
 * True when a string at this path must stay CLEAN (no stega). Called by the
 * preview client's stega filter before Sanity's own default filter.
 */
export function keepClean(sourcePath: ReadonlyArray<unknown>): boolean {
  const name = lastFieldName(sourcePath);
  if (!name) return false;
  return NON_STEGA_FIELDS.has(name) || ADDRESS_FIELD.test(name);
}
