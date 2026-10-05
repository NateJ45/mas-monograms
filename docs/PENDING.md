# PENDING: the open-loops registry

The live registry of open patches, known gaps and waiting-on-a-human items (PORTS.md card 15).
**Read it early in a session; update it in the same commit that opens, closes or discovers an item.**
It is a registry, not a changelog: edit in place and keep it short. Finished items move to "Recently
closed" as one line; the full story is in git history and `_vault/clients/mas-monograms.md`.

Launch content and env-var work is tracked in `docs/08-deployment-and-status.md`.

## Open: needs a human (Nathan or Mary Ann)

- **Check the Phase A Studio in the signed-in browser (2026-10-05).** It cannot be driven by Playwright (it
  needs a Sanity login), so these were verified by build, types, unit tests and reading only: the desk opens
  on Welcome (an empty desk and a click on "Edit my content" both land there); every Welcome card opens the
  right form or list (the phone card focuses the phone box; "Add a photo" opens a new photo from the "New
  photo of my work" template); the first-visit tour shows once (clear `mas-studio-tour-v1` in localStorage to
  see it again) and "Show me the tour again" replays it; the top bar reads "Edit my content / Edit on the page
  / My photo library" with no Releases tab and no "Drafts" menu; the type is visibly larger and nothing
  overlaps (the ramp is scaled in `src/sanity/theme.ts`); Home shows no red marks and six tabs; the "+"
  menu lists only the seven things she makes; a reference box offers no "Create new Home page"; Publish
  shows the "about 2 to 3 minutes" toast once the publish lands; "Undo last change" and "Redo" are in the
  three-dots menu; the Sold / Needs a photo / Google badges appear; the thread list shows colour dots.
- **Run the Start Here guide patch, then tell Mary Ann her editor moved.** The embedded Studio has been
  live at `<site>/studio` since 2026-09-05, so the precondition for
  `node scripts/patch-studio-guide-presentation.mjs --apply` is met, but it has never been run: a dry run
  on 2026-10-05 still reports 3 changes (the "Website pages" row and the "You can always undo" tip still
  describe the removed per-page "Preview" tab; the Presentation how-to is missing). It rewrites Mary
  Ann's handbook, so it waits for Nathan. Then move her bookmark to `<site>/studio`.
- **Retire the hosted Studio (unverified).** `sanity.cli.ts` has no `studioHost`, so the hosted copy
  never updates. The project still lists one hosted studio (created 2026-06-30, checked 2026-10-05
  through the Sanity API), which is most likely the stale `mas-monograms.sanity.studio`. Delete it at
  sanity.io/manage, project `xp3elugr`; after that the `https://*.sanity.studio` entries in
  `public/_headers` can go.
- **CORS tidy-up.** The live origins are allowed (`mas-monograms.com` and the workers.dev host, both with
  credentials, checked 2026-10-05). Missing: `http://localhost:4321` (the local embedded Studio; the list
  has the old `:3333` instead). Stale: the retired staging Worker origin.
  `npx sanity cors add http://localhost:4321 --credentials`.
- **Set the `SITE_URL` repo variable** to make the hourly uptime check do something
  (`.github/workflows/uptime.yml` warn-and-skips without it; not set as of 2026-10-05). A variable, not a
  secret: `gh variable set SITE_URL --repo NateJ45/mas-monograms --body "https://mas-monograms.com"`.
- **Content for Mary Ann (Sanity, not code).** Eyebrows long enough to read as all-caps body:
  `/request-a-quote` "Free · About 2 minutes · No payment now" and `/how-it-works` "No cart. No
  checkout. No guessing."; shorten them or move the line into the lede. Quote-form labels mix Title Case
  ("Personalization Details", "Thread Color Preference (Optional)") with sentence case. The Terms page
  body and every page's `seoTitle` (for example "Pricing", em-dash, "MAS Monograms") use em-dashes; house style is commas,
  colons or a separator. The title fallbacks in code and `BaseLayout`'s brand suffix match the em-dash on
  purpose, so change them together with the Sanity titles if the separator changes.
- **Review the font-to-style mapping** (`font.atelierStyle`, chosen by Claude on 2026-10-04 in
  `scripts/seed-pending-fields.mjs`).

