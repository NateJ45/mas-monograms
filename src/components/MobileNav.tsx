// MAS Monograms mobile nav — a full-screen "big moment" editorial menu.
// client:only="react" (Header): Radix portal throws during SSR, and this is
// always client-hydrated.
//
// Design language borrowed from the Nixon Creative Studio portfolio menu and
// adapted to the Atelier (Direction D, 2026-10-04): a full-screen Midnight
// panel with the linen twill texture (a dark SECTION, not a dark mode), a
// wordmark + close in the top bar, a positioning line, then the nav as a big
// editorial index: large Fraunces labels, running-stitch dividers, a slide-in
// arrow, the active page in the gold italic swash, and a staggered cascade on
// open. The paper-on-dark .btn CTA, then a pinned "Get in touch" block. The
// panel carries .surface-midnight, so every token inside is the dark context
// (text-foreground is Linen, text-link and the focus ring are gold-light).
//
// Because MAS has far more nav items than the portfolio (8 shop categories, an
// inspiration cluster), dropdown groups are COLLAPSIBLE accordions: collapsed
// by default so the menu stays short, the group holding the active page
// auto-opens, and collapsed sub-links are `inert` so they leave the tab order.

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Menu, X, ChevronRight, ChevronDown, Mail, Phone } from 'lucide-react';
import { wordmarkSvg, DARK } from '@/lib/brand/brandSvg.js';
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandPinterest,
  IconLink,
} from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { telHref } from '@/lib/phone';

interface SocialLink {
  platform?: string;
  url?: string;
  label?: string;
}
interface FlatNavLink {
  kind: 'flat';
  label: string;
  href: string;
}
interface DropdownNavGroup {
  kind: 'dropdown';
  label: string;
  items: { label: string; href: string }[];
}
type NavItem = FlatNavLink | DropdownNavGroup;

interface MobileNavSiteSettings {
  tagline?: string;
  email?: string;
  phone?: string;
  /** Site Settings: the small label above the phone and email ("At the bench"). */
  menuContactLabel?: string;
  socialLinks?: SocialLink[] | null;
}

interface Props {
  links: NavItem[];
  siteSettings?: MobileNavSiteSettings | null;
  ctaLabel?: string;
  ctaHref?: string;
  /** Site Settings switch: show the quote button at all. Default yes. */
  showCta?: boolean;
  /** Site Settings switch: show the email in "Get in touch". Default yes. */
  showEmail?: boolean;
  /** Site Settings switch: show the social buttons. Default yes. */
  showSocials?: boolean;
  /** The brand name, for the dialog's accessible name. */
  brandName?: string;
}

// Short, honest descriptor under each big nav label, keyed by exact href. A
// missing key simply renders the label alone, so adding a nav item never breaks
// this menu.
const DESCRIPTIONS: Record<string, string> = {
  '/how-it-works': 'The process, start to finish',
  '/pricing': 'Simple, honest pricing',
  '/shop-by-item': 'Browse by item type',
  '/style-gallery': 'Real work for inspiration',
  '/about': 'Meet the maker',
  '/font-lettering-guide': 'Every stitchable font',
  '/thread-color-chart': 'All my thread colors',
  '/clearance': 'Ready-to-ship pieces',
};

function socialIcon(platform: string | undefined) {
  switch (platform) {
    case 'Instagram':
      return IconBrandInstagram;
    case 'Facebook':
      return IconBrandFacebook;
    case 'Pinterest':
      return IconBrandPinterest;
    default:
      return IconLink;
  }
}

const normalise = (p: string) => p.replace(/\/+$/, '');

// The Signature Thread wordmark in its dark-ground colours, drawn once for the menu's top bar.
const wordmark = wordmarkSvg({ idp: 'mnav-wm', cut: 'header', palette: DARK });

