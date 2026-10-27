---
paths:
  - 'src/pages/preview/**'
  - 'src/pages/api/draft-mode/**'
  - 'src/components/preview/**'
  - 'src/components/pages/**'
  - 'src/layouts/PreviewLayout.astro'
  - 'src/lib/cms-preview.ts'
  - 'src/lib/preview-*.ts'
  - 'src/lib/page-data.ts'
  - 'src/lib/edit-target.ts'
  - 'src/lib/stega-text.ts'
  - 'src/lib/page-fields*.ts'
  - 'src/lib/sanity-path*.ts'
  - 'src/sanity/resolve.ts'
---

# Live draft preview (/preview/**): "Edit on the page"

Loads when you touch the preview routes, overlay components or preview libs.

Added 2026-08-28 (PORTS.md cards 10, 11, 17). Mary Ann sees her **unpublished drafts** rendered
live inside the Studio: the "Edit on the page" tool at `/studio`, whose page list drives an iframe.

## The canvas IS the site (2026-10-05, Phase C)

- **The preview renders the REAL page files.** Every page in `src/pages/*.astro` takes an optional
  `preview` prop (`PageProps<T>` in `src/lib/page-data.ts`). Absent (the live build), the page loads
  its published data and wears `BaseLayout`, exactly as before. Present, it skips its fetch, uses the
  draft data the route hands it, and wears `PreviewLayout` with the route's `layoutProps` spread on top
  of its own BaseLayout props (so `header="overlay"` and `thread={false}` carry over by themselves).
  `src/pages/preview/[...slug].astro` imports each page file as a component, runs the page's loader
  (`load<Page>(fetch)` in `page-data.ts`, the SAME GROQ as the live page) through the draft client,
  and renders `<Page {preview} />`. One file, one markup: the canvas cannot drift from the site.
- **Why not shared "body" components** (tried first, 2026-10-05): moving a page's markup into a
  component of its own changed the LIVE HTML. The extra component boundary reorders rendering, so
  React's generated ids in the FAQ accordion moved (`radix-_r9R_` to `_r17R_`), and it reorders CSS
  modules (HoopFrame's styles landed after /thank-you's own: a cascade change). The page-file approach
  is byte-identical by construction. **Exception: the 404.** Astro also builds it into the server
  bundle, and once the preview route imported it, its styles moved ahead of the site stylesheet in the
  live head. So /404 and /preview/404 share `src/components/pages/NotFoundBody.astro`.
- **Category pages preview too:** `/preview/<category-slug>` renders `src/pages/[slug].astro` from the
  category's draft. `resolve.ts` maps each `itemCategory` there (`defineLocations`) and has a
  `/preview/:slug` main-document route LAST (the pattern also matches the fixed pages).
- **The gate is `npm run parity -- compare`** (23/23) after any change to a page file, a component a
  page renders, or this stack. Never regenerate the baselines for a preview change.
- **`PreviewLayout`** mirrors BaseLayout's body frame (`flex min-h-screen flex-col`, `data-header`,
  `<main id="main" class="relative isolate flex-1">` with the ThreadLine: `isolate` is load-bearing,
  the surfaces paint their cloth at z-index -2) with the real Header and Footer from DRAFT siteSettings
  (each a `data-sanity` target on siteSettings). Left out: analytics, canonical/OG/JSON-LD, the
  ClientRouter, the announcement, BackToTop, the reveals (forced to their end states). It fires
  `astro:page-load` on window load, as the ClientRouter does on the live site (several page scripts
  start only on that event), and **stops every form submit** (the quote form is the real one). The
  slim bar says "You are looking at your changes. Nothing is on your website until you press Publish."
