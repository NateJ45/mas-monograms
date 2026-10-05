// MAS Monograms — all Sanity GROQ queries.
// Every query goes through sanityFetch() which guards against unconfigured Sanity
// and returns the fallback on error so pages never hard-crash at build time.

import { sanityFetch } from './sanity';

/**
 * How a query reaches Sanity. Every page getter below defaults to `sanityFetch`
 * (published, build time). The draft preview passes its own (src/lib/page-data.ts
 * `previewFetcher`), so the "Edit on the page" canvas runs the SAME GROQ as the
 * live page and hands the shared page bodies data of the same shape.
 */
export type Fetcher = <T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T,
) => Promise<T>;

// Reusable image projection — expands the asset reference and coalesces alt text.
const IMG = `{
  asset->,
  "alt": coalesce(alt, asset->altText, ""),
  "dimensions": {
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
}`;

// A photo that may be stretched in a round hoop (HoopFrame). Same as IMG, plus
// the hotspot and crop (HoopFrame crops the square around the hotspot) and the
// `hoopFit` of the gallery item that uses the same picture, so a photo Mary Ann
// marked "keep it out of round hoops" (galleryItem.hoopFit == "poor") is also
// skipped where a category reuses it. A category photo with no hotspot of its
// own borrows that gallery item's hotspot. Read by src/lib/hoop.ts.
const GALLERY_TWIN = `*[_type == "galleryItem" && image.asset._ref == ^.asset._ref && !(_id in path("drafts.**"))][0]`;
const IMG_HOOP = `{
  asset->,
  "hotspot": coalesce(hotspot, ${GALLERY_TWIN}.image.hotspot),
  "crop": select(defined(hotspot) || defined(crop) => crop, ${GALLERY_TWIN}.image.crop),
  "hoopFit": ${GALLERY_TWIN}.hoopFit,
  "alt": coalesce(alt, asset->altText, ""),
  "dimensions": {
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
}`;

// Portable Text with inline images resolved
const PT_BODY = `[]{
  ...,
  _type == "image" => {
    ...,
    asset->
  }
}`;

// One menu link (schemaTypes/navLink.ts), as every menu needs it: the words on
// the link, the address typed by hand, and the picked page FOLLOWED down to its
// type and web address. src/lib/nav-href.ts turns that into one address. The
// field list is kept apart from the braces so it can also be spread into a
// projection that adds children (the top menu's dropdowns).
const NAV_LINK_FIELDS = `_key, _type, label, linkType, href, externalUrl,
        "slug": internalPage->slug.current,
        "docType": internalPage->_type`;
export const NAV_LINK_PROJECTION = `{ ${NAV_LINK_FIELDS} }`;

// ─── Site Settings ──────────────────────────────────────────────────────────
// Memoised — fetched once per build, reused by every page and BaseLayout.

let _siteSettings: Promise<any> | null = null;

// Exported so the preview shell (src/layouts/PreviewLayout.astro) reads the
// header and footer through the SAME projection. It used to fetch the raw
// document, which was fine while every menu link was a typed address, but a
// link that points at a PAGE has to be followed to that page here or it
// resolves to nothing and the preview quietly shows the built-in menus.
export const SITE_SETTINGS_PROJECTION = `{
        title,
        tagline,
        email,
        phone,
        address { street, city, state, zip },
        serviceArea,
        geo { latitude, longitude },
        openingHours[] { days, opens, closes },
        logo ${IMG},
        navItems[] {
          ${NAV_LINK_FIELDS},
          links[] ${NAV_LINK_PROJECTION}
        },
        quoteCtaLabel,
        menuContactLabel,
        headerCta { show, label, link ${NAV_LINK_PROJECTION} },
        footerColumns[] {
          _key,
          title,
          links[] ${NAV_LINK_PROJECTION}
        },
        legalNav[] ${NAV_LINK_PROJECTION},
        showEmail,
        showSocials,
        showFooterSocials,
        socialLinks[] { platform, url, label },
        googleBusinessUrl,
        googleReviewUrl,
        reviewLinkLabel,
        footerCredit,
        footerCreditUrl,
        seoTitle,
        seoDescription,
        seoImage ${IMG},
        businessType,
        priceRange,
        standardTurnaround,
        rushOrdersAvailable,
        rushTurnaround
      }`;

