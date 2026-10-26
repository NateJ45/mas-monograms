// Safe to edit by hand
// =============================================================================
// The Studio kit's settings for MAS Monograms
// =============================================================================
// The ONE site-specific file for the shared kit in src/sanity/kit/ (which names
// no site and can go back to the starter unchanged). Everything Mary Ann reads
// on Home, in the Checkup and in the tour that is about HER shop lives here.
// Detail: docs/agent/studio-kit.md.
//
// Moved onto the kit 2026-10-18 from her own Studio of 2026-10-05 (PR #85).
// Where each of her pieces went:
//   Welcome pane and its ten cards  -> Home: the four big buttons below, "Your
//                                      pages", and the tools group
//   first-visit tour                -> tours in studio-tours.ts (her words)
//   "What needs attention"          -> the Checkup tool: the kit's generic
//                                      rules plus src/sanity/checkupRules.ts
//   "Help (how do I...?)"           -> the Site Guide tool, which still shows
//                                      her handbook (HelpPane, sanity.config.ts)
//   Move to Trash, Bring it back    -> the kit's Trash (same model, same words)
//   "Published, 2 to 3 minutes"     -> the kit's note after Publish and the
//                                      status line under the top bar
// The full map is in .claude/rules/sanity-studio.md.
//
// The repo is public: no private contacts here. Her email below is the one her
// website already shows to every visitor (and wrangler.jsonc carries). The help
// address comes from PUBLIC_STUDIO_HELP_EMAIL at build time.
// =============================================================================

import type { KitConfig } from './kit/types';
import { genericRules, type CheckupRule } from '../lib/studio-checkup';
import { MAS_RULES } from './checkupRules';
import { GUIDE_CATEGORIES, GUIDE_FOR_FIELD, GUIDES_FOR_TYPE, KIT_GUIDES } from './guides';
import { makeGuideView } from './components/GuideView';
import { envVal } from './urls';
import { DESK } from './studioTargets';
import { TOURS, WELCOME, WHATS_NEW } from './studio-tours';
import { brandIcon, typeIcon } from './brandIcons';
import {
  buildAwayNotice,
  buildDeadlineNotice,
  buildNotice,
  buildQuestion,
  buildWorkPhoto,
} from '../lib/quick-updates';

const PUBLISHED = '!(_id in path("drafts.**"))';

/** The pages with a Google description (seoDescription). The Thank You page is hidden from Google. */
const SEO_TYPES = [
  'homePage',
  'shopIndexPage',
  'styleGalleryPage',
  'pricingPage',
  'howItWorksPage',
  'aboutPage',
  'requestAQuotePage',
  'fontGuidePage',
  'threadChartPage',
  'clearancePage',
  'itemCategory',
  'legalPage',
  'collection',
];

const rules: CheckupRule[] = [
  ...genericRules({
    seoTypes: SEO_TYPES,
    // Her logo and the share pictures never need words.
    altExemptFields: ['logo', 'favicon', 'icon', 'logoImage', 'seoImage', 'ogImage'],
  }),
  ...MAS_RULES,
];

