// MAS Monograms — content seed.
// Builds an NDJSON file of every singleton + collection document, populated
// with the verbatim Squarespace copy transcribed in docs/01–06, mapped onto
// the ACTUAL studio/schemaTypes field names. Then run:
//
//   node scripts/seed-content.mjs            # writes tmp/content.ndjson
//   cd studio && npx sanity dataset import ../tmp/content.ndjson production --replace
//
// Deterministic _ids → safe to re-run (--replace overwrites in place).
//
// IMAGES are intentionally omitted (we don't have the original photos). Image
// fields stay empty; the front end guards every one with `?.asset`, and the
// Studio shows a "required" warning as a helpful upload TODO for Mary Ann.
// Thread colors are a COMMON STARTER SET to be replaced with real inventory.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'tmp');
const outPath = resolve(outDir, 'content.ndjson');

// ── Portable Text helpers ────────────────────────────────────────────────────
let _k = 0;
const k = () => `k${(_k++).toString(36)}`;
/** One PT block. `marks` applies to the whole paragraph (e.g. ['em']). */
function block(text, marks = []) {
  return {
    _type: 'block', _key: k(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: k(), text, marks }],
  };
}
/** Build a PT array. Each arg is either a string or [text, marks]. */
function pt(...items) {
  return items.map((it) => (Array.isArray(it) ? block(it[0], it[1]) : block(it)));
}
/** Tag array-of-objects items with stable _keys. */
const keyed = (arr) => arr.map((o) => ({ _key: k(), ...o }));
const slug = (current) => ({ _type: 'slug', current });
const ref = (id) => ({ _type: 'reference', _ref: id });

const docs = [];
const add = (d) => docs.push(d);

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETONS
// ═══════════════════════════════════════════════════════════════════════════

add({
  _id: 'siteSettings', _type: 'siteSettings',
  title: 'MAS Monograms',
  tagline: 'Hand-stitched monograms and embroidery, made locally in St. Matthews, SC.',
  email: 'hello@mas-monograms.com', // PLACEHOLDER — set to Mary Ann's real inbox
  address: { street: '', city: 'St. Matthews', state: 'SC', zip: '' },
  serviceArea: 'St. Matthews and the surrounding Calhoun County area, with shipping available nationwide.',
  navItems: keyed([
    { _type: 'navLink', label: 'Home', href: '/' },
    { _type: 'navLink', label: 'About', href: '/about' },
    {
      _type: 'navGroup', label: 'Shop by Item',
      links: keyed([
        { label: 'Tote Bags & Pouches', href: '/tote-bags' },
        { label: 'Towels & Linens', href: '/towels-linens' },
        { label: 'Hats & Caps', href: '/hats-caps' },
        { label: 'Shirts & Tops', href: '/shirts-tops' },
        { label: 'Jackets & Sweatshirts', href: '/jackets-sweatshirts' },
        { label: 'Baby & Kids', href: '/baby-kids' },
        { label: 'Home & Gifts', href: '/home-gifts' },
        { label: 'Bring Your Own Item', href: '/bring-your-own-item' },
      ]),
    },
    {
      _type: 'navGroup', label: 'Inspiration',
      links: keyed([
        { label: 'Style Gallery', href: '/style-gallery' },
        { label: 'Font & Lettering Guide', href: '/font-lettering-guide' },
        { label: 'Thread Color Chart', href: '/thread-color-chart' },
      ]),
    },
    { _type: 'navLink', label: 'How It Works', href: '/how-it-works' },
    { _type: 'navLink', label: 'Pricing', href: '/pricing' },
    { _type: 'navLink', label: 'Clearance', href: '/clearance' },
  ]),
  quoteCtaLabel: 'Request a Quote',
  footerColumns: keyed([
    {
      title: 'Shop by Item',
      links: keyed([
        { label: 'Tote Bags & Pouches', href: '/tote-bags' },
        { label: 'Towels & Linens', href: '/towels-linens' },
        { label: 'Hats & Caps', href: '/hats-caps' },
        { label: 'Shirts & Tops', href: '/shirts-tops' },
        { label: 'Jackets & Sweatshirts', href: '/jackets-sweatshirts' },
        { label: 'Baby & Kids', href: '/baby-kids' },
        { label: 'Home & Gifts', href: '/home-gifts' },
        { label: 'Bring Your Own Item', href: '/bring-your-own-item' },
      ]),
    },
    {
      title: 'Inspiration',
      links: keyed([
        { label: 'Style Gallery', href: '/style-gallery' },
        { label: 'Font & Lettering Guide', href: '/font-lettering-guide' },
        { label: 'Thread Color Chart', href: '/thread-color-chart' },
      ]),
    },
    {
      title: 'Info',
      links: keyed([
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About', href: '/about' },
        { label: 'Clearance', href: '/clearance' },
      ]),
    },
    {
      title: 'Get Started',
      links: keyed([
        { label: 'Request a Quote', href: '/request-a-quote' },
        { label: 'How the process works', href: '/how-it-works' },
        { label: 'See finished work', href: '/style-gallery' },
      ]),
    },
  ]),
  socialLinks: [], // real URLs pending from Mary Ann
  footerCredit: 'Site Designed by Nixon Creative Studio',
  footerCreditUrl: 'https://www.nixoncreativestudio.com',
  seoTitle: 'MAS Monograms — Custom Embroidery in St. Matthews, SC',
  seoDescription:
    'Hand-embroidered monograms and personalized gifts by Mary Ann Stone. Custom embroidery on towels, totes, hats, shirts, baby items, and more.',
  businessType: 'LocalBusiness',
  priceRange: '$$',
  standardTurnaround: '3 to 7 business days after approval',
  rushOrdersAvailable: true,
  rushTurnaround: "Rush options available — flag it in your quote and I'll confirm the timeline.",
});

