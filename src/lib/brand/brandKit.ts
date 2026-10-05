// Safe to edit by hand (the words). The colour hex values are tested against the site.
// =============================================================================
// Mary Ann's brand kit, as plain data (2026-10-05, Phase F of
// docs/superpowers/specs/2026-10-05-studio-direction.md)
// =============================================================================
// One source for three readers:
//   - the "My brand kit" pane in the Studio (src/sanity/components/BrandKitPane.tsx),
//   - scripts/generate-brand-kit.mjs, which draws every file listed here into
//     public/brand-kit/ and writes the README, the color lists and the ZIP,
//   - the unit tests (src/lib/brand-kit.test.ts): every hex below must match the token
//     of the same name in src/styles/globals.css, every file must exist at its exact
//     pixel size, and no word she reads may hold an em-dash or Studio jargon.
//
// Everything here is read by Mary Ann, who is not technical: plain words, short
// sentences, "color" (US spelling, as on her site), no em-dashes, nothing invented
// about her business. The tagline is not here: it is read from Site settings when the
// kit is generated (brandKitManifest.json), so it always matches her website.
// =============================================================================
import { contrastRatio, hexToRgb } from '../contrast.ts';

/** Where the kit is served from (public/brand-kit/). */
export const KIT_BASE = '/brand-kit';
/** The one-file download. Versioned: change the art, bump the number (public/_headers caches it for a year). */
export const KIT_ZIP = `${KIT_BASE}/mas-monograms-brand-kit-v1.zip`;

// ── Colors ──────────────────────────────────────────────────────────────────

export interface BrandColor {
  id: string;
  /** Her name for it. */
  name: string;
  /** The globals.css token this mirrors (the test fails if they drift apart). */
  cssVar: string;
  hex: string;
  /** One line: what it is for. */
  useFor: string;
  /** Gold is only ever used on a dark background. */
  darkOnly?: boolean;
}

export const BRAND_COLORS: BrandColor[] = [
  {
    id: 'linen',
    name: 'Linen',
    cssVar: '--color-bg',
    hex: '#F4EEE3',
    useFor: 'Your main background: a warm, soft off-white. Most of your website sits on it.',
  },
  {
    id: 'paper',
    name: 'Paper',
    cssVar: '--color-paper',
    hex: '#FBF8F1',
    useFor: 'Cards and boxes that sit on Linen. A touch brighter.',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    cssVar: '--color-midnight',
    hex: '#0F1B2D',
    useFor: 'The deep dark blue behind the gold logo. Use it for dark backgrounds.',
  },
  {
    id: 'indigo',
    name: 'Heritage Indigo',
    cssVar: '--color-primary',
    hex: '#28486B',
    useFor: 'The brand blue: the hoops in your logo, links and calm dark bands.',
  },
  {
    id: 'ink',
    name: 'Heirloom Ink',
    cssVar: '--color-accent',
    hex: '#26312E',
    useFor: 'Words on light backgrounds. A deep, warm near-black.',
  },
  {
    id: 'claret',
    name: 'Claret',
    cssVar: '--color-rust-cta',
    hex: '#8C3A2E',
    useFor:
      'The button that matters most, like Request a Quote. Use it once per design so it stays special. Never in the logo.',
  },
  {
    id: 'brass',
    name: 'Brass',
    cssVar: '--color-brass-text',
    hex: '#835A24',
    useFor: 'Prices and small labels on light backgrounds.',
  },
  {
    id: 'gold',
    name: 'Gold thread',
    cssVar: '--color-gold',
    hex: '#D9B15F',
    useFor:
      'The gold of the thread in your logo. Only on Midnight or Indigo, never on a light background.',
    darkOnly: true,
  },
  {
    id: 'gold-light',
    name: 'Gold thread, light',
    cssVar: '--color-gold-light',
    hex: '#F0D58A',
    useFor: 'The bright end of the gold thread. Lovely for one special word on Midnight.',
    darkOnly: true,
  },
  {
    id: 'gold-deep',
    name: 'Gold thread, deep',
    cssVar: '--color-gold-deep',
    hex: '#A9772A',
    useFor: 'The shadow end of the gold thread. For lines and decoration, not for words.',
    darkOnly: true,
  },
  {
    id: 'sage',
    name: 'Sage',
    cssVar: '--color-tertiary',
    hex: '#E4E2D3',
    useFor: 'A quiet green-grey for a band or a box when Linen needs a change.',
  },
  {
    id: 'kraft',
    name: 'Kraft',
    cssVar: '--color-kraft',
    hex: '#E2CFA9',
    useFor: 'The brown-paper color of your hang tags. Nice for labels and tags.',
  },
];

