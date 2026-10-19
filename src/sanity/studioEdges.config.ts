// Safe to edit by hand
// =============================================================================
// The Studio's edges for MAS Monograms: wordmark, sign-in line, wording, splash
// (starter PORTS.md card 120)
// =============================================================================
// The ONE site-specific file for the branded edges of the embedded Studio. NOT
// marked PORTABLE. The machinery is PORTABLE: src/pages/studio/index.astro (the
// page and its splash), src/lib/studio-route.ts, src/sanity/studioWording.ts
// and the navbar wordmark in StudioLook.tsx. Detail: docs/agent/studio-kit.md
// ("The edges").
// =============================================================================

import type { StudioWordingInput } from './studioWording';
import type { StudioStart } from '../lib/studio-app';

export interface StudioEdgesConfig extends StudioWordingInput {
  /** The Studio as a phone app (card 125): the name under its icon and where it opens. Defaults: the site's name, Home. */
  app?: { shortName?: string; start?: StudioStart };
  wordmark: {
    /** Which brand.config.json `logoPaths` entry the navy top bar shows ('dark' is the one for dark grounds). null hides it. */
    logo: 'dark' | 'light' | null;
    /** Optional crop of an SVG logo, "x,y,width,height" in the file's own viewBox units. */
    view?: string | null;
  };
}

export const studioEdges: StudioEdgesConfig = {
  // The Signature Thread wordmark for dark grounds (linen letters, the gold
  // thread underline), copied from public/brand/wordmark-dark.svg. It is words
  // only, so no crop: the Hoop Seal is the square icon beside it.
  wordmark: { logo: 'dark' },
  // Under "MAS Monograms" on the sign-in card.
  loginSubtitle: 'Sign in to update your website',
  words: {
    'login.logged-out.title': 'You have been signed out',
    'login.logged-out.generic': 'Please sign in again to keep working on your website.',
    'login.logged-out.session-expired':
      'You were signed out after a while away. Sign in again to pick up where you left off.',
    'user-menu.action.manage-project': 'Manage who can edit',
    'user-menu.action.manage-project-aria-label': 'Manage who can edit',
    'user-menu.action.invite-members': 'Invite someone to help edit',
    'user-menu.action.invite-members-aria-label': 'Invite someone to help edit',
    // Her own help is the Site Guide in the top bar; this menu is Sanity's.
    'help-resources.title': 'Sanity help and resources',
  },
};
