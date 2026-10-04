# 05: Quote Form & Backend

> **Status: built, secrets pending.** Implemented as `request-a-quote.astro` + `src/pages/api/quote.ts`
> (a Worker endpoint, not a `functions/` Pages Function). The form renders; sending needs the runtime
> secrets + R2 bucket listed in `docs/08-deployment-and-status.md`.

This is the conversion engine. On Squarespace it was a native Form Block that emailed Mary Ann. That
black box is gone, so the form is now real code: an HTML form in Astro that posts to a Cloudflare
Worker endpoint (`src/pages/api/quote.ts`), which validates the data, emails Mary Ann (and the
customer), then redirects to the thank-you page. Get this right before anything else, because a silent
failure here means lost leads. (The form's field labels, help text, section headings, and referral
options are all editable on the `requestAQuotePage` singleton in Sanity — see `docs/06`.)

---

## The quote form (`/request-a-quote`)

Six field groups. In Squarespace the group headers used the "Line" field type; here they are just
`<fieldset>` legends or section headings. Every choice that can be uncertain offers a "Recommend for
me" option, and the page copy invites it.

**Group 1: Contact**

- Full name (required, text)
- Email (required, email)
- Phone (optional, tel)

**Group 2: The item**

- Item type (required, select): the 8 categories (Tote Bags & Pouches, Towels & Linens, Hats & Caps,
  Shirts & Tops, Jackets & Sweatshirts, Baby & Kids, Home & Gifts) plus "Bring my own item" and
  "Something else"
- Ownership (required, radio): "I'd like you to provide the item" / "I'm bringing my own item"

**Group 3: Lettering**

- Letters, name, or text (text) with a hint that they can leave it to Mary Ann
- Monogram style (select): Master Circle, Vine / Heirloom, Pillow, Recommend for me
- Font (select): the named + appliqué fonts from `docs/04`, plus Recommend for me

**Group 4: Stitch details**

- Thread color (select, generated from `threadColor` docs, plus Recommend for me)
- Placement (select or text): e.g. centered, left chest, cuff, pocket, corner, plus "Recommend"
- Size (select): the size options from `docs/04`, plus Recommend for me

**Group 5: Logistics**

- Quantity (number, default 1)
- This is a gift (checkbox)
- Deadline / need-by date (date, optional)
- Rush (checkbox): "I need this by a specific date"

**Group 6: Extras**

- Notes (textarea): anything else, special requests, occasion, etc.
- Reference image (file upload, optional): a photo or inspiration image

**On success:** redirect to `/thank-you`.

The font, monogram-style, thread-color, and size dropdowns are all generated at build time from
Sanity, so they stay in sync with the guide pages. Item types can also come from the `itemCategory`
documents.

---

## The second form (general contact, on `/about`)

The About page has a lighter "Send a message" form for non-order questions: name, email, message,
plus a callout that pushes actual orders to the quote form. It needs handling too, but it is simpler
(no file upload, no structured fields). Reuse the same backend with a `formType` field
(`quote` vs `contact`) so one Pages Function handles both and the email subject line reflects which
one came in.

---

## Validation

Validate on the client for friendliness and on the server for safety. Never trust the client alone.

- Required: name, email, item type, ownership.
- Email format check.
- Quantity is a positive integer.
- Cap notes length and total payload size.
- File upload: restrict to images (jpg, png, heic, webp, pdf), cap the size (e.g. 10 MB), reject
  anything else server-side.
- Strip/escape user content before putting it in the email body so a malicious submission cannot
  inject anything. The email is plain data, not commands.

---

## Backend architecture

```
Browser (QuoteForm.astro)
   │  POST multipart/form-data
   ▼
Cloudflare Pages Function  /functions/api/quote.js   (or .ts)
   │  1. parse + validate
   │  2. (optional) store the file in R2, get a link
   │  3. (optional) save the submission (R2 / KV / D1) as a backup
   │  4. send owner email  ── Email Service ──▶  Mary Ann's inbox
   │  5. send confirmation ── Email Service ──▶  customer's inbox
   ▼
   303 redirect ─▶ /thank-you
```

**Why a Pages Function, not just a static form.** A static site cannot receive a POST. Pages
Functions are Workers that run on the same Cloudflare deploy, so the form posts to a same-origin path
like `/api/quote` with no separate service to host. (Note: Pages Functions configure bindings through
the Cloudflare dashboard, not a `wrangler.toml`. The email binding is declared in `wrangler.jsonc`.)

**Email provider: Cloudflare Email Service (since 2026-10-04).** The Worker sends both emails through
the `send_email` binding named `EMAIL` (declared in `wrangler.jsonc`), so there is no API key and no
third-party account. Email Sending can mail any recipient, so it covers both the owner notification
and the customer confirmation. (Resend was used before; it was never configured in production, which
meant requests were saved to R2 but nobody was emailed.) Setup, one time, in the Cloudflare dashboard:

1. Compute > Email Service > Email Sending > onboard `mas-monograms.com`. Cloudflare adds the SPF and
   DKIM records itself because the zone is on Cloudflare DNS. Wait for the domain to show verified.
2. `QUOTE_OWNER_EMAIL` is a plain var in `wrangler.jsonc` (Mary Ann's published address). Change it
   there if her address changes.
3. Messages go from `noreply@mas-monograms.com` ("MAS Monograms") with `replyTo` set to the customer
   on the owner email, plus an auto plain-text twin of each HTML body.
4. Failure behaviour: the submission is saved to R2 first. If the owner email cannot be sent (binding
   missing, domain not onboarded, rate limit) the Worker answers 502 and the form shows its error
   state, instead of the old silent "Thank you". A failed customer confirmation is logged only.

**File upload.** Two options:

- _Recommended:_ store the uploaded image in a Cloudflare **R2** bucket and include a link to it in
  the owner email. Keeps emails small and avoids attachment limits.
- _Simpler:_ attach the file to the owner email directly. Fine for small images; watch provider
  attachment size limits. Start here if R2 feels like overkill, move to R2 if files get large.

**Spam protection.** A quote form with a file upload is a spam magnet. Two layers:

- A honeypot field (a hidden input real users never fill; if it's filled, drop the submission).
- **Cloudflare Turnstile**, the free CAPTCHA alternative native to Cloudflare. Add the widget to the
  form and verify the token in the Function before sending any email.

**Backup the lead.** Email can fail. Consider also writing each submission to R2 (as JSON) or a small
D1/KV store, so a delivery hiccup never loses a customer. Low effort, high insurance.

---

## Progressive enhancement

Build the form so it works as a plain HTML POST with no JavaScript: it should fully submit and
redirect on its own. Then layer JS on top for nicer behavior (inline validation messages, a "sending"
state on the button, an async submit that avoids a full page reload). The baseline still has to work
if the JS never loads. This keeps the most important page on the site resilient.

---

## Build checklist for this piece

- [ ] `QuoteForm.astro` renders all six groups, dropdowns sourced from Sanity
- [ ] Honeypot + Turnstile in place
- [ ] `/functions/api/quote.{js,ts}` parses, validates, and escapes input
- [ ] Email Sending onboarded for mas-monograms.com (SPF + DKIM added by Cloudflare)
- [ ] Owner email + customer confirmation both send and land in the inbox (check spam on first test)
- [ ] File upload stored (R2) or attached, with type + size limits enforced server-side
- [ ] Submission backed up (R2/D1/KV) as insurance
- [ ] Success path redirects to `/thank-you`
- [ ] Same Function handles the About contact form via a `formType` field
- [ ] Tested end to end on a Cloudflare preview deploy before launch
