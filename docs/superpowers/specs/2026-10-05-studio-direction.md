# Studio direction: "Mary Ann's Studio" (2026-10-05)

Nathan's brief: fully update Mary Ann's Sanity Studio to the standard of the fbcm, Reid Design and
Stone Steps studios. It has to be **incredibly easy for her to use and understand: she is older and
not technical.** Reference survey: the 2026-10-05 survey summarised below; reference code lives in
`clients\stonesteps-50k` (best editor experience), `clients\fbcm`, `clients\ReidDesignAstro\reid-design-site`
and `internal\ncs-astro-sanity-starter` (library of record, PORTABLE files must be copied byte-identical).

## What Mary Ann sees today (walked in the real Studio on 2026-10-05)

- Opens to a BLANK pane with a short menu: Start Here, Business info & contact, Website pages (edit the
  words), Photos & products, and a stray "Legal / Policy Page" (a safety-net list that catches the
  unplaced `legalPage` type, named inconsistently).
- Top bar says Structure / Presentation / Media / Releases plus a "Drafts" perspective menu and three
  unlabelled icons. All jargon. Small text.
- The Home page form has ten tabs, a red alert on the "All fields" and "Top of the page" tabs, and a red
  "No items" error on "Top-of-page photos", a field the redesigned home page no longer uses. Help text
  still says "Use <em> syntax for italic accent words". Several fields are obsolete after the redesign.
- "Edit on the page" (Presentation) shows a simplified summary of each page ("This page's middle is
  drawn in code...") in the OLD look, not the real redesigned page. In-canvas editing exists but the
  canvas is not the site.
- Publishing: until 2026-10-05 nothing she published ever reached the live site (no Sanity webhook, no
  Cloudflare deploy hook). Fixed that day: webhook "Rebuild live site" -> deploy hook "Sanity content
  publish"; a publish now rebuilds the site and the change is live in about 2 to 3 minutes. The Studio
  must say so.
- No Undo, no Trash (Delete is permanent), no Welcome or tour, the handbook lives in editable documents
  (it can be edited out of date, and its text is partly false: it mentions a Preview tab that was removed
  and says changes go live "within a few seconds"), Releases tab is on, `documentBadges.tsx` is the
  starter's unadapted copy.

## Principles (every change is judged against these)

1. **Task first, not data first.** She thinks "change my phone number", "add a photo of my work",
   "mark a clearance item sold", "change a price", "see what it looks like". Navigation and the first screen are
   built around those jobs, with one click from the Welcome screen to the exact field.
2. **Plain words.** Never show her: document, field, schema, slug, dataset, singleton, draft, perspective,
   release, JSON, markdown, HTML. Say "page", "words", "photo", "price", "not on the website yet".
   Keep the word **Publish** (it is on the button) and always explain it once: "Publish puts your change on
   your website. It shows up in about 2 to 3 minutes." Short sentences. Warm, calm, no exclamation spam.
   No em-dashes in anything she reads.
3. **Big and calm.** Larger base text (aim 17 to 18px body, 20px+ headings), bigger buttons (48px), high
   contrast on the Heirloom Coast theme, generous spacing, fewer things on screen at once. System sans for
   the interface (fbcm learned serifs are hard to read at Studio sizes), brand serif only for pane headings.
4. **Nothing scary.** No red errors for things she cannot fix or that do not matter. Obsolete fields are
   hidden (data kept). Required means required for the page to work. Validation messages are friendly
   instructions ("Please add a short description of the photo so it can be read aloud"). Destructive
   actions go through Trash and a confirm dialog; Delete forever is hidden for everyday content.
5. **Safe to explore.** She must never be afraid to click: say "Nothing you do here reaches your website
   until you press Publish" on the Welcome screen and in the tour; Undo/Redo buttons; a Trash she can
   restore from; no way to create duplicate singleton pages.
6. **See it, then click it.** The primary way to edit words is on the page itself (Edit on the page), on the
   REAL redesigned page, click a line, a small card opens, type, Enter. The form view is the fallback.
7. **Guidance where she is.** A first-visit tour, a Welcome screen of task cards, a "What needs
   attention" checkup, and a handbook kept in the repo (tested against the desk names, with "Take me
   there" links), written at a large readable size with numbered steps.
8. **Honest and true.** The words in the Studio must match what the site actually does (rebuild delay,
   what each page is, which fields exist). No invented claims.

## Hard rules

- Sanity-first for site copy; Studio help text may live in the repo (typed guide data) like Stone Steps.
- Keep `sanity` 6.9.1 / `@sanity/ui` 3.5.4; do NOT bump `sanity-plugin-media` to 6.x or the Unsplash
  plugin past 7.0.15 (they pull @sanity/ui 4 and blank the dev Studio). One styled-components only;
  Studio components import from the root `node_modules` only (PORTS card 10).
- Embedded Studio is hash-routed: route in-Studio links through `router.navigateUrl` (stone-steps
  `studioLink.ts`), never plain `href="/studio/..."`.
- Every desk item gets an explicit `.id()` so deep links work (derived ids broke Stone Steps).
- PORTABLE files (checkPage, UndoRedo, shareDraftLink, pageActions, slugRedirect, SeoSnippetInput,
  undoRedo.ts, saveSectionPreset) are copied byte-identical from the starter or not at all; per-site
  differences live in wrapper files. `scripts/sync-check.mjs` must stay at 0 drift.
- Any new dropdown that drives rendering goes into `NON_STEGA_FIELDS` in `src/lib/cms-preview.ts` the day
  it is added. Studio CSP: `public/_headers` `/studio` policy needs a grant for any new endpoint or web
  font; rules for the same path do not merge (PORTS card 59).
- Run `npm run typegen` after schema changes and commit `src/lib/sanity.types.ts`.
- Live data changes (seeding, backfills): `scripts/lib/sanity-lib.mjs`, dry run by default, `setIfMissing` on
  the published doc and its draft, backup first (`npx sanity dataset export production
  tmp/backups/production-<date>-<what>.tar.gz`), verify read-only, second apply = 0 changes. No
  nightly backup exists for MAS, so backups before writes matter. Never run `seed-core.mjs`.
- No git commands from agents except read-only; the main session commits.
- The Studio cannot be driven by Playwright (it needs a Sanity login). Agents verify with typecheck, lint,
  unit tests, `npm run build`, and by reading; the main session verifies visually in the signed-in Chrome
  against a local dev server on port 3333 (already in the project's CORS list) or the deployed Studio.
- Docs are part of done: CLAUDE.md, `.claude/rules/sanity-studio.md`, `live-preview.md`,
  `docs/06-sanity-content-model.md`, `docs/PENDING.md`, and the vault is updated by the main session.

## Phases

- **A. Foundation and fixes**: obsolete fields hidden, no red errors, plain-language form pass, desk
  restructure by task with ids, Welcome pane + studioLink + ToolHeading, first-visit tour, Releases off,
  friendlier tool names, larger readable theme, badges adapted, Undo/Redo, publish message, search
  weights, templates.
- **B. Handbook and checkup**: repo-data guides with "Take me there", rewritten for Mary Ann; a Checkup
  pane ("what needs attention"); guide/desk consistency tests; `scripts/audit-studio.mjs`.
- **C. Edit on the real page**: Presentation shows the REAL redesigned pages (draft perspective, stega,
  click-to-edit, in-canvas controls), not a summary.
- **D. Safety and polish**: Trash/archive instead of Delete, drag-to-reorder lists, SEO snippet preview,
  copy share link, safe rename (redirects) for category addresses.
