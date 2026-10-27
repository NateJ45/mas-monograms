# PENDING: the open-loops registry

The live registry of open patches, known gaps and waiting-on-a-human items (PORTS.md card 15).
**Read it early in a session; update it in the same commit that opens, closes or discovers an item.**
It is a registry, not a changelog: edit in place and keep it short. Finished items move to "Recently
closed" as one line; the full story is in git history and `_vault/clients/mas-monograms.md`.

Launch content and env-var work is tracked in `docs/08-deployment-and-status.md`.

## Open: needs a human (Nathan or Mary Ann)

- **The Studio on the shared kit (2026-10-18, starter cards 106 to 120): Nathan's switches.** Built and
  unit-tested; the signed-out `/studio/` page was checked in a browser. Each item below unlocks one piece and
  until then that piece says "not set up yet" by itself:
  - **Mary Ann's invitation is still pending** (Sanity project members, checked 2026-10-18: invited
    2026-07-08 as Administrator, never accepted). Until she accepts she cannot sign in at all. When she
    has, swap her email in `kitConfig.staff` (`src/sanity/kit.config.ts`) for her Sanity user id.
  - **Publish webhook filter**: add `"studioWeek"` and `"previewShare"` to the "Rebuild live site" webhook's
    deny-list (sanity.io/manage, API, Webhooks), or every hand tick on Home rebuilds the site.
  - **Visitors card**: create a Cloudflare Web Analytics site for mas-monograms.com, set the beacon token
    as the `PUBLIC_CF_ANALYTICS_TOKEN` BUILD variable in Workers Builds (the site already renders the beacon
    when it is set; it is not set in production), then on the Worker: secret `CF_ANALYTICS_TOKEN` (Account
    Analytics: Read), vars `CF_ACCOUNT_ID` and `CF_WEB_ANALYTICS_SITE_TAG`. The Privacy page names Google
    Analytics; add a line for Cloudflare Web Analytics (cookieless) in the same change.
  - **Messages (quote requests in the Studio)**: `npx wrangler d1 create mas-monograms-messages`, add the
    `CONTACT_DB` binding to `wrangler.jsonc` (a commented block is there), apply
    `migrations/0001_contact_submissions.sql` and `0002_message_status.sql` with
    `npx wrangler d1 migrations apply mas-monograms-messages --remote`, and say so on the Privacy page (the
    quote details are then also kept in D1, beside the R2 backup). `src/pages/api/quote.ts` writes a row
    only when the binding exists.
  - **"The last update didn't go through"** (card 111) reads GitHub Actions, but this site deploys through
    Cloudflare Workers Builds, so the route answers "not set up" and the status line falls back to the
    build-time check. Nothing to set; a Workers Builds version is a starter proposal.
  - **Morning change note**: `.github/workflows/change-note.yml` is in with its schedule commented out. To
    switch on: the `SANITY_PROJECT_ID` repo variable (`xp3elugr`), uncomment the schedule, and watch the
    repo. `SANITY_AUTH_TOKEN` is already set (the backup uses it).
  - **`PUBLIC_STUDIO_HELP_EMAIL`** build variable in Workers Builds, so Home's "Ask Nathan" has an email
    button (kept out of the repo on purpose).
- **Check the season pages and notices signed in (2026-10-18, PR 2).** Make a season page from "Season page:
  Christmas gift guide" (the "+" of "Gift guides and seasons"), press Generate, check the photos tagged
  "christmas" appear in Edit on the page (`/preview/collections/<address>`), then press Discard (or Move to
  Trash). Put up a notice from Quick update on a phone, see it across the top of the live site after the
  rebuild, and that it hides itself after its last day. The page itself was checked rendered with real
  photos (a local scratch page), not from a published document.
- **Check the kit Studio signed in (2026-10-18).** It replaces the Phase A, B and D click lists below for
  everything the kit now draws. Open `/studio` signed in, read the console, and check: Home opens first with
  the Indigo Deep banner, the Hoop Seal, "Monograms" in Petemoss and the gold thread along the foot; the four
  big buttons land on a new photo, the clearance items, the price tags and the phone box; "My weekly 15
  minutes" ticks (and a hand tick sticks after a reload); the Fix-it list names things with Edit buttons; the
  status line under the top bar; the Site Guide shows her handbook (quick answers, search, print); "Help for
  this page" beside a photo lists the photo guides; Move to Trash and Bring it back on a throwaway question;
  the two table panes under Clearance and prices; the icons (hoop, spool, needle, tag, tote, seal) in the
  desk and lists in light and dark; the larger type is still there; the tour shows once.

