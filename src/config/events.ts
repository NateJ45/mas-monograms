// Safe to edit by hand
// =============================================================================
// events.ts - this site's map for the GA4 event layer (PORTS.md card 217)
// =============================================================================
// The shared half is src/lib/track.ts and src/components/analytics/SiteEvents.astro
// (PORTABLE); they read this map and nothing else.
//
// What the shop sends (all new with the layer; the site sent no custom events before):
//   generate_lead      a quote request the server accepted (QuoteFormScript.astro calls
//                      track() once, before the page moves on to /thank-you/)
//   form_view          the quote form's first question came into view (data-track-form="quote")
//   contact_click      an email or phone link, e.g. in the footer (built in; the kind
//                      only, never the address)
//   directions_click   a Google or Apple Maps link (built in; the site has none today)
//   watch_click        a YouTube or Vimeo link (built in)
//   social_click       a link to one of the social pages below, if the shop adds any
//   page_not_found     the 404 page (data-page-not-found on NotFoundBody.astro)
//   js_error           an error in the site's own scripts (built in)
//
// "STARTED A QUOTE". The number the owner cares about is how many people got as
// far as the form. That is form_view (the form came into view), which the Report
// shows as "Quote forms seen". Google's own Enhanced Measurement also sends
// form_start the first time someone types in a form; that is a different event
// name, so the two do not double count, but the Report does not read it: it would
// say the same thing as form_view, a little later.
//
// FORM_VIEW AND TALL FORMS. form_view fires when 40% of the marked element is on
// screen. The quote form is 2600 to 2900 px tall (measured 2026-11-06), more than
// 2.5 screens on a phone and on a desktop, so marking the <form> never fires. The
// marker (data-track-form="quote") is on the first question instead, and
// formSelector below looks for it. tests/site-events.spec.ts checks both widths.
//
// OFF, AND WHY.
//   outbound_click, download_click  Google's Enhanced Measurement is on for this
//     property (scroll, click and form_start are in its data), so ours would
//     double them.
//   site_search, search_no_results  there is no site search.
//   article_progress, article_read  the site has no article pages.
//   embed_interact  the site has no embedded frames (Turnstile's own frame is not
//     a visitor choice).
//
// The privacy page names exactly what is above, derived from this map
// (src/lib/event-kinds.ts, used by src/pages/legal/[slug].astro). Docs:
// docs/agent/analytics.md.
// =============================================================================

import type { EventsConfig, LinkRule } from '@/lib/track';

/** A social network, matched on exactly this host (www ignored). */
function social(host: string, network: string): LinkRule {
  return {
    host: new RegExp(`^${host.replace(/\./g, '\.')}$`),
    event: 'social_click',
    params: { network },
    describe: 'links to our social media pages',
  };
}

export const eventsConfig: EventsConfig = {
  // Not form[data-track-form]: the marker sits on the quote form's first question, because
  // the form is too tall for 40% of it ever to be on screen at once.
  formSelector: '[data-track-form]',

  links: [
    // The footer can show these (src/components/Footer.astro). YouTube is left out
    // on purpose: the built-in watch_click already counts it.
    social('facebook.com', 'facebook'),
    social('instagram.com', 'instagram'),
    social('pinterest.com', 'pinterest'),
    social('tiktok.com', 'tiktok'),
    social('nextdoor.com', 'nextdoor'),
  ],

  off: [
    'outbound_click',
    'download_click',
    'site_search',
    'search_no_results',
    'article_progress',
    'article_read',
    'embed_interact',
  ],
};
