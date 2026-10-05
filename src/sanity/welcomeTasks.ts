// Safe to edit by hand (the words); the targets must match the desk
// =============================================================================
// The Welcome pane's task cards, as plain data (2026-10-05)
// =============================================================================
// One card per job Mary Ann actually comes to do, in the order she is likely to
// need them, each going straight to the exact form or list. Kept apart from
// WelcomePane.tsx so src/lib/studio-targets.test.ts can check, in bare Node,
// that every pane target exists in the desk (DESK in ./studioTargets.ts) and
// that no card says a word she should not have to read.
// =============================================================================
import { DESK, type StudioTarget } from './studioTargets.ts';

export interface WelcomeTask {
  emoji: string;
  title: string;
  blurb: string;
  target: StudioTarget;
}

export const WELCOME_TASKS: WelcomeTask[] = [
  {
    emoji: '📷',
    title: 'Add a photo of my work',
    blurb: 'Opens a new, empty photo. Add the picture, a few words about it, then Publish.',
    target: { create: 'galleryItem', template: 'new-photo' },
  },
  {
    emoji: '🏷️',
    title: 'Mark a clearance item sold or add one',
    blurb: 'Your clearance items. Open one and turn on Sold, or press + to add a new one.',
    target: { pane: `${DESK.clearance};${DESK.clearanceItems}` },
  },
  {
    emoji: '💲',
    title: 'Change a price',
    blurb: 'The price tags on your Pricing page. Open one, change the number, then Publish.',
    target: { pane: `${DESK.clearance};${DESK.priceTags}` },
  },
  {
    emoji: '📞',
    title: 'Change my phone number or email',
    blurb: 'Your phone, email, address and hours, shown in the footer and the phone menu.',
    target: { doc: 'siteSettings', field: 'phone' },
  },
  {
    emoji: '🏠',
    title: 'Change the words on my home page',
    blurb: 'Every heading and sentence on your home page, from the top down.',
    target: { doc: 'homePage' },
  },
  {
    emoji: '🖱️',
    title: 'See my website and edit it on the page',
    blurb: 'Shows your website. Click any words on it to change them right there.',
    target: { tool: 'presentation' },
  },
  {
    emoji: '❔',
    title: 'Something went wrong? Get help',
    blurb: 'Answers to the common questions, and who to ask when you are stuck.',
    target: { pane: DESK.help },
  },
];
