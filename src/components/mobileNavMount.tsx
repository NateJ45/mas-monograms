// Mounts the React MobileNav into the header's placeholder slot, on demand.
//
// Why not an Astro island (2026-10-04, mobile first-paint pass): MobileNav was
// `client:only="react"`, so every page fetched React (~80 KB) while the fonts
// and CSS were still loading, and the island runtime's two classic inline
// scripts sat inside <header>, where they made Chrome paint the header alone
// and the hero headline (the LCP element) a whole frame later. Header.astro now
// server-renders a look-alike menu button and imports this module on the first
// interaction or a quiet moment after load (2.5s plus idle), so the first
// paint is HTML and CSS only.
//
// The swap is seamless: React renders into a sibling host inside a flushSync,
// and the placeholder is removed in the same task, so no frame shows both or
// neither. If the visitor tapped the placeholder, the real trigger is clicked
// once mounted, which opens the menu with Radix's own focus handling.
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import MobileNav from './MobileNav';

type MobileNavProps = Parameters<typeof MobileNav>[0];

export function mountMobileNav(slot: HTMLElement, open: boolean): Root | null {
  const placeholder = slot.querySelector<HTMLElement>('[data-mobile-nav-placeholder]');
  let props: MobileNavProps;
  try {
    props = JSON.parse(slot.dataset.props ?? '{}') as MobileNavProps;
  } catch {
    return null;
  }
  const hadFocus = !!placeholder?.contains(document.activeElement);
  const host = document.createElement('div');
  host.style.display = 'contents';
  slot.appendChild(host);
  const root = createRoot(host);
  flushSync(() => root.render(<MobileNav {...props} />));
  placeholder?.remove();
  const trigger = host.querySelector<HTMLButtonElement>('[data-slot="sheet-trigger"]');
  // keep a keyboard user's place: the focused placeholder hands focus over
  if (hadFocus) trigger?.focus();
  if (open) trigger?.click();
  return root;
}
