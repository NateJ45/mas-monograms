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

const _name = 'MAS Monograms';
const _domain = 'mas-monograms.com';
const _slug = slugify(_name);

export const site = {
  name: _name,
  domain: _domain,
  url: `https://${_domain}`,
  lang: 'en',

  studio: _name,
  storageKeyPrefix: _slug,

  // MAS Monograms brand palette, Heirloom Coast (mirrors the @theme tokens in globals.css,
  // which win if the two disagree). Not read at runtime today; kept for scripts that want a
  // plain-JS copy. The old sage/cream values were replaced on 2026-10-04.
  brandColors: {
    primary: '#28486b', // Heritage Indigo: links, focus ring on light, indigo bands
    primaryDark: '#1c3550', // Indigo Deep: hover
    accent: '#26312e', // Heirloom Ink: headings and body text
    accentDark: '#0f1b2d', // Midnight: dark sections
    secondary: '#b98a3e', // Brass decorative: hairlines and rings only, never text
    tertiary: '#8c3a2e', // Claret: the primary button on light grounds
    bg: '#f4eee3', // Linen: the page
    bgSoft: '#e4e2d3', // Sage band
    border: '#847a63', // interactive border (form fields)
  },

  assets: {
    ogDefault: '/og-default.png',
    favicon: '/favicon.svg',
  },

  // Static fallbacks — real values live in Sanity siteSettings.
  location: 'St. Matthews, SC',
  businessType: 'LocalBusiness',
  repo: '',
};

export type Site = typeof site;