add({
  _id: 'homePage', _type: 'homePage',
  seoTitle: 'MAS Monograms — Custom Embroidery in St. Matthews, SC',
  seoDescription:
    'Hand-stitched monograms on towels, totes, hats, sweatshirts, baby gifts, and more. Free quotes, 1 business day reply. Made locally in St. Matthews, SC.',
  heroEyebrow: 'Handmade in St. Matthews, SC',
  heroHeadline: 'Custom monogramming,',
  heroItalicWord: 'made just for you.',
  heroSubhead:
    'From classic three-letter monograms to full appliqué designs, I stitch everything by hand, locally. Towels, totes, hats, sweatshirts, baby gifts, and more.',
  heroPrimaryCtaLabel: 'Request a Free Quote',
  heroPrimaryCtaHref: '/request-a-quote',
  heroSecondaryCtaLabel: 'Browse by Item',
  heroSecondaryCtaHref: '/shop-by-item',
  trustItems: ['No payment to request a quote', 'Reply within 1 business day', 'Local, home-based studio'],
  categoriesEyebrow: 'Shop by Item',
  categoriesHeadline: 'Choose a category to get started',
  categoriesSubhead: 'Every item is hand-stitched to order. Pick a category to see real work and starting prices.',
  categoriesCtaLabel: 'View all items',
  categoriesCtaHref: '/shop-by-item',
  aboutEyebrow: 'Meet the maker',
  aboutHeadline: "Hi, I'm Mary Ann.",
  aboutBody: pt(
    "I'm a home-based embroidery artist in St. Matthews, SC. What started as a creative hobby three years ago has grown into something I truly love sharing.",
    "Every order comes directly to me, no team, no warehouse. When you reach out, you're talking to the person who will actually stitch your item.",
  ),
  aboutCtaLabel: 'More about MAS Monograms',
  aboutCtaHref: '/about',
  processEyebrow: 'How it works',
  processHeadline: 'From first idea to finished piece',
  processSteps: keyed([
    { number: '01', label: 'Browse', body: 'Pick your item and get inspired.' },
    { number: '02', label: 'Request', body: 'Submit a free quote form.' },
    { number: '03', label: 'Quote', body: 'Get your custom price in 1 day.' },
    { number: '04', label: 'Stitch', body: 'Approve and I get to work.' },
  ]),
  processCtaLabel: 'See how it works',
  processCtaHref: '/how-it-works',
  combosEyebrow: 'Customer favorites',
  combosHeadline: 'Most popular combinations',
  combosSubhead:
    "My most-loved font and thread pairings, a great starting point if you're not sure what to choose.",
  combosCtaLabel: 'See all font styles',
  combosCtaHref: '/font-lettering-guide',
  galleryEyebrow: 'Style Gallery',
  galleryHeadline: 'Not sure where to start?',
  gallerySubhead:
    "Browse real work from my studio, and tell me your vibe. I'll pick the perfect font and thread for you.",
  galleryCtaLabel: 'Browse the Full Gallery',
  galleryCtaHref: '/style-gallery',
  ctaEyebrow: 'Ready when you are',
  ctaHeadline: 'Ready to make something personal?',
  ctaSubhead:
    "Requesting a quote is free and takes about 2 minutes. I'll reply within 1 business day with your custom price.",
  ctaLabel: 'Request a Free Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'howItWorksPage', _type: 'howItWorksPage',
  seoTitle: 'How It Works — MAS Monograms',
  seoDescription:
    'No cart, no checkout, no guessing. See exactly how custom monogram ordering works, from a free quote to your finished, hand-stitched item.',
  heroEyebrow: 'No cart. No checkout. No guessing.',
  heroHeadline: "Here's exactly how ordering works.",
  heroSubhead:
    'Custom monogramming means every order is unique, so I use a simple quote process instead of a standard checkout. It takes about 2 minutes to request, and I handle everything from there.',
  stepsEyebrow: 'The process',
  stepsHeadline: 'Four simple steps',
  steps: keyed([
    {
      number: '01', label: 'Browse & get inspired',
      body: pt('Start by exploring my item categories. Each page shows real photos of finished work, popular font and thread combinations, and pricing ranges so you know what to expect before you ever fill out a form.'),
    },
    {
      number: '02', label: 'Fill out the quote form',
      body: pt('My quote form walks you through everything I need to give you an accurate price: item type, letters, font style, thread color, placement, quantity, and your timeline. It takes about 2 minutes. No payment required at this stage.'),
    },
    {
      number: '03', label: 'Receive your custom quote',
      body: pt('I’ll review your request and send a custom invoice to your email within 1 business day. The price is based on your specific item, stitch count, and any complexity. No surprises, what you see is what you pay.'),
    },
    {
      number: '04', label: 'Approve & I get to stitching',
      body: pt('Once you approve the quote and complete payment, I get to work. I’ll keep you updated along the way and reach out if I have any questions before I stitch. When it’s done, I’ll arrange pickup or shipping, whatever works best for you.'),
    },
  ]),
  faqEyebrow: 'Common questions',
  faqHeadline: 'Good questions. Here are the answers.',
  faqSubhead: 'More questions? Just send me an email and I’ll get right back to you.',
  ctaEyebrow: 'Ready when you are',
  ctaHeadline: 'Ready to get started?',
  ctaSubhead: "It's free to request a quote and takes about 2 minutes. I'll take it from there.",
  ctaLabel: 'Request a Free Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'pricingPage', _type: 'pricingPage',
  seoTitle: 'Pricing — MAS Monograms',
  seoDescription:
    'Transparent monogram and embroidery pricing. Starting prices by complexity, with add-ons for appliqué, custom digitizing, and rush orders. No surprises.',
  heroEyebrow: 'Transparent pricing',
  heroHeadline: 'Simple pricing, no surprises.',
  heroSubhead:
    'Every monogram is priced by complexity and stitch count. Nothing is charged until you approve your custom quote.',
  tiersEyebrow: 'What it costs',
  tiersHeadline: 'Starting prices',
  tiersSubhead:
    'These are starting prices. The exact cost depends on your item, stitch count, letter count, and complexity, and is always confirmed in your quote before anything is charged.',
  tiersNote: "Prices do not include the cost of the garment or item unless you're bringing your own.",
  addonsEyebrow: 'What affects your price',
  addonsHeadline: 'Add-ons and modifiers',
  addons: keyed([
    { label: 'Names of 7+ letters', price: 'small add-on', note: 'A small charge on top of the base price.' },
    { label: 'Jackets & sweatshirts', price: 'from $18', note: 'Premium tier for bordered, appliqué, or bold collegiate lettering.' },
    { label: 'Custom appliqué', price: 'from $45', note: 'Includes a one-time $30 setup charge plus a stitching fee by stitch count.' },
    { label: 'Custom digitizing', price: '+$30 one-time', note: 'A one-time fee to digitize custom artwork, plus stitching from $16.' },
    { label: 'Rush turnaround', price: 'case by case', note: "Available and priced per order. Flag it in your quote request." },
    { label: 'Shipping', price: 'added to quote', note: 'Available nationwide. Default is local pickup in St. Matthews, SC.' },
  ]),
  rushHeadline: 'Need it fast?',
  rushBody: pt(
    "Rush turnaround is often possible. Flag it in your quote request with your deadline, and I'll let you know right away whether I can meet it and what any rush fee would be. Earlier notice always helps.",
  ),
  faqEyebrow: 'Pricing questions',
  faqHeadline: 'Common pricing questions',
  ctaEyebrow: 'No payment to ask',
  ctaHeadline: 'Get your custom price',
  ctaSubhead:
    "Requesting a quote is free and takes about 2 minutes. You'll see an itemized price before anything is charged.",
  ctaLabel: 'Request a Free Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'aboutPage', _type: 'aboutPage',
  seoTitle: 'About Mary Ann — MAS Monograms',
  seoDescription:
    'MAS Monograms is a one-woman home embroidery studio in St. Matthews, SC. Meet Mary Ann Stone, the person behind every hand-stitched order.',
  heroEyebrow: 'St. Matthews, SC · Home-based · Handcrafted',
  heroHeadline: 'The person behind every stitch.',
  heroSubhead:
    "MAS Monograms is a one-woman home embroidery studio. Every order gets personal attention, because that's the whole point.",
  storyEyebrow: 'Meet the maker',
  storyHeadline: "Hi, I'm Mary Ann.",
  storyContent: pt(
    'MAS Monograms started the way most good things do, as a creative outlet that quietly turned into something bigger. I’ve been doing embroidery for the last three years, and what started as a challenge has become one of my favorite things. There’s something deeply satisfying about taking a blank item and turning it into something personal and lasting.',
    'I run this business out of my home in St. Matthews, SC. That means every order comes directly to me, there’s no team, no warehouse, and no assembly line. When you reach out, you’re talking to the person who will actually stitch your item.',
    ['“No task is too great, and I really mean that. If you have an idea you’re not sure about, just ask. That’s my favorite kind of conversation.”', ['em']],
    'I work with blankets, towels, clothing, totes, hats, baby items, home goods, even socks and shoe laces. Beyond embroidery, I also do card making and basic sewing, and I’m always exploring new crafts.',
  ),
  makerAttribution: 'Mary Ann Stone · Founder, MAS Monograms',
  studioNote: 'Handcrafted in St. Matthews, SC.',
  valuesEyebrow: 'Why customers come back',
  valuesHeadline: 'What makes MAS Monograms different',
  values: keyed([
    { label: 'One person, every order', body: 'You deal directly with me, no customer service queues, no middlemen. Your message goes straight to the person stitching your item.' },
    { label: 'Personal guidance included', body: 'Not sure what font or thread to pick? Just say so. Helping you figure out what you actually want is one of the best parts of the job.' },
    { label: 'Local & accessible', body: 'Based in St. Matthews, SC. Local pickup is always available, and the pricing reflects a home studio, not a commercial retailer.' },
    { label: 'Gift-ready thinking', body: "A lot of orders are gifts. Tight timelines, specific occasions, handwritten note requests, I'm used to making it work." },
    { label: 'Price before payment, always', body: 'Every order starts with a free custom quote. You approve the price before anything is stitched or charged. No surprises.' },
    { label: 'Bring what you have', body: "You don't have to buy from me. If you have an item you love and want monogrammed, bring it in. Most fabric items work just fine." },
  ]),
  ctaEyebrow: "Let's make something",
  ctaHeadline: 'Ready to make something personal?',
  ctaSubhead: "Requesting a quote is free and takes about 2 minutes. I'll reply within 1 business day.",
  ctaLabel: 'Request a Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'requestAQuotePage', _type: 'requestAQuotePage',
  seoTitle: 'Request a Quote — MAS Monograms',
  seoDescription:
    "Request a free custom embroidery quote. Tell me what you'd like monogrammed and I'll send your price within 1 business day. No payment to ask.",
  heroEyebrow: 'Free · About 2 minutes · No payment now',
  heroHeadline: 'Request a custom quote',
  heroSubhead:
    "Tell me what you'd like monogrammed and I'll send your custom price within 1 business day. It's free to ask, and you approve the price before anything is stitched.",
  formIntroHeadline: 'Tell me about your order',
  formIntroBody:
    "The more detail you can share, the more accurate your quote. Not sure about something? Leave it blank or just say 'recommend for me,' that's genuinely one of my favorite things to help with.",
  turnaroundCallout: 'I reply to every request within 1 business day.',
  requiredFieldNote: 'Fields marked * are required.',
  nameLabel: 'Your name', namePlaceholder: 'Jane Smith',
  emailLabel: 'Email address', emailPlaceholder: 'you@example.com',
  emailHelp: "I'll send your quote to this address.",
  phoneLabel: 'Phone number (optional)', phonePlaceholder: '(803) 555-1234',
  phoneHelp: 'Optional. Only used if I have a quick follow-up question.',
  itemTypeLabel: 'What would you like embroidered?',
  itemTypeHelp: 'Select the closest match. You can add details in the notes below.',
  itemTypeOtherLabel: 'Something else / not listed',
  quantityLabel: 'Quantity', quantityPlaceholder: 'e.g. 1',
  quantityHelp: 'How many pieces? Most orders have no minimum.',
  monogramDetailsLabel: 'Letters, name, or text',
  monogramDetailsPlaceholder: 'e.g. Three-letter monogram: F J L (last initial in the center)',
  monogramDetailsHelp:
    "Include the letters or text and the format if you know it (single initial, three-letter monogram, full name, custom phrase). Not sure? Write 'recommend for me.'",
  placementLabel: 'Embroidery placement',
  placementPlaceholder: 'e.g. Left chest, center, cuff, hat front, corner',
  placementHelp: "Where on the item would you like the embroidery? Not sure? Just say 'recommend for me.'",
  fontPreferenceLabel: 'Font preference (optional)',
  fontPreferenceHelp: "Browse the Font & Lettering Guide for examples. Not sure? Leave it blank and I'll suggest options.",
  fontPreferenceGuideLinkLabel: 'Browse the font guide',
  colorPreferenceLabel: 'Thread color preference (optional)',
  colorPreferencePlaceholder: "e.g. Navy, blush, or 'recommend for me'",
  colorPreferenceHelp:
    "Browse the Thread Color Chart for specific colors, or describe what you have in mind and I'll match it as closely as I can.",
  colorPreferenceChartLinkLabel: 'Browse the thread color chart',
  fileUploadLabel: 'Reference photos (optional)',
  fileUploadHelp: 'Upload photos of your item or any inspiration images. Accepted formats: JPG, PNG, WEBP, PDF.',
  fileUploadAcceptedTypes: 'JPG, PNG, WEBP, PDF · 10 MB max per file · 5 files max',
  rushLabel: 'I need this by a specific date',
  rushHelp: "Rush orders are often possible for an additional fee. I'll confirm the timeline and cost in your quote.",
  neededByLabel: 'Needed by',
  neededByHelp: "I'll do my best to meet your deadline. Earlier notice means a better chance of availability.",
  specialInstructionsLabel: 'Anything else?',
  specialInstructionsPlaceholder: 'Special requests, the occasion, gift notes, questions, anything at all.',
  referralLabel: 'How did you hear about MAS Monograms? (optional)',
  referralOptions: [
    'Facebook', 'Instagram', 'Google search', 'Word of mouth / referral',
    'Returning customer', 'Local event or market', 'Other',
  ],
  submitLabel: 'Send my quote request',
  privacyNote: 'Your information is kept private and never shared.',
  errorMessage:
    "Something went wrong submitting your request. Please email me directly at the address in the footer and I'll take care of it.",
});

