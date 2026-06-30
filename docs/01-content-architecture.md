# 01: Content Architecture

> **Status: original spec.** The site is built, content-seeded, and live. This doc is preserved as
> the original migration spec and verbatim source copy; for current as-built state see
> `docs/08-deployment-and-status.md` (deploy + status) and `docs/07` (component/route map).

Every page, what it is for, its sections, and the copy that is live today. Copy is reproduced close
to verbatim from the Squarespace site so you do not have to rewrite it, with one change: all
em-dashes have been converted to commas, colons, or periods to match the house style. Italics in the
headings (`*like this*`) mark the words the live site styles in the script/accent treatment.

---

## Navigation

The live top nav, in order:

`HOME` · `ABOUT` · `Seasonal` · **Shop by Item** (folder) · **Inspiration** (folder) · `HOW IT WORKS` · `PRICING` · `CLEARANCE` · `REQUEST A QUOTE` · cart icon

**Shop by Item** (folder) contains: Tote Bags & Pouches, Towels & Linens, Hats & Caps, Shirts & Tops, Jackets & Sweatshirts, Baby & Kids, Home & Gifts, Bring Your Own Item.

**Inspiration** (folder) contains: Style Gallery, Font & Lettering Guide, Thread Color Chart.

Notes for the rebuild:
- The folders are a UI grouping only. The actual page URLs are flat (e.g. `/tote-bags`, not
  `/shop-by-item/tote-bags`). Keep them flat to preserve SEO. The folder is just a dropdown.
- `REQUEST A QUOTE` is the single conversion destination. It should be visually distinct (the blush
  button treatment) and present in the nav on every page.
- The cart icon only matters because of Clearance. If Clearance launches with Stripe Payment Links
  instead of a real cart, you can drop the persistent cart icon and link "Clearance" straight to the
  clearance page.

---

## Route + redirect map

Astro routing: explicit page files win over the dynamic `[slug]` route, so the category pages can
live at the root as a dynamic route while the standalone pages stay as their own files. **Constraint
to remember:** never create a category whose slug collides with a standalone route name (e.g. do not
name a category "pricing").

| Path | Page | Source in Astro | Notes |
|---|---|---|---|
| `/` | Homepage | `pages/index.astro` | Singleton in Sanity |
| `/about` | About / Contact | `pages/about.astro` | Canonical. Redirect `/aboutcontact` → here |
| `/how-it-works` | How It Works | `pages/how-it-works.astro` | |
| `/pricing` | Pricing | `pages/pricing.astro` | |
| `/request-a-quote` | Request a Quote | `pages/request-a-quote.astro` | Posts to the Pages Function |
| `/thank-you` | Thank You | `pages/thank-you.astro` | Not in nav. Quote redirects here |
| `/shop-by-item` | Shop index | `pages/shop-by-item.astro` | Lists all 8 categories |
| `/shop` | Shop alias | redirect → `/shop-by-item` | Homepage "Browse by Item" links to `/shop` |
| `/tote-bags` | Category | `pages/[category].astro` | from Sanity `itemCategory` |
| `/towels-linens` | Category | `pages/[category].astro` | |
| `/hats-caps` | Category | `pages/[category].astro` | |
| `/shirts-tops` | Category | `pages/[category].astro` | |
| `/jackets-sweatshirts` | Category | `pages/[category].astro` | |
| `/baby-kids` | Category | `pages/[category].astro` | |
| `/home-gifts` | Category | `pages/[category].astro` | |
| `/bring-your-own-item` | Category (special) | `pages/[category].astro` | "free assessment" instead of "from $" |
| `/style-gallery` | Style Gallery | `pages/style-gallery.astro` | |
| `/font-lettering-guide` | Font & Lettering Guide | `pages/font-lettering-guide.astro` | from Sanity `font` docs |
| `/thread-color-chart` | Thread Color Chart | `pages/thread-color-chart.astro` | from Sanity `threadColor` docs |
| `/seasonal` | Seasonal | `pages/seasonal.astro` | Time-limited category-style page |
| `/clearance` | Clearance | `pages/clearance.astro` | Stripe Payment Links per item |
| `/404` | Not found | `pages/404.astro` | |

Put these in a Cloudflare Pages `_redirects` file:

```
/aboutcontact   /about   301
/shop           /shop-by-item   301
/cart           /clearance   301
```

---

## Homepage  (`/`)

The funnel in one page: orient, build trust, route to the quote. Sections top to bottom:

