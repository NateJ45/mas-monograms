// Split a Sanity headline so its last word (or last N words) can be set in the
// italic swash. Rendering logic only: the words are always Sanity's.
export function swashSplit(
  headline: string | null | undefined,
  words = 1,
): { before: string; swash: string } {
  const text = (headline ?? '').trim();
  if (!text) return { before: '', swash: '' };
  const parts = text.split(/\s+/);
  if (parts.length <= words) return { before: '', swash: text };
  return {
    before: parts.slice(0, parts.length - words).join(' ') + ' ',
    swash: parts.slice(parts.length - words).join(' '),
  };
}