add({
  _id: 'shopIndexPage', _type: 'shopIndexPage',
  seoTitle: 'Shop by Item — MAS Monograms',
  seoDescription:
    'Browse custom embroidery by item type: totes, towels, hats, shirts, jackets, baby gifts, home goods, or bring your own item. Free quotes.',
  heroEyebrow: 'Shop by item',
  heroHeadline: 'What would you like embroidered?',
  heroSubhead:
    "Browse by item type to see real examples and starting prices. When you're ready, request a free quote.",
  ctaEyebrow: "Don't see your item?",
  ctaHeadline: 'Bring what you have',
  ctaSubhead:
    "If you have something you love, bring it in. Most fabric items work beautifully. Request a free quote and I'll let you know.",
  ctaLabel: 'Request a Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'styleGalleryPage', _type: 'styleGalleryPage',
  seoTitle: 'Style Gallery — MAS Monograms',
  seoDescription:
    'Browse real custom embroidery work from the MAS Monograms studio. Monograms, names, and appliqué on towels, totes, apparel, baby gifts, and more.',
  heroEyebrow: 'Style Gallery',
  heroHeadline: 'Not sure where to start?',
  heroSubhead:
    "Browse real work from my studio, then tell me your vibe. I'll pick the perfect font and thread combination for you.",
  filterAllLabel: 'All',
  emptyStateMessage: 'New photos are added often, check back soon, or request a quote to start your own.',
  ctaEyebrow: 'Found something you love?',
  ctaHeadline: "Let's make it yours",
  ctaSubhead: "Tell me your vibe and I'll recommend the perfect combination. Requesting a quote is free.",
  ctaLabel: 'Request a Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'fontGuidePage', _type: 'fontGuidePage',
  seoTitle: 'Font & Lettering Guide — MAS Monograms',
  seoDescription:
    'Browse available embroidery fonts and monogram styles, shown as real stitched samples. Find your lettering style, then request a free quote.',
  heroEyebrow: 'Fonts & Lettering',
  heroHeadline: 'Find your lettering style',
  heroSubhead:
    'Because these are embroidery fonts, not computer fonts, every style is shown as a real stitched sample. Final sizing is confirmed in your quote.',
  intro: pt(
    'These are my available embroidery fonts, shown as real stitched samples so you can see exactly how the lettering looks. Browse the named line fonts for names and words, the monogram styles for classic three-letter arrangements, and the decorative styles for something with more personality.',
    "Not sure which to choose? Just say 'recommend for me' on your quote and I'll suggest the perfect match.",
  ),
  fontGridEyebrow: 'Browse the styles',
  fontGridHeadline: 'Available fonts',
  customFontNote: "Don't see the style you want? Ask in your quote request, I'm always happy to source something new.",
  ctaEyebrow: 'Found a favorite?',
  ctaHeadline: "Let's put it on something",
  ctaSubhead: 'Tell me the font you like (or let me recommend one) and request your free quote.',
  ctaLabel: 'Request a Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'threadChartPage', _type: 'threadChartPage',
  seoTitle: 'Thread Color Chart — MAS Monograms',
  seoDescription:
    'Browse the embroidery thread colors I work with most, grouped by color family. On-screen colors are approximate, I confirm the exact thread with you.',
  heroEyebrow: 'Thread Colors',
  heroHeadline: 'Pick your perfect color',
  heroSubhead:
    "A reference of the thread colors I work with most. On-screen colors are approximate, I'll always confirm the exact thread with you.",
  intro: pt(
    'Here are the thread colors I reach for most often. Keep in mind that screen colors are only approximate, every monitor is a little different, so think of these as a starting point. When you request a quote, tell me the colors you have in mind and I’ll confirm the exact thread before stitching.',
  ),
  matchingNote:
    "Have a specific color in mind that isn't shown? Describe it or send a photo in your quote, and I'll match it as closely as I can.",
  customColorNote: 'Need a specific color? Just ask in your quote request.',
  ctaEyebrow: 'Found your colors?',
  ctaHeadline: "Let's bring them to life",
  ctaSubhead: 'Tell me your colors (or let me recommend a pairing) and request your free quote.',
  ctaLabel: 'Request a Quote',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'clearancePage', _type: 'clearancePage',
  seoTitle: 'Clearance — MAS Monograms',
  seoDescription:
    'Ready-to-ship, one-of-a-kind embroidered pieces, no quote needed. Buy now while supplies last, or request a custom order.',
  heroEyebrow: 'Clearance',
  heroHeadline: 'Ready to ship, no quote needed',
  heroSubhead: "Pre-made and one-of-a-kind pieces, priced to move. When they're gone, they're gone.",
  intro: pt(
    "Every item here is already made and ready to ship or pick up, no quote, no wait. These are one-of-a-kind pieces, so once something sells it's gone for good. Check back often; I add new pieces as I make them.",
  ),
  paymentNote: 'Each item links directly to a secure Stripe checkout. I never see your card details.',
  pickupNote: "Local pickup in St. Matthews, SC, or I'll arrange shipping, just reach out after you buy.",
  soldOutLabel: 'Sold',
  buyButtonLabel: 'Buy now',
  emptyStateMessage: 'Nothing in the clearance section right now, check back soon, or request a custom quote.',
  ctaEyebrow: 'Want something custom?',
  ctaHeadline: "I'll make it just for you",
  ctaSubhead:
    "Don't see what you're looking for? Request a free custom quote and we'll create exactly what you have in mind.",
  ctaLabel: 'Request a Custom Order',
  ctaHref: '/request-a-quote',
});

