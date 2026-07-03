// scripts/seed-studio-guides.mjs
//
// Seeds the three "Start Here" handbook singletons that Mary Ann sees when she
// opens the Studio: studioGuide (How your website works), studioNotes (the
// editable business notes behind "Your business at a glance"), and
// studioPlaybook (Grow your studio). Content is written for MAS Monograms
// specifically — a one-woman hand-embroidery studio in St. Matthews, SC — and
// reflects the CURRENT site (Heirloom Coast redesign, 2026-07-03).
//
// Why a dedicated seed: scripts/seed-core.mjs is the leftover interior-design
// "Studio Starter" seed and its guide content is all about photographing rooms
// and furniture trade accounts. Do NOT run that one. This file touches ONLY the
// three guide singletons via createOrReplace with deterministic _ids, so it is
// idempotent and safe to re-run.
//
// Run:
//   node scripts/seed-studio-guides.mjs
//
// Requires PUBLIC_SANITY_PROJECT_ID + SANITY_API_WRITE_TOKEN in .env
// (PUBLIC_SANITY_DATASET defaults to "production").

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { loadEnv } from './lib/loadEnv.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const env = loadEnv(root);
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.log('PUBLIC_SANITY_PROJECT_ID is not set. Configure your .env and re-run.');
  process.exit(0);
}
if (!token) {
  console.log('SANITY_API_WRITE_TOKEN is not set. A write token is required to seed content.');
  process.exit(0);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-05-01', useCdn: false });

// Stable-per-run _key generator (fine for createOrReplace).
let _k = 0;
const key = () => `sg-${(_k++).toString(36)}`;
const mapRow = (area, description) => ({ _type: 'mapRow', _key: key(), area, description });
const howTo = (title, steps) => ({ _type: 'howTo', _key: key(), title, steps });
const tip = (heading, tone, body) => ({ _type: 'tip', _key: key(), heading, tone, body });
const link = (label, url) => ({ _type: 'playbookLink', _key: key(), label, url });
const section = (heading, tone, { body, bullets, links } = {}) => ({
  _type: 'playbookSection', _key: key(), heading, tone,
  ...(body ? { body } : {}),
  ...(bullets ? { bullets } : {}),
  ...(links ? { links } : {}),
});
const guide = (title, summary, sections) => ({ _type: 'playbookGuide', _key: key(), title, summary, sections });

const docs = [];

// ══════════════════════════════════════════════════════════════════════════
// 1. studioGuide — "How your website works"
// ══════════════════════════════════════════════════════════════════════════

docs.push({
  _id: 'studioGuide',
  _type: 'studioGuide',
  guideTitle: 'How your website works',
  guideIntro:
    `Welcome to your control panel, Mary Ann. Everything on mas-monograms.com — every word, price, and photo — comes from right here. You edit the content; the design takes care of itself, so you cannot break how the site looks.

When you click Publish, your change is live on the real website within a few seconds. There is no separate "upload" step.

New here? Start with Site Settings (your name, contact info, hours), then look through the Pages. This guide explains where everything lives and walks you through the tasks you will do most often.`,
  studioMap: [
    mapRow('Start Here', 'The four guides you are reading now: how the site works, your business at a glance, your brand kit (colors and fonts), and ways to grow your studio.'),
    mapRow('Site Settings', 'Your business name, email, phone, address, service area, opening hours, social links, and Google Business link. This feeds the footer of every page and your Google listing. Update it first.'),
    mapRow('Pages', 'One document per page of the site — Home, How It Works, Pricing, About, Request a Quote, Shop by Item, Style Gallery, Font & Lettering Guide, Thread Color Chart, Clearance, Thank You, and the 404 page. Open any page to edit its words and images. Most pages have a "Preview" tab so you can see your change.'),
    mapRow('Content', 'The reusable pieces you add to most often: Item Categories (the shop pages like Hats and Totes), Embroidery Fonts, Thread Colors, Style Gallery photos, Pricing Tiers, Popular Combinations, Clearance Items, and FAQ Items.'),
  ],
  howTos: [
    howTo('Add a photo to the Style Gallery (most common task)', [
      'In the left menu, open Content, then Style Gallery.',
      'Click "Create new" (top of the list).',
      'Upload your photo. Square photos look best in the gallery grid.',
      'Write the Alt text — one plain sentence describing the photo, e.g. "Navy three-letter monogram on a white waffle towel." This is required, and it helps you show up in Google image searches.',
      'Optional but recommended: choose the Item type and the Font used. This makes the photo show up when visitors use the filters on the gallery page.',
      'Add a few Tags (like "wedding", "baby", "hat") for filtering.',
      'Flip "Featured" on if it is one of your best — featured photos show first and may appear on the homepage.',
      'Click Publish. The photo is on the Style Gallery page within seconds.',
    ]),
    howTo('Change the photos on a shop page (Hats, Totes, etc.)', [
      'Open Content, then Item Categories.',
      'Click the category you want to update (for example "Hats & Caps").',
      '"Hero images" are the big photos at the top of that page — you can have one to three; two or more become a slow slideshow.',
      '"Grid card image" is the small thumbnail shown on the Shop by Item page.',
      'Upload or replace photos. Every photo needs Alt text.',
      'Click Publish.',
    ]),
    howTo('Add a brand-new shop category (a new page like /aprons)', [
      'Open Content, then Item Categories, then "Create new".',
      'Type the Category name (e.g. "Aprons"). The Slug — the web address — fills in automatically.',
      'Write the Description (the intro paragraph at the top of the page).',
      'Add one to three Hero images and one Grid card image (each needs Alt text).',
      'Add 2–5 short Trust strip lines (e.g. "Starting at $18", "Hand-finished to order").',
      'Set a Starting price if you want a "from $__" shown on the card.',
      'Click Publish. A new page appears at mas-monograms.com/aprons and a card shows on Shop by Item.',
      'To add it to the top menu too: open Site Settings, then Navigation, and add a link.',
    ]),
    howTo('Adjust the questions on the quote form', [
      'To reword a question, its helper text, or the submit button: open Pages, then Request a Quote Page. Every label and help line is a field here — change the words and Publish.',
      'To change the "How did you hear about me?" choices: same page, find "Referral source options" and add or remove lines.',
      'To change which ITEM TYPES appear in the first dropdown: those come from your Item Categories (Content → Item Categories). Add or rename a category and it appears in the form automatically.',
      'To change which FONTS appear: those come from your Embroidery Fonts (Content → Embroidery Fonts).',
      'The fixed choice lists — monogram style, placement, size, and number of thread colors — are built into the site for consistency and are NOT edited here. To change those, email Nate; it is a quick change for him.',
    ]),
    howTo('Add an embroidery font to the Font Guide', [
      'Open Content, then Embroidery Fonts, then "Create new".',
      'Type the Font name (e.g. "Magnolia Script"). The Slug fills in automatically.',
      'Upload a Preview image — a clear photo or scan of that font actually stitched on fabric. That photo IS the font; the website never loads font files.',
      'Write the Alt text and pick the Style (Script, Block, Monogram, etc.).',
      'Optional: add "Best for" notes and mark it as a Popular pick.',
      'Click Publish.',
    ]),
    howTo('Add a thread color to the chart', [
      'Open Content, then Thread Colors, then "Create new".',
      'Add the color name, the swatch image, and the DMC/thread number if you have it.',
      'Click Publish.',
    ]),
    howTo('Put an item on Clearance (ready to ship, buy now)', [
      'First, in your Stripe account, create a Payment Link for the item and copy it. (The Buy button links straight to Stripe — you never handle card numbers on the website.)',
      'Open Content, then Clearance Items, then "Create new".',
      'Add the name, description, and photos.',
      'Enter the original price and the sale price.',
      'Paste the Stripe Payment Link into the link field.',
      'Click Publish. It appears on the Clearance page with a Buy button.',
    ]),
    howTo('Update your contact info, hours, or social links', [
      'Open Site Settings (near the top of the left menu).',
      'Edit your email, phone, address, service area, opening hours, or social links.',
      'If you have a Google Business Profile, paste its link into the "Google Business Profile URL" field.',
      'Click Publish. This updates the footer on every page and the data Google reads about your business.',
    ]),
    howTo('Change your prices', [
      'Open Content, then Pricing Tiers.',
      'Each row is a quantity bracket with a price per piece. Click one to edit the number.',
      'Click Publish. The Pricing page updates right away.',
    ]),
    howTo('Add or change the About page photo of you', [
      'Open Pages, then About.',
      'Find "Hero image" and upload a photo (add Alt text).',
      'Click Publish. When a photo is present, the top of the About page automatically becomes a two-column layout with your photo beside your intro.',
    ]),
  ],
  tips: [
    tip(
      'Publishing goes live immediately',
      'primary',
      `There is no separate staging step. A few seconds after you click Publish, the change is on the real website. If you want to work on something without it going live yet, just do not hit Publish — Sanity keeps it as a draft until you are ready.`,
    ),
    tip(
      'How to photograph your work',
      'positive',
      `Good photos are the single biggest thing that makes the site feel finished. Shoot near a window in soft, indirect daylight (not direct sun), on a plain background, and fill the frame with the piece. Square photos work best in the gallery. Three great photos beat ten so-so ones. There is more on this in the "Grow your studio" guide.`,
    ),
    tip(
      'Always write the Alt text',
      'default',
      `Every photo asks for "Alt text" — one plain sentence describing what is in the picture. It is required, and it does two jobs: it lets people who use screen readers know what the photo shows, and it helps your work turn up in Google image searches. Just describe it the way you would to a friend on the phone.`,
    ),
    tip(
      'What you can do vs. what needs Nate',
      'caution',
      `You can change any words, prices, and photos, and you can add gallery photos, categories, fonts, thread colors, and clearance items yourself — anytime.

Anything that changes the layout, the design, the colors, or the fixed form dropdowns is a code change. Email Nate at nathanjnixon86@gmail.com for those. Never hesitate to ask — that is exactly the split.`,
    ),
    tip(
      'You can always undo',
      'default',
      `Sanity keeps a history of every document. If you change something and want it back, open the document, use the version history, and restore the earlier version. Most pages also have a "Preview" tab next to the edit form so you can see the page as you work.`,
    ),
  ],
});

// ══════════════════════════════════════════════════════════════════════════
// 2. studioNotes — the editable notes behind "Your business at a glance"
// ══════════════════════════════════════════════════════════════════════════

docs.push({
  _id: 'studioNotes',
  _type: 'studioNotes',
  businessSummary:
    `MAS Monograms is a one-woman embroidery studio run by Mary Ann Stone from her home in St. Matthews, SC. Every piece is stitched by hand, to order — monograms, names, and appliqué on towels, totes, hats, shirts, baby gifts, and more.

The whole point is the personal touch: real attention on every order, made locally, and made just for the person receiving it.`,
  idealClient:
    `People who want something made just for them, from someone local they can trust. Parents ordering baby gifts and back-to-school gear. Brides and bridal parties. Sports teams, churches, and school groups needing a batch. Gift-givers who want it to feel personal.

They care more about it being handmade and right than about being the cheapest option.`,
  voiceSummary:
    `Warm, plain-spoken, and personal — the way Mary Ann would talk to a neighbor across the counter. Confident about the craft without being fussy or fancy. Written in the first person ("I stitch every piece myself"). Friendly and reassuring, never pushy or full of design jargon.`,
  wordsToAvoid: [
    'bespoke',
    'curated',
    'elevated',
    'luxe',
    'seamless',
    'world-class',
    'one-stop shop',
    'unlock',
    'leverage',
    'synergy',
  ],
});

// ══════════════════════════════════════════════════════════════════════════
// 3. studioPlaybook — "Grow your studio"
// ══════════════════════════════════════════════════════════════════════════

docs.push({
  _id: 'studioPlaybook',
  _type: 'studioPlaybook',
  title: 'Grow your studio',
  intro:
    `Practical, no-fluff ways to get more of the right customers — written for a handmade monogram business in a small South Carolina town. Each tab covers one area. You do not have to do all of it at once. Pick one, do it well, then add the next.`,
  guides: [
    // ── Tab 1 ────────────────────────────────────────────────────────────────
    guide(
      'Get found on Google',
      `For a local shop, your free Google Business Profile is the single most valuable thing you can set up. It is what shows up when someone nearby searches "monogramming near me."`,
      [
        section('Claim your free Google Business Profile', 'primary', {
          body: `Go to business.google.com and search for MAS Monograms. If a listing already exists, claim it; if not, create one. Google will verify that you own the business (usually by phone, email, or a mailed postcard with a code). This is free and takes about fifteen minutes to start.`,
          links: [link('Set up Google Business Profile', 'https://business.google.com/')],
        }),
        section('Fill it out completely', 'default', {
          body: `A complete, active profile ranks higher and earns more trust than a bare one. Fill in everything.`,
          bullets: [
            'Business name exactly as it appears on your website',
            'Category: "Embroidery service" (add "Monogramming service" too)',
            'Service area: St. Matthews and Calhoun County',
            'Hours, phone, and a link to mas-monograms.com',
            'A short, friendly description of what you do',
            'Lots of photos of your finished work — this matters a lot',
          ],
        }),
        section('Keep it fresh', 'default', {
          body: `Google rewards active listings. A few minutes a month keeps you ahead of shops that set theirs up and forgot it.`,
          bullets: [
            'Add a few new work photos each month',
            'Use Google Posts for seasonal offers (back-to-school, Christmas)',
            'Reply to every review, good or bad, kindly and briefly',
          ],
        }),
        section('Link it back to your site', 'caution', {
          body: `Once your profile is live, copy its web address and paste it into Site Settings → Google Business Profile URL in this Studio. That connects your website and your Google listing so they reinforce each other.`,
        }),
      ],
    ),
    // ── Tab 2 ────────────────────────────────────────────────────────────────
    guide(
      'Turn happy customers into reviews',
      `Reviews are the closest thing to word-of-mouth online. A handful of genuine five-star Google reviews will do more for you than any ad.`,
      [
        section('Just ask — at the right moment', 'primary', {
          body: `The best time to ask is right when someone picks up their finished order and is clearly delighted. Ask in person, or send a quick text or email the next day.

Something simple works: "I'm so glad you love it! If you have a minute, a quick review on Google or Facebook really helps a small shop like mine." Then send them the direct link so it takes ten seconds.`,
        }),
        section('Where to collect them', 'default', {
          bullets: [
            'Google reviews — the most valuable, because they help you show up in search',
            'Facebook recommendations — great for local reach',
            'A sweet text or message — screenshot it (with permission) for social proof',
          ],
        }),
        section('Get permission to show off the work', 'default', {
          body: `When a customer loves something, ask if you can post the photo and tag them. Most people are happy to say yes, and it turns one order into free marketing.`,
          bullets: [
            'Ask before posting a photo of their item',
            'Ask if you can quote their kind words',
          ],
        }),
        section('Putting testimonials on the website', 'caution', {
          body: `The site has a testimonials feature that is currently turned off, because there were no real reviews yet to show (we never make up quotes). Once you have collected a few genuine ones, email Nate and he will switch it back on and add them. Start collecting now so they are ready to go.`,
        }),
      ],
    ),
    // ── Tab 3 ────────────────────────────────────────────────────────────────
    guide(
      'Show up on social media',
      `Instagram and Facebook are where your work gets seen and shared. You do not need to post every day — you need to post your best work consistently, and always tell people how to order.`,
      [
        section('What to post', 'primary', {
          bullets: [
            'Finished pieces — your best "hero" photos',
            'Short videos of the machine stitching (people love watching this)',
            'Before and after — a blank item next to the monogrammed one',
            'Seasonal ideas — teacher gifts, baby showers, game-day gear',
            'The occasional peek at your studio and your process',
          ],
        }),
        section('Keep it simple and consistent', 'default', {
          body: `Pick a rhythm you can actually keep. Two or three posts a week is plenty. Reuse the same great photos you upload to the website gallery — no need to shoot twice.`,
          bullets: [
            'Post at consistent times so followers get used to you',
            'Write captions the way you talk',
            'Every post should say how to order — link to the quote form',
          ],
        }),
        section('Local Facebook groups are gold', 'default', {
          body: `St. Matthews and Calhoun County community and buy-sell-trade groups put you right in front of local customers. Share finished work where the group allows it, and keep an eye out for "does anyone do monogramming?" posts — those are warm leads.`,
        }),
        section('A little paid reach goes a long way', 'default', {
          body: `Boosting one strong post to people within about 20 miles who like handmade gifts, weddings, or babies can reach hundreds of locals for just a few dollars. Start small — try $5 to $10 on your best-performing post before spending more or building full ads.`,
          links: [link('Facebook & Instagram for business', 'https://www.facebook.com/business/')],
        }),
      ],
    ),
    // ── Tab 4 ────────────────────────────────────────────────────────────────
    guide(
      'Get out in the community',
      `For a St. Matthews studio, in-person and local marketing often beats anything online. This is your home-field advantage — lean into it.`,
      [
        section('Vendor markets & craft fairs', 'primary', {
          body: `A table at local markets, church bazaars, and school events puts your work in front of exactly the right people. Bring finished samples, business cards, and a "scan to order" QR code that opens your quote form.`,
          bullets: [
            'Seasonal craft fairs and holiday markets',
            'Church bazaars and school fundraisers',
            'Farmers markets and community events',
          ],
        }),
        section('Partner with local groups', 'default', {
          body: `One team, church, or school order can be dozens of pieces at once. These relationships are worth more than any single sale.`,
          bullets: [
            'Schools & sports teams — spirit wear, player names, coach and teacher gifts',
            'Churches — choir, youth group, and event shirts',
            'Boutiques & salons — display a few samples and split referrals',
            'Daycares — baby and toddler gifts parents love',
          ],
        }),
        section('Make it easy to refer you', 'default', {
          bullets: [
            'Business cards and a car magnet with your website',
            'A small thank-you discount for customers who send a friend',
            'Leave a few samples where your customers already shop',
          ],
        }),
        section('Ride the seasons', 'default', {
          body: `Monogramming runs on a calendar. Plan a few weeks ahead of each rush so you are ready when the orders come.`,
          bullets: [
            'July–August: back-to-school — backpacks, lunch bags, teacher gifts',
            'October–December: gifts, stockings, ornaments',
            'Spring: weddings, graduations, Mother’s Day',
            'Summer: baby showers, camp gear, beach towels',
          ],
        }),
      ],
    ),
    // ── Tab 5 ────────────────────────────────────────────────────────────────
    guide(
      'Keep the website working for you',
      `The website is only as good as what is on it. A few small habits keep it fresh and bringing in quote requests.`,
      [
        section('Add new work regularly', 'primary', {
          body: `Every few finished orders, add your best photo to the Style Gallery (see the "How your website works" guide for the steps). A gallery that keeps growing tells visitors you are active and busy — which makes them trust you with their order.`,
        }),
        section('Keep your info current', 'default', {
          bullets: [
            'Update your hours around holidays in Site Settings',
            'Add a Clearance item whenever you have ready-made stock to move',
            'Swap in a nicer About photo when you get one',
          ],
        }),
        section('Answer quote requests fast', 'default', {
          body: `The site promises a reply within one business day — and that speed is a real selling point. The faster you reply, the more quote requests turn into paid orders. Even a quick "Got it, I'll send your quote by tomorrow" keeps people from shopping around.`,
        }),
        section('Let customers write your FAQ', 'default', {
          body: `If the same question keeps coming through the quote form or your messages, add it to the FAQ (Content → FAQ Items). Then the next person's answer is already waiting on the site, and you answer it less often.`,
        }),
      ],
    ),
  ],
});

// ══════════════════════════════════════════════════════════════════════════
// Seed
// ══════════════════════════════════════════════════════════════════════════

async function seed() {
  console.log(`Seeding ${docs.length} Start Here guide documents to ${projectId}/${dataset}...`);
  let created = 0;
  let replaced = 0;
  for (const doc of docs) {
    try {
      const existing = await client.fetch('*[_id == $id][0]._id', { id: doc._id });
      await client.createOrReplace(doc);
      if (existing) { replaced += 1; console.log(`  replaced  ${doc._type}  ${doc._id}`); }
      else { created += 1; console.log(`  created   ${doc._type}  ${doc._id}`); }
    } catch (err) {
      console.error(`  ERROR on ${doc._id}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${created} created, ${replaced} replaced.`);
  console.log('Open the Studio → Start Here to see them. Everything is editable there.');
}

seed();
