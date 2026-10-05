// MAS Monograms Studio desk ("Edit my content").
//
// Rebuilt 2026-10-05 around Mary Ann's JOBS, not around the data (Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md, principle 1):
//
//   Welcome                       the landing pane: big task cards (WelcomePane)
//   Help (how do I...?)           quick answers + the handbook (./guides), My notes
//   What needs attention          the read-only checkup (src/lib/studio-checkup.ts)
//   ─
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
//   Trash (bring things back)     what "Move to Trash" took off (Phase D)
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
import {
  ActivityIcon,
  AddIcon,
  BillIcon,
  CogIcon,
  ColorWheelIcon,
  DocumentTextIcon,
  DocumentsIcon,
  HelpCircleIcon,
  HomeIcon,
  ImagesIcon,
  InfoOutlineIcon,
  PackageIcon,
  RocketIcon,
  TagIcon,
  TextIcon,
  ThumbsUpIcon,
  ThListIcon,
  TrashIcon,
} from '@sanity/icons';
import type { ComponentType } from 'react';
import { DESK } from './studioTargets';
import { WelcomePane } from './components/WelcomePane';
import { HelpPane } from './components/HelpPane';
import { CheckupTool } from './components/CheckupTool';
import { QrCodeTool, QrIcon } from './components/QrCodeTool';
import BusinessOverview from './components/BusinessOverview';
import { BrandKitPane } from './components/BrandKitPane';
import StudioPlaybook from './components/StudioPlaybook';

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
  'studioGuide',
  'studioNotes',
  'studioPlaybook',
  // Phase D: what "Move to Trash" keeps, listed as "Trash (bring things back)".
  'trashedItem',
  // System types that must never sit at the desk root: sanity-plugin-media's
  // tags belong in "My photo library".
  'media.tag',
]);

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