- **Click targets for photos and lists** go through `src/lib/edit-target.ts` (`editField`,
  `editItem`, `editOther`), which return `undefined` (so NO attribute) unless the page got
  `preview.edit`. Targets today: home trust items, maker photo and facts, process steps, category
  hoops, studio-wall photos; about portrait, recent work, values; pricing tiers and add-ons;
  how-it-works steps; gallery photos; shop category hoops; clearance items; font specimens; thank-you
  photo and next steps; quote hero photo and trust items; category trust items, hero hoops, gallery.
  An item in a list of plain words is addressed by its position in the UNFILTERED list (the pages
  keep the index through their `.filter()`); object items by `_key` (projected in `queries.ts`).
- **Client-drawn widgets survive a refresh:** `VisualEditingOverlay` marks `[data-atelier-stage]`,
  `[data-hero-stage]` and `[data-thread-line]` with `data-morph-keep` on both trees before the morph,
  so an edit does not blank the stitching canvas or snap the thread back.

## Stega (click-to-edit markers)

- `src/lib/cms-preview.ts` is a SECOND Sanity client, separate from `src/lib/sanity.ts` (build-time):
  it reads the token from the **Worker runtime env** per request, uses `perspective: 'drafts'`, and
  turns on **stega**. It accepts `SANITY_TOKEN` or this project's `SANITY_API_READ_TOKEN`.
- **Never compare, parse or link a stega string.** Which fields stay clean lives in
  `src/lib/preview-stega-filter.ts`: `NON_STEGA_FIELDS` (dropdowns and machine values: `hexColor`,
  `hoopFit`, `tags`, `atelierStyle`, `colorFamily`, `styleTag`, `linkType`...) plus every field named
  `...Href`, `...Url` or `...Link`, judged by the last NAMED path segment (so `tags[2]` is `tags`).
  **Add any new logic-driving field there the day you add it.** Missing `hexColor` blanked the live
  stitching hero in the canvas (no thread passed the hex test).
- **`\s` matches U+FEFF, a stega digit**, so `text.split(/\s+/)` and `.trim()` cut the marker and
  the line loses click-to-edit ("Failed to decode stega" in the console). Cut Sanity words through
  `src/lib/stega-text.ts` (`takeRun`, `trimKeep`, `splitKeep`) or the stega-safe `swashSplit` /
  `splitSwash`. All return exactly the old values on the live site (no marker).
- Tests: `src/lib/preview-stega-filter.test.ts` (the filter, the cutters, the click-target helpers,
  and a scan of the page files for unprotected whitespace splits).

## Local rendering without the Studio

- `?dev-draft=1` on a `/preview/...` URL turns draft mode on WITHOUT the Studio cookie, **in
  `astro dev` only** (inside `if (import.meta.env.DEV)`), so drafts, stega and the overlay can be
  rendered and screenshotted with the token in `.dev.vars`. `scripts/check-preview-bypass.mjs` (a CI
  build step) fails if the production server bundle contains it. `/preview/live` still answers 403
  there (no cookie), so live refresh is not exercised locally.

## Live refresh, the card, the map

- `src/pages/preview/live.ts` is an **SSE proxy**: ONE long-lived connection to Sanity's listen API
  server-side, forwarding a tiny "change" signal; `VisualEditingOverlay` soft-refetches the page and
  morphs `#main`. Event-driven on purpose. **Never replace it with an interval poll** (that is what
  burned the WCP Sanity quota).
- The preview cookie carries an **unforgeable fingerprint** of the server-side token
  (`src/lib/preview-auth.ts`), not the package's default `'true'`.
- **The "Edit here" card** (card 28). Click a line of words and a small card opens on it; Enter
  saves, Shift and Enter is a new line, Esc cancels; an emptied box unsets the field. It writes through
  the optimistic document API (no token in the browser), lands in the draft and still needs Publish.
  Which lines: `src/lib/page-fields.ts` (EVERY line of words the pages draw, 2026-10-05, about 100).
  `src/lib/page-fields.test.ts` is the **drift gate**: each line must be declared AND drawn on exactly
  the pages it claims (it reads the schemas and the page files), every drawn text field must be a card
  or be listed in `NOT_A_CARD` with a reason (placeholders, templates, screen-reader names), and the
  route must render every page from its own file. **ONE control, not three**: no band colour (no page
  carries a background) and no accent picker (nothing feeds `splitScriptAccent`); `heroItalicWord`
  is appended after the headline, so it is a plain text card. The gate asserts all three absences.
  `src/lib/sanity-path.ts` and `src/components/preview/overlay/{styles,usePopover,useDraftDocument}.ts`
  are **PORTABLE**; the per-repo halves are `page-fields.ts`, `overlay/tool-theme.ts`,
  `overlay/index.ts` and `overlay/TextPopover.tsx`.