/**
 * The gold thread gradient (the site's --thread-gold): deep, gold, light, gold, deep.
 * `at` is the position along the line, 0 to 100.
 */
export const GOLD_THREAD = {
  name: 'The gold thread',
  cssVar: '--thread-gold',
  angle: 100,
  stops: [
    { hex: '#A9772A', at: 0 },
    { hex: '#D9B15F', at: 22 },
    { hex: '#F0D58A', at: 46 },
    { hex: '#D9B15F', at: 70 },
    { hex: '#A9772A', at: 100 },
  ],
  useFor:
    'The shine on the gold thread. In Canva, make a gradient from Gold thread, deep to Gold thread, light. Only on dark backgrounds.',
};

/** "#28486B" -> "40, 72, 107". */
export function rgbText(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

/**
 * Approximate CMYK for printing, as whole percentages.
 *
 * The plain textbook conversion with no colour profile:
 *   R' = R/255 (and G', B'), K = 1 - max(R', G', B'),
 *   C = (1 - R' - K) / (1 - K), M = (1 - G' - K) / (1 - K), Y = (1 - B' - K) / (1 - K).
 * A printer's real values depend on its paper and ink (a profile such as
 * GRACoL or SWOP), so these are a starting point, labelled "approximate" everywhere
 * she sees them, and a print shop should match the hex or a printed proof.
 */
export function approxCmyk(hex: string): [number, number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 1) return [0, 0, 0, 100];
  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);
  return [c, m, y, k].map((v) => Math.round(v * 100)) as [number, number, number, number];
}

/** "C 63 M 33 Y 0 K 58". */
export function cmykText(hex: string): string {
  const [c, m, y, k] = approxCmyk(hex);
  return `C ${c}  M ${m}  Y ${y}  K ${k}`;
}

export type Readability = 'easy' | 'big-only' | 'no';

export interface ColorPair {
  text: string;
  ground: string;
  /** Contrast ratio, worked out from the hex values (WCAG 2). */
  ratio: number;
  verdict: Readability;
}

/** Text colors on backgrounds that come up in her designs, best first. */
const PAIRS: [string, string][] = [
  ['ink', 'linen'],
  ['ink', 'paper'],
  ['midnight', 'linen'],
  ['indigo', 'linen'],
  ['claret', 'linen'],
  ['brass', 'linen'],
  ['linen', 'midnight'],
  ['gold-light', 'midnight'],
  ['gold', 'midnight'],
  ['linen', 'indigo'],
  ['gold-light', 'indigo'],
  ['ink', 'kraft'],
  ['gold', 'linen'],
  ['claret', 'midnight'],
];

const byId = (id: string) => {
  const c = BRAND_COLORS.find((x) => x.id === id);
  if (!c) throw new Error(`no brand color "${id}"`);
  return c;
};

export function readability(ratio: number): Readability {
  if (ratio >= 4.5) return 'easy';
  if (ratio >= 3) return 'big-only';
  return 'no';
}

/** The readable-pairs table, worked out from the colors (never typed by hand). */
export const COLOR_PAIRS: ColorPair[] = PAIRS.map(([t, g]) => {
  const ratio = contrastRatio(byId(t).hex, byId(g).hex);
  return { text: t, ground: g, ratio, verdict: readability(ratio) };
});