export function getSiteSettings(): Promise<any> {
  if (!_siteSettings) {
    _siteSettings = sanityFetch(
      `*[_type == "siteSettings"][0]${SITE_SETTINGS_PROJECTION}`,
      {},
      null,
    );
  }
  return _siteSettings!;
}

// ─── Home Page ──────────────────────────────────────────────────────────────

export function getHomePage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "homePage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroImages[] ${IMG},
      heroEyebrow,
      heroHeadline,
      heroItalicWord,
      heroSubhead,
      heroPrimaryCtaLabel,
      heroPrimaryCtaHref,
      heroSecondaryCtaLabel,
      heroSecondaryCtaHref,
      trustItems,
      categoriesEyebrow,
      categoriesHeadline,
      categoriesSubhead,
      categoriesNote,
      marqueeEyebrow,
      aboutEyebrow,
      aboutHeadline,
      aboutBody ${PT_BODY},
      aboutPhoto ${IMG},
      aboutCtaLabel,
      aboutCtaHref,
      makerQuote,
      makerSignature,
      makerFacts,
      processEyebrow,
      processHeadline,
      processSubhead,
      processSteps[] { _key, number, label, body },
      processCtaLabel,
      processCtaHref,
      galleryEyebrow,
      galleryHeadline,
      gallerySubhead,
      galleryCtaLabel,
      galleryCtaHref,
      wallEyebrow,
      wallHeadline,
      wallSubhead,
      wallCtaLabel,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref,
      finalEyebrow,
      finalHeadline,
      finalSubhead,
      finalCtaLabel,
      finalCtaHref
    }`,
    {},
    null,
  );
}

// ─── Atelier settings (live monogram preview copy) ──────────────────────────

export interface AtelierSettings {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  initialsLabel?: string;
  initialsHint?: string;
  styleLabel?: string;
  threadLabel?: string;
  fabricLabel?: string;
  styles?: Array<{
    _key: string;
    key: 'classic' | 'script' | 'block' | 'circle' | 'single';
    label: string;
    blurb: string;
  }>;
  fabrics?: Array<{ _key: string; key: string; label: string; color: string; note?: string }>;
  sampleMonograms?: string[];
  replayLabel?: string;
  ctaLabel?: string;
  disclaimer?: string;
  heroTryLabel?: string;
  heroPlaceholder?: string;
  pauseLabel?: string;
  playLabel?: string;
}

export function getAtelierSettings(fetch: Fetcher = sanityFetch): Promise<AtelierSettings | null> {
  return fetch<AtelierSettings | null>(
    `*[_type == "atelierSettings"][0]{
      eyebrow,
      headline,
      subhead,
      initialsLabel,
      initialsHint,
      styleLabel,
      threadLabel,
      fabricLabel,
      styles[] { _key, key, label, blurb },
      fabrics[] { _key, key, label, color, note },
      sampleMonograms,
      replayLabel,
      ctaLabel,
      disclaimer,
      heroTryLabel,
      heroPlaceholder,
      pauseLabel,
      playLabel
    }`,
    {},
    null,
  );
}

// ─── How It Works Page ──────────────────────────────────────────────────────

export function getHowItWorksPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "howItWorksPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      stepsHeadline,
      steps[] {
        _key,
        number,
        label,
        body ${PT_BODY},
        image ${IMG}
      },
      faqHeadline,
      faqSubhead,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

// ─── Pricing Page ───────────────────────────────────────────────────────────

export function getPricingPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "pricingPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      tiersHeadline,
      tiersSubhead,
      tierPricePrefix,
      addonsHeadline,
      addons[] { _key, label, price, note },
      rushHeadline,
      rushBody ${PT_BODY},
      faqHeadline,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

// ─── About Page ─────────────────────────────────────────────────────────────

export function getAboutPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "aboutPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      heroImage ${IMG},
      storyHeadline,
      storyContent ${PT_BODY},
      makerPhoto ${IMG},
      makerAttribution,
      studioNote,
      recentWorkHeadline,
      valuesHeadline,
      values[] { _key, label, body },
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

// ─── Request a Quote Page ───────────────────────────────────────────────────

export function getRequestAQuotePage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "requestAQuotePage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      heroBody ${PT_BODY},
      heroTrustItems,
      turnaroundCallout,
      orderInfoHeading,
      personalInfoHeading,
      attachmentsHeading,
      additionalHeading,
      nameLabel,
      namePlaceholder,
      emailLabel,
      emailPlaceholder,
      emailHelp,
      phoneLabel,
      phonePlaceholder,
      phoneHelp,
      itemTypeLabel,
      itemTypeHelp,
      itemTypeOtherLabel,
      ownershipLabel,
      ownershipHelp,
      itemDescriptionLabel,
      itemDescriptionPlaceholder,
      itemDescriptionHelp,
      monogramStyleLabel,
      monogramStyleHelp,
      placementSelectLabel,
      placementSelectHelp,
      sizeLabel,
      sizeHelp,
      threadCountLabel,
      threadCountHelp,
      quantityLabel,
      quantityPlaceholder,
      quantityHelp,
      monogramDetailsLabel,
      monogramDetailsPlaceholder,
      monogramDetailsHelp,
      placementLabel,
      placementPlaceholder,
      placementHelp,
      fontPreferenceLabel,
      fontPreferenceHelp,
      fontPreferenceGuideLinkLabel,
      fontPreferenceOtherLabel,
      colorPreferenceLabel,
      colorPreferencePlaceholder,
      colorPreferenceHelp,
      colorPreferenceChartLinkLabel,
      fileUploadLabel,
      fileUploadHelp,
      fileUploadAcceptedTypes,
      rushLabel,
      rushHelp,
      neededByLabel,
      neededByHelp,
      specialInstructionsLabel,
      specialInstructionsPlaceholder,
      specialInstructionsHelp,
      referralLabel,
      referralOptions,
      submitLabel,
      privacyNote,
      errorMessage,
      requiredFieldNote,
      noScriptMessage
    }`,
    {},
    null,
  );
}