export const deskStructure = (S: StructureBuilder, context: StructureResolverContext) =>
  S.list()
    .id('root')
    .title('MAS Monograms')
    .items([
      // ── Welcome ─────────────────────────────────────────────────────────────
      // The landing pane. StudioLayout opens it whenever the desk is empty, so
      // it is the first thing she sees.
      S.listItem()
        .id(DESK.welcome)
        .title('Welcome')
        .icon(HomeIcon)
        .child(S.component(WelcomePane).id('welcome-pane').title('Welcome')),

      // ── Help ────────────────────────────────────────────────────────────────
      // Phase B replaces the short answers with the full handbook. The older
      // Start Here guides stay reachable here so nothing she had is lost; they
      // are labelled honestly, because parts of them describe the old Studio.
      S.listItem()
        .id(DESK.help)
        .title('Help (how do I...?)')
        .icon(HelpCircleIcon)
        .child(
          S.list()
            .id('help-list')
            .title('Help')
            .items([
              // Phase B: the handbook (quick answers, guides by topic, search,
              // print). The guides are repo data in ./guides.
              S.listItem()
                .id(DESK.helpGuides)
                .title('Guides and quick answers')
                .icon(HelpCircleIcon)
                .child(S.component(HelpPane).id('help-guides-pane').title('How do I...?')),
              // Her own notes, and the "Who to ask for help" box the Help page reads.
              S.listItem()
                .id(DESK.notes)
                .title('My notes')
                .icon(ThumbsUpIcon)
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
              // The old "How the website works" guide (studioGuide) is no longer
              // listed: the guides above replace it, and parts of it were false
              // (a removed Preview tab, "live within a few seconds"). The
              // document is kept, never deleted, and stays in PLACED so the
              // safety net does not list it. The one below stays until the
              // "Get found" guides replace it. (The old brand colors and fonts
              // panel is gone: "My brand kit" at the desk root absorbed it.)
              S.divider().title('Older pages (being replaced)'),
              S.listItem()
                .id('studioPlaybook')
                .title('Ideas to grow your studio')
                .icon(RocketIcon)
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

      // ── What needs attention ────────────────────────────────────────────────
      // Phase B: the read-only checkup (also a top-bar tool, 'checkup').
      S.listItem()
        .id(DESK.checkup)
        .title('What needs attention')
        .icon(ActivityIcon)
        .child(S.component(CheckupTool).id('checkup-pane').title('What needs attention')),

      S.divider(),

      // ── My business details ─────────────────────────────────────────────────
      // Phone, email, address, hours, socials, menus and footer: siteSettings.
      // The Welcome card "Change my phone number or email" opens this form on
      // the phone box.
      S.listItem()
        .id(DESK.business)
        .title('My business details')
        .icon(CogIcon)
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
        .icon(DocumentTextIcon)
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
              list(S, {
                id: DESK.legal,
                type: 'legalPage',
                title: 'Privacy, terms and other legal pages',
                icon: DocumentsIcon,
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
        icon: ImagesIcon,
        template: 'new-photo',
        addLabel: 'Add a photo of my work',
      }),

      // ── Clearance and prices ────────────────────────────────────────────────
      S.listItem()
        .id(DESK.clearance)
        .title('Clearance and prices')
        .icon(TagIcon)
        .child(
          S.list()
            .id('clearance-and-prices-list')
            .title('Clearance and prices')
            .items([
              dragList(S, context, {
                id: DESK.clearanceItems,
                type: 'clearanceItem',
                title: 'Clearance items for sale',
                icon: TagIcon,
                template: 'new-clearance-item',
                addLabel: 'Add a clearance item',
              }),
              dragList(S, context, {
                id: DESK.priceTags,
                type: 'pricingTier',
                title: 'Price tags on the Pricing page',
                icon: BillIcon,
                addLabel: 'Add a price tag',
              }),
            ]),
        ),

      // ── Fonts, threads and categories ───────────────────────────────────────
      S.listItem()
        .id(DESK.reference)
        .title('Fonts, threads and categories')
        .icon(ThListIcon)
        .child(
          S.list()
            .id('fonts-threads-categories-list')
            .title('Fonts, threads and categories')
            .items([
              dragList(S, context, {
                id: DESK.fonts,
                type: 'font',
                title: 'Embroidery fonts',
                icon: TextIcon,
                addLabel: 'Add a font',
              }),
              // NOT draggable: the Thread Color Chart sorts the colors by hue in
              // code (src/components/thread/threadData.ts, sortThreads), so a
              // dragged order would never show on the site.
              list(S, {
                id: DESK.threads,
                type: 'threadColor',
                title: 'Thread colors',
                icon: ColorWheelIcon,
              }),
              // Draggable (the order of the Shop by Item cards and the home page
              // circles); making or removing a category is still a job for Nathan.
              dragList(S, context, {
                id: DESK.categories,
                type: 'itemCategory',
                title: 'Shop categories (Hats, Totes...)',
                icon: PackageIcon,
                addLabel: 'Add a shop category',
              }),
            ]),
        ),

      // ── Questions and answers ───────────────────────────────────────────────
      dragList(S, context, {
        id: DESK.questions,
        type: 'faqItem',
        title: 'Questions and answers',
        icon: InfoOutlineIcon,
        template: 'new-question',
        addLabel: 'Add a question',
      }),

      S.divider(),

      // ── Make a QR code (Phase E) ────────────────────────────────────────────
      // The same tool as the top bar's "Make a QR code", in the menu too.
      S.listItem()
        .id(DESK.qrCodes)
        .title('Make a QR code')
        .icon(QrIcon)
        .child(S.component(QrCodeTool).id('qr-codes-pane').title('Make a QR code')),

      // ── My brand kit (Phase F) ──────────────────────────────────────────────
      // Logos, social pictures, printables, colors, fonts and voice, with big
      // download buttons (also the top-bar tool 'brand-kit'). It replaced the
      // old static "Your brand colors and fonts" panel under Help.
      S.listItem()
        .id(DESK.brandKit)
        .title('My brand kit')
        .icon(ColorWheelIcon)
        .child(S.component(BrandKitPane).id('brand-kit-pane').title('My brand kit')),

      // ── Trash (Phase D) ─────────────────────────────────────────────────────
      // Everything "Move to Trash" took off the website, the most recent first.
      // Open one and press "Bring it back". "Delete forever" is only here, and
      // asks twice. No "+" button: things only arrive here from Move to Trash.
      S.listItem()
        .id(DESK.trash)
        .title('Trash (bring things back)')
        .icon(TrashIcon)
        .child(
          S.documentTypeList('trashedItem')
            .id('trash-list')
            .title('Trash: open one and press "Bring it back"')
            .defaultOrdering([{ field: 'deletedAt', direction: 'desc' }])
            .initialValueTemplates([])
            .canHandleIntent((intent) => intent === 'edit')
            .menuItems([]),
        ),

      // ── Safety net ──────────────────────────────────────────────────────────
      // Any type NOT placed above surfaces here under its own (plain) schema
      // title, so a type added later is never unreachable. Empty today.
      ...S.documentTypeListItems().filter((item) => !PLACED.has(item.getId() as string)),
    ]);
