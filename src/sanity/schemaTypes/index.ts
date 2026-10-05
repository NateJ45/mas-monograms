// Registers every schema type with the MAS Monograms Studio.
// Only MAS-specific types are included here. Old starter schemas
// (sections, richSections, ctaBlock, journalEntry, service, etc.)
// still exist as files but are intentionally NOT imported.

import { ALL_FIELDS_GROUP } from 'sanity';

// ── Shared building blocks ────────────────────────────────────────────────────
// One menu link, used by every menu on the site-wide singleton below.
import { navLink } from './navLink';

// ── Site-wide singleton ───────────────────────────────────────────────────────
import { siteSettings } from './siteSettings';

// ── Page singletons ───────────────────────────────────────────────────────────
import { homePage } from './homePage';
import { howItWorksPage } from './howItWorksPage';
import { pricingPage } from './pricingPage';
import { aboutPage } from './aboutPage';
import { requestAQuotePage } from './requestAQuotePage';
import { shopIndexPage } from './shopIndexPage';
import { styleGalleryPage } from './styleGalleryPage';
import { fontGuidePage } from './fontGuidePage';
import { threadChartPage } from './threadChartPage';
import { clearancePage } from './clearancePage';
import { thankYouPage } from './thankYouPage';
import { notFoundPage } from './notFoundPage';
import { atelierSettings } from './atelierSettings';

// ── Reusable content collections ──────────────────────────────────────────────
import { itemCategory } from './itemCategory';
import { font } from './font';
import { threadColor } from './threadColor';
import { galleryItem } from './galleryItem';
import { pricingTier } from './pricingTier';
import { clearanceItem } from './clearanceItem';
import { faqItem } from './faqItem';
import { legalPage } from './legalPage';

// ── Start Here (studio helper documents — keep from starter) ──────────────────
import { studioGuide } from './studioGuide';
import { studioNotes } from './studioNotes';
import { studioPlaybook } from './studioPlaybook';

export const schemaTypes = [
  // ── Shared building blocks ───────────────────────────────────────────────────
  // Registered before the documents whose menus are built out of it.
  navLink,

  // ── Singleton pages ──────────────────────────────────────────────────────────
  siteSettings,
  atelierSettings,
  homePage,
  howItWorksPage,
  pricingPage,
  aboutPage,
  requestAQuotePage,
  shopIndexPage,
  styleGalleryPage,
  fontGuidePage,
  threadChartPage,
  clearancePage,
  thankYouPage,
  notFoundPage,

  // ── Collections ──────────────────────────────────────────────────────────────
  itemCategory,
  font,
  threadColor,
  galleryItem,
  pricingTier,
  clearanceItem,
  faqItem,
  legalPage,

  // ── Start Here helper docs ────────────────────────────────────────────────────
  studioGuide,
  studioNotes,
  studioPlaybook,
];

// ── Default every grouped form to the "All fields" tab (2026-07-03) ────────────
// Requested so Mary Ann always sees every field at once and never misses one
// hidden behind a non-default tab (e.g. Site Settings opening on "Identity" and
// hiding Navigation / Social / SEO / Business). For each document that defines
// field groups: clear any per-group `default: true`, then prepend the reserved
// ALL_FIELDS_GROUP marked default. Clearing the others is belt-and-suspenders:
// it makes "All fields" the default whether or not Sanity honors `default` on
// the reserved group. Types without groups (fonts, thread colors, etc.) are
// untouched. Any future grouped schema inherits this automatically.
//
// KEPT on 2026-10-05 (Studio pass, Phase A), deliberately. The pass cut every
// form to at most six tabs named after the parts of the page a visitor sees, and
// put the boxes in the order the page shows them, so "All fields" now reads the
// page top to bottom with Google last. That is the task-based order the spec
// asks for, and it keeps the thing Mary Ann asked for herself. The red alert
// she saw on "All fields" came from required-but-empty boxes, which the same
// pass removed (scripts/audit-studio.mjs, check 4).
for (const type of schemaTypes as Array<{ groups?: Array<{ name?: string; default?: boolean }> }>) {
  const groups = type.groups;
  if (!Array.isArray(groups) || groups.length === 0) continue;
  const rest = groups
    .filter((g) => g?.name !== ALL_FIELDS_GROUP.name)
    .map((g) => (g?.default ? { ...g, default: false } : g));
  type.groups = [{ ...ALL_FIELDS_GROUP, default: true }, ...rest];
}

// ── Search weights for the pages (2026-10-05, Phase A task 6) ─────────────────
// A page singleton has no `title` box, so the Studio's search box could only
// find one by luck. Weighting the headline and the Google title means typing
// "pricing" or "thank you" finds the page. The collections carry their own
// weights in their schema files (name, question, photo words, tags).
const PAGE_SEARCH: Record<string, Array<{ path: string; weight: number }>> = {
  homePage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  howItWorksPage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  pricingPage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  aboutPage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  requestAQuotePage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  shopIndexPage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  styleGalleryPage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  fontGuidePage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  threadChartPage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  clearancePage: [
    { path: 'heroHeadline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  thankYouPage: [
    { path: 'headline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  notFoundPage: [
    { path: 'headline', weight: 10 },
    { path: 'seoTitle', weight: 5 },
  ],
  atelierSettings: [{ path: 'headline', weight: 10 }],
};
for (const type of schemaTypes as Array<{ name: string; __experimental_search?: unknown }>) {
  const weights = PAGE_SEARCH[type.name];
  if (weights) type.__experimental_search = weights;
}
