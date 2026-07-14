# MAS Monograms

Marketing and quote-request site for **MAS Monograms**, a home-based custom embroidery studio run by Mary Ann Stone in St. Matthews, South Carolina. Migrated from Squarespace 7.1 onto a code-first stack.

**Live:** [mas-monograms.com](https://mas-monograms.com) · **Content editor:** mas-monograms.sanity.studio

---

## The brief

Custom embroidery does not fit a shopping cart. Price depends on the item, the thread, the placement, and how complex the design is, so a "buy now" button would be wrong for almost everything Mary Ann makes. The old Squarespace site fought that reality. What she actually needed was a way to collect a detailed, well-organized request and reply with a real quote.

## The work

**A quote request, not a checkout.** The heart of the site is a structured quote form that captures exactly what Mary Ann needs to price a job. It runs through a small Cloudflare Worker: a Turnstile check to keep the bots out, a backup of every submission written to R2 so nothing is ever lost, and email to both Mary Ann and the customer via Resend, then a clean thank-you page. No cart code, no fake "add to bag."

**One honest buy-now path.** The Clearance page sells pre-made stock through Stripe Payment Links, so ready-to-ship items get a real checkout without dragging a full cart system into the rest of the site.

**Every word is hers.** Headings, prose, pricing notes, form labels, galleries, and SEO all come from Sanity, so Mary Ann updates the site herself without touching code.

## The result

A fast, almost-no-JavaScript site (Astro pulls everything from Sanity at build time) that matches how the business actually runs: browse the work, send a detailed request, get a real quote back, and grab a clearance piece on the spot when there is one.

---

## Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | **Astro 6** | `output: 'static'`, `@astrojs/cloudflare` adapter, Sharp images. Ships almost no JS. |
| CMS | **Sanity** (Studio 5 + client 7) | Project `xp3elugr`, dataset `production`. All content. |
| Hosting | **Cloudflare Workers** | Git-connected auto-deploy via Workers Builds. |
| Quote form | **Cloudflare Worker** (`src/pages/api/quote.ts`) | Turnstile CAPTCHA, R2 backup, Resend email, redirect to `/thank-you`. |
| Email | **Resend** | Owner notification + customer confirmation. |
| Clearance | **Stripe Payment Links** | One link per item; the buy button is a plain `<a>`. |
| Styling | **Tailwind 4** | Brand tokens in `src/styles/`. |

## Running it locally

```sh
npm install
npm run dev
```

The `docs/` folder holds the original migration spec and the source content. For how the site runs, see [`docs/08-deployment-and-status.md`](docs/08-deployment-and-status.md).

---

Built by [Nixon Creative Studio](https://nixoncreativestudio.com).
