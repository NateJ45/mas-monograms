// Safe to edit by hand (the words); the rules only read
// =============================================================================
// The Checkup's MAS Monograms rules (moved onto the shared Studio kit 2026-10-18)
// =============================================================================
// The kit's Checkup (src/sanity/kit/CheckupTool.tsx, starter PORTS.md card 106)
// runs its generic rules (pictures with no description, pages with no Google
// description, links to anything removed, changes waiting, the Trash, the last
// publish) plus these, over ONE fetch of every content document. They are the
// rules Mary Ann's own "What needs attention" had since 2026-10-05 (Phase B),
// in the kit's shape: a pure `run(ctx)` returning one finding or null, with
// `items` so Home's Fix-it list can name each thing with its own Edit button.
// Tested in src/lib/studio-checkup-mas.test.ts.
//
// Words are hers: no jargon, no em-dashes, "photo of your work", "price tag".
// =============================================================================

import {
  itemsOf,
  listNames,
  openFirst,
  plural,
  type CheckupRule,
  type Doc,
} from '../lib/studio-checkup.ts';

/** Pane ids from src/sanity/studioTargets.ts (kept as strings so this file stays pure). */
const CLEARANCE_ITEMS = 'clearance-and-prices;clearance-items';
const PHOTOS = 'photos';

/** A Stripe payment link must be https on stripe.com (buy.stripe.com in practice). */
export function isStripeLink(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    const u = new URL(value.trim());
    return (
      u.protocol === 'https:' && (u.hostname === 'stripe.com' || u.hostname.endsWith('.stripe.com'))
    );
  } catch {
    return false;
  }
}

/** The pages whose big heading must not be empty, and the box that holds it. */
export const HEADLINE_PAGES: Record<string, 'heroHeadline' | 'headline'> = {
  homePage: 'heroHeadline',
  shopIndexPage: 'heroHeadline',
  styleGalleryPage: 'heroHeadline',
  pricingPage: 'heroHeadline',
  howItWorksPage: 'heroHeadline',
  aboutPage: 'heroHeadline',
  requestAQuotePage: 'heroHeadline',
  fontGuidePage: 'heroHeadline',
  threadChartPage: 'heroHeadline',
  clearancePage: 'heroHeadline',
  thankYouPage: 'headline',
  notFoundPage: 'headline',
};

const isBlank = (v: unknown) => typeof v !== 'string' || v.trim() === '';
const nameOrElse = (d: Doc, fallback: string) =>
  typeof d.name === 'string' && d.name.trim() ? d.name.trim() : fallback;

/** A clearance item still for sale whose Buy button would not work. */
const stripeLinkBroken: CheckupRule = {
  id: 'stripe-link-broken',
  run: ({ published }) => {
    const bad = published.filter(
      (d) => d._type === 'clearanceItem' && d.sold !== true && !isStripeLink(d.stripePaymentLink),
    );
    if (!bad.length) return null;
    const name = (d: Doc) => nameOrElse(d, 'An item with no name');
    return {
      severity: 'Needs doing',
      label: `${plural(bad.length, 'clearance item')} with a Buy button that will not work`,
      detail: `${listNames(bad.map(name))}. The Stripe payment link is empty or is not a Stripe link, so customers cannot pay. Paste the link from Stripe; it starts with https://buy.stripe.com/`,
      ...openFirst(bad, 'stripePaymentLink'),
      items: itemsOf(bad, name, () => 'stripePaymentLink'),
      itemLabel: 'The Buy button will not work',
    };
  },
};

/** A page with its big heading left empty. */
const headlineMissing: CheckupRule = {
  id: 'headline-missing',
  run: ({ published, typeTitle }) => {
    const missing = published.filter((d) => {
      const box = HEADLINE_PAGES[d._type];
      return box ? d._id === d._type && isBlank(d[box]) : false;
    });
    if (!missing.length) return null;
    const name = (d: Doc) => typeTitle(d._type);
    const first = missing[0];
    return {
      severity: 'Needs doing',
      label: `${plural(missing.length, 'page')} with no headline`,
      detail: `${listNames(missing.map(name))}. The headline is the big heading at the top of the page.`,
      ...openFirst(missing, HEADLINE_PAGES[first._type]),
      items: itemsOf(missing, name, (d) => HEADLINE_PAGES[d._type]),
      itemLabel: 'No headline',
    };
  },
};

/** None left but not marked Sold: the Buy button still shows. */
const clearanceNoneLeft: CheckupRule = {
  id: 'clearance-none-left',
  run: ({ published }) => {
    const rows = published.filter(
      (d) => d._type === 'clearanceItem' && d.sold !== true && d.quantityAvailable === 0,
    );
    if (!rows.length) return null;
    const name = (d: Doc) => nameOrElse(d, 'An item with no name');
    return {
      severity: 'Worth a look',
      label: `${plural(rows.length, 'clearance item')} with none left but not marked Sold`,
      detail: `${listNames(rows.map(name))}. The Buy button still shows. If it has sold, turn on Sold and press Publish.`,
      ...openFirst(rows, 'sold'),
      items: itemsOf(rows, name, () => 'sold'),
      itemLabel: 'None left: mark it Sold?',
    };
  },
};

