// =============================================================================
// stega-text - cut a preview string WITHOUT cutting its click-to-edit marker
// (2026-10-05, Phase C: the preview now renders the real page bodies)
// =============================================================================
// In the Studio's canvas every string carries an invisible stega run on its END
// (src/lib/preview-stega.ts explains the format). The page bodies cut some
// headlines into pieces to set a word in the italic swash, or split a line of
// facts on its dots. Two everyday string operations wreck the run while doing
// it, and the overlay then logs "Failed to decode stega" and that line loses
// click-to-edit:
//
//   - `\s` in a JavaScript regex MATCHES U+FEFF, one of the run's four digits,
//     so `text.split(/\s+/)` chops the run into pieces and `.join(' ')` puts
//     spaces inside it;
//   - `.trim()` strips a trailing U+FEFF, so the run comes out short.
//
// The fix is to take the run OFF first, do the cutting on the visible words,
// and put the run back on the last piece. On the live site there is no run, so
// these helpers return exactly what the plain operation would (the static HTML
// is unchanged; `npm run parity compare`).
// =============================================================================
import { splitStega } from './preview-stega.ts';

/** The visible words and the marker run (or '') a preview string carries. */
export function takeRun(text: string | null | undefined): { text: string; run: string } {
  const { cleaned, encoded } = splitStega(text ?? '');
  return { text: cleaned, run: encoded };
}

/** `text.trim()`, keeping the marker run on the end. */
export function trimKeep(text: string | null | undefined): string {
  const { text: visible, run } = takeRun(text);
  return visible.trim() + run;
}

/**
 * Split on a separator and trim each piece, keeping the marker run on the last
 * non-empty piece. Empty pieces are dropped (like `.map(trim).filter(Boolean)`).
 */
export function splitKeep(text: string | null | undefined, separator: RegExp): string[] {
  const { text: visible, run } = takeRun(text);
  const parts = visible
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
  if (run && parts.length > 0) parts[parts.length - 1] += run;
  return parts;
}
