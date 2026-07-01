// MAS Monograms — all Sanity GROQ queries.
// Every query goes through sanityFetch() which guards against unconfigured Sanity
// and returns the fallback on error so pages never hard-crash at build time.

import { sanityFetch } from './sanity';

// Reusable image projection — expands the asset reference and coalesces alt text.
const IMG = `{
  asset->,
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

// ─── Site Settings ──────────────────────────────────────────────────────────
// Memoised — fetched once per build, reused by every page and BaseLayout.

let _siteSettings: Promise<any> | null = null;

export function getSiteSettings(): Promise<any> {
  if (!_siteSettings) {
    _siteSettings = sanityFetch(
      `*[_type == "siteSettings"][0]{
        title,
        tagline,
        email,
        phone,
        address { street, city, state, zip },
        serviceArea,
        navItems[] {
          _type,
          label,
          href,
          links[] { label, href }
        },
        quoteCtaLabel,
        footerColumns[] {
          title,
          links[] { label, href }
        },
        socialLinks[] { platform, url, label },
        googleBusinessUrl,
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
      }`,
      {},
      null,
    );
  }
  return _siteSettings!;
}

// ─── Home Page ──────────────────────────────────────────────────────────────

export function getHomePage(): Promise<any> {
  return sanityFetch(
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
      trustEyebrow,
      trustHeadline,
      trustItems,
      statsItems[]{ number, suffix, label },
      categoriesEyebrow,
      categoriesHeadline,
      categoriesSubhead,
      comboPreviewEyebrow,
      comboPreviewHeadline,
      comboPreviewSubhead,
      aboutEyebrow,
      aboutHeadline,
      aboutBody ${PT_BODY},
      aboutPhoto ${IMG},
      aboutCtaLabel,
      aboutCtaHref,
      processEyebrow,
      processHeadline,
      processSubhead,
      processSteps[] { number, label, body },
      processCtaLabel,
      processCtaHref,
      combosEyebrow,
      combosHeadline,
      combosSubhead,
      testimonialsEyebrow,
      testimonialsHeadline,
      galleryEyebrow,
      galleryHeadline,
      gallerySubhead,
      galleryCtaLabel,
      galleryCtaHref,
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

// ─── How It Works Page ──────────────────────────────────────────────────────

export function getHowItWorksPage(): Promise<any> {
  return sanityFetch(
    `*[_type == "howItWorksPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      stepsHeadline,
      steps[] {
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

export function getPricingPage(): Promise<any> {
  return sanityFetch(
    `*[_type == "pricingPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      tiersHeadline,
      tiersSubhead,
      addonsHeadline,
      addons[] { label, price, note },
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

export function getAboutPage(): Promise<any> {
  return sanityFetch(
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
      valuesHeadline,
      values[] { label, body },
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

export function getRequestAQuotePage(): Promise<any> {
  return sanityFetch(
    `*[_type == "requestAQuotePage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
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
      requiredFieldNote
    }`,
    {},
    null,
  );
}

// ─── Shop Index Page ────────────────────────────────────────────────────────

export function getShopIndexPage(): Promise<any> {
  return sanityFetch(
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

// ─── Item Categories ────────────────────────────────────────────────────────

export function getAllItemCategories(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "itemCategory"] | order(displayOrder asc){
      _id,
      name,
      slug,
      eyebrow,
      description,
      heroImages[] ${IMG},
      cardImage ${IMG},
      trustItems,
      ctaLabel,
      displayOrder,
      featured
    }`,
    {},
    [],
  );
}

export function getItemCategoryBySlug(slug: string): Promise<any> {
  return sanityFetch(
    `*[_type == "itemCategory" && slug.current == $slug][0]{
      _id,
      name,
      slug,
      eyebrow,
      description,
      heroImages[] ${IMG},
      cardImage ${IMG},
      trustItems,
      ctaLabel,
      seoTitle,
      seoDescription,
      seoImage ${IMG}
    }`,
    { slug },
    null,
  );
}

// ─── Style Gallery Page ─────────────────────────────────────────────────────

export function getStyleGalleryPage(): Promise<any> {
  return sanityFetch(
    `*[_type == "styleGalleryPage"][0]{
      seoTitle,
      seoDescription,
      seoImage ${IMG},
      heroEyebrow,
      heroHeadline,
      heroSubhead,
      filterAllLabel,
      additionalFilterTags[] { label, tag },
      emptyStateMessage,
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

export function getAllGalleryItems(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "galleryItem"] | order(displayOrder asc){
      _id,
      image ${IMG},
      "relatedCategory": relatedCategory->{ name, slug },
      "relatedFont": relatedFont->{ name, slug },
      tags,
      featured,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Font Guide Page ────────────────────────────────────────────────────────

export function getFontGuidePage(): Promise<any> {
  return sanityFetch(
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

export function getAllFonts(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "font"] | order(displayOrder asc){
      _id,
      name,
      slug,
      previewImage ${IMG},
      styleTag,
      description,
      bestFor,
      popular,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Thread Color Chart Page ─────────────────────────────────────────────────

export function getThreadChartPage(): Promise<any> {
  return sanityFetch(
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

export function getAllThreadColors(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "threadColor"] | order(colorFamily asc, displayOrder asc){
      _id,
      name,
      slug,
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

export function getClearancePage(): Promise<any> {
  return sanityFetch(
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
      buyButtonLabel,
      emptyStateMessage,
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

export function getAllClearanceItems(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "clearanceItem"] | order(displayOrder asc){
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

export function getThankYouPage(): Promise<any> {
  return sanityFetch(
    `*[_type == "thankYouPage"][0]{
      seoTitle,
      seoDescription,
      eyebrow,
      headline,
      body ${PT_BODY},
      expectedResponseTime,
      nextSteps,
      image ${IMG},
      ctaLabel,
      ctaHref
    }`,
    {},
    null,
  );
}

// ─── 404 Page ────────────────────────────────────────────────────────────────

export function getNotFoundPage(): Promise<any> {
  return sanityFetch(
    `*[_type == "notFoundPage"][0]{
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

export function getAllPricingTiers(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "pricingTier"] | order(displayOrder asc){
      _id,
      label,
      minQuantity,
      maxQuantity,
      pricePerPiece,
      note,
      highlighted,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Popular Combinations ────────────────────────────────────────────────────

export function getPopularCombinations(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "popularCombination"] | order(displayOrder asc){
      _id,
      name,
      description,
      image ${IMG},
      tags,
      "relatedCategory": relatedCategory->{ name, slug },
      featured,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

export function getTestimonials(featuredOnly = false): Promise<any[]> {
  const filter = featuredOnly
    ? `*[_type == "testimonial" && featured == true]`
    : `*[_type == "testimonial"]`;
  return sanityFetch(
    `${filter} | order(_createdAt desc){
      _id,
      quote,
      attribution,
      itemOrdered,
      source,
      reviewUrl,
      featured
    }`,
    {},
    [],
  );
}

// ─── FAQ Items ───────────────────────────────────────────────────────────────

export function getFaqItemsForHowItWorks(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "faqItem" && showOnHowItWorks == true] | order(displayOrder asc){
      _id,
      question,
      answer,
      category,
      displayOrder
    }`,
    {},
    [],
  );
}

export function getFaqItemsForPricing(): Promise<any[]> {
  return sanityFetch(
    `*[_type == "faqItem" && showOnPricing == true] | order(displayOrder asc){
      _id,
      question,
      answer,
      category,
      displayOrder
    }`,
    {},
    [],
  );
}

// ─── Featured gallery items (homepage) ──────────────────────────────────────

export function getFeaturedGalleryItems(limit = 9): Promise<any[]> {
  return sanityFetch(
    `*[_type == "galleryItem" && featured == true] | order(displayOrder asc)[0...$limit]{
      _id,
      image ${IMG},
      "relatedCategory": relatedCategory->{ name, slug },
      "relatedFont": relatedFont->{ name, slug },
      tags
    }`,
    { limit },
    [],
  );
}

// ─── Stub: kept so BaseLayout import doesn't break ──────────────────────────

export function getActiveAnnouncement(): Promise<null> {
  return Promise.resolve(null);
}

// ─── Re-export CoreProjectCard stub so Footer.astro import doesn't break ────
// Footer.astro currently imports getAllProjects from here. MAS doesn't have
// projects, so return empty array. Footer will be rewritten to not need this.

export type CoreProjectCard = { title?: string; slug?: { current?: string } };

export function getAllProjects(): Promise<CoreProjectCard[]> {
  return Promise.resolve([]);
}