// ─── Shop Index Page ────────────────────────────────────────────────────────

export function getShopIndexPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "shopIndexPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      gridIntro,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

// ─── Drag order (Phase D, 2026-10-05) ───────────────────────────────────────
// Mary Ann puts photos, clearance items, price tags, questions, fonts and shop
// categories in order by DRAGGING them in the Studio, which writes `orderRank`
// (a LexoRank string, @sanity/orderable-document-list). The typed displayOrder
// numbers are hidden, not deleted, and stay the second key, so this order is
// TOLERANT: before `scripts/backfill-order-rank.mjs` has run every orderRank is
// null and the old numbers decide exactly as before, and after it the ranks
// reproduce that same order (the backfill copies `displayOrder asc, _id asc`,
// which is how GROQ already broke ties). GROQ sorts nulls last, so an item with
// no rank yet lands at the end, as the old default 99 did.
// Thread colors are NOT here: the chart sorts them by hue in code.
export const RANK_ORDER = 'orderRank asc, displayOrder asc';

/**
 * The FAQ accordion (src/components/FaqAccordion.tsx) re-sorts each topic by
 * the `displayOrder` it is handed, so the FAQ queries hand it the item's
 * POSITION in the drag order instead of the old number: 1 + how many questions
 * rank before it (all questions, the same way the old numbers ran across both
 * pages). Until the backfill, an item with no rank keeps its old number. For
 * today's data both give exactly the old values, so the page is unchanged.
 */
export const FAQ_POSITION = `"displayOrder": select(
        defined(orderRank) => count(*[_type == "faqItem" && !(_id in path("drafts.**")) && defined(orderRank) && orderRank < ^.orderRank]) + 1,
        displayOrder
      )`;

// ─── Item Categories ────────────────────────────────────────────────────────

