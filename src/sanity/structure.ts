// MAS Monograms Studio desk ("Edit my content").
//
// Rebuilt 2026-10-05 around Mary Ann's JOBS, not around the data (Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md, principle 1). Since
// 2026-10-18 the Studio opens on the shared kit's Home tool (big buttons, her
// weekly 15 minutes, the Fix-it list), which replaced the old Welcome pane;
// the Checkup and the Site Guide are top-bar tools.
//
//   My business details           phone, email, address, hours, menus, footer
//   Pages on my website           every page, as a visitor thinks of them,
//                                 with the legal pages INSIDE (no stray entry)
//   ─
//   Photos of my work             the gallery photos, in site order (drag)
//   Clearance and prices          clearance items and the price tags (drag)
//   Fonts, threads and categories the reference lists (fonts, categories drag)
//   Questions and answers         the FAQ (drag)
//   ─
//   Make a QR code                the QR tool (also in the top bar)
//   My brand kit                  logos, colors, fonts (also in the top bar)
//   My notes and ideas            her notes (studioNotes) and "Ideas to grow"
//   Trash (bring things back)     what "Move to Trash" took off (the kit's)
//
// THE ID RULE. Every pane has an explicit `.id()`, and the ids live in DESK
// (./studioTargets.ts) wherever anything links to them. A list item with no
// id gets one DERIVED FROM ITS TITLE, so a deep link to it silently opens the
// parent list instead, and rewording a title breaks every link to it. That bit
// Stone Steps on 2026-09-12 ("Race day (date, times, fees)" became
// `raceDayDateTimesFees`). With fixed ids, a title can change freely.
//
// Singletons are document list items with the document's own id, so a
// "Take me there" edit link for `homePage` lands on the Home page form, and
// the row shows the page's preview (its subtitle says where it lives).
//
// Preview: "Edit on the page" (the Presentation tool) is where she sees a page
// while she edits it; the desk forms are the fallback (spec principle 6).

import type {
  ListItem,
  ListItemBuilder,
  StructureBuilder,
  StructureResolverContext,
} from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { AddIcon } from '@sanity/icons/Add';
import type { ComponentType } from 'react';
import { DESK } from './studioTargets';
import { QrCodeTool } from './components/QrCodeTool';
import BusinessOverview from './components/BusinessOverview';
import { BrandKitPane } from './components/BrandKitPane';
import StudioPlaybook from './components/StudioPlaybook';
import { staffDesk } from './kit/shared';
import { emptyAwareList } from './kit/emptyList';
import { trashListItem } from './kit/trash';
import { kitConfig } from './kit.config';
import { brandIcon, typeIcon } from './brandIcons';
import { tableListItem } from './workflow';
import { TABLES } from './tables.config';
import { STAFF_TYPE, WEEK_TYPE } from '../lib/studio-kit';
import { TRASH_TYPE } from '../lib/studio-trash';
import { SHARE_RECORD_TYPE } from '../lib/preview-share';
import { NOTICE_TEMPLATES, SEASON_TEMPLATES } from './templates';

/**
 * Every type the desk places on purpose. The safety net at the bottom lists
 * anything NOT in here, so a type added later still shows up somewhere.
 */
const PLACED = new Set<string>([
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
  'atelierSettings',
  'legalPage',
  'galleryItem',
  'itemCategory',
  'font',
  'threadColor',
  'pricingTier',
  'clearanceItem',
  'faqItem',
  'collection',
  'announcement',
  'studioGuide',
  'studioNotes',
  'studioPlaybook',
  // What "Move to Trash" keeps, listed as "Trash (bring things back)".
  TRASH_TYPE,
  // The kit's weekly hand ticks and the preview-link records: never lists.
  WEEK_TYPE,
  // The kit's "Simple view" marks (card 175): written by the People tool only.
  STAFF_TYPE,
  SHARE_RECORD_TYPE,
]);

/** sanity-plugin-media's own types (tags, folders) belong in "My photo library". */
const isMediaType = (id: string) => id.startsWith('media.');

/**
 * One page (a singleton): the row shows the page's own preview and opens its
 * form. The id IS the document id, which is what makes edit links land here.
 */
function page(S: StructureBuilder, type: string): ListItemBuilder {
  return S.documentListItem().id(type).schemaType(type);
}