add({
  _id: 'thankYouPage', _type: 'thankYouPage',
  seoTitle: 'Quote request received — MAS Monograms',
  eyebrow: 'Request received!',
  headline: "Thank you, I'll be in touch soon.",
  body: pt(
    "Your quote request is in, and it's on its way to my inbox. I read every single one personally. I'll review the details and send your custom price by email, usually within 1 business day. In the meantime, feel free to keep browsing.",
  ),
  expectedResponseTime: 'I respond to every request within 1 business day, often the same day.',
  nextSteps: [
    "I'll review your request and the details you shared.",
    "I'll send a custom, itemized quote to your email.",
    'Once you approve, I get stitching, and arrange pickup or shipping.',
  ],
  ctaLabel: 'Explore the gallery',
  ctaHref: '/style-gallery',
});

add({
  _id: 'notFoundPage', _type: 'notFoundPage',
  seoTitle: 'Page not found — MAS Monograms',
  seoDescription: 'That page wandered off. Head back home or request a quote.',
  eyebrow: '404',
  headline: 'That page wandered off.',
  body: "It happens! Maybe a link got stale or the URL has a small typo. Here's where to head next.",
  primaryCtaLabel: 'Back to home', primaryCtaHref: '/',
  secondaryCtaLabel: 'Request a quote', secondaryCtaHref: '/request-a-quote',
  tertiaryCtaLabel: 'Browse what I embroider', tertiaryCtaHref: '/shop-by-item',
});