export const READABILITY_WORDS: Record<Readability, string> = {
  easy: 'Easy to read',
  'big-only': 'Only for big words',
  no: 'Do not use for words',
};

export function colorName(id: string): string {
  return byId(id).name;
}

export function colorHex(id: string): string {
  return byId(id).hex;
}

// ── Logos ───────────────────────────────────────────────────────────────────

export interface Logo {
  id: 'seal' | 'mark' | 'wordmark';
  name: string;
  useWhen: string;
}

export const LOGOS: Logo[] = [
  {
    id: 'seal',
    name: 'The Hoop Seal, full',
    useWhen:
      'Your main logo with the words around the ring. Use it big: signs, stickers, the top of a flyer, a printed card.',
  },
  {
    id: 'mark',
    name: 'The Hoop Seal, small version',
    useWhen:
      'The hoop and your letters without the ring of words. Use it small: profile pictures, tags, stamps, the corner of a photo.',
  },
  {
    id: 'wordmark',
    name: 'The thread wordmark',
    useWhen:
      'MAS Monograms written out with the gold thread under it. Use it in wide spaces: letterheads, email, banners, invoices.',
  },
];

export interface Colorway {
  id: 'color-light' | 'color-dark' | 'one-color-midnight' | 'one-color-white';
  /** The big button words. */
  button: string;
  /** What the tile behind the preview is painted with. */
  tile: string;
  useWhen: string;
}

export const COLORWAYS: Colorway[] = [
  {
    id: 'color-light',
    button: 'Download for a white background',
    tile: '#FFFFFF',
    useWhen: 'Full color, for white or light paper and screens.',
  },
  {
    id: 'color-dark',
    button: 'Download for a dark background',
    tile: '#0F1B2D',
    useWhen: 'Full color in gold, for Midnight, navy or other dark backgrounds.',
  },
  {
    id: 'one-color-midnight',
    button: 'Download in one color (dark)',
    tile: '#FFFFFF',
    useWhen:
      'All in Midnight, no gold. For a rubber stamp, a one-color print, or stitching the logo in one thread.',
  },
  {
    id: 'one-color-white',
    button: 'Download in one color (white)',
    tile: '#28486B',
    useWhen: 'All in white. For dark photos, dark fabric, or white thread on a dark item.',
  },
];

/** File names, so the pane, the generator and the tests agree. */
export function logoFile(logo: Logo['id'], way: Colorway['id'], kind: 'svg' | 'png' | 'small') {
  const stem = `${KIT_BASE}/logos/${logo}-${way}`;
  if (kind === 'svg') return `${stem}.svg`;
  if (kind === 'png') return `${stem}.png`;
  return `${stem}-small.png`;
}

/** Logo PNGs: 2000 pixels wide (big) and 512 wide (small). */
export const LOGO_PNG_WIDTH = 2000;
export const LOGO_SMALL_WIDTH = 512;

export const LOGO_RULES = {
  clearSpace:
    'Leave empty space around the logo on every side, at least as big as the height of the M in MAS. Nothing else goes in that space.',
  minimumSizes: [
    'The Hoop Seal: never smaller than half an inch wide in print, or 28 pixels on a screen.',
    'The thread wordmark: never smaller than 1.5 inches wide in print, or 120 pixels on a screen.',
  ],
  doNot: [
    'Do not stretch or squash it. Hold Shift while you resize so it keeps its shape.',
    'Do not change its colors. Use one of the four versions here instead.',
    'Do not add a shadow, a glow or an outline.',
    'Do not put it on a busy photo. Put it on a plain area, or use the white version on a dark, calm part of the picture.',
    'Do not put Claret in the logo. Claret is for buttons only.',
  ],
};

// ── Pictures for Facebook, Instagram, Pinterest and Google ──────────────────

export interface KitImage {
  id: string;
  file: string;
  title: string;
  /** Exact pixel size (asserted by the tests on the real file). */
  width: number;
  height: number;
  /** The size in plain words. */
  sizeWords: string;
  /** Where it goes and how. */
  howTo: string;
  group: 'facebook' | 'instagram' | 'pinterest' | 'google' | 'email' | 'everywhere';
}

