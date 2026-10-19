// Safe to edit by hand
// =============================================================================
// Mary Ann's Studio tours, welcome and "What's new" (PORTS.md card 137)
// =============================================================================
// Plain data, kept out of kit.config.ts so src/lib/studio-tour.test.ts can read
// it in bare Node and catch a typo. kit.config.ts passes these on as `tours`,
// `welcome` and `whatsNew`. Anchors are named in docs/agent/studio-kit.md,
// "Spotlight tours". A stop whose anchor is not on screen sits in the middle.
// Her words: plain, warm, no em-dashes, about 40 words a stop.
// =============================================================================

import type { TourDef, WelcomeConfig, WhatsNewEntry } from '../lib/studio-tour.ts';

export const TOURS: TourDef[] = [
  {
    id: 'first-run',
    title: 'Welcome to your Studio',
    role: 'staff',
    firstRun: true,
    steps: [
      {
        anchor: 'home-banner',
        title: 'This is Home',
        short: 'Home',
        meaning: 'home',
        body: 'Home opens first every time. Everything you do most is one press from here.',
      },
      {
        anchor: 'home-quick-actions',
        title: 'Your big buttons',
        short: 'Buttons',
        meaning: 'post',
        body: 'Add a photo, mark something sold, change a price, see your quote requests. Each one opens the right place.',
      },
      {
        anchor: 'home-this-week',
        title: 'My weekly 15 minutes',
        short: 'Week',
        meaning: 'step',
        body: 'The few jobs that keep your website fresh. Most of them tick themselves when you do them.',
      },
      {
        anchor: 'navbar-status',
        title: 'Is it on my website yet?',
        short: 'Live?',
        meaning: 'publishing',
        body: 'After you press Publish, this says when your change is live. It takes about 2 to 3 minutes.',
      },
      {
        anchor: 'tool:quick-update',
        title: 'Quick update, for your phone',
        short: 'Quick update',
        meaning: 'quickUpdate',
        body: 'A photo of your work, a sold sign, a new price, a notice or a week away, in a few presses.',
      },
      {
        anchor: 'tool:structure',
        title: 'Edit my content',
        short: 'Content',
        meaning: 'content',
        body: 'All your lists: photos, clearance, prices, fonts, threads, questions and notices. Drag to put them in order.',
      },
      {
        anchor: 'tool:site-guide',
        title: 'Help is always here',
        short: 'Help',
        meaning: 'help',
        body: 'Step-by-step help for every job, with pictures and short videos. You can print any guide.',
      },
    ],
  },
  {
    id: 'home',
    title: 'How this screen works',
    role: 'staff',
    tool: 'home',
    steps: [
      {
        anchor: 'home-this-week',
        title: 'This week',
        meaning: 'step',
        body: 'The jobs that come round every week. Each one ticks itself when it is done, and the ones you do by hand have a tick box.',
      },
      {
        anchor: 'home-is-it-live',
        title: 'Is it live?',
        meaning: 'publishing',
        body: 'After you publish, this says when your website has caught up, usually within a few minutes.',
      },
      {
        anchor: 'home-recent',
        title: 'Recent edits',
        meaning: 'document',
        body: 'The last things changed, newest first. Press one to open it again.',
      },
    ],
  },
  {
    id: 'quick-update',
    title: 'Quick update on your phone',
    role: 'staff',
    tool: 'quick-update',
    steps: [
      {
        anchor: 'quick:post-photo',
        title: 'Post a photo',
        short: 'Photo',
        meaning: 'image',
        body: 'Take a photo at your worktable, say what it shows, and it waits for you to check it and press Publish.',
      },
      {
        anchor: 'quick:mark-sold',
        title: 'Mark something sold',
        short: 'Sold',
        meaning: 'give',
        body: 'Pick the clearance item that sold and its Buy button goes away. Nothing else to do.',
      },
      {
        anchor: 'quick:change-price',
        title: 'Change a price',
        short: 'Price',
        meaning: 'give',
        body: 'Pick a price tag, type the new price and save. Your Pricing page updates in a few minutes.',
      },
      {
        anchor: 'quick:deadline',
        title: 'Holiday order deadline',
        short: 'Deadline',
        meaning: 'notice',
        body: 'Type the occasion and the last day. The notice is worded for you and comes down by itself.',
      },
      {
        anchor: 'quick:away',
        title: 'Away for a while',
        short: 'Away',
        meaning: 'home',
        body: 'People see it before they send a quote request, so nobody thinks theirs was lost.',
      },
    ],
  },
  {
    id: 'first-photo',
    title: 'Add your first photo',
    role: 'staff',
    steps: [
      {
        anchor: 'field:image',
        goTo: { create: 'galleryItem', template: 'new-photo' },
        title: 'Your photo goes here',
        short: 'Photo',
        meaning: 'image',
        body: 'Drag it in, or press Upload. Square photos look best.',
      },
      {
        anchor: 'field:relatedCategory',
        title: 'What kind of item is it?',
        short: 'Kind',
        meaning: 'category',
        body: 'Pick one, and the photo also shows on that item page.',
      },
      {
        anchor: 'publish',
        title: 'Then Publish',
        short: 'Publish',
        meaning: 'publishing',
        body: 'Nothing is on your website until you press Publish. Then wait 2 to 3 minutes.',
      },
    ],
  },
  {
    id: 'quote-requests',
    title: 'Your quote requests',
    role: 'staff',
    steps: [
      {
        anchor: 'tool:messages',
        goTo: { tool: 'home' },
        title: 'Every request in one list',
        short: 'Messages',
        meaning: 'message',
        body: 'Messages lists every quote request from your website. Each one also comes to your email, and you reply there, the way you always do.',
      },
      {
        goTo: { tool: 'messages' },
        title: 'Mark it Replied',
        short: 'Replied',
        meaning: 'message',
        body: 'Open a request, and once you have answered, press Replied. Then you can see who is still waiting.',
      },
    ],
  },
];

export const WELCOME: WelcomeConfig = {
  title: 'Welcome to your Studio',
  body: 'This is where you look after your website. You cannot break anything by looking around: nothing changes for your customers until you press Publish.',
  points: [
    'Home shows what to do this week.',
    'Quick update has the short jobs, made for your phone.',
    'The Site Guide explains every job, step by step.',
  ],
  tour: 'first-run',
};

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    date: '2026-10-19',
    title: 'New in your Studio',
    items: [
      'Quick update now has Mark a clearance item sold and Change a price, so you can do them from your phone.',
      'Post a photo, Order deadline and Add a question and answer are there too.',
      'Some boxes have a small How to button that opens the guide at the right place.',
    ],
    tour: 'quick-update',
  },
];