/** A list of one type, with its own pane id, sort and "+" starting point. */
function list(
  S: StructureBuilder,
  opts: {
    id: string;
    type: string;
    title: string;
    icon: ComponentType;
    newestFirst?: boolean;
    template?: string;
  },
): ListItemBuilder {
  let child = S.documentTypeList(opts.type).id(`${opts.id}-list`).title(opts.title);
  if (opts.newestFirst) {
    child = child.defaultOrdering([{ field: '_createdAt', direction: 'desc' }]);
  }
  if (opts.template) {
    child = child.initialValueTemplates([S.initialValueTemplateItem(opts.template)]);
  }
  return S.listItem()
    .id(opts.id)
    .title(opts.title)
    .icon(opts.icon)
    .schemaType(opts.type)
    .child(child);
}

/** Her words at the top of every drag-to-reorder list. */
export const DRAG_HINT = 'drag to put them in the order you want';

/**
 * Phase D: a list she puts in order by dragging (@sanity/orderable-document-list
 * 2.0.9), replacing the typed "Position" numbers. The plugin writes `orderRank`
 * (a LexoRank string) on the published copy straight away, so a drag reaches
 * the website on the next rebuild without a Publish (the "Rebuild live site"
 * webhook fires on any published change). The site orders by
 * `orderRank asc, displayOrder asc` (src/lib/queries.ts), so the old numbers
 * still decide anything that has no rank.
 *
 * The plugin's own header menu is replaced: "Reset Order" (re-numbers every
 * item from scratch) and "Toggle Increments" (shows the rank strings) are
 * developer tools that could scramble her order, and its "Create new ..."
 * entry ignores the starting templates. What is left is one "+" button that
 * starts from the same template as the global Create menu.
 */
function dragList(
  S: StructureBuilder,
  context: StructureResolverContext,
  opts: {
    id: string;
    type: string;
    title: string;
    icon: ComponentType;
    template?: string;
    addLabel: string;
  },
): ListItem {
  const item = orderableDocumentListDeskItem({
    type: opts.type,
    id: opts.id,
    title: opts.title,
    icon: opts.icon,
    S,
    context,
  });
  const child = item.child as unknown as Record<string, unknown>;
  child.title = `${opts.title}: ${DRAG_HINT}`;
  child.menuItems = [
    S.menuItem()
      .title(opts.addLabel)
      .icon(AddIcon)
      .intent({
        type: 'create',
        params: opts.template ? { type: opts.type, template: opts.template } : { type: opts.type },
      })
      .showAsAction(true)
      .serialize(),
  ];
  return item;
}

/** One table pane per entry in tables.config.ts for this type (beside the normal list). */
const tablesFor = (S: StructureBuilder, type: string) =>
  TABLES.filter((t) => t.type === type).map((t) => tableListItem(S, t));

// The staff view (Mary Ann) hides the panes in kitConfig.staffHiddenPanes
// (src/sanity/kit/shared.tsx, staffDesk); everyone else sees all of it.
export const deskStructure = (S: StructureBuilder, context: StructureResolverContext) =>
  staffDesk(fullDesk(S, context), context, kitConfig);