const img = (f: string) => `${KIT_BASE}/social/${f}`;

export const HIGHLIGHTS = [
  { id: 'towels', label: 'Towels' },
  { id: 'totes', label: 'Totes' },
  { id: 'baby', label: 'Baby' },
  { id: 'hats', label: 'Hats' },
  { id: 'custom', label: 'Custom' },
] as const;

export const KIT_IMAGES: KitImage[] = [
  {
    id: 'profile-midnight',
    file: img('profile-picture-midnight.png'),
    title: 'Profile picture (dark)',
    width: 1080,
    height: 1080,
    sizeWords: 'Square, 1080 by 1080 pixels. Fits inside a circle.',
    howTo:
      'Your profile picture on Facebook, Instagram and Pinterest. Use the same one everywhere so people know it is you.',
    group: 'everywhere',
  },
  {
    id: 'profile-linen',
    file: img('profile-picture-linen.png'),
    title: 'Profile picture (light)',
    width: 1080,
    height: 1080,
    sizeWords: 'Square, 1080 by 1080 pixels. Fits inside a circle.',
    howTo: 'The same picture on Linen, if you prefer a light one.',
    group: 'everywhere',
  },
  {
    id: 'profile-seal',
    file: img('profile-picture-full-seal.png'),
    title: 'Profile picture with the words around it',
    width: 1080,
    height: 1080,
    sizeWords: 'Square, 1080 by 1080 pixels. Fits inside a circle.',
    howTo:
      'The full Hoop Seal. Pretty when shown big, but the small words are hard to read in a tiny circle.',
    group: 'everywhere',
  },
  {
    id: 'facebook-cover',
    file: img('facebook-cover.png'),
    title: 'Facebook cover photo',
    width: 1640,
    height: 624,
    sizeWords: 'Wide, 1640 by 624 pixels.',
    howTo:
      'The wide picture across the top of your Facebook Page. Your name sits in the middle, so phones (which trim the sides) and your profile picture (bottom left) never cover it.',
    group: 'facebook',
  },
  {
    id: 'facebook-cover-small',
    file: img('facebook-cover-small.png'),
    title: 'Facebook cover photo, smaller file',
    width: 820,
    height: 312,
    sizeWords: 'Wide, 820 by 312 pixels.',
    howTo: 'The same cover in a smaller file, if the big one is slow to upload.',
    group: 'facebook',
  },
  ...HIGHLIGHTS.map((h): KitImage => ({
    id: `highlight-${h.id}`,
    file: img(`instagram-highlight-${h.id}.png`),
    title: `Instagram highlight cover: ${h.label}`,
    width: 1080,
    height: 1920,
    sizeWords: 'Tall, 1080 by 1920 pixels. Instagram shows the middle as a circle.',
    howTo: `For a highlight you name "${h.label}". On your profile, press and hold the highlight, choose Edit highlight, then Edit cover, and pick this picture.`,
    group: 'instagram',
  })),
  ...HIGHLIGHTS.map((h): KitImage => ({
    id: `pinterest-${h.id}`,
    file: img(`pinterest-board-${h.id}.png`),
    title: `Pinterest board cover: ${h.label}`,
    width: 600,
    height: 600,
    sizeWords: 'Square, 600 by 600 pixels.',
    howTo: `Pin it to your "${h.label}" board, then choose it as the board cover.`,
    group: 'pinterest',
  })),
  {
    id: 'pinterest-blank',
    file: img('pinterest-board-blank.png'),
    title: 'Pinterest board cover: plain',
    width: 600,
    height: 600,
    sizeWords: 'Square, 600 by 600 pixels.',
    howTo: 'A plain cover with your Hoop Seal, for any other board.',
    group: 'pinterest',
  },
  {
    id: 'google-logo',
    file: img('google-logo.png'),
    title: 'Google Business Profile logo',
    width: 720,
    height: 720,
    sizeWords: 'Square, 720 by 720 pixels.',
    howTo: 'In your Google Business Profile, under Photos, add it as your Logo.',
    group: 'google',
  },
  {
    id: 'google-cover',
    file: img('google-cover.png'),
    title: 'Google Business Profile cover photo',
    width: 1080,
    height: 608,
    sizeWords: 'Wide, 1080 by 608 pixels.',
    howTo:
      'In your Google Business Profile, under Photos, add it as your Cover photo. A real photo of your work is good here too.',
    group: 'google',
  },
  {
    id: 'email-signature',
    file: img('email-signature-logo.png'),
    title: 'Logo for my email signature',
    width: 600,
    height: 150,
    sizeWords: 'Small, 600 by 150 pixels. Show it at 300 pixels wide.',
    howTo:
      'In Gmail: Settings, See all settings, Signature, then the picture button. Pick this file and choose the Small size.',
    group: 'email',
  },
  {
    id: 'link-share',
    file: '/og-default.png',
    title: 'The picture people see when you share your website',
    width: 1200,
    height: 630,
    sizeWords: 'Wide, 1200 by 630 pixels.',
    howTo:
      'This shows up on its own when you paste your website address into Facebook or a text. You can also post it as a picture.',
    group: 'everywhere',
  },
];

