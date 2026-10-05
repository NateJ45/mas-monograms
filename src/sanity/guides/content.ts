// Safe to edit by hand (the words); keep the names in step with the Studio
// =============================================================================
// The editing guides: Start here, Change my website, Photos and clearance,
// When something goes wrong (Mary Ann's Studio, Phase B, 2026-10-05)
// =============================================================================
// Written for Mary Ann: short sentences, numbered steps, and after each step
// what she will SEE, so she knows she is on track. Shape and conventions:
// ./types.ts. Every name in `backticks` is something she clicks, and
// src/lib/studio-guides.test.ts checks each one against the real Studio (desk
// titles in structure.ts, tool titles in sanity.config.ts, box titles in the
// schema, and Sanity's own buttons). Rename a menu item and the test says which
// guide to fix.
//
// TRUE AS OF 2026-10-05 (spec principle 8):
//   - Publish rebuilds the website through the Sanity webhook "Rebuild live
//     site" and the Cloudflare deploy hook, wired 2026-10-05: about 2 to 3
//     minutes.
//   - Undo is "Undo last change" in the three-dots menu beside Publish
//     (src/sanity/editorActions.ts), and Ctrl+Z outside a text box.
//   - TRASH (Phase D, actions/trash.tsx): photos, clearance items, questions,
//     price tags, thread colors and fonts have "Move to Trash" in the
//     three-dots menu instead of Delete. "Trash (bring things back)" on the
//     desk has "Bring it back" and "Delete forever" (asks twice, final).
//     Categories and pages cannot be trashed. Moving to Trash takes the item
//     off the website on the next rebuild with no Publish.
//   - DRAG TO REORDER (Phase D, dragList in structure.ts): photos, clearance
//     items, price tags, questions, fonts, shop categories. A drag is saved
//     straight away and reaches the website on the next rebuild, no Publish.
//   - The share link (actions/shareLink.tsx) works only on https (her real
//     website address), not on a test copy, and stops after about an hour.
//   - Published category and legal page web addresses are locked ("Ask
//     Nathan to change this", components/LockedAddressInput.tsx).
//   - "Edit on the page" is the Presentation tool (Phase C is making it show
//     the real redesigned pages). The steps here describe the click, type,
//     Publish flow, which is the same either way.
// =============================================================================

import type { Guide } from './types.ts';

const WAIT = 'about 2 to 3 minutes';

