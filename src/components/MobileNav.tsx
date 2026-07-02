// MAS Monograms mobile nav — a full-screen "big moment" editorial menu.
// client:only="react" (Header): Radix portal throws during SSR, and this is
// always client-hydrated.
//
// Design language borrowed from the Nixon Creative Studio portfolio menu and
// adapted to Heirloom Coast: a full-screen Linen panel (not a narrow drawer),
// a wordmark + close in the top bar, a positioning line, then the nav as a big
// editorial index — large Fraunces labels each with a short descriptor,
// hairline-divided rows, a slide-in arrow, and a staggered cascade on open.
// A claret CTA, then a pinned "Get in touch" block (email / phone / socials).
// No dark mode, no theme toggle — this brand is light-only.

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
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

interface SocialLink { platform?: string; url?: string; label?: string; }
interface FlatNavLink      { kind: 'flat';     label: string; href: string; }
interface DropdownNavGroup { kind: 'dropdown'; label: string; items: { label: string; href: string }[]; }
type NavItem = FlatNavLink | DropdownNavGroup;

interface MobileNavSiteSettings {
  tagline?: string;
  email?: string;
  phone?: string;
  socialLinks?: SocialLink[] | null;
}

interface Props {
  links: NavItem[];
  siteSettings?: MobileNavSiteSettings | null;
  ctaLabel?: string;
  ctaHref?: string;
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
    case 'Instagram': return IconBrandInstagram;
    case 'Facebook':  return IconBrandFacebook;
    case 'Pinterest': return IconBrandPinterest;
    default:          return IconLink;
  }
}

export default function MobileNav({
  links,
  siteSettings,
  ctaLabel = 'Request a Quote',
  ctaHref  = '/request-a-quote',
}: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const tagline     = siteSettings?.tagline ?? '';
  const email       = siteSettings?.email;
  const phone       = siteSettings?.phone;
  const socialLinks = (siteSettings?.socialLinks ?? []).filter((l) => l?.url);

  // Active-path highlight, read when the panel opens so it's correct even after
  // a View Transitions navigation that doesn't remount this island.
  const [path, setPath] = useState('');
  useEffect(() => {
    if (open) setPath(window.location.pathname.replace(/\/+$/, ''));
  }, [open]);
  const isActive = (href: string) => {
    const h = href.replace(/\/+$/, '');
    return h === '' ? path === '' : path === h || path.startsWith(`${h}/`);
  };

  // Flatten the mixed flat/dropdown nav into a single ordered list of rows so
  // the cascade delay increments smoothly across everything, and dropdown
  // groups read as a labelled cluster of slightly smaller rows.
  type Row =
    | { type: 'link'; label: string; href: string; desc?: string; size: 'lg' | 'md' }
    | { type: 'groupLabel'; label: string };
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const item of links) {
      if (item.kind === 'flat') {
        out.push({ type: 'link', label: item.label, href: item.href, desc: DESCRIPTIONS[item.href], size: 'lg' });
      } else {
        out.push({ type: 'groupLabel', label: item.label });
        for (const sub of item.items) {
          out.push({ type: 'link', label: sub.label, href: sub.href, desc: DESCRIPTIONS[sub.href], size: 'md' });
        }
      }
    }
    return out;
  }, [links]);

  const delay = (ms: number): CSSProperties => ({ '--mnav-delay': `${ms}ms` }) as CSSProperties;

  return (
    <div className="lg:hidden absolute right-m top-1/2 -translate-y-1/2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent transition-colors"
          >
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
          className="!w-full !max-w-full !border-0 overflow-y-auto bg-background text-foreground p-0"
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
            {/* Top bar: wordmark (doubles as the dialog's accessible name) + close. */}
            <div className="flex items-center justify-between gap-m">
              <SheetTitle className="font-display text-2xl leading-none tracking-[-0.01em] text-foreground">
                MAS Monograms
              </SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation and contact details.
              </SheetDescription>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:text-link transition-colors"
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

            {/* Big editorial nav. Hairline dividers give the flat list structure. */}
            <nav
              aria-label="Primary mobile"
              className="mt-l flex flex-col divide-y divide-border-soft border-y border-border-soft"
            >
              {rows.map((row, i) => {
                if (row.type === 'groupLabel') {
                  return (
                    <p
                      key={`g-${row.label}`}
                      className="mnav-item pt-m pb-xs text-xs uppercase tracking-eyebrow text-[var(--color-text-tertiary)]"
                      style={delay(140 + i * 55)}
                    >
                      {row.label}
                    </p>
                  );
                }
                const active = isActive(row.href);
                return (
                  <a
                    key={row.href}
                    href={row.href}
                    onClick={close}
                    aria-current={active ? 'page' : undefined}
                    className="mnav-item group flex items-center justify-between gap-m py-4 no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
                    style={delay(140 + i * 55)}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span
                        className={
                          'font-display leading-[0.95] tracking-[0.01em] transition-colors duration-150 group-hover:text-link group-focus-visible:text-link ' +
                          (row.size === 'lg' ? 'text-4xl ' : 'text-2xl ') +
                          (active ? 'text-link' : 'text-foreground')
                        }
                      >
                        {row.label}
                      </span>
                      {row.desc && (
                        <span className="font-body text-sm text-[var(--color-text-secondary)]">{row.desc}</span>
                      )}
                    </span>
                    {/* Arrow: the non-colour hover/active cue, slides in from the left. */}
                    <span
                      aria-hidden="true"
                      className={
                        'shrink-0 text-link transition-all duration-200 ' +
                        (active
                          ? 'translate-x-0 opacity-100'
                          : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100')
                      }
                    >
                      <ChevronRight size={row.size === 'lg' ? 24 : 20} />
                    </span>
                  </a>
                );
              })}
            </nav>

            {/* Primary conversion action. */}
            <div className="mnav-item mt-l" style={delay(140 + rows.length * 55 + 40)}>
              <a
                href={ctaHref}
                onClick={close}
                className="block w-full px-m py-m text-center rounded-md bg-[var(--color-rust-cta,#8C3A2E)] text-white text-xs uppercase tracking-eyebrow font-semibold hover:bg-[var(--color-rust-cta-hover,#722C22)] transition-colors"
              >
                {ctaLabel}
              </a>
            </div>

            {/* Get in touch — pinned to the bottom via mt-auto when the menu is
                shorter than the viewport; scrolls naturally when it isn't. */}
            <div
              className="mnav-item mt-auto pt-l"
              style={delay(140 + rows.length * 55 + 100)}
            >
              <p className="text-xs uppercase tracking-eyebrow text-[var(--color-text-tertiary)]">
                Get in touch
              </p>
              <div className="mt-s flex flex-col gap-1">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-11 w-fit items-center text-sm text-link hover:underline hover:underline-offset-2 transition-colors"
                  >
                    {email}
                  </a>
                )}
                {phone && (
                  <a
                    href={telHref(phone)}
                    className="inline-flex min-h-11 w-fit items-center text-sm text-link hover:underline hover:underline-offset-2 transition-colors"
                  >
                    {phone}
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
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-soft text-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors"
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
