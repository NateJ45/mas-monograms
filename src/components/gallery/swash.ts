// Safe to edit by hand
// Picks the word or phrase of a Sanity headline to set in the italic .swash
// (Direction D). Rendering logic only: the text itself always comes from
// Sanity. Rule: a short tail after the last comma ("Ready to ship, no quote
// needed" -> "no quote needed"), otherwise the last word. Trailing
// punctuation stays roman, outside the swash.

import { takeRun } from '../../lib/stega-text.ts';

export interface SwashParts {
  before: string;
  word: string;
  after: string;
}

export function splitSwash(headline: string | null | undefined): SwashParts {
  // Stega-safe (src/lib/stega-text.ts): the canvas's click-to-edit marker is
  // cut off first and put back on the end of the last piece.
  const { text: visible, run } = takeRun(headline);
  const parts = splitVisible(visible.trim());
  if (!run) return parts;
  if (parts.after) return { ...parts, after: parts.after + run };
  return { ...parts, word: parts.word + run };
}

function splitVisible(text: string): SwashParts {
  if (!text) return { before: '', word: '', after: '' };

  const trail = text.match(/[.?!:;,]+$/);
  const after = trail ? trail[0] : '';
  const body = after ? text.slice(0, -after.length) : text;

  const comma = body.lastIndexOf(',');
  if (comma > 0) {
    const tail = body.slice(comma + 1).trim();
    const words = tail.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 3) {
      const start = body.length - tail.length;
      return { before: body.slice(0, start), word: tail, after };
    }
  }

  const lastSpace = body.lastIndexOf(' ');
  if (lastSpace < 0) return { before: '', word: body, after };
  return { before: body.slice(0, lastSpace + 1), word: body.slice(lastSpace + 1), after };
}
