// Foundation, edit with care
// =============================================================================
// Sanity Studio configuration for MAS Monograms - loaded by the EMBEDDED /studio
// =============================================================================
// Moved here from studio/sanity.config.ts on 2026-08-28, when the nested studio/
// package was folded into this one and Sanity went 5 -> 6.4.0 (PORTS.md card 10).
//
// The studio now lives in the SAME package as the site. One node_modules, one
// copy of every module, which is what keeps the styled-components / @sanity/ui
// theme context intact: a nested studio package gives TWO module instances of
// styled-components, so the ThemeProvider mounted by one is invisible to
// useTheme in the other and the desk dies on its first custom-component render
// (styled-components error #18, then "Cannot read properties of undefined
// (reading 'v2')") while the login screen, which is core code only, renders
// fine. That was presacademy's 2026-08-26 production outage.
//
// @sanity/astro mounts this config at /studio (see astro.config.mjs); the sanity
// CLI (sanity.cli.ts) uses it for typegen and dataset commands. There is no
// separate hosted Studio any more - deploying the site deploys the Studio, so it
// can never drift stale.

import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { schemaTypes } from './src/sanity/schemaTypes';
import { deskStructure } from './src/sanity/structure';
import { resolve } from './src/sanity/resolve';
import { PreviewNavigator } from './src/sanity/components/PreviewNavigator';
import { envVal } from './src/sanity/urls';
import StudioLogo from './src/sanity/components/StudioLogo';
import { CharacterCountInput } from './src/sanity/components/CharacterCountInput';
import { documentBadges } from './src/sanity/components/documentBadges';

// =============================================================================
// Studio theme - "Heirloom Coast" (matches the live site, 2026-07-03)
// =============================================================================
// Linen/Paper surfaces, Heirloom Ink text, Heritage Indigo primary + navbar
// (echoes the site header), Claret for the Publish/primary action button (the
// site's CTA color), Brass for warnings. Values mirror src/styles/globals.css.
//
// KEPT on buildLegacyTheme across the Sanity 6 upgrade, deliberately. The
// starter migrated to @sanity/ui's buildTheme() to gain a real dark Studio, at
// the cost of all brand tinting. That trade is wrong for this repo: Mary Ann is
// a non-technical editor who has used this exact Heirloom Coast Studio since
// 2026-07, the whole site is a no-dark-mode brand by decision, and swapping her
// editor's colors for stock Sanity grey buys a dark mode nobody asked for.
//
// KNOWN LIMITATION, inherited from the legacy theme builder: buildLegacyTheme is
// light-ONLY. It hard-codes white component backgrounds, so setting the Studio's
// Appearance to Dark leaves every panel white. If that ever becomes a real
// complaint, the fix is buildTheme() from '@sanity/ui/theme' and accepting the
// loss of tinting (see PORTS.md card 10).
const studioThemeProps = {
  '--black':   '#26312E',  // Heirloom Ink — darkest text
  '--white':   '#FBF8F1',  // Paper — lightest surface
  '--gray-base': '#5A5148', // Secondary Taupe — warm neutral ramp (grays lean warm, not cold)

  '--brand-primary':           '#28486B',  // Heritage Indigo — links, selections, highlights
  '--brand-primary--inverted': '#FBF8F1',
  '--focus-color':             '#28486B',  // Indigo focus rings

  '--input-bg':             '#FBF8F1',
  '--component-bg':         '#F4EEE3',      // Linen — card / panel backgrounds
  '--component-text-color': '#26312E',

  '--default-button-color':         '#5A5148',  // neutral buttons — warm taupe
  '--default-button-primary-color': '#8C3A2E',  // Claret — the Publish / primary action (matches site CTA)
  '--default-button-success-color': '#3F7A4B',
  '--default-button-warning-color': '#B98A3E',  // Brass (decorative)
  '--default-button-danger-color':  '#B3261E',

  '--state-success-color': '#3F7A4B',
  '--state-warning-color': '#835A24',      // Brass text (AA-safe)
  '--state-danger-color':  '#B3261E',

  '--main-navigation-color':           '#28486B',  // Indigo navbar — echoes the live site header band
  '--main-navigation-color--inverted': '#FBF8F1',
};

const studioTheme = buildLegacyTheme(studioThemeProps);

// Dev detection must FAIL CLOSED. The previous test was
// `process.env.NODE_ENV !== 'production'`, which was correct for the old
// standalone studio build but is WRONG for the embedded one: the Astro/Vite
// client bundle injects `globalThis.process ??= {}`, so `process` exists with an
// empty env, NODE_ENV is undefined, and the comparison is true IN PRODUCTION.
// That would ship the Vision GROQ console to Mary Ann. Test positively for dev
// instead, so an unknown environment gets the editor build. (Fixed 2026-08-28 on
// the way to the embedded Studio; the same bug is written up in the starter.)
const IS_DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

export default defineConfig({
  name: 'mas-monograms-studio',
  title: 'MAS Monograms',

  projectId:
    envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID') || 'placeholder-project-id',
  dataset: envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production',

  theme: studioTheme,

  studio: {
    components: {
      logo: StudioLogo,
    },
  },

  form: {
    components: {
      input: CharacterCountInput,
    },
  },

  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    // Click-to-edit live preview against the Studio-only /preview/* routes
    // (never the real public pages: see src/sanity/resolve.ts and the site's
    // src/pages/preview/). previewMode only sets `enable`, because `disable` is a
    // documented no-op in this Sanity version, so exiting preview is a plain link
    // to /api/draft-mode/disable (see PreviewLayout.astro). The relative URLs
    // assume the EMBEDDED /studio, i.e. same origin as the site.
    //
    // REQUIRES the SANITY_TOKEN (or the existing SANITY_API_READ_TOKEN) runtime
    // secret. Without it the preview routes fail closed and this tool shows a 503
    // naming what is missing rather than a stack trace; see .dev.vars.example.
    presentationTool({
      resolve,
      previewUrl: {
        initial: '/preview',
        previewMode: { enable: '/api/draft-mode/enable' },
      },
      // The Squarespace-style page list beside the preview: click a page, the
      // preview jumps there and the edit panel follows.
      components: {
        unstable_navigator: {
          component: PreviewNavigator,
          minWidth: 160,
          maxWidth: 280,
        },
      },
    }),
    unsplashImageAsset(),
    media(),
    // Vision (the GROQ query runner) is a developer tool, not an editor tool.
    // Gate it to local dev so the deployed Studio stays uncluttered.
    ...(IS_DEV ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    badges: (prev) => [...prev, ...documentBadges],
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((option) => !SINGLETON_TYPES.has(option.templateId));
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      if (SINGLETON_TYPES.has(schemaType)) {
        return prev.filter(
          ({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action || ''),
        );
      }
      return prev;
    },
  },
});

// Singleton document types — one instance each, not duplicable.
const SINGLETON_TYPES = new Set<string>([
  'siteSettings',
  'homePage',
  'howItWorksPage',
  'pricingPage',
  'aboutPage',
  'requestAQuotePage',
  'shopIndexPage',
  'styleGalleryPage',
  'fontGuidePage',
  'threadChartPage',
  'clearancePage',
  'thankYouPage',
  'notFoundPage',
  'studioGuide',
  'studioNotes',
  'studioPlaybook',
]);
