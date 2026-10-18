// Foundation, edit with care
// =============================================================================
// Sanity Studio configuration for MAS Monograms - loaded by the EMBEDDED /studio
// =============================================================================
// Moved here from studio/sanity.config.ts on 2026-08-28, when the nested studio/
// package was folded into this one (PORTS.md card 10). One node_modules, one
// copy of every module, which is what keeps the styled-components / @sanity/ui
// theme context intact: a nested studio package gives TWO module instances of
// styled-components, so the ThemeProvider mounted by one is invisible to
// useTheme in the other and the desk dies on its first custom-component render
// (styled-components error #18, then "Cannot read properties of undefined
// (reading 'v2')"). That was presacademy's 2026-08-26 production outage.
//
// The site owns the /studio page (src/pages/studio/index.astro, starter card
// 120: the tab title, the icons and a splash); astro.config.mjs serves this
// config to it through studioConfigModule(). The sanity CLI (sanity.cli.ts)
// uses it for typegen and dataset commands. There is no hosted Studio.
//
// MARY ANN'S STUDIO. Built for one non-technical editor on 2026-10-05 (PR #85,
// docs/superpowers/specs/2026-10-05-studio-direction.md) and moved onto the
// family's shared Studio kit on 2026-10-18 (starter PORTS.md cards 106 to 120).
// The kit gives her Home, the Checkup, the Site Guide, Trash, the status line,
// "Help for this page" and the first-run tour; her own pieces stay: the
// handbook inside the Site Guide, the QR tool, the brand kit, plain tool
// names, the larger type, one publishing model (no Releases, no scheduling),
// a Create menu with only the things she makes, Undo/Redo, "Copy a link...",
// badges, the Google preview and the locked addresses. Where each old piece
// went: .claude/rules/sanity-studio.md.

import { defineConfig, definePlugin } from 'sanity';
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
import { StudioIcon } from './src/sanity/components/StudioIdentity';
import { seedLightScheme } from './src/sanity/studioTheme';
import { buildReadableStudioTheme } from './src/sanity/readableTheme';
import {
  studioLook,
  StudioWordmarkNavbar,
  withEditorTypography,
} from './src/sanity/components/StudioLook';
import { studioWording } from './src/sanity/studioWording';
import { studioEdges } from './src/sanity/studioEdges.config';
// The site's own font files for the Studio (card 116).
import './src/sanity/studioFonts.css';
import brand from './brand/brand.config.json';
import { CharacterCountInput } from './src/sanity/components/CharacterCountInput';
import { documentBadges } from './src/sanity/components/documentBadges';
import { undoRedoShortcuts } from './src/sanity/components/UndoRedo';
import { SINGLETON_TYPES, withEditorActions } from './src/sanity/editorActions';
import { NOTICE_TEMPLATES, SEASON_TEMPLATES, STARTING_TEMPLATES } from './src/sanity/templates';
import { QrCodeTool } from './src/sanity/components/QrCodeTool';
import { BrandKitTool } from './src/sanity/components/BrandKitPane';
import { HelpPane } from './src/sanity/components/HelpPane';
import { ncsStudioKit } from './src/sanity/kit';
import { kitConfig } from './src/sanity/kit.config';
import { ncsWorkflowTools } from './src/sanity/workflow';
import { brandIcon, brandIcons, withBrandPreviews } from './src/sanity/brandIcons';

// =============================================================================
// Studio theme
// =============================================================================
// The kit's theme from brand/brand.config.json (cards 110 and 116): a warm
// paper, the Heritage Indigo accent, re-hued greys, the site's radius, the
// Indigo Deep top bar (StudioLook.tsx), with Mary Ann's larger type on top
// (src/sanity/readableTheme.ts). Light is the default for a first visit
// (seedLightScheme): the site itself has no dark mode.
//
// The families go INTO buildTheme({ font }); the font files load from
// src/sanity/studioFonts.css, imported above. Kept as one-line literals to
// match the rest of the family (apply-brand is not run on this repo).
const DISPLAY_STACK = '"Fraunces Variable", Georgia, "Times New Roman", serif';
const BODY_STACK = '"Mulish Variable", system-ui, -apple-system, sans-serif';
const STUDIO_FONTS = { display: DISPLAY_STACK, body: BODY_STACK };

const studioTheme = buildReadableStudioTheme(STUDIO_FONTS);
seedLightScheme();

// Her words on Sanity's own screens: the sign-in line, the signed-out notice,
// the user menu (card 120).
const wording = studioWording(brand.name, studioEdges);

