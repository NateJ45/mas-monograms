// Safe to edit by hand (the words); the queries are read-only GROQ
// =============================================================================
// "What needs attention": the checkup's logic, as plain data (2026-10-05)
// =============================================================================
// Mary Ann's Studio, Phase B. Ported in spirit from stonesteps-50k's
// CheckupTool.tsx, with the logic pulled OUT of the React component so bare-Node
// unit tests can check it (src/lib/studio-checkup.test.ts). Each check is a
// read-only GROQ query plus a pure `evaluate` that turns the query's answer into
// nothing (all well) or one finding. The Studio tool
// (src/sanity/components/CheckupTool.tsx) only runs them and draws the cards.
//
// It CHANGES NOTHING. It points, and she fixes it in the Studio. Every finding
// has a one-line plain explanation and a "Take me there" target.
//
// Rules for every check:
//   - Published content only, unless the check is about unpublished changes.
//   - Sanity's own system records (sanity.*, system.*, media.*) never count:
//     the Presentation tool keeps its preview secret as a draft, and counting it
//     reported "1 unpublished change" on an untouched Stone Steps dataset.
//   - One failing check never takes the others down (runChecks catches).
//   - Severity is in her words: Needs doing / Worth a look / For information.
//   - Not for her, so not here: the font-to-Monogram-preview style mapping.
// =============================================================================

import { DESK, type StudioTarget } from '../sanity/studioTargets.ts';

export type Severity = 'Needs doing' | 'Worth a look' | 'For information';

export interface Finding {
  severity: Severity;
  label: string;
  detail: string;
  /** Where "Take me there" goes. */
  target?: StudioTarget;
  /** Words on the "Take me there" button. */
  targetLabel?: string;
}

export interface CheckResult extends Finding {
  id: string;
}

export interface Check {
  id: string;
  query: string;
  params?: Record<string, unknown>;
  /** Pure: the query's answer (and the time now) to a finding or null. */
  evaluate: (data: unknown, now: number) => Finding | null;
}

export type Fetcher = (query: string, params?: Record<string, unknown>) => Promise<unknown>;

const PUBLISHED = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';
const NOT_SYSTEM =
  '!(_type match "sanity.*") && !(_type match "system.*") && !(_type match "media.*")';