export function getAllItemCategories(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "itemCategory"] | order(${RANK_ORDER}){
      _id,
      name,
      slug,
      eyebrow,
      description,
      heroImages[] ${IMG_HOOP},
      cardImage ${IMG_HOOP},
      trustItems,
      startingPrice,
      ctaLabel,
      displayOrder,
      featured
    }`,
    {},
    [],
  );
}

export function getItemCategoryBySlug(slug: string, fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "itemCategory" && slug.current == $slug][0]{
      _id,
      name,
      slug,
      eyebrow,
      description,
      heroImages[] ${IMG_HOOP},
      cardImage ${IMG_HOOP},
      trustItems,
      ctaLabel,
      galleryHeading,
      requestSimilarLabel,
      crossSellHeading,
      bannerEyebrow,
      bannerHeadline,
      bannerSubhead,
      seoTitle,
      seoDescription,
      seoImage ${IMG}
    }`,
    { slug },
    null,
  );
}

// ─── Style Gallery Page ─────────────────────────────────────────────────────

export function getStyleGalleryPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "styleGalleryPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      introCtaLabel,
      filterAllLabel,
      additionalFilterTags[] { label, tag },
      filterGroups[] { groupLabel, tags },
      emptyStateMessage,
      filterToggleLabel,
      resultsAnnouncement,
      requestLabel,
      fontCaption,
      filterGroupName,
      filterFallbackHeading,
      moreTagsLabel,
      lessTagsLabel,
      lightboxLabel,
      lightboxCloseLabel,
      lightboxPrevLabel,
      lightboxNextLabel,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

export function getAllGalleryItems(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "galleryItem"] | order(${RANK_ORDER}){
      _id,
      image ${IMG_HOOP},
      "relatedCategory": relatedCategory->{ name, slug },
      "relatedFont": relatedFont->{ name, slug },
      tags,
      featured,
      displayOrder,
      hoopFit
    }`,
    {},
    [],
  );
}

// ─── Font Guide Page ────────────────────────────────────────────────────────

export function getFontGuidePage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "fontGuidePage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      intro ${PT_BODY},
      fontGridEyebrow,
      fontGridHeadline,
      popularLabel,
      tryItLabel,
      customFontNote,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

export function getAllFonts(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "font"] | order(${RANK_ORDER}){
      _id,
      name,
      slug,
      previewImage ${IMG},
      styleTag,
      description,
      bestFor,
      popular,
      atelierStyle,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Thread Color Chart Page ─────────────────────────────────────────────────

export function getThreadChartPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "threadChartPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      intro ${PT_BODY},
      matchingNote,
      customColorNote,
      filterLabel,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

export function getAllThreadColors(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "threadColor"] | order(colorFamily asc, displayOrder asc){
      _id,
      name,
      "slug": slug.current,
      hexColor,
      dmcNumber,
      swatchImage ${IMG},
      colorFamily,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Clearance Page ──────────────────────────────────────────────────────────

export function getClearancePage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "clearancePage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      intro ${PT_BODY},
      paymentNote,
      pickupNote,
      soldOutLabel,
      quantityLeftLabel,
      buyButtonLabel,
      emptyStateMessage,
      emptyStateCtaLabel,
      emptyStateCtaHref,
      emptyStateSecondaryLabel,
      emptyStateSecondaryHref,
      ctaEyebrow,
      ctaHeadline,
      ctaSubhead,
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

export function getAllClearanceItems(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "clearanceItem"] | order(${RANK_ORDER}){
      _id,
      name,
      description,
      images[] ${IMG},
      originalPrice,
      salePrice,
      stripePaymentLink,
      quantityAvailable,
      sold,
      featured,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Thank You Page ──────────────────────────────────────────────────────────

export function getThankYouPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "thankYouPage"][0]{
      seoTitle,
      seoDescription,
      eyebrow,
      headline,
      body ${PT_BODY},
      expectedResponseTime,
      responseTimeLabel,
      nextStepsLabel,
      nextSteps,
      image ${IMG},
      ctaLabel,
      ctaHref,
      secondaryCtaLabel,
      secondaryCtaHref
    }`,
    {},
    null,
  );
}