- **Click-check Phase D (drag order, Google preview, locked addresses; 2026-10-05) in the signed-in browser.**
  Done on the live Studio 2026-10-05 with a throwaway draft FAQ (since discarded): Move to Trash (confirm,
  atomic move to `trashedItem`) and Bring it back (restored, Trash row gone), and "Copy a link..." (shows
  "link copied", writes a `share-link` preview secret). NOT done: dragging a row (Chrome automation cannot
  drive the sortable's pointer events, so a person must try it), Google preview, locked addresses. Verified
  otherwise by types, lint, unit tests, audit, a scratch build and parity 23/23. The full click list is in the Phase D notes of
  `.claude/rules/sanity-studio.md`; the essentials: a test photo moved to Trash shows the confirm, leaves the
  list and appears in "Trash (bring things back)"; "Bring it back" returns it to the same place; "Delete
  forever" asks twice; dragging a row in "Photos of my work" sticks after a reload and the menu shows only the
  "+" button; a new photo from the "+" lands at the end; "Copy a link..." on the Pricing page gives a link
  that opens the page with unpublished changes in a private window (on the deployed https Studio only); the
  Google preview updates as she types; a shop category's address shows locked with the "Ask Nathan" note.
- **Handbook guides out of date after Phase D** (B owns `src/sanity/guides`): anything saying Delete is
  permanent or that there is no Trash, anything telling her to type a "Position" number, and anything saying
  photos are listed newest first. See the Phase D report for the list.

- **Click-check "My brand kit" (Phase F, 2026-10-05) in the signed-in browser.** Verified by types, lint,
  build, `src/lib/brand-kit.test.ts` and by viewing every generated picture, not by clicking. Check: the
  top-bar tool, the desk item and the Welcome card "Get my logo, colors and fonts" all open it; "Download
  everything" saves `mas-monograms-brand-kit-v1.zip` and it opens on Windows (Extract All); a logo button,
  a social picture, a PDF, a font file and a license each download with the right file name; Copy on a
  color shows "Copied" and pastes the hex; the jump buttons scroll; the page reads at phone width. Then
  hand Mary Ann the profile picture and Facebook cover when she sets up her pages (Get found guides).
- **Canva fonts on the free plan.** Uploading fonts needs Canva Pro (Canva Help, checked 2026-10-05). The kit
  tells her to search Fraunces, Mulish and Petemoss in Canva's own list and fall back to Georgia/Arial; if
  Nathan can confirm which of the three Canva Free lists, tighten that note in `INSTALL_STEPS`
  (`src/lib/brand/brandKit.ts`).

- **Click-check "Make a QR code" (Phase E, 2026-10-05) in the signed-in browser.** Verified by types, lint,
  build and `src/lib/qr/qr.test.ts` (every destination x placement decoded by jsQR, seal on and off), not
  by eye. Check: the top-bar tool, the menu item and the Welcome card all open it; Facebook/Instagram show
  greyed with an "Add my ... link" button until `socialLinks` has them; the Google review choice takes a
  pasted link (remembered after a reload) and "Take me to the guide" opens the handbook; the preview scans
  with a phone off the screen; the SVG and PNG downloads open and scan; "Print this" opens the print box and
  a printed 1-inch code measures 1 inch at 100%; Copy the link works; the page is usable at phone width.
  Then ask Mary Ann for her Google review link (Google Business Profile: Read reviews, Get more reviews, Copy) and put it in My
  business details.
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
- **Check the Phase B handbook and checkup in the signed-in browser (2026-10-05).** Verified by types,
  unit tests and reading only. Help (how do I...?) > "Guides and quick answers": the five quick answers,
  the search box (try "sold", "phone"), "Guides by topic" (empty topics hidden), a guide opens in place with
  big numbered steps, "What you will see" lines and the badge; every "Take me there" card lands on the right
  form, box or list (hash routing); the Stripe card opens a new tab; "See also" buttons switch guides; "Print
  this guide" previews ONLY the guide (`#mas-guide-print`); "Back to all guides". "My notes" opens with
  Overview and "Edit notes" tabs and the new "Who to ask for help" box. "What needs attention" opens from the
  desk, the Welcome card and the top-bar tool, shows "All clear" or cards with working buttons, and lists no
  Sanity system records as unpublished changes. "How the website works" is gone from the desk.
- **"Who to ask for help"** is set (2026-10-05): "Nathan Nixon, nathanjnixon86@gmail.com", published, and the
  live Help page shows it. Add a phone number there if Nathan wants her to be able to call.
- **Tell Mary Ann her editor moved** and move her bookmark to `<site>/studio`. (The old "Start Here" guide
  patch, `scripts/patch-studio-guide-presentation.mjs`, is moot since 2026-10-05: the `studioGuide` page is
  no longer on the desk; the repo handbook in `src/sanity/guides` replaced it. The document is kept.)
- **Retire the hosted Studio (unverified).** `sanity.cli.ts` has no `studioHost`, so the hosted copy
  never updates. The project still lists one hosted studio (created 2026-06-30, checked 2026-10-05
  through the Sanity API), which is most likely the stale `mas-monograms.sanity.studio`. Delete it at
  sanity.io/manage, project `xp3elugr`; after that the `https://*.sanity.studio` entries in
  `public/_headers` can go.
- **CORS tidy-up.** The live origins are allowed (`mas-monograms.com` and the workers.dev host, both with
  credentials, checked 2026-10-05). `http://localhost:4321` (the local embedded Studio) was added with
  credentials on 2026-10-17, for the Sanity phase-2 browser check. Still stale: the old `http://localhost:3333`
  and the retired staging Worker origin; removing them is a deletion, so it waits for a yes.
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
- **Get found: Nathan's parts (2026-10-05, from the handbook).** Done: mastone37@gmail.com is on the Search
  Console Domain property with **Full** permission (2026-10-05). Google Business Profile's instant "verify
  with Search Console" needs Owner, so promote her only if that route is wanted. Done: she is a Viewer on GA4 property 557338771 (2026-10-05, no invitation email sent) (the `is-it-working` guide says "Nathan can show you"). When
  Pinterest asks to claim the site, add its TXT record in Cloudflare DNS (no code change). Do the Google
  Business Profile and Apple Business setup with her on a call (both may need a video or a business paper).

## Open: code work queued

- **Studio complete, Phase B (2026-10-19, branch `feat/studio-complete-b`): code, four videos and the shots done; signed-in checks left.** Card 137 resynced, tours wired (`src/sanity/studio-tours.ts`), Quick update has Mark sold, Change a price, Change a clearance price and a Messages link. Recorded with the pipeline and checked frame by frame: `change-a-price`, `order-deadline`, `away-notice` (registered in `src/sanity/guides/videos.ts`, on their guides and Home's row). `clearance-sold` is recorded and on its guide (2026-10-20, after starter card 141 made Quick update's yes/no a visible switch).

- **Starter card 128 (Studio design language) adopted 2026-10-19; left: signed-in checks and real guide
  pictures.** `brand/brand.config.json` `studio.look` names her devices (gold cross-stitch marker, round claret
  stones joined by a claret running stitch that draws itself, indigo / gold / claret callouts, the thread hem
  along banner feet, the Midnight weave on featured panels, banner titles in the swash italic in thread gold).
  Her Site Guide (`HelpPane` + `GuideView`, her own richer guide format) is drawn in the kit's pieces
  (`src/sanity/kit/ui/`); guide icons are registry meanings (`GUIDE_MEANINGS` in `src/sanity/guides/iconNames.ts`).
  "View the website" on Home's banner wears her site's paper-patch button (`homeBanner.style.chip`, shape `stitched`, in `src/sanity/kit.config.ts`; card 135), and
  the /studio splash is her hoop with the name set as her headlines are (`StudioSplashMotif.astro`, in the slot of the shared `StudioSplash.astro`, card 132), with the kit's stone path as its progress; the offline page shares the partial and shows her thread motif.
  Still to do: check the signed-in Studio (Home banner, Site Guide, Help for this page) in a real browser; the
  kit's own `/kit-harness/guide/` view reads the kit's guide shape, not hers, so use `/kit-harness/studio/site-guide`.
  Art sources in `public/studio-art/` (drawn by `node scripts/gen-studio-art.mjs`).

- **Starter card 122 (private and hidden pages) to adopt next round.** Only its PORTABLE copies are in
  (2026-10-18). This site has no `_seoFields.ts` and no `hideFromSearch` box, and its menus are typed by hand
  in My business details, so nothing here needs to honour it yet.

- **"Share a preview" (starter card 117) is not switched on here.** Mary Ann already has "Copy a link..."
  (one hour, `src/sanity/actions/shareLink.tsx`), and the kit's action says "draft" in its tooltip, which her
  Studio never says, and its `?share=` block would need adapting to this site's preview route (each page
  reads many documents). `ncsWorkflowTools({ shareTypes: [] })` keeps it off. To adopt: the starter rewords
  the tooltip, then add the `?share=` block to `src/pages/preview/[...slug].astro` (drafts for every loader),
  copy `preview-share-server.ts` and `api/studio/share-preview.ts`, set `SHARE_PREVIEW_SECRET`, retire
  "Copy a link..." and update the `share-before-publish` guide in the same change.

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
- **"Edit on the page" needs one signed-in walk-through (Phase C, 2026-10-05).** The canvas now renders
  the real pages from drafts (rules: `.claude/rules/live-preview.md`); everything that runs without a
  Sanity login was verified locally with `?dev-draft=1` (all 13 pages render, text identical to the live
  page, zero broken stega runs). Still to see in the real Studio: the "Edit here" card saving on a few of
  the ~100 new lines, a photo click opening its field, the list controls on pricing add-ons and about
  values, live refresh after an edit, and the stitching canvas surviving a refresh.
