// Safe to edit by hand
// =============================================================================
// privacy-events.ts - the derived "what visitors do" sentence on the privacy page
// =============================================================================
// This site's privacy policy is a document Mary Ann edits in the Studio (Sanity
// legalPage "privacy"), and its Analytics paragraph names Google Analytics but not
// the clicks and form actions the shared event layer counts (PORTS.md card 217).
// A sentence typed into that document would go stale the day src/config/events.ts
// changes, so the sentence is worked out from the map at build time
// (event-kinds.ts) and added to the page as it is drawn. Nothing is written to
// Sanity. If the stored paragraph is edited or removed, the sentence still lands
// in the body: after the paragraph that names Google Analytics, or, when there is
// none, as a paragraph of its own at the end.
//
// Shown only when GA4 is on (hasGa), because the events travel through that tag.
// =============================================================================

import { eventsSentence } from './event-kinds.ts';
import type { EventsConfig } from './track.ts';

type Span = { _type: 'span'; _key: string; text: string; marks: string[] };
type Block = {
  _type: string;
  _key?: string;
  style?: string;
  children?: Array<{ _type: string; text?: string }>;
  [k: string]: unknown;
};

const KEY = 'derived-events-sentence';

function textOf(block: Block): string {
  return (block.children ?? []).map((c) => c.text ?? '').join('');
}

/**
 * The privacy body with the events sentence added. Returns the body untouched when
 * GA4 is off or nothing is counted. Does not change the input.
 */
export function withEventsSentence(body: unknown, config: EventsConfig, gaOn: boolean): unknown {
  const sentence = eventsSentence(config);
  if (!gaOn || !sentence) return body;
  const blocks: Block[] = Array.isArray(body) ? (body as Block[]) : [];

  const at = blocks.findIndex(
    (b) =>
      b._type === 'block' &&
      (b.style ?? 'normal') === 'normal' &&
      /Google Analytics/i.test(textOf(b)),
  );
  if (at >= 0) {
    const block = blocks[at];
    const span: Span = { _type: 'span', _key: KEY, text: ` ${sentence}`, marks: [] };
    const next = { ...block, children: [...(block.children ?? []), span] };
    return blocks.map((b, i) => (i === at ? next : b));
  }

  const own: Block = {
    _type: 'block',
    _key: KEY,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: `This website uses Google Analytics to understand which pages are visited. ${sentence}`,
      },
    ],
  };
  return [...blocks, own];
}