## Open: code work queued

- **The 404 page ignores its Studio box.** `NotFoundBody.astro` (was `404.astro`) reads `page.subhead`, which
  no schema declares, so the line under the headline is always the built-in "The page you're looking for
  doesn't exist or may have moved." The Studio's `notFoundPage.body` ("It happens! Maybe a link...") never
  showed; it is hidden since 2026-10-05 so editing it cannot mislead. Fix: read `page.body` there, unhide
  `body` in `src/sanity/schemaTypes/notFoundPage.ts`, re-baseline parity for `/404` (the words change).
- **Quote-form words with no Studio box.** The redesigned form (`request-a-quote.astro` `L` table) reads
  `itemTypePlaceholder`, `*Error` messages, `personalization*`, `threadColor*`, `gift*`, `attachmentsHelp` /
  `attachmentsError`, `notesLabel` / `notesPlaceholder` and `submittingLabel`, none of which the schema
  declares, so they always show their built-in words (some in Title Case, against the house style). The old
  boxes that held her versions (`monogramDetails*`, `colorPreference*`, `fileUpload*`,
  `specialInstructions*`) are hidden since 2026-10-05. Fix: declare the new names, add them to
  `getRequestAQuotePage`, and seed each from its old twin with setIfMissing (backup first). Needs Nathan's
  go-ahead for the dataset write.
- **Home's closing banner in the in-canvas card.** `src/lib/page-fields.ts` lists `ctaHeadline` / `ctaSubhead`
  / `ctaLabel` for `homePage`, but the real home page draws `final*` (they shadow `cta*`, now hidden). When
  the Presentation rebuild draws the real home page, the card should edit `final*` there.
- **Swash fallback reflow on a slow first load.** Until the 46 KB swash subset arrives (~1.8s on a
  1.6 Mbps throttle) the swash word paints in the system italic, which is wider and can rewrap the
  headline. Metric overrides cannot fix it (width ratio runs 0.78 to 0.92 across sizes). Option if it
  matters: `font-display: block` for the swash face only.
- **Atelier: small leftovers after the column sweep.** On zoomed crops: bracketed serif feet (`A`, `M`,
  `F` bases) mitre with a slightly ragged edge; a `B`, `S` or `K` curve fans a little on its outside; a
  faint row-family seam can cross a wide column; the block `N` diagonal ends on a short level mitre.
  (`src/lib/atelier/columns.ts`, `stitches.ts`; see `.claude/rules/atelier-engine.md`.)
- **The pin story in `.claude/rules/dependencies-and-deploy.md` is stale.** It says `@astrojs/cloudflare` is
  pinned exactly 14.2.4 and wrangler `~4.110.0` (gotchas 9, 10); `package.json` has carried `^14.3.0` and
  `^4.129.0` since 796f5fd (2026-09-05), and builds and deploys are green. Re-verify the reasoning before
  rewriting those gotchas (found 2026-10-05; CLAUDE.md now states the installed ranges).
- **Unregistered starter schemas are still on disk.** `sections.ts`, `richSections.ts`, `page.ts`,
  `processPage.ts`, `servicesPage.ts`, `service.ts`, `philosophyPoint.ts`, `journalEntry.ts` and friends
  live in `src/sanity/schemaTypes/` but are not imported by `index.ts`, so a grep for `pageBuilder` finds
  arrays this site does not have. Deleting them is safe; deferred only as unrelated churn.
- **The preview surface is a summary, not the page.** `/preview/*` renders the hero, the repeatable lists
  and the closing CTA (no page builder, no `SectionRenderer`). Converting a singleton to a section array
  (PORTS.md card 12) would give it full-fidelity preview. Worth it for Home if Mary Ann ever asks to
  reorder sections.

## Notes (decided, not tasks)

- **Text in the logo is outlined**, so the brand name inside the drawing cannot come from Sanity (the
  accessible name does, `siteSettings.title`). Regenerate with
  `docs/logo-concepts/2026-10-04-atelier/generator/brand.mjs` (needs Python fontTools) if the name changes.
- **The Brand kit panel's logo paragraph is hard-coded** (`src/sanity/components/BrandKit.tsx`). The panel
  is static by design and Studio-only; move it only if the panel ever becomes a document.