export const IMAGE_GROUPS: { id: KitImage['group']; title: string }[] = [
  { id: 'everywhere', title: 'For everywhere' },
  { id: 'facebook', title: 'Facebook' },
  { id: 'instagram', title: 'Instagram' },
  { id: 'pinterest', title: 'Pinterest' },
  { id: 'google', title: 'Google' },
  { id: 'email', title: 'Email' },
];

// ── Printing ────────────────────────────────────────────────────────────────

export interface KitPrint {
  id: string;
  title: string;
  pdf: string;
  png: string;
  width: number;
  height: number;
  sizeWords: string;
  howTo: string;
}

export const KIT_PRINTS: KitPrint[] = [
  {
    id: 'table-sign-letter',
    title: 'Table sign for a craft fair (US Letter paper)',
    pdf: `${KIT_BASE}/print/table-sign-letter.pdf`,
    png: `${KIT_BASE}/print/table-sign-letter.png`,
    width: 2550,
    height: 3300,
    sizeWords: '8.5 by 11 inches, ready to print.',
    howTo:
      'Print it, then stick or print your QR code in the empty square. Make a QR code in the Studio with "Make a QR code for my website". A plastic sign holder from an office store keeps it standing.',
  },
  {
    id: 'table-sign-a4',
    title: 'Table sign (A4 paper)',
    pdf: `${KIT_BASE}/print/table-sign-a4.pdf`,
    png: `${KIT_BASE}/print/table-sign-a4.png`,
    width: 2480,
    height: 3508,
    sizeWords: 'A4 size, for printers outside the US.',
    howTo: 'The same sign on A4 paper.',
  },
  {
    id: 'brand-sheet',
    title: 'My brand on one page',
    pdf: `${KIT_BASE}/print/brand-sheet.pdf`,
    png: `${KIT_BASE}/print/brand-sheet.png`,
    width: 2550,
    height: 3300,
    sizeWords: 'One page, 8.5 by 11 inches.',
    howTo:
      'Your logos, colors and fonts on one page. Hand it to a printer, a sign maker or anyone making something for you.',
  },
];

/** Printing size of the sign's empty QR square, in inches (the QR tool's "sign" size should fit it). */
export const SIGN_QR_INCHES = 3;
export const SIGN_QR_LABEL = 'Place your QR code here';

// ── Fonts ───────────────────────────────────────────────────────────────────

export interface BrandFont {
  id: 'fraunces' | 'mulish' | 'petemoss';
  name: string;
  role: string;
  useFor: string;
  specimen: string;
  googleFonts: string;
  files: { file: string; style: string }[];
  license: string;
  copyright: string;
  fallback: string;
}

