# Squarespace Content & Image Pipeline (Plan 2 of 3)

> Design spec. Status: approved by Nate, 2026-06-30. Second of three linked plans for the MAS
> Monograms redesign — follows `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`
> (Plan 1, foundation, complete and deployed). Plan 3 (page-by-page redesign) follows this one.

## Goal

Get the real photography already catalogued during Plan 1's research — ~80 product photos, 9 font
specimens, 37 thread color names — out of the live Squarespace site and into Sanity, correctly
categorized and captioned, so the rebuilt site stops rendering empty image placeholders. This is a
content-population task, not a design task: no new page layouts, no component changes.

## Source material

All source URLs, category breakdowns, and copy notes were captured during Plan 1's research and live
in `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`'s appendix. Summary:

- **Style Gallery photo pool** (~70 images): monograms (~21), designs (~21), logos (8), pets (3),
  wall hangings (2), appliqué (2), key fobs (2), heat transfer vinyl (2), seasonal/wreath (4),
  greeting card (1), raw customer phone photos (4). Organized by embroidery **technique**, not by
  item type.
- **Font specimens** (9 real photos): Pillow, Master Circle, Vine Heirloom, Golden Valley, Fishtail,
  Curlz, Classic, CA Liberty, plus a "10 Popular" collage image. ~10 additional font *names* are
  known from copy (Meadow, Moonlight, Fuchsia, Hydrangea, Subscriber, Melissa, Swallow, Green
  Lemonade, Katherine, Edelweiss) but have no photographed specimen.
- **Thread colors** (37 names, text only): grouped into 8 families (whites/naturals, blues, greens,
  pinks, reds/burgundy, purples, golds/yellows, grays/blacks). No source photography exists for
  these at all.
- **Owner portrait** (1 photo) — out of scope for this plan (About page content, not part of the
  image-heavy pages this plan targets); note it here as available for a future pass.

## Sanity schema targets (already exist, no schema changes needed)

- `galleryItem` — `image` (required, with required `alt` + optional `caption`), `relatedCategory`
  (ref to `itemCategory`), `relatedFont` (ref to `font`), `tags` (string array), `featured`,
  `displayOrder`.
- `font` — `name`, `slug`, `previewImage` (required, with required `alt`), `styleTag` (one of
  classic/script/block/modern/monogram), `description`, `bestFor`, `popular`, `displayOrder`.
- `itemCategory` — already has 8 documents (one per shop category) with `name`/`slug`/`description`
  populated from Plan 1's text-content seed; `heroImages` (array, 1–4 images, required) and
  `cardImage` (required) are the fields this plan needs to fill in.
- `threadColor` — `name`, `slug`, `hexColor` (required, drives a UI color-chip even with no photo),
  `dmcNumber` (optional), `swatchImage` (**optional** — the schema was built assuming photos might
  not exist), `colorFamily`, `displayOrder`.

## Process

### 1. Inspect every photo directly (not automated classification)

I fetch each image from its captured Squarespace CDN URL and actually look at it — no filename
heuristics, no guessing from the generic `monogram-NN.jpg`/`design-NN.jpg` names. For each image I
determine:

- What item does it actually show (towel, tote bag, hat, sweatshirt, onesie, blanket, etc.)?
- What embroidery technique (monogram, appliqué, logo, heat-transfer, etc. — mostly already implied
  by which pool it came from, but confirmed by looking)?
- Specific, accurate alt text (e.g. "Navy block three-letter monogram on a white bath towel," not
  "Embroidered towel" or "Image of monogram").
- Whether it's a strong fit as an `itemCategory` hero/card image (clean, representative, decent
  framing) or best suited only for the general Style Gallery.

This runs as several parallel research passes (batches of the photo pool), each producing a
structured JSON fragment: `{sourceUrl, itemType, technique, altText, tags, qualityNotes}`. I compile
the fragments into one manifest.

### 2. Build the manifest — the one reviewable checkpoint

The manifest is a single JSON file (`tmp/image-manifest.json`, not committed — matches the existing
`tmp/content.ndjson` pattern already gitignored) mapping every source image to exactly one Sanity
destination:

```json
{
  "galleryItems": [
    { "sourceUrl": "...", "alt": "...", "caption": null, "relatedCategorySlug": "towels-linens",
      "relatedFontSlug": null, "tags": ["monogram", "block"], "featured": false, "displayOrder": 1 }
  ],
  "fonts": [
    { "sourceUrl": "...", "name": "Pillow", "styleTag": "script", "alt": "..." }
  ],
  "categoryImages": {
    "towels-linens": { "cardImageUrl": "...", "cardAlt": "...", "heroImageUrls": ["..."], "heroAlts": ["..."] }
  },
  "categoriesMissingPhotos": ["hats-caps"],
  "threadColors": [
    { "name": "Navy", "slug": "navy", "hexColor": "#1a2f4d", "colorFamily": "blue", "displayOrder": 1 }
  ]
}
```

`categoriesMissingPhotos` is populated honestly, not force-filled — if the photo pool has nothing
that actually shows a given category's item type, that category is flagged as still needing real
photography rather than shipped with a mismatched stand-in image.

### 3. Import script

New script `scripts/import-squarespace-images.mjs`, following the structure of the existing
`scripts/import-content.mjs`/`scripts/seed-content.mjs` (same `loadEnv.mjs` helper, same Sanity
client setup pattern). For each manifest entry:

1. Download the source image (`fetch` the Squarespace CDN URL → buffer).
2. Upload to Sanity as an asset: `client.assets.upload('image', buffer, { filename })`.
3. Create (for `galleryItem`/`font`, which are new documents) or patch (for `itemCategory`, which
   already exists) the target document, referencing the uploaded asset and setting `alt`/other
   fields.

**Idempotent and re-runnable**: `galleryItem`/`font` documents get deterministic `_id`s derived from
the source filename (e.g. `galleryItem.monogram-32`, `font.pillow`), matching the existing
seed-scripts' "re-runnable, deterministic ids" convention from `CLAUDE.md`. Re-running the script
after a partial failure skips documents that already have an uploaded asset rather than
re-downloading/re-uploading everything.

**Auth**: uses the existing `SANITY_API_READ_TOKEN` environment variable (loaded via the existing
`loadEnv.mjs` helper) — Nate has already upgraded this token's permission level to include write
access and updated both the local `.env` and the corresponding Cloudflare value, rather than
introducing a second token variable. If a write actually fails with a permissions error, the script
reports that clearly (the exact Sanity API error) rather than retrying blindly or silently
continuing.

### 4. Thread colors — text-only, same script

The 37 thread color names/families from Plan 1's copy-notes research get created as `threadColor`
documents with `hexColor` set to a reasonable approximation for the named color (no photography
exists, so `swatchImage` is left empty — the schema supports this). This is folded into the same
import script as a separate, simpler pass (no image download/upload involved), since the data is
already fully captured and the risk/scope is low.

## Category hero/card image matching

Matched from the technique-organized photo pool where a genuine fit exists — e.g. a photo that
clearly shows a monogrammed bath towel becomes Towels & Linens' card image. Where the pool has
nothing that actually depicts a category's item type (this is expected for at least some
categories, since the original site's category pages only ever borrowed one generic sample image
each), that category goes in `categoriesMissingPhotos` instead of being force-filled. Those
categories keep rendering whatever fallback/placeholder behavior `itemCategory` pages already have
today (a page-by-page concern, not this plan's job to change).

## What this plan does NOT do

- Reshoot, retouch, crop, or color-correct any photo — everything uploads as-is, including the
  authentic unedited customer phone photos (Nate's explicit call: the "real work, real customers"
  framing is part of the brand).
- Redesign any page layout or component (Plan 3's job).
- Touch `Hero.astro`, `index.astro`, or `[slug].astro`'s hero-image rendering code — this plan
  populates the Sanity data those components already know how to consume; whether their current
  rendering does that data justice (the light-text-on-missing-image contrast question flagged during
  Plan 1) is a page-by-page concern.
- Create documents for the ~10 font names with no photographed specimen — `previewImage` is a
  required field, so those names stay untracked in Sanity until real specimen photos exist. Noted as
  a known gap, not fabricated.
- Populate `threadColor.swatchImage` — no source photography exists; the hex-chip fallback is
  sufficient for this pass.
- Touch the owner portrait — out of scope (About page, not one of the image-heavy pages this plan
  targets).

## Risks / open questions carried into implementation

- Sanity write-token permission is unverified until the script actually runs — first real write
  attempt is the test. If it fails, that's a clear, actionable error to report back, not a blocker to
  design around speculatively.
- Squarespace CDN URLs could theoretically go stale/rate-limit under a burst of ~90 fetches in quick
  succession — the import script should fetch sequentially (or with modest concurrency) rather than
  blasting all requests at once, and should be safely re-runnable if a fetch fails partway through.
