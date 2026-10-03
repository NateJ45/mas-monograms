---
paths:
  - 'src/pages/preview/**'
  - 'src/pages/api/draft-mode/**'
  - 'src/components/preview/**'
  - 'src/layouts/PreviewLayout.astro'
  - 'src/lib/cms-preview.ts'
  - 'src/lib/preview-*.ts'
  - 'src/lib/page-fields*.ts'
  - 'src/lib/sanity-path*.ts'
  - 'src/sanity/resolve.ts'
---

# Live draft preview (/preview/**)

Loads when you touch the preview routes, overlay components or preview libs.

Added 2026-08-28 (PORTS.md cards 10, 11, 17). Mary Ann sees her **unpublished drafts**
rendered live inside the Studio: open the **Preview** tool at `/studio`, and the page list
on the left drives an iframe of the site.

- `src/lib/cms-preview.ts` is a SECOND Sanity client, separate from `src/lib/sanity.ts`
  (build-time): it reads the token from the **Worker runtime env** per request, uses
  `perspective: 'drafts'`, and turns on **stega** so click-to-edit works. It accepts either
  `SANITY_TOKEN` or this project's existing `SANITY_API_READ_TOKEN`.
- **Never compare a stega-encoded string in logic.** Stega hides about 1KB of invisible
  markers inside every string it touches, so `linkType === 'internal'` is `false` on an
  encoded value and the component silently picks the wrong branch, **in preview only**.
  Every enum that drives rendering is excluded via `NON_STEGA_FIELDS` in `cms-preview.ts`.
  **Add any new logic-driving dropdown field to that list the day you add the field.**
- `src/pages/preview/live.ts` is an **SSE proxy**: it holds ONE long-lived connection to
  Sanity's listen API server-side (the token never reaches the browser) and forwards a tiny
  "change" signal. `VisualEditingOverlay` soft-refetches the page and swaps `#main`. It is
  event-driven on purpose. **Never replace it with an interval poll** (that is what burned
  the WCP Sanity quota).
- The preview cookie carries an **unforgeable fingerprint** of the server-side token
  (`src/lib/preview-auth.ts`), not the package's default `'true'`.
- Preview pages render chrome-less (a slim bar says so). The real Header and Footer link to
  the live site and would bounce Mary Ann's iframe out of the preview.
- **Every page here previews as its EDITABLE SURFACE**, not as a pixel copy. This site has
  no page builder: all twelve page singletons are bespoke fixed-field documents and there
  is no `SectionRenderer`. So `/preview/*` renders the real Hero, then each repeatable list
  the page is built from, then the closing CTA, with a note on the page saying so.
- **In-canvas controls.** Each repeatable list item carries a `data-sanity` attribute built
  by `arrayItemEditAttr` in `src/lib/preview-edit-attr.ts`, so the overlay can outline it
  and offer insert-before/after, duplicate, remove and drag-to-reorder right on the page.
  Two rules. (1) The attribute is **preview-only**: no static page calls the helper, so
  every live render is byte-identical, and `npm run parity compare` is the gate. (2) The
  wrapper must be a **real block box**, never `display: contents`, because the overlay
  outlines the element's rect and a `contents` element has none.
- **The "Edit here" card** (card 28, 2026-08-28). Click a line the preview draws - a hero
  eyebrow, headline, slanted word or intro line, or the closing banner's headline, text or
  button label - and a small card opens on the line itself with the current words in a box.
  Enter saves, Shift and Enter starts a new line, Esc cancels; an emptied box unsets the
  field rather than storing `''`. It writes through the optimistic document API, so there
  is **no token in the browser**: the patch travels the comlink to the Studio, lands in the
  draft, shows in the unpublished-changes badge, is covered by the Studio's own undo, and
  still needs Publish. Which lines it may edit lives in `src/lib/page-fields.ts`, and
  `src/lib/page-fields.test.ts` is a **drift gate** that reads the page schemas, the
  registration list and the preview route and fails when they disagree.
  **ONE control, not three.** The sibling repos also put a band-colour card and an
  accent-word picker in the canvas. Neither has a field to stand on here: no page schema
  carries a background or tone, and nothing feeds `splitScriptAccent` (Hero has no
  `scriptAccent` prop). The one live heading flourish, `heroItalicWord`, is APPENDED after
  the headline rather than matched inside it, so it gets a plain text card like any other
  line. The drift gate asserts all three absences, so adding a control has to be a decision
  rather than a drift.
  `src/lib/sanity-path.ts` and `src/components/preview/overlay/{styles,usePopover,useDraftDocument}.ts`
  are **PORTABLE** canonical copies from the starter; the per-repo halves are
  `page-fields.ts`, `overlay/tool-theme.ts` (the six-value palette), `overlay/index.ts` and
  `overlay/TextPopover.tsx`.
- **The path-to-type map lives in THREE places that must stay in sync:**
  `SINGLETON_PREVIEW_PATHS` in `src/sanity/resolve.ts`, `PREVIEW_PAGES` in
  `src/pages/preview/[...slug].astro`, and `FIRST_SEGMENT_PREVIEWABLE` in
  `src/layouts/PreviewLayout.astro`'s click interceptor. The third is the one that degrades
  **silently**: a missed entry does not error, it just lets a click escape to the live site.
- **Activating preview takes two things outside the code:** the runtime token (`.dev.vars`
  locally, `npx wrangler secret put` in production) and the origin on the project's CORS
  allow list (`npx sanity cors add <origin> --credentials`). Without the token everything
  **fails closed**: the preview routes answer 503 naming the missing pieces rather than a
  stack trace. The public site builds and serves normally either way.
