// Safe to edit by hand
// =============================================================================
// board.ts - this site's Report (the Studio tool, PORTS.md card 218)
// =============================================================================
// NOT PORTABLE: each site edits this file. The shared half (the arithmetic in
// src/lib/studio-board.ts, the screen in src/sanity/kit/board/, the route
// /api/studio/board/) reads this and nothing else, so a site's report is its
// own: its parts, its words, its measures.
//
// The tool appears in the Studio when features.report is on in
// src/sanity/kit.config.ts (on in code; this site deploys from main through
// Cloudflare Workers Builds, so there is no build variable). The numbers come
// from Google Analytics and Search Console through studio-status (card 136's
// SITE_DATA binding); without that the tool explains what is needed.
//
// MEASURES
//   Numbers, for tiles and by-month charts:
//     visitors, visits, pageViews, newVisitors, searchClicks, searchAppearances,
//     event:<name>   a GA4 event the site sends (docs/agent/analytics.md) AND
//                    studio-status counts for this site (its site-series-config).
//   Lists, for charts only:
//     topContent (prefix: ['/shirts-tops'] keeps those paths), channels, places,
//     countries, searchQueries, searchPages.
//
// WORDS: write what Mary Ann would say. "Visitors" and "pages viewed", never
// "sessions" or "engagement rate". No em-dashes. Put how a number is counted in
// `explain`: it sits behind the "i" button, out of the way. The numbers here are
// small (a few dozen visitors a month), so every label has to read honestly at 8.
//
// HEADLINES. Each one can fire on the live site today:
//   Visitors, Clicks from Google  GA4 and Search Console, counted since 2026-10-04.
//   Quote requests sent           generate_lead, called in QuoteFormScript.astro.
//   Quote forms seen              form_view, from data-track-form="quote".
//   Email and phone clicks        contact_click; the footer shows an email and a
//                                 phone link on every page.
//
// DATES
//   firstMonth  the first month the picker offers.
//   since       the day a measure was first counted; before it the report says
//               "Not tracked yet", never 0. `all` is the first day Google has
//               anything (the page, channel, place and search lists read it); an
//               `event:<name>` key is the day that event was first sent.
//   gaps        months when counting was down, with a sentence: left out of
//               charts, and no year-on-year change on a period that touches one.
// =============================================================================

import type { BoardConfig } from '../lib/studio-board.ts';
import { site } from '../data/site.ts';

/**
 * The day the shared event layer (card 217) went live: every event below was first
 * counted then, so earlier days read "Not tracked yet", never 0. The main session
 * sets the real deploy day if it is not this one.
 */
const EVENTS_SINCE = '2026-11-06';

const VISITORS =
  'People who came to the website. Someone who comes back in the same period is counted once. Counting began on October 4, 2026.';
const QUOTES =
  'Each time someone sent the quote request form and it went through. It is a request for a quote, not an order: it does not mean the person went on to buy. It counts that a form was sent, never what it said or who sent it.';
const SEEN =
  'Each time the start of the quote request form came into view on someone’s screen. It shows how many people got as far as the form, whether or not they filled it in or sent it. The same person coming back later is counted again.';
const CONTACT =
  'Clicks on an email address or phone number on the website. The website cannot see whether the email was written or the call made.';
const GOOGLE =
  'Times someone chose the website in a Google search. From Google Search Console, which runs about three days behind and shows this site from October 4, 2026.';

// The pages that lead to the quote form.
const QUOTE_PAGES = ['/request-a-quote', '/pricing', '/how-it-works'];
// One page for each kind of item, plus the page that lists them. A new kind of item
// needs its address added here to show in the list.
const ITEM_PAGES = [
  '/shop-by-item',
  '/shirts-tops',
  '/jackets-sweatshirts',
  '/hats-caps',
  '/tote-bags',
  '/towels-linens',
  '/baby-kids',
  '/home-gifts',
  '/bring-your-own-item',
  '/clearance',
];
const STYLE_PAGES = ['/style-gallery', '/font-lettering-guide', '/thread-color-chart'];

