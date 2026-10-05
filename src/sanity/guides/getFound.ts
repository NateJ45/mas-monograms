// Safe to edit by hand (the words); every outside step was checked against the
// platform's own help pages on the date in each guide's `maintenance` note.
// =============================================================================
// "Get found (so customers can find me)": the handbook category that teaches
// Mary Ann to put up signs for her website (2026-10-05, Phase B addition in
// docs/superpowers/specs/2026-10-05-studio-direction.md).
// =============================================================================
// Why this exists: the site went live on the new platform on 2026-09-04 and
// nothing had been done to tell anyone it existed, so it got no interest. These
// guides teach the free steps first (Google, Facebook, Instagram, word of
// mouth), then ads, honestly.
//
// RULES FOR EDITING THIS FILE
//   - These are real accounts and real money. Re-check a platform's help page
//     before changing a step, and update the date in `maintenance`.
//   - Write steps as "what she is trying to do" and "what she should see",
//     because these screens change often. Keep the "may look a little
//     different" reassurance.
//   - No invented numbers, results or guarantees. Prices only when verified
//     and dated (in `maintenance`, never in her text).
//   - Never ask her to give a password to anyone.
//   - No em-dashes. No developer words (see scripts/audit-studio.mjs JARGON).
//   - Sources and the date checked live in each guide's `maintenance` note.
//   - Site gaps these guides found are build tasks in docs/PENDING.md
//     ("Get found: site support").
// =============================================================================
import { BRAND_KIT } from './brandAndPrint.ts';
import type { Guide, GuideBlock } from './types.ts';

const CAT = 'Get found (so customers can find me)' as const;

/** The website address she gives everyone. */
const SITE = 'https://mas-monograms.com';
const QUOTE = 'https://mas-monograms.com/request-a-quote';

/** The same short safety note, used on every guide that creates an account. */
const STAY_SAFE: GuideBlock = {
  kind: 'callout',
  tone: 'careful',
  title: 'Staying safe',
  text: 'Google, Apple, Microsoft and Facebook never phone you asking for money, and listings on them are free. Never share a code they send you, never give anyone your password, and never pay anyone who promises to put you "number one on Google". If a call worries you, hang up and ask Nathan.',
};

const SCREENS_VARY: GuideBlock = {
  kind: 'callout',
  tone: 'tip',
  title: 'If your screen looks a little different',
  text: 'These websites change their screens often. If a button has a slightly different name, look for the words closest to the step. Nothing here can break your website, so take your time.',
};

const TOGETHER: GuideBlock = {
  kind: 'callout',
  tone: 'tip',
  title: 'A good one to do together',
  text: 'This one asks for a phone code or a proof step. It is a good one to do with Nathan on a call, so you are never stuck halfway.',
};