export const editingGuides: Guide[] = [
  // ───────────────────────────────────────────────────────────── Start here ──
  {
    id: 'start-here',
    category: 'Start here',
    title: 'How your Studio works',
    icon: 'wave',
    badge: 'You can do this yourself',
    summary:
      'Three minutes that make everything else easy: what Publish does, why you wait a moment, and why it is safe to look around.',
    time: 'About 3 minutes to read',
    blocks: [
      {
        kind: 'p',
        text: 'This is your **Studio**. It is private, and only you can see it. Your **website** is what your customers see. You change things here, and they appear on your website.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'It is safe to look around',
        text: 'Nothing you do here reaches your website until you press `Publish`. You can open things, click around and type. If you do not press Publish, your website stays exactly as it was.',
      },
      { kind: 'h', text: 'How a change gets onto your website' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Open the thing you want to change from the menu on the left, or from a big button on the Welcome page.',
            see: 'The boxes for that page or photo open on the right.',
          },
          {
            text: 'Type your change in the box.',
            see: 'Your typing is kept as you go. You do not need to press Save.',
          },
          {
            text: 'When it looks right, press `Publish` at the bottom right.',
            see: 'A small note says it is published and will be on your website in about 2 to 3 minutes.',
          },
          {
            text: 'Wait 2 or 3 minutes, then refresh your website.',
            see: 'Your change is there.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why the wait?',
        text: `Each time you press Publish, your website rebuilds itself in the background. That takes ${WAIT}. It is normal for your change not to show the same second.`,
      },
      { kind: 'h', text: 'Getting back to the start' },
      {
        kind: 'p',
        text: 'Click `Welcome` at the top of the menu on the left whenever you feel lost. It has big buttons for the jobs you do most.',
      },
      {
        kind: 'path',
        label: 'Open the Welcome page',
        detail: 'The first item in the menu on the left',
        to: { pane: 'welcome' },
      },
      { kind: 'seealso', ids: ['find-your-way', 'undo-a-change', 'nothing-happened'] },
    ],
  },
  {
    id: 'find-your-way',
    category: 'Start here',
    title: 'Finding your way around',
    icon: 'list',
    badge: 'You can do this yourself',
    summary: 'What is in the menu on the left and the bar at the top, in plain words.',
    time: 'About 3 minutes to read',
    blocks: [
      { kind: 'h', text: 'The bar along the top' },
      {
        kind: 'bullets',
        items: [
          '`Edit my content` is where you are now: the menu on the left and the boxes you type in.',
          '`Edit on the page` shows your website. You can click words on it and change them right there.',
          '`My photo library` shows every photo you have ever added, in one place.',
          '`What needs attention` looks over your website and lists anything worth fixing, like a photo with no description.',
          '`Make a QR code` and `My brand kit` are there too. They are also in the menu on the left.',
        ],
      },
      { kind: 'h', text: 'The menu on the left' },
      {
        kind: 'bullets',
        items: [
          '`Welcome`: big buttons for the jobs you do most.',
          '`Help (how do I...?)`: these guides, and quick answers.',
          '`What needs attention`: anything on your website worth fixing.',
          '`My business details`: your phone number, email, address, hours and the menus.',
          '`Pages on my website`: the words on every page, one page at a time.',
          '`Photos of my work`: your gallery photos, in the same order as on your website. Drag a photo up or down to move it.',
          '`Clearance and prices`: your clearance items and the price tags on your Pricing page.',
          '`Fonts, threads and categories`: your embroidery fonts, thread colors and shop categories.',
          '`Questions and answers`: the questions on your How It Works and Pricing pages.',
          '`Make a QR code` and `My brand kit`: a QR code for your tags and cards, and your logo, colors and fonts.',
          '`Trash (bring things back)`: anything you moved to Trash. Open one and press `Bring it back`.',
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Lists you can put in order',
        text: 'When a list says "drag to put them in the order you want" at the top, you can drag the rows to change the order on your website. See "Put my photos in the order I want".',
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Click an item in the menu on the left.',
            see: 'A new column opens beside it with what is inside.',
          },
          {
            text: 'Click the thing you want in that new column.',
            see: 'Its boxes open on the right, ready to type in.',
          },
          {
            text: 'To go back, click a different item in the menu on the left, or click `Welcome`.',
            see: 'The columns change to match what you clicked. Nothing is lost.',
          },
        ],
      },
      {
        kind: 'seealso',
        ids: [
          'start-here',
          'cant-find',
          'reorder-photos',
          'share-before-publish',
          'deleted-something',
        ],
      },
    ],
  },
  {
    id: 'undo-a-change',
    category: 'Start here',
    title: 'Undo a change',
    icon: 'undo',
    badge: 'You can do this yourself',
    summary: 'Typed the wrong thing, or changed something by mistake? Here is how to take it back.',
    time: 'About 1 minute',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Look at the bottom right, beside the `Publish` button. Click the button with three dots.',
            see: 'A short menu opens.',
          },
          {
            text: 'Click `Undo last change`.',
            see: 'Your last change goes away. Click it again to go back one more step.',
          },
          {
            text: 'Changed your mind? Click the three dots again and choose `Redo`.',
            see: 'The change comes back.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'A quicker way on a computer',
        text: 'Inside a box you are typing in, press Ctrl and Z together (Command and Z on a Mac) to undo your typing.',
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Not published yet? Then nothing is lost',
        text: 'Until you press Publish, your website still shows the old version. So a mistake you have not published has not reached anyone. Undo works on these unpublished changes; once a change is published, see "I made a mistake".',
      },
      { kind: 'seealso', ids: ['made-a-mistake'] },
    ],
  },

  // ─────────────────────────────────────────────────────── Change my website ──
  {
    id: 'edit-on-the-page',
    category: 'Change my website',
    title: 'Change words by clicking them on the page',
    icon: 'edit',
    badge: 'You can do this yourself',
    summary:
      'The easiest way to change words: look at your website, click the words, type the new ones.',
    time: 'About 5 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Edit on the page` in the bar at the top of the Studio.',
            see: 'Your website appears, with a list of your pages beside it.',
          },
          {
            text: 'Click the page you want in the list, or scroll your website to find the words.',
            see: 'The page you picked shows.',
          },
          {
            text: 'Click the words you want to change.',
            see: 'A box opens with those words in it.',
          },
          {
            text: 'Type your new words.',
            see: 'Your page shows the new words straight away. Only you can see them for now.',
          },
          {
            text: 'When it all looks right, press `Publish`.',
            see: `A note says it is published. Your customers see it in ${WAIT}.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        text: 'Some parts of a page, such as your photos and prices, come from their own lists. If clicking does not open a box, use the menu on the left instead. The guide "Change the words on a page (the form way)" shows how.',
      },
      {
        kind: 'path',
        label: 'Open Edit on the page',
        detail: 'In the bar at the top of the Studio',
        to: { tool: 'presentation' },
      },
      { kind: 'seealso', ids: ['page-words-form', 'what-each-page-is'] },
    ],
  },
  {
    id: 'business-details',
    category: 'Change my website',
    title: 'Change my phone number, email, address or hours',
    icon: 'phone',
    badge: 'You can do this yourself',
    summary:
      'Your contact details live in one place and show all over your website, so you only change them once.',
    time: 'About 3 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `My business details` in the menu on the left.',
            see: 'The boxes for your business open, starting with the `Name and contact details` tab.',
          },
          {
            text: 'Find the box you want: `Phone number`, `Email address`, `Business address` or `Opening hours`.',
            see: 'Each box has a short note under its name saying what it is for.',
          },
          {
            text: 'Click in the box and type the new details.',
            see: 'Your new words are in the box.',
          },
          {
            text: 'Press `Publish`.',
            see: `A note says it is published. In ${WAIT} the new details show in the footer of every page and in the phone menu.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Keep them the same everywhere',
        text: 'If you change your phone number or address, change it on Google, Facebook and anywhere else you are listed too. Google trusts a business more when the details match.',
      },
      {
        kind: 'path',
        label: 'Open My business details',
        detail: 'Opens on your phone number',
        to: { doc: 'siteSettings', field: 'phone' },
      },
    ],
  },
  {
    id: 'change-a-price',
    category: 'Change my website',
    title: 'Change a price on the Pricing page',
    icon: 'tag',
    badge: 'You can do this yourself',
    summary:
      'Each price on your Pricing page is its own small price tag that you can open and change.',
    time: 'About 2 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Clearance and prices` in the menu on the left, then `Price tags on the Pricing page`.',
            see: 'A list of your price tags, for example "Basic Monogram".',
          },
          {
            text: 'Click the price tag you want to change.',
            see: 'Its boxes open: `Name on the tag`, `Price per piece, in dollars`, `Short note` and more.',
          },
          {
            text: 'In `Price per piece, in dollars`, type just the number, for example 16 or 12.50.',
            see: 'The $ sign is added for you on the website.',
          },
          {
            text: 'Press `Publish`.',
            see: `The new price is on your Pricing page in ${WAIT}.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        text: 'Turn on `Make this tag stand out` for the one price you recommend most. It gets a highlight on the page. Use it on one tag only.',
      },
      {
        kind: 'path',
        label: 'Open my price tags',
        detail: 'Clearance and prices, then Price tags on the Pricing page',
        to: { pane: 'clearance-and-prices;price-tags' },
      },
    ],
  },
  {
    id: 'share-before-publish',
    category: 'Change my website',
    title: 'Show someone a page before I publish',
    icon: 'envelope',
    badge: 'You can do this yourself',
    summary:
      'Copy a link that shows a page with your changes, so a friend or customer can look before it is on your website.',
    time: 'About 2 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Open the page you changed, for example from `Pages on my website`.',
            see: 'Its boxes, with your changes in them.',
          },
          {
            text: 'Click the three dots beside `Publish` and choose `Copy a link so someone can see this before it is on your website`.',
            see: 'A note says "Link copied".',
          },
          {
            text: 'Paste the link into an email or a text message, and send it.',
            see: 'The person opens the page with your changes. They do not need to sign in.',
          },
          {
            text: 'When you are both happy, press `Publish`.',
            see: `Everyone sees it in ${WAIT}.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'The link only lasts about an hour',
        text: 'After about an hour the link stops working. That keeps your unfinished changes private. If they need another look, press the button again for a new link.',
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'It only works from your real website address',
        text: 'Make the link from your Studio on your real website address (your website, then /studio). If you are using a test copy on a computer, the Studio says "This link would not work from here" instead of giving you a link that would not open.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        text: 'The button is on your pages and shop categories. It is not on `My business details` or the legal pages, because there is no single page to show.',
      },
      { kind: 'seealso', ids: ['edit-on-the-page', 'google-preview'] },
    ],
  },
  {
    id: 'google-preview',
    category: 'Change my website',
    title: 'See how my page will look on Google',
    icon: 'globe',
    badge: 'You can do this yourself',
    summary:
      'Each page has a small picture of how it shows up on Google, and when someone shares it. It changes as you type.',
    time: 'About 5 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Open a page from `Pages on my website`.',
            see: 'Its boxes, with tabs along the top.',
          },
          {
            text: 'Click the last tab, `Google and sharing`.',
            see: 'A box called `How this looks on Google`, with your page drawn the way Google shows it: the address, the blue title and a sentence or two.',
          },
          {
            text: 'Change the words in `Title in Google and on the browser tab` and `Short description for Google`.',
            see: 'The picture changes as you type. A note under it says whether the length is good.',
          },
          {
            text: 'If you like, add a `Picture when this page is shared`.',
            see: 'The card below shows how a shared link will look on Facebook or in a text message.',
          },
          {
            text: 'Press `Publish`.',
            see: `Your website uses the new words in ${WAIT}. Google itself can take days or weeks to notice.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'What makes a good one',
        text: 'Say what the page is and where you are, in words a customer would search for. For example: "Custom monogrammed towels, St. Matthews, SC". Keep the title short, about 50 to 60 letters, and the description about 150 to 160.',
      },
      {
        kind: 'callout',
        tone: 'why',
        text: 'You do not have to fill these in. An empty box uses your usual title and a general description. Writing your own simply helps people choose your page.',
      },
      { kind: 'path', label: 'Open Pages on my website', to: { pane: 'pages' } },
      { kind: 'seealso', ids: ['page-words-form'] },
    ],
  },
  {
    id: 'page-words-form',
    category: 'Change my website',
    title: 'Change the words on a page (the form way)',
    icon: 'page',
    badge: 'You can do this yourself',
    summary:
      'Every heading and sentence on a page has its own box. Use this when you would rather not click on the page itself.',
    time: 'About 5 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Pages on my website` in the menu on the left.',
            see: 'A list of your pages, such as `Home page`, `About page` and `Pricing page`.',
          },
          {
            text: 'Click the page you want.',
            see: 'Its boxes open. Along the top are tabs, such as `Top of the page`, that split the page into parts, from the top of the page down.',
          },
          {
            text: 'Click the tab for the part of the page you want, then find the box. The name and the note under it say where it shows.',
            see: 'For example `Headline` is the big heading at the very top.',
          },
          {
            text: 'Type your new words.',
            see: 'A yellow note may appear if the words are getting long. It is only a tip. A red note means the box needs filling in.',
          },
          {
            text: 'Press `Publish`.',
            see: `The page changes on your website in ${WAIT}.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'A box you leave empty is hidden',
        text: 'Many boxes say "Leave it empty to hide it". That is safe: the page simply leaves that line out.',
      },
      {
        kind: 'path',
        label: 'Open Pages on my website',
        to: { pane: 'pages' },
      },
      { kind: 'seealso', ids: ['edit-on-the-page', 'what-each-page-is'] },
    ],
  },
  {
    id: 'questions',
    category: 'Change my website',
    title: 'Add or change a question and answer',
    icon: 'question',
    badge: 'You can do this yourself',
    summary:
      'The questions customers ask most, shown on your How It Works page, your Pricing page, or both.',
    time: 'About 5 minutes',
    blocks: [
      { kind: 'h', text: 'Change a question you already have' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Questions and answers` in the menu on the left.',
            see: 'A list of your questions.',
          },
          {
            text: 'Click the question you want to change.',
            see: 'Its `Question` and `Answer` boxes open.',
          },
          {
            text: 'Change the words, then press `Publish`.',
            see: `The page shows your new words in ${WAIT}.`,
          },
        ],
      },
      { kind: 'h', text: 'Add a new question' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Questions and answers`, then the + button at the top of the list (`Add a question`).',
            see: 'A new question opens with words in [square brackets] to replace.',
          },
          {
            text: 'Type the question the way a customer would ask it. Then type your answer in your own words.',
            see: 'A yellow note stays until all the [square brackets] are gone.',
          },
          {
            text: 'Choose where it shows: `Show on the How It Works page`, `Show on the Pricing page`, or both. Pick a `Topic`.',
            see: 'Questions on the same topic are kept together on the page.',
          },
          { text: 'Press `Publish`.', see: `It is on your website in ${WAIT}.` },
        ],
      },
      {
        kind: 'path',
        label: 'Add a new question now',
        to: { create: 'faqItem', template: 'new-question' },
      },
    ],
  },
  {
    id: 'monogram-preview',
    category: 'Change my website',
    title: 'Change the words in the Monogram preview',
    icon: 'sparkle',
    badge: 'You can do this yourself',
    summary:
      'The Monogram preview on your home page lets visitors type initials and watch them stitched. All its words are yours to change.',
    time: 'About 5 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Pages on my website`, then `Monogram preview`.',
            see: 'Its boxes open, with tabs such as `Words above the preview`, `Labels on the choices` and `Buttons and notice`.',
          },
          {
            text: 'Click the tab for the words you want. The note under each box says where it shows.',
            see: 'The words you want to change.',
          },
          {
            text: 'Type your new words, then press `Publish`.',
            see: `The preview on your home page uses them in ${WAIT}.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Please keep the notice',
        text: 'The notice that says this is only a preview, and that you confirm a proof before stitching, protects you. Change its words if you like, but keep what it says.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Initials only in the examples',
        text: "The sample monograms should be made-up initials, never a real customer's name.",
      },
      {
        kind: 'path',
        label: 'Open the Monogram preview',
        to: { doc: 'atelierSettings' },
      },
    ],
  },
  {
    id: 'what-each-page-is',
    category: 'Change my website',
    title: 'What each page on my website is for',
    icon: 'page',
    badge: 'You can do this yourself',
    summary: 'A short tour of your pages, in the order they appear under Pages on my website.',
    time: 'About 3 minutes to read',
    blocks: [
      {
        kind: 'bullets',
        items: [
          '**Home page**: your front page. The first thing most visitors see.',
          "**Shop by Item page**: a card for each kind of item you embroider, such as towels or totes. Each card opens that item's own page.",
          '**Style Gallery page**: the words around your photos. The photos themselves come from `Photos of my work`.',
          '**Pricing page**: the words around your price tags. The prices come from `Price tags on the Pricing page`.',
          '**How It Works page**: the steps of ordering from you, and questions.',
          '**About page**: your story.',
          '**Request a Quote page**: the form customers fill in to ask for a quote. You can change every question on it.',
          '**Font and Lettering Guide page** and **Thread Color Chart page**: help customers pick a font and a color. The fonts and colors come from their own lists.',
          '**Monogram preview**: on your home page, where visitors try their initials.',
          '**Clearance page**: the words around your clearance items.',
          '**Thank You page**: shown right after someone sends the quote form.',
          '**"Page not found" page**: shown when someone follows a broken link.',
          '**Privacy, terms and other legal pages**: the small print linked from the footer.',
        ],
      },
      {
        kind: 'path',
        label: 'Open Pages on my website',
        to: { pane: 'pages' },
      },
      { kind: 'seealso', ids: ['page-words-form', 'edit-on-the-page'] },
    ],
  },

  // ───────────────────────────────────────────────────── Photos and clearance ──
  {
    id: 'add-a-photo',
    category: 'Photos and clearance',
    title: 'Add a photo of my work',
    icon: 'image',
    badge: 'You can do this yourself',
    summary:
      'Every photo you add shows in your Style Gallery, and on the page for that kind of item.',
    time: 'About 5 minutes per photo',
    before: [
      'The photo on this computer or phone. Square photos look best.',
      'A few words about what it shows.',
    ],
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'On the Welcome page, click `Add a photo of my work`. (Or click `Photos of my work` in the menu, then the + button at the top, `Add a photo of my work`.)',
            see: 'A new, empty photo opens.',
          },
          {
            text: 'Drag your photo into the `Photo` box, or click `Upload` and choose it.',
            see: 'Your photo appears in the box after a moment.',
          },
          {
            text: 'In `Describe the photo in a few words`, say what it shows, for example "Navy monogram on a white hand towel".',
            see: 'The red note under the box goes away once you type.',
          },
          {
            text: 'In `What kind of item is it?`, pick the shop category, for example Towels & Linens.',
            see: "The photo will also show on that item's page.",
          },
          {
            text: 'If you know it, pick the font in `Which font did you use?`. Add a few `Tags` if you like, pressing Enter after each one.',
            see: 'These help customers filter the gallery.',
          },
          {
            text: 'Press `Publish`.',
            see: `Your photo is in the gallery in ${WAIT}.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Choosing a photo',
        text: 'Pick a photo where the stitching is sharp and well lit. Daylight from a window is best. Take it straight on, close enough to see the thread.',
      },
      {
        kind: 'path',
        label: 'Add a photo now',
        to: { create: 'galleryItem', template: 'new-photo' },
      },
      { kind: 'seealso', ids: ['photo-description', 'photo-focus', 'round-hoop'] },
    ],
  },
  {
    id: 'reorder-photos',
    category: 'Photos and clearance',
    title: 'Put my photos in the order I want',
    icon: 'list',
    badge: 'You can do this yourself',
    summary:
      'Drag a photo up or down the list to move it on your website. The same works for clearance items, price tags, questions, fonts and shop categories.',
    time: 'About 2 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Photos of my work` in the menu on the left.',
            see: 'Your photos in the same order as your Style Gallery. The top of the list says "drag to put them in the order you want".',
          },
          {
            text: 'Point at the photo you want to move. Press and hold the mouse button on it.',
            see: 'The row lifts so you can move it.',
          },
          {
            text: 'Drag it up or down to where you want it, and let go.',
            see: 'It stays in its new place. The new order is kept straight away.',
          },
          {
            text: 'Wait 2 or 3 minutes, then refresh your website.',
            see: 'Your photos in the new order. You do not need to press Publish for a move.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Favorites always come first',
        text: 'Photos marked `A favorite` are shown first in the gallery, whatever their place in the list.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Other lists you can drag',
        text: '`Clearance items for sale`, `Price tags on the Pricing page`, `Questions and answers`, `Embroidery fonts` and `Shop categories (Hats, Totes...)` work the same way. Thread colors are sorted by color for you.',
      },
      { kind: 'path', label: 'Open Photos of my work', to: { pane: 'photos' } },
      { kind: 'seealso', ids: ['add-a-photo'] },
    ],
  },
  {
    id: 'photo-description',
    category: 'Photos and clearance',
    title: 'Write a good description for a photo',
    icon: 'text',
    badge: 'You can do this yourself',
    summary:
      'A few words for each photo help people who cannot see it, and help Google show your work.',
    time: 'About 1 minute per photo',
    blocks: [
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why it matters',
        text: 'Some of your customers cannot see well, and their phone reads the page aloud to them. Your description is what it reads for each photo. Google reads it too, which helps people find your work when they search.',
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Open the photo from `Photos of my work`.',
            see: 'The photo and its boxes.',
          },
          {
            text: 'In `Describe the photo in a few words`, say what someone would see: the item, the color of the thread, the lettering.',
            see: 'For example "Three-letter monogram in navy on white linen napkins".',
          },
          {
            text: 'Keep it to one short sentence. You do not need to start with "A photo of".',
            see: "The list on the left now shows your description as the photo's name.",
          },
          { text: 'Press `Publish`.', see: `It is saved on your website in ${WAIT}.` },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        text: '`What needs attention` lists any photo that is missing its description, with a button to open it.',
      },
      { kind: 'path', label: 'Open Photos of my work', to: { pane: 'photos' } },
    ],
  },
  {
    id: 'photo-focus',
    category: 'Photos and clearance',
    title: 'Choose the most important part of a photo',
    icon: 'circle',
    badge: 'You can do this yourself',
    summary:
      'Your website trims photos to fit different shapes. A small circle tells it which part to keep: the stitching.',
    time: 'About 1 minute per photo',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Open the photo from `Photos of my work`.',
            see: 'Your photo in the `Photo` box.',
          },
          {
            text: 'Click the small edit button on the photo (it sits in a corner of the photo).',
            see: 'A larger view of your photo opens with a circle on it.',
          },
          {
            text: 'Drag the circle over the stitching, the part that must never be cut off.',
            see: 'Small previews show how the photo will be trimmed in different shapes.',
          },
          {
            text: 'Close the larger view, then press `Publish`.',
            see: `Your photo is trimmed around the stitching in ${WAIT}.`,
          },
        ],
      },
      { kind: 'seealso', ids: ['round-hoop', 'add-a-photo'] },
    ],
  },
  {
    id: 'round-hoop',
    category: 'Photos and clearance',
    title: 'Keep a photo out of the round hoops',
    icon: 'circle',
    badge: 'You can do this yourself',
    summary:
      'Some pages show photos inside a round embroidery hoop. If a photo loses too much in a circle, you can keep it square.',
    time: 'About 1 minute',
    blocks: [
      {
        kind: 'p',
        text: 'A round hoop trims the corners off a photo. That is lovely for a single monogram, and not for two items side by side or a small design in a tall photo.',
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Open the photo from `Photos of my work`.',
            see: 'The photo and its boxes.',
          },
          {
            text: 'Find `Show it in a round hoop?` and choose "No, keep it to the square gallery views".',
            see: 'The choice is marked.',
          },
          {
            text: 'Press `Publish`.',
            see: `In ${WAIT} the photo stays in the gallery but is never put in a round hoop.`,
          },
        ],
      },
      { kind: 'seealso', ids: ['photo-focus'] },
    ],
  },
  {
    id: 'clearance-add',
    category: 'Photos and clearance',
    title: 'Add a clearance item',
    icon: 'basket',
    badge: 'Mostly yourself',
    summary:
      'A ready-made item for sale on your Clearance page, with its own Buy button that takes the customer to Stripe to pay.',
    time: 'About 10 minutes, plus making the Stripe link',
    before: [
      'One or more photos of the item.',
      'The sale price.',
      'A Stripe payment link for this item (see "Make a Stripe payment link").',
    ],
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Clearance and prices`, then `Clearance items for sale`, then the + button at the top of the list (`Add a clearance item`).',
            see: 'A new item opens with words in [square brackets] to replace.',
          },
          {
            text: 'Type the `Name of the item`, for example "Set of 4 napkins, JKL".',
            see: 'The name shows in the list on the left.',
          },
          {
            text: 'Drag your photos into `Photos`. The first one is the main photo. Describe each photo in a few words.',
            see: 'Your photos in a row.',
          },
          {
            text: 'Fill in `A few words about it` and the `Sale price, in dollars` (just the number). Add the `Original price, in dollars` if you want it shown crossed out.',
            see: 'The yellow note goes once the [square brackets] are gone.',
          },
          {
            text: 'Paste the link from Stripe into `Stripe payment link`. It starts with https://buy.stripe.com/',
            see: 'The red note under the box goes away.',
          },
          {
            text: 'Set `How many are left`, then press `Publish`.',
            see: `The item is on your Clearance page in ${WAIT}. Its Buy button opens Stripe.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Test the Buy button',
        text: 'Once it is published, open your Clearance page and click Buy on the new item. Stripe should show the right item and price. You do not have to pay to check this; just close the page.',
      },
      {
        kind: 'path',
        label: 'Add a clearance item now',
        to: { create: 'clearanceItem', template: 'new-clearance-item' },
      },
      { kind: 'seealso', ids: ['stripe-link', 'clearance-sold'] },
    ],
  },
  {
    id: 'clearance-sold',
    category: 'Photos and clearance',
    title: 'Mark a clearance item sold',
    icon: 'tag',
    badge: 'You can do this yourself',
    summary:
      'When the last one goes, turn on Sold. The item stays on the page with a Sold badge and the Buy button goes away.',
    time: 'About 1 minute',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Clearance and prices`, then `Clearance items for sale`.',
            see: 'Your clearance items. Sold ones say so.',
          },
          {
            text: 'Click the item that sold.',
            see: 'Its boxes open.',
          },
          {
            text: 'Turn on `Sold`, near the top.',
            see: 'The switch moves across.',
          },
          {
            text: 'Press `Publish`.',
            see: `In ${WAIT} the item shows a Sold badge and moves to the end of your Clearance page.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Turn off the Stripe link too',
        text: 'To be extra safe, you can also switch off the payment link in Stripe, so nobody can pay for it from an old page. Stripe calls this "Deactivate".',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Want it gone from the page altogether?',
        text: 'Keeping sold items for a while shows customers your work sells. When you want one gone, open it, click the three dots beside `Publish` and choose `Move to Trash`, then `Yes, move it to Trash`. It comes off your website in about 2 to 3 minutes, and you can bring it back from `Trash (bring things back)` if you change your mind.',
      },
      {
        kind: 'path',
        label: 'Open my clearance items',
        to: { pane: 'clearance-and-prices;clearance-items' },
      },
      { kind: 'seealso', ids: ['deleted-something'] },
    ],
  },
  {
    id: 'stripe-link',
    category: 'Photos and clearance',
    title: 'Make a Stripe payment link',
    icon: 'card',
    badge: 'Check with Nathan first',
    summary:
      'Stripe takes the payment when someone clicks Buy. Each clearance item needs its own Stripe payment link.',
    time: 'About 10 minutes',
    cost: "Stripe charges a fee on each sale. There is no monthly fee for payment links. Check the current fee on Stripe's own pricing page.",
    before: [
      'Your Stripe account login. If you are not sure you have one, ask Nathan first.',
      "The item's name, sale price and a photo.",
    ],
    blocks: [
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Why "Check with Nathan first"',
        text: 'This happens in your Stripe account, not in your Studio, and it is about money. The first time, do it together with Nathan. After that it is quick.',
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Sign in to your Stripe account and open the Payment Links page.',
            see: 'A list of any payment links you already have.',
          },
          {
            text: 'Click "+ New" (or the + sign, then "Payment link").',
            see: 'A page to describe what you are selling.',
          },
          {
            text: 'Choose "+ Add a new product". Type the item\'s name and price, add a photo, then click "Add product".',
            see: 'Your item and price show on the right as a preview of the payment page.',
          },
          {
            text: 'Click "Create link".',
            see: 'Your new link, starting with https://buy.stripe.com/, with a button to copy it.',
          },
          {
            text: "Copy the link and paste it into the item's `Stripe payment link` box in your Studio. Then press `Publish`.",
            see: `The item's Buy button opens this payment page in ${WAIT}.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        text: "Stripe's pages may look a little different from these words. Look for the same buttons: New, Add a new product, Create link.",
      },
      {
        kind: 'path',
        label: 'Open Stripe Payment Links',
        detail: 'Opens Stripe in a new tab. You will need to sign in.',
        to: { url: 'https://dashboard.stripe.com/payment-links' },
      },
      { kind: 'seealso', ids: ['clearance-add'] },
    ],
    maintenance:
      'Steps checked 2026-10-05 against https://docs.stripe.com/payment-links/create ("+New", "+Add a new product", "Add product", "Create link"). Re-check yearly. Do not quote Stripe fees here; link to stripe.com/pricing if needed.',
  },
  {
    id: 'add-a-font',
    category: 'Photos and clearance',
    title: 'Add an embroidery font',
    icon: 'text',
    badge: 'You can do this yourself',
    summary:
      'Each font on your Font and Lettering Guide page has a photo of it stitched, so customers see the real thing.',
    time: 'About 5 minutes',
    before: ['A clear photo of the font stitched on fabric.'],
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Fonts, threads and categories`, then `Embroidery fonts`, then the + button at the top of the list (`Add a font`).',
            see: 'A new, empty font.',
          },
          {
            text: 'Type the `Font name`, for example "Magnolia Script".',
            see: 'The name shows in the list.',
          },
          {
            text: 'Drag the photo into `Photo of the font stitched` and describe it in a few words.',
            see: 'Your photo in the box.',
          },
          {
            text: 'Pick the `Kind of lettering`, and write `A sentence about it`.',
            see: 'The font guide groups fonts by kind.',
          },
          {
            text: 'Under `Short name for the website`, press `Generate`.',
            see: 'A short version of the name appears. You do not need to change it.',
          },
          { text: 'Press `Publish`.', see: `The font is on your guide in ${WAIT}.` },
        ],
      },
      { kind: 'path', label: 'Add a font now', to: { create: 'font' } },
    ],
  },
  {
    id: 'add-a-thread',
    category: 'Photos and clearance',
    title: 'Add a thread color',
    icon: 'color',
    badge: 'Mostly yourself',
    summary: 'A new color on your Thread Color Chart page.',
    time: 'About 5 minutes',
    before: ["The color's name, and its DMC number if it has one."],
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Fonts, threads and categories`, then `Thread colors`, then the + button at the top of the list.',
            see: 'A new, empty thread color.',
          },
          {
            text: 'Type the `Color name`, for example "Navy Blue", and pick its `Color family`.',
            see: 'The chart sorts colors by family.',
          },
          {
            text: 'In `Color code`, type the color as a # and six letters or numbers, for example #1F3A5F.',
            see: 'The swatch on the chart uses this color.',
          },
          {
            text: 'Add the `DMC thread number` if it has one, and press `Generate` under `Short name for the website`.',
            see: 'A short version of the name appears.',
          },
          { text: 'Press `Publish`.', see: `The color is on your chart in ${WAIT}.` },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Not sure of the color code?',
        text: 'Search the web for the DMC number and "hex", for example "DMC 336 hex". Or ask Nathan, and he can find it for you.',
      },
      { kind: 'path', label: 'Add a thread color now', to: { create: 'threadColor' } },
    ],
  },
  {
    id: 'add-a-category',
    category: 'Photos and clearance',
    title: 'Add a shop category',
    icon: 'folder',
    badge: 'Check with Nathan first',
    summary:
      'A new kind of item, such as "Baby gifts", gets its own card on Shop by Item and its own page.',
    time: 'About 15 minutes',
    before: ['A name, a short paragraph and a few photos of that kind of item.'],
    blocks: [
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Why "Check with Nathan first"',
        text: 'A new category makes a whole new page on your website, and it is listed on your home page too. Have a quick word with Nathan before you start, so the new page looks finished from day one.',
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Fonts, threads and categories`, then `Shop categories (Hats, Totes...)`, then the + button (`Add a shop category`).',
            see: 'A new, empty category with tabs along the top.',
          },
          {
            text: 'Type the `Name of this item`, then press `Generate` under `Web address`. Check the address before you publish: keep it short and simple, like "baby-gifts".',
            see: "The page's web address is made from the name.",
          },
          {
            text: 'Fill in `A few words about this item`. Then work through the tabs: `Card on Shop by Item` and `Photos and buttons`.',
            see: 'Each box says where it shows.',
          },
          {
            text: 'Press `Publish`, then open some photos of this kind of item and pick the new category in `What kind of item is it?`.',
            see: `In ${WAIT} the new page shows those photos.`,
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'The web address locks once it is published',
        text: 'After the first Publish, the `Web address` box shows the address with a lock and the words "Ask Nathan to change this". That keeps old links, Google and anything you have printed, such as a QR code, working. If the address ever needs to change, Nathan does it so nothing breaks.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Categories do not go to Trash',
        text: 'A category is a whole page on your website, so it cannot be moved to Trash. If you want one taken down, ask Nathan.',
      },
      {
        kind: 'path',
        label: 'Open my shop categories',
        to: { pane: 'fonts-threads-categories;categories' },
      },
    ],
  },

  // ─────────────────────────────────────────────── When something goes wrong ──
  {
    id: 'nothing-happened',
    category: 'When something goes wrong',
    title: 'I pressed Publish and nothing changed',
    icon: 'clock',
    badge: 'You can do this yourself',
    summary:
      'Almost always, the website just needs a few minutes, or your browser is showing an old copy.',
    time: 'About 5 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Wait 3 minutes after pressing Publish. Your website rebuilds itself after each Publish.',
            see: 'Nothing yet. That is normal.',
          },
          {
            text: 'Refresh the page on your website. On a computer, hold Ctrl and press F5 (on a Mac, hold Command and Shift and press R).',
            see: 'The page reloads fresh, with your change.',
          },
          {
            text: 'On a phone, close the page and open your website again, or pull the page down from the top to reload it.',
            see: 'Your change.',
          },
          {
            text: 'Still nothing after 10 minutes? Check the change really was published: open it in the Studio and look at the `Publish` button.',
            see: 'If the button is greyed out, it is published. If you can still press it, press it now.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Still not showing?',
        text: 'The rebuild after a Publish is looked after by Nathan. If your change is published and still not on your website after 10 minutes, let him know which page you changed and roughly when.',
      },
      { kind: 'seealso', ids: ['before-asking'] },
    ],
  },
  {
    id: 'made-a-mistake',
    category: 'When something goes wrong',
    title: 'I made a mistake',
    icon: 'undo',
    badge: 'You can do this yourself',
    summary: 'Most mistakes can be taken back in a click or two.',
    time: 'About 2 minutes',
    blocks: [
      { kind: 'h', text: 'If you have NOT pressed Publish yet' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Click the three dots beside `Publish` and choose `Undo last change`. Repeat until it is right.',
            see: 'Your changes go away one at a time.',
          },
          {
            text: 'Or throw away everything since you last published: click the three dots and choose `Discard changes`.',
            see: 'The page goes back to what your website shows now.',
          },
          {
            text: 'Not sure? Leave it. Your website does not change until you press Publish.',
            see: 'Your website stays as it was.',
          },
        ],
      },
      { kind: 'h', text: 'If you HAVE pressed Publish' },
      {
        kind: 'p',
        text: 'Undo only works on changes you have not published yet. Once something is published, put the words back by hand and press `Publish` again. Your website changes back in a few minutes. If you cannot remember what the words were, Nathan can look up the earlier version for you.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Moved something to Trash by mistake?',
        text: 'Photos, clearance items, questions, price tags, thread colors and fonts go to Trash, not away for good. Open `Trash (bring things back)` in the menu, click the item and press `Bring it back`. If you only want to hide a clearance item, turn on `Sold` instead.',
      },
      { kind: 'seealso', ids: ['undo-a-change', 'deleted-something'] },
    ],
  },
  {
    id: 'cant-find',
    category: 'When something goes wrong',
    title: 'I cannot find something',
    icon: 'search',
    badge: 'You can do this yourself',
    summary: 'Search finds a photo, an item or a question by the words in it.',
    time: 'About 1 minute',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Search` (the magnifying glass) at the top of the Studio. On a computer you can also press Ctrl and K together.',
            see: 'A search box opens.',
          },
          {
            text: 'Type a word you remember, such as "napkins" or "navy".',
            see: 'A list of matches appears as you type. Photos are found by their description.',
          },
          {
            text: 'Click the one you want.',
            see: 'It opens, ready to change.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        text: 'Looking for words on a page? It is often quicker to use `Edit on the page`, find the words on your website and click them.',
      },
      { kind: 'seealso', ids: ['find-your-way', 'what-each-page-is'] },
    ],
  },
  {
    id: 'red-message',
    category: 'When something goes wrong',
    title: 'A red message will not go away',
    icon: 'warning',
    badge: 'Mostly yourself',
    summary:
      'A red note means a box needs something before you can Publish. A yellow note is only a tip.',
    time: 'About 3 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Read the red words. They say what is missing, for example "Please add the photo."',
            see: 'The box with the red note.',
          },
          {
            text: 'Cannot see the box? Look along the tabs at the top of the form. A tab with a problem has a red mark. Click it.',
            see: 'The box that needs you.',
          },
          {
            text: 'Fill in the box as the note says.',
            see: 'The red note goes away, and you can press `Publish`.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Yellow notes are fine',
        text: 'A yellow note, such as "This is getting long", is a gentle tip. You can still Publish.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Still stuck?',
        text: 'If the red note makes no sense, or names something you cannot find, that is a fault in the Studio, not in what you did. Take a photo of the screen and send it to Nathan.',
      },
      { kind: 'seealso', ids: ['before-asking'] },
    ],
  },
  {
    id: 'deleted-something',
    category: 'When something goes wrong',
    title: 'I moved something to Trash by mistake',
    icon: 'trash',
    badge: 'You can do this yourself',
    summary:
      'Things you move to Trash are kept there. You can bring them back with one click, until you choose Delete forever.',
    time: 'About 2 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Click `Trash (bring things back)` near the bottom of the menu on the left.',
            see: 'A list of everything you moved to Trash, the most recent at the top.',
          },
          {
            text: 'Click the thing you want back.',
            see: 'What it was called, what kind of thing it is, and when it went to Trash.',
          },
          {
            text: 'Press `Bring it back` at the bottom right.',
            see: 'A note says "It is back". It is in its list again, where it was.',
          },
          {
            text: 'Wait 2 or 3 minutes, then refresh your website.',
            see: 'It is on your website again. If it was never published, it still needs `Publish`, and the note says so.',
          },
        ],
      },
      { kind: 'h', text: 'How Trash works' },
      {
        kind: 'bullets',
        items: [
          'To move something to Trash: open it, click the three dots beside `Publish`, choose `Move to Trash`, then `Yes, move it to Trash`. It comes off your website in about 2 to 3 minutes. You do not need to press Publish.',
          'Photos of your work, clearance items, questions, price tags, thread colors and fonts can go to Trash.',
          'Pages and shop categories cannot. They are whole parts of your website. Ask Nathan if you want one taken down.',
          'If something else uses it (for example a photo that names a font), the Studio says so and leaves it where it is. Change that first, then try again.',
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Delete forever really is forever',
        text: 'Inside the Trash there is also `Delete forever`. It asks you twice, because after that it cannot be brought back, not even by Nathan. If you are not sure, just leave it in the Trash. It does no harm there.',
      },
      {
        kind: 'path',
        label: 'Open Trash (bring things back)',
        to: { pane: 'trash' },
      },
      { kind: 'seealso', ids: ['made-a-mistake', 'before-asking'] },
    ],
  },
  {
    id: 'before-asking',
    category: 'When something goes wrong',
    title: 'Before you ask for help',
    icon: 'help',
    badge: 'You can do this yourself',
    summary: 'A short checklist, and what to tell Nathan so he can help you quickly.',
    time: 'About 3 minutes',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Did you press `Publish`? Your website only changes after you do.',
            see: 'The Publish button is greyed out once a change is published.',
          },
          {
            text: 'Did you wait 3 minutes and refresh your website?',
            see: 'See "I pressed Publish and nothing changed".',
          },
          {
            text: 'Open `What needs attention` in the bar at the top.',
            see: 'Anything it finds is listed, with a button to go and fix it.',
          },
          {
            text: 'Still stuck? Take a photo or screenshot of what you see.',
            see: 'On a Windows computer, press the Windows key, Shift and S together. On a phone, press the side and volume-up buttons together.',
          },
        ],
      },
      { kind: 'h', text: 'What to tell Nathan' },
      {
        kind: 'bullets',
        items: [
          'What you were trying to do, in your own words.',
          'Which page or item it was.',
          'What you expected to happen, and what happened instead.',
          'The screenshot, if you have one.',
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Asking is never a bother',
        text: 'A confusing Studio is something Nathan can fix, not something you have to work around. Who to ask is shown at the bottom of the Help page.',
      },
      { kind: 'path', label: 'Open What needs attention', to: { pane: 'what-needs-attention' } },
    ],
  },
];
