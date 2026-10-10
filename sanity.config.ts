// Foundation, edit with care
// =============================================================================
// Sanity Studio configuration for MAS Monograms - loaded by the EMBEDDED /studio
// =============================================================================
// Moved here from studio/sanity.config.ts on 2026-08-28, when the nested studio/
// package was folded into this one and Sanity went 5 -> 6.x (PORTS.md card 10;
// the pin set moved to 6.9.1 on 2026-09-06).
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
//
// MARY ANN'S STUDIO (2026-10-05, Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md): the Studio is built
// for one older, non-technical editor. Everything below that serves that is
// marked "Phase A": plain tool names, larger type, one publishing model (no
// Releases, no Drafts menu, no scheduling), a Create menu with only the things
// she makes, Undo/Redo and a "Published, wait 2 to 3 minutes" note.

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
import { StudioLayout } from './src/sanity/components/StudioLayout';
import { CharacterCountInput } from './src/sanity/components/CharacterCountInput';
import { documentBadges } from './src/sanity/components/documentBadges';
import { undoRedoShortcuts } from './src/sanity/components/UndoRedo';
import { SINGLETON_TYPES, withEditorActions } from './src/sanity/editorActions';
import { STARTING_TEMPLATES } from './src/sanity/templates';
import { STUDIO_THEME_PROPS, readableFonts } from './src/sanity/theme';
import { QrCodeTool, QrIcon } from './src/sanity/components/QrCodeTool';
import { BrandKitTool } from './src/sanity/components/BrandKitPane';
import { CheckupTool } from './src/sanity/components/CheckupTool';
import { ActivityIcon, ColorWheelIcon } from '@sanity/icons';

// =============================================================================
// Studio theme - "Heirloom Coast" (matches the live site, 2026-07-03)
// =============================================================================
// Linen/Paper surfaces, Heirloom Ink text, Heritage Indigo primary + navbar
// (echoes the site header), Claret for the Publish/primary action button (the
// site's CTA color), Brass for warnings. Values live in src/sanity/theme.ts,
// which mirrors src/styles/globals.css and is contrast-tested
// (src/lib/studio-theme.test.ts).
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
//
// Phase A: readableFonts() then scales the type ramp up (about 16px in lists,
// 18px in the boxes she types in) and sets the system sans for the interface.
// See the header of src/sanity/theme.ts.
const studioTheme = readableFonts(buildLegacyTheme(STUDIO_THEME_PROPS));

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

/**
 * Phase A: the top-bar tools in her words, in the order she needs them. The
 * names (structure, presentation, media) are unchanged, so every link and
 * route keeps working; only the visible titles change. sanity-plugin-media
 * 5.0.11 has no title option, which is why this is done here for all three.
 */
const TOOL_TITLES: Record<string, string> = {
  structure: 'Edit my content',
  presentation: 'Edit on the page',
  media: 'My photo library',
};
const TOOL_ORDER = ['structure', 'presentation', 'media', 'checkup', 'qr-codes', 'brand-kit'];

/**
 * Phase B: "What needs attention" (src/sanity/components/CheckupTool.tsx), the
 * read-only checkup. Also a desk item (DESK.checkup) so a Welcome card can open
 * it inside "Edit my content".
 */
const CHECKUP_TOOL = {
  name: 'checkup',
  title: 'What needs attention',
  icon: ActivityIcon,
  component: CheckupTool,
};

/**
 * Phase E: "Make a QR code" (src/sanity/components/QrCodeTool.tsx). Runs fully
 * in the browser; no network, so the Studio CSP needs nothing new.
 */
const QR_TOOL = { name: 'qr-codes', title: 'Make a QR code', icon: QrIcon, component: QrCodeTool };

/**
 * Phase F: "My brand kit" (src/sanity/components/BrandKitPane.tsx): logos,
 * social pictures, colors, fonts, with download buttons. The files are static
 * in public/brand-kit/ (same origin), so the Studio CSP needs nothing new.
 */
