// Safe to edit by hand
// =============================================================================
// The handbook's shape (Mary Ann's Studio, Phase B, 2026-10-05)
// =============================================================================
// Guides are DATA kept in the repo, not editable documents, so they cannot be
// edited out of date or deleted by accident, and `src/lib/studio-guides.test.ts`
// checks every one of them against the real desk. Ported from stonesteps-50k
// (guides/content.ts) and fbcm (guides/icons.ts), reshaped for Mary Ann:
// numbered steps carry "what you will see", and every guide has a badge, a time
// estimate and, where money is involved, an honest cost line.
//
// Writing conventions (the GuideView renderer understands them):
//   - **double asterisks** for a word worth emphasis.
//   - `backticks` for a THING YOU CLICK (a button, a tab, a menu entry). It
//     renders as a small button-look chip so a step can be skimmed.
//   - No em-dashes anywhere. Short sentences. Name things exactly as the
//     Studio shows them (menu titles from structure.ts, box titles from the
//     schema), because the tests check the menu names.
//   - Plain words: never document, field, schema, slug, dataset, draft (say
//     "not on the website yet"), JSON, HTML. Keep the word Publish.
//
// Pure data: no React and no Sanity imports, so bare-Node unit tests load it.
// =============================================================================

import type { StudioTarget } from '../studioTargets.ts';
import type { GuideIconName } from './iconNames.ts';

export type { GuideIconName } from './iconNames.ts';

/** The three-state "can I do this myself?" badge (the Stone Steps idea). */
export const GUIDE_BADGES = [
  'You can do this yourself',
  'Mostly yourself',
  'Check with Nathan first',
] as const;
export type GuideBadge = (typeof GUIDE_BADGES)[number];

/**
 * The Help pane lists guides under these headings, in THIS order. A guide must
 * pick one; the union type makes a typo a compile error.
 */
export const GUIDE_CATEGORIES = [
  'Start here',
  'Change my website',
  'Photos and clearance',
  'Get found (so customers can find me)',
  'Brand kit and print',
  'When something goes wrong',
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

/**
 * Where a "Take me there" card goes. Every in-Studio target is a StudioTarget
 * (see ../studioTargets.ts) and goes through the router; `url` is an outside
 * page (Google, Stripe, Facebook...) and opens in a new tab.
 */
export type GuideTarget = StudioTarget | { url: string };

/** One numbered step. A plain string is a step with nothing extra. */
export type GuideStep =
  | string
  | {
      /** What to do. */
      text: string;
      /** What she should see once she has done it. */
      see?: string;
      /**
       * A description of a picture that would help (kept for a later
       * screenshot pass; shown as a small note for now).
       */
      picture?: string;
    };

export type GuideBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'steps'; items: GuideStep[] }
  | { kind: 'bullets'; items: string[] }
  | {
      /** A "Take me there" card. */
      kind: 'path';
      /** The big words on the card, e.g. "Open My business details". */
      label: string;
      /** Optional smaller line under it, e.g. where it is in the menu. */
      detail?: string;
      to: GuideTarget;
    }
  | {
      kind: 'callout';
      /** tip = a helpful hint; careful = a gentle warning; why = the reason. */
      tone: 'tip' | 'careful' | 'why';
      title?: string;
      text: string;
    }
  | { kind: 'seealso'; ids: string[] };

export interface Guide {
  /** Stable id: used by see-also links and by the tests. kebab-case. */
  id: string;
  category: GuideCategory;
  title: string;
  icon: GuideIconName;
  badge: GuideBadge;
  /** One or two sentences: what this guide helps with. */
  summary: string;
  /** How long it takes, in plain words: "About 5 minutes". */
  time: string;
  /** What it costs, honestly, when money could be involved: "Free". */
  cost?: string;
  /** Things to have ready before starting. */
  before?: string[];
  blocks: GuideBlock[];
  /**
   * Notes for whoever maintains the guide (sources checked and the date).
   * NEVER shown to Mary Ann.
   */
  maintenance?: string;
}