**1. Hero**
- Eyebrow: `Handmade in St. Matthews, SC`
- Heading: `Custom monogramming, *made just for you.*`
- Subhead: `From classic 3-letter monograms to full appliqué designs, we stitch everything by hand, locally. Towels, totes, hats, sweatshirts, baby gifts, and more.`
- Buttons: `Request a Free Quote` (→ `/request-a-quote`) · `Browse by Item` (→ `/shop`)
- Trust strip: `No payment to request a quote` · `Reply within 1 business day` · `Local, home-based studio`

**2. Process strip** (the 4-step pattern, reused on key pages)
- Label: `How it works`
- 1 `Browse`: `Pick your item & get inspired`
- 2 `Request`: `Submit a free quote form`
- 3 `Quote`: `Get your custom price in 1 day`
- 4 `Stitch`: `Approve & we get to work`

**3. Category grid**
- Label: `Choose a category to get started`
- Ten cards (the 8 categories + Seasonal + Clearance), each with emoji, name, one-line description,
  and a price hint. Use these as the starting hero copy for each category page too:

| Card | Description | Hint |
|---|---|---|
| 👜 Tote Bags & Pouches | The gift people actually use. Canvas, jute, nylon, monogrammed with your initials or name. | from $16 |
| 🛁 Towels & Linens | Bath towels, hand towels, tea towels, napkins. The easiest upgrade to your guest bath or kitchen. | from $16 |
| 🧢 Hats & Caps | Baseball caps, beanies, sun hats, monogrammed or custom text, centered or side-stitched. | from $16 |
| 👕 Shirts & Tops | Polos, t-shirts, button-downs. Chest, cuff, or pocket placement, perfect for teams or gifts. | from $16 |
| 🧥 Jackets & Sweatshirts | Bordered sash, appliqué, or bold collegiate lettering. | from $18 |
| 🍼 Baby & Kids | Soft thread, sweet fonts, and something they'll keep forever. Onesies, blankets, burp cloths. | from $16 |
| 🏠 Home & Gifts | Ornaments, pillows, blankets, door hangers, wreath sashes. If it's fabric, we can monogram it. | from $16 |
| 📦 Bring Your Own Item | Have something you love? Bring it in. We'll assess it free, most fabric items work beautifully. | free assessment |
| 🎄 Seasonal | Holiday favorites, stockings, Easter baskets, ornaments, and more. Limited-time designs, custom stitched. | from $16 |
| 🏷️ Clearance Buy Now | Pre-made items ready to ship. No quote needed, add to cart and check out. While supplies last. | priced as marked |

**4. Style Gallery teaser**
- Label: `Style Gallery`
- Heading: `Not sure where to *start?*`
- Body: `Browse real work from our studio, and tell us your vibe. We'll pick the perfect font and thread for you.`
- Button: `Browse the Full Gallery` (→ `/style-gallery`)
- Secondary links: `Font & Lettering Guide` · `Thread Color Chart`

**5. Most popular combinations** (reduces font/thread overwhelm)
- Label: `Customer Favorites`
- Heading: `Most popular combinations`
- Body: `Our most-loved font + thread pairings, a great starting point if you're not sure what to choose.`
- Three cards:
  - `Classic`: `Navy on White`, `Block font · 3-letter monogram · Perfect for towels & linens`, `from $16`
  - `Gift-Ready`: `Blush Script`, `Fishtail font · First name · Ideal for totes & baby items`, `from $16`
  - `Bold`: `Forest on Cream`, `Premium bordered sash · 3-letter · Great for sweatshirts`, `from $18`
- Link: `See all combinations & font styles` (→ `/font-lettering-guide`)

**6. Reviews**
- Label: `Reviews`
- Heading: `What customers are saying`
- Three five-star testimonials. Live copy (placeholder names, swap for real ones):
  - `"The monogram on my daughter's towel set came out absolutely perfect. Everyone at the baby shower asked where I got it."`: `[Customer Name]`
  - `"I brought in my own sweatshirt and she stitched exactly what I had in my head. The quote process was so easy, I had a price within hours."`: `[Customer Name]`
  - `"Ordered Christmas gifts for the whole family. She communicated every step of the way. Will absolutely be back."`: `[Customer Name]`

**7. Meet the maker**
- Label: `Meet the maker`
- Heading: `Hi, I'm *Mary Ann.*`
- Body: `I'm a home-based embroidery artist in St. Matthews, SC. What started as a creative hobby three years ago has grown into something I truly love sharing. Every order comes directly to me, no team, no warehouse. When you reach out, you're talking to the person who will actually stitch your item.`
- Link: `More about MAS Monograms` (→ `/about`)
- Photo: Mary Ann Stone portrait

