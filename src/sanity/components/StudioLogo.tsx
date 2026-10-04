// StudioLogo.tsx: the brand in the Sanity Studio header (top-left, in place of the default
// Sanity logo). Since 2026-10-04 it is the live site's own Signature Thread wordmark (the
// outlined SVG from src/lib/brand/brandSvg.js, dark-ground colours for the Indigo navbar), so
// the Studio and the site always show the same logo.
// Safe to edit by hand.

import { wordmarkSvg, DARK } from '@/lib/brand/brandSvg.js';

const svg = wordmarkSvg({ idp: 'studio-wm', cut: 'header', palette: DARK });

export default function StudioLogo() {
  return (
    <span
      role="img"
      aria-label="MAS Monograms"
      style={{ display: 'inline-flex', alignItems: 'center', height: '1.35rem' }}
      // The SVG is our own static markup (no user content), drawn once at module load.
      dangerouslySetInnerHTML={{
        __html: svg.replace('<svg ', '<svg style="height:100%;width:auto" '),
      }}
    />
  );
}
