// Safe to edit by hand (the words)
// =============================================================================
// Every word of the "Make a QR code" tool, in one place (Phase E, 2026-10-05)
// =============================================================================
// Kept apart from the component so the words can be reviewed in one read and
// so src/lib/qr/qr.test.ts can check them in bare Node: no em-dashes, none of
// the words scripts/audit-studio.mjs bans, and a title for every destination
// and placement id in src/lib/qr/.
//
// Voice: plain, warm, short sentences. "QR code" is explained once, in the
// intro. `{size}`, `{platform}` and `{guide}` are filled in by the tool;
// every size goes through inchesText()/sizeText() in src/lib/qr/placements.ts,
// which say "1 inch" and "2 inches" correctly.
// =============================================================================
import type { DestinationId } from '../lib/qr/destinations.ts';
import type { PlacementId } from '../lib/qr/placements.ts';

export interface ChoiceCopy {
  title: string;
  blurb: string;
}

/**
 * The handbook guide that explains the Google review link
 * (src/sanity/guides/getFound.ts). Its title is read from the guide itself, so
 * the button can never name a guide that is not there; qr.test.ts checks it.
 */
export const REVIEW_GUIDE_ID = 'google-business-profile';

export const QR_COPY = {
  toolTitle: 'Make a QR code',
  heading: 'Make a QR code',
  intro:
    'A QR code is a small square picture people scan with a phone camera. It opens a page of your website for them, so nobody has to type anything.',
  safe: 'Making a code here does not change your website. Make as many as you like.',

  step1: 'Where should the QR code take people?',
  step2: 'Where will you put it?',
  step3: 'Your QR code',
  stepNumber: 'Step {n} of 3',

  destinations: {
    home: { title: 'My home page', blurb: 'The front page of your website.' },
    quote: { title: 'Ask for a quote', blurb: 'The form people fill in to order from you.' },
    gallery: { title: 'See my work', blurb: 'Your Style gallery of photos.' },
    threads: { title: 'Choose thread colors', blurb: 'Your thread color chart.' },
    clearance: { title: 'Clearance', blurb: 'The finished items you have ready to buy.' },
    review: {
      title: 'Leave me a Google review',
      blurb: 'Happy customers scan it and land right on the review box.',
    },
    facebook: { title: 'My Facebook page', blurb: 'Your page on Facebook.' },
    instagram: { title: 'My Instagram', blurb: 'Your page on Instagram.' },
  } satisfies Record<DestinationId, ChoiceCopy>,

  /** The words printed under the code, until she changes them. */
  labels: {
    home: 'Scan to visit my website',
    quote: 'Scan to ask for a quote',
    gallery: 'Scan to see my work',
    threads: 'Scan to choose thread colors',
    clearance: 'Scan to see clearance items',
    review: 'Scan to leave me a review',
    facebook: 'Find me on Facebook',
    instagram: 'Find me on Instagram',
  } satisfies Record<DestinationId, string>,

  /** A Facebook or Instagram choice when that page is not in her details yet. */
  missingSocial: 'Add your {platform} link in My business details first, then come back here.',
  missingSocialButton: 'Add my {platform} link',

  review: {
    pasteLabel: 'Paste your Google review link here',
    pasteHelp: 'It usually starts with https://g.page/r/ and ends with /review.',
    invalid: 'That does not look like a web address yet. It should start with https://',
    savedHere: 'Saved on this computer, so you will not need to paste it here again.',
    fromDetails: 'Using the Google review link from My business details.',
    howTitle: 'Where do I find my Google review link?',
    how: 'Google gives it to you. On a computer, open your Google Business Profile, press Read reviews, then Get more reviews, then Copy. That copies your review link, ready to paste here.',
    guideIntro:
      'New to your Google listing? The guide "{guide}" walks you through it, under Get found in your handbook.',
    guideButton: 'Open the handbook',
    keepButton: 'Keep it in My business details',
    keepHelp: 'Paste it there too, then Publish, and it will be ready on any computer.',
  },

  placements: {
    tag: {
      title: 'A hang tag or product label',
      blurb: 'Scanned up close, in someone’s hand.',
    },
    card: { title: 'A business card', blurb: 'Scanned up close. Fits in a corner of the card.' },
    flyer: {
      title: 'A flyer or poster',
      blurb: 'For a poster people read from across a room, print it bigger still.',
    },
    insert: {
      title: 'A package insert or thank-you card',
      blurb: 'Tucked in with an order, so they can order again or leave a review.',
    },
    sign: {
      title: 'A table sign at a craft fair',
      blurb: 'Read from a step or two away, so it needs to be big.',
    },
    box: {
      title: 'A sticker on a shipping box',
      blurb: 'Seen on the doorstep. Keep it on a flat side of the box.',
    },
  } satisfies Record<PlacementId, ChoiceCopy>,

  sizeLine: 'How big: {size} wide, not counting the blank border.',
  printSizeLine: 'The Print button makes it {size} wide.',

  labelBox: 'Words under the code',
  labelHelp: 'Change them if you like. Keep them short. Empty the box for no words.',
  campaignBox: 'Name this batch (you can skip this)',
  campaignHelp:
    'For example "fall fair". Your website reports can then show which batch people scanned. Leave it empty and this month is used.',
  sealToggle: 'Put my seal in the middle',
  sealHelp:
    'Your Hoop Seal logo. The code still scans, because a QR code can lose a little of itself and still work.',
  sealTooSmall: 'This code is too small for the seal, so it stays plain. It scans just as well.',
  backgroundTitle: 'Background',
  backgroundWhite: 'White (best for most printing)',
  backgroundLinen: 'Linen (the warm cream of your website)',

  previewAlt: 'Your QR code. {label}',
  linkCaption: 'The link inside this code:',

  downloadSvg: 'Download for printing (SVG)',
  downloadSvgHelp: 'Sharp at any size. Best for a print shop, Canva or a label maker.',
  downloadPng: 'Download picture (PNG)',
  downloadPngHelp: 'A picture for Word, email or your home printer.',
  pngWorking: 'Making the picture...',
  pngFailed: 'The picture could not be made in this browser. Try Download for printing instead.',
  print: 'Print this',
  printHelp:
    'Opens a page at the right size. In the print box, choose 100% or Actual size, not Fit to page.',
  printBlocked:
    'Your browser stopped the print page from opening. Download the picture instead and print that.',
  copy: 'Copy the link',
  copied: 'Copied. You can paste it anywhere.',
  copyFailed: 'Could not copy. Select the link above and copy it by hand.',

  testTitle: 'Test it with your phone',
  testText:
    'Point your phone camera at this screen. Your website should open. If it does not, the code is too small or too faded.',
  testAfterPrint: 'Always test one printed copy with your phone before you print a lot.',

  tipsTitle: 'Printing tips',
  tips: [
    'Use matte paper if you can. Shiny paper can glare and stop a phone reading it.',
    'Leave the blank border around the code. The phone needs it.',
    'Keep it dark on light: a dark code on white or cream paper. Never light on dark.',
    'Never stretch or squash it. Resize it from a corner so it stays square.',
  ],

  printPage: {
    title: 'QR code for printing',
    note: 'Print at 100% or Actual size. The square code should measure {size}. Cut along the blank border, not into it.',
  },

  startOver: 'Start again',
};
