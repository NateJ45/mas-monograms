// Safe to edit by hand
// Static identity values that don't change between deploys.
// All page copy, headings, and marketing text live in Sanity — not here.
// Only update this file when the domain, name, or brand colors change.

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const _name   = "MAS Monograms";
const _domain = "mas-monograms.com";
const _slug   = slugify(_name);

export const site = {
  name:   _name,
  domain: _domain,
  url: `https://${_domain}`,
  lang: "en",

  studio: _name,
  storageKeyPrefix: _slug,

  // MAS Monograms brand palette — mirrors globals.css.
  // Used by OG image generation scripts and JSON-LD schemas.
  brandColors: {
    primary:     "#4a5e4c",  // Sage Dark — links, nav, accent
    primaryDark: "#3a4d3c",  // Sage Darker — hover states
    accent:      "#2c2c28",  // Ink — headings + body
    accentDark:  "#1a1a18",  // Ink Dark
    secondary:   "#8a9e8c",  // Sage Mid — borders
    tertiary:    "#c9a48a",  // Blush — CTA button
    bg:          "#faf8f4",  // Cream — primary surface
    bgSoft:      "#e8ede8",  // Sage Light — alternating sections
    border:      "#8a9e8c",  // Sage Mid
  },

  assets: {
    ogDefault: "/og-default.png",
    favicon:   "/favicon.svg",
  },

  // Static fallbacks — real values live in Sanity siteSettings.
  location: "St. Matthews, SC",
  businessType: "LocalBusiness",
  repo: "",
};

export type Site = typeof site;
