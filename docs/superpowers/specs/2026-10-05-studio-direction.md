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

## Phase B addition: "Get found" (Nathan, 2026-10-05)

Mary Ann was disappointed that the website got no interest earlier this year. The honest reason is that
nobody knew it existed (the site only went live on the new platform on 2026-09-04 and nothing was done
to be found). She does not know how to do any of the following, so the handbook must TEACH it, step by
step, in the same plain, large, calm style, as a whole category called **Get found (so customers can find me)**
sitting right beside the editing guides, with a "start here" order and a weekly 15-minute routine.

Cover, each as its own guide with numbered steps, what she needs ready before she starts, how long it takes,
what it costs (free or not, honestly), what can go wrong, and how she knows it worked:
- **Google Business Profile** (the free listing that shows on Google Search and Google Maps): claiming or
  creating it for a home-based business (service-area business with the address hidden if she prefers),
  categories, hours, photos, the website link, verification (video or phone, whichever Google currently
  offers), posting updates, asking for and answering reviews, and a link she can send customers for a review.
- **Apple Business Connect** (shows on Apple Maps, Siri, Wallet) and **Bing Places** (Bing and Microsoft;
  it can import from Google): the same one-page walkthrough for each.
- **Facebook Page** and **Instagram business account**: creating them, linking them, the profile picture
  and cover (the new Hoop Seal logo files are in `public/brand/`), what to post in the first month (a weekly
  rhythm using her real work photos; examples of captions in her voice), hashtags, linking to the website,
  and how to reuse one photo across both.
- **Pinterest business account**: boards that work for monograms and gifts, pins that link to the website.
- Other free places worth the effort for a local craft business: Nextdoor business page, local Facebook
  community and "buy local" groups, the St. Matthews / Calhoun County / Columbia, SC chambers and craft
  fairs, Etsy only as an option with its trade-offs (do not push it), and local business directories (Yelp,
  Yellow Pages style listings) with the warning to keep name, address, phone identical everywhere.
- **Google Search Console and the sitemap** at beginner level: "tell Google the site exists" (check what is
  already wired: the studio-status/vault notes mention Search Console and GA4 are set up; verify in the repo
  `public-data-policy.json`, `docs/` and the analytics code before telling her anything).
- **Simple online ads**, honestly: what they are, what to expect from a small budget, the safest first step
  (boosting one good photo post on Facebook/Instagram for a few dollars a day, aimed at a small radius and
  a specific audience; or a Google Business Profile local ad is NOT a thing she needs yet), when to
  stop, how to read the results, and a clear "do not spend more than $X you are not comfortable losing"
  rule. Never promise results. Compare free vs paid plainly and recommend free first for 60 days.
- **QR codes**: what they are, where to put them (tags and labels on products she sells or gives out,
  business cards, packaging inserts, thank-you cards, a flyer on a craft-fair table, the back of invoices,
  a sticker on shipping boxes, her car or booth sign), how big to print them and what to leave around
  them, and how to test them with a phone. She cannot make QR codes herself today: build the tool (below).
- **Everyday word of mouth**: asking happy customers for a review and a photo, a referral card, an email or
  text list (a simple "newsletter" option only if the site can support it today: otherwise say so), a
  one-page "how to describe my business in one sentence" and a standard intro message she can paste.
- **Photos that sell**: how to photograph her work with a phone near a window (the site's weak spot is photo
  quality: this is a real lever), a shot list (close-up of the stitching, whole item, in use, before/after),
  and how to add them to the site (cross-link to the editing guides).
- **Keeping it going**: a weekly 15-minute checklist and a monthly 30-minute one, and "how do I know if
  it is working?" (what to look at in Google Business Profile insights, Facebook/Instagram insights and
  the site's analytics at a beginner level, with realistic expectations).

Accuracy rules for this content (it is advice to a real person about real accounts):
1. The writing agent MUST verify current steps and screens by researching the official help pages (web
   search/fetch of Google Business Profile help, Apple Business Connect, Bing Places help, Meta Business
   Help Center, Pinterest business help, Search Console help) and name the source and the date checked
   in the guide's maintenance notes (not shown to Mary Ann). These UIs change: write steps in terms of
   what she is trying to do and what she should see, and keep a "this screen may look a little different"
   reassurance. Prices and policies are quoted only if verified and dated.
2. No invented numbers, results or guarantees. Where advice depends on her choice (budget, how much time
   she has), give a recommended default and say why.
3. No em-dashes. Large readable type, numbered steps, "what you will see", a time estimate, a cost line,
   and a "stuck? Nathan can help with this part" badge on anything that needs a business document, a
   phone verification or a credit card, using the three-state badge idea from Stone Steps
   ('You can do this yourself' / 'Mostly yourself' / 'Check with Nathan first').
4. Where the site itself helps (the LocalBusiness data, the sitemap, UTM-tagged links, the Hoop Seal logo
   files, the OG share image, the Instagram/Facebook links in Site settings, the Request a Quote link to use
   in every profile), point at it precisely and make sure the site really supports it (check
   `siteSettings` social fields, `src/components/Footer.astro`, `BaseLayout.astro` JSON-LD). If a needed
   site feature is missing (e.g. social links not shown), record it as a build task.

## Phase E (new): "Print and share" tool (QR codes)

A Studio tool (and a Welcome card: "Make a QR code for my website") that lets her make QR codes without
knowing what one is: pick where it should lead (Home, Request a quote, Style gallery, Thread colors,
Clearance, her Google review link, her Facebook/Instagram page when set in Site settings), pick where she
will put it (a hang tag, a business card, a flyer, a package insert, a sign), and get a clean print-ready
image (SVG and PNG, with the brand seal at the centre only if error correction allows, a quiet-zone border,
and a plain label such as "Scan to see my work") sized for that use, plus a one-line instruction on how big to
print it. Each QR carries a tag in the link (utm_source=qr&utm_medium=<placement>&utm_campaign=<date or name>)
so the site's analytics can show which placement worked. Generate client-side in the Studio (no network, no
third-party QR service; add a small, vetted dependency or write the encoder; check the bundle impact and the
Studio CSP), include a "test it with your phone" step, and keep copy in plain words.