// ═══════════════════════════════════════════════════════════════════════════
// ITEM CATEGORIES (8)
// ═══════════════════════════════════════════════════════════════════════════
const categories = [
  { slug: 'tote-bags', name: 'Tote Bags & Pouches', price: 'Starting at $16',
    description: 'The gift people actually use. Canvas, jute, nylon, monogrammed with your initials or name.' },
  { slug: 'towels-linens', name: 'Towels & Linens', price: 'Starting at $16',
    description: 'Bath towels, hand towels, tea towels, napkins. The easiest upgrade to your guest bath or kitchen.' },
  { slug: 'hats-caps', name: 'Hats & Caps', price: 'Starting at $16',
    description: 'Baseball caps, beanies, sun hats, monogrammed or custom text, centered or side-stitched.' },
  { slug: 'shirts-tops', name: 'Shirts & Tops', price: 'Starting at $16',
    description: 'Polos, t-shirts, button-downs. Chest, cuff, or pocket placement, perfect for teams or gifts.' },
  { slug: 'jackets-sweatshirts', name: 'Jackets & Sweatshirts', price: 'Starting at $18',
    description: 'Bordered sash, appliqué, or bold collegiate lettering.' },
  { slug: 'baby-kids', name: 'Baby & Kids', price: 'Starting at $16',
    description: "Soft thread, sweet fonts, and something they'll keep forever. Onesies, blankets, burp cloths." },
  { slug: 'home-gifts', name: 'Home & Gifts', price: 'Starting at $16',
    description: "Ornaments, pillows, blankets, door hangers, wreath sashes. If it's fabric, I can monogram it." },
  { slug: 'bring-your-own-item', name: 'Bring Your Own Item', price: 'Free assessment',
    description: "Have something you love? Bring it in. I'll assess it free, most fabric items work beautifully." },
];
categories.forEach((c, i) => {
  const isByo = c.slug === 'bring-your-own-item';
  add({
    _id: `category-${c.slug}`, _type: 'itemCategory',
    name: c.name, slug: slug(c.slug),
    description: c.description,
    trustItems: isByo
      ? ['Free assessment', 'Most fabric items work', 'No purchase required']
      : [c.price, 'Hand-stitched to order', 'Local pickup or shipping'],
    ctaLabel: isByo ? 'Ask about your item' : 'Request a quote',
    displayOrder: i + 1,
    featured: !isByo,
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FONTS (18)  — previewImage omitted (uploaded separately). styleTag is a best
// guess for the line fonts and should be reviewed against the real samples.
// ═══════════════════════════════════════════════════════════════════════════
const lineFonts = [
  ['Meadow', 'script', false], ['Moonlight', 'script', true], ['Fuchsia', 'script', false],
  ['Hydrangea', 'script', true], ['Subscriber', 'modern', false], ['Melissa', 'script', false],
  ['Swallow', 'script', false], ['Green Lemonade', 'script', false], ['Katherine', 'script', true],
  ['Edelweiss', 'script', false],
];
lineFonts.forEach(([name, style, popular], i) => {
  add({
    _id: `font-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, _type: 'font',
    name, slug: slug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    styleTag: style, popular, displayOrder: i + 1,
  });
});

const monogramStyles = [
  ['Master Circle', 'master-circle', 'The classic interlocking three-letter monogram, set in a circular shape. The default when someone says "monogram."', true],
  ['Vine / Heirloom', 'vine-heirloom', 'A full ornate vine-script alphabet with paired forms. Elegant for both monograms and names.', false],
  ['Pillow', 'pillow', 'An ornate, flourished single-letter script alphabet. Works beautifully for monograms and names.', false],
];
monogramStyles.forEach(([name, s, description, popular], i) => {
  add({
    _id: `font-${s}`, _type: 'font',
    name, slug: slug(s), styleTag: 'monogram', description, popular, displayOrder: 11 + i,
  });
});

const appliqueFonts = [
  ['Golden Valley', 'golden-valley', 'script', 'Flowing, connected script.'],
  ['Fishtail', 'fishtail', 'block', 'Tall, decorative serif capitals.'],
  ['Curlz', 'curlz', 'script', 'Playful, curly, and casual.'],
  ['Classic', 'classic', 'classic', 'Clean serif, full a–z plus numbers and symbols.'],
  ['CA Liberty', 'ca-liberty', 'block', 'Tall, condensed, appliqué-style lettering.'],
];
appliqueFonts.forEach(([name, s, style, description], i) => {
  add({
    _id: `font-${s}`, _type: 'font',
    name, slug: slug(s), styleTag: style, description, popular: false, displayOrder: 14 + i,
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// THREAD COLORS — COMMON STARTER SET. Replace with Mary Ann's real inventory.
// Hex values are approximate for on-screen display only.
// ═══════════════════════════════════════════════════════════════════════════
const threads = [
  ['White', '#fafafa', 'white'], ['Cream', '#f3ead6', 'white'], ['Ivory', '#f7f2e3', 'white'],
  ['Black', '#1a1a1a', 'gray'], ['Charcoal', '#3a3a3a', 'gray'], ['Silver Gray', '#a8a8a8', 'gray'],
  ['Navy', '#1f2d4d', 'blue'], ['Royal Blue', '#23418b', 'blue'], ['Light Blue', '#9dc3e6', 'blue'], ['Teal', '#0f6b6b', 'blue'],
  ['Forest Green', '#2c4a32', 'green'], ['Sage', '#8a9e8c', 'green'], ['Kelly Green', '#2e7d4f', 'green'], ['Olive', '#6b6b3a', 'green'],
  ['Red', '#b22222', 'red'], ['Burgundy', '#6e1f2a', 'red'], ['Blush Pink', '#e0a8a0', 'red'], ['Hot Pink', '#d94f8a', 'red'],
  ['Orange', '#d2691e', 'orange'], ['Gold', '#c9a227', 'orange'], ['Sunflower Yellow', '#f0c419', 'orange'],
  ['Purple', '#5b2a83', 'purple'], ['Lavender', '#b497bd', 'purple'],
  ['Chocolate Brown', '#5a3a22', 'brown'], ['Tan', '#c2a878', 'brown'],
  ['Metallic Gold', '#caa83d', 'metallic'], ['Metallic Silver', '#c0c0c0', 'metallic'],
];
threads.forEach(([name, hex, family], i) => {
  add({
    _id: `thread-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, _type: 'threadColor',
    name, slug: slug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    hexColor: hex, colorFamily: family, displayOrder: i + 1,
  });
});

// Testimonials removed 2026-07-03 — Mary Ann has no real reviews yet and we
// don't seed invented ones. Re-add a testimonial doc type + real quotes when
// genuine reviews exist. (Also removed: homePage.testimonials* fields and the
// homePage.statsItems strip — see git history for the schema at that point.)

// ═══════════════════════════════════════════════════════════════════════════
// PRICING TIERS (4) — MAS prices by complexity, not quantity. minQuantity is
// set to 1 (vestigial for this model); the note carries the real descriptor.
// ═══════════════════════════════════════════════════════════════════════════
add({ _id: 'tier-basic', _type: 'pricingTier', label: 'Basic Monogram', minQuantity: 1, pricePerPiece: 16,
  note: 'Single-color monogram or name. Six letters or fewer. The everyday starting point.', highlighted: true, displayOrder: 1 });
add({ _id: 'tier-premium', _type: 'pricingTier', label: 'Premium Monogram', minQuantity: 1, pricePerPiece: 18,
  note: 'Bordered or sash styles, two-sided designs, or multiple colors. Great for jackets and sweatshirts.', highlighted: false, displayOrder: 2 });
add({ _id: 'tier-applique', _type: 'pricingTier', label: 'Custom Appliqué', minQuantity: 1, pricePerPiece: 45,
  note: 'Layered fabric designs. Includes a one-time $30 setup charge plus stitching by stitch count.', highlighted: false, displayOrder: 3 });
add({ _id: 'tier-custom', _type: 'pricingTier', label: 'Custom Embroidery', minQuantity: 1, pricePerPiece: 16,
  note: 'Your own artwork, digitized and stitched, plus a one-time $30 digitizing fee. Detailed pieces run $60–$75.', highlighted: false, displayOrder: 4 });

// ═══════════════════════════════════════════════════════════════════════════
// POPULAR COMBINATIONS (3) — image omitted. relatedCategory wired to real refs.
// ═══════════════════════════════════════════════════════════════════════════
add({ _id: 'combo-classic', _type: 'popularCombination', name: 'Navy on White',
  description: 'Block font · three-letter monogram · perfect for towels and linens.',
  tags: ['Classic', 'Towels & Linens'], relatedCategory: ref('category-towels-linens'), featured: true, displayOrder: 1 });
add({ _id: 'combo-gift', _type: 'popularCombination', name: 'Blush Script',
  description: 'Fishtail font · first name · ideal for totes and baby items.',
  tags: ['Gift-Ready', 'Baby & Kids'], relatedCategory: ref('category-baby-kids'), featured: true, displayOrder: 2 });
add({ _id: 'combo-bold', _type: 'popularCombination', name: 'Forest on Cream',
  description: 'Premium bordered sash · three-letter monogram · great for sweatshirts.',
  tags: ['Bold', 'Jackets & Sweatshirts'], relatedCategory: ref('category-jackets-sweatshirts'), featured: true, displayOrder: 3 });

// ═══════════════════════════════════════════════════════════════════════════
// FAQ ITEMS (6) — from the How It Works page. answer is Portable Text.
// ═══════════════════════════════════════════════════════════════════════════
const faqs = [
  ['Do I have to pay anything to request a quote?',
    "No, submitting a quote request is completely free. You'll only pay after you review and approve your custom invoice.",
    'Pricing', true, true],
  ['What if I’m not sure what font or thread color to choose?',
    "Just say 'recommend for me' on any choice in the form, that's genuinely one of my favorite things to do. Tell me your vibe (classic, bold, soft, festive) and I'll suggest the perfect combination.",
    'Design', true, false],
  ['Can I bring my own item to be monogrammed?',
    "Yes. 'Bring Your Own Item' is a first-class option. Most fabric items work well. Select that option on the quote form and describe what you have, I'll let you know if it's a good candidate before you commit to anything.",
    'Items', true, false],
  ['How long does it take from quote to finished item?',
    "I respond to quote requests within 1 business day (usually the same day). Once approved and paid, most orders are completed within 3 to 7 business days. Rush turnaround is available, just flag it in your request and I'll let you know if it's possible.",
    'Turnaround', true, true],
  ['What if I want to make changes after I submit the form?',
    "No problem. Just reply to the quote email before approving, I can adjust the design, font, thread, or anything else. Changes after stitching has begun may not be possible, but I'll always check in with you first if anything looks unclear.",
    'Ordering', true, false],
  ['Do you ship, or is this pickup only?',
    "I'm based in St. Matthews, South Carolina, and local pickup is always welcome. Shipping is available, just mention it in your quote request and I'll include the shipping cost in your invoice.",
    'Shipping', true, false],
];
faqs.forEach(([question, answer, category, hiw, pricing], i) => {
  add({
    _id: `faq-${i + 1}`, _type: 'faqItem',
    question, answer: pt(answer), category,
    displayOrder: i + 1, showOnHowItWorks: hiw, showOnPricing: pricing,
  });
});

// ── Write NDJSON ─────────────────────────────────────────────────────────────
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n';
writeFileSync(outPath, ndjson, 'utf-8');

const counts = docs.reduce((m, d) => ((m[d._type] = (m[d._type] || 0) + 1), m), {});
console.log(`Wrote ${docs.length} documents to ${outPath}\n`);
for (const [type, n] of Object.entries(counts).sort()) console.log(`  ${type}: ${n}`);