export const kitConfig: KitConfig = {
  siteName: 'your website',

  helper: {
    name: 'Nathan',
    email: envVal('PUBLIC_STUDIO_HELP_EMAIL'),
  },

  // Who gets the staff view (fewer tools, no Delete, no Drafts menu). Mary Ann
  // was invited as an Administrator, so she is listed here rather than left to
  // her role. Her email is public on her website already. Once she has accepted
  // the invitation, swap it for her Sanity user id (sanity.io/manage, Members).
  staff: ['mastone37@gmail.com'],

  staffTools: [
    'home',
    'quick-update',
    'structure',
    'presentation',
    'messages',
    'media',
    'site-guide',
    'checkup',
    'qr-codes',
    'brand-kit',
  ],
  toolOrder: [
    'home',
    'quick-update',
    'structure',
    'presentation',
    'messages',
    'media',
    'site-guide',
    'checkup',
    'qr-codes',
    'brand-kit',
  ],
  // Her words for the top bar since 2026-10-05, kept so nothing she learned
  // moves. Sanity-plugin-media has no title option, hence media here too.
  toolTitles: {
    structure: 'Edit my content',
    presentation: 'Edit on the page',
    media: 'My photo library',
  },

  // Desk items only a developer needs (ids from src/sanity/structure.ts).
  staffHiddenPanes: [],

  // The everyday lists whose Delete becomes "Move to Trash", in her words.
  // NOT here, on purpose: shop categories (a category IS a page on the website,
  // and adding or removing one is a job for Nathan), the legal pages, and the
  // page singletons (they cannot be deleted at all).
  trashTypes: {
    galleryItem: 'Photo of my work',
    clearanceItem: 'Clearance item',
    faqItem: 'Question and answer',
    pricingTier: 'Price tag',
    threadColor: 'Thread color',
    font: 'Embroidery font',
    collection: 'Gift guide or season page',
    announcement: 'Notice',
  },

  weekStartsOn: 1,
  // Her weekly fifteen minutes (the "Get found" 60-day plan): a new photo, the
  // clearance rack, the quote requests, one post. Content jobs tick themselves;
  // the rest she ticks by hand, on a small record per week.
  thisWeekTitle: 'My weekly 15 minutes',
  thisWeek: [
    {
      id: 'photo',
      title: 'Add a photo of something you made',
      detail: 'A new photo every week keeps your Style Gallery fresh, and Google notices.',
      query: `count(*[_type == "galleryItem" && ${PUBLISHED} && _createdAt >= $weekStart])`,
      target: { create: 'galleryItem', template: 'new-photo' },
      targetLabel: 'Add a photo',
    },
    {
      id: 'clearance',
      title: 'Mark anything that sold',
      detail: 'Any clearance item with none left gets Sold turned on, so its Buy button goes away.',
      query: `count(*[_type == "clearanceItem" && ${PUBLISHED} && sold != true && quantityAvailable == 0]) == 0`,
      target: { pane: `${DESK.clearance};${DESK.clearanceItems}` },
      targetLabel: 'Open my clearance items',
    },
    {
      id: 'quotes',
      title: 'Answer every quote request',
      detail:
        'Each one comes to your email, and Messages lists them too. Check this once everyone who asked this week has heard back.',
      manual: true,
      target: { tool: 'messages' },
      targetLabel: 'Open Messages',
    },
    {
      id: 'share',
      title: 'Share one photo on Facebook or Instagram',
      detail: 'Link it to your website, so people can ask for a quote.',
      manual: true,
    },
    {
      id: 'checkup',
      title: 'Checkup is clear',
      detail: 'Nothing in the Checkup marked "Needs doing".',
      check: 'checkup',
      target: { tool: 'checkup' },
      targetLabel: 'Open the Checkup',
    },
  ],

  // Quick update (card 111): the notices she puts up from her phone. Each
  // publishes straight away, so the builders in src/lib/quick-updates.ts
  // return whole, valid notices (tested in quick-updates.test.ts).
  quickUpdate: [
    // Card 137 jobs: change a thing that is already there. Each starts from
    // what is on the document now and writes the published copy straight away.
    {
      id: 'mark-sold',
      title: 'Mark a clearance item sold',
      detail: 'Pick the item that sold. Its Buy button goes away and it moves to the end.',
      icon: typeIcon('clearanceItem'),
      meaning: 'give',
      job: {
        kind: 'edit',
        pick: {
          type: 'clearanceItem',
          filter: 'sold != true',
          order: 'orderRank',
          titleField: 'name',
          label: 'Which one sold?',
        },
      },
      fields: [
        {
          name: 'sold',
          title: 'Sold',
          kind: 'boolean',
          description: 'Yes, it sold. Take the Buy button away.',
        },
        {
          name: 'quantityAvailable',
          title: 'How many are left',
          kind: 'number',
          description: 'Leave it as it is, or type 0 if none are left.',
        },
      ],
      submitLabel: 'Save it on my website',
      doneTitle: 'Marked as sold',
      doneMessage: 'The Buy button will be gone from your website in about 2 to 3 minutes.',
    },
    {
      id: 'change-price',
      title: 'Change a price',
      detail: 'Pick a price tag from your Pricing page and type the new price.',
      icon: typeIcon('pricingTier'),
      meaning: 'give',
      job: {
        kind: 'edit',
        pick: {
          type: 'pricingTier',
          order: 'orderRank',
          titleField: 'label',
          label: 'Which price tag?',
        },
      },
      fields: [
        {
          name: 'pricePerPiece',
          title: 'Price per piece, in dollars',
          kind: 'number',
          required: true,
          description: 'Just the number, for example 16 or 12.50.',
        },
      ],
      submitLabel: 'Save it on my website',
      doneTitle: 'Price changed',
      doneMessage: 'The new price will be on your Pricing page in about 2 to 3 minutes.',
    },
    {
      id: 'change-clearance-price',
      title: 'Change a clearance price',
      detail: 'Pick a clearance item that is still for sale and type its new sale price.',
      icon: typeIcon('clearanceItem'),
      meaning: 'give',
      job: {
        kind: 'edit',
        pick: {
          type: 'clearanceItem',
          filter: 'sold != true',
          order: 'orderRank',
          titleField: 'name',
          label: 'Which item?',
        },
      },
      fields: [
        {
          name: 'salePrice',
          title: 'Sale price, in dollars',
          kind: 'number',
          required: true,
          description: 'Just the number, for example 25 or 19.50.',
        },
        {
          name: 'originalPrice',
          title: 'Original price, in dollars',
          kind: 'number',
          description: 'Shown crossed out. Leave it empty to show only the sale price.',
        },
      ],
      submitLabel: 'Save it on my website',
      doneTitle: 'Price changed',
      doneMessage: 'The new price will be on your Clearance page in about 2 to 3 minutes.',
    },
    {
      id: 'quote-requests',
      title: 'See my quote requests',
      detail: 'Every request from your website, newest first. Mark each one Replied.',
      icon: brandIcon('contact'),
      meaning: 'message',
      job: { kind: 'link', target: { tool: 'messages' } },
    },
    {
      id: 'notice',
      title: 'Put up a notice',
      detail: 'A short line across the top of every page, until the day you pick.',
      icon: typeIcon('announcement'),
      // Card 131: the tile wears her own art. A notice is the hang tag on the shop door.
      meaning: 'give',
      fields: [
        {
          name: 'message',
          title: 'The notice',
          kind: 'text',
          required: true,
          max: 160,
          description: 'One or two short sentences, like "Order by December 1 for Christmas."',
        },
        { name: 'lastDay', title: 'Last day to show it', kind: 'date', required: true },
        {
          name: 'link',
          title: 'A link for more',
          kind: 'url',
          description: 'A full web address starting with https://, or leave it empty.',
        },
      ],
      submitLabel: 'Put it on my website',
      build: (v) =>
        buildNotice({ message: v.message, lastDay: v.lastDay, link: v.link || undefined }),
      doneMessage:
        'The notice will be on your website in about 2 to 3 minutes, and it comes down by itself after the day you picked.',
    },
    {
      id: 'deadline',
      title: 'Order deadline',
      detail:
        "The last day to order for Christmas, Mother's Day or a wedding. It is worded for you and comes down by itself.",
      icon: typeIcon('announcement'),
      // Card 131: the hang tag on the shop door, as for a notice.
      meaning: 'give',
      fields: [
        {
          name: 'occasion',
          title: 'What is it for?',
          kind: 'string',
          required: true,
          max: 40,
          description: `One or two words, like "Christmas" or "Mother's Day".`,
        },
        { name: 'lastOrderDay', title: 'Last day to order', kind: 'date', required: true },
        {
          name: 'message',
          title: 'Your own words',
          kind: 'text',
          max: 160,
          description:
            'Leave it empty for "Order by <the day> to have it in time for <the occasion>."',
        },
      ],
      submitLabel: 'Put it on my website',
      build: (v) =>
        buildDeadlineNotice({
          occasion: v.occasion,
          lastOrderDay: v.lastOrderDay,
          message: v.message || undefined,
        }),
      doneMessage:
        'The deadline will be across the top of your website in about 2 to 3 minutes, and it comes down by itself after the last day to order.',
    },
    {
      id: 'away',
      title: 'I am away for a while',
      detail: 'A vacation or a busy week. People see it before they send a quote request.',
      icon: brandIcon('times'),
      // Card 131: her Hoop Seal, the sign on the shop, for "I am away".
      meaning: 'home',
      fields: [
        {
          name: 'firstDay',
          title: 'First day away',
          kind: 'date',
          description: 'Leave it empty to show the notice straight away.',
        },
        { name: 'lastDay', title: 'Last day away', kind: 'date', required: true },
        {
          name: 'message',
          title: 'What it says',
          kind: 'text',
          max: 160,
          description:
            'Leave it empty for "I am away until <the day>. Quote requests will be answered when I am back."',
        },
      ],
      submitLabel: 'Put it on my website',
      build: (v) =>
        buildAwayNotice({
          firstDay: v.firstDay || undefined,
          lastDay: v.lastDay,
          message: v.message || undefined,
        }),
      doneMessage:
        'The notice will be on your website in about 2 to 3 minutes, from the first day you picked until the last.',
    },
    {
      id: 'question',
      title: 'Add a question and answer',
      detail:
        'For something customers keep asking. It goes on your How It Works page, at the end of your questions.',
      icon: typeIcon('faqItem'),
      // Her needle and thread: words she writes.
      meaning: 'text',
      fields: [
        {
          name: 'question',
          title: 'The question',
          kind: 'string',
          required: true,
          max: 120,
          description: 'As a customer would ask it, like "Can you embroider on a hat?"',
        },
        {
          name: 'answer',
          title: 'Your answer',
          kind: 'text',
          required: true,
          max: 800,
          description: 'A few short sentences. Leave an empty line to start a new paragraph.',
        },
      ],
      submitLabel: 'Put it on my website',
      // Async: looks up the last question's place in her drag order, so the new
      // one lands at the end of the list, as one added in the full editor does.
      build: async (v, { client }) =>
        buildQuestion(
          { question: v.question, answer: v.answer },
          await client.fetch<string | null>(
            `*[_type == "faqItem" && ${PUBLISHED} && defined(orderRank)] | order(orderRank desc)[0].orderRank`,
          ),
        ),
      doneMessage:
        'Your question will be on the How It Works page in about 2 to 3 minutes. To show it on the Pricing page too, open it in the full editor.',
    },
  ],

  // "Post a photo" (card 125), the first button on Quick update: a photo of her
  // work from the phone's camera or gallery, saved for her to check and
  // Publish. She has no page galleries; every photo is a Style Gallery photo.
  postPhoto: {
    galleryTypes: [],
    post: {
      label: 'My Style Gallery',
      type: 'galleryItem',
      build: (input) => buildWorkPhoto(input),
    },
    note: 'Pick "My Style Gallery". The title shows under the photo when someone opens it large. Then open it in the full editor to pick the kind of item and press Publish.',
  },

  checkup: {
    rules,
    // Her notes and Nathan's older help pages are not website content.
    ignoreTypes: ['studioGuide', 'studioNotes', 'studioPlaybook'],
  },

  guide: {
    guides: KIT_GUIDES,
    categories: GUIDE_CATEGORIES,
    view: makeGuideView,
    // "Help for this page": which guides each kind of thing shows.
    forType: GUIDES_FOR_TYPE,
    // Card 134: the "How to" chip beside the boxes she is most likely to get wrong.
    forField: GUIDE_FOR_FIELD,
  },

  // Home's "Your pages" card: every page she can change, in the order a
  // visitor meets them, one click each. Desk ids are load-bearing (structure.ts).
  pages: [
    {
      title: 'Pages on my website',
      links: [
        { title: 'Home', target: { doc: 'homePage' } },
        { title: 'Shop by Item', target: { doc: 'shopIndexPage' } },
        { title: 'Style Gallery', target: { doc: 'styleGalleryPage' } },
        { title: 'Pricing', target: { doc: 'pricingPage' } },
        { title: 'How It Works', target: { doc: 'howItWorksPage' } },
        { title: 'About', target: { doc: 'aboutPage' } },
        { title: 'Request a Quote', target: { doc: 'requestAQuotePage' } },
        { title: 'Clearance', target: { doc: 'clearancePage' } },
      ],
    },
    {
      title: 'Guides for your customers',
      links: [
        { title: 'Font and Lettering Guide', target: { doc: 'fontGuidePage' } },
        { title: 'Thread Color Chart', target: { doc: 'threadChartPage' } },
        {
          title: 'Monogram preview',
          detail: 'The words around the live monogram',
          target: { doc: 'atelierSettings' },
        },
      ],
    },
    {
      title: 'Gift guides and seasons',
      detail: 'Your season pages, and the notice across the top',
      links: [{ title: 'Notices across the top', target: { pane: DESK.notices } }],
      listType: 'collection',
    },
    {
      title: 'Lists',
      links: [
        { title: 'Photos of my work', target: { pane: DESK.photos } },
        {
          title: 'Clearance items for sale',
          target: { pane: `${DESK.clearance};${DESK.clearanceItems}` },
        },
        {
          title: 'Price tags on the Pricing page',
          target: { pane: `${DESK.clearance};${DESK.priceTags}` },
        },
        { title: 'Embroidery fonts', target: { pane: `${DESK.reference};${DESK.fonts}` } },
        { title: 'Thread colors', target: { pane: `${DESK.reference};${DESK.threads}` } },
        { title: 'Questions and answers', target: { pane: DESK.questions } },
      ],
    },
    {
      title: 'My business and my tools',
      links: [
        {
          title: 'My business details',
          detail: 'Phone, email, address, hours, menus and footer',
          target: { doc: 'siteSettings' },
        },
        {
          title: 'Make a QR code',
          detail: 'For tags, cards and signs',
          target: { tool: 'qr-codes' },
        },
        {
          title: 'My brand kit',
          detail: 'Logos, colors, fonts and pictures to download',
          target: { tool: 'brand-kit' },
        },
        { title: 'Pages people see now and then', target: { pane: DESK.pages } },
      ],
    },
  ],

  // Home's banner, drawn from the site (scripts/gen-studio-art.mjs): the
  // Midnight of the site's header and hero, her Hoop Seal (the version made for
  // dark grounds), and along the foot the Midnight weave, the header's running-
  // stitch hem in thread gold with her "x" stitches, running into the hero's
  // gilded hoop with her letters stitched in it and its claret thread falling
  // away. "Monograms" is set in the site's own swash italic (the "made just for
  // you." of the Home hero, src/assets/fonts/fraunces-swash-italic.woff2), its
  // letters stepping through the thread-gold ramp (--thread-gold) as the site's
  // gold text does.
  homeBanner: {
    markOnDark: '/brand/seal-dark.svg',
    motif: '/studio-banner/thread.svg',
    motifNarrow: '/studio-banner/thread-phone.svg',
    accent: '#F0D58A',
    lettering: {
      text: 'Monograms',
      family: 'MAS Fraunces Swash',
      src: '/studio-banner/fraunces-swash.woff2',
      colors: [
        '#C9A04F',
        '#D9B15F',
        '#E4C373',
        '#F0D58A',
        '#F0D58A',
        '#E4C373',
        '#D9B15F',
        '#C9A04F',
        '#B98A3E',
      ],
    },
    // The button on her Midnight band is the paper patch with a running stitch (the
    // site's .btn), drawn by the kit's own chip shape since card 135. Paper with Ink,
    // Gold Light with Midnight on hover and keyboard focus.
    style: {
      chip: {
        shape: 'stitched',
        bg: '#fbf8f1',
        fg: '#26312e',
        hoverBg: '#f0d58a',
        hoverFg: '#0f1b2d',
        edge: '#0f1b2d',
        ring: '#f0d58a',
        size: '0.8125rem',
        weight: 700,
        tracking: '0.2em',
        case: 'upper',
      },
    },
  },

  // Home's big buttons: the jobs she does most (the first four cards of her old
  // Welcome page, and since 2026-10-19 her quote requests, a weekly job).
  quickActions: [
    {
      title: 'Add a photo of my work',
      detail: 'Opens a new, empty photo. Add the picture, a few words about it, then Publish.',
      target: { create: 'galleryItem', template: 'new-photo' },
      icon: typeIcon('galleryItem'),
    },
    {
      title: 'Mark a clearance item sold, or add one',
      detail: 'Open one and turn on Sold, or press + to add a new one.',
      target: { pane: `${DESK.clearance};${DESK.clearanceItems}` },
      icon: typeIcon('clearanceItem'),
    },
    {
      title: 'Change a price',
      detail: 'The price tags on your Pricing page. Open one, change the number, then Publish.',
      target: { pane: `${DESK.clearance};${DESK.priceTags}` },
      icon: typeIcon('pricingTier'),
    },
    {
      title: 'See my quote requests',
      detail:
        'Every request from your website, newest first. Mark each one Replied once you have answered.',
      target: { tool: 'messages' },
      icon: brandIcon('contact'),
    },
    {
      title: 'Change my phone number or email',
      detail: 'Shown in the footer and the phone menu.',
      target: { doc: 'siteSettings', field: 'phone' },
      icon: brandIcon('contact'),
    },
  ],

  // Spotlight tours, the welcome and What's new (card 137): src/sanity/studio-tours.ts.
  // The fallback the kit keeps for a site with no tours; the tours below win.
  tourSteps: [],
  tours: TOURS,
  welcome: WELCOME,
  whatsNew: WHATS_NEW,

  // A rebuild takes 2 to 3 minutes (Cloudflare Workers Builds, from the Sanity
  // publish webhook).
  typicalUpdateMinutes: 3,
  liveSlowAfterMinutes: 15,

  features: {
    // Earlier versions (card 125) needs the nightly backups and a GitHub token on the Worker: off until set up.
    earlierVersions: false,
    home: true,
    guide: true,
    checkup: true,
    tour: true,
    trash: true,
    publishNote: true,
    // Cloudflare Web Analytics through /api/studio/visitors/. Says "not set up
    // yet" until the Worker has CF_ANALYTICS_TOKEN, CF_ACCOUNT_ID and
    // CF_WEB_ANALYTICS_SITE_TAG (OPERATIONS notes in docs/08).
    visitors: true,
    navbarStatus: true,
    helpPanel: true,
  },
};
