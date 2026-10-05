// Safe to edit by hand
// React island wrapping shadcn Accordion. Renders FAQs either flat (Process page,
// where each item is scoped to alsoShowOnProcessPage) or grouped by category
// (FAQ page, where categoryOrder determines section order).
//
// `type="multiple"` lets visitors keep several questions open at once — the right
// UX for FAQ pages. The shadcn primitive handles ARIA semantics (Disclosure pattern)
// and keyboard nav for free.
//
// Hydrate with client:visible — FAQ is below-the-fold on every page that uses it.
//
// Answers are force-mounted (2026-10-04 no-JS pass): a closed Radix item otherwise
// server-renders an EMPTY region, so with JavaScript off the answers did not exist
// at all. Now they are always in the HTML; globals.css hides a closed one by its
// data-state when html has .js (Radix never sets `hidden` on a force-mounted region)
// and shows them all when it does not. Cost: closing no longer animates.
//
// Direction D ("The Atelier", 2026-10-04): rows divided by running stitches,
// a numbered italic index (01, 02...) beside each question, and a cross-stitch
// "+" that turns into an "x" when the answer is open (the primitive's chevrons
// are hidden). Colours come from the ground, so it reads on Linen and on a
// Midnight surface alike. Behaviour (Radix, type="multiple") is unchanged.

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import PortableText from '@/components/PortableText';

interface FaqItem {
  question?: string;
  answer?: any;
  category?: string;
  displayOrder?: number;
}

interface Props {
  faqs?: FaqItem[] | null;
  /** When provided, group items by category in this order. Omit for a single flat list. */
  categoryOrder?: string[] | null;
  /** Stable id prefix so multiple FaqAccordion instances on a page don't collide. */
  idPrefix?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function FaqAccordion({ faqs, categoryOrder, idPrefix = 'faq' }: Props) {
  const list = (faqs ?? []).filter((f) => f?.question);
  if (list.length === 0) return null;

  // Group by category. Falls back to a single "All" bucket when no categoryOrder is given.
  const grouped = new Map<string, FaqItem[]>();
  for (const item of list) {
    const key = item.category ?? '__all__';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }
  // Sort within each group by displayOrder (stable, ascending).
  for (const [, items] of grouped) {
    items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }

  // Resolve the section order. If categoryOrder is provided, use it; drop any categories
  // that have no matching items, and append any categories present in the data but missing
  // from the order list (so editors can't accidentally hide questions by forgetting to add
  // a category to the order).
  let sections: Array<{ category: string | null; items: FaqItem[] }> = [];
  if (categoryOrder && categoryOrder.length > 0) {
    const orderedKeys = new Set(categoryOrder);
    for (const key of categoryOrder) {
      const items = grouped.get(key);
      if (items && items.length > 0) sections.push({ category: key, items });
    }
    for (const [key, items] of grouped) {
      if (!orderedKeys.has(key) && items.length > 0) {
        sections.push({ category: key, items });
      }
    }
  } else {
    // Flat list — all categories merged. Use a single null-category section.
    const flat = Array.from(grouped.values()).flat();
    sections = [{ category: null, items: flat }];
  }

  return (
    <div className="space-y-section-lg">
      <style>{`
        .faq-stitch { border-color: color-mix(in srgb, var(--stitch-color) 55%, transparent); }
        .faq-cross {
          position: relative; flex: none; width: 2.25rem; height: 2.25rem;
          border-radius: var(--radius-pill);
          box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--stitch-color) 70%, transparent);
          transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1), background-color 400ms;
        }
        .faq-cross > span {
          position: absolute; left: 50%; top: 50%; width: 0.9rem; height: 2px;
          margin: -1px 0 0 -0.45rem; border-radius: 2px;
          background-image: repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 5px);
        }
        .faq-cross > span:last-child { transform: rotate(90deg); }
        [data-state='open'] > .faq-cross,
        [aria-expanded='true'] > .faq-cross { transform: rotate(45deg); }
      `}</style>
      {sections.map((section, sectionIdx) => {
        const sectionId = section.category
          ? `${idPrefix}-${slugify(section.category)}`
          : `${idPrefix}-section-${sectionIdx}`;
        // A11y notes:
        //   1. When section.category exists we render a visible H2 (one level
        //      below the page H1 — these category labels ARE major page
        //      sections, e.g. "Pricing & Cost", "The Process"). The audit
        //      caught the previous H1→H3 jump.
        //   2. When there's no category (e.g. /process FAQ section) the
        //      heading isn't rendered, so we switch from aria-labelledby
        //      (which would point at a non-existent id) to aria-label. This
        //      fixes the dangling reference the audit flagged on /process.
        return (
          <section
            key={sectionId}
            {...(section.category
              ? { 'aria-labelledby': `${sectionId}-heading` }
              : { 'aria-label': 'Common questions' })}
          >
            {section.category && (
              <h2
                id={`${sectionId}-heading`}
                className="mb-m font-display text-h3 text-foreground italic"
              >
                {section.category}
              </h2>
            )}
            <Accordion type="multiple" className="faq-stitch border-t-2 border-dashed">
              {section.items.map((item, i) => {
                const itemId = `${sectionId}-item-${i}`;
                return (
                  <AccordionItem
                    key={itemId}
                    value={itemId}
                    className="faq-stitch border-b-2 border-dashed"
                  >
                    {/* Question: Fraunces at h4 scale beside an italic index
                        numeral; the cross-stitch toggle replaces the chevrons. */}
                    <AccordionTrigger className="items-center gap-m rounded-sm py-m text-left font-display text-h4 leading-snug text-foreground hover:text-link hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                      <span
                        aria-hidden="true"
                        className="w-8 shrink-0 font-display text-base text-[var(--color-brass-text)] italic"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1">{item.question}</span>
                      <span aria-hidden="true" className="faq-cross">
                        <span />
                        <span />
                      </span>
                    </AccordionTrigger>
                    <AccordionContent
                      forceMount
                      className="pl-[calc(2rem+var(--spacing-m))] text-base leading-relaxed text-[var(--color-text-secondary)] [&_strong]:text-foreground"
                    >
                      <div className="max-w-[62ch] pb-s">
                        <PortableText value={item.answer} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        );
      })}
    </div>
  );
}
