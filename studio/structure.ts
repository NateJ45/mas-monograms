// MAS Monograms Studio desk structure.
// Every document type is placed explicitly so nothing floats loose at the
// desk root. Pages = all singletons; Content = all reusable collections.
// The trailing default-list filter is a safety net for unplaced types.

import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import { Iframe, urlForDoc } from './sanity.config';
import {
  CogIcon,
  HomeIcon,
  UserIcon,
  PackageIcon,
  HelpCircleIcon,
  InfoOutlineIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ThListIcon,
  TagIcon,
  PresentationIcon,
  ThumbsUpIcon,
  ColorWheelIcon,
  RocketIcon,
  ImagesIcon,
  TextIcon,
  PinIcon,
  SparklesIcon,
  ControlsIcon,
  BillIcon,
} from '@sanity/icons';
import StudioGuide from './components/StudioGuide';
import BusinessOverview from './components/BusinessOverview';
import BrandKit from './components/BrandKit';
import StudioPlaybook from './components/StudioPlaybook';

const SINGLETON_TYPES = [
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
] as const;

const HIDDEN_FROM_DEFAULT = new Set<string>([
  ...SINGLETON_TYPES,
  // Content collections explicitly placed in the Content section
  'galleryItem',
  'itemCategory',
  'font',
  'threadColor',
  'pricingTier',
  'clearanceItem',
  'faqItem',
  // Start Here helper documents explicitly placed in the Start Here section
  'studioGuide',
  'studioNotes',
  'studioPlaybook',
  // sanity-plugin-media internal type — belongs in the Media tool, not the desk root
  'media.tag',
]);

function singletonWithPreview(
  S: StructureBuilder,
  schemaType: string,
  title: string,
  icon: any,
) {
  const hasPreview = urlForDoc(schemaType, {}) !== null;
  const views = [
    S.view.form(),
    ...(hasPreview
      ? [
          S.view
            .component(Iframe)
            .options({
              url: (doc: any) => urlForDoc(schemaType, doc) ?? '',
              reload: { button: true },
              defaultSize: 'desktop',
            })
            .title('Preview'),
        ]
      : []),
  ];

  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.document()
        .schemaType(schemaType)
        .documentId(schemaType)
        .views(views),
    );
}

export const deskStructure = (S: StructureBuilder, _context: StructureResolverContext) =>
  S.list()
    .title('MAS Monograms')
    .items([
      // Start Here — handbook for Mary Ann. First item so it's always visible.
      S.listItem()
        .title('Start Here')
        .icon(InfoOutlineIcon)
        .child(
          S.list()
            .title('Start Here')
            .items([
              S.listItem()
                .title('How the website works')
                .icon(PresentationIcon)
                .child(
                  S.document()
                    .schemaType('studioGuide')
                    .documentId('studioGuide')
                    .views([
                      S.view.component(StudioGuide).title('Guide'),
                      S.view.form().title('Edit'),
                    ]),
                ),
              S.listItem()
                .title('Your business at a glance')
                .icon(ThumbsUpIcon)
                .child(
                  S.document()
                    .schemaType('studioNotes')
                    .documentId('studioNotes')
                    .views([
                      S.view.component(BusinessOverview).title('Overview'),
                      S.view.form().title('Edit notes'),
                    ]),
                ),
              S.listItem()
                .title('Brand kit')
                .icon(ColorWheelIcon)
                .child(S.component(BrandKit).title('Brand kit')),
              S.listItem()
                .title('Grow your studio')
                .icon(RocketIcon)
                .child(
                  S.document()
                    .schemaType('studioPlaybook')
                    .documentId('studioPlaybook')
                    .views([
                      S.view.component(StudioPlaybook).title('Guides'),
                      S.view.form().title('Edit'),
                    ]),
                ),
            ]),
        ),

      S.divider(),

      // Site Settings — global identity, SEO defaults, social links, contact info
      singletonWithPreview(S, 'siteSettings', 'Site Settings', CogIcon),

      S.divider(),

      // Pages — every page singleton lives here.
      S.listItem()
        .title('Pages')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              singletonWithPreview(S, 'homePage', 'Home', HomeIcon),
              singletonWithPreview(S, 'howItWorksPage', 'How It Works', ControlsIcon),
              singletonWithPreview(S, 'pricingPage', 'Pricing', BillIcon),
              singletonWithPreview(S, 'aboutPage', 'About', UserIcon),
              singletonWithPreview(S, 'requestAQuotePage', 'Request a Quote', EnvelopeIcon),

              S.divider(),

              singletonWithPreview(S, 'shopIndexPage', 'Shop by Item', PackageIcon),
              singletonWithPreview(S, 'styleGalleryPage', 'Style Gallery', ImagesIcon),
              singletonWithPreview(S, 'fontGuidePage', 'Font & Lettering Guide', TextIcon),
              singletonWithPreview(S, 'threadChartPage', 'Thread Color Chart', ColorWheelIcon),

              S.divider(),

              singletonWithPreview(S, 'clearancePage', 'Clearance', TagIcon),
              singletonWithPreview(S, 'thankYouPage', 'Thank You', SparklesIcon),
              singletonWithPreview(S, 'notFoundPage', '404 Page', HelpCircleIcon),
            ]),
        ),

      S.divider(),

      // Content — all reusable collections Mary Ann edits regularly.
      S.listItem()
        .title('Content')
        .icon(ThListIcon)
        .child(
          S.list()
            .title('Content')
            .items([
              // Item categories define the /[slug] pages and the Shop by Item grid
              S.documentTypeListItem('itemCategory').title('Item Categories').icon(PackageIcon),

              S.divider(),

              // Embroidery fonts — each has a name, preview image, and style tags
              S.documentTypeListItem('font').title('Embroidery Fonts').icon(TextIcon),
              // Thread colors — name, hex, DMC number, image swatch
              S.documentTypeListItem('threadColor').title('Thread Colors').icon(ColorWheelIcon),

              S.divider(),

              // Style gallery images
              S.documentTypeListItem('galleryItem').title('Style Gallery').icon(ImagesIcon),

              S.divider(),

              // Pricing — tiers (price per piece per quantity bracket)
              S.documentTypeListItem('pricingTier').title('Pricing Tiers').icon(BillIcon),

              S.divider(),

              // Clearance items — each links to its own Stripe Payment Link
              S.documentTypeListItem('clearanceItem').title('Clearance Items').icon(TagIcon),

              S.divider(),

              // SEO helper: per-category FAQ items
              S.documentTypeListItem('faqItem').title('FAQ Items').icon(HelpCircleIcon),
            ]),
        ),

      // Safety net — any type not explicitly placed above surfaces here
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_DEFAULT.has(item.getId() as string),
      ),
    ]);
