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
export { GUIDE_ICON_NAMES } from './iconNames.ts';

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
