// Registers every schema type with the MAS Monograms Studio.
// Only MAS-specific types are included here. Old starter schemas
// (sections, richSections, ctaBlock, journalEntry, service, etc.)
// still exist as files but are intentionally NOT imported.

import { ALL_FIELDS_GROUP } from 'sanity';

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

// ── Reusable content collections ──────────────────────────────────────────────
import { itemCategory } from './itemCategory';
import { font } from './font';
import { threadColor } from './threadColor';
import { galleryItem } from './galleryItem';
import { pricingTier } from './pricingTier';
import { popularCombination } from './popularCombination';
import { clearanceItem } from './clearanceItem';
import { faqItem } from './faqItem';
import { legalPage } from './legalPage';

// ── Start Here (studio helper documents — keep from starter) ──────────────────
import { studioGuide } from './studioGuide';
import { studioNotes } from './studioNotes';
import { studioPlaybook } from './studioPlaybook';

export const schemaTypes = [
  // ── Singleton pages ──────────────────────────────────────────────────────────
  siteSettings,
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
  popularCombination,
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
// ALL_FIELDS_GROUP marked default. Clearing the others is belt-and-suspenders —
// it makes "All fields" the default whether or not Sanity honors `default` on
// the reserved group. Types without groups (fonts, thread colors, etc.) are
// untouched. Any future grouped schema inherits this automatically.
for (const type of schemaTypes as Array<{ groups?: Array<{ name?: string; default?: boolean }> }>) {
  const groups = type.groups;
  if (!Array.isArray(groups) || groups.length === 0) continue;
  const rest = groups
    .filter((g) => g?.name !== ALL_FIELDS_GROUP.name)
    .map((g) => (g?.default ? { ...g, default: false } : g));
  type.groups = [{ ...ALL_FIELDS_GROUP, default: true }, ...rest];
}