const fontFile = (f: string) => `${KIT_BASE}/fonts/${f}`;

export const BRAND_FONTS: BrandFont[] = [
  {
    id: 'fraunces',
    name: 'Fraunces',
    role: 'Headings',
    useFor:
      'The elegant serif for every big heading on your website. Use it for the main line of a flyer or post. Keep it regular, not bold.',
    specimen: 'Hand-stitched, just for you',
    googleFonts: 'https://fonts.google.com/specimen/Fraunces',
    files: [
      { file: fontFile('Fraunces-Regular.ttf'), style: 'Regular' },
      { file: fontFile('Fraunces-Italic.ttf'), style: 'Italic' },
      { file: fontFile('Fraunces-SemiBold.ttf'), style: 'SemiBold' },
    ],
    license: fontFile('OFL-Fraunces.txt'),
    copyright: 'Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces)',
    fallback: 'Georgia',
  },
  {
    id: 'mulish',
    name: 'Mulish',
    role: 'Everything else',
    useFor:
      'The clean, friendly font for the smaller words: descriptions, prices, captions, buttons. Easy to read at any size.',
    specimen: 'Towels, totes, hats and baby gifts',
    googleFonts: 'https://fonts.google.com/specimen/Mulish',
    files: [
      { file: fontFile('Mulish-Regular.ttf'), style: 'Regular' },
      { file: fontFile('Mulish-Italic.ttf'), style: 'Italic' },
      { file: fontFile('Mulish-Bold.ttf'), style: 'Bold' },
    ],
    license: fontFile('OFL-Mulish.txt'),
    copyright: 'Copyright 2016 The Mulish Project Authors (https://github.com/googlefonts/mulish)',
    fallback: 'Arial',
  },
  {
    id: 'petemoss',
    name: 'Petemoss',
    role: 'A handwritten touch',
    useFor:
      'The script, for monograms and ONE short flourish per design, written big. Never for sentences, small words or buttons.',
    specimen: 'Mary Ann',
    googleFonts: 'https://fonts.google.com/specimen/Petemoss',
    files: [{ file: fontFile('Petemoss-Regular.ttf'), style: 'Regular' }],
    license: fontFile('OFL-Petemoss.txt'),
    copyright:
      'Copyright 2008-2021 The Petemoss Project Authors (https://github.com/googlefonts/petemoss)',
    fallback: 'Leave it out (do not swap in a different script)',
  },
];

export const FONT_LICENSE_NOTE =
  'All three fonts are free and open: the SIL Open Font License lets you install them, use them for your business and share them, as long as the license file stays with the font files and you do not sell the fonts themselves.';

export const FONT_FALLBACK_NOTE =
  "If a program does not have these fonts (Word on someone else's computer, Facebook, a printer's shop), use Georgia for headings and Arial for everything else. Every computer has both.";

export interface InstallSteps {
  id: string;
  title: string;
  steps: string[];
  note?: string;
}

