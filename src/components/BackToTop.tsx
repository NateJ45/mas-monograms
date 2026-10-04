// Safe to edit by hand
// Floating back-to-top button. Appears after scrolling ~600px, scrolls smoothly
// to top on click. Respects prefers-reduced-motion via the global CSS rule that
// disables smooth scroll.
//
// Direction D ("The Atelier", 2026-10-04): a Midnight button whose rim is a
// gold thread winding round as you read (scroll progress), with a dashed
// running stitch inside it. The ring is written straight to the DOM from a
// rAF-throttled listener (no React re-render per scroll frame); React state
// only flips when the button shows or hides. 48px, above the 44px floor.

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const R = 21;
const C = 2 * Math.PI * R;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setVisible(y > 600);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(C * (1 - p));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Stay mounted and fade in/out via opacity so the control doesn't hard-pop.
  // When hidden it's also non-interactive and removed from the tab order.
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`on-dark fixed right-5 bottom-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-gold-light)] shadow-[0_16px_30px_-14px_rgba(15,27,45,0.65)] transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-gold-light)] ${
        visible ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <svg
        viewBox="0 0 48 48"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="24"
          cy="24"
          r="16.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <ArrowUp size={18} className="relative" />
    </button>
  );
}
