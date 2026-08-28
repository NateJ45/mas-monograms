// Foundation, edit with care
// The one place that decides what the header and footer show when Site Settings
// leaves something empty, and the one place that turns Mary Ann's menus into the
// shape the header, the phone menu and the footer all render.
// (ported from presacademy 2026-08-27; the "chrome options" pattern)
//
// Why this file exists: the built-in menu used to live in Header.astro and the
// built-in footer columns in Footer.astro, each with its own copy of "turn the
// Sanity list into links". Two copies of "what the menu is when nothing is set"
// is exactly how a header and a footer quietly stop agreeing about what the
// pages of the site are. There is one copy now, here.
//
// THE RULE THAT KEEPS THIS SAFE: every one of these settings is opt-in. An
// empty list, an empty box and an untouched switch all come back as "keep doing
// what you were doing", so a site nobody has edited renders byte for byte what
// it rendered before any of this existed. `node scripts/page-parity.mjs compare`
// is what holds that promise.

import { navHref, resolveNavLinks, type RawNavLink, type ResolvedNavLink } from '@/lib/nav-href';

/** One top-menu entry: a plain link, or a dropdown holding several links. */
export type NavItem =
  | { kind: 'flat'; label: string; href: string }
  | { kind: 'dropdown'; label: string; items: ResolvedNavLink[] };

/** One titled column of footer links. */
export interface FooterColumn {
  title: string;
  links: ResolvedNavLink[];
}

/** The quote button, already worked out to words + destination. */
export interface HeaderCta {
  show: boolean;
  label: string;
  href: string;
}

/** A top-menu entry as it comes from Sanity: a navLink, or a navGroup. */
export interface RawNavItem extends RawNavLink {
  links?: (RawNavLink | null)[] | null;
}

/** A footer column as it comes from Sanity. */
export interface RawFooterColumn {
  title?: string | null;
  links?: (RawNavLink | null)[] | null;
}

/** The Site Settings fields this file reads, as SITE_SETTINGS_PROJECTION returns them. */
export interface RawChromeSettings {
  quoteCtaLabel?: string | null;
  navItems?: RawNavItem[] | null;
  footerColumns?: RawFooterColumn[] | null;
  legalNav?: (RawNavLink | null)[] | null;
  headerCta?: { show?: boolean | null; label?: string | null; link?: RawNavLink | null } | null;
  /** Nothing set means YES: a site nobody has touched keeps showing these. */
  showEmail?: boolean | null;
  showSocials?: boolean | null;
  showFooterSocials?: boolean | null;
}

export interface ResolvedChrome {
  /** The top menu. Falls back to the built-in one below. */
  navItems: NavItem[];
  /** The footer columns Mary Ann set, or null to keep the built-in ones. */
  footerColumns: FooterColumn[] | null;
  /** The small-print links she set, or null to keep listing the legal pages. */
  legalNav: ResolvedNavLink[] | null;
  /** The quote button. Always worked out; `show: false` takes it away. */
  headerCta: HeaderCta;
  /** Show the email in the top strip and the phone menu. Unset means yes. */
  showEmail: boolean;
  /** Show the social buttons in the top strip and the phone menu. Unset means yes. */
  showSocials: boolean;
  /** Show the social buttons in the footer. Unset means yes. */
  showFooterSocials: boolean;
}

/** The built-in quote button, when Site Settings says nothing about it. */
export const DEFAULT_CTA_LABEL = 'Request a Quote';
export const DEFAULT_CTA_HREF = '/request-a-quote';

/**
 * The built-in top menu. This is what the header shows when Site Settings ->
 * Top menu links is empty, so a fresh copy of the site still has a real menu.
 */
export const FALLBACK_NAV_ITEMS: NavItem[] = [
  { kind: 'flat', label: 'How It Works', href: '/how-it-works' },
  { kind: 'flat', label: 'Pricing', href: '/pricing' },
  { kind: 'flat', label: 'Shop by Item', href: '/shop-by-item' },
  { kind: 'flat', label: 'Style Gallery', href: '/style-gallery' },
  { kind: 'flat', label: 'About', href: '/about' },
];