export const INSTALL_STEPS: InstallSteps[] = [
  {
    id: 'windows',
    title: 'On a Windows computer',
    steps: [
      'Download the fonts (or the whole kit) with the buttons on this page.',
      'If you downloaded the whole kit, open your Downloads folder, right-click the kit and choose Extract All, then Extract.',
      'Open the fonts folder and double-click a file that ends in .ttf.',
      'A window shows the letters. Click Install at the top.',
      'Do the same for each font file, then close Word (or any program) and open it again. The fonts are now in its font list.',
    ],
  },
  {
    id: 'mac',
    title: 'On a Mac',
    steps: [
      'Download the fonts (or the whole kit) with the buttons on this page.',
      'If you downloaded the whole kit, double-click it in your Downloads folder to open it.',
      'Open the fonts folder and double-click a file that ends in .ttf.',
      'Font Book opens and shows the letters. Click Install.',
      'Do the same for each font file, then quit and reopen Pages or Word.',
    ],
  },
  {
    id: 'iphone',
    title: 'On an iPhone or iPad',
    steps: [
      'An iPhone or iPad cannot install a font just by tapping the file.',
      'You usually do not need to: on your phone, make posts in Canva (it keeps your fonts in your Canva account) or use the plain fonts in the Facebook and Instagram apps.',
      'If you want these fonts in other iPad apps, it needs an extra app from the App Store. Check with Nathan first.',
    ],
  },
  {
    id: 'canva',
    title: 'In Canva',
    steps: [
      'Uploading your own fonts needs a paid Canva plan (Canva Pro or Teams). On the free plan, skip to the note below.',
      'Open Canva on a computer, in your web browser.',
      'On the left, click Brand. Go to Fonts and choose Add, then Upload a font.',
      'Choose the .ttf files from the fonts folder and click Open. Wait for the upload to finish.',
      'Click any text in a design, open the font list, and pick your font under Uploaded fonts.',
    ],
    note: 'On the free plan: click a text box, open the font list and type Fraunces, Mulish or Petemoss in the search box. Canva has many free fonts, so if the name shows up, use it. If it does not, use Georgia for headings and Arial for the rest. For your colors, click the color square, then the plus sign, and type the code (for example #0F1B2D).',
  },
];

/** When the font and Canva steps were last checked, and against what (not shown to her). */
export const STEPS_CHECKED =
  'Checked 2026-10-05 against Canva Help "Upload and use Brand Kit fonts" (upload needs Pro, Teams, Business, Education or Nonprofits; formats OTF, TTF, WOFF).';

// ── How I sound ─────────────────────────────────────────────────────────────

export const VOICE = {
  oneSentence:
    'MAS Monograms is my one-woman embroidery studio at home in St. Matthews, SC: I stitch monograms and names on towels, totes, hats, shirts, baby things and gifts, and every order comes straight to me.',
  howISound: [
    'Warm and plain. Short sentences and everyday words, the way I talk to a customer.',
    'Me, not "we". There is no team: I am the person who stitches your order.',
    'Specific. Name the item, the letters and the thread color.',
    'Honest. Only say what is true. No made-up numbers or praise.',
    'Signed with my name: end a post or an email with "Mary Ann".',
  ],
  realLines: [
    'Every order comes straight to me, and I stitch it myself.',
    'No task is too great, and I really mean that. If you have an idea you are not sure about, just ask.',
    'When you reach out, you are talking to the person who will actually stitch your item.',
  ],
  realLinesSource: 'From my own website (the home page and the About page).',
  captions: [
    'Fresh off the hoop: [initials] in [thread color] on a [item]. Every order comes straight to me, and I stitch it myself. Want one? Ask me for a free quote on my website. Mary Ann',
    'Have something at home you would love to personalize? Send me a photo through the Request a Quote page and I will take a look. Mary Ann',
    'Gift idea: a monogrammed [towel or tote] for [name]. Tell me the letters and the colors, and I will stitch it right here in St. Matthews. Mary Ann',
  ],
  captionsNote: 'Swap the words in [square brackets] for the real thing in your photo.',
  neverUse: [
    '"Since 20..." or "for X years" (unless you have checked it is true)',
    'Award-winning, best in South Carolina, number one',
    'Thousands of happy customers, or any count you have not checked',
    'Reviews or quotes nobody actually gave you',
    '"We" and "our team" (it is just you)',
    'Guaranteed, same-day or rush, unless you really promise it',
    'Cheap (say "from $" with the real starting price instead)',
  ],
};

// ── The ZIP ─────────────────────────────────────────────────────────────────

export const ZIP_CONTENTS = [
  'Every logo in four colors, as pictures (PNG) and for printing (SVG)',
  'Profile pictures, cover photos and highlight covers for Facebook, Instagram, Pinterest and Google',
  'A logo for your email signature',
  'Two table signs and a one-page brand sheet, ready to print',
  'Your three fonts, ready to install, with their free license',
  'Your colors as a list',
  'A "Read me first" page that says what each file is for',
];
