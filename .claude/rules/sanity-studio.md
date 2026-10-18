---
paths:
  - 'src/sanity/**'
  - 'sanity.config.ts'
  - 'sanity.cli.ts'
  - 'src/lib/sanity.ts'
  - 'src/lib/sanity.types.ts'
  - 'src/lib/queries.ts'
  - 'src/lib/schemas.ts'
  - 'scripts/seed*.mjs'
  - 'scripts/lib/**'
  - 'scripts/import-content.mjs'
---

# Sanity schemas, Studio, queries, seed scripts

Loads when you touch schemas, the Studio, GROQ queries, typegen output or seed
and patch scripts.

## Query pattern

```ts
import { sanityClient } from '@/lib/sanity';
import type { SomePageType } from '@/sanity.types';

// In Astro page (build-time, token-authenticated)
const data = await sanityClient.fetch<SomePageType>(`*[_type == "homePage"][0]`);
```

## Project notes (Sanity and Studio)

- `npm run typegen` must be run after any schema changes to regenerate `sanity.types.ts`.
  It runs from the **repo root** now (`sanity schema extract --force && sanity typegen
generate`), not from a `studio/` workspace.
- **There is no separate studio dev server or deploy.** `npm run dev` serves the site at
  localhost:4321 and the Studio at **localhost:4321/studio**; deploying the site deploys the
  Studio. For CLI work (`sanity dataset`, `sanity cors`, typegen) run `npx sanity ...` from
  the repo root; `sanity.cli.ts` configures it. Do **not** run `npx sanity deploy`.
  The Studio theme is the shared kit's since 2026-10-18 (starter cards 110 and 116,
  `src/sanity/studioTheme.ts` PORTABLE, from `brand/brand.config.json`: Heritage Indigo accent, Paper,
  the Indigo Deep top bar, Fraunces and Mulish), with Mary Ann's larger type built in by
  `src/sanity/readableTheme.ts` (the 1.2x ramp from `src/sanity/theme.ts`, tested by
  `src/lib/studio-readable.test.ts`). The kit's colour gate is `studio-theme.test.ts` (PORTABLE).