// Dev detection must FAIL CLOSED. The Astro/Vite client bundle injects
// `globalThis.process ??= {}`, so `process.env.NODE_ENV !== 'production'` is
// true IN PRODUCTION and would ship the Vision GROQ console to Mary Ann. Test
// positively for dev instead. (Fixed 2026-08-28.)
const IS_DEV =
  (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

/**
 * Her own two tools (Phase E and F), registered BEFORE the kit so its tool
 * order and staff view place them. Both run fully in the browser on files
 * served by the site itself, so the Studio CSP needs nothing new.
 */
const masTools = definePlugin({
  name: 'mas-tools',
  tools: (prev) => [
    ...prev,
    { name: 'qr-codes', title: 'Make a QR code', icon: brandIcon('link'), component: QrCodeTool },
    {
      name: 'brand-kit',
      title: 'My brand kit',
      icon: brandIcon('download'),
      component: BrandKitTool,
    },
  ],
});

/**
 * The Site Guide shows HER handbook (HelpPane: five quick answers, search,
 * guides by topic with the "can I do this myself?" badge, "Take me there"
 * cards, See also, Print). The kit's own guide list is a plainer view of the
 * same guides, so the handbook stands in for it; Home's "Site Guide" and "How
 * do I...?" buttons and "Help for this page" all still lead here. After the
 * kit, so the kit's tool exists to be swapped.
 */
const masSiteGuide = definePlugin({
  name: 'mas-site-guide',
  tools: (prev) => prev.map((t) => (t.name === 'site-guide' ? { ...t, component: HelpPane } : t)),
});

/**
 * The only things the global "+ Create" menu offers, in this order (Phase A;
 * the notices and season pages joined on 2026-10-18).
 * The three she makes most start from a template (src/sanity/templates.ts).
 */
const CREATE_MENU = [
  'new-photo',
  'new-clearance-item',
  'new-question',
  // The seasons of her shop (2026-10-18): the notices and the season pages.
  ...NOTICE_TEMPLATES,
  ...SEASON_TEMPLATES,
  'pricingTier',
  'font',
  'threadColor',
  'itemCategory',
];

export default defineConfig({
  name: 'mas-monograms-studio',
  // The site's own name and mark (card 110): `title` is brand.config.json
  // `name`, the icon is public/favicon.svg (the Hoop Seal).
  title: brand.name,
  icon: StudioIcon,
  subtitle: wording.subtitle,
  i18n: { bundles: wording.bundles },
  // The wordmark beside the icon. At the ROOT on purpose: the root's
  // middleware sits innermost, right around Sanity's bar (StudioLook.tsx).
  studio: { components: { navbar: StudioWordmarkNavbar } },

  projectId:
    envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID') || 'placeholder-project-id',
  dataset: envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production',

  theme: studioTheme,

  // Phase A: ONE publishing model, the Publish button. Releases, scheduled
  // drafts and scheduled publishing are a second, confusing way to do the same
  // thing for one editor whose site rebuilds on every publish. Tasks and
  // comments are team features; "What's new" is Sanity's product news.
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
    // (src/sanity/resolve.ts and src/pages/preview/). previewMode only sets
    // `enable`; exiting is a plain link to /api/draft-mode/disable. REQUIRES the
    // SANITY_TOKEN (or SANITY_API_READ_TOKEN) runtime secret; without it the
    // preview routes fail closed with a 503 naming what is missing.
    presentationTool({
      resolve,
      previewUrl: {
        initial: '/preview',
        previewMode: { enable: '/api/draft-mode/enable/' },
      },
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
    // Vision (the GROQ query runner) is a developer tool: local dev only.
    ...(IS_DEV ? [visionTool()] : []),
    // Ctrl+Z / Ctrl+Shift+Z for everything that is not typing (PORTS.md card
    // 27). The buttons are document actions (src/sanity/editorActions.ts).
    undoRedoShortcuts(),
    // The Indigo Deep top bar (StudioLook.tsx, card 116).
    studioLook(STUDIO_FONTS),
    // Her QR tool and brand kit, before the kit so it can order them.
    masTools(),
    // Messages (quote requests, once the D1 inbox is switched on) and the table
    // panes (card 117). No "Share a preview" here: she already has "Copy a
    // link..." (src/sanity/actions/shareLink.tsx), see docs/PENDING.md.
    ncsWorkflowTools({ shareTypes: [] }),
    // The Studio kit (src/sanity/kit/, settings in src/sanity/kit.config.ts).
    // KEEP IT LAST of the tool plugins: its tools reducer orders every tool and
    // applies the staff view. See docs/agent/studio-kit.md.
    ncsStudioKit(kitConfig),
    // The Site Guide shows her handbook (see masSiteGuide above).
    masSiteGuide(),
    // Icons by meaning on every tool and plugin type (card 119). After the kit.
    brandIcons(),
  ],

  schema: {
    // Portable Text styles drawn in the site's fonts (card 116); every document
    // type gets its icon and a picture in list rows (card 119).
    types: withBrandPreviews(withEditorTypography(schemaTypes, STUDIO_FONTS)),
    // Phase A: ready-made starting points for a new photo, clearance item and
    // question (src/sanity/templates.ts).
    templates: (prev) => [...prev, ...STARTING_TEMPLATES],
  },

  document: {
    // Status badges in her words (Sold / Needs a photo / Add a short
    // description for Google), after Sanity's own.
    badges: (prev) => [...prev, ...documentBadges],
    comments: { enabled: false },
    newDocumentOptions: (prev, { creationContext }) => {
      // 'global' is the "+ Create" menu in the top bar: only what she makes.
      if (creationContext.type === 'global') {
        return CREATE_MENU.flatMap((id) => prev.filter((o) => o.templateId === id));
      }
      // 'document' is "Create new" inside a reference box: never a second copy
      // of a singleton (fbcm Studio audit, 2026-09-26).
      if (creationContext.type === 'document') {
        return prev.filter((option) => !SINGLETON_TYPES.has(option.templateId));
      }
      return prev;
    },
    // Singleton rules, Undo, Redo and "Copy a link...": src/sanity/editorActions.ts.
    // The kit (a plugin, so it runs first) has already added the note after
    // Publish and Move to Trash.
    actions: (prev, { schemaType }) => withEditorActions(schemaType, prev),
  },
});
