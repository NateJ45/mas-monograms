# 02: Design System

> **Status: current as of 2026-06-30.** This is "Thread Ledger," the design system that replaced
> the original cream/sage/blush system. Implemented in `src/styles/tokens.css` + `globals.css`.
> Full design rationale (why it changed, what it avoids, contrast math):
> `docs/superpowers/specs/2026-06-30-thread-ledger-redesign-design.md`.

The feel: an embroidery floss number card brought to life as a website. Parchment paper, ink text,
pine teal as the primary accent, rust as the one CTA color, mustard gold for gallery photo frames.

---

## Color palette

| Token | Hex | Use |
|---|---|---|
| Ink | `#2b2420` | Primary text, headings, the logo needle |
| Parchment | `#f7f1e6` | Default page background, form input fields |
| White | `#ffffff` | Cards, raised surfaces |
| Muted | `#6b6258` | Secondary text, captions, eyebrows |
| Pine Teal | `#1f5c4f` | Primary accent, links, focus ring |
| Pine Teal Dark | `#163f37` | Hover state on pine-teal elements |
| Rust — decorative | `#c1542c` | Large text (18px+/bold 14px+) and decorative thread-line strokes ONLY |
| Rust — CTA | `#b8492a` | The one CTA button-background color |
| Mustard Gold | `#d9a441` | Gallery photo "hoop ring" frames, highlights |

The CTA color is split into two shades on purpose: the decorative rust clears AA for large text but
NOT as a background under small white button labels, so buttons use the separately-darkened CTA
shade. Don't collapse them into one hex value — see the design spec for the contrast math.

---

## Typography

Two families, both self-hosted via `@fontsource-variable` (no Google Fonts runtime dependency).

| Role | Family | Weights | Notes |
|---|---|---|---|
| Headings | **Bricolage Grotesque Variable** | 700 (600 for sub-headings) | Characterful sans, no serif anywhere in the system. |
| Body / UI | **Work Sans Variable** | 400, 500, 600 | Everything that is not a heading. |

No script font. The logo's needle-and-thread cross is a hand-built inline SVG
(`src/components/Logo.astro`), not a webfont — there is nothing to load for it.

---

## Logo

`src/components/Logo.astro` — a needle-and-thread cross in the same horizontal lockup the brand has
always used (wordmark left, cross standing right, small-caps line beneath). Accepts a `variant` prop
(`"ink"` for light/parchment/mustard surfaces — this covers every surface in the current design,
header and footer alike — `"parchment"` for a dark-ink surface, if one is ever introduced) and a
`mark` prop (render only the compact hoop-ring + needle, no wordmark). No runtime theme switching —
each placement picks its variant at build time based on the surface it sits on.

A brush-textured pass (closer to a hand-painted cross) is a known follow-up, not yet built — see the
design spec's "Open follow-ups" section.

---

## Component styling notes

**Buttons.** Two variants.
- *Primary / CTA:* rust-CTA background (`#b8492a`), white text, hover to `#9c3c20`. This is the
  "Request a Quote" button. Use it sparingly so it stays meaningful.
- *Secondary:* pine-teal outline or pine-teal text on transparent/parchment.
- Both: ~4px border radius, Work Sans 600, comfortable padding, a clear pine-teal focus ring for
  keyboard users.

**Form inputs.** Parchment field background, a subtle border, pine-teal focus ring on `:focus`.

**Cards.** White surface on the parchment page, soft shadow, generous internal padding.

**Section bands.** Alternate parchment and mustard-tinted (`#f0e6d2`) backgrounds to separate
full-width sections without hard lines.

**Spacing and radius.** Keep a single spacing scale and a single radius value as tokens (see
`tokens.css`) rather than ad hoc pixel values.

---

## Accessibility quick checks

- Ink on parchment and white passes contrast at AAA (~14:1).
- Pine teal on parchment passes at AAA (~7.2:1) — safe for links and body-size accent text.
- Decorative rust (`#c1542c`) on parchment clears AA only for large text (18px+, or 14px+ bold) —
  never use it for small body text, and never as a button background under white text.
- The CTA rust (`#b8492a`) is specifically darkened so white button labels clear AA (~5.2:1) — use
  it, not the decorative shade, for every button/chip background.
- Mustard gold is decorative only (gallery frames, highlights) — check contrast before ever pairing
  it with text.
- Every interactive element needs a visible focus state (the pine-teal ring), not just a hover
  state.
- No dark mode anywhere in the codebase — this was a considered decision, not an oversight. See the
  design spec for why.
