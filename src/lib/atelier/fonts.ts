// Lazy lettering fonts for the Atelier. Nothing here is global CSS: each face is
// fetched with the FontFace API the first time a style needs it, so pages that
// never show the Atelier never download these files, and the hero's text paint
// never waits on them.

import greatVibes400 from '@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2?url';
import playfair700 from '@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2?url';
import playfair700i from '@fontsource/playfair-display/files/playfair-display-latin-700-italic.woff2?url';
import cinzel700 from '@fontsource/cinzel/files/cinzel-latin-700-normal.woff2?url';
import cinzel900 from '@fontsource/cinzel/files/cinzel-latin-900-normal.woff2?url';

export interface FaceSpec {
  family: string;
  url: string;
  weight: string;
  style: 'normal' | 'italic';
  /** CSS fallback used if the face fails to load (offline, blocked). */
  fallback: string;
}

export const FACES = {
  script: {
    family: 'Atelier Great Vibes',
    url: greatVibes400,
    weight: '400',
    style: 'normal',
    fallback: 'cursive',
  },
  classic: {
    family: 'Atelier Playfair',
    url: playfair700,
    weight: '700',
    style: 'normal',
    fallback: 'Georgia, serif',
  },
  classicItalic: {
    family: 'Atelier Playfair',
    url: playfair700i,
    weight: '700',
    style: 'italic',
    fallback: 'Georgia, serif',
  },
  roman: {
    family: 'Atelier Cinzel',
    url: cinzel700,
    weight: '700',
    style: 'normal',
    fallback: 'Georgia, serif',
  },
  block: {
    family: 'Atelier Cinzel',
    url: cinzel900,
    weight: '900',
    style: 'normal',
    fallback: 'Georgia, serif',
  },
} satisfies Record<string, FaceSpec>;

export type FaceKey = keyof typeof FACES;

const loading = new Map<FaceKey, Promise<boolean>>();

/** Load a face once; resolves true when usable, false if it failed (fallback used). */
export function loadFace(key: FaceKey): Promise<boolean> {
  const cached = loading.get(key);
  if (cached) return cached;
  const spec = FACES[key];
  const p = (async () => {
    if (typeof FontFace === 'undefined' || typeof document === 'undefined') return false;
    try {
      const face = new FontFace(spec.family, `url(${spec.url}) format('woff2')`, {
        weight: spec.weight,
        style: spec.style,
        display: 'block',
      });
      await face.load();
      document.fonts.add(face);
      return true;
    } catch {
      return false;
    }
  })();
  loading.set(key, p);
  return p;
}

/** CSS font shorthand for a face at a pixel size. */
export function fontCss(key: FaceKey, px: number): string {
  const s = FACES[key];
  return `${s.style === 'italic' ? 'italic ' : ''}${s.weight} ${px}px "${s.family}", ${s.fallback}`;
}
