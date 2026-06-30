/**
 * Sanity schema index
 * =============================================================================
 * This array is the single source of truth for every content type the studio
 * knows about. Import it into sanity.config.ts:
 *
 *     import {schemaTypes} from './schemas'
 *
 *     export default defineConfig({
 *       // ...
 *       schema: {types: schemaTypes},
 *     })
 *
 * WHAT IS DONE vs WHAT IS LEFT
 * -----------------------------------------------------------------------------
 * The types imported below are full, working examples that establish the
 * pattern: defineType plus defineField, fieldsets, previews, validation, and
 * generous comments. The checklist underneath lists every remaining type from
 * docs/06. Build each one the same way, then add its import and array entry.
 *
 * Build the types in dependency order to keep the studio quiet:
 *   1. objects first (the small embedded shapes),
 *   2. then documents (some reference each other),
 *   3. then singletons (they pull in everything).
 * Until a referenced type exists, the studio shows a harmless "unknown type"
 * warning. itemCategory, for instance, references `popularCombination` and
 * `testimonial`, so expect a warning about popularCombination until you build it.
 *
 * Folder convention:
 *   objects/     reusable embedded shapes (never standalone documents)
 *   documents/   collections you create many of
 *   singletons/  one-of-a-kind pages and global settings
 */

/* --- Object types (embedded, reusable) ------------------------------------ */
import {seo} from './objects/seo'
import {galleryImage} from './objects/galleryImage'

/* --- Document types (collections) ----------------------------------------- */
import {itemCategory} from './documents/itemCategory'
import {font} from './documents/font'
import {threadColor} from './documents/threadColor'
import {testimonial} from './documents/testimonial'

/* --- Singleton types ------------------------------------------------------ */
import {siteSettings} from './singletons/siteSettings'

/*
 * STILL TO BUILD (every field is specified in docs/06). For each one: create the
 * file, add an import above, and add the exported type to the array below.
 *
 *   Objects:    ctaBanner, link, step, faqItem, stat, featureCard
 *   Documents:  galleryItem, pricingTier, popularCombination, clearanceItem
 *   Singletons: homepage, howItWorksPage, pricingPage, aboutPage,
 *               styleGalleryPage, fontGuidePage, threadChartPage,
 *               thankYouPage, notFoundPage
 */

export const schemaTypes = [
  // objects
  seo,
  galleryImage,
  // documents
  itemCategory,
  font,
  threadColor,
  testimonial,
  // singletons
  siteSettings,
]
