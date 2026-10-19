// Safe to edit by hand
// =============================================================================
// The handbook: every guide, from every file, in one list
// =============================================================================
// Each guide file owns one or more categories:
//   content.ts        Start here, Change my website, Photos and clearance,
//                     When something goes wrong
//   getFound.ts       Get found (so customers can find me)
//   brandAndPrint.ts  Brand kit and print
// The Help pane (GuideView) and the tests read ALL_GUIDES, so a guide added to
// any of these files appears in the Studio and gets checked automatically.
// Pure data: no React imports.
// =============================================================================

import { brandAndPrintGuides } from './brandAndPrint.ts';
import { editingGuides } from './content.ts';
import { getFoundGuides } from './getFound.ts';
import { GUIDE_CATEGORIES, type Guide, type GuideCategory } from './types.ts';

export * from './types.ts';
export { GUIDE_ICON_NAMES, GUIDE_MEANINGS } from './iconNames.ts';
import { GUIDE_MEANINGS } from './iconNames.ts';

export const ALL_GUIDES: Guide[] = [...editingGuides, ...getFoundGuides, ...brandAndPrintGuides];

/** Find a guide by id (see-also links, deep links). */
export function guideById(id: string): Guide | undefined {
  return ALL_GUIDES.find((g) => g.id === id);
}

/** The guides in each category, in the Help pane's order. Empty categories are kept. */
export function guidesByCategory(guides: Guide[] = ALL_GUIDES): [GuideCategory, Guide[]][] {
  return GUIDE_CATEGORIES.map((c) => [c, guides.filter((g) => g.category === c)]);
}

/** Lower-cased words for the search box: title, summary and the step text. */
function searchText(g: Guide): string {
  const parts: string[] = [g.title, g.summary, g.category];
  for (const b of g.blocks) {
    if (b.kind === 'h' || b.kind === 'p') parts.push(b.text);
    if (b.kind === 'bullets') parts.push(...b.items);
    if (b.kind === 'steps') parts.push(...b.items.map((s) => (typeof s === 'string' ? s : s.text)));
  }
  return parts.join(' ').toLowerCase();
}

/**
 * Filter guides by what Mary Ann typed. Every word must appear somewhere
 * (title and summary weigh first: those matches are listed first).
 */
export function searchGuides(query: string, guides: Guide[] = ALL_GUIDES): Guide[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return guides;
  const hits = guides.filter((g) => {
    const text = searchText(g);
    return words.every((w) => text.includes(w));
  });
  const head = (g: Guide) => `${g.title} ${g.summary}`.toLowerCase();
  return hits.sort(
    (a, b) =>
      Number(words.every((w) => head(b).includes(w))) -
      Number(words.every((w) => head(a).includes(w))),
  );
}

// ── The Studio kit's view of the handbook (2026-10-18, card 128 2026-10-19) ──
// The shared kit (src/sanity/kit/, starter PORTS.md cards 106, 110, 115, 128)
// reads guides as { slug, category, title, lead, body, icon, diy }. Home's
// "Watch how it is done" row and its search use these. The Site Guide tool and
// the "Help for this page" panel show HER handbook (HelpPane and GuideView),
// drawn in the kit's design language, because her guides carry more than the
// kit's shape holds: what you will see after a step, the time and cost, what
// to have ready, and "Take me there" cards to outside pages.

/** Her badge as the kit's "who does this job" level. */
export const BADGE_DIY: Record<Guide['badge'], 'self' | 'mixed' | 'ask'> = {
  'You can do this yourself': 'self',
  'Mostly yourself': 'mixed',
  'Check with Nathan first': 'ask',
};

/** Every guide, in the kit's shape. `body` is the guide's own blocks (searched word by word). */
export const KIT_GUIDES = ALL_GUIDES.map((g) => ({
  slug: g.id,
  category: g.category,
  title: g.title,
  lead: g.summary,
  body: g.blocks as unknown[],
  icon: GUIDE_MEANINGS[g.icon],
  diy: BADGE_DIY[g.badge],
  ...(g.video ? { video: g.video } : {}),
}));

/**
 * Which guides the "Help for this page" panel shows beside each kind of thing
 * (starter PORTS.md card 110). '*' is every other page. Ids are guide ids;
 * src/lib/studio-guides.test.ts checks each one exists.
 */
export const GUIDES_FOR_TYPE: Record<string, string[]> = {
  galleryItem: ['add-a-photo', 'photo-description', 'photo-focus', 'round-hoop', 'reorder-photos'],
  clearanceItem: ['clearance-add', 'clearance-sold', 'stripe-link'],
  clearancePage: ['clearance-add', 'clearance-sold', 'page-words-form'],
  pricingTier: ['change-a-price'],
  pricingPage: ['change-a-price', 'page-words-form', 'google-preview'],
  font: ['add-a-font'],
  fontGuidePage: ['add-a-font', 'page-words-form'],
  threadColor: ['add-a-thread'],
  threadChartPage: ['add-a-thread', 'page-words-form'],
  itemCategory: ['add-a-category', 'google-preview'],
  faqItem: ['questions'],
  collection: ['season-page', 'add-a-photo'],
  announcement: ['notice'],
  siteSettings: ['business-details'],
  atelierSettings: ['monogram-preview'],
  studioNotes: ['before-asking'],
  '*': [
    'edit-on-the-page',
    'page-words-form',
    'google-preview',
    'share-before-publish',
    'undo-a-change',
  ],
};
