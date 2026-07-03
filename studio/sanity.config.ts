// Foundation, edit with care
// Sanity Studio configuration for MAS Monograms.
// Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in studio/.env
// after creating the project at sanity.io/manage.

import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { media } from 'sanity-plugin-media';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { Iframe } from 'sanity-plugin-iframe-pane';
import { schemaTypes } from './schemaTypes';
import { deskStructure } from './structure';
import StudioLogo from './components/StudioLogo';
import { CharacterCountInput } from './components/CharacterCountInput';
import { documentBadges } from './components/documentBadges';

// MAS Monograms studio theme — "Heirloom Coast" (matches the live site, 2026-07-03).
// Linen/Paper surfaces, Heirloom Ink text, Heritage Indigo primary + navbar
// (echoes the site header), Claret for the Publish/primary action button (the
// site's CTA color), Brass for warnings. Values mirror src/styles/globals.css.
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

export { Iframe };
export const SITE_URL_FOR_PREVIEW = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321';

// Map doc _type → live-site URL for the preview pane.
// Returns null for types that don't have a viewable page.
export function urlForDoc(schemaType: string, doc: any): string | null {
  const SITE_URL = SITE_URL_FOR_PREVIEW;
  const slug = doc?.slug?.current;
  switch (schemaType) {
    // Singletons
    case 'homePage':           return `${SITE_URL}/`;
    case 'howItWorksPage':     return `${SITE_URL}/how-it-works`;
    case 'pricingPage':        return `${SITE_URL}/pricing`;
    case 'aboutPage':          return `${SITE_URL}/about`;
    case 'requestAQuotePage':  return `${SITE_URL}/request-a-quote`;
    case 'shopIndexPage':      return `${SITE_URL}/shop-by-item`;
    case 'styleGalleryPage':   return `${SITE_URL}/style-gallery`;
    case 'fontGuidePage':      return `${SITE_URL}/font-lettering-guide`;
    case 'threadChartPage':    return `${SITE_URL}/thread-color-chart`;
    case 'clearancePage':      return `${SITE_URL}/clearance`;
    case 'thankYouPage':       return `${SITE_URL}/thank-you`;
    case 'notFoundPage':       return `${SITE_URL}/404`;
    // Collection docs preview on parent page
    case 'itemCategory':       return slug ? `${SITE_URL}/${slug}` : `${SITE_URL}/shop-by-item`;
    case 'testimonial':        return `${SITE_URL}/`;
    case 'galleryItem':        return `${SITE_URL}/style-gallery`;
    case 'font':               return `${SITE_URL}/font-lettering-guide`;
    case 'threadColor':        return `${SITE_URL}/thread-color-chart`;
    case 'pricingTier':        return `${SITE_URL}/pricing`;
    case 'clearanceItem':      return `${SITE_URL}/clearance`;
    // siteSettings has no page
    default: return null;
  }
}

export default defineConfig({
  name: 'mas-monograms-studio',
  title: 'MAS Monograms',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

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
      defaultDocumentNode: (S, { schemaType }) => {
        const url = urlForDoc(schemaType, {});
        if (!url) return S.document().views([S.view.form()]);
        return S.document().views([
          S.view.form(),
          S.view
            .component(Iframe)
            .options({
              url: (doc: any) => urlForDoc(schemaType, doc) ?? `${SITE_URL_FOR_PREVIEW}/`,
              reload: { button: true },
              defaultSize: 'desktop',
            })
            .title('Preview'),
        ]);
      },
    }),
    unsplashImageAsset(),
    media(),
    ...(process.env.NODE_ENV !== 'production' ? [visionTool()] : []),
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
]);