- **`Hero.astro` and its scripts are now unused** (HeroBackground, HeroFillScript, HeroSlideshowScript,
  HeroTriScript): the old preview was their last user. Only `src/lib/page-fields.test.ts` reads Hero.astro
  (for the "no accent picker" absence). Delete them and move that assertion when convenient.
- **Get found: guide text to catch up with the site (site side done 2026-10-05, see Recently closed).**
  For the Studio guides owner (`src/sanity/guides/getFound.ts`, not edited by the site pass): mention the
  footer and thank-you review link in `reviews-and-word-of-mouth` and `google-business-profile` (it shows
  once `Your Google review link` is filled; its words are `Words on your review link`); tell her to paste
  her listing into `Your Google listing link` (`siteSettings.googleBusinessUrl`) in
  `google-business-profile`; `is-it-working` can now say each quote email shows "Where they found you"
  for QR scans, and that the four new answers are already in the list; the `facebook-page` maintenance
  note's platform list gained Nextdoor.
- **No email signup.** The site cannot collect a newsletter list; the guide says so. Only build one if
  Nathan decides it is worth it.
- **First real quote with a QR tag.** The utm path is proven by unit tests and a Playwright test up to the
  hidden fields; `/api/quote` (SSR) and the owner email are unit-tested, not sent. Check the first real QR
  quote email shows the "Where they found you" row.