const DAY = 24 * 60 * 60 * 1000;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "a, b and c", with "and N more" past `max`. */
export function listNames(names: string[], max = 4): string {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  if (rest > 0) return `${shown.join(', ')} and ${rest} more`;
  if (shown.length <= 1) return shown.join('');
  return `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
}

/** What she calls each kind of thing, for the unpublished-changes list. */
export const TYPE_NAMES: Record<string, string> = {
  siteSettings: 'My business details',
  homePage: 'Home page',
  shopIndexPage: 'Shop by Item page',
  styleGalleryPage: 'Style Gallery page',
  pricingPage: 'Pricing page',
  howItWorksPage: 'How It Works page',
  aboutPage: 'About page',
  requestAQuotePage: 'Request a Quote page',
  fontGuidePage: 'Font and Lettering Guide page',
  threadChartPage: 'Thread Color Chart page',
  atelierSettings: 'Monogram preview',
  clearancePage: 'Clearance page',
  thankYouPage: 'Thank You page',
  notFoundPage: '"Page not found" page',
  legalPage: 'a legal page',
  galleryItem: 'a photo of your work',
  clearanceItem: 'a clearance item',
  pricingTier: 'a price tag',
  faqItem: 'a question and answer',
  font: 'an embroidery font',
  threadColor: 'a thread color',
  itemCategory: 'a shop category',
  studioNotes: 'My notes',
};

/** The plural of each list type's name ("a photo of your work" twice). */
const TYPE_MANY: Record<string, string> = {
  'a legal page': 'legal pages',
  'a photo of your work': 'photos of your work',
  'a clearance item': 'clearance items',
  'a price tag': 'price tags',
  'a question and answer': 'questions and answers',
  'an embroidery font': 'embroidery fonts',
  'a thread color': 'thread colors',
  'a shop category': 'shop categories',
};

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

/** The query's answer as a list (anything else is an empty list). */
const rowsOf = <T>(data: unknown): T[] => (Array.isArray(data) ? (data as T[]) : []);

const isBlank = (v: unknown) => typeof v !== 'string' || v.trim() === '';

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

/** One document of a list: open it if there is one, else the list. */
function oneOrList(
  ids: string[],
  type: string,
  pane: string,
  field?: string,
): { target: StudioTarget; targetLabel: string } {
  if (ids.length === 1) {
    return { target: { doc: ids[0], type, ...(field ? { field } : {}) }, targetLabel: 'Open it' };
  }
  return { target: { pane }, targetLabel: 'Open the list' };
}

type Named = { _id: string; name?: string | null };

export const CHECKS: Check[] = [
  {
    // A photo with no words cannot be read aloud and tells Google nothing.
    id: 'photo-description-missing',
    query: `*[_type == "galleryItem" && ${PUBLISHED} && defined(image.asset) && (!defined(image.alt) || image.alt == "")]{ _id }`,
    evaluate: (data) => {
      const rows = rowsOf<{ _id: string }>(data);
      if (!rows.length) return null;
      return {
        severity: 'Needs doing',
        label: `${plural(rows.length, 'photo')} of your work with no description`,
        detail:
          'Each photo needs a few words saying what it shows. They are read aloud to people who cannot see the picture, and Google reads them too.',
        ...oneOrList(
          rows.map((r) => r._id),
          'galleryItem',
          DESK.photos,
          'image',
        ),
      };
    },
  },
  {
    // An unsold item whose Buy button goes nowhere (or somewhere that is not Stripe).
    id: 'stripe-link-broken',
    query: `*[_type == "clearanceItem" && ${PUBLISHED} && sold != true]{ _id, name, stripePaymentLink }`,
    evaluate: (data) => {
      const rows = rowsOf<Named & { stripePaymentLink?: string | null }>(data);
      const bad = rows.filter((r) => !isStripeLink(r.stripePaymentLink));
      if (!bad.length) return null;
      return {
        severity: 'Needs doing',
        label: `${plural(bad.length, 'clearance item')} with a Buy button that will not work`,
        detail: `${listNames(bad.map((r) => r.name || 'An item with no name'))}. The Stripe payment link is empty or is not a Stripe link, so customers cannot pay. Paste the link from Stripe; it starts with https://buy.stripe.com/`,
        ...oneOrList(
          bad.map((r) => r._id),
          'clearanceItem',
          `${DESK.clearance};${DESK.clearanceItems}`,
          'stripePaymentLink',
        ),
      };
    },
  },
  {
    // The big heading at the top of a page, empty: the page opens on nothing.
    id: 'headline-missing',
    query: `*[_id in $ids]{ _id, _type, heroHeadline, headline }`,
    params: { ids: Object.keys(HEADLINE_PAGES) },
    evaluate: (data) => {
      const rows = rowsOf<{ _id: string; _type: string; heroHeadline?: string; headline?: string }>(
        data,
      );
      const missing = rows.filter((r) => {
        const box = HEADLINE_PAGES[r._type];
        return box ? isBlank(r[box]) : false;
      });
      if (!missing.length) return null;
      const first = missing[0];
      return {
        severity: 'Needs doing',
        label: `${plural(missing.length, 'page')} with no headline`,
        detail: `${listNames(missing.map((r) => TYPE_NAMES[r._type] ?? r._type))}. The headline is the big heading at the top of the page.`,
        target: { doc: first._id, type: first._type, field: HEADLINE_PAGES[first._type] },
        targetLabel: missing.length === 1 ? 'Open it' : 'Open the first one',
      };
    },
  },
  {
    // "0 left" but not marked Sold: the Buy button still shows.
    id: 'clearance-none-left',
    query: `*[_type == "clearanceItem" && ${PUBLISHED} && sold != true && quantityAvailable == 0]{ _id, name }`,
    evaluate: (data) => {
      const rows = rowsOf<Named>(data);
      if (!rows.length) return null;
      return {
        severity: 'Worth a look',
        label: `${plural(rows.length, 'clearance item')} with none left but not marked Sold`,
        detail: `${listNames(rows.map((r) => r.name || 'An item with no name'))}. The Buy button still shows. If it has sold, turn on Sold and press Publish.`,
        ...oneOrList(
          rows.map((r) => r._id),
          'clearanceItem',
          `${DESK.clearance};${DESK.clearanceItems}`,
          'sold',
        ),
      };
    },
  },
  {
    id: 'font-no-photo',
    query: `*[_type == "font" && ${PUBLISHED} && !defined(previewImage.asset)]{ _id, name }`,
    evaluate: (data) => {
      const rows = rowsOf<Named>(data);
      if (!rows.length) return null;
      return {
        severity: 'Worth a look',
        label: `${plural(rows.length, 'font')} with no photo of it stitched`,
        detail: `${listNames(rows.map((r) => r.name || 'A font with no name'))}. A font with no photo is left off your Font and Lettering Guide page, so customers cannot see it. Add a photo when you have one.`,
        ...oneOrList(
          rows.map((r) => r._id),
          'font',
          `${DESK.reference};${DESK.fonts}`,
          'previewImage',
        ),
      };
    },
  },
  {
    // Not something to fix today: sold items can stay on the page with a badge.
    id: 'clearance-sold-still-shown',
    query: `*[_type == "clearanceItem" && ${PUBLISHED} && sold == true]{ _id, name }`,
    evaluate: (data) => {
      const rows = rowsOf<Named>(data);
      if (!rows.length) return null;
      return {
        severity: 'For information',
        label: `${plural(rows.length, 'sold item')} still on your Clearance page`,
        detail:
          'They show with a Sold badge, which is fine for a while. It tells customers your work sells. Take them off when you no longer want them shown.',
        target: { pane: `${DESK.clearance};${DESK.clearanceItems}` },
        targetLabel: 'Open the list',
      };
    },
  },
  {
    // Changes she started and did not publish: nobody sees them yet.
    id: 'unpublished-changes',
    query: `*[_id in path("drafts.**") && ${NOT_SYSTEM}]{ _id, _type }`,
    evaluate: (data) => {
      const rows = rowsOf<{ _id: string; _type: string }>(data);
      // Only the kinds of thing she edits. Anything else is not hers to publish.
      const mine = rows.filter((r) => r._type in TYPE_NAMES);
      if (!mine.length) return null;
      const names = mine.map((r) => TYPE_NAMES[r._type]);
      const counts = new Map<string, number>();
      for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
      const described = [...counts].map(([n, c]) => (c === 1 ? n : `${c} ${TYPE_MANY[n] ?? n}`));
      const first = mine[0];
      return {
        severity: 'Worth a look',
        label: `${plural(mine.length, 'change')} not on your website yet`,
        detail: `${listNames(described)}. You started a change and have not pressed Publish. Open it and press Publish, or leave it if you are still working on it.`,
        target: { doc: first._id.replace(/^drafts\./, ''), type: first._type },
        targetLabel: mine.length === 1 ? 'Open it' : 'Open the first one',
      };
    },
  },
  {
    id: 'photos-kept-out-of-hoops',
    query: `count(*[_type == "galleryItem" && ${PUBLISHED} && hoopFit == "poor"])`,
    evaluate: (data) => {
      const n = typeof data === 'number' ? data : 0;
      if (!n) return null;
      return {
        severity: 'For information',
        label: `${plural(n, 'photo')} kept out of the round hoops`,
        detail:
          'You chose "No" for "Show it in a round hoop?" on these. They still show in the gallery. Nothing to do unless you change your mind.',
        target: { pane: DESK.photos },
        targetLabel: 'Open my photos',
      };
    },
  },
  {
    // Phase D: things she moved to the Trash. Nothing to do; they are off the
    // website and can come back. (Trashed items are never counted anywhere
    // else: the original is deleted when it goes to the Trash, so every other
    // check simply does not see it.)
    id: 'things-in-trash',
    query: `count(*[_type == "trashedItem" && ${PUBLISHED}])`,
    evaluate: (data) => {
      const n = typeof data === 'number' ? data : 0;
      if (!n) return null;
      return {
        severity: 'For information',
        label: `${plural(n, 'thing')} in the Trash`,
        detail:
          'They are off your website. Open the Trash to bring one back, or leave them there. Nothing to do.',
        target: { pane: DESK.trash },
        targetLabel: 'Open the Trash',
      };
    },
  },
  {
    id: 'last-publish',
    query: `*[${PUBLISHED} && ${NOT_SYSTEM} && _type in $types] | order(_updatedAt desc)[0]{ _updatedAt }`,
    params: { types: Object.keys(TYPE_NAMES) },
    evaluate: (data, now) => {
      const at = (data as { _updatedAt?: string } | null)?._updatedAt;
      if (!at) return null;
      const t = new Date(at).getTime();
      if (Number.isNaN(t)) return null;
      const days = Math.max(0, Math.floor((now - t) / DAY));
      const when = days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
      return {
        severity: 'For information',
        label: `Your last change was published ${when}`,
        detail:
          'A website that changes now and then, with a new photo or a sold item, looks cared for. Google notices too.',
      };
    },
  },
];

const RANK: Record<Severity, number> = {
  'Needs doing': 0,
  'Worth a look': 1,
  'For information': 2,
};

/** Run every check; a check that throws is skipped, never fatal. Sorted by severity. */
export async function runChecks(
  fetcher: Fetcher,
  now = Date.now(),
  checks: Check[] = CHECKS,
): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  for (const check of checks) {
    try {
      const data = await fetcher(check.query, check.params ?? {});
      const finding = check.evaluate(data, now);
      if (finding) out.push({ id: check.id, ...finding });
    } catch {
      // A half-run report is still useful; a blank screen is not.
    }
  }
  return out.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}

/** "All clear" means nothing to do: For information never spoils it. */
export function isAllClear(results: CheckResult[]): boolean {
  return results.every((r) => r.severity === 'For information');
}
