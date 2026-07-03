// Registers every schema type with the MAS Monograms Studio.
// Only MAS-specific types are included here. Old starter schemas
// (sections, richSections, ctaBlock, journalEntry, service, etc.)
// still exist as files but are intentionally NOT imported.

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