export const boardConfig: BoardConfig = {
  siteName: site.name,
  firstMonth: '2026-10',
  timeZone: 'America/New_York',
  // `all` is the first day Google has anything (visitors, pages, channels, places and
  // Google's own numbers all begin on October 4, 2026, so they need no key of their
  // own). Each event is new with the shared event layer, so each has its own day.
  since: {
    all: '2026-10-04',
    'event:generate_lead': EVENTS_SINCE,
    'event:form_view': EVENTS_SINCE,
    'event:contact_click': EVENTS_SINCE,
  },
  gaps: [],

  overview: {
    tiles: [
      { measure: 'visitors', label: 'Visitors', explain: VISITORS },
      { measure: 'event:generate_lead', label: 'Quote requests sent', explain: QUOTES },
      { measure: 'event:form_view', label: 'Quote forms seen', explain: SEEN },
      { measure: 'searchClicks', label: 'Clicks from Google', explain: GOOGLE },
    ],
    charts: [
      { measure: 'visitors', title: 'Visitors by month' },
      {
        measure: 'topContent',
        title: 'Item pages viewed',
        prefix: ITEM_PAGES,
        note: 'The page for each kind of item, by pages opened.',
      },
      { measure: 'channels', title: 'How people found MAS Monograms' },
    ],
  },

  parts: [
    {
      id: 'quote',
      title: 'The quote path',
      nav: 'Quote path',
      explain:
        'What people did on the way to asking for a quote. A quote request is a request, not a sale. The two numbers count forms: how many times the form was in front of someone, and how many times one was sent. The list counts pages opened, so it shows what people read, not how many people read it.',
      tiles: [
        { measure: 'event:form_view', label: 'Quote forms seen', explain: SEEN },
        { measure: 'event:generate_lead', label: 'Quote requests sent', explain: QUOTES },
      ],
      charts: [
        {
          measure: 'topContent',
          title: 'Pages opened on the way to a quote',
          prefix: QUOTE_PAGES,
          note: 'Request a quote, Pricing and How it works.',
        },
        { measure: 'event:generate_lead', title: 'Quote requests sent by month' },
      ],
      more: [{ measure: 'event:form_view', title: 'Quote forms seen by month' }],
    },
    {
      id: 'items',
      title: 'What people look at',
      nav: 'What people look at',
      explain:
        'The page for each kind of item, such as shirts, tote bags or towels, and the Shop by item page that lists them. The list counts pages opened, so it shows which items people looked at, not how many people looked.',
      charts: [
        {
          measure: 'topContent',
          title: 'Item pages viewed',
          prefix: ITEM_PAGES,
          limit: 10,
        },
      ],
    },
    {
      id: 'style',
      title: 'Choosing a style',
      nav: 'Choosing a style',
      explain:
        'The pages that help someone pick how their piece will look: the Style gallery, the Font and lettering guide and the Thread color chart. The list counts pages opened.',
      charts: [
        {
          measure: 'topContent',
          title: 'Style pages viewed',
          prefix: STYLE_PAGES,
          limit: 10,
        },
      ],
    },
    {
      id: 'found',
      title: 'Found locally',
      nav: 'Found locally',
      explain:
        'How people found the shop and how they reached out. A click from Google is someone choosing the website in a search; an appearance is the website being listed, chosen or not. Google keeps about sixteen months, so older periods are not compared. Email and phone clicks are clicks on those links, not emails written or calls made.',
      tiles: [
        { measure: 'searchClicks', label: 'Clicks from Google', explain: GOOGLE },
        { measure: 'searchAppearances', label: 'Times it appeared on Google', up: 'flat' },
        { measure: 'event:contact_click', label: 'Email and phone clicks', explain: CONTACT },
      ],
      charts: [
        { measure: 'searchQueries', title: 'Searches that found MAS Monograms' },
        { measure: 'places', title: 'Where visitors were' },
        { measure: 'channels', title: 'How people found MAS Monograms' },
      ],
      more: [
        { measure: 'searchPages', title: 'Pages Google sent people to' },
        { measure: 'event:contact_click', title: 'Email and phone clicks by month' },
        { measure: 'newVisitors', title: 'First-time visitors by month' },
        { measure: 'pageViews', title: 'Pages viewed by month', type: 'line' },
      ],
    },
  ],
};
