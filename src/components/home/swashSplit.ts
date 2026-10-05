// Split a Sanity headline so its last word (or last N words) can be set in the
// italic swash. Rendering logic only: the words are always Sanity's.
// Stega-safe (src/lib/stega-text.ts): in the Studio's canvas the click-to-edit
// marker is taken off before the cut and put back on the swash.
import { takeRun } from '../../lib/stega-text.ts';

export function swashSplit(
  headline: string | null | undefined,
  words = 1,
): { before: string; swash: string } {
  const { text: visible, run } = takeRun(headline);
  const text = visible.trim();
  if (!text) return { before: '', swash: run };
  const parts = text.split(/\s+/);
  if (parts.length <= words) return { before: '', swash: text + run };
  return {
    before: parts.slice(0, parts.length - words).join(' ') + ' ',
    swash: parts.slice(parts.length - words).join(' ') + run,
  };
}
