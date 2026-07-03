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
      singletonWithPreview(S, 'siteSettings', 'Business info & contact', CogIcon),

      S.divider(),

      // Pages — every page singleton lives here.
      S.listItem()
        .title('Website pages (edit the words)')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Website pages')
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

      // Photos & products — the collections Mary Ann adds to most often, ordered
      // by how frequently she touches them (photos first, admin last).
      S.listItem()
        .title('Photos & products')
        .icon(ThListIcon)
        .child(
          S.list()
            .title('Photos & products')
            .items([
              // The two most common "add something" tasks, up top.
              S.documentTypeListItem('galleryItem').title('Style gallery — photos of your work').icon(ImagesIcon),
              S.documentTypeListItem('clearanceItem').title('Clearance — ready-to-ship items').icon(TagIcon),

              S.divider(),

              // The shop pages (Hats, Totes, …) and their prices.
              S.documentTypeListItem('itemCategory').title('Shop categories (Hats, Totes…)').icon(PackageIcon),
              S.documentTypeListItem('pricingTier').title('Prices').icon(BillIcon),

              S.divider(),

              // Reference lists that change less often.
              S.documentTypeListItem('font').title('Embroidery fonts').icon(TextIcon),
              S.documentTypeListItem('threadColor').title('Thread colors').icon(ColorWheelIcon),
              S.documentTypeListItem('faqItem').title('FAQ — questions & answers').icon(HelpCircleIcon),
            ]),
        ),

      // Safety net — any type not explicitly placed above surfaces here
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_DEFAULT.has(item.getId() as string),
      ),
    ]);
