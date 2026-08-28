// StudioLogo.tsx — Wordmark for the Sanity Studio header (top-left, in place of
// the default Sanity logo). Echoes the live site logo: an italic-serif "Mas" in
// Claret next to "MONOGRAMS" in tracked caps, on the Indigo navbar.
//
// Font note: this uses a serif stack (Fraunces if the browser has it, else
// Georgia). The Studio UI itself intentionally keeps its default legible sans —
// the site uses a sans (Mulish) for all UI chrome too; the display serif is for
// headings and this wordmark only, never dense editor text.
// Safe to edit by hand.

import React from 'react';

export default function StudioLogo() {
  return (
    <span
      style={{
        fontFamily: "'Fraunces', 'Fraunces Variable', Georgia, 'Times New Roman', serif",
        fontSize: '1.05rem',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.28em',
      }}
    >
      <span style={{ fontStyle: 'italic', fontWeight: 500, color: '#E7B980' }}>Mas</span>
      <span style={{ fontWeight: 600, letterSpacing: '0.14em', color: '#FBF8F1', fontSize: '0.82em' }}>
        MONOGRAMS
      </span>
    </span>
  );
}