- **Mary Ann's Studio on the shared kit (2026-10-18; built for her 2026-10-05, Phase A to F, spec
  `docs/superpowers/specs/2026-10-05-studio-direction.md`).** Since 2026-10-18 the Studio is the family's
  shared kit (starter PORTS.md cards 106 to 120; `src/sanity/kit/`, `src/sanity/workflow/`, the kit doc
  `docs/agent/studio-kit.md`, all PORTABLE) dressed for her, with every piece she had kept. Her settings are
  ONE file, `src/sanity/kit.config.ts`. Where each 2026-10-05 piece went:

  | Before (2026-10-05)                                     | Now                                                                                                                                                               |
  | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Welcome pane + 10 cards (`WelcomePane`, `welcomeTasks`) | Home tool: the first four cards are its big buttons (`quickActions`), the rest are "Your pages" links                                                             |
  | `StudioLayout`: open on Welcome, tour, hide Drafts      | Home is the first tool; the kit's tour (`tourSteps`, her words); staff view hides Drafts and Releases                                                             |
  | `StudioTour` (key `mas-studio-tour-v1`)                 | the kit's tour, once per Sanity user per browser (she sees it once more)                                                                                          |
  | "What needs attention" (`CheckupTool`, `CHECKS`)        | the Checkup tool and Home's Fix-it list: generic rules + her six in `src/sanity/checkupRules.ts`                                                                  |
  | Help (how do I...?) pane, guides                        | the Site Guide tool, still HER handbook (`HelpPane`, swapped in by `masSiteGuide` in sanity.config)                                                               |
  | Move to Trash / Bring it back (`actions/trash.tsx`)     | the kit's Trash (same snapshot model, same words; `trashTypes` = the six lists)                                                                                   |
  | Publish note ("2 to 3 minutes")                         | the kit's note after Publish + the status line counting down (`typicalUpdateMinutes: 3`)                                                                          |
  | `buildLegacyTheme` Heirloom Coast + `readableFonts`     | the kit theme from `brand/brand.config.json` + her ramp (`readableTheme.ts`)                                                                                      |
  | `StudioLogo` (never drawn by Sanity 6)                  | workspace title and icon, the site's own `/studio` page and splash, the wordmark (cards 110, 120)                                                                 |
  | emoji `ToolHeading`                                     | the kit's `ToolHeading` with icons by meaning (card 119, `brandIconArt.tsx`: hoop, spool, needle...)                                                              |
  | (new)                                                   | weekly checklist "My weekly 15 minutes", help panel beside each form, Messages, table panes, banner                                                               |
  | (new, 2026-10-18 PR 2)                                  | "Gift guides and seasons" (`collection`, six season starting points) and "Notices across the top" (`announcement`, three starting points, two Quick update forms) |

  Kept as they were: the QR tool and brand kit (registered by `masTools` before the kit), "Copy a link..."
  (`actions/shareLink.tsx`; the kit's "Share a preview" is NOT on, see `docs/PENDING.md`), Undo/Redo, badges,
  the Google preview, locked addresses, drag lists, plain tool names (`kitConfig.toolTitles`), one
  publishing model, a Create menu of only the things she makes. Mary Ann is in `kitConfig.staff` (her public email until her
  invitation is accepted and her user id can replace it). The desk (`src/sanity/structure.ts`, wrapped in
  `staffDesk`): My business details, Pages on my website (legal pages inside), Photos of my work, Clearance and
  prices (with two table panes), Fonts, threads and categories, Questions and answers, Gift guides and seasons
  (`DESK.collections`), Notices across the top (`DESK.notices`), Make a QR code, My
  brand kit, My notes and ideas, Trash. **Every pane has an explicit `.id()`**, and the ids anything links
  to live in `DESK` (`src/sanity/studioTargets.ts`); a derived id comes from the title and breaks deep
  links (the Stone Steps lesson). `src/lib/studio-targets.test.ts` fails if Home points at a pane the desk
  lacks or a builder call has no `.id()`.
  - In-Studio links in her own panes go through `useStudioLink()` (`components/studioLink.ts`): the embedded
    Studio is hash-routed, so a plain `href="/studio/..."` leaves it. Targets: `{doc, field}`, `{pane}`,
    `{create, template}`, `{tool}` (the same shape as the kit's `StudioTarget`).
  - Config: tool titles "Edit my content" / "Edit on the page" / "My photo library" (`kitConfig.toolTitles`:
    sanity-plugin-media has no title option); releases, scheduled drafts, scheduled
    publishing, tasks, comments and announcements are OFF; the global "+" menu offers only the things
    she makes (`CREATE_MENU`: photos, clearance, questions, notices, season pages and the lists), and a reference box can never create a singleton (`creationContext.type ===
'document'`, the fbcm fix).
  - Document actions: the kit adds the note after Publish and Move to Trash first; then
    `src/sanity/editorActions.ts` applies the singleton rules (`SINGLETON_TYPES`, the ONE list), Undo/Redo
    (PORTABLE `components/UndoRedo.tsx` + `undoRedo.ts`, card 27, keyboard layer `undoRedoShortcuts()`) and
    "Copy a link...".
  - Badges (`components/documentBadges.tsx`): "Sold", "Needs a photo" (gallery photo, clearance item's first
    photo, font), "Add a short description for Google" (the 10 pages with both SEO boxes).
  - Schema wording rules and the hidden-field list: `docs/06-sanity-content-model.md` "Mary Ann's Studio
    pass". Shared wording lives in `src/sanity/schemaTypes/_copy.ts`, spread into LITERAL
    `defineField({ name: '...' })` calls (two checks read the schema files as text).
  - **`npm run audit:studio`** (`scripts/audit-studio.mjs`, read-only GROQ): hidden-and-required fields,
    non-string preview titles, stored keys the schema does not declare, required fields blank in live data,
    and banned words (em-dash, `<em>`, slug, schema, field, document, URL, CTA...). Must print "Studio is
    clean." after any schema change.
  - **`npm run audit:data`** (`scripts/audit-data-vs-schema.mjs`, read-only, plain Node via `scripts/lib/load-schema.mjs`; the starter's `PORTABLE` copy since 2026-10-13, card 95, so `tsx` is gone): every stored
    value against the REAL compiled schema (`@sanity/schema`, so it sees what the Studio sees). Catches an
    array item with no `_type` or one the array does not allow (the Studio shows "Item of type object not
    valid for this list", 2026-10-05, footer links), items with no `_key`, stored keys the schema does not
    declare, wrong-kind values, dropdown values outside the choices, unknown document types and references
    to documents that no longer exist. Must print "Data matches the schema." after any seed run or schema
    change. `scripts/backfill-array-types.mjs` (dry run, `--apply`) adds the missing `_type`
    (`scripts/lib/array-types.mjs` picks it: the only object member, else the most specific member whose
    fields cover the item). **Every seed or import script must write `_type` on every object it puts in an
    array**; the audit is what proves it.
  - **Phase B handbook (2026-10-05).** Guides are typed repo DATA in `src/sanity/guides/`: `types.ts` (shape:
    category, id, title, icon, badge "You can do this yourself" / "Mostly yourself" / "Check with Nathan
    first", summary, time, optional cost and "before you start", blocks h/p/steps (with "what you will see")/
    bullets/path ("Take me there": a `StudioTarget` or `{url}` for an outside site)/callout tip|careful|why/
    seealso, and never-shown `maintenance` notes), `iconNames.ts` + `icons.ts` (a Record, so a missing icon is
    a compile error), `content.ts` (editing guides), `getFound.ts`, `brandAndPrint.ts`, aggregated by
    `index.ts` (`ALL_GUIDES`, `searchGuides`). Guide files import with `.ts` extensions (bare-Node tests).
    `components/GuideView.tsx` renders them inside `HelpPane`, the Site Guide tool (`site-guide`): search, "Guides by topic", the open guide, "Print this guide" (a plain-HTML copy
    portalled to `#mas-guide-print` plus a print stylesheet). `src/lib/studio-guides.test.ts` checks every
    target against the desk, schema and tools, every `backticked` click name in the editing guides against
    the real Studio names (including the kit's), the audit's `JARGON` list, badges, times, see-also ids and
    the "Help for this page" map (`GUIDES_FOR_TYPE` in `guides/index.ts`; `KIT_GUIDES` is the same guides
    in the kit's shape, and `makeGuideView` draws one guide in that panel). "My notes and ideas" > "My notes"
    (`studioNotes`, `DESK.notes`) holds `helpContact`, which the Site Guide shows. The old `studioGuide` is
    off the desk (kept); StudioPlaybook ("Ideas to grow your studio") sits beside My notes.
  - **The Checkup** (was "What needs attention", Phase B). The kit's `CheckupTool` and Home's Fix-it list
    run ONE fetch of every content document through `kitConfig.checkup.rules`: the kit's generic rules
    (pictures with no description, pages with no Google description, links to removed things, changes
    waiting, the Trash, the last publish) and her six in `src/sanity/checkupRules.ts` (Stripe link, empty
    headline, none left but not Sold, font with no photo, sold items shown, photos kept out of hoops),
    tested in `src/lib/studio-checkup-mas.test.ts`.
  - **"Make a QR code" (Phase E, 2026-10-05).** `components/QrCodeTool.tsx`, registered as the top-bar tool
    `qr-codes` (`masTools` in sanity.config.ts) AND the desk item `DESK.qrCodes`, linked from Home. Three steps: where it
    leads (5 site pages, her Google review link, Facebook/Instagram from `siteSettings.socialLinks`, greyed
    with an "Add my ... link" button when missing), where it goes (6 placements: size, quiet zone, utm tag),
    then the preview with the seal toggle, label, background (white/Linen, Midnight code, never inverted),
    batch name and four buttons (SVG, PNG at 300 dpi and 1200px+, "Print this" as a blob: page at the exact
    size, Copy the link). Pure logic in `src/lib/qr/` (url, placements, destinations, encode, logo, svg,
    print, make), tested by `src/lib/qr/qr.test.ts`, which decodes every destination x placement, seal on and
    off, with `jsqr` (dev dependency). Encoder: `qrcode-generator` 2.0.4 (MIT, zero deps), error correction H;
    the seal's hole is capped at 15% of the code and only drawn when it is 7+ squares across. Links point at
    the fixed `https://mas-monograms.com` (never the Studio's own origin); only own-site links get
    `utm_source=qr&utm_medium=<placement>&utm_campaign=<batch or YYYY-MM>`. Her pasted Google review link is
    kept in localStorage (`mas-qr-google-review-url`) unless `siteSettings.googleReviewUrl` is set (that wins).
    Every word is in `src/sanity/qrCopy.ts` (checked against the audit's `JARGON` by the test). No network,
    so no CSP change.

- **Phase D: safety and polish (2026-10-05).** Tested by `src/lib/studio-phase-d.test.ts` and
  `scripts/lib/order-rank.test.mjs`.
  - **Trash, not Delete** (the kit's since 2026-10-18, `src/sanity/kit/trash.tsx`). On
    `kitConfig.trashTypes` (photos, clearance items, questions, price tags, thread colors, fonts; NOT
    categories or pages) "Move to Trash" writes a `trashedItem` with the published copy and the unpublished
    changes kept apart and deletes the original, in one transaction (this site's model, ported to the
    starter). It refuses, in plain words, while another item references it. Desk item "Trash (bring things
    back)" (`DESK.trash`): "Bring it back" re-creates each copy under its own id; "Delete forever" asks
    twice and is not offered in her staff view.
  - **Drag to reorder** (`@sanity/orderable-document-list` 2.0.9) on photos, clearance items, price tags,
    questions, fonts and shop categories: `dragList()` in `structure.ts` wraps `orderableDocumentListDeskItem`,
    titles the pane "...: drag to put them in the order you want" and REPLACES its menu (no "Reset Order" or
    "Toggle Increments"; one "+" with the starting template). Thread colors stay a plain list (hue-sorted in
    code). Queries: `RANK_ORDER` / `FAQ_POSITION` in `src/lib/queries.ts`. New ranks: only with the plugin's own
    LexoRank steps (`scripts/lib/order-rank.mjs`); hand-written seeds like "a0" do not parse. **Gotcha:**
    `sanity schema extract` died with "exports is not defined" because the CLI's Vite loader (cli-core 3.6.1)
    cannot run CommonJS `lexorank`; `sanity.cli.ts` sets `vite.ssr.external: ['lexorank']`.
  - **"Copy a link so someone can see this before it is on your website"** (`actions/shareLink.tsx`): mints a
    one-hour preview secret like the PORTABLE `components/shareDraftLink.tsx` (copied byte-identical, used for
    `previewPathFor` only, because its toasts say "draft"); shown only where `/preview/...` can draw the page
    (`lib/previewable.ts`, Reid's `shareWhenPreviewable` rule; legal pages and settings get none); https only.
  - **"How this looks on Google"**: `seoPreview` (`schemaTypes/_seoPreview.ts`) with
    `components/GooglePreviewInput.tsx`, an INPUT (useFormValue), adapted from the PORTABLE SeoSnippetInput (not
    copied: the address comes from `pathForDoc`, the domain is mas-monograms.com, soft letter-count hints from
    `lib/googlePreview.ts`).
  - **Addresses lock once published** (`components/LockedAddressInput.tsx` on `itemCategory.slug` and
    `legalPage.slug`) instead of fbcm's PORTABLE `slugRedirect`: a category is a page she does not add or remove
    alone, and redirects would add a redirect list, a build reader and a Publish wrapper she cannot see. To
    change an address, Nathan patches the slug and adds `/<old> /<new> 301` to `public/_redirects` by hand.
  - **"My brand kit" (Phase F, 2026-10-05).** `components/BrandKitPane.tsx`, registered as the top-bar tool
    `brand-kit` (`BrandKitTool`, `masTools`) AND the desk item `DESK.brandKit` (after the QR item), linked
    from Home's "Your pages". It replaced the old static `BrandKit.tsx` panel (deleted; its id
    `brand-kit` moved to the desk root). Sections: Download everything (the ZIP), My logo (3 logos x 4
    colourways, each a tile on its own ground with PNG 2000px / PNG 512px / SVG buttons, plus "Using my logo"
    with a clear-space diagram), pictures by platform, Ready to print (PDF and PNG), My colors (Copy buttons
    with a "Copied" confirmation and an aria-live note, approximate CMYK, a readable-pairs table computed
    from the hex), My fonts (outlined specimen SVGs, TTF downloads, OFL licence, Google Fonts links, install
    steps for Windows, Mac, iPhone and Canva), How I sound. Every button is a plain same-origin
    `<a download>` (48px+, `aria-label` naming the exact file), so no CSP or network change. Words and file
    lists: `src/lib/brand/brandKit.ts`; files: `public/brand-kit/` from `npm run brand-kit`
    (`scripts/generate-brand-kit.mjs` + `scripts/build-brand-kit-zip.mjs`, deterministic, committed, NOT in
    `npm run build`); sizes and the tagline (read from `siteSettings.tagline` at generation):
    `brandKitManifest.json`. Fonts: `scripts/build-brand-kit-fonts.py` (fontTools) instances the @fontsource
    WOFF2s into static TTFs in `scripts/assets/brand-kit-fonts/`. Tests: `src/lib/brand-kit.test.ts` (hex vs
    `globals.css`, exact pixel sizes, PDF page sizes, ZIP contents vs served files, deterministic ZIP writer,
    `_headers` rules, JARGON and no em-dash); `npm run audit:studio` section 6 scans the kit's words.
- A note on `npx sanity build`: it writes to `./dist` by default, which would clobber the
  Astro build. The Studio is built by `astro build`, so there is no `studio:build` script.
  A standalone bundle needs an explicit dir: `npx sanity build .studio-dist`.
- Content was bulk-seeded via `node scripts/seed-content.mjs` (re-runnable, deterministic ids)
- The "Start Here" studio guides (studioGuide/studioNotes/studioPlaybook singletons) are seeded via
  `node scripts/seed-studio-guides.mjs`. Since 2026-10-04 it is dry run by default and its default mode
  only ADDS the sections in `NEW_SECTIONS` (fixed `_key`s, insert-if-absent on `studioGuide` and any
  `drafts.studioGuide`), because Mary Ann can edit the guides. To add a handbook section: put it in
  `NEW_SECTIONS` with a new fixed `_key`, dry run, `--apply`. `--replace-all --apply` is the old full
  createOrReplace and wipes her edits: fresh datasets only. Do NOT run `scripts/seed-core.mjs`
  — it is the leftover interior-design "Studio Starter" seed and would inject junk `service`/`journalEntry`
  docs.
- **Label fields (2026-10-04).** The last hard-coded page labels became optional Sanity fields (table in
  `docs/06-sanity-content-model.md`): `siteSettings.menuContactLabel`, `pricingTier.highlightLabel`,
  `pricingPage.tierPricePrefix`, `font.atelierStyle`, `fontGuidePage.popularLabel`/`tryItLabel`,
  `legalPage.lastUpdatedLabel`, `thankYouPage.responseTimeLabel`/`nextStepsLabel`, `styleGalleryPage`
  filter, announcement (`{filter}`/`{count}`/`{total}` template) and "Photo viewer" lightbox labels,
  `itemCategory.galleryHeading`/`requestSimilarLabel`/`crossSellHeading`/`banner*`,
  `clearancePage.quantityLeftLabel` (`{count}`), `threadChartPage.filterLabel`,
  `atelierSettings.pauseLabel`/`playLabel`. Seeded by **`scripts/seed-pending-fields.mjs`** (sanity-lib
  dry-run gate, setIfMissing on each published doc and its draft; a second `--apply` reports 0 changes).
  Add the next label pass to that script the same way. Backup: `tmp/backups/production-2026-10-04-pending.tar.gz`.
  Second pass 2026-10-05: `styleGalleryPage.introCtaLabel`, `fontCaption` (`{font}`), `filterGroupName`,
  `filterFallbackHeading`, `moreTagsLabel` (`{count}`), `lessTagsLabel` (backup
  `tmp/backups/production-2026-10-05-followups.tar.gz`).
- **Hoop fit and the no-JS quote note (2026-10-04).** `galleryItem.hoopFit` (`good` default / `poor`, radio,
  "Show it in a round hoop?") keeps a photo out of every round hoop; `requestAQuotePage.noScriptMessage` is the
  `<noscript>` note on the quote form. Category queries use the `IMG_HOOP` projection (hotspot, crop, and the
  `hoopFit` of the gallery item sharing the asset, via a `^.asset._ref` subquery); `src/lib/hoop.ts` picks.
  Seeded by **`scripts/seed-hoopfit.mjs`** (sanity-lib dry-run gate, setIfMissing on doc and draft, second
  `--apply` = 0 changes). Backup: `tmp/backups/production-2026-10-04-hoopfit.tar.gz`. Details in `docs/06`.
- **Atelier content (2026-10-04).** `atelierSettings` is a new singleton (schema
  `src/sanity/schemaTypes/atelierSettings.ts`, desk entry "Monogram preview" under
  Pages on my website since 2026-10-05, in `SINGLETON_TYPES` in `src/sanity/editorActions.ts`). It holds every word of the live preview: section copy, control labels,
  `styles[]` (`key` is fixed by the code: classic, script, block, circle, single), `fabrics[]`
  (`key`, `label`, `color` hex, `note`), `sampleMonograms[]` (initials only, never real people's names),
  button labels, the "preview, Mary Ann confirms your proof" `disclaimer`, and the hero try-it words.
  `homePage` gained 14 optional fields: `marqueeEyebrow`, `categoriesNote`, `makerQuote`,
  `makerSignature`, `makerFacts[]` (true statements only), `wallEyebrow`/`wallHeadline`/`wallSubhead`/
  `wallCtaLabel`, `finalEyebrow`/`finalHeadline`/`finalSubhead`/`finalCtaLabel`/`finalCtaHref`. Existing
  fields are untouched so the live Studio never breaks. Read with `getAtelierSettings()` and
  `getHomePage()`. Field reference: `docs/06-sanity-content-model.md`.
- **`scripts/seed-atelier.mjs`** seeds both. Dry run by default (`--apply` writes); `atelierSettings` is
  `createIfNotExists` (skipped if it or its draft exists) and the new `homePage` fields are `setIfMissing`
  on the published doc AND `drafts.homePage` if one exists, so a re-run never overwrites Mary Ann's
  edits. A dataset backup was taken 2026-10-04 in `tmp/backups/` (gitignored). Procedure for any live
  write: backup, dry run, apply, verify read-only. Never run `seed-core.mjs`.
- **After adding schema fields**, run `npm run typegen` and commit `src/lib/sanity.types.ts` (gotcha 1),
  and add the new field to the GROQ projection in `src/lib/queries.ts` or the page will not see it.
- Any new seed or patch script should import `scripts/lib/sanity-lib.mjs` rather
  than build its own client: it brings a **dry-run-by-default** gate (`--apply`
  to actually write) with the production second factor (`NCS_PRODUCTION_WRITE=yes`),
  Portable Text builders, and an idempotent asset uploader. The older scripts with
  their own client use `scripts/lib/write-gate.mjs` for the same gate. The rules for
  every write are in `.claude/rules/data-scripts.md`.

## Gotchas (Sanity)

<!-- prettier-ignore-start -->
1. **The committed `src/lib/sanity.types.ts` goes stale silently.** `npm run
build` does not chain typegen, so the file is committed by hand after every
   schema change — and on 2026-08-27 it was already two `studioGuide` fields
   behind, on a green build. presacademy shipped types describing a schema that
   no longer existed the same way. CI now regenerates and fails on any diff. Two
   consecutive local typegen runs are byte-identical, so a diff always means a
   stale commit, never generator noise. Fix: `npm run typegen`, commit.
7. **A quoted token in `.env` yields a 401 that reads like a permissions
   problem.** `scripts/lib/loadEnv.mjs` takes quoted values literally, quotes
   included. Write tokens bare. And Sanity refuses to delete a document that other
   documents still reference, so cleanup scripts must unlink before deleting.
8. **Studio files never port blindly between these repos.** This project is now on
   Sanity **6.4**, the same major as WCP, presacademy and the starter, but the
   rule stands: a file copied across a major boundary compiles and then dies at
   browser runtime — which is also where schema errors surface, since they pass
   the build. Port the pattern, write the file against the target repo's actual
   major, and open the Studio in a real browser to verify.
<!-- prettier-ignore-end -->