// ─── 404 Page ────────────────────────────────────────────────────────────────

export function getNotFoundPage(fetch: Fetcher = sanityFetch): Promise<any> {
  return fetch(
    `*[_type == "notFoundPage"][0]{
      seoTitle,
      seoDescription,
      headline,
      "subhead": body,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref
    }`,
    {},
    null,
  );
}

// ─── Pricing Tiers ───────────────────────────────────────────────────────────

export function getAllPricingTiers(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "pricingTier"] | order(${RANK_ORDER}){
      _id,
      label,
      minQuantity,
      maxQuantity,
      pricePerPiece,
      note,
      highlighted,
      highlightLabel,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── FAQ Items ───────────────────────────────────────────────────────────────

export function getFaqItemsForHowItWorks(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "faqItem" && showOnHowItWorks == true] | order(${RANK_ORDER}){
      _id,
      question,
      answer,
      category,
      ${FAQ_POSITION}
    }`,
    {},
    [],
  );
}

export function getFaqItemsForPricing(fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "faqItem" && showOnPricing == true] | order(${RANK_ORDER}){
      _id,
      question,
      answer,
      category,
      ${FAQ_POSITION}
    }`,
    {},
    [],
  );
}

// ─── Legal / policy pages ─────────────────────────────────────────────────────

export function getAllLegalPages(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "legalPage"] | order(displayOrder asc){ _id, title, "slug": slug.current, displayOrder }`,
    {},
    [],
  );
}

export function getLegalPageBySlug(slug: string): Promise<any> {
  return sanityFetch(
    `*[_type == "legalPage" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      seoDescription,
      lastUpdated,
      lastUpdatedLabel,
      body
    }`,
    { slug },
    null,
  );
}

// ─── Featured gallery items (homepage) ──────────────────────────────────────

// Used by /about's "recent work" hoops, so photos marked hoopFit "poor" are left
// out here (they cannot make a good round crop). Add a parameter if a square
// view ever needs every featured photo.
export function getFeaturedGalleryItems(limit = 9, fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "galleryItem" && featured == true && hoopFit != "poor"] | order(${RANK_ORDER})[0...$limit]{
      _id,
      hoopFit,
      image ${IMG_HOOP},
      "relatedCategory": relatedCategory->{ name, slug },
      "relatedFont": relatedFont->{ name, slug },
      tags
    }`,
    { limit },
    [],
  );
}

// ─── Gallery items for the home "studio wall" ───────────────────────────────
// Featured items first, then the rest by display order, so the wall is full even
// if few are featured. The image keeps its hotspot and crop so the front end can
// build a focal-point crop (object-position) from them. Today no photo has a
// hotspot set, so `hotspot` and `crop` come back null and callers must default
// to the centre.

export function getGalleryItemsForWall(limit = 12, fetch: Fetcher = sanityFetch): Promise<any[]> {
  return fetch(
    `*[_type == "galleryItem" && defined(image.asset)] | order(featured desc, ${RANK_ORDER})[0...$limit]{
      _id,
      featured,
      "image": image{
        asset->,
        hotspot,
        crop,
        "alt": coalesce(alt, asset->altText, ""),
        caption,
        "dimensions": {
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height
        }
      },
      "relatedCategory": relatedCategory->{ name, "slug": slug.current },
      tags
    }`,
    { limit },
    [],
  );
}

// ─── Stub: kept so BaseLayout import doesn't break ──────────────────────────

// The shape BaseLayout renders when an announcement exists. Typed here rather
// than as `null` so the layout's `announcement.message` / `.style` / `.link`
// reads type-check instead of collapsing to `never` (astro check, 2026-09-05).
export interface Announcement {
  message?: string;
  style?: 'info' | 'highlight' | 'urgent';
  link?: { url?: string; label?: string };
}

export function getActiveAnnouncement(): Promise<Announcement | null> {
  return Promise.resolve(null);
}
