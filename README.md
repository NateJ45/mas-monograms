# MAS Monograms

Custom embroidery studio site for **Mary Ann Stone** in St. Matthews, SC — migrated from
Squarespace 7.1 to a code-first stack. Built by **Nate's Creations**.

**Status: built and deployed.** Every visible string comes from Sanity, so Mary Ann can edit
headings, prose, pricing, form labels, galleries, and SEO without touching code.

| | |
|---|---|
| **Live site** | https://mas-monograms.nathanjnixon86.workers.dev/ *(custom domain `mas-monograms.com` pending)* |
| **Content editor** (Sanity Studio) | https://mas-monograms.sanity.studio/ |
| **Repo** | `NateJ45/mas-monograms` (private) |
| **Sanity project** | `xp3elugr` · dataset `production` |

> The `docs/` folder is the original migration spec + the verbatim source copy. For how the site
> actually runs and what's left before launch, see **[docs/08-deployment-and-status.md](docs/08-deployment-and-status.md)**.

---

## What it is

A one-woman, home-based embroidery studio. Pricing depends on item, thread, placement, and
complexity, so there is **no add-to-cart for custom work** — the site captures detailed **quote
requests** and Mary Ann sends a custom invoice off-site. The only "buy now" path is the **Clearance**
page, which uses Stripe Payment Links for pre-made stock (no cart code).

## Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | **Astro 6** | `output: 'static'`, `@astrojs/cloudflare` adapter, Sharp image service. Pulls from Sanity at build time; ships almost no JS. |
| CMS | **Sanity** (Studio 5 + client 7) | Project `xp3elugr`, dataset `production`. All content. |
| Hosting | **Cloudflare Workers** | Unified Pages/Workers platform. Git-connected auto-deploy via Workers Builds. |
| Quote form | **Cloudflare Worker** (`src/pages/api/quote.ts`) | Turnstile CAPTCHA → R2 backup → Resend emails → redirect to `/thank-you`. |
| Email | **Resend** | Owner notification + customer confirmation. |
| Clearance | **Stripe Payment Links** | One link per `clearanceItem`; the buy button is a plain `<a>`. |
| Styling | **Tailwind CSS 4** | Brand tokens in `src/styles/`. |

## Repo layout

```
mas-monograms-rebuild/
  src/
    pages/          all routes (13 page files + dynamic [slug].astro + api/quote.ts)
    components/     Header, Footer, MobileNav, CtaBanner, SanityImage, PortableText, FaqAccordion, …
    layouts/        BaseLayout.astro  (head, SEO/OG, JSON-LD, header/footer, view transitions)
    lib/            sanity.ts (client), queries.ts (all GROQ), schemas.ts (JSON-LD), sanity.types.ts
    styles/         globals.css, tokens.css  (brand tokens)
    data/           site.ts  (static identity values; NOT content)
  studio/           Sanity Studio 5 — schemaTypes/, structure.ts, sanity.config.ts
  scripts/
    seed-content.mjs   bulk content importer (see docs/08)
  public/           _redirects, _headers, favicon, robots, og images
  docs/             01–07 original spec + verbatim copy; 08 deployment & current status
  assets/           client source files (font samples, pricing scan)
  wrangler.jsonc    Cloudflare Worker config (R2 binding, assets)
```

## Routes

13 fixed pages + 8 dynamic category pages generated from Sanity `itemCategory` docs:

`/` · `/about` · `/how-it-works` · `/pricing` · `/request-a-quote` · `/thank-you` ·
`/shop-by-item` · `/style-gallery` · `/font-lettering-guide` · `/thread-color-chart` ·
`/clearance` · `/404` · and `/tote-bags`, `/towels-linens`, `/hats-caps`, `/shirts-tops`,
`/jackets-sweatshirts`, `/baby-kids`, `/home-gifts`, `/bring-your-own-item`.

Full route + schema table is in `CLAUDE.md`; the Squarespace→Astro mapping is in `docs/07`.

## Local development

```bash
# 1. Site
cp .env.example .env          # fill PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_READ_TOKEN
npm install
npm run dev                   # http://localhost:4321

# 2. Studio (separate terminal)
cd studio
cp .env.example .env          # fill SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET
npm install
npm run dev                   # http://localhost:3333

# After ANY schema change, regenerate types:
npm run typegen
```

The build is resilient when Sanity is unconfigured: pages render empty-state fallbacks rather than
crashing, so a fresh clone with no token still builds.

## Content

All content lives in Sanity and was bulk-seeded from the migration docs via
`node scripts/seed-content.mjs` (deterministic ids, re-runnable). Mary Ann edits everything at the
hosted Studio URL above. **Nothing visible on the site is hardcoded** — see the Sanity-first rule in
`CLAUDE.md`.

## Deployment

Push to `main` → **Cloudflare Workers Builds** runs `npm ci && npm run build` and auto-deploys.
Because the site reads Sanity **at build time**, the Sanity env vars must be set as **build
variables** in the Cloudflare dashboard (not runtime vars). The full env-var matrix, the
build-time-vs-runtime distinction, and the quote-form secrets are documented in
**[docs/08-deployment-and-status.md](docs/08-deployment-and-status.md)**.

Deploy the Studio with `cd studio && npx sanity deploy`.

## Editing: safe vs. code

**Safe to edit in Sanity (no code):** all page copy, headings, CTAs, SEO; categories, fonts, thread
colors, testimonials, gallery, popular combinations; pricing tiers and notes; site settings (email,
socials, footer); clearance items and their Stripe links.

**Code — change deliberately:**
- `studio/schemaTypes/**` — changing a field shape can orphan content. Run `npm run typegen` after.
- `src/pages/api/quote.ts` — the form Worker; a bug here silently drops customer leads.
- `src/styles/tokens.css` / `globals.css` — brand tokens cascade everywhere; edit the token, not usages.
- `public/_redirects` — preserves SEO from the old Squarespace URLs.

## Before public launch

Content is complete; these remain (details + checklist in `docs/08`):

1. **Images** — every image field is empty except 3 monogram fonts. Upload in the Studio (hero, Mary
   Ann's portrait, category cards, gallery, etc.).
2. **Placeholders** — real contact email, social URLs, testimonial names, and the thread-color
   inventory (seeded with a common starter set).
3. **Quote form** — set runtime secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`,
   `QUOTE_OWNER_EMAIL`), the `PUBLIC_TURNSTILE_SITE_KEY` build var, and create the
   `mas-monograms-quotes` R2 bucket before submissions send.
4. **Custom domain** — point `mas-monograms.com` at the Worker; verify Resend DNS (SPF + DKIM).
