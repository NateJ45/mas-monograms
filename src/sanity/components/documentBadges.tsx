// Foundation, edit with care.
//
// Status badges for Mary Ann's Studio. They sit at the top of the editor next to
// the Published / not-published pill, and say in plain words what a document
// still needs, without her opening every box:
//
//   - "Sold"                               a clearance item marked sold
//   - "Needs a photo"                      a photo of her work, a clearance item or a
//                                          font with no picture yet
//   - "Add a short description for Google" a page whose Google title or description
//                                          is empty
//
// Adapted for MAS on 2026-10-05 (Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md): the starter's copy
// named design-studio types this site does not have, so none of its badges ever
// fired here. Registered via document.badges in sanity.config.ts. Each badge
// returns null when it does not apply, and a brand-new empty document is left
// alone (no nagging before there is anything to nag about).

import { CheckmarkCircleIcon, ImageIcon, SearchIcon } from '@sanity/icons';
import type { DocumentBadgeComponent, DocumentBadgeProps } from 'sanity';

/**
 * The pages that carry seoTitle + seoDescription. Leaves out the "page not
 * found" page (Google never lists it), the Thank You page (it has a title box
 * but no description box, so the badge could never clear) and the shop
 * categories (their pages fall back to the category name and description, so
 * an empty Google box there is not a job; all eight are empty today).
 */
export const SEO_PAGE_TYPES = new Set<string>([
  'homePage',
  'aboutPage',
  'howItWorksPage',
  'pricingPage',
  'requestAQuotePage',
  'shopIndexPage',
  'styleGalleryPage',
  'fontGuidePage',
  'threadChartPage',
  'clearancePage',
]);

/**
 * Where each type keeps its main picture. A path ending in `[0]` is the first
 * picture of a list (a clearance item's photos).
 */
export const PHOTO_FIELD: Record<string, string> = {
  galleryItem: 'image',
  clearanceItem: 'images[0]',
  font: 'previewImage',
};

/** Why a missing photo matters, per type, in her words. */
const PHOTO_WHY: Record<string, string> = {
  galleryItem: 'This photo has no picture yet. Add one before you Publish.',
  clearanceItem: 'Add at least one photo so people can see the item.',
  font: 'A font only shows on your Font Guide once it has a photo of the stitching.',
};

// The live document being edited: prefer the draft, fall back to the published
// version. Returns an empty object so callers can read fields without guarding.
function currentDoc(props: DocumentBadgeProps): Record<string, any> {
  return (props.draft ?? props.published ?? {}) as Record<string, any>;
}

// Has she actually started this document? Anything beyond the system
// (_-prefixed) keys and the template's preset choices counts.
const PRESETS = new Set(['featured', 'hoopFit', 'displayOrder', 'sold', 'quantityAvailable']);
function hasStarted(doc: Record<string, any>): boolean {
  return Object.keys(doc).some((key) => !key.startsWith('_') && !PRESETS.has(key));
}

/** The picture at a PHOTO_FIELD path, or undefined. */
export function photoAt(doc: Record<string, any>, path: string): any {
  const m = path.match(/^(\w+)\[0\]$/);
  return m ? (Array.isArray(doc[m[1]]) ? doc[m[1]][0] : undefined) : doc[path];
}

const SoldBadge: DocumentBadgeComponent = (props) => {
  if (props.type !== 'clearanceItem') return null;
  if (!currentDoc(props).sold) return null;
  return {
    label: 'Sold',
    title: 'Marked as sold. It shows a "Sold" badge on the Clearance page and has no Buy button.',
    color: 'success',
    icon: CheckmarkCircleIcon,
  };
};

const NeedsPhotoBadge: DocumentBadgeComponent = (props) => {
  const path = PHOTO_FIELD[props.type as string];
  if (!path) return null;
  const doc = currentDoc(props);
  if (!hasStarted(doc)) return null;
  if (photoAt(doc, path)?.asset?._ref) return null;
  return {
    label: 'Needs a photo',
    title: PHOTO_WHY[props.type as string],
    color: 'warning',
    icon: ImageIcon,
  };
};

const SeoBadge: DocumentBadgeComponent = (props) => {
  if (!SEO_PAGE_TYPES.has(props.type as string)) return null;
  const doc = currentDoc(props);
  if (!hasStarted(doc)) return null;
  if (doc.seoTitle && doc.seoDescription) return null;
  return {
    label: 'Add a short description for Google',
    title:
      'Open "Google and sharing" at the bottom of this page and fill in the title and the short description. Google shows them in its search results.',
    color: 'warning',
    icon: SearchIcon,
  };
};

// Order matters: badges render left to right in this order.
export const documentBadges = [SoldBadge, NeedsPhotoBadge, SeoBadge];

export default documentBadges;