const fullDesk = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .id('root')
    .title('MAS Monograms')
    .items([
      // ── My business details ─────────────────────────────────────────────────
      // Phone, email, address, hours, socials, menus and footer: siteSettings.
      // The Welcome card "Change my phone number or email" opens this form on
      // the phone box.
      S.listItem()
        .id(DESK.business)
        .title('My business details')
        .icon(typeIcon('siteSettings'))
        .child(
          S.document()
            .id(DESK.business)
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('My business details')
            .views([S.view.form()]),
        ),

      // ── Pages on my website ─────────────────────────────────────────────────
      // Grouped the way a visitor meets them: the main pages in menu order,
      // then the guides customers browse, the clearance page, and the pages
      // people only see now and then. The legal pages are here too (they used
      // to float at the desk root as "Legal / Policy Page").
      S.listItem()
        .id(DESK.pages)
        .title('Pages on my website')
        .icon(brandIcon('pages'))
        .child(
          S.list()
            .id('pages-list')
            .title('Pages on my website')
            .items([
              page(S, 'homePage'),
              page(S, 'shopIndexPage'),
              page(S, 'styleGalleryPage'),
              page(S, 'pricingPage'),
              page(S, 'howItWorksPage'),
              page(S, 'aboutPage'),
              page(S, 'requestAQuotePage'),
              S.divider().title('Guides for your customers'),
              page(S, 'fontGuidePage'),
              page(S, 'threadChartPage'),
              page(S, 'atelierSettings'),
              S.divider().title('Clearance'),
              page(S, 'clearancePage'),
              S.divider().title('Pages people see now and then'),
              page(S, 'thankYouPage'),
              page(S, 'notFoundPage'),
              emptyAwareList(S, context, {
                id: DESK.legal,
                type: 'legalPage',
                title: 'Privacy, terms and other legal pages',
                icon: typeIcon('legalPage'),
                explain:
                  'Your privacy policy and any other legal pages. Adding a new one is a job for Nathan.',
              }),
            ]),
        ),

      S.divider(),

      // ── Photos of my work ───────────────────────────────────────────────────
      // Phase D: in the order the Style Gallery shows them (favorites still go
      // first on the site), and she drags a row to move a photo. A new photo
      // starts at the END, as it did with the old "99" position. Each row shows
      // the photo itself and its words (galleryItem's preview).
      dragList(S, context, {
        id: DESK.photos,
        type: 'galleryItem',
        title: 'Photos of my work',
        icon: typeIcon('galleryItem'),
        template: 'new-photo',
        addLabel: 'Add a photo of my work',
      }),

      // ── Clearance and prices ────────────────────────────────────────────────
      S.listItem()
        .id(DESK.clearance)
        .title('Clearance and prices')
        .icon(typeIcon('clearanceItem'))
        .child(
          S.list()
            .id('clearance-and-prices-list')
            .title('Clearance and prices')
            .items([
              dragList(S, context, {
                id: DESK.clearanceItems,
                type: 'clearanceItem',
                title: 'Clearance items for sale',
                icon: typeIcon('clearanceItem'),
                template: 'new-clearance-item',
                addLabel: 'Add a clearance item',
              }),
              ...tablesFor(S, 'clearanceItem'),
              dragList(S, context, {
                id: DESK.priceTags,
                type: 'pricingTier',
                title: 'Price tags on the Pricing page',
                icon: typeIcon('pricingTier'),
                addLabel: 'Add a price tag',
              }),
              ...tablesFor(S, 'pricingTier'),
            ]),
        ),

      // ── Fonts, threads and categories ───────────────────────────────────────
      S.listItem()
        .id(DESK.reference)
        .title('Fonts, threads and categories')
        .icon(typeIcon('threadColor'))
        .child(
          S.list()
            .id('fonts-threads-categories-list')
            .title('Fonts, threads and categories')
            .items([
              dragList(S, context, {
                id: DESK.fonts,
                type: 'font',
                title: 'Embroidery fonts',
                icon: typeIcon('font'),
                addLabel: 'Add a font',
              }),
              // NOT draggable: the Thread Color Chart sorts the colors by hue in
              // code (src/components/thread/threadData.ts, sortThreads), so a
              // dragged order would never show on the site.
              list(S, {
                id: DESK.threads,
                type: 'threadColor',
                title: 'Thread colors',
                icon: typeIcon('threadColor'),
              }),
              // Draggable (the order of the Shop by Item cards and the home page
              // circles); making or removing a category is still a job for Nathan.
              dragList(S, context, {
                id: DESK.categories,
                type: 'itemCategory',
                title: 'Shop categories (Hats, Totes...)',
                icon: typeIcon('itemCategory'),
                addLabel: 'Add a shop category',
              }),
            ]),
        ),

      // ── Questions and answers ───────────────────────────────────────────────
      dragList(S, context, {
        id: DESK.questions,
        type: 'faqItem',
        title: 'Questions and answers',
        icon: typeIcon('faqItem'),
        template: 'new-question',
        addLabel: 'Add a question',
      }),

      // ── The seasons of her shop (2026-10-18) ────────────────────────────────
      // Gift guides and season pages (/collections/<address>/), newest first,
      // with a "+" that offers one starting point per season; and the notices
      // across the top of every page, ending soonest first.
      emptyAwareList(S, context, {
        id: DESK.collections,
        type: 'collection',
        title: 'Gift guides and seasons',
        icon: typeIcon('collection'),
        explain:
          'A page of your work for one season or occasion: a Christmas gift guide, wedding season, graduation, back to school. Each starts from a ready-made page with your words to fill in.',
        createLabel: 'Make the first one',
        list: (S) =>
          S.documentTypeList('collection')
            .id('collections-list')
            .title('Gift guides and seasons')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
            .initialValueTemplates(SEASON_TEMPLATES.map((id) => S.initialValueTemplateItem(id))),
      }),
      emptyAwareList(S, context, {
        id: DESK.notices,
        type: 'announcement',
        title: 'Notices across the top',
        icon: typeIcon('announcement'),
        explain:
          'A short line across the top of every page: an order-by date for a holiday, new clearance items, or a week away. It comes down by itself after its last day.',
        createLabel: 'Put up the first one',
        list: (S) =>
          S.documentTypeList('announcement')
            .id('notices-list')
            .title('Notices across the top')
            .defaultOrdering([{ field: 'endDate', direction: 'asc' }])
            .initialValueTemplates(NOTICE_TEMPLATES.map((id) => S.initialValueTemplateItem(id))),
      }),

      S.divider(),

      // ── Make a QR code (Phase E) ────────────────────────────────────────────
      // The same tool as the top bar's "Make a QR code", in the menu too.
      S.listItem()
        .id(DESK.qrCodes)
        .title('Make a QR code')
        .icon(brandIcon('link'))
        .child(S.component(QrCodeTool).id('qr-codes-pane').title('Make a QR code')),

      // ── My brand kit (Phase F) ──────────────────────────────────────────────
      // Logos, social pictures, printables, colors, fonts and voice, with big
      // download buttons (also the top-bar tool 'brand-kit'). It replaced the
      // old static "Your brand colors and fonts" panel under Help.
      S.listItem()
        .id(DESK.brandKit)
        .title('My brand kit')
        .icon(brandIcon('download'))
        .child(S.component(BrandKitPane).id('brand-kit-pane').title('My brand kit')),

      // ── My notes and ideas ──────────────────────────────────────────────────
      // Her own notes (with the "Who to ask for help" box the Site Guide reads)
      // and Nathan's "Ideas to grow your studio". They lived under the old Help
      // item, which the Site Guide tool replaced on 2026-10-18.
      S.listItem()
        .id(DESK.notesAndIdeas)
        .title('My notes and ideas')
        .icon(typeIcon('studioNotes'))
        .child(
          S.list()
            .id('notes-and-ideas-list')
            .title('My notes and ideas')
            .items([
              S.listItem()
                .id(DESK.notes)
                .title('My notes')
                .icon(typeIcon('studioNotes'))
                .child(
                  S.document()
                    .id(DESK.notes)
                    .schemaType('studioNotes')
                    .documentId('studioNotes')
                    .title('My notes')
                    .views([
                      S.view.component(BusinessOverview).id('overview').title('Overview'),
                      S.view.form().id('edit').title('Edit notes'),
                    ]),
                ),
              S.listItem()
                .id('studioPlaybook')
                .title('Ideas to grow your studio')
                .icon(typeIcon('studioPlaybook'))
                .child(
                  S.document()
                    .id('studioPlaybook')
                    .schemaType('studioPlaybook')
                    .documentId('studioPlaybook')
                    .views([
                      S.view.component(StudioPlaybook).id('guides').title('Guides'),
                      S.view.form().id('edit').title('Edit'),
                    ]),
                ),
            ]),
        ),

      // ── Trash (Phase D) ─────────────────────────────────────────────────────
      // Everything "Move to Trash" took off the website, the most recent first.
      // Open one and press "Bring it back". "Delete forever" is only here, and
      // asks twice. No "+" button: things only arrive here from Move to Trash.
      // An empty Trash shows a page of its own instead of a bare list (card 146).
      trashListItem(S, context, brandIcon('trash')),

      // ── Safety net ──────────────────────────────────────────────────────────
      // Any type NOT placed above surfaces here under its own (plain) schema
      // title, so a type added later is never unreachable. Empty today.
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() as string;
        return !PLACED.has(id) && !isMediaType(id);
      }),
    ]);