- **Detector false positives on URL scans** (recorded so nobody chases them): low-contrast on dark
  sections (ground is a `::before`), gradient-text on the gold swash, hero-eyebrow-chip /
  kicker-above-heading, italic-serif-display, cream-palette, marquee, dark-glow,
  repeating-stripes-gradient (the linen weave), buried-raster, nested-cards, shape-assembled-illustration,
  tight-leading on the about pull quote, gray-on-color for taupe on Kraft (5.2:1). Lighthouse and axe are
  the accessibility truth and both are clean.
- **Lenis smooth scroll was removed on 2026-10-04.** Do not reintroduce it.

## Standing risks

- **No backups (Nathan, 2026-10-03).** `.github/workflows/sanity-backup.yml` is disabled in GitHub
  (`disabled_manually`); there is no second copy of Mary Ann's content and no restore drill. To turn it
  on: a read token at sanity.io/manage, `gh secret set SANITY_AUTH_TOKEN` and `BACKUP_PASSPHRASE`,
  `gh workflow enable 344134314 --repo NateJ45/mas-monograms`, confirm a real run, then
  `docs/RESTORE-DRILL.md`. One-off exports before live writes go to `tmp/backups/` (gitignored, local only).
- **Worker secrets live only in Cloudflare.** `TURNSTILE_SECRET_KEY` and `SANITY_TOKEN` (listed by
  `wrangler secret list`, 2026-10-05) are in no repo and no backup.
- **Sanity refuses to delete a document other documents reference.** Cleanup scripts unlink first.
- **A quoted token in `.env` gives a 401 that reads like a permissions problem.** Write tokens bare.

## Recently closed

- 2026-10-05: Studio Phase A (spec `docs/superpowers/specs/2026-10-05-studio-direction.md`): no red errors on
  live documents (`npm run audit:studio` clean), obsolete fields hidden, plain forms, task desk with ids,
  Welcome, tour, Undo/Redo, Publish note, badges adapted for MAS, search weights, templates. The stray
  top-level "Legal / Policy Page" entry is gone (legal pages are under Pages on my website).
- 2026-10-05: Quote emails redesigned and branded (`src/lib/quote-email.ts`, hosted logo PNGs in `public/brand/email-*-v1.png`); the customer promise is now "within 1 business day" everywhere in code (Sanity already said so). First real send is still the live test.
- 2026-10-05: The last hard-coded words on `/style-gallery` ("Start your quote", "+ N more" / "Less",
  "Filter gallery", "Filters", the "{font} font" line) are optional `styleGalleryPage` fields, seeded.
- 2026-10-05: `DESIGN.md`, `PRODUCT.md` and `SECURITY.md` added to `@source not` (built CSS byte-identical).
- 2026-10-05: Em-dashes out of hard-coded visitor copy (quote form file and network messages, three SEO
  description fallbacks, the empty shop index line). Unused `ProcessStep.astro` deleted.
- 2026-10-05: PENDING pruned. Closed from evidence: Workers Builds deploy command (vault, 2026-09-05; the
  live `/studio` works); live CORS origins (Sanity API); `SANITY_TOKEN` on the Worker (`wrangler secret
list`); post-bump sign-in check (Nathan, on staging, 2026-09-06); `sanity.types.ts` committed (CI
  stale-types guard); `scripts/lib/sanity-lib.mjs` is used by six scripts; parity baselines are run on
  every render-neutral change; mobile LCP and the Fraunces italic decision superseded by the swash subset
  (audit-fix pass below).
- 2026-10-05: The header pill is real frosted glass (`view-transition-name` moved off `<header>`; gotcha 16).
- 2026-10-04: Audit-fix pass: phone menu fit, compositor-only header morph, italic subsets (`/` LCP 3384
  to 3009ms), label floor, quote emails in Heirloom Coast, detector findings 257 to 0.
- 2026-10-04: Hoop crops (`galleryItem.hoopFit`), the no-JS quote note, concentric stitches.
- 2026-10-04: Redesign day closed: quote email via Cloudflare Email Service, Turnstile, hotspots on all
  76 images, label fields seeded, logo/header/footer rework, parity baselines re-captured for Direction D,
  44px tap targets (PORTS cards 82, 83).