export const getFoundGuides: Guide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'get-found-start',
    category: CAT,
    title: 'Why people are not finding me, and the plan',
    icon: 'map',
    badge: 'You can do this yourself',
    summary:
      'The honest reason the website has been quiet, and the simple plan to change it. Read this first.',
    time: 'About 5 minutes to read',
    cost: 'Free',
    blocks: [
      { kind: 'h', text: 'The honest reason' },
      {
        kind: 'p',
        text: 'Your website is lovely, and it works. But a website is like a shop on a street that nobody walks down. People only come once there are **signs** pointing to it.',
      },
      {
        kind: 'p',
        text: 'Your new website only went live in September 2026, and nobody put up any signs yet. So it is not that people saw it and did not like it. Almost nobody knew it was there.',
      },
      {
        kind: 'p',
        text: 'The signs are free listings on Google, Facebook, Instagram and a few other places, plus the people who already love your work telling their friends. This part of the handbook shows you how to put each one up, one at a time.',
      },
      { kind: 'h', text: 'The plan' },
      {
        kind: 'bullets',
        items: [
          '**Free first.** Do the free things for about 60 days before you spend any money on ads.',
          '**One thing at a time.** Each guide is one job. Finish it, then rest.',
          '**A little, often.** Fifteen minutes a week does more than one big day.',
          '**Your best link.** Everywhere you are asked for a website, use your quote page. It is where people ask you for a price.',
        ],
      },
      { kind: 'h', text: 'What to do this week' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Read "The 60-day plan and my weekly 15 minutes".',
            see: 'A simple list of what to do each week.',
          },
          {
            text: 'Set up your free Google listing, with Nathan on a call if you like.',
            see: 'Your business shows on Google Search and Google Maps once Google has checked it.',
          },
          {
            text: 'Ask three happy customers for a Google review.',
            see: 'Stars start to appear next to your name on Google.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why this matters',
        text: 'Most people look for a local maker on Google or Facebook first. If you are not there, they never reach your website, however good it is.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Be patient with yourself and with Google',
        text: 'Nobody can promise how many customers will come or how fast. Listings take days or weeks to start showing. That is normal, not a sign that something is wrong.',
      },
      {
        kind: 'seealso',
        ids: ['get-found-60-day-plan', 'google-business-profile', 'reviews-and-word-of-mouth'],
      },
    ],
    maintenance:
      'Facts checked 2026-10-05: the new site went live 2026-09-04 (vault note mas-monograms.md, cutover discovered by studio-status). Quote page path /request-a-quote exists in src/pages. No numbers or results are promised on purpose.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'get-found-60-day-plan',
    category: CAT,
    title: 'The 60-day plan and my weekly 15 minutes',
    icon: 'calendar',
    badge: 'You can do this yourself',
    summary:
      'What to set up in your first two months, in order, and a short weekly and monthly routine to keep it going.',
    time: 'About 5 minutes to read, then 15 minutes a week',
    cost: 'Free',
    blocks: [
      { kind: 'h', text: 'Weeks 1 and 2: the big free signs' },
      {
        kind: 'steps',
        items: [
          'Set up your Google listing (the most important one).',
          'Make a Facebook Page for the business.',
          'Make an Instagram business account and connect it to the Facebook Page.',
          'Add your Facebook and Instagram addresses to your website, so the buttons show in the footer.',
          'Ask three to five happy customers for a Google review.',
        ],
      },
      { kind: 'h', text: 'Weeks 3 and 4: more signs' },
      {
        kind: 'steps',
        items: [
          'Copy your Google listing to Bing (it takes a few minutes).',
          'Make a Pinterest business account and pin five of your best photos.',
          'Claim a free Nextdoor business page and join one or two local Facebook groups.',
          'Make a QR code and put it on your tags, thank-you cards and business cards.',
        ],
      },
      { kind: 'h', text: 'Weeks 5 to 8: keep showing up' },
      {
        kind: 'p',
        text: 'Now the work is small and regular: one new photo a week, answering messages and reviews, and telling people about you. At the end of week 8, look at the guide "How do I know if it is working?" and decide with Nathan whether a small ad is worth trying.',
      },
      { kind: 'h', text: 'Every week (about 15 minutes)' },
      {
        kind: 'bullets',
        items: [
          'Post one photo of something you made on Facebook and Instagram (the same photo is fine for both).',
          'Add the same photo to your Google listing as an update.',
          'Answer any new messages, comments and reviews. A short "Thank you so much!" is enough.',
          'Ask one happy customer for a review.',
        ],
      },
      { kind: 'h', text: 'Every month (about 30 minutes)' },
      {
        kind: 'bullets',
        items: [
          'Add two or three new photos of your work to your website.',
          'Check your hours, phone and email are the same everywhere.',
          'Look at the numbers on Google and Facebook (see "How do I know if it is working?").',
          'Pin a few new photos on Pinterest.',
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Make it a habit',
        text: 'Pick one fixed time, for example Monday morning with your coffee. A small habit you keep beats a big plan you skip.',
      },
      {
        kind: 'seealso',
        ids: [
          'google-business-profile',
          'facebook-page',
          'instagram-account',
          'is-it-working',
          'qr-codes',
        ],
      },
    ],
    maintenance:
      'Plan written 2026-10-05 as a recommended default (free first for 60 days, per the studio direction spec). No platform facts beyond the other guides.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'google-business-profile',
    category: CAT,
    title: 'Get my business on Google Search and Maps',
    icon: 'map',
    badge: 'Mostly yourself',
    summary:
      'Your free Google listing (Google calls it a Business Profile) is the box with your name, stars, phone and photos that shows when people search on Google or Google Maps. This is the most important sign of all.',
    time: 'About 30 minutes, then Google takes up to a few days to check it',
    cost: 'Free',
    before: [
      'A Google account (the one you use for Gmail is fine; mastone37@gmail.com).',
      'Your phone nearby, for a code Google may send.',
      'Your business name exactly as on your website: MAS Monograms.',
      'Your phone number: (803) 707-8576.',
      'Three or four good photos of your work.',
      'From My brand kit, under Google: the **Google Business Profile logo** (720 by 720) and the **Google Business Profile cover photo** (1080 by 608).',
    ],
    blocks: [
      {
        kind: 'p',
        text: 'A **listing** is your business card on Google. **Verify** means Google checks that the business is really yours before it shows the listing to everyone.',
      },
      TOGETHER,
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Ask Nathan first: it may be quicker',
        text: 'Google says it can sometimes approve a listing straight away when the same Google account already looks after the website in its website tool (Search Console). Nathan has that set up. Before you start, ask him to add your Google account to it. It may save you the waiting.',
      },
      { kind: 'h', text: 'Set it up' },
      {
        kind: 'path',
        label: 'Open Google Business Profile',
        detail: 'Opens in a new tab. Press `Manage now` or `Get started`.',
        to: { url: 'https://business.google.com/us/business-profile/' },
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Sign in with your Google account.',
            see: 'A box asking for your business name.',
          },
          {
            text: 'Type **MAS Monograms**. If Google suggests a business with your name, pick it (it may already exist). If not, choose to create a new one.',
            see: 'A question about what kind of business it is.',
          },
          {
            text: 'For the kind of business, start typing **Embroidery** and pick **Embroidery service** if it is offered. If not, pick the closest match Google shows you.',
            see: 'A question asking if you have a place customers can visit.',
          },
          {
            text: 'Answer **No**. You work from home, so Google asks you to keep your home address private. Customers will still find you in your area.',
            see: 'A box asking which areas you serve.',
          },
          {
            text: 'Add the towns you serve: St. Matthews, Calhoun County, Orangeburg, Columbia and any others nearby. Google asks you to keep it within about two hours of driving.',
            see: 'A box for your phone number and website.',
          },
          {
            text: `Type your phone number. For the website, use your quote page: ${QUOTE}`,
            see: 'A step about verifying, or a list of ways to verify.',
          },
          {
            text: 'Choose a way to verify. Google may offer a text, a phone call, an email, a short video, or a postcard. Pick the easiest one it shows you.',
            see: 'Either "verified", or a note that Google is reviewing it. Reviews can take up to 5 business days.',
          },
        ],
      },
      SCREENS_VARY,
      {
        kind: 'callout',
        tone: 'careful',
        title: 'If Google asks for a video',
        text: 'Google may ask you to film a short video showing your work, your equipment (your embroidery machine and threads) and that you run the business. Because you work from home, this can feel personal. It is a good moment to do it on a call with Nathan.',
      },
      { kind: 'h', text: 'Fill it in (after it is verified)' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Press `Edit profile`. Add a short description. You can paste the one from "Make my profiles match".',
            see: 'Your description under your business name.',
          },
          {
            text: 'Add a second kind of business if Google offers it: **Monogramming service**. Google asks you to use as few as you can, so two is plenty.',
          },
          {
            text: 'Add your hours. If you work by appointment, add the hours you are happy to answer the phone.',
          },
          {
            text: 'Under Photos, add the **Google Business Profile logo** from My brand kit as your Logo, and the **Google Business Profile cover photo** as your Cover photo (a real photo of your work is good there too).',
          },
          {
            text: 'Add three or four of your best photos of your work.',
            see: 'Your logo and photos on your listing. New photos can take a little while to appear.',
          },
          {
            text: 'Add your first update: press `Add update` (or `Posts`), add a photo of something you made, two short sentences, and a `Learn more` button pointing to your quote page.',
            see: 'Your update on the listing.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why the quote page is the link',
        text: 'People who find you on Google usually want a price. The quote page is where they ask you for one, so it saves them a click.',
      },
      { kind: 'h', text: 'Get your review link' },
      {
        kind: 'steps',
        items: [
          {
            text: 'On a computer, open your listing and press `Read reviews`, then `Get more reviews`.',
            see: 'A short link and a QR code.',
          },
          {
            text: 'Press `Copy` and paste the link into a note on your phone. This is the link you send customers.',
          },
          {
            text: 'In the Studio, open My business details, paste it into `Your Google review link`, then press `Publish`.',
            see: 'After 2 to 3 minutes, a **Leave a review** link appears in your website footer and on the thank-you page people see after asking for a quote. The "Make a QR code" tool can use it too.',
          },
        ],
      },
      {
        kind: 'path',
        label: 'Open my Google review link',
        detail: 'My business details',
        to: { doc: 'siteSettings', field: 'googleReviewUrl' },
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Your own words on the link',
        text: 'The link says "Leave a review" unless you change it. To say something warmer, such as "Leave me a review", type it in `Words on your review link` in My business details, then press `Publish`.',
      },
      { kind: 'h', text: 'Connect your listing to your website' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Search Google for **MAS Monograms St. Matthews**, open your listing, and copy its web address from the top of your browser (or use the `Share` button on your listing and copy the link).',
          },
          {
            text: 'In the Studio, open My business details, paste it into `Your Google listing link`, then press `Publish`.',
            see: 'Nothing changes on the page you can see. Your website now quietly tells Google which listing is yours.',
          },
        ],
      },
      {
        kind: 'path',
        label: 'Open my Google listing link',
        detail: 'My business details',
        to: { doc: 'siteSettings', field: 'googleBusinessUrl' },
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'bullets',
        items: [
          'On your phone, search Google for **MAS Monograms St. Matthews**. Your listing shows on the right (on a computer) or at the top (on a phone).',
          'Open Google Maps and search the same words. Your business shows in your area.',
        ],
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'bullets',
        items: [
          'Google says a business already exists with your name and someone else owns it: stop and ask Nathan. Google has a way to ask for it back.',
          'Verification failed or is taking longer than a week: ask Nathan. Do not make a second listing, Google can suspend both.',
          'Someone phones offering to "verify your Google listing" for a fee: hang up. Google never does this.',
        ],
      },
      STAY_SAFE,
      {
        kind: 'seealso',
        ids: ['reviews-and-word-of-mouth', 'bing-places', 'make-profiles-match', 'staying-safe'],
      },
    ],
    maintenance:
      'Checked 2026-10-05 against Google Business Profile Help: create a profile (support.google.com/business/answer/10514137), service-area businesses and hiding the address, up to 20 areas, about 2 hours driving (answer/9157481), guidelines incl. "If you are a service-area business, you should hide your business address" and "use as few categories as possible" (answer/3038177), verification methods phone/text, email, live video, mail, Search Console website verification, review up to 5 business days, video requirements (answer/7107242), review link "Read reviews > Get more reviews > Copy", QR on computer only (answer/16816815), no incentives for reviews (answer/3474122), posts Update/Offer/Event (answer/7342169), scam warnings (answer/14509283). Category names "Embroidery service" and "Monogramming service" are NOT on an official Google list (Google publishes none); they appear in a third-party 2026 category list (daltonluka.com), so the step says "if it is offered". The address decision (hide it) assumes pickup is by arrangement; if Mary Ann keeps staffed customer hours at home, revisit. Landing page business.google.com/us/business-profile/ (www.google.com/business redirects there). Site side rechecked 2026-10-05 after the Get found site pass: siteSettings.googleReviewUrl ("Your Google review link") drives the footer and thank-you "Leave a review" link (src/lib/review-link.ts; words from reviewLinkLabel, "Words on your review link"); googleBusinessUrl ("Your Google listing link") is unhidden and feeds LocalBusiness sameAs (sameAsLinks in src/lib/schemas.ts), nothing visible. The listing Share button is not in the official help pages checked: the step offers copying the browser address first. Brand kit Google pictures from src/lib/brand/brandKit.ts (logo 720x720, cover 1080x608, "under Photos, add it as your Logo / Cover photo").',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'apple-maps',
    category: CAT,
    title: 'Show up on Apple Maps (iPhone)',
    icon: 'map',
    badge: 'Check with Nathan first',
    summary:
      'Apple has its own free listing for iPhone users (Apple Maps and Siri). It asks for more proof than Google, so do it with Nathan, and only after your Google listing is done.',
    time: 'About 30 minutes, then Apple takes a few days to check it',
    cost: 'Free',
    before: [
      'An Apple Account (the one you use on your iPhone).',
      'Your Google listing done first.',
      'Possibly a paper that shows the business name and address, such as a business license or a utility bill. Apple decides what it needs.',
      'Nathan on a call.',
    ],
    blocks: [
      {
        kind: 'callout',
        tone: 'why',
        title: 'Should I bother?',
        text: 'Many people with iPhones use Apple Maps. But Apple Maps is mostly for places people visit, and you keep your home address private. Apple now lets businesses without a shop front sign up, but what it shows for them is more limited. So this one is worth trying, but it comes after Google, Facebook and Instagram.',
      },
      TOGETHER,
      {
        kind: 'path',
        label: 'Open Apple Business',
        detail: 'Opens in a new tab. Apple used to call this Apple Business Connect.',
        to: { url: 'https://business.apple.com' },
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Sign in with your Apple Account.',
            see: 'A welcome screen asking about your business.',
          },
          {
            text: 'Add your business details: the name MAS Monograms, your phone number, and your website (your quote page).',
            see: 'Apple asks you to confirm your business.',
          },
          {
            text: 'Follow the steps Apple shows to prove the business is yours. It may phone you with a 4-digit code, or ask you to upload a paper with your business name and address.',
            see: 'A note that Apple is checking. It can take a few business days.',
          },
          {
            text: 'Once it is checked, add your hours, your logo and a few photos, the same as on Google.',
          },
        ],
      },
      SCREENS_VARY,
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'On an iPhone, open the Maps app and search for MAS Monograms. Apple may show your business card with your logo and phone.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'p',
        text: 'If Apple asks for a paper you do not have, or will not accept a home business, stop there. It is fine to skip Apple for now. Nathan can look at it with you.',
      },
      STAY_SAFE,
      { kind: 'seealso', ids: ['google-business-profile', 'bing-places'] },
    ],
    maintenance:
      'Checked 2026-10-05: Apple renamed Business Connect to "Apple Business"; businessconnect.apple.com redirects to business.apple.com. Apple Support "Add a single location in Apple Business" (support.apple.com/guide/business/add-a-single-location-abcb98816a34/web): name, address with map marker, category, phone, website, hours; verification by phone call with a 4-digit code or company verification. Company verification options (Apple Business Connect guide): paper review (business license or utility bill showing name and address), domain validation (DNS TXT, which Nathan could do in Cloudflare), App Store Connect. Apple newsroom 2024-10-16: businesses without a physical location can now register. Apple help does not explain hiding a home address, so the guide does not promise a Maps pin.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'bing-places',
    category: CAT,
    title: 'Show up on Bing (copy my Google listing)',
    icon: 'search',
    badge: 'Mostly yourself',
    summary:
      'Bing is Microsoft’s search, used on many Windows computers. It can copy your Google listing in a few minutes, so do this after Google is verified.',
    time: 'About 15 minutes',
    cost: 'Free',
    before: [
      'Your Google listing set up and verified first.',
      'Your Google account email and password (you type these yourself, never give them to anyone).',
    ],
    blocks: [
      {
        kind: 'path',
        label: 'Open Bing Places for Business',
        detail: 'Opens in a new tab.',
        to: { url: 'https://www.bing.com/forbusiness' },
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Sign in. Choose to sign in with the same Google account your Google listing uses.',
            see: 'A choice to bring in your business from Google.',
          },
          {
            text: 'Press `Import from Google Business Profile`.',
            see: 'Google asks if Bing may read your listing.',
          },
          {
            text: 'Press `Allow`. This only lets Bing copy your business details.',
            see: 'Your business from Google, in a list.',
          },
          {
            text: 'Tick MAS Monograms and check the details are right: name, phone, website, hours.',
          },
          {
            text: 'Press `Save` or `Done`.',
            see: 'Your business in your Bing dashboard. If Bing asks you to verify, pick the easiest option it offers (a code by text, email or post).',
          },
        ],
      },
      SCREENS_VARY,
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'After a few days, search bing.com for **MAS Monograms St. Matthews**. Your business card shows on the right.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'p',
        text: 'If the copy from Google does not work, you can type the details in by hand instead, the same as on Google. Or leave it for a call with Nathan. Bing matters less than Google, so do not lose sleep over it.',
      },
      STAY_SAFE,
      { kind: 'seealso', ids: ['google-business-profile', 'local-free-places'] },
    ],
    maintenance:
      'Checked 2026-10-05: bingplaces.com now redirects to bing.com/forbusiness (new Bing Places launched, Search Engine Journal 2025-10-03). Import from Google Business Profile flow ("Import from Google Business Profile", Allow, pick the business, Save) from daltonluka.com 2026 walkthrough and SEJ; verification by phone/SMS, email or postcard per Microsoft Q&A threads. Bing’s own help pages did not render for the fetch tool; re-check when the screens are walked live.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'facebook-page',
    category: CAT,
    title: 'Make a Facebook Page for my business',
    icon: 'users',
    badge: 'You can do this yourself',
    summary:
      'A Facebook Page is a free business page, separate from your own Facebook. Customers can follow it, message you and share your work with friends.',
    time: 'About 30 minutes',
    cost: 'Free',
    before: [
      'Your own Facebook account (the Page is made from it, but stays separate).',
      'From My brand kit: the **Profile picture (dark)** (1080 by 1080) and the **Facebook cover photo** (1640 by 624).',
      'The short "About me" words from "Make my profiles match".',
    ],
    blocks: [
      {
        kind: 'p',
        text: 'Your **personal profile** is you. A **Page** is the business. People who follow the Page do not see your personal posts, and you choose what the Page shares.',
      },
      {
        kind: 'path',
        label: 'Open "Create a Page" on Facebook',
        detail: 'Opens in a new tab. Sign in to Facebook first if it asks.',
        to: { url: 'https://www.facebook.com/pages/create' },
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'For the Page name, type **MAS Monograms**.',
          },
          {
            text: 'For the category, start typing **Embroidery** and pick the closest one Facebook offers. You can add a second one, such as a gift or custom clothing category.',
          },
          {
            text: 'For the bio, paste your one-sentence description (see "Make my profiles match").',
          },
          {
            text: 'Press `Create Page`.',
            see: 'Facebook asks for more details: website, phone, email, area.',
          },
          {
            text: `Add your website (your quote page: ${QUOTE}), your phone and your email. For the address, leave the street out and add only St. Matthews, SC, or choose to hide it if Facebook offers that.`,
          },
          {
            text: 'For the profile picture, upload **Profile picture (dark)** from My brand kit (or **Profile picture (light)** if you prefer a light one). For the cover, upload the **Facebook cover photo**. Your name sits in its middle, so phones and your profile picture never cover it.',
            see: 'Your Page with the logo in the circle and the cover across the top.',
          },
          {
            text: 'Add an action button if Facebook offers one, such as `Send message` or `Learn more` pointing to your quote page.',
          },
          {
            text: 'Write your first post: a photo of something you made and two short sentences. See the examples below.',
            see: 'Your post on your Page.',
          },
        ],
      },
      SCREENS_VARY,
      {
        kind: 'path',
        label: 'Get my logo and cover picture',
        detail:
          'My brand kit, under "Pictures for Facebook, Instagram, Pinterest and Google". Press `Download this picture` under each one.',
        to: BRAND_KIT,
      },
      { kind: 'h', text: 'Add the Page to your website' },
      {
        kind: 'steps',
        items: [
          'On your new Page, copy the web address from the top of your browser (it starts with https://www.facebook.com/).',
          'In the Studio, open My business details and find `Your Facebook, Instagram and other pages`. Your footer can show Facebook, Instagram, Pinterest, TikTok, YouTube and Nextdoor buttons, one for each row you add.',
          'Press `Add item`, pick **Facebook**, paste the address, then press `Publish`.',
          {
            text: 'Wait 2 to 3 minutes, then look at the bottom of your website.',
            see: 'A small round Facebook button in the footer.',
          },
        ],
      },
      {
        kind: 'path',
        label: 'Open my Facebook, Instagram and other pages',
        detail: 'My business details',
        to: { doc: 'siteSettings', field: 'socialLinks' },
      },
      { kind: 'h', text: 'Your first month of posts' },
      {
        kind: 'p',
        text: 'One or two posts a week is plenty. Use your own photos of real work. Here are examples in your own voice (change them to fit):',
      },
      {
        kind: 'bullets',
        items: [
          '"A set of hand towels for a new kitchen, stitched this week in navy. If you have a gift coming up, I would love to help. Ask me for a free quote, the link is on my page."',
          '"Close-up of a baby blanket I finished today. Every stitch done by hand, right here in St. Matthews."',
          '"Not sure which font to pick? Just ask. That is my favorite kind of conversation."',
          '"Bring your own item and I will tell you if it can be stitched. No charge to ask."',
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Only true things',
        text: 'Never write a number of years, an award, or a customer name you have not been given permission to share. Real photos and plain words are what people trust.',
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Search Facebook for **MAS Monograms** while signed in. Your Page shows. Ask a friend to follow it and share your first post.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'p',
        text: 'If Facebook asks you to confirm your identity, follow its steps on your phone. If anything asks you to pay, stop: making and posting on a Page is free. Ask Nathan.',
      },
      STAY_SAFE,
      {
        kind: 'seealso',
        ids: ['instagram-account', 'make-profiles-match', 'local-free-places', 'simple-online-ads'],
      },
    ],
    maintenance:
      'Checked 2026-10-05 against Meta Business Help Center: "Create a Facebook Page for your business" (facebook.com/business/help/473994396650734), "Set up your Facebook business Page" (/1968057156746246), "What to know before you create a Page" (/366099230478737): Pages are free and separate from the personal profile. facebook.com/pages/create returns 200. Category names are not listed in help: the step says "closest one". Site side verified in repo: siteSettings.socialLinks (title "Your Facebook, Instagram and other pages", platforms Facebook/Instagram/Pinterest/TikTok/YouTube/Nextdoor/Other; Nextdoor added and TikTok, YouTube and Nextdoor given their own footer icons in the Get found site pass, rechecked 2026-10-05), Footer.astro draws them when showFooterSocials is not switched off (unset means on), and schemas.ts puts them in the LocalBusiness sameAs. Live data on 2026-10-05: socialLinks empty. Brand kit picture names and sizes from src/lib/brand/brandKit.ts KIT_IMAGES (profile pictures 1080, Facebook cover 1640x624, smaller 820x312), checked 2026-10-05. Example captions use only facts from the live site copy (About page, home maker facts, Bring Your Own Item).',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'instagram-account',
    category: CAT,
    title: 'Make an Instagram account for my business',
    icon: 'camera',
    badge: 'You can do this yourself',
    summary:
      'Instagram is a phone app built around photos, which suits your work. A free business account lets people message you and lets you see how your posts are doing.',
    time: 'About 30 minutes',
    cost: 'Free',
    before: [
      'The Instagram app on your phone.',
      'Your Facebook Page made first (so you can connect them).',
      'From My brand kit: the **Profile picture (dark)** (1080 by 1080, made to fit a circle).',
      'Six to nine photos of your work, so the page does not look empty.',
    ],
    blocks: [
      { kind: 'h', text: 'Make the account' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Open Instagram and make a new account for the business. For the name, try **masmonograms**. If it is taken, try **mas.monograms** or **masmonograms.sc**.',
            see: 'Your new, empty profile.',
          },
          {
            text: 'Tap your picture at the bottom right, then the menu (three lines) at the top right.',
            see: 'Settings and activity.',
          },
          {
            text: 'Under **For professionals**, tap `Account type and tools`, then `Switch to professional account`.',
            see: 'A choice between Creator and Business.',
          },
          {
            text: 'Choose **Business**. Instagram says this is for local businesses and service providers.',
            see: 'Instagram asks for a category and contact details.',
          },
          {
            text: 'Pick a category close to embroidery, and add your email and phone.',
          },
          {
            text: 'When Instagram asks to connect a Facebook Page, tap to log in to Facebook and choose your MAS Monograms Page.',
            see: 'Your Instagram and your Facebook Page are linked.',
          },
        ],
      },
      SCREENS_VARY,
      { kind: 'h', text: 'Fill in your profile' },
      {
        kind: 'steps',
        items: [
          'Tap `Edit profile`. For the picture, choose **Profile picture (dark)** from My brand kit, the same one as on Facebook.',
          'Write your bio: up to three short lines. You can use the one from "Make my profiles match".',
          `Add a link: your quote page, ${QUOTE}`,
          {
            text: 'Post six to nine photos of your best work over the first week.',
            see: 'A grid of your work on your profile.',
          },
        ],
      },
      {
        kind: 'path',
        label: 'Get my round logo',
        detail:
          'My brand kit: the profile picture, and five highlight covers (Towels, Totes, Baby, Hats, Custom).',
        to: BRAND_KIT,
      },
      {
        kind: 'p',
        text: 'Then add your Instagram address to your website the same way as Facebook: My business details, `Your Facebook, Instagram and other pages`, pick **Instagram**, paste, `Publish`. A small Instagram button appears in your footer.',
      },
      {
        kind: 'path',
        label: 'Open my Facebook, Instagram and other pages',
        detail: 'My business details',
        to: { doc: 'siteSettings', field: 'socialLinks' },
      },
      { kind: 'h', text: 'The first month' },
      {
        kind: 'bullets',
        items: [
          'Post twice a week. One finished piece, one close-up of the stitching.',
          'Use the same photo on Instagram and Facebook. When you post on Instagram, you can turn on sharing to Facebook so it goes to both at once.',
          'Write a caption in your own words, like the Facebook examples. End with "Free quotes: link in my bio."',
          'Add three to five **hashtags** at the end. A hashtag is a word with # in front, so people searching that word find your post. For example: #monogram #embroidery #personalizedgifts #stmatthewssc #southcarolinamade',
          'Reply to every comment. It helps more people see your posts.',
          'Later, you can group your best posts into **highlights** (the circles under your bio), for example Towels, Totes, Baby, Hats and Custom. My brand kit has a matching **Instagram highlight cover** for each (1080 by 1920). On your profile, press and hold the highlight, choose `Edit highlight`, then `Edit cover`, and pick the picture.',
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why "link in my bio"',
        text: 'Links inside Instagram captions cannot be tapped. The link in your profile can, so that is where you send people.',
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Ask a friend to search Instagram for your account name. Your profile with your logo and photos shows, with a `Contact` or `Email` button, and your quote page link under the bio.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'p',
        text: 'If the Facebook Page will not connect, skip that step. Your Instagram still works on its own, and Nathan can connect them later.',
      },
      STAY_SAFE,
      {
        kind: 'seealso',
        ids: ['facebook-page', 'photos-that-sell', 'make-profiles-match', 'pinterest-account'],
      },
    ],
    maintenance:
      'Checked 2026-10-05: Instagram Help "Set up a professional Instagram account" (help.instagram.com/502981923235522): profile > More > Settings and activity > For professionals > Account type and tools > Switch to professional account; Business is "best for retailers, local businesses, brands, organizations and service providers". "Connect or disconnect your professional Instagram account and a Facebook Page" (help.instagram.com/570895513091465): connection offered on switching, enables cross-posting and shared insights. Hashtag count of three to five is a recommended default, not a platform rule. Account names are suggestions; availability unknown. Brand kit names from src/lib/brand/brandKit.ts (Profile picture (dark), Instagram highlight cover: Towels/Totes/Baby/Hats/Custom at 1080x1920 with the kit how-to: Edit highlight > Edit cover how-to), checked 2026-10-05.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'pinterest-account',
    category: CAT,
    title: 'Make a Pinterest account for my business',
    icon: 'pin',
    badge: 'You can do this yourself',
    summary:
      'Pinterest is where people collect gift and home ideas. Each photo you pin can link straight to your website, and pins keep being found for months.',
    time: 'About 30 minutes',
    cost: 'Free',
    before: [
      'An email address.',
      'Ten or so photos of your work.',
      'From My brand kit: the **Profile picture (dark)** and the **Pinterest board covers** (600 by 600).',
    ],
    blocks: [
      {
        kind: 'p',
        text: 'A **pin** is a photo saved on Pinterest with a link. A **board** is a collection of pins, like a folder.',
      },
      {
        kind: 'path',
        label: 'Open Pinterest Business',
        detail: 'Opens in a new tab. Choose `Create a business account` (or `Sign up`).',
        to: { url: 'https://business.pinterest.com' },
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Choose `Create a business account`. Type your email, a new password, and your age.',
            see: 'Questions about your business.',
          },
          {
            text: `Fill in the business name (MAS Monograms) and your website (${SITE}).`,
          },
          {
            text: 'If it asks whether you want to run ads, say **not now**. You can always change it later.',
            see: 'Your new business profile.',
          },
          'Add **Profile picture (dark)** from My brand kit as your profile picture (the same one as on Facebook and Instagram), and paste your one-sentence description.',
          {
            text: 'Make five boards to match your brand kit covers: **Towels**, **Totes**, **Baby**, **Hats** and **Custom**. (You can give them longer names, such as "Monogrammed Towels".)',
            see: 'Five empty boards on your profile.',
          },
          {
            text: 'Make your first pin: press `Create`, add a photo, a title such as "Navy monogrammed hand towels", a sentence about it, and the link to the matching page on your website. Choose a board, then press `Publish`.',
            see: 'Your pin on the board.',
          },
          {
            text: 'Give each board its cover: pin the matching **Pinterest board cover** from My brand kit (for example "Pinterest board cover: Towels") to that board, then choose it as the board cover. For any other board, use **Pinterest board cover: plain**.',
            see: 'Your boards wear matching covers with your seal.',
          },
        ],
      },
      SCREENS_VARY,
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Which link for each pin',
        text: 'Point each pin at the page it shows: towels at your Towels page, baby gifts at Baby and kids, and so on. If you are not sure, use your quote page.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Pinterest may ask you to "claim" your website',
        text: 'This proves the website is yours. It needs a small technical step on the website side. Ask Nathan: he can do it in a few minutes.',
      },
      {
        kind: 'p',
        text: 'Add your Pinterest address to your website the same way as Facebook: My business details, `Your Facebook, Instagram and other pages`, pick **Pinterest**, paste, `Publish`. A small Pinterest button appears in your footer.',
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Open one of your pins and tap it. It opens the right page on your website.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'p',
        text: 'Pinterest is a nice extra, not a must. If it gets fiddly, pause it and carry on with Google and Facebook.',
      },
      STAY_SAFE,
      { kind: 'seealso', ids: ['photos-that-sell', 'instagram-account', 'make-profiles-match'] },
    ],
    maintenance:
      'Checked 2026-10-05 against Pinterest Help: "Get a business account" (help.pinterest.com/en/business/article/get-a-business-account): pinterest.com > Sign up > Create a business account, email, password, age, profile and business info, whether to run ads; free. "Claim your website" (help.pinterest.com/en/business/article/claim-your-website): four ways: Google Merchant Center, a meta tag, an uploaded file, or a DNS TXT record. Nathan can add the TXT record in Cloudflare DNS (no site code change). Footer.astro has a Pinterest icon. Board names match the brand kit board covers (HIGHLIGHTS in src/lib/brand/brandKit.ts: Towels, Totes, Baby, Hats, Custom, plus plain; 600x600), checked 2026-10-05.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'local-free-places',
    category: CAT,
    title: 'Free local places to be seen',
    icon: 'heart',
    badge: 'You can do this yourself',
    summary:
      'Nextdoor, local Facebook groups, the chamber of commerce, craft fairs and a few directories. Plus the one rule that matters everywhere: the same name, phone and email on every listing.',
    time: 'About 15 minutes for each place',
    cost: 'Mostly free. A chamber membership or a craft fair table costs money: check the price with them first.',
    blocks: [
      { kind: 'h', text: 'The one rule: say it the same way everywhere' },
      {
        kind: 'p',
        text: 'Google compares your listings across the internet. If they all match, it trusts them more. Use exactly these, every time:',
      },
      {
        kind: 'bullets',
        items: [
          'Name: **MAS Monograms**',
          'Phone: **(803) 707-8576**',
          'Email: **mastone37@gmail.com**',
          'Town: **St. Matthews, SC** (no street, since you work from home)',
          `Website: **${SITE}**`,
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'If you ever change your phone or email',
        text: 'Change it on your website first, then on Google, Facebook, Instagram and every other place in this guide. Keep a list of where you are listed so you can find them all.',
      },
      { kind: 'h', text: 'Nextdoor (your neighbors)' },
      {
        kind: 'path',
        label: 'Open Nextdoor for business',
        detail: 'Opens in a new tab. Look for `Claim your free Business Page`.',
        to: { url: 'https://business.nextdoor.com' },
      },
      {
        kind: 'steps',
        items: [
          'Choose to claim a free business page, and connect it to your own Nextdoor account if you have one.',
          'Add your name, phone, website, photos and a short description.',
          {
            text: 'Post an introduction with a photo: who you are, what you stitch, and how to ask for a quote.',
            see: 'Your post in the local feed. Nextdoor lets a free business page post to nearby neighbors a couple of times a month.',
          },
          {
            text: 'Copy your Nextdoor business page address. In My business details, `Your Facebook, Instagram and other pages`, add a row, pick **Nextdoor**, paste it, then press `Publish`.',
            see: 'A Nextdoor button in your website footer.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Nextdoor may ask for proof',
        text: 'For some home businesses Nextdoor asks for a business paper before you can post to neighbors. If it does, check with Nathan.',
      },
      { kind: 'h', text: 'Local Facebook groups' },
      {
        kind: 'bullets',
        items: [
          'Search Facebook groups for **St. Matthews**, **Calhoun County**, **Orangeburg** and **Columbia SC buy local**.',
          'Join two or three. Read the group rules first: many allow business posts only on a certain day.',
          'Post as yourself, warmly: a photo and "I am Mary Ann, I stitch monograms from my home in St. Matthews. Happy to help with gifts."',
          'Answer when someone asks "does anyone know who does monogramming?" That is your best moment.',
        ],
      },
      { kind: 'h', text: 'Chambers of commerce and craft fairs' },
      {
        kind: 'bullets',
        items: [
          'The Calhoun County and Orangeburg County chambers of commerce, and the Columbia chamber, list local businesses. Joining usually costs a yearly fee, so ask what is included before paying.',
          'Church bazaars, school fairs, holiday markets and farmers markets are good places to show your work in person. Bring QR code cards (see "Put a QR code on my tags and cards").',
        ],
      },
      { kind: 'h', text: 'Other directories' },
      {
        kind: 'p',
        text: 'Yelp and Yellow Pages style sites may list you. A free listing is fine if you want it. Use exactly the same name, phone and email. You never need to pay them.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Paid listing calls',
        text: 'Once you are on Google, you may get calls or emails selling "premium listings", "SEO" or "guaranteed page one". You do not need any of them. Say no thank you, or ask Nathan.',
      },
      { kind: 'h', text: 'Etsy: only if you want it' },
      {
        kind: 'p',
        text: 'Etsy is a big online craft market. It brings shoppers, but it takes a fee on every listing and every sale, customers think of you as "an Etsy shop" rather than your own studio, and orders go through Etsy instead of your quote form. Your website already lets people ask for a quote for free. If you are curious, check the current fees on Etsy and talk to Nathan before signing up.',
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Search Google for **MAS Monograms** after a few weeks. You start to see your name on several of these sites, all with the same phone number.',
      },
      { kind: 'seealso', ids: ['google-business-profile', 'qr-codes', 'staying-safe'] },
    ],
    maintenance:
      'Checked 2026-10-05: Nextdoor business (business.nextdoor.com, help.nextdoor.com "Promoting a business or service on Nextdoor" and the Nextdoor business guide): free Business Page, claim via "Claim your free Business Page", professional business vs neighbor for hire, casual home services may need official business documents to post to the neighborhood feed, free pages can post twice a month (the guide says "a couple of times" to avoid quoting a number that changes). Etsy (help.etsy.com "Etsy Fee Basics"): US listing fee $0.20, transaction fee 6.5%, processing 3% + $0.25; deliberately NOT quoted to Mary Ann. Contact facts from live siteSettings on 2026-10-05: phone (803) 707-8576, email mastone37@gmail.com, address city St. Matthews / SC, no street. Chamber names are general; specific chamber fees not researched.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'tell-google-site-exists',
    category: CAT,
    title: 'Tell Google my website exists',
    icon: 'globe',
    badge: 'You can do this yourself',
    summary:
      'Good news: Nathan has already done this part. Here is what was done, and the one small thing you can do to help.',
    time: 'About 2 minutes to read',
    cost: 'Free',
    blocks: [
      { kind: 'h', text: 'What Nathan has done' },
      {
        kind: 'bullets',
        items: [
          'Your website is registered with **Google Search Console**, Google’s free tool for website owners. Nathan proved to Google that the website is yours in October 2026.',
          'He gave Google your website’s **sitemap**: a list of every page, so Google knows where to look. Your website keeps it up to date by itself.',
          'Every page tells Google your business name, town, phone, email and the area you serve, in a form Google reads.',
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why a new website takes time',
        text: 'Even when Google knows about a website, it decides by itself how often to show it. New websites start low and rise as people visit, link to it and leave reviews. That is why the listings and reviews in this part of the handbook matter so much.',
      },
      { kind: 'h', text: 'What you can do' },
      {
        kind: 'bullets',
        items: [
          'Keep adding photos and words to your website now and then. A website that changes looks alive to Google.',
          'Put your website link on every profile (Google, Facebook, Instagram, Pinterest).',
          'If you would like to see the Search Console numbers yourself, ask Nathan to add your Google account. He can show you on a call.',
        ],
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Search Google for **MAS Monograms**. Your website shows in the results. It can take a few weeks for many of your pages to appear.',
      },
      { kind: 'seealso', ids: ['google-business-profile', 'is-it-working'] },
    ],
    maintenance:
      'Verified 2026-10-05 from the repo and vault, not guessed: docs/08-deployment-and-status.md says mas-monograms.com is a verified Domain property in Search Console (DNS TXT in Cloudflare); vault note decision 2026-10-04 "Search Console verified, sitemap submitted". Live https://mas-monograms.com/robots.txt lists Sitemap: https://mas-monograms.com/sitemap-index.xml (200 on 2026-10-05). LocalBusiness data: src/lib/schemas.ts localBusinessSchema (name, website, email, telephone, address city/state, areaServed, sameAs from socialLinks) injected by BaseLayout.astro on every page. Search Console user roles (Owner / Full / Restricted, Settings > Users and permissions) from support.google.com/webmasters/answer/7687615.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'simple-online-ads',
    category: CAT,
    title: 'Simple online ads, honestly',
    icon: 'megaphone',
    badge: 'Check with Nathan first',
    summary:
      'What an ad is, what a small budget can and cannot do, the safest first step, how to stop, and why to wait until the free signs are up.',
    time: 'About 20 minutes to set up one small ad',
    cost: 'Free to read. Ads are optional and cost exactly what you choose to spend.',
    before: [
      'Your Facebook Page and Instagram set up, with a few weeks of posts.',
      'The free steps done for about 60 days first.',
      'A bank card (you type it in yourself, on Facebook only).',
      'A total amount you are comfortable losing completely.',
    ],
    blocks: [
      { kind: 'h', text: 'Free first' },
      {
        kind: 'p',
        text: 'An ad is paying Facebook (or Google) to show your post to people who would not see it otherwise. It can help, but it cannot fix a page with no photos or no reviews. So do the free things first, for about 60 days. Then decide with Nathan.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'The one rule about money',
        text: 'Only spend money you would be comfortable losing completely. An ad can run and bring no orders. That is normal, and it does not mean you did anything wrong. Nobody can promise results from an ad, and you should not trust anyone who does.',
      },
      { kind: 'h', text: 'The safest first step: boost one good post' },
      {
        kind: 'p',
        text: '**Boosting** a post means paying Facebook to show one of your existing posts to more people nearby. Pick your best recent photo post, one that friends already liked.',
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'On your Facebook Page, find the post and press `Boost post`.',
            see: 'A box with Goal, Audience, Budget and Duration.',
          },
          {
            text: 'For the goal, choose to get more people to your website or to message you, and use your quote page as the link.',
          },
          {
            text: 'For the audience, make a new one: your area (St. Matthews and a radius around it that you would deliver to), adults, and a few interests such as **gifts**, **embroidery** or **monogram**.',
          },
          {
            text: 'For the money, choose a **total** amount (Facebook may call it a lifetime budget) rather than a daily one, and a run of about a week. Facebook suggests at least $5 and at least six days.',
            see: 'The total you will be charged at most.',
          },
          {
            text: 'Check the summary, add your card if asked, and press `Boost`.',
            see: 'Facebook checks the ad first. This can take a little while.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why a total, not a daily amount',
        text: 'Facebook says a daily amount can be overspent on some days (it evens out over the week). A total amount keeps the whole spend inside your limit, which is easier to trust.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Turn off automatic boosting',
        text: 'Facebook sometimes offers to boost your posts automatically. Do not switch that on. You want to choose each ad yourself.',
      },
      { kind: 'h', text: 'How to stop an ad' },
      {
        kind: 'steps',
        items: [
          'On your Facebook Page, open `Ad Center` from the menu on the left.',
          'Find the ad, open the menu next to it, and press `Pause ad`.',
          {
            text: 'Check it says paused.',
            see: 'The ad stops and the spending stops. You only pay for what already ran.',
          },
        ],
      },
      { kind: 'h', text: 'How to read the results' },
      {
        kind: 'bullets',
        items: [
          '**Reach**: how many people saw it.',
          '**Link clicks**: how many tapped through to your website.',
          'The number that really matters: did any quote requests come in that week? Your quote form asks "How did you hear about MAS Monograms?", so check what people pick.',
        ],
      },
      { kind: 'h', text: 'Google Ads: not yet' },
      {
        kind: 'p',
        text: 'Google also sells ads, and it may email you offers once your listing is live. For a small home studio they are harder to set up well and easy to overspend on. Our advice is: not yet. Talk to Nathan before trying them.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'p',
        text: 'If the boxes are confusing, stop before pressing `Boost`. Nothing is charged until then. Set it up together with Nathan on a call.',
      },
      STAY_SAFE,
      { kind: 'seealso', ids: ['facebook-page', 'is-it-working', 'get-found-60-day-plan'] },
    ],
    maintenance:
      'Checked 2026-10-05 against Meta Business Help Center: "How to boost a post" (facebook.com/business/help/347839548598012): Boost Post button, budget, duration, audience; "Stop boosting a Page post" and "Pause or resume boosted posts" (/842035602492104, /2277978382474188): Ad Center > All ads > Pause ad; "Delete automatically boosted posts" (/2092161711083168) shows the automatic boosting feature exists; Ads pricing (facebook.com/business/ads/pricing): "start with at least $5 for your budget and choose a duration over six days", daily budgets may be exceeded by up to 75% on a day and average out over the week, lifetime budgets stay within the limit, "You can cancel or pause your ad at any time". The $5 / six days line is quoted to Mary Ann as Facebook’s suggestion; re-check it. Goal names vary, so the step describes the intent. Quote form referral options checked live 2026-10-05.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'reviews-and-word-of-mouth',
    category: CAT,
    title: 'Get reviews and word of mouth',
    icon: 'star',
    badge: 'You can do this yourself',
    summary:
      'Happy customers are your best sign. How to ask for a Google review, words you can paste, a referral card, and thank-you cards with a QR code.',
    time: 'About 5 minutes per customer',
    cost: 'Free (printing cards costs a little)',
    before: ['Your Google review link (see "Get my business on Google Search and Maps").'],
    blocks: [
      { kind: 'h', text: 'Asking for a review' },
      {
        kind: 'p',
        text: 'The best time to ask is when a customer thanks you or sends a happy message. Send the review link the same day.',
      },
      {
        kind: 'p',
        text: 'Words you can copy and paste into a text or email (put your review link at the end):',
      },
      {
        kind: 'bullets',
        items: [
          '"Thank you so much for your order! If you have a minute, a short Google review would mean a lot to a small home studio like mine. Here is the link: (your review link)"',
          '"I am so glad you love it. Would you be willing to share a photo of it in use? And if you have a moment, a Google review helps other people find me: (your review link)"',
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Google’s rule about reviews',
        text: 'Never offer a discount, a gift or anything else in return for a review. Google does not allow it and can remove reviews or the listing. Just ask kindly. Never write reviews yourself or ask family to pretend to be customers.',
      },
      { kind: 'h', text: 'Put the review link on your website' },
      {
        kind: 'p',
        text: 'Once you paste your review link into `Your Google review link` in My business details and press `Publish`, your website shows a **Leave a review** link in the footer of every page and on the thank-you page people see after asking for a quote. You can change its words in `Words on your review link`, for example to "Leave me a review".',
      },
      {
        kind: 'path',
        label: 'Open my Google review link',
        detail: 'My business details',
        to: { doc: 'siteSettings', field: 'googleReviewUrl' },
      },
      { kind: 'h', text: 'Answering reviews' },
      {
        kind: 'bullets',
        items: [
          'Reply to every review, kindly and briefly: "Thank you, Sarah! It was a joy to stitch."',
          'If a review is unhappy, stay calm, thank them, and offer to sort it out by phone. Other people read your reply more than the complaint.',
        ],
      },
      { kind: 'h', text: 'Words to describe yourself' },
      {
        kind: 'p',
        text: 'When someone asks "what do you do?", or in a message to a group, you can say:',
      },
      {
        kind: 'bullets',
        items: [
          '"I am Mary Ann. I run MAS Monograms, a one-woman embroidery studio from my home in St. Matthews. I stitch monograms and names on towels, totes, hats, baby gifts and more. You can ask me for a free quote at mas-monograms.com."',
        ],
      },
      { kind: 'h', text: 'Cards that bring people back' },
      {
        kind: 'bullets',
        items: [
          '**A thank-you card** in every order, with a QR code to your Google review link and a short handwritten note.',
          '**A referral card**: "Loved your monogram? Pass this card to a friend." with a QR code to your quote page.',
          'Your **business card** with your website and phone.',
        ],
      },
      {
        kind: 'path',
        label: 'Make a QR code',
        detail: 'Pick "Leave me a Google review" for a thank-you card.',
        to: { tool: 'qr-codes' },
      },
      { kind: 'h', text: 'An email list?' },
      {
        kind: 'p',
        text: 'Your website cannot collect email addresses for a newsletter today. For now, keep it simple: follow up with people by text or email one by one, and let Facebook and Instagram be your "newsletter". If you want a real email list later, ask Nathan.',
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Your stars and reviews show on your Google listing. A **Leave a review** link shows at the bottom of your website. On the quote form, more people pick "Word of mouth / referral" or "Returning customer".',
      },
      { kind: 'seealso', ids: ['google-business-profile', 'qr-codes', 'make-profiles-match'] },
    ],
    maintenance:
      'Checked 2026-10-05: Google Business Profile Help "Tips to get more reviews" (support.google.com/business/answer/3474122): incentives for reviews are "strictly prohibited"; reminding customers is fine; review link from answer/16816815. Site facts: there is no newsletter or email signup anywhere in the site (searched src 2026-10-05), so the guide says so. Quote form referral options live (rechecked 2026-10-05 after the Get found site pass): Facebook, Instagram, Google search, Word of mouth / referral, Returning customer, Local event or market, Pinterest, Nextdoor, Google Maps, A QR code on a tag or card, Other. Site review link: src/lib/review-link.ts (fallback words "Leave a review", from siteSettings.reviewLinkLabel "Words on your review link"), drawn by Footer.astro and src/pages/thank-you.astro when googleReviewUrl is set. QR tool id qr-codes confirmed in sanity.config.ts; review link box siteSettings.googleReviewUrl (title "Your Google review link") added by Phase E.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'photos-that-sell',
    category: CAT,
    title: 'Take photos that sell my work',
    icon: 'camera',
    badge: 'You can do this yourself',
    summary:
      'Better photos are the biggest single thing you can improve. How to take them with your phone by a window, a shot list, and how to add them to your website.',
    time: 'About 20 minutes for a set of photos',
    cost: 'Free',
    before: [
      'Your phone, with the lens wiped clean (a soft cloth is fine).',
      'A window with daylight, but not direct sun.',
      'A plain background: a white sheet, a linen tea towel, or a wooden table.',
    ],
    blocks: [
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why this matters',
        text: 'People cannot touch your stitching online. The photo is all they have, and a clear, bright photo is what makes them ask for a quote.',
      },
      { kind: 'h', text: 'How to take a good photo' },
      {
        kind: 'steps',
        items: [
          'Turn off the room lights. Use only the daylight from the window, coming from the side.',
          'Lay the item flat on your plain background, or hang it, close to the window.',
          'Smooth out creases and remove lint. Tuck away tags and threads.',
          'Hold the phone steady, straight above or straight in front. Do not use the flash.',
          'Tap the screen on the stitching so it is sharp.',
          {
            text: 'Take several photos, then pick the best one.',
            see: 'Bright, sharp stitching with no shadows across it.',
          },
        ],
      },
      { kind: 'h', text: 'A shot list for each piece' },
      {
        kind: 'bullets',
        items: [
          '**Close-up** of the stitching, filling most of the photo.',
          '**The whole item**, so people see what it is.',
          '**In use**: the towel on a rail, the tote on a shoulder, the hat being worn.',
          '**Before and after**, if a customer brought their own item.',
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Keep a consistent look',
        text: 'Use the same window, the same background and the same time of day. Your photos then look like a set, on your website and on Instagram.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Ask first',
        text: 'If a customer’s name or a child’s name is stitched on the item, ask the customer before you share the photo.',
      },
      { kind: 'h', text: 'Add them to your website' },
      {
        kind: 'path',
        label: 'Add a photo of my work',
        detail: 'Opens a new, empty photo in Photos of my work.',
        to: { create: 'galleryItem', template: 'new-photo' },
      },
      {
        kind: 'p',
        text: 'Then use the same photo on Facebook, Instagram, Pinterest and your Google listing that week.',
      },
      { kind: 'seealso', ids: ['add-a-photo', 'instagram-account', 'pinterest-account'] },
    ],
    maintenance:
      'Written 2026-10-05 as general phone photography advice (no platform facts). The site weak spot is photo quality (PRODUCT.md, spec). Path target uses the same create target as the Welcome card "Add a photo of my work" (welcomeTasks.ts: create galleryItem, template new-photo). See also add-a-photo is the editing guide written by B1.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'make-profiles-match',
    category: CAT,
    title: 'Make my profiles match',
    icon: 'text',
    badge: 'You can do this yourself',
    summary:
      'The same logo, the same words and the same link on every profile, so people recognize you anywhere. Words you can copy are below.',
    time: 'About 10 minutes per profile',
    cost: 'Free',
    blocks: [
      { kind: 'h', text: 'Your pictures' },
      {
        kind: 'bullets',
        items: [
          '**Profile picture, everywhere** (Facebook, Instagram, Pinterest): **Profile picture (dark)**, 1080 by 1080. It is made to sit inside a circle. Use the same one on all three so people know it is you. If you prefer a light one, use **Profile picture (light)** everywhere instead.',
          '**Facebook cover**: **Facebook cover photo**, 1640 by 624 (or the smaller file, 820 by 312, if the big one is slow to upload).',
          '**Google**: **Google Business Profile logo**, 720 by 720, and **Google Business Profile cover photo**, 1080 by 608.',
          '**Instagram highlights**: the five **Instagram highlight covers** (Towels, Totes, Baby, Hats, Custom), 1080 by 1920.',
          '**Pinterest boards**: the matching **Pinterest board covers**, 600 by 600.',
          '**Email**: the **Logo for my email signature**, 600 by 150.',
          'All of these are in My brand kit under "Pictures for Facebook, Instagram, Pinterest and Google", already the right size. Press `Download this picture` under the one you need.',
        ],
      },
      {
        kind: 'path',
        label: 'Open My brand kit',
        detail: 'Profile pictures, covers and logos, ready to download.',
        to: BRAND_KIT,
      },
      { kind: 'h', text: 'Your words, ready to copy' },
      {
        kind: 'p',
        text: '**One sentence** (for bios and short boxes):',
      },
      {
        kind: 'bullets',
        items: ['"Hand-stitched monograms and embroidery, made locally in St. Matthews, SC."'],
      },
      {
        kind: 'p',
        text: '**A short "About me"** (for Google, Facebook and Nextdoor):',
      },
      {
        kind: 'bullets',
        items: [
          '"MAS Monograms is a one-woman home embroidery studio in St. Matthews, SC. I am Mary Ann, and I stitch every order myself: monograms and names on towels, totes, hats, sweatshirts, baby gifts and more. You can bring your own item, too. Ask for a free quote and I will reply within 1 business day. You approve the price before I stitch."',
        ],
      },
      {
        kind: 'p',
        text: '**Instagram bio** (three short lines):',
      },
      {
        kind: 'bullets',
        items: ['"Hand-stitched monograms by Mary Ann / St. Matthews, SC / Free quotes below"'],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'If you change your one-line description',
        text: 'Your one-line description also shows in your website footer. You can change it in My business details, `Your one-line description`. Then copy the new words to your profiles.',
      },
      {
        kind: 'path',
        label: 'Open my one-line description',
        detail: 'My business details',
        to: { doc: 'siteSettings', field: 'tagline' },
      },
      { kind: 'h', text: 'Your link' },
      {
        kind: 'p',
        text: `Use your quote page on every profile: ${QUOTE}. Where there is room for a second link, add your home page: ${SITE}.`,
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Open your Google listing, Facebook Page and Instagram one after another. They show the same logo, the same words and the same phone number.',
      },
      { kind: 'seealso', ids: ['brand-kit-anywhere', 'facebook-page', 'instagram-account'] },
    ],
    maintenance:
      'All words built 2026-10-05 from the live site copy only: siteSettings.tagline "Hand-stitched monograms and embroidery, made locally in St. Matthews, SC."; aboutPage heroSubhead ("one-woman home embroidery studio"), story ("every order comes directly to me"), ctaSubhead ("I’ll reply within 1 business day"); homePage heroSubhead (items list) and makerFacts ("You approve the price before I stitch"). Bring Your Own Item is a real category page. No invented years or awards. If the reply promise changes on the site, change it here. Picture names and sizes from src/lib/brand/brandKit.ts KIT_IMAGES, checked 2026-10-05; Profile picture (dark) is what the kit recommends for Facebook, Instagram and Pinterest.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'is-it-working',
    category: CAT,
    title: 'How do I know if it is working?',
    icon: 'chart',
    badge: 'Mostly yourself',
    summary:
      'Where to look once a month, what the numbers mean, and what to expect. Realistic, not rosy.',
    time: 'About 20 minutes once a month',
    cost: 'Free',
    blocks: [
      {
        kind: 'callout',
        tone: 'why',
        title: 'What to expect',
        text: 'Small numbers at first are normal. A few people finding you each week, then a little more each month, is a good start for a new home business. The number that matters most is quote requests.',
      },
      { kind: 'h', text: 'Your Google listing' },
      {
        kind: 'steps',
        items: [
          'Search Google for **MAS Monograms** while signed in to your Google account. Your listing shows with tools for you.',
          {
            text: 'Press `Performance`.',
            see: 'How many people **viewed** your listing, how many pressed **call**, and how many pressed **website**.',
          },
          'Write the three numbers in a notebook each month, so you can compare.',
        ],
      },
      { kind: 'h', text: 'Facebook and Instagram' },
      {
        kind: 'bullets',
        items: [
          'On Facebook, open your Page and look for `Insights` or the professional dashboard. On Instagram, tap `Professional dashboard` on your profile.',
          'Look at **reach** (how many people saw your posts) and which post did best. Make more posts like that one.',
        ],
      },
      { kind: 'h', text: 'Your website' },
      {
        kind: 'p',
        text: 'Your website counts its visitors with Google Analytics, which Nathan set up in October 2026. It shows how many people visited and where they came from (Google, Facebook, a QR code). It is in Nathan’s account, so you do not have a login for it yet. Nathan can show you, or send you the numbers once a month.',
      },
      { kind: 'h', text: 'The best number: quote requests' },
      {
        kind: 'p',
        text: 'Each quote request email shows what the customer picked for "How did you hear about MAS Monograms?". The list already includes Pinterest, Nextdoor, Google Maps and "A QR code on a tag or card". Keep a tally in your notebook. You can add or change answers here:',
      },
      {
        kind: 'path',
        label: 'Open the "how did you hear about me" answers',
        detail: 'Pages on my website, Request a quote page',
        to: { doc: 'requestAQuotePage', field: 'referralOptions' },
      },
      { kind: 'h', text: 'Where they found you' },
      {
        kind: 'p',
        text: 'When someone asks for a quote after scanning one of your QR codes (or after tapping a specially tagged link), the quote email you receive has an extra line called **Where they found you**. For example: "QR code on a hang tag or label (campaign fall-fair)". The words in brackets are the name you gave that batch in `Name this batch` when you made the code. If the line is missing, the person came some other way.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Name your batches',
        text: 'When you make QR codes for something special, like a fall craft fair, type a short name in `Name this batch`. Then the email tells you exactly which batch worked.',
      },
      { kind: 'h', text: 'What to do with the numbers' },
      {
        kind: 'bullets',
        items: [
          'If Google views are low, ask for more reviews and add photos and updates to your listing.',
          'If people visit but do not ask for quotes, tell Nathan. That is a website question he can look at.',
          'After 60 days, look at it all with Nathan and decide whether a small ad is worth trying.',
        ],
      },
      {
        kind: 'seealso',
        ids: ['get-found-60-day-plan', 'simple-online-ads', 'tell-google-site-exists'],
      },
    ],
    maintenance:
      'Checked 2026-10-05: Google Business Profile Help "Understand your Business Profile performance" (support.google.com/business/answer/9918094): views on Search and Maps, calls, website clicks; only for verified profiles, signed in to the owning account. Instagram professional dashboard and Facebook Page insights are named generally (Meta renames these often). Analytics facts verified in the repo: GA4 G-JTX5TMPVQ0, property 557338771 in the Nixon Creative Studio account, live since 2026-10-04 (docs/08-deployment-and-status.md, vault). Cloudflare Web Analytics is not set. Mary Ann has no GA login: Nathan task. Referral list target requestAQuotePage.referralOptions (title "Answers they can pick from"). The quote email includes the referral answer (src/pages/api/quote.ts). Referral options rechecked live 2026-10-05 (Pinterest, Nextdoor, Google Maps, A QR code on a tag or card present). The owner email row "Where they found you" (src/lib/quote-email.ts, words from describeUtm in src/lib/utm.ts, e.g. "QR code on a hang tag or label (campaign fall-fair)") shows only when the visit carried utm tags; the customer email never shows it. QR links carry utm_source=qr&utm_medium=<placement>&utm_campaign=<batch or YYYY-MM> (src/lib/qr/url.ts).',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'staying-safe',
    category: CAT,
    title: 'Staying safe: calls and offers to ignore',
    icon: 'warning',
    badge: 'You can do this yourself',
    summary:
      'Once your business is listed, you will get calls and emails selling things. Here is how to tell what is real.',
    time: 'About 3 minutes to read',
    cost: 'Free',
    blocks: [
      { kind: 'h', text: 'Things that are always a scam' },
      {
        kind: 'bullets',
        items: [
          'Someone calling "from Google" saying your listing will be removed unless you pay. Google says it does not charge for Business Profiles and will never ask you to pay to keep, verify or restore one.',
          'Anyone asking you to read out a code that was just texted to you. Those codes are only for you to type in yourself.',
          'Anyone offering to put you "number one on Google" or "guaranteed page one". Google says there is no way to pay for a better place on its map listings.',
          'An email saying your Facebook Page will be deleted unless you click a link and sign in. Facebook warnings appear inside Facebook itself.',
        ],
      },
      { kind: 'h', text: 'What to do' },
      {
        kind: 'steps',
        items: [
          'Do not press any link in the message, and do not call back a number it gives.',
          'Hang up, or delete the email.',
          'If you are worried, open Google or Facebook yourself (not from the message) and look, or ask Nathan.',
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Your passwords are yours',
        text: 'Never give your password to anyone, not even someone helping you. If Nathan needs to help with an account, he can be added as a helper on it, with his own login.',
      },
      { kind: 'seealso', ids: ['google-business-profile', 'local-free-places'] },
    ],
    maintenance:
      'Checked 2026-10-05: Google Business Profile Help "Help protect your Google Business Profile" (support.google.com/business/answer/14509283): "Google doesn’t charge for this service", never asks for OTP or PIN, never tries to convince you to pay to maintain a profile incl. verification or reinstatement; support.google.com/business/answer/7091: "There’s no way to request or pay for a better local ranking on Google". The Facebook line is general advice, not a Meta quote.',
  },
];