/**
 * The built-in footer columns. Clearance drops out of the list when there is
 * nothing on clearance, which is why this is a function and not a constant.
 */
export function fallbackFooterColumns(hasClearance = true): FooterColumn[] {
  return [
    {
      title: 'Explore',
      links: [
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Shop by Item', href: '/shop-by-item' },
        { label: 'Style Gallery', href: '/style-gallery' },
        { label: 'About', href: '/about' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Font & Lettering Guide', href: '/font-lettering-guide' },
        { label: 'Thread Color Chart', href: '/thread-color-chart' },
        ...(hasClearance ? [{ label: 'Clearance', href: '/clearance' }] : []),
      ],
    },
    {
      title: 'Get Started',
      links: [
        { label: 'Request a Quote', href: '/request-a-quote' },
        { label: 'How the process works', href: '/how-it-works' },
      ],
    },
  ];
}

/** Trim a value from Sanity; an empty or missing box counts as "not set". */
function clean(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * A switch that is ON until somebody turns it off. Sanity's initial values only
 * fill in BRAND NEW documents, so the live Site Settings has no value at all for
 * these — "nothing set" has to mean yes in code, or the header would lose its
 * email and social buttons the moment the switches were added.
 */
function onUnlessOff(value?: boolean | null): boolean {
  return value !== false;
}

/**
 * Turn the top menu from Site Settings into the shape the header and the phone
 * menu both render. A dropdown becomes a dropdown, a link becomes a link, and
 * anything with no words on it or nowhere to go is left out, so a half-filled
 * row can never put a dead link in the menu. Returns null when nothing usable is
 * set, so the caller falls back to the built-in menu.
 */
export function navItemsFromSettings(items?: RawNavItem[] | null): NavItem[] | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const mapped: NavItem[] = [];
  for (const item of items) {
    if (item?._type === 'navGroup') {
      const children = resolveNavLinks(item.links);
      if (item.label && children.length > 0) {
        mapped.push({ kind: 'dropdown', label: item.label, items: children });
      }
      continue;
    }
    const href = navHref(item);
    if (item?.label && href) {
      mapped.push({ kind: 'flat', label: item.label, href });
    }
  }
  return mapped.length > 0 ? mapped : null;
}

/** The same idea for the footer's titled columns. */
export function footerColumnsFromSettings(cols?: RawFooterColumn[] | null): FooterColumn[] | null {
  if (!Array.isArray(cols) || cols.length === 0) return null;
  const mapped: FooterColumn[] = [];
  for (const col of cols) {
    const links = resolveNavLinks(col?.links);
    if (col?.title && links.length > 0) mapped.push({ title: col.title, links });
  }
  return mapped.length > 0 ? mapped : null;
}

export function resolveChrome(raw?: RawChromeSettings | null): ResolvedChrome {
  const s = raw ?? {};
  const legalNav = resolveNavLinks(s.legalNav);

  return {
    navItems: navItemsFromSettings(s.navItems) ?? FALLBACK_NAV_ITEMS,
    footerColumns: footerColumnsFromSettings(s.footerColumns),
    legalNav: legalNav.length > 0 ? legalNav : null,
    headerCta: {
      show: onUnlessOff(s.headerCta?.show),
      // The button's own wording wins; then the box that was there before it
      // (still the one Mary Ann knows); then the built-in wording.
      label: clean(s.headerCta?.label) ?? clean(s.quoteCtaLabel) ?? DEFAULT_CTA_LABEL,
      href: navHref(s.headerCta?.link) ?? DEFAULT_CTA_HREF,
    },
    showEmail: onUnlessOff(s.showEmail),
    showSocials: onUnlessOff(s.showSocials),
    showFooterSocials: onUnlessOff(s.showFooterSocials),
  };
}