**8. Final CTA banner**
- Heading: `Ready to make something *personal?*`
- Body: `Requesting a quote is free and takes about 2 minutes. We'll reply within 1 business day with your custom price.`
- Button: `Request a Free Quote`
- Trust strip: `No payment required` · `1 business day response` · `No surprises on price`

---

## How It Works  (`/how-it-works`)

**1. Hero**
- Eyebrow: `No cart. No checkout. No guessing.`
- Heading: `Here's *exactly* how ordering works.`
- Body: `Custom monogramming means every order is unique, so we use a simple quote process instead of a standard checkout. It takes about 2 minutes to request, and we handle everything from there.`

**2. The four steps** (label `The process`, heading `Four simple steps`)

- **Step one: Browse & get inspired:** `Start by exploring our item categories. Each page shows real photos of finished work, popular font and thread combinations, and pricing ranges so you know what to expect before you ever fill out a form.`
  - Browse totes, towels, hats, apparel, baby items, home gifts, and more
  - See curated font + thread pairings, no design experience needed
  - Have your own item? That works too, bring it in or ship it to us
- **Step two: Fill out the quote form:** `Our quote form walks you through everything we need to give you an accurate price: item type, letters, font style, thread color, placement, quantity, and your timeline. It takes about 2 minutes. No payment required at this stage.`
  - Tell us your letters, name, or text, up to you
  - Not sure on font or thread? Just say "recommend for me," we love that
  - Have a photo or reference? Upload it right in the form
- **Step three: Receive your custom quote:** `We'll review your request and send a custom invoice to your email within 1 business day. The price is based on your specific item, stitch count, and any complexity. No surprises, what you see is what you pay.`
  - Response within 1 business day, usually same day
  - Your invoice will show a clear itemized price before any payment
  - Have questions? Just reply, we're happy to adjust anything
- **Step four: Approve & we get to stitching:** `Once you approve the quote and complete payment, we get to work. We'll keep you updated along the way and reach out if we have any questions before we stitch. When it's done, we'll arrange pickup or shipping, whatever works best for you.`
  - Turnaround time shared upfront, rush options available
  - We'll contact you before stitching if anything needs clarifying
  - Local pickup in St. Matthews, SC, or we can arrange shipping

**3. Stats strip:** `$0 required to request a quote` · `1 day typical response time` · `3 yrs of embroidery experience` · `★ 5.0 from dozens of happy customers`

**4. FAQ** (label `Common questions`, heading `Good questions. Here are the answers.`)

1. **Do I have to pay anything to request a quote?** No, submitting a quote request is completely free. You'll only pay after you review and approve your custom invoice.
2. **What if I'm not sure what font or thread color to choose?** Just say "recommend for me" on any choice in the form, that's genuinely one of our favorite things to do. Tell us your vibe (classic, bold, soft, festive) and we'll suggest the perfect combination.
3. **Can I bring my own item to be monogrammed?** Yes. "Bring Your Own Item" is a first-class option. Most fabric items work well. Select that option on the quote form and describe what you have, we'll let you know if it's a good candidate before you commit to anything.
4. **How long does it take from quote to finished item?** We respond to quote requests within 1 business day (usually the same day). Once approved and paid, most orders are completed within 3 to 7 business days. Rush turnaround is available, just flag it in your request and we'll let you know if it's possible.
5. **What if I want to make changes after I submit the form?** No problem. Just reply to the quote email before approving, we can adjust the design, font, thread, or anything else. Changes after stitching has begun may not be possible, but we'll always check in with you first if anything looks unclear.
6. **Do you ship, or is this pickup only?** We're based in St. Matthews, South Carolina, and local pickup is always welcome. Shipping is available, just mention it in your quote request and we'll include the shipping cost in your invoice.

**5. CTA banner:** `Ready to get *started?*` / `It's free to request a quote and takes about 2 minutes. We'll take it from there.` / buttons `Request a Free Quote` · `Browse Items First`

---

## Pricing  (`/pricing`)