/** A font with no photo of it stitched is left off the Font and Lettering Guide. */
const fontNoPhoto: CheckupRule = {
  id: 'font-no-photo',
  run: ({ published }) => {
    const rows = published.filter(
      (d) => d._type === 'font' && !(d.previewImage as { asset?: unknown } | undefined)?.asset,
    );
    if (!rows.length) return null;
    const name = (d: Doc) => nameOrElse(d, 'A font with no name');
    return {
      severity: 'Worth a look',
      label: `${plural(rows.length, 'font')} with no photo of it stitched`,
      detail: `${listNames(rows.map(name))}. A font with no photo is left off your Font and Lettering Guide page, so customers cannot see it. Add a photo when you have one.`,
      ...openFirst(rows, 'previewImage'),
      items: itemsOf(rows, name, () => 'previewImage'),
      itemLabel: 'No photo of it stitched',
    };
  },
};

/** Sold items still on the Clearance page (fine for a while). */
const soldStillShown: CheckupRule = {
  id: 'clearance-sold-still-shown',
  run: ({ published }) => {
    const n = published.filter((d) => d._type === 'clearanceItem' && d.sold === true).length;
    if (!n) return null;
    return {
      severity: 'For information',
      label: `${plural(n, 'sold item')} still on your Clearance page`,
      detail:
        'They show with a Sold badge, which is fine for a while. It tells customers your work sells. Move them to the Trash when you no longer want them shown.',
      target: { pane: CLEARANCE_ITEMS },
      targetLabel: 'Open the list',
    };
  },
};

/** Photos she chose to keep out of the round hoops. */
const keptOutOfHoops: CheckupRule = {
  id: 'photos-kept-out-of-hoops',
  run: ({ published }) => {
    const n = published.filter((d) => d._type === 'galleryItem' && d.hoopFit === 'poor').length;
    if (!n) return null;
    return {
      severity: 'For information',
      label: `${plural(n, 'photo')} kept out of the round hoops`,
      detail:
        'You chose "No" for "Show it in a round hoop?" on these. They still show in the gallery. Nothing to do unless you change your mind.',
      target: { pane: PHOTOS },
      targetLabel: 'Open my photos',
    };
  },
};

/** A season page that would show no photos at all (no tag matches, no picks). */
const collectionNoPhotos: CheckupRule = {
  id: 'collection-no-photos',
  run: ({ published, nameOf }) => {
    const photos = published.filter((d) => d._type === 'galleryItem');
    const empty = published.filter((d) => {
      if (d._type !== 'collection') return false;
      const picks = Array.isArray(d.photos) ? d.photos.length : 0;
      const tags = new Set(
        (Array.isArray(d.photoTags) ? d.photoTags : [])
          .filter((t): t is string => typeof t === 'string')
          .map((t) => t.trim().toLowerCase()),
      );
      const tagged = photos.some(
        (p) =>
          Array.isArray(p.tags) &&
          p.tags.some((t) => typeof t === 'string' && tags.has(t.trim().toLowerCase())),
      );
      return picks === 0 && !tagged;
    });
    if (!empty.length) return null;
    return {
      severity: 'Needs doing',
      label: `${plural(empty.length, 'season page')} with no photos`,
      detail: `${listNames(empty.map(nameOf))}. No photo of your work has one of its tags yet. Add the tag to a few photos, or pick photos on the page.`,
      ...openFirst(empty, 'photoTags'),
      items: itemsOf(empty, nameOf, () => 'photoTags'),
      itemLabel: 'No photos show yet',
    };
  },
};

/** A notice switched on whose last day has passed (it no longer shows). */
const endedNotices: CheckupRule = {
  id: 'ended-notices',
  run: ({ published, now }) => {
    const n = published.filter(
      (d) =>
        d._type === 'announcement' &&
        d.enabled !== false &&
        typeof d.endDate === 'string' &&
        Date.parse(d.endDate) < now,
    ).length;
    if (!n) return null;
    return {
      severity: 'For information',
      label: `${plural(n, 'notice')} past its last day`,
      detail:
        'Your website stopped showing it by itself, so nothing is wrong. Move it to the Trash when you like, to keep the list tidy.',
      target: { pane: 'notices' },
      targetLabel: 'Open the notices',
    };
  },
};

export const MAS_RULES: CheckupRule[] = [
  stripeLinkBroken,
  headlineMissing,
  clearanceNoneLeft,
  fontNoPhoto,
  soldStillShown,
  keptOutOfHoops,
  collectionNoPhotos,
  endedNotices,
];
