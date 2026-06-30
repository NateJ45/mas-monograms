# 02: Design System

The visual system carried over from the Squarespace build. This doc is the human-readable version;
`src/styles/tokens.css` is the machine version. Change a value in the token file, not in the 40
places it gets used.

The feel: an online store that happens to route to a quote instead of a cart. Calm, handmade, warm.
Cream paper, ink text, sage as the primary accent, blush for calls to action.

---

## Color palette

| Token | Hex | Use |
|---|---|---|
| Ink | `#2c2c28` | Primary text, headings, the logo wordmark |
| Cream | `#faf8f4` | Default page background, form input fields |
| White | `#ffffff` | Cards, raised surfaces |
| Muted | `#7a7a72` | Secondary text, captions, eyebrows |
| Sage Dark | `#4a5e4c` | Primary accent, links, the logo brushstroke |
| Sage Mid | `#8a9e8c` | Secondary sage, borders, hovers |
| Sage Light | `#e8ede8` | Sage backgrounds, section bands, chips |
| Sage on Dark | `#b8d4b8` | Sage text/accents on dark backgrounds |
| Blush | `#c9a48a` | The CTA / "Request a Quote" button color, the logo flourish |
| Blush Hover | `#b8926e` | Blush button hover state |
| Blush Light | `#f5ede6` | Blush-tinted backgrounds, soft highlights |

The CTA color is deliberately the warm blush, not the sage, so "Request a Quote" stands apart from
ordinary links and navigation. Keep that separation.

---

## Typography

Three families, all available from Google Fonts.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Headings | **Playfair Display** | 400 | Serif display. The italic 400 is used for the accent words (the `*made just for you*` styling). |
| Body / UI | **DM Sans** | 300, 400, 500 | Everything that is not a heading: paragraphs, buttons, labels, nav. |
| Logo only | **Great Vibes** | 400 | Script. Used exclusively in the SVG logo wordmark, not in page text. |

Load Playfair Display and DM Sans site-wide. Great Vibes only needs to exist if the logo is rendered
as live text anywhere; since the logo is an SVG, you can skip loading it as a web font.

Type scale guidance: large, confident hero headings in Playfair, generous line-height on body copy
(around 1.6) for readability, and slightly looser letter-spacing on the small uppercase eyebrows and
labels.

---

## Logo

Current asset: `mas-monograms-logo-v3.svg`. Great Vibes script wordmark in ink (`#2c2c28`), a sage
(`#4a5e4c`) brushstroke cross behind it, and a blush (`#c9a48a`) flourish underline. No tagline.
Transparent background.

In Squarespace this was uploaded under Design → Logo & Title. In Astro it just lives in the repo
(e.g. `public/logo.svg`) and goes in the nav and footer. **Fix on migration:** the Open Graph / social
share image still references the old raster wordmark (`MasMonogramsText.png`). Replace it with a
proper OG image (the v3 logo on a cream background at 1200×630, or a finished-work photo).

Prior logo for reference only (do not use): `MasMonogramsText.webp`, gold script with a brown cross
and the old "Stitches of Hope & Joy" tagline. Superseded.

---

## Component styling notes

**Buttons.** Two variants.
- *Primary / CTA:* blush background (`#c9a48a`), white text, hover to `#b8926e`. This is the "Request
  a Quote" button. Use it sparingly so it stays meaningful.
- *Secondary:* sage outline or sage text on transparent/cream, for "Browse the Gallery" style
  actions.
- Both: ~6px border radius, DM Sans 500, comfortable padding, a clear focus ring for keyboard users.

**Form inputs.** Cream (`#faf8f4`) field background, a subtle border, 6px radius, and a sage focus
ring on `:focus`. This is the established quote-form look. The quote-form section specifically used a
`quote-form-section` class to opt into the blush submit button; in Astro that is just a prop or a
modifier class on the form.

**Cards.** White surface on the cream page, soft shadow, generous internal padding, the same 6px-ish
radius family. Used for category cards, popular-combination cards, testimonials, and font/swatch
tiles.

**Section bands.** Alternate cream and Sage Light (`#e8ede8`) backgrounds to separate full-width
sections without hard lines.

**Spacing and radius.** Keep a single spacing scale and a single radius value as tokens (see
`tokens.css`) rather than ad hoc pixel values, so the whole site stays consistent and a future tweak
is one edit.

---

## Accessibility quick checks

- Ink on cream and white passes contrast easily. Watch the Muted gray on cream for small text; bump
  size or weight if it gets borderline.
- White text on blush (`#c9a48a`) is the one pairing to verify for button labels; if contrast is
  tight at small sizes, darken the blush slightly for buttons or use ink text on blush.
- Every interactive element needs a visible focus state (the sage ring), not just a hover state.
