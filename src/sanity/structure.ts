// MAS Monograms Studio desk ("Edit my content").
//
// Rebuilt 2026-10-05 around Mary Ann's JOBS, not around the data (Phase A of
// docs/superpowers/specs/2026-10-05-studio-direction.md, principle 1):
//
//   Welcome                       the landing pane: big task cards (WelcomePane)
//   Help (how do I...?)           short answers, plus the older Start Here guides
//   ─
//   My business details           phone, email, address, hours, menus, footer
//   Pages on my website           every page, as a visitor thinks of them,
//                                 with the legal pages INSIDE (no stray entry)
//   ─
//   Photos of my work             the gallery photos, newest first
//   Clearance and prices          clearance items and the price tags
//   Fonts, threads and categories the reference lists
//   Questions and answers         the FAQ
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

import type { ListItemBuilder, StructureBuilder, StructureResolverContext } from 'sanity/structure';
import {
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
  PresentationIcon,
  ThListIcon,
} from '@sanity/icons';
import type { ComponentType } from 'react';
import { DESK } from './studioTargets';
import { WelcomePane } from './components/WelcomePane';
import { HelpPane } from './components/HelpPane';
import StudioGuide from './components/StudioGuide';
import BusinessOverview from './components/BusinessOverview';
import BrandKit from './components/BrandKit';
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

export const deskStructure = (S: StructureBuilder, _context: StructureResolverContext) =>
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
              S.listItem()
                .id('help-answers')
                .title('How do I...? (short answers)')
                .icon(HelpCircleIcon)
                .child(S.component(HelpPane).id('help-answers-pane').title('How do I...?')),
              S.divider().title('Older guides (some parts are out of date)'),
              S.listItem()
                .id('studioGuide')
                .title('How the website works')
                .icon(PresentationIcon)
                .child(
                  S.document()
                    .id('studioGuide')
                    .schemaType('studioGuide')
                    .documentId('studioGuide')
                    .views([
                      S.view.component(StudioGuide).id('guide').title('Guide'),
                      S.view.form().id('edit').title('Edit'),
                    ]),
                ),
              S.listItem()
                .id('studioNotes')
                .title('Your business at a glance')
                .icon(ThumbsUpIcon)
                .child(
                  S.document()
                    .id('studioNotes')
                    .schemaType('studioNotes')
                    .documentId('studioNotes')
                    .views([
                      S.view.component(BusinessOverview).id('overview').title('Overview'),
                      S.view.form().id('edit').title('Edit notes'),
                    ]),
                ),
              S.listItem()
                .id('brand-kit')
                .title('Your brand colors and fonts')
                .icon(ColorWheelIcon)
                .child(S.component(BrandKit).id('brand-kit-pane').title('Brand kit')),
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
      // Newest first, so the photo she just added is at the top. Each row shows
      // the photo itself and its words (galleryItem's preview).
      list(S, {
        id: DESK.photos,
        type: 'galleryItem',
        title: 'Photos of my work',
        icon: ImagesIcon,
        newestFirst: true,
        template: 'new-photo',
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
              list(S, {
                id: DESK.clearanceItems,
                type: 'clearanceItem',
                title: 'Clearance items for sale',
                icon: TagIcon,
                newestFirst: true,
                template: 'new-clearance-item',
              }),
              list(S, {
                id: DESK.priceTags,
                type: 'pricingTier',
                title: 'Price tags on the Pricing page',
                icon: BillIcon,
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
              list(S, {
                id: DESK.fonts,
                type: 'font',
                title: 'Embroidery fonts',
                icon: TextIcon,
              }),
              list(S, {
                id: DESK.threads,
                type: 'threadColor',
                title: 'Thread colors',
                icon: ColorWheelIcon,
              }),
              list(S, {
                id: DESK.categories,
                type: 'itemCategory',
                title: 'Shop categories (Hats, Totes...)',
                icon: PackageIcon,
              }),
            ]),
        ),

      // ── Questions and answers ───────────────────────────────────────────────
      list(S, {
        id: DESK.questions,
        type: 'faqItem',
        title: 'Questions and answers',
        icon: InfoOutlineIcon,
        template: 'new-question',
      }),

      // ── Safety net ──────────────────────────────────────────────────────────
      // Any type NOT placed above surfaces here under its own (plain) schema
      // title, so a type added later is never unreachable. Empty today.
      ...S.documentTypeListItems().filter((item) => !PLACED.has(item.getId() as string)),
    ]);
