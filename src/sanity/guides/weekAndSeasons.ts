// Safe to edit by hand (the words); keep the names in step with the Studio
// =============================================================================
// The guides for her week and her year (2026-10-19, studio-complete)
// =============================================================================
// The jobs Mary Ann does every week and every season, from docs/agent/
// studio-plan.md: Quick update from her phone, a photo of her work, the quote
// requests, a holiday order deadline, a week away, and her year at a glance.
// Same conventions as ./content.ts (./types.ts has them): numbered steps with
// what she will see, `backticks` only for names the Studio really shows (the
// test checks them), never the word for an unpublished change.
//
// Picture blocks ({ kind: 'shot', key }) are drawn from ./shots.ts. A key with
// no capture yet draws the wireframe, so a guide never shows a hole.
// Video notes: docs/agent/studio-videos.md (recorded in Phase B, card 137).
// =============================================================================

import type { Guide } from './types.ts';

const WAIT = 'about 2 to 3 minutes';
const CATEGORY = 'My week and my seasons' as const;

export const weekAndSeasonGuides: Guide[] = [
  {
    id: 'my-week',
    category: CATEGORY,
    title: 'My week in the Studio',
    icon: 'calendar',
    badge: 'You can do this yourself',
    summary:
      'The few jobs that keep your website fresh, about 15 minutes a week. Home keeps the list and ticks most of them for you.',
    time: 'About 15 minutes a week',
    blocks: [
      {
        kind: 'p',
        text: 'Open the Studio once a week, on a day that suits you. `Home` opens first, and the card called "My weekly 15 minutes" shows what is left this week.',
      },
      { kind: 'shot', key: 'home-weekly' },
      { kind: 'h', text: 'The weekly jobs' },
      {
        kind: 'steps',
        items: [
          {
            text: 'Add a photo of something you made. On your phone, `Quick update` then `Post a photo`. At a computer, `Add a photo of my work` on `Home`.',
            see: 'The job ticks itself once the photo is published.',
          },
          {
            text: 'Answer every quote request. Each one comes to your email; `Messages` lists them too.',
            see: 'Tick this one yourself once everyone has heard back.',
          },
          {
            text: 'Mark anything that sold on the clearance rack. Open it and turn on `Sold`.',
            see: 'The job ticks itself when nothing with none left is still for sale.',
          },
          {
            text: 'Share one photo on Facebook or Instagram, with a link to your website.',
            see: 'Tick this one yourself.',
          },
          {
            text: 'Look at the `Checkup`. Anything under "Needs doing" has a button that takes you straight to it.',
            see: 'The job ticks itself when the Checkup is clear.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why every week',
        text: 'A website that changes a little every week looks cared for, and Google notices. Fifteen minutes on a Monday does more than two hours once a season.',
      },
      { kind: 'path', label: 'Open Home', to: { tool: 'home' } },
      {
        kind: 'seealso',
        ids: ['photo-from-phone', 'quote-requests', 'clearance-sold', 'get-found-60-day-plan'],
      },
    ],
  },
  {
    id: 'quick-update',
    category: CATEGORY,
    title: 'Quick updates from my phone',
    icon: 'phone',
    badge: 'You can do this yourself',
    summary:
      'Big buttons for the jobs you can do from your phone: a photo of your work, a sold sign, a new price, a notice, a holiday order deadline, a week away and a new question and answer.',
    time: 'About 2 minutes each',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'On your phone, open your Studio (your website address with /studio on the end) and press `Quick update` in the menu.',
            see: 'A column of big buttons, one for each job.',
          },
          {
            text: 'Press the job you want. Only that job shows, with a few boxes to fill in.',
            see: 'Each box says what to type, with an example.',
          },
          {
            text: 'Press the big button at the bottom.',
            see: `A page that says it is done. Notices, deadlines and questions are on your website in ${WAIT}.`,
          },
        ],
      },
      { kind: 'shot', key: 'quick-update-tiles' },
      { kind: 'h', text: 'What each button does' },
      {
        kind: 'bullets',
        items: [
          '`Post a photo`: a photo of your work from your camera or your photos. It waits for you to check it and press Publish.',
          '`Mark a clearance item sold`: pick the item that sold and its Buy button goes away.',
          '`Change a price`: pick a price tag from your Pricing page and type the new price.',
          '`Change a clearance price`: the same for an item on your Clearance page.',
          '`See my quote requests`: opens Messages, where every request is listed.',
          '`Put up a notice`: a short line across the top of every page, until the day you pick.',
          '`Order deadline`: "Order by December 1 to have it in time for Christmas", worded for you.',
          '`I am away for a while`: tells people before they send a quote request.',
          '`Add a question and answer`: for something customers keep asking. It goes on your How It Works page.',
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Everything except a photo goes up straight away',
        text: 'Sold signs, prices, notices, deadlines and questions do not wait for Publish. If you spot a mistake afterwards, do the job again, or open the item in the full editor, fix it and press Publish.',
      },
      { kind: 'h', text: 'Put the Studio on your phone like an app' },
      {
        kind: 'steps',
        items: [
          {
            text: 'On an iPhone, open your Studio in Safari, press the Share button (the square with an arrow), then "Add to Home Screen".',
            see: 'Your Hoop Seal appears on your phone like any other app.',
          },
          {
            text: 'On an Android phone, open it in Chrome, press the three dots at the top right, then "Add to Home screen".',
            see: 'The same, on Android.',
          },
        ],
      },
      { kind: 'path', label: 'Open Quick update', to: { tool: 'quick-update' } },
      {
        kind: 'seealso',
        ids: [
          'photo-from-phone',
          'clearance-sold',
          'change-a-price',
          'order-deadline',
          'away-notice',
          'questions',
        ],
      },
    ],
  },
  {
    id: 'photo-from-phone',
    category: CATEGORY,
    title: 'Add a photo of my work from my phone',
    icon: 'camera',
    badge: 'You can do this yourself',
    summary:
      'Take the photo at your worktable and put it in your Style Gallery a minute later, without a computer.',
    time: 'About 3 minutes',
    before: ['The finished piece, in good daylight.'],
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Open `Quick update` and press `Post a photo`.',
            see: 'Two buttons: one opens your camera, one opens your photos.',
          },
          {
            text: 'Press `Take a photo`, or `Choose from your photos` for one you took earlier.',
            see: 'Your photo shows small, so you can check it is the right one.',
          },
          {
            text: 'In `Describe the photo`, say what it shows, for example "Navy monogram on a white hand towel".',
            see: 'If the words are too short, a red note says so.',
          },
          {
            text: 'Under where it goes, pick the Style Gallery. Type a few words in the title box, for example "Hand towel": they show under the photo when someone opens it large.',
            see: 'The big button at the bottom saves it for you to check.',
          },
          {
            text: 'Press `Open it in the full editor`. Pick `What kind of item is it?` and, if you know it, `Which font did you use?`. Then press `Publish`.',
            see: `Your photo is in the gallery in ${WAIT}, and this week's photo job ticks itself on Home.`,
          },
        ],
      },
      { kind: 'shot', key: 'post-photo-form' },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Your photo is not on the website until you press Publish',
        text: 'This is on purpose, so you can look at it once more on a bigger screen. A photo you never publish stays in `Photos of my work` with a note beside it.',
      },
      { kind: 'seealso', ids: ['add-a-photo', 'photo-description', 'photos-that-sell'] },
    ],
  },
  {
    id: 'quote-requests',
    category: CATEGORY,
    title: 'Answer the quote requests',
    icon: 'envelope',
    badge: 'You can do this yourself',
    summary:
      'Every quote request comes to your email, and Messages in the Studio keeps the list, so none get lost.',
    time: 'A few minutes each',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'When someone sends the form on Request a Quote, it arrives in your email. Reply to it there, the way you always do.',
            see: 'Their email address is the one you reply to.',
          },
          {
            text: 'Open `Messages` in the Studio to see every request in one list, newest first.',
            see: 'Each one has a small label: `New`, `Needs a person`, `Replied` or `Spam`.',
          },
          {
            text: 'Open a request and press `Replied` once you have answered it.',
            see: 'The label changes, so you can see at a glance who is still waiting.',
          },
          {
            text: 'Once everyone who asked this week has heard back, tick `Answer every quote request` on `Home`.',
            see: 'The tick lasts until next week.',
          },
        ],
      },
      { kind: 'shot', key: 'messages-list' },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Messages says it is not set up yet?',
        text: 'Then the list is still being switched on. Every request still comes to your email, so nothing is missed.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'The same question twice?',
        text: 'Put the answer on your website, so the next person finds it without asking. `Quick update` has `Add a question and answer`.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Away for a few days?',
        text: 'Put up `I am away for a while` first, so people know when to expect your answer.',
      },
      { kind: 'path', label: 'Open Messages', to: { tool: 'messages' } },
      { kind: 'seealso', ids: ['away-notice', 'questions', 'staying-safe'] },
    ],
  },
  {
    id: 'order-deadline',
    category: CATEGORY,
    title: 'Put up a holiday order deadline',
    icon: 'clock',
    badge: 'You can do this yourself',
    summary:
      'Tell customers the last day to order for Christmas, Mother’s Day, graduation or a wedding, across the top of every page. It comes down by itself.',
    time: 'About 2 minutes',
    video: 'order-deadline',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Open `Quick update` and press `Order deadline`.',
            see: 'Three boxes: the occasion, the last day to order, and your own words if you want them.',
          },
          {
            text: 'Type the occasion, for example "Christmas", and pick the last day you can take an order.',
            see: 'Leave the last box empty and the notice reads "Order by December 1 to have it in time for Christmas."',
          },
          {
            text: 'Press `Put it on my website`.',
            see: `The notice is across the top of every page in ${WAIT}, and it comes down by itself after the last day.`,
          },
        ],
      },
      { kind: 'shot', key: 'deadline-form' },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Put it up early',
        text: 'Four to six weeks before the day gives people time to decide. A gift guide page for the season does even more (see below).',
      },
      { kind: 'seealso', ids: ['my-year', 'season-page', 'notice'] },
    ],
  },
  {
    id: 'away-notice',
    category: CATEGORY,
    title: 'Tell people I am away',
    icon: 'calendar',
    badge: 'You can do this yourself',
    summary:
      'A vacation or a very busy week: a notice across the top says when you are back, so nobody thinks their request was lost.',
    time: 'About 2 minutes',
    video: 'away-notice',
    blocks: [
      {
        kind: 'steps',
        items: [
          {
            text: 'Open `Quick update` and press `I am away for a while`.',
            see: 'Boxes for the first day away, the last day away, and your own words.',
          },
          {
            text: 'Pick the last day you are away. Pick the first day too if it is not today.',
            see: 'Leave the words empty for "I am away until <the day>. Quote requests will be answered when I am back."',
          },
          {
            text: 'Press `Put it on my website`.',
            see: 'The notice shows from the first day to the last, then comes down by itself.',
          },
        ],
      },
      { kind: 'shot', key: 'away-form' },
      { kind: 'seealso', ids: ['quote-requests', 'notice'] },
    ],
  },
  {
    id: 'my-year',
    category: CATEGORY,
    title: 'My year at a glance',
    icon: 'star',
    badge: 'You can do this yourself',
    summary:
      'What to put on your website before each busy season, and the monthly look-over that keeps it tidy.',
    time: 'A few minutes, a few times a year',
    blocks: [
      { kind: 'h', text: 'Once a month' },
      {
        kind: 'bullets',
        items: [
          'Look over the clearance rack: add anything new, and turn on `Sold` for anything gone.',
          'Check your prices on the Pricing page still match what you charge.',
          'Read your questions and answers: is anything out of date?',
          'Look at the visitor numbers on `Home`, to see which months are busy.',
        ],
      },
      { kind: 'h', text: 'Before each season' },
      {
        kind: 'bullets',
        items: [
          'Early November: a Christmas order deadline, and a Christmas gift guide page with your best gift photos.',
          'Early April: a Mother’s Day deadline, and photos of baby and family gifts.',
          'May: graduation and wedding season. Show towels, totes and robes.',
          'August: back to school. Backpacks, lunch bags and team gear.',
          'Going away? Put up `I am away for a while` a week before.',
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Last year helps this year',
        text: 'A gift guide page can be used again each year. Change its words and the photos it shows, and press Publish.',
      },
      { kind: 'path', label: 'Open Gift guides and seasons', to: { pane: 'collections' } },
      {
        kind: 'seealso',
        ids: ['order-deadline', 'season-page', 'clearance-add', 'change-a-price'],
      },
    ],
  },
];
