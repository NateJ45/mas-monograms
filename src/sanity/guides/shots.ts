// Safe to edit by hand
// =============================================================================
// This site's pictures of the Studio for the Site Guide (PORTS.md card 130)
// =============================================================================
// A guide asks for a picture by KEY, so the guide text stays the same on every
// site while each site draws its own screenshots:
//
//     { kind: 'shot', key: 'publish-button' }          // in guides/content.ts
//
// and this file says what that key shows on THIS site: the image in
// public/guide-shots/ and the marks laid over it. A key with no entry here
// falls back to the wireframe drawing (public/guide-shots/example-editor.svg),
// so a guide never shows a hole. Adding a capture is: save a WebP under
// public/guide-shots/ (crop to the useful part, cover any avatar or personal
// name, under about 150 KB), add its entry below, and the guide picks it up.
//
// Positions are PERCENT of the picture, so a recapture at another size keeps
// its marks. To place one from a capture, divide the pixel position inside the
// cropped image by its width or height and multiply by 100. See
// docs/agent/studio-kit.md ("Real captures in the guides") for the recipe, and
// src/lib/guide-shots.test.ts for what is checked (the file exists, the alt text
// is there, the marks sit inside the picture).
//
// Shape of an entry: GuideShotData in src/lib/studio-look.ts.
// =============================================================================

import type { GuideShotData } from '../../lib/studio-look.ts';

export const GUIDE_SHOTS: Record<string, GuideShotData> = {
  // Captured 2026-10-19 from the kit harness (/kit-harness/studio/, the real
  // Studio on a pretend sign-in, reading the published site). Desk shots are cut
  // below the top bar, so no account avatar or name is in them; phone shots show
  // only the phone top bar, which has neither. Recipe: docs/agent/studio-kit.md.
  'home-weekly': {
    src: '/guide-shots/home-weekly.webp',
    alt: 'The "My weekly 15 minutes" card on Home, with five jobs: two ticked, three with a numbered circle and a button, and beside it the "Is it live?" card.',
    width: 1040,
    height: 657,
    marks: [
      { kind: 'stone', x: 22, y: 16.5, label: 'A button takes you straight to the job.' },
      { kind: 'stone', x: 2.5, y: 33, label: 'A tick means it is done for this week.' },
      {
        kind: 'stone',
        x: 94,
        y: 3,
        label: '"Is it live?" says when your change is on the website.',
      },
    ],
  },
  'quick-update-tiles': {
    src: '/guide-shots/quick-update-tiles.webp',
    alt: 'Quick update on a phone: big buttons for Post a photo, Put up a notice and Order deadline, one under the other.',
    width: 520,
    height: 1125,
    marks: [
      { kind: 'ring', x: 5, y: 39.3, w: 90, h: 16.8 },
      {
        kind: 'stone',
        x: 90,
        y: 41,
        label: 'Post a photo of your work, straight from your phone.',
      },
      { kind: 'stone', x: 90, y: 76, label: 'Order deadline is worded for you.' },
    ],
  },
  'deadline-form': {
    src: '/guide-shots/deadline-form.webp',
    alt: 'The Order deadline form on a phone: a box for what it is for, a date box for the last day to order, and a box for your own words.',
    width: 520,
    height: 1125,
    marks: [
      { kind: 'stone', x: 93, y: 44, label: 'One or two words, like Christmas.' },
      { kind: 'stone', x: 93, y: 57.5, label: 'The last day you can take an order.' },
      { kind: 'stone', x: 93, y: 80, label: 'Leave this empty and it is worded for you.' },
    ],
  },
  'away-form': {
    src: '/guide-shots/away-form.webp',
    alt: 'The I am away for a while form on a phone: date boxes for the first and last day away, a box for the words, and the Put it on my website button.',
    width: 520,
    height: 1125,
    marks: [
      { kind: 'stone', x: 93, y: 51.5, label: 'The last day you are away.' },
      {
        kind: 'stone',
        x: 93,
        y: 73.5,
        label: 'Leave this empty and the words are written for you.',
      },
      { kind: 'ring', x: 4, y: 95, w: 92, h: 5 },
    ],
  },
  'post-photo-form': {
    src: '/guide-shots/post-photo-form.webp',
    alt: 'Post a photo on a phone: a short note saying to pick My Style Gallery, three numbered steps, and the buttons to take or choose a photo.',
    width: 520,
    height: 1125,
    marks: [
      { kind: 'stone', x: 93, y: 46, label: 'Pick My Style Gallery, as this note says.' },
      { kind: 'ring', x: 4, y: 95, w: 92, h: 5 },
    ],
  },
  'photo-new-form': {
    src: '/guide-shots/photo-new-form.webp',
    alt: 'A new Photo of my work in the editor: the Photo box with its Upload button, and the box to describe the photo in a few words.',
    width: 654,
    height: 548,
    marks: [{ kind: 'stone', x: 90, y: 66, label: 'Press Upload and choose your photo.' }],
  },
  'clearance-new-form': {
    src: '/guide-shots/clearance-new-form.webp',
    alt: 'A new Clearance item in the editor: the name of the item and, below it, the Sold switch that takes the Buy button away.',
    width: 856,
    height: 548,
    marks: [{ kind: 'stone', x: 19, y: 81, label: 'Turn Sold on when it sells.' }],
  },
  'question-form': {
    src: '/guide-shots/question-form.webp',
    alt: 'A new Question and answer in the editor: a box for the question and a box for the answer with a small toolbar.',
    width: 654,
    height: 548,
    marks: [
      { kind: 'stone', x: 90, y: 61, label: 'Type the question the way a customer would ask it.' },
    ],
  },
  // 'publish-button': {
  //   src: '/guide-shots/publish-button.webp',
  //   alt: 'The bottom right of the editor, with the Publish button in the corner.',
  //   width: 744,
  //   height: 184,
  //   marks: [
  //     { kind: 'ring', x: 83, y: 87, w: 8, h: 10 },
  //     { kind: 'stone', x: 87, y: 30, label: 'Publish puts your change on the website.' },
  //   ],
  // },
};