## Notes (decided, not tasks)

- **Text in the logo is outlined**, so the brand name inside the drawing cannot come from Sanity (the
  accessible name does, `siteSettings.title`). Regenerate with
  `docs/logo-concepts/2026-10-04-atelier/generator/brand.mjs` (needs Python fontTools) if the name changes.
- **The brand kit's words are repo data, not Sanity** (`src/lib/brand/brandKit.ts`, the "My brand kit"
  pane). It is Studio-only help, like the handbook guides; only the tagline is read from Sanity (at
  `npm run brand-kit` time). After a tagline change, re-run `npm run brand-kit` and bump the ZIP to `-v2`.
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

- 2026-10-27: Auburn port run (starter cards 186 to 198), taken where they fit this shop. Phone action bar
  ("I reply within 1 business day" + Request a Quote, Site Settings > Top menu), metric-matched Fraunces
  fallback faces, the new sync-check, the page-weight budget spec, the regex-backslash guard, and the
  studio-messages/Messages tool copies. Not taken (photo hero, board, flow motion, builder blocks, form
  builder, business facts, client notes, video and documents): see the PR body for each reason.
- 2026-10-05: Get found, site support. A review link in the footer and on `/thank-you`, drawn only when
  `siteSettings.googleReviewUrl` is set (new `reviewLinkLabel`; live data has none, parity proved no HTML
  change); `googleBusinessUrl` unhidden ("Your Google listing link") and in the LocalBusiness `sameAs`
  (https only, unit-tested); QR source tags (`utm_*`) carried first-touch through the session into hidden
  quote fields, re-validated by `/api/quote`, stored in R2 and printed in the owner email as "Where they
  found you" (contract in `.claude/rules/site-routes.md`); TikTok, YouTube and new Nextdoor icons; the four
  new "how did you hear" answers seeded live (`scripts/seed-referral-options.mjs`, backup
  `tmp/backups/production-2026-10-05-referral.tar.gz`).

- 2026-10-05: Studio Phase F, "My brand kit": every logo in four colourways (SVG, PNG 2000/512), social
  pictures at platform sizes, table signs and a brand sheet (PNG and PDF), installable OFL fonts, colour
  lists, one versioned ZIP (`public/brand-kit/`, `npm run brand-kit`), and the Studio pane that offers them.
  The old static BrandKit panel is gone.

- 2026-10-05: Studio Phase D built: Trash instead of Delete, drag to reorder (105 `orderRank`s backfilled,
  backup `tmp/backups/production-2026-10-05-order-rank.tar.gz`), share link, Google preview, locked addresses
  (chosen over redirects). Click-check above.
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

- **Studio as a phone app and Earlier versions (starter cards 125, copied 2026-10-19).** The files are in, and the
  Studio can be installed from `/studio/` (icon `public/icon-maskable-512.png`, drawn from `favicon.svg` on white).
  Earlier versions is OFF (`features.earlierVersions: false` in `src/sanity/kit.config.ts`): it needs the nightly
  backups, `SANITY_API_WRITE_TOKEN` and `SANITY_PROJECT_ID` in the repo and a `GITHUB_DEPLOY_TOKEN` on the Worker,
  none of which exist here. Turn it on once they do. "Post a photo" (`kitConfig.postPhoto`) is not configured.
  Not checked on a real phone.