export default function MobileNav({
  links,
  siteSettings,
  ctaLabel = 'Request a Quote',
  ctaHref = '/request-a-quote',
  showCta = true,
  showEmail = true,
  showSocials = true,
  brandName = 'MAS Monograms',
}: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const tagline = siteSettings?.tagline ?? '';
  const email = showEmail ? siteSettings?.email : undefined;
  const phone = siteSettings?.phone;
  const contactLabel = siteSettings?.menuContactLabel;
  const socialLinks = showSocials ? (siteSettings?.socialLinks ?? []).filter((l) => l?.url) : [];

  // Active path + which groups are expanded. Both are computed when the panel
  // opens: the path so the active row is right even after a View Transitions
  // navigation (which doesn't remount this island), and the expanded set so the
  // group containing the active page auto-opens while the rest stay collapsed.
  const [path, setPath] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!open) return;
    const p = normalise(window.location.pathname);
    setPath(p);
    const activeFor = (href: string) => {
      const h = normalise(href);
      return h === '' ? p === '' : p === h || p.startsWith(`${h}/`);
    };
    const next = new Set<string>();
    for (const item of links) {
      if (item.kind === 'dropdown' && item.items.some((s) => activeFor(s.href))) {
        next.add(item.label);
      }
    }
    setExpanded(next);
  }, [open, links]);

  const isActive = (href: string) => {
    const h = normalise(href);
    return h === '' ? path === '' : path === h || path.startsWith(`${h}/`);
  };

  const toggleGroup = (label: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  const delay = (ms: number): CSSProperties => ({ '--mnav-delay': `${ms}ms` }) as CSSProperties;

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" aria-label="Open menu" className="site-header__menu-btn">
            <Menu size={22} />
          </button>
        </SheetTrigger>

        {/* Full-screen Linen panel. The !w-full / !max-w-full / !border-0
            overrides beat the Sheet primitive's data-[side=right] width + border
            (an attribute selector outranks a plain utility), so this reliably
            goes edge-to-edge. showCloseButton off — we place our own in the top
            bar. */}
        <SheetContent
          side="right"
          showCloseButton={false}
          className="surface-midnight !w-full !max-w-full overflow-y-auto !border-0 !bg-[var(--color-midnight)] p-0 text-foreground"
        >
          <style>{`
            @keyframes mnav-in {
              from { opacity: 0; transform: translateY(14px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @media (prefers-reduced-motion: no-preference) {
              .mnav-item {
                opacity: 0;
                animation: mnav-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
                animation-delay: var(--mnav-delay, 0ms);
              }
            }
            /* Safe-area insets so the wordmark clears the notch and the contact
               block clears the home indicator under viewport-fit=cover. env() is
               0 on non-notched devices, reading as a flat --spacing-l there. */
            .mnav-shell {
              padding-top: calc(var(--spacing-l) + env(safe-area-inset-top));
              padding-bottom: calc(var(--spacing-l) + env(safe-area-inset-bottom));
              padding-left: calc(var(--spacing-l) + env(safe-area-inset-left));
              padding-right: calc(var(--spacing-l) + env(safe-area-inset-right));
            }
          `}</style>

          <div className="mnav-shell relative flex min-h-full flex-col">
            {/* A stitched hoop ring in the corner, purely decorative. */}
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 200 200"
              className="pointer-events-none absolute -right-16 -bottom-10 h-72 w-72 text-[var(--color-gold)] opacity-[0.16]"
            >
              <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeDasharray="7 6"
                strokeLinecap="round"
              />
            </svg>
            {/* Top bar: wordmark (doubles as the dialog's accessible name) + close. */}
            <div className="flex items-center justify-between gap-m">
              {/* The dialog's accessible name is the brand name; the wordmark beside it is
                  the same words drawn (decorative). */}
              <SheetTitle className="flex items-center">
                <span className="sr-only">{brandName}</span>
                <span
                  aria-hidden="true"
                  className="block h-8 [&>svg]:h-full [&>svg]:w-auto"
                  dangerouslySetInnerHTML={{ __html: wordmark }}
                />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation and contact details.
              </SheetDescription>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10 hover:text-link"
              >
                <X size={24} />
              </button>
            </div>

            {/* Positioning line, echoing the brand voice. */}
            {tagline && (
              <p
                className="mnav-item mt-m max-w-[34ch] font-body text-base leading-[1.5] text-[var(--color-text-secondary)]"
                style={delay(60)}
              >
                {tagline}
              </p>
            )}

            {/* Big editorial nav. Flat links are rows; dropdown groups are
                collapsible accordions. Hairline dividers structure the list. */}
            <nav
              aria-label="Primary mobile"
              className="mt-l flex flex-col divide-y divide-dashed divide-[var(--color-gold)]/35 border-y border-dashed border-[var(--color-gold)]/35"
            >
              {links.map((item, i) => {
                const rowDelay = delay(140 + i * 45);

                if (item.kind === 'flat') {
                  const active = isActive(item.href);
                  const desc = DESCRIPTIONS[item.href];
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      aria-current={active ? 'page' : undefined}
                      className="mnav-item group flex items-center justify-between gap-m rounded-md py-3 no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      style={rowDelay}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span
                          className={
                            'font-display text-[1.75rem] leading-tight tracking-[-0.005em] transition-colors duration-150 group-hover:text-link group-focus-visible:text-link ' +
                            (active ? 'swash' : 'text-foreground')
                          }
                        >
                          {item.label}
                        </span>
                        {desc && (
                          <span className="font-body text-xs text-[var(--color-text-secondary)]">
                            {desc}
                          </span>
                        )}
                      </span>
                      <span
                        aria-hidden="true"
                        className={
                          'shrink-0 text-link transition-all duration-200 ' +
                          (active
                            ? 'translate-x-0 opacity-100'
                            : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100')
                        }
                      >
                        <ChevronRight size={20} />
                      </span>
                    </a>
                  );
                }

                // Dropdown group → collapsible accordion.
                const groupOpen = expanded.has(item.label);
                const groupActive = item.items.some((s) => isActive(s.href));
                const panelId = `mnav-group-${i}`;
                return (
                  <div key={item.label} className="mnav-item" style={rowDelay}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      aria-expanded={groupOpen}
                      aria-controls={panelId}
                      className="group flex w-full items-center justify-between gap-m rounded-md py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span
                        className={
                          'font-display text-[1.75rem] leading-tight tracking-[-0.005em] transition-colors duration-150 group-hover:text-link group-focus-visible:text-link ' +
                          (groupActive ? 'swash' : 'text-foreground')
                        }
                      >
                        {item.label}
                      </span>
                      <ChevronDown
                        size={20}
                        aria-hidden="true"
                        className={
                          'shrink-0 text-link transition-transform duration-200 ' +
                          (groupOpen ? 'rotate-180' : '')
                        }
                      />
                    </button>
                    {/* Collapsible panel: grid-rows 0fr↔1fr animates height with
                        no fixed max-height guess. `inert` when closed keeps the
                        hidden sub-links out of the tab order + AT tree. */}
                    <div
                      id={panelId}
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: groupOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden" inert={groupOpen ? undefined : true}>
                        <div className="flex flex-col pb-s">
                          {item.items.map((sub) => {
                            const active = isActive(sub.href);
                            return (
                              <a
                                key={sub.href}
                                href={sub.href}
                                onClick={close}
                                aria-current={active ? 'page' : undefined}
                                className="group flex items-center justify-between gap-m rounded-md py-2 pl-s no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                              >
                                <span
                                  className={
                                    'font-display text-lg leading-tight transition-colors duration-150 group-hover:text-link group-focus-visible:text-link ' +
                                    (active ? 'text-link' : 'text-foreground')
                                  }
                                >
                                  {sub.label}
                                </span>
                                <span
                                  aria-hidden="true"
                                  className={
                                    'shrink-0 text-link transition-all duration-200 ' +
                                    (active
                                      ? 'translate-x-0 opacity-100'
                                      : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100')
                                  }
                                >
                                  <ChevronRight size={16} />
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Primary conversion action. Site Settings -> The quote button can
                turn it off everywhere, here included. */}
            {showCta && (
              <div className="mnav-item mt-l" style={delay(140 + links.length * 45 + 40)}>
                <a href={ctaHref} onClick={close} className="btn btn-primary w-full">
                  <span>{ctaLabel}</span>
                  <span className="btn__arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
              </div>
            )}

            {/* The contact block (label from siteSettings.menuContactLabel): the studio's phone and email from Site Settings (they left
                the header with the old contact strip on 2026-10-04). Pinned to the bottom
                via mt-auto when the menu is shorter than the viewport. No hours: none are
                published. */}
            <div className="mnav-item mt-auto pt-l" style={delay(140 + links.length * 45 + 100)}>
              {contactLabel && <p className="eyebrow">{contactLabel}</p>}
              <div className="mt-s flex flex-col gap-1">
                {phone && (
                  <a
                    href={telHref(phone)}
                    className="inline-flex min-h-11 w-fit items-center gap-2 text-sm text-link transition-colors hover:underline hover:underline-offset-2"
                  >
                    <Phone size={15} aria-hidden="true" />
                    {phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-11 w-fit items-center gap-2 text-sm text-link transition-colors hover:underline hover:underline-offset-2"
                  >
                    <Mail size={15} aria-hidden="true" />
                    {email}
                  </a>
                )}
              </div>
              {socialLinks.length > 0 && (
                <div className="mt-m flex items-center gap-s">
                  {socialLinks.map((link) => {
                    const Icon = socialIcon(link.platform);
                    return (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label ?? link.platform ?? 'Social link'}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-[var(--color-gold)]/60 text-foreground transition-colors hover:border-solid hover:border-[var(--color-gold-light)] hover:bg-[var(--color-gold-light)] hover:text-[var(--color-midnight)]"
                      >
                        <Icon size={20} stroke={1.5} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
