// Safe to edit by hand (the words); the tool ids must match sanity.config.ts
// =============================================================================
// "Brand kit and print": QR codes and using her brand anywhere (2026-10-05)
// =============================================================================
// Matched word for word to the built tools: "Make a QR code" (words in
// src/sanity/qrCopy.ts, sizes in src/lib/qr/placements.ts) and "My brand kit"
// (src/sanity/components/BrandKitPane.tsx, words and files in
// src/lib/brand/brandKit.ts). If either tool's words change, change these.
// Same rules as getFound.ts: no em-dashes, no developer words, no invented facts.
// =============================================================================
import type { Guide, GuideTarget } from './types.ts';

/** Where every "Open My brand kit" card goes (also imported by getFound.ts): the "My brand kit" tool. */
export const BRAND_KIT: GuideTarget = { tool: 'brand-kit' };

const CAT = 'Brand kit and print' as const;

export const brandAndPrintGuides: Guide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'qr-codes',
    category: CAT,
    title: 'Put a QR code on my tags and cards',
    icon: 'qr',
    badge: 'You can do this yourself',
    summary:
      'A QR code is the little square pattern people scan with their phone camera to open a website. Put one on everything you hand out, so people can find you again.',
    time: 'About 10 minutes to make one',
    cost: 'Free to make. Printing costs whatever your printer or print shop charges.',
    before: [
      'Know where you will put it (a tag, a card, a flyer, a sign).',
      'Know where it should lead (your quote page is a good default).',
      'Your phone, to test it.',
    ],
    blocks: [
      {
        kind: 'p',
        text: 'People point their phone camera at a **QR code** and a link pops up. Tapping it opens your website. Nobody has to type anything. Making a code does not change your website, so make as many as you like.',
      },
      { kind: 'h', text: 'Where to put one' },
      {
        kind: 'bullets',
        items: [
          'Hang tags and labels on things you sell or give.',
          'Business cards.',
          'Thank-you cards and notes tucked into orders.',
          'A sticker on shipping boxes.',
          'A flyer or poster on a notice board.',
          'A sign on your craft fair or market table.',
          'The back of an invoice or receipt.',
        ],
      },
      { kind: 'h', text: 'Make one' },
      {
        kind: 'path',
        label: 'Make a QR code',
        detail: '"Make a QR code", in the top bar of the Studio.',
        to: { tool: 'qr-codes' },
      },
      {
        kind: 'steps',
        items: [
          {
            text: 'Under **Where should the QR code take people?**, pick one: My home page, Ask for a quote, See my work, Choose thread colors, Clearance, Leave me a Google review, My Facebook page or My Instagram. For most things, pick **Ask for a quote**. For a thank-you card, pick **Leave me a Google review**.',
          },
          {
            text: 'Under **Where will you put it?**, pick one: A hang tag or product label, A business card, A flyer or poster, A package insert or thank-you card, A table sign at a craft fair, or A sticker on a shipping box.',
            see: 'Under **Your QR code**: the code, the words under it (such as "Scan to ask for a quote"), and a line saying how big to print it.',
          },
          {
            text: 'If you like, change the words in `Words under the code`. Tick or untick `Put my seal in the middle` (your Hoop Seal in the centre; the code still scans). Pick a `Background`: White is best for most printing.',
          },
          {
            text: 'For a special batch, such as a fall craft fair, type a short name in `Name this batch (you can skip this)`. Leave it empty and the month is used.',
          },
          {
            text: 'Press `Download picture (PNG)` for Word, email or your home printer. Press `Download for printing (SVG)` for a print shop, Canva or a label maker. Or press `Print this` to print it at the right size straight away. `Copy the link` copies the web address inside the code.',
            see: 'The file in your Downloads folder, or the print box.',
          },
          {
            text: 'Test it before you print lots: open your phone camera, point it at the code on your screen, and tap the link that pops up.',
            see: 'The right page of your website opens.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Printing at the right size',
        text: 'When you print, choose **100%** or **Actual size** in the print box, not "Fit to page". Otherwise the printer may shrink the code.',
      },
      {
        kind: 'callout',
        tone: 'why',
        title: 'Why each place gets its own code',
        text: 'Each code carries a small hidden tag saying where you put it and which batch it was. When someone scans it and then asks you for a quote, your quote email shows a line called **Where they found you**, for example "QR code on a hang tag or label (campaign fall-fair)". So you learn which tags and cards really bring people in.',
      },
      { kind: 'h', text: 'Your Google review code' },
      {
        kind: 'bullets',
        items: [
          'If you have already pasted your review link into `Your Google review link` in My business details, the tool uses it on its own.',
          'If not, the tool asks you to `Paste your Google review link here`. It usually starts with https://g.page/r/ and ends with /review. The tool remembers it on that computer.',
          'Press `Keep it in My business details` to save it there too, then `Publish`. Then it works on any computer, and your website shows a **Leave a review** link as well.',
          'Do not have the link yet? The guide "Get my business on Google Search and Maps" shows where to find it.',
        ],
      },
      { kind: 'h', text: 'How big to print it' },
      {
        kind: 'p',
        text: 'The tool tells you the size for each place. These are its sizes, not counting the blank border:',
      },
      {
        kind: 'bullets',
        items: [
          '**A hang tag or product label**: about 0.8 to 1 inch (2 to 2.5 cm).',
          '**A business card**: about 0.8 to 1 inch (2 to 2.5 cm).',
          '**A package insert or thank-you card**: about 1 to 1.5 inches (2.5 to 3.8 cm).',
          '**A flyer or poster**: about 1.5 to 2 inches (3.8 to 5.1 cm). Bigger still for a poster read from across a room.',
          '**A sticker on a shipping box**: about 1.5 to 2 inches (3.8 to 5.1 cm). Keep it on a flat side of the box.',
          '**A table sign at a craft fair**: about 2.5 to 3 inches (6.5 to 7.5 cm).',
        ],
      },
      {
        kind: 'bullets',
        items: [
          'Leave the blank border around the code. The phone needs it.',
          'Keep it dark on light: a dark code on white or cream paper. Never light on dark.',
          'Use matte paper if you can. Shiny paper can glare.',
          'Never stretch or squash it. Resize it from a corner so it stays square.',
        ],
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Always test the printed one',
        text: 'Test one printed copy with your phone before you print a big batch. Shiny paper, a crease or a tiny size can stop a code working.',
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'You scan the printed code with your phone and the right page of your website opens. Later, a quote email shows "Where they found you" with the place you put it.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'bullets',
        items: [
          'The phone does not react: hold it a little farther away, in good light, and keep it steady for a second. If it still does not work, the code is too small or too faded: print it bigger or darker.',
          'It opens the wrong page: press `Start again` and pick the right place it should lead.',
          'My Facebook page or My Instagram is greyed out: press `Add my Facebook link` (or Instagram), add your page in My business details, then come back.',
          'The `Print this` page does not open: your browser blocked it. Download the picture instead and print that.',
        ],
      },
      {
        kind: 'seealso',
        ids: [
          'reviews-and-word-of-mouth',
          'is-it-working',
          'brand-kit-anywhere',
          'local-free-places',
        ],
      },
    ],
    maintenance:
      'Matched to the built tool on 2026-10-05 (second pass): every quoted word is from QR_COPY in src/sanity/qrCopy.ts (step titles "Where should the QR code take people?", "Where will you put it?", "Your QR code"; destination titles; placement titles; "Words under the code", "Put my seal in the middle", "Background" with White, "Name this batch (you can skip this)" with the month fallback; buttons "Download for printing (SVG)", "Download picture (PNG)", "Print this", "Copy the link", "Start again"; review route "Paste your Google review link here", g.page/r/.../review hint, saved on this computer, "Keep it in My business details"; missing social "Add my {platform} link"; printing tips; "100% or Actual size"). Sizes are sizeText() of the placements in src/lib/qr/placements.ts (tag and card 0.8 to 1 in, insert 1 to 1.5, flyer and box 1.5 to 2, sign 2.5 to 3). Links carry utm_source=qr&utm_medium=<placement>&utm_campaign=<batch or YYYY-MM> (src/lib/qr/url.ts); the owner quote email row "Where they found you" is describeUtm() in src/lib/utm.ts (example string taken from src/lib/quote-email.test.ts). Background size guidance (2 cm minimum, 4-module quiet zone, 10:1 distance rule) checked 2026-10-05 via wavecnct.com and qrcodesunlimited.com; the tool sizes are within it.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'brand-kit-anywhere',
    category: CAT,
    title: 'Use my logo, colors and fonts anywhere',
    icon: 'brush',
    badge: 'You can do this yourself',
    summary:
      'Your logo, colors and fonts belong to you. Here is where to get them, which one to use where, and the few rules that keep them looking right.',
    time: 'About 5 minutes to download',
    cost: 'Free',
    blocks: [
      {
        kind: 'path',
        label: 'Open My brand kit',
        detail: '"My brand kit", in the top bar of the Studio.',
        to: BRAND_KIT,
      },
      {
        kind: 'p',
        text: 'My brand kit has six parts: **My logo**, **Pictures for Facebook, Instagram, Pinterest and Google**, **Ready to print**, **My colors**, **My fonts** and **How I sound**. Every button downloads one file. You cannot break anything by downloading.',
      },
      { kind: 'h', text: 'Everything at once' },
      {
        kind: 'p',
        text: 'The `Download everything` button at the top gives you one file with the whole kit inside. Keep a copy on your computer, and send it to anyone making something for you, like a print shop.',
      },
      { kind: 'h', text: 'My logo' },
      {
        kind: 'bullets',
        items: [
          '**The Hoop Seal, full**: your main logo with the words around the ring. Use it big: signs, stickers, the top of a flyer, a printed card.',
          '**The Hoop Seal, small version**: the hoop and your letters without the ring of words. Use it small: tags, stamps, the corner of a photo.',
          '**The thread wordmark**: MAS Monograms written out with the gold thread under it. Use it in wide spaces: letterheads, email, banners, invoices.',
        ],
      },
      {
        kind: 'p',
        text: 'Each logo comes four ways. Pick the button that matches where it will go: `Download for a white background`, `Download for a dark background`, `Download in one color (dark)` (for a rubber stamp or stitching it in one thread) or `Download in one color (white)` (for dark photos or dark fabric). Under each are two smaller buttons: `Small picture (PNG)` and `For printing (SVG)`.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'Which file type?',
        text: 'The picture (PNG) works in Facebook, Word, Canva and email. Give the printing file (SVG) to a print shop or sign maker: it stays sharp at any size.',
      },
      {
        kind: 'callout',
        tone: 'careful',
        title: 'Please do not',
        text: 'Stretch or squash it (hold Shift while you resize), change its colors, add a shadow, a glow or an outline, or put it on a busy photo. Do not put Claret in the logo: Claret is for buttons only. Leave empty space around it, at least as big as the M in MAS. Keep the Hoop Seal at least half an inch wide in print.',
      },
      { kind: 'h', text: 'Pictures for Facebook, Instagram, Pinterest and Google' },
      {
        kind: 'p',
        text: 'Each picture is already the right size. Press `Download this picture` under the one you need:',
      },
      {
        kind: 'bullets',
        items: [
          '**Profile picture (dark)**, 1080 by 1080: your profile picture on Facebook, Instagram and Pinterest. Use the same one everywhere. **Profile picture (light)** is the same on Linen, if you prefer a light one.',
          '**Facebook cover photo**, 1640 by 624 (and a smaller file, 820 by 312).',
          '**Instagram highlight cover**: Towels, Totes, Baby, Hats and Custom, 1080 by 1920.',
          '**Pinterest board cover**: Towels, Totes, Baby, Hats, Custom and a plain one, 600 by 600.',
          '**Google Business Profile logo**, 720 by 720, and **Google Business Profile cover photo**, 1080 by 608.',
          '**Logo for my email signature**, 600 by 150. In Gmail: Settings, See all settings, Signature, then the picture button; pick this file and choose the Small size.',
        ],
      },
      { kind: 'h', text: 'Ready to print' },
      {
        kind: 'bullets',
        items: [
          '**Table sign for a craft fair (US Letter paper)**: print it, then stick or print a QR code in the empty square marked "Place your QR code here".',
          '**My brand on one page**: your logos, colors and fonts on one sheet. Hand it to a printer, a sign maker or anyone making something for you.',
          'Each has `Download to print (PDF)` and `Download as a picture (PNG)`.',
        ],
      },
      { kind: 'h', text: 'My colors' },
      {
        kind: 'p',
        text: 'Each color has a plain name (like Linen, Midnight, Heritage Indigo and Claret) and a short code that starts with #. Press `Copy` next to a code, then paste it into the color box in Canva, Word or anywhere else to get exactly your color.',
      },
      {
        kind: 'callout',
        tone: 'tip',
        title: 'For printing',
        text: 'Print shops sometimes ask for "CMYK" numbers. My brand kit lists them, but they are close matches, not exact. Ask the shop for a test print if the color matters.',
      },
      { kind: 'h', text: 'My fonts' },
      {
        kind: 'bullets',
        items: [
          '**Fraunces** for headings. Keep it regular, not bold.',
          '**Mulish** for everyday words: descriptions, prices, captions.',
          '**Petemoss** (the flowing script) only for monograms and a single special word.',
          'Each font has download buttons and `Get it free from Google Fonts`. All three are free to use. My brand kit shows how to install a font on Windows, a Mac, an iPhone and in Canva.',
          'If a program does not have them, use **Georgia** for headings and **Arial** for everything else. Every computer has both.',
        ],
      },
      { kind: 'h', text: 'How I sound' },
      {
        kind: 'p',
        text: 'A short reminder of how your words sound on your website, so a post or a flyer sounds like you. The guide "Make my profiles match" has ready-made words to copy.',
      },
      { kind: 'h', text: 'How you know it worked' },
      {
        kind: 'p',
        text: 'Your profile pictures, cards and tags all show the same seal and the same colors as your website.',
      },
      { kind: 'h', text: 'If you get stuck' },
      {
        kind: 'p',
        text: 'If a download will not open, or you are not sure which file to use, ask Nathan.',
      },
      { kind: 'seealso', ids: ['make-profiles-match', 'qr-codes', 'facebook-page'] },
    ],
    maintenance:
      'Matched to the built pane on 2026-10-05 (second pass): section titles from SECTIONS in src/sanity/components/BrandKitPane.tsx ("Download everything (one file, <size>)" button, per-logo buttons from COLORWAYS, "Small picture (PNG)", "For printing (SVG)", "Download this picture", "Download to print (PDF)", "Download as a picture (PNG)", "Copy", "Get it free from Google Fonts"); logo names, use-when lines, LOGO_RULES (clear space = the M height, Hoop Seal half an inch minimum, do-not list), KIT_IMAGES names and pixel sizes, PRINT items, fonts and fallbacks from src/lib/brand/brandKit.ts. Font licence: OFL per the kit (its own licence files). The table sign QR square (SIGN_QR_INCHES) and the sign size in the QR tool were both set to 3 inches on 2026-10-05.',
  },
];
