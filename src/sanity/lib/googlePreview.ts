// Safe to edit by hand (the words)
// =============================================================================
// googlePreview: the soft length hints under "How this looks on Google"
// =============================================================================
// Pure, so src/lib/studio-phase-d.test.ts can check them in bare Node. Hints,
// never errors: a long title still works, Google just shortens it.
// =============================================================================

/** About how many letters Google shows of a title and of a description. */
export const TITLE_IDEAL = 60;
export const DESCRIPTION_IDEAL = 160;

export interface Hint {
  text: string;
  tone: 'ok' | 'soft';
}

const letters = (n: number) => `${n} ${n === 1 ? 'letter' : 'letters'}`;

export function titleHint(length: number): Hint {
  if (length === 0) return { text: '', tone: 'ok' };
  if (length > TITLE_IDEAL) {
    return {
      text: `Title: ${letters(length)}. Google shows about ${TITLE_IDEAL}, so the end may be cut off.`,
      tone: 'soft',
    };
  }
  if (length < 20) {
    return {
      text: `Title: ${letters(length)}. That is short; a few more words about what you make can help.`,
      tone: 'soft',
    };
  }
  return { text: `Title: ${letters(length)}. A good length.`, tone: 'ok' };
}

export function descriptionHint(length: number): Hint {
  if (length === 0) return { text: '', tone: 'ok' };
  if (length > DESCRIPTION_IDEAL) {
    return {
      text: `Short description: ${letters(length)}. Google shows about ${DESCRIPTION_IDEAL}, so the end may be cut off.`,
      tone: 'soft',
    };
  }
  if (length < 70) {
    return {
      text: `Short description: ${letters(length)}. A little short; about 150 letters works well.`,
      tone: 'soft',
    };
  }
  return { text: `Short description: ${letters(length)}. A good length.`, tone: 'ok' };
}
