// MAS Monograms mobile nav drawer.
// client:only="react" — Radix portal throws during SSR.
//
// Layout (top → bottom):
//   1. 4px sage accent stripe + "Menu" eyebrow
//   2. "Request a Quote" CTA
//   3. Tagline in italic display serif
//   4. Nav links (flat rows; dropdown groups expanded)
//   5. Spacer → contact block (email, phone, social icons)
//   6. Logo at the bottom

import { useState } from 'react';
import { Menu, Mail, Phone, ChevronRight } from 'lucide-react';
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandPinterest,
  IconLink,
} from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { telHref } from '@/lib/phone';

interface SocialLink { platform?: string; url?: string; label?: string; }
interface FlatNavLink     { kind: 'flat';     label: string; href: string; }
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
        <SheetContent
          side="right"
          className="w-[min(380px,90vw)] sm:max-w-none bg-background border-t-4 border-t-primary p-0 gap-0 flex flex-col overflow-y-auto"
        >
          <SheetHeader className="px-l pt-xl pb-m">
            <SheetTitle className="text-xs uppercase tracking-eyebrow text-foreground/80 font-body font-normal">
              Menu
            </SheetTitle>
          </SheetHeader>

          {/* Primary CTA */}
          <div className="px-l pb-l">
            <a
              href={ctaHref}
              onClick={close}
              className="block w-full px-m py-m text-center rounded-md bg-[var(--color-rust-cta,#b8492a)] text-white text-xs uppercase tracking-eyebrow font-semibold hover:bg-[var(--color-rust-cta-hover,#9c3c20)] transition-colors"
            >
              {ctaLabel}
            </a>
          </div>

          {tagline && (
            <p className="px-l pb-l font-display italic text-h4 text-foreground/85 leading-snug">
              {tagline}
            </p>
          )}

          {/* Nav links */}
          <nav className="border-t border-border-soft py-s" aria-label="Primary mobile">
            {links.map((item) => {
              if (item.kind === 'flat') {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="flex items-center px-l py-s text-lg font-display text-foreground hover:bg-muted hover:text-link transition-colors"
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <div key={item.label}>
                  <p className="px-l pt-m pb-xs text-xs uppercase tracking-eyebrow text-foreground/80">
                    {item.label}
                  </p>
                  {item.items.map((sub) => (
                    <a
                      key={sub.href}
                      href={sub.href}
                      onClick={close}
                      className="flex items-center gap-xs pl-[calc(theme(spacing.l)+0.5rem)] pr-l py-xs text-base font-body text-foreground hover:bg-muted hover:text-link transition-colors"
                    >
                      <ChevronRight size={12} className="shrink-0 text-foreground/40" aria-hidden="true" />
                      {sub.label}
                    </a>
                  ))}
                </div>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Contact + social */}
          <div className="border-t border-border-soft px-l pt-m pb-s">
            <p className="text-xs uppercase tracking-eyebrow text-foreground/80 mb-s">
              Get in touch
            </p>
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-s text-sm text-link hover:underline">
                <Mail size={16} aria-hidden="true" />
                {email}
              </a>
            )}
            {phone && (
              <a href={telHref(phone)} className="mt-s flex items-center gap-s text-sm text-link hover:underline">
                <Phone size={16} aria-hidden="true" />
                {phone}
              </a>
            )}
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
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      <Icon size={20} stroke={1.5} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logo — decorative here; the header link above already provides the
              "MAS Monograms home" accessible name, so this is intentionally aria-hidden. */}
          <div className="border-t border-border-soft px-l py-l flex justify-center">
            <svg
              viewBox="0 0 420 140"
              className="h-10 w-auto"
              aria-hidden="true"
              focusable="false"
            >
              {/* Heirloom Coast — mirrors Logo.astro: Heirloom Ink #26312E, Heritage Indigo #28486B, Claret #8C3A2E. */}
              <text x="0" y="52" fontFamily="'Fraunces Variable', serif" fontWeight="700" fontSize="42" fill="#26312E" letterSpacing="-0.5">MAS</text>
              <text x="0" y="90" fontFamily="'Fraunces Variable', serif" fontWeight="700" fontSize="42" fill="#26312E" letterSpacing="-0.5">MONOGRAMS</text>
              <text x="2" y="114" fontFamily="'Mulish Variable', sans-serif" fontWeight="600" fontSize="13" letterSpacing="3" fill="#28486B">MADE JUST FOR YOU</text>

              <g transform="translate(330,0)">
                <line x1="32" y1="6" x2="32" y2="100" stroke="#26312E" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="32" cy="14" rx="5" ry="9" fill="none" stroke="#26312E" strokeWidth="3" />
                <path d="M2,46 Q32,30 62,46" fill="none" stroke="#8C3A2E" strokeWidth="4.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