The numbers are authoritative in `docs/03-pricing.md` (transcribed from Mary Ann's scan). The page
itself presents them as ranges with a "no surprises" trust statement. Section pattern: hero → the
four pricing tiers as cards → what affects price (stitch count, letter count, complexity, color
changes) → a "no surprises / price before payment" reassurance block → CTA banner. Pull the exact
tier copy and the one-time fees from `docs/03`.

---

## Item category pages  (8 of them, one template)

Driven by the `itemCategory` type in Sanity. Same five-section template for all:

1. **Hero** with a price anchor (`from $16`, or `free assessment` for Bring Your Own Item) and two
   CTAs (`Request a Quote` + `Browse the Gallery`). Photo on one side, copy on the other.
2. **Gallery grid** of finished work, each image captioned with a price indicator.
3. **What to Expect** two-column (left: how it works for this item type; right: good-to-know notes).
4. **Pricing range callout** specific to the category (low to high + a short note).
5. **CTA banner** to the quote form.

Starting hero copy for each category is the homepage card table above. Bring Your Own Item is the
one exception to the template: it leads with "free assessment," reassures that most fabric items
work, and routes to the quote form with the "bring your own" item-type preselected if possible.

---

## Shop index  (`/shop-by-item`)

A simple landing page listing all 8 categories as cards (same cards as the homepage grid, minus
Seasonal/Clearance), with a short intro and the process strip. Exists so the "Browse by Item" /
"Shop" nav has a real destination.

---

## Style Gallery  (`/style-gallery`)

Label `Style Gallery`, heading `Not sure where to *start?*` (matches the homepage teaser voice). A
filterable grid of finished-work photos, ideally tagged by item type / font / thread so visitors can
filter. Each item is a `galleryItem` in Sanity. The point of the page is inspiration that funnels
into the quote form ("tell us your vibe and we'll pick the combination"). End with a CTA banner.

---

## Font & Lettering Guide  (`/font-lettering-guide`)

The full font catalog, driven by the `font` type in Sanity. Because these are embroidery fonts, not
web fonts, every font is shown as an **uploaded image preview**, not CSS-rendered text. Group them
into named line fonts, monogram styles, and decorative/appliqué fonts. Full breakdown, available
sizes, and asset mapping in `docs/04-fonts-and-lettering.md`. This page and the quote form's font
dropdown read from the same `font` documents, so the list stays in sync.

---

## Thread Color Chart  (`/thread-color-chart`)

A swatch grid driven by the `threadColor` type. Each swatch shows the color (an approximate hex for
display, or an uploaded swatch image for accuracy) and its name, grouped by color family. Include the
standing caveat that on-screen colors are approximate and Mary Ann will confirm the exact thread.
End with a CTA to the quote form.

---

## Request a Quote  (`/request-a-quote`)

The conversion page and the single most important build. Full field list, validation, and the
Cloudflare + Resend backend are in `docs/05-quote-form-and-backend.md`. Page copy keeps the
reassurance front and center: free, about 2 minutes, reply within 1 business day, no payment now.

---

## About / Contact  (`/about`)

**1. Hero:** eyebrow `St. Matthews, SC · Home-based · Handcrafted`; heading `The person behind every *stitch.*`; body `MAS Monograms is a one-woman home embroidery studio. Every order gets personal attention, because that's the whole point.`

**2. Meet the maker** (label `Meet the maker`, heading `Hi, I'm *Mary Ann.*`, kicker `And I genuinely love what I do.`)
- `MAS Monograms started the way most good things do, as a creative outlet that quietly turned into something bigger. I've been doing embroidery for the last three years, and what started as a challenge has become one of my favorite things. There's something deeply satisfying about taking a blank item and turning it into something personal and lasting.`
- `I run this business out of my home in St. Matthews, SC. That means every order comes directly to me, there's no team, no warehouse, and no assembly line. When you reach out, you're talking to the person who will actually stitch your item.`
- Pull quote: `"No task is too great, and I really mean that. If you have an idea you're not sure about, just ask. That's my favorite kind of conversation."`
- `I work with blankets, towels, clothing, totes, hats, baby items, home goods, even socks and shoe laces. Beyond embroidery, I also do card making and basic sewing, and I'm always exploring new crafts.`
- Skill tags: Custom embroidery · Monogramming · Appliqué · Card making · Basic sewing · Gift design
- Stats: **Location** St. Matthews, SC (FIX: live site wrongly says Mason, Ohio here) · **Years in embroidery** 3+ years · **Business type** Home-based studio · **Response time** Within 1 business day · **Pickup available** Yes · St. Matthews, SC

**3. Why customers come back** (heading `What makes MAS Monograms different`, intro `There are a lot of ways to get something monogrammed. Here's why people choose to come back.`)
- 👤 **One person, every order**: You deal directly with Mary Ann, no customer service queues, no middlemen. Your message goes straight to the person stitching your item.
- 💬 **Personal guidance included**: Not sure what font or thread to pick? Just say so. Helping customers figure out what they actually want is one of the best parts of the job.
- 📍 **Local & accessible**: Based in St. Matthews, SC. Local pickup is always available, and the pricing reflects a home studio, not a commercial retailer.
- 🎁 **Gift-ready thinking**: A lot of orders are gifts. Tight timelines, specific occasions, handwritten note requests, we're used to making it work.
- 📋 **Price before payment, always**: Every order starts with a free custom quote. You approve the price before anything is stitched or charged. No surprises.
- 📦 **Bring what you have**: You don't have to buy from us. If you have an item you love and want monogrammed, bring it in. Most fabric items work just fine.

**4. Get in touch** (heading `Get in *touch.*`, intro `Two ways to reach us, make sure you pick the right one so we can help you faster.`)
- **For orders → Request a Quote:** `This is the right form if you want something monogrammed. It takes about 2 minutes and gives us everything we need to send you an accurate price.` Covers: ordering a monogrammed item; bringing your own item; asking about a custom design; group or bulk orders. Button → `/request-a-quote`.
- **For everything else → Send a Message:** `General questions, collaborations, or anything that doesn't fit the quote form. We'll reply within 1 business day.` Covers: general questions about the process; questions about materials or care; press or collaboration inquiries; anything else.

**5. General contact form** (heading `Send a message`, `We'll reply to the email address you provide within 1 business day.`) with a callout nudging order requests to the quote form, and `We never share your information.` **This is a second form** and needs its own (lightweight) handling: see `docs/05`.

**6. Info blocks:** Location (St. Matthews, SC, local pickup by arrangement; shipping nationwide, cost included in quote) · Response times (quote requests within 1 business day; general messages within 1 business day; order turnaround 3 to 7 business days after approval) · Follow along (Facebook, Instagram, real URLs pending).

---

## Thank You  (`/thank-you`, not in nav)

Where the quote form redirects on success. Should confirm receipt, reset expectations (reply within
1 business day), and offer somewhere to go next (browse the gallery, read How It Works). Keep it warm
and specific so the visitor knows the submission actually worked.

---

## Seasonal  (`/seasonal`)

A time-limited, category-style page for holiday items (stockings, Easter baskets, ornaments). Model
it as an `itemCategory` with a `seasonal` flag and an optional active window, so Mary Ann can turn it
on and off without code. Same five-section template, same quote funnel.

---

## Clearance  (`/clearance`)

The only "buy now" page. Pre-made stock, fixed prices, no quote. Each item is a `clearanceItem` in
Sanity with a name, photo, price, and a **Stripe Payment Link**. The "Add to cart / check out" copy
from Squarespace becomes a "Buy now" button that opens the Stripe-hosted checkout. No cart state to
manage. See `docs/03` for the commerce note.

---

## 404  (`/404`)

On-brand not-found page: a short apologetic line in the house voice, and links back to the homepage,
the shop, and the quote form.

---

## Footer (every page)

- Brand block: `MAS *Monograms*` + `Hand-stitched monograms and embroidery, made locally in St. Matthews, SC. Every order comes directly from Mary Ann.`
- 📍 `St. Matthews, SC` · 🕐 `Mon to Fri · Replies within 1 business day`
- Social: Facebook · Instagram · Pinterest (real URLs pending)
- Column **Shop by Item**: the 8 categories
- Column **Inspiration**: Style Gallery, Font & Lettering Guide, Thread Color Chart
- Column **Info**: How It Works, Pricing, About & Contact
- Column **Get Started**: Request a Quote, How the process works, Pricing guide, Browse font styles, Browse thread colors, See finished work
- Closing CTA: `Ready to make something *personal?*` → `Request a Free Quote`
- Legal: `© MAS Monograms · St. Matthews, SC · All rights reserved · Site design by Nate's Creations`
- Note: the Squarespace footer had a known unresolved mobile gap below it. That was a Squarespace
  Code Block quirk and does not carry over. Build the footer as a normal component and it is a
  non-issue.

---

## Voice and microcopy

Warm, direct, confident. The job of the copy is to lower anxiety about an unfamiliar quote process.
Anchor phrases that should stay consistent across the site:
- "No payment required to request a quote" / "It's free and takes about 2 minutes"
- "We respond within 1 business day" (often "usually same day")
- "Tell us your vibe and we'll pick the perfect combination"
- "Recommend for me" as the friendly fallback on every choice
- "No surprises on price" / "Price before payment, always"
- "Bring what you have" for the bring-your-own option

House style for any new copy: no em-dashes (use commas, colons, or restructure), no corporate filler,
prose over bullet lists unless the content is genuinely a list. Match the existing reassuring tone.
