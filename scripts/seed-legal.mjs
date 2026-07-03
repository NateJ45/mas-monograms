// Seeds the three legal/policy pages (Privacy, Terms, Accessibility) with
// sensible STARTER content. Re-runnable (deterministic ids via createOrReplace).
// The wording is a reasonable first draft — the owner should review it (and,
// for anything legally binding, have a professional look it over).
// Run: node scripts/seed-legal.mjs
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const settings = await client.fetch(`*[_type=="siteSettings"][0]{ email, title }`);
const EMAIL = settings?.email || 'owner@example.com';
const NAME = settings?.title || 'MAS Monograms';
const UPDATED = '2026-07-02';

let k = 0;
const key = () => `k${k++}`;
const span = (text, marks = []) => ({ _type: 'span', _key: key(), text, marks });
const p = (...spans) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: spans.map((s) => (typeof s === 'string' ? span(s) : s)) });
const h2 = (text) => ({ _type: 'block', _key: key(), style: 'h2', markDefs: [], children: [span(text)] });
const bullets = (items) => items.map((t) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [span(t)] }));
const emailLine = (lead) => {
  const lk = key();
  return { _type: 'block', _key: key(), style: 'normal', markDefs: [{ _type: 'link', _key: lk, href: `mailto:${EMAIL}` }], children: [span(lead + ' '), span(EMAIL, [lk]), span('.')] };
};

const privacy = {
  _id: 'legal-privacy', _type: 'legalPage', title: 'Privacy Policy', slug: { _type: 'slug', current: 'privacy' },
  displayOrder: 1, lastUpdated: UPDATED,
  seoDescription: `How ${NAME} collects, uses, and protects the information you share when you request a quote.`,
  body: [
    p(`${NAME} respects your privacy. This policy explains what information we collect when you use this website, how we use it, and the choices you have.`),
    h2('Information we collect'),
    p('When you submit the quote form, we collect the details you provide — your name, email address, phone number, the project details you describe, and any reference photos you choose to upload. To keep the form free of spam, we use Cloudflare Turnstile, which may process limited technical data (such as your IP address) to tell humans from bots.'),
    ...bullets([
      'We do not knowingly collect information from anyone under 13.',
      'We only ask for what we need to prepare your quote and complete your order.',
    ]),
    h2('How we use your information'),
    p('We use your information solely to respond to your quote request, prepare your order, and communicate with you about it. We do not sell, rent, or trade your personal information.'),
    h2('How your information is handled'),
    p('Quote submissions are delivered to us by email through Resend, and a copy is stored securely so nothing is lost in transit. These service providers process your information only to provide those services to us.'),
    h2('Analytics'),
    p('We may use privacy-friendly, cookie-free website analytics to understand which pages are visited. This does not identify you personally.'),
    h2('Your choices'),
    emailLine('You can ask us to access or delete the information you have shared at any time — just email us at'),
    h2('Contact'),
    emailLine('Questions about this policy? Email us at'),
  ],
};

const terms = {
  _id: 'legal-terms', _type: 'legalPage', title: 'Terms of Use', slug: { _type: 'slug', current: 'terms' },
  displayOrder: 2, lastUpdated: UPDATED,
  seoDescription: `The terms that apply when you use the ${NAME} website and request custom embroidery.`,
  body: [
    p(`By using this website, you agree to these terms. Please read them along with our Privacy Policy.`),
    h2('Quotes and orders'),
    p('Prices shown on this site are starting points. A quote is an estimate — it does not become a binding order until we confirm the details and pricing with you directly. Turnaround times are estimates and can vary with the season and order volume.'),
    h2('Your artwork and content'),
    p('If you send us initials, names, logos, or other artwork to embroider, you confirm that you have the right to use it. You remain responsible for the content of anything you ask us to stitch.'),
    h2('Our content'),
    p(`The text, photographs, and designs on this website are owned by ${NAME} and may not be copied or reused without our permission.`),
    h2('No warranty'),
    p('This website is provided on an "as is" basis. We work to keep the information accurate and current but do not guarantee that it is complete or error-free.'),
    h2('Governing law'),
    p('These terms are governed by the laws of the State of South Carolina, USA.'),
    h2('Contact'),
    emailLine('Questions about these terms? Email us at'),
  ],
};

const accessibility = {
  _id: 'legal-accessibility', _type: 'legalPage', title: 'Accessibility Statement', slug: { _type: 'slug', current: 'accessibility' },
  displayOrder: 3, lastUpdated: UPDATED,
  seoDescription: `${NAME} is committed to making this website usable for everyone.`,
  body: [
    p(`${NAME} wants everyone to be able to browse our work and request a quote, regardless of ability.`),
    h2('Our commitment'),
    p('We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. The site is built with semantic HTML, keyboard-navigable controls, descriptive text alternatives for images, and colour combinations chosen for readable contrast, and we check these as part of our build.'),
    h2('Ongoing effort'),
    p('Accessibility is an ongoing effort, and some content may not yet be perfect. We keep working to improve it.'),
    h2('Tell us if something is hard to use'),
    emailLine('If you have trouble using any part of this website, please let us know and we will help — and fix it. Email us at'),
  ],
};

for (const doc of [privacy, terms, accessibility]) {
  const res = await client.createOrReplace(doc);
  console.log('seeded', res._id, '→ /legal/' + doc.slug.current);
}