- **The path-to-type map lives in THREE places that must stay in sync:** `SINGLETON_PREVIEW_PATHS` in
  `src/sanity/resolve.ts`, `PREVIEW_PAGES` in `src/pages/preview/[...slug].astro`, and
  `FIRST_SEGMENT_PREVIEWABLE` in `src/layouts/PreviewLayout.astro`'s click interceptor (the silent
  one: a missed entry lets a click escape to the live site). Category slugs are the fourth, data-driven
  copy: the route writes them into `<html data-preview-categories>`.
- **Activating preview takes two things outside the code:** the runtime token (`.dev.vars` locally,
  `npx wrangler secret put` in production) and the origin on the project's CORS allow list
  (`npx sanity cors add <origin> --credentials`). Without the token everything **fails closed** (503
  naming the missing pieces). The public site builds and serves normally either way.
- **Instant structure** (starter card 183, 2026-10-26). Section moves, removals, copies and picture
  swaps are applied to the DOM from the same draft snapshots instant text uses, with no request:
  `src/lib/preview-structure.ts` (PORTABLE) plans, `src/components/preview/overlay/instantStructure.ts`
  does it, hooked up in `overlay/useInstantText.ts`. It finds sections by `data-sanity` values of the
  shape `id=<doc>;path=pageBuilder:<key>` (the starter's `sectionEditAttr`). This site's pages are
  bespoke, not a `pageBuilder` array, so nothing matches and it does nothing here; it is kept so the
  files stay in step with the starter, and starts working if a page ever renders a keyed section array.
- **The preview renders the Studio's own copy of the draft** (starter card 184, 2026-10-26). The overlay
  keeps the newest local draft of this page (`LiveDraftBridge` posts it) and its soft refresh POSTs it
  (`x-preview-posted-draft: 1`, JSON, same origin, 512 KB cap; `src/lib/preview-posted-draft.ts`, PORTABLE).
  In `src/pages/preview/[...slug].astro` the page loader's own `*[_type == "<type>"][0]{...}` query runs
  over that draft through `previewFetchPostedDraft` (`cms-preview.ts`); every other query reads the dataset
  as before, and a draft that is not this path's document (id and type) falls back to the stored one. Stega
  is rebuilt from the API's source map plus identity mappings for the posted strings. `/preview/live` now
  sends `{"id": "<documentId>"}` with each `change`, and the overlay ignores a change to its own page while
  the local channel is live (`localChannelCovers`, 5 s). Category and collection previews are not covered
  (their queries filter by slug) and keep the SSE path.
- **Typing straight onto the page** (starter card 185, 2026-10-26). In Edit mode a heading, subhead, button
  label or paragraph can be clicked and typed into in place. `overlay/InlineText.tsx` (mounted by the
  resolver in `overlay/index.ts` on every text field, renders nothing) arms an element with
  `contenteditable` on hover only when it shows exactly the stored value; on focus it strips the stega
  runs after the caret and sets `data-inline-editing`. The morph keeps that element whole
  (`INLINE_EDIT_ATTRIBUTE`, `preview-morph.ts`) and instant text skips it. Writes go through
  `useDraftDocument`, throttled to 250 ms; the overlay asks for one refresh when the editor lets go only
  if a render was held back meanwhile. Pure logic: `src/lib/preview-inline-edit.ts` (PORTABLE).
