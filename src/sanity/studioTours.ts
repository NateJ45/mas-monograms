// Safe to edit by hand
// =============================================================================
// Mary Ann's spotlight tours, as DATA for the kit's tours (starter card 137)
// =============================================================================
// Written 2026-10-19 (studio-complete, Phase A) before the kit's tour engine
// exists, so nothing reads this file yet. Phase B wires it into kit.config.ts
// in whatever shape card 137 settles on; the fields below are the facts each
// step needs: where it points, what it says, who sees it and when.
//
// `anchor` names a piece of the Studio in plain terms; `hint` is the selector
// it most likely maps to. The hints are NOT checked yet: confirm each in the
// kit harness in Phase B, once card 137 says how a step names its anchor.
// Tool links in the top bar are `a[href$="/studio/<tool>"]`.
//
// Her first-run tour today is kitConfig.tourSteps (five cards, no spotlight);
// the "welcome" tour below replaces it once spotlights exist.
// Every body: no em-dashes, her words, under about 40 words.
// =============================================================================

export interface PlannedTourStep {
  anchor: string;
  hint: string;
  title: string;
  body: string;
}

export interface PlannedTour {
  id: string;
  title: string;
  /** 'staff' is Mary Ann's view; 'all' includes Nathan. */
  role: 'staff' | 'all';
  /** First run opens by itself once; on demand is a button in the Site Guide and on Home. */
  when: 'first-run' | 'on-demand' | 'whats-new';
  steps: PlannedTourStep[];
}

export const PLANNED_TOURS: PlannedTour[] = [
  {
    id: 'welcome',
    title: 'Welcome to your Studio',
    role: 'staff',
    when: 'first-run',
    steps: [
      {
        anchor: 'home:banner',
        hint: '[data-kit="home-banner"]',
        title: 'This is Home',
        body: 'Home opens first every time. Everything you do most is one press from here.',
      },
      {
        anchor: 'home:quick-actions',
        hint: '[data-kit="quick-actions"]',
        title: 'Your big buttons',
        body: 'Add a photo, mark something sold, change a price, see your quote requests. Each one opens the right place.',
      },
      {
        anchor: 'home:this-week',
        hint: '[data-kit="this-week"]',
        title: 'My weekly 15 minutes',
        body: 'The few jobs that keep your website fresh. Most of them tick themselves when you do them.',
      },
      {
        anchor: 'navbar:status',
        hint: '[data-kit="navbar-status"]',
        title: 'Is it on my website yet?',
        body: 'After you press Publish, this says when your change is live. It takes about 2 to 3 minutes.',
      },
      {
        anchor: 'tool:quick-update',
        hint: 'a[href$="/studio/quick-update"]',
        title: 'Quick update, for your phone',
        body: 'A photo of your work, a notice, a holiday deadline or a week away, in a few presses.',
      },
      {
        anchor: 'tool:structure',
        hint: 'a[href$="/studio/structure"]',
        title: 'Edit my content',
        body: 'All your lists: photos, clearance, prices, fonts, threads, questions and notices. Drag to put them in order.',
      },
      {
        anchor: 'tool:site-guide',
        hint: 'a[href$="/studio/site-guide"]',
        title: 'Help is always here',
        body: 'Step-by-step help for every job, with pictures. You can print any guide.',
      },
    ],
  },
  {
    id: 'first-photo',
    title: 'Add your first photo',
    role: 'staff',
    when: 'on-demand',
    steps: [
      {
        anchor: 'form:galleryItem.image',
        hint: '[data-testid="field-image"]',
        title: 'Your photo goes here',
        body: 'Drag it in, or press Upload. Square photos look best.',
      },
      {
        anchor: 'form:galleryItem.image.alt',
        hint: '[data-testid="field-image.alt"]',
        title: 'Say what it shows',
        body: 'A few words, like "Navy monogram on a white hand towel". Google reads them, and so do people who cannot see the photo.',
      },
      {
        anchor: 'form:galleryItem.relatedCategory',
        hint: '[data-testid="field-relatedCategory"]',
        title: 'What kind of item is it?',
        body: 'Pick one, and the photo also shows on that item’s page.',
      },
      {
        anchor: 'document:publish',
        hint: '[data-testid="action-publish"]',
        title: 'Then Publish',
        body: 'Nothing is on your website until you press Publish. Then wait 2 to 3 minutes.',
      },
    ],
  },
  {
    id: 'quick-update',
    title: 'Quick update on your phone',
    role: 'staff',
    when: 'on-demand',
    steps: [
      {
        anchor: 'quick-update:post-photo',
        hint: '[data-kit="quick-tile-post-photo"]',
        title: 'Post a photo',
        body: 'Take a photo at your worktable, say what it shows, and it waits for you to check it and press Publish.',
      },
      {
        anchor: 'quick-update:deadline',
        hint: '[data-kit="quick-tile-deadline"]',
        title: 'Holiday order deadline',
        body: 'Type the occasion and the last day. The notice is worded for you and comes down by itself.',
      },
      {
        anchor: 'quick-update:away',
        hint: '[data-kit="quick-tile-away"]',
        title: 'Away for a while',
        body: 'People see it before they send a quote request, so nobody thinks theirs was lost.',
      },
    ],
  },
  {
    id: 'quote-requests',
    title: 'Your quote requests',
    role: 'staff',
    when: 'on-demand',
    steps: [
      {
        anchor: 'tool:messages',
        hint: 'a[href$="/studio/messages"]',
        title: 'Every request in one list',
        body: 'Each one also comes to your email. Reply there, the way you always do.',
      },
      {
        anchor: 'messages:status',
        hint: '[data-kit="message-status"]',
        title: 'Mark it Replied',
        body: 'Once you have answered, press Replied, so you can see who is still waiting.',
      },
    ],
  },
  {
    id: 'whats-new-2026-10',
    title: 'New in your Studio',
    role: 'staff',
    when: 'whats-new',
    steps: [
      {
        anchor: 'tool:quick-update',
        hint: 'a[href$="/studio/quick-update"]',
        title: 'Post a photo from your phone',
        body: 'Quick update now has Post a photo, Order deadline and Add a question and answer.',
      },
      {
        anchor: 'home:quick-actions',
        hint: '[data-kit="quick-actions"]',
        title: 'Your quote requests on Home',
        body: 'A new big button opens Messages, where every request from your website is listed.',
      },
      {
        anchor: 'form:field-help',
        hint: '[data-kit="field-guide-chip"]',
        title: '"How to" beside a box',
        body: 'Some boxes now have a small "How to" button. Press it for the guide, opened at the right place.',
      },
    ],
  },
];