const BRAND_KIT_TOOL = {
  name: 'brand-kit',
  title: 'My brand kit',
  icon: ColorWheelIcon,
  component: BrandKitTool,
};

/**
 * Phase A: the only things the global "+ Create" menu offers, in this order.
 * The three she makes most start from a template (src/sanity/templates.ts);
 * the rest use the type's plain starting point.
 */
const CREATE_MENU = [
  'new-photo',
  'new-clearance-item',
  'new-question',
  'pricingTier',
  'font',
  'threadColor',
  'itemCategory',
];

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
      // Phase A: the first-visit tour, opening on Welcome, and hiding the
      // "Drafts" menu. Sanity has no setting for any of the three; see
      // src/sanity/components/StudioLayout.tsx.
      layout: StudioLayout,
    },
  },

  // Phase A: ONE publishing model, the Publish button. Sanity 6 adds Releases
  // (bundle changes for a later publish), scheduled drafts and scheduled
  // publishing beside it; for one editor whose site rebuilds on every publish
  // they are only a second, confusing way to do the same thing. Tasks and
  // comments are team features with icons she cannot use. The "What's new"
  // announcements are Sanity's product news, not hers. Turn any of these back
  // on the day there is a reason.
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },
  scheduledPublishing: { enabled: false },
  tasks: { enabled: false },
  announcements: { enabled: false },

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
        previewMode: { enable: '/api/draft-mode/enable/' },
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
    // Phase A: Ctrl+Z / Ctrl+Shift+Z (Cmd on a Mac) for everything that is not
    // typing (PORTS.md card 27). The buttons are document actions, added in
    // src/sanity/editorActions.ts; this plugin only adds the keyboard layer and
    // stays out of text boxes so their own undo keeps working.
    undoRedoShortcuts(),
  ],

  tools: (prev) =>
    [...prev, CHECKUP_TOOL, QR_TOOL, BRAND_KIT_TOOL]
      .map((tool) => (TOOL_TITLES[tool.name] ? { ...tool, title: TOOL_TITLES[tool.name] } : tool))
      .sort((a, b) => rank(TOOL_ORDER, a.name) - rank(TOOL_ORDER, b.name)),

  schema: {
    types: schemaTypes,
    // Phase A: ready-made starting points for a new photo, clearance item and
    // question (src/sanity/templates.ts).
    templates: (prev) => [...prev, ...STARTING_TEMPLATES],
  },

  document: {
    // Status badges in her words (Sold / Needs a photo / Add a short
    // description for Google), after Sanity's own.
    badges: (prev) => [...prev, ...documentBadges],
    // Comments are a team feature; one editor only meets an extra icon.
    comments: { enabled: false },
    newDocumentOptions: (prev, { creationContext }) => {
      // 'global' is the "+ Create" menu in the top bar. Offer only the things
      // she makes, in the order she makes them.
      if (creationContext.type === 'global') {
        return CREATE_MENU.flatMap((id) => prev.filter((o) => o.templateId === id));
      }
      // 'document' is the "Create new" button inside a reference box (a menu
      // link, a photo's item type). Without this it offered "Create new Home
      // page", which makes a second, orphaned copy of a singleton under a
      // random id (fbcm Studio audit, 2026-09-26). Singletons are opened from
      // the desk by their fixed id, which does not go through this menu.
      if (creationContext.type === 'document') {
        return prev.filter((option) => !SINGLETON_TYPES.has(option.templateId));
      }
      return prev;
    },
    // Singleton rules, the Publish note, Undo and Redo: src/sanity/editorActions.ts.
    actions: (prev, { schemaType }) => withEditorActions(schemaType, prev),
  },
});

/** Position of a name in an ordering list; unknown names go last, in their order. */
function rank(order: string[], name: string): number {
  const i = order.indexOf(name);
  return i === -1 ? order.length : i;
}
