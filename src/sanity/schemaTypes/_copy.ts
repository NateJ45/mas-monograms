// Safe to edit by hand (the words)
// =============================================================================
// Shared Studio wording for the boxes every page repeats (2026-10-05)
// =============================================================================
// Mary Ann's Studio pass (docs/superpowers/specs/2026-10-05-studio-direction.md,
// Phase A). The same few boxes appear on almost every page: the Google title and
// description, the share picture, the top-of-page headline lines and the closing
// banner. Their wording lives here ONCE so every page says the same thing in the
// same plain words, and a better phrasing lands everywhere at once.
//
// THE SHAPE IS DELIBERATE. These are spread INTO literal `defineField({ name:
// '...', ...SEO_TITLE, ... })` calls rather than being field factories, because
// two checks read the schema files as text: src/lib/page-fields.test.ts (the
// in-canvas drift gate) and scripts/audit-studio.mjs. Both need to see each
// field's `name:` written out at the top level of its page.
//
// House rules for every word here (the spec's principles 2 and 4): plain words,
// short sentences, no em-dashes, never "field", "slug", "schema", "document",
// "URL" or "CTA". Say what the box is and where it shows on the website.
// scripts/audit-studio.mjs checks the schema files for the banned words.
// =============================================================================

/** The collapsed "Google and sharing" box at the bottom of every page form. */
export const SEO_FIELDSET = {
  name: 'seo',
  title: 'Google and sharing (you rarely need to change this)',
  options: { collapsible: true, collapsed: true },
};

/** The tab that holds it. Always the last tab. */
export const SEO_GROUP = { name: 'seo', title: 'Google and sharing' };

export const SEO_TITLE = {
  title: 'Title in Google and on the browser tab',
  description:
    'The blue link people click in Google results. About 50 to 60 letters. Leave it empty and the page uses its usual title.',
};
export const SEO_TITLE_TOO_LONG = 'Google cuts titles longer than about 60 letters short.';

export const SEO_DESCRIPTION = {
  title: 'Short description for Google',
  description: 'The sentence or two under your title in Google results. About 150 to 160 letters.',
};
export const SEO_DESCRIPTION_TOO_LONG =
  'Google cuts descriptions longer than about 160 letters short.';

export const SEO_IMAGE = {
  title: 'Picture when this page is shared',
  description:
    'Shown when someone shares a link to this page on Facebook or in a text message. Leave it empty to use your usual picture.',
};

/** The words-for-the-picture box under any photo. */
export const PHOTO_WORDS = {
  title: 'Describe the photo in a few words',
  description:
    'Read aloud to people who cannot see the picture, and read by Google. For example "Navy monogram on a white hand towel".',
};
export const PHOTO_WORDS_NEEDED =
  'Please describe the photo in a few words, so it can be read aloud to people who cannot see it.';

// ── Top of the page ──────────────────────────────────────────────────────────

export const HERO_EYEBROW = {
  title: 'Small line above the headline',
  description: 'A few words in small letters above the big heading. Leave it empty to hide it.',
};
export const HERO_HEADLINE = {
  title: 'Headline',
  description: 'The big heading at the very top of this page.',
};
export const HEADLINE_NEEDED =
  'Please type a headline. It is the big heading at the top of this page.';
export const HERO_SUBHEAD = {
  title: 'Line under the headline',
  description: 'One or two sentences under the big heading. Leave it empty to hide it.',
};

/** A gentle note for any box with a length limit. Never an error. */
export const TOO_LONG = 'This is getting long, so it may not fit nicely on the page.';

// ── The closing banner at the bottom of most pages ───────────────────────────

export const BANNER_GROUP_TITLE = 'Closing banner at the bottom';

export const BANNER_EYEBROW = {
  title: 'Small line above the banner headline',
  description: 'A few words in small letters. Leave it empty to hide it.',
};
export const BANNER_HEADLINE = {
  title: 'Banner headline',
  description: 'The big words in the dark banner at the very bottom of this page.',
};
export const BANNER_SUBHEAD = {
  title: 'Banner text',
  description: 'One or two sentences under the banner headline. Leave it empty to hide it.',
};
export const BANNER_BUTTON = {
  title: 'Words on the banner button',
  description: 'For example "Request a Quote".',
};
export const BANNER_LINK = {
  title: 'Where the banner button goes',
  description:
    'A page on your website, written like /request-a-quote. Leave it empty to go to the quote form.',
};

// ── Starting templates (src/sanity/templates.ts) ─────────────────────────────

export const BRACKETS_LEFT =
  'This still has words in [square brackets] from the starting template. Please replace them with your own.';

/**
 * A gentle check for a box that still holds a template's [bracketed prompt].
 * Use as `Rule.custom(bracketsLeft).warning()`: a yellow note, never a block.
 * Reads plain text and Portable Text (an answer is an array of paragraphs).
 */
export function bracketsLeft(value: unknown): true | string {
  const text =
    typeof value === 'string'
      ? value
      : Array.isArray(value)
        ? value
            .flatMap((block: { children?: Array<{ text?: unknown }> }) => block?.children ?? [])
            .map((span) => (typeof span?.text === 'string' ? span.text : ''))
            .join(' ')
        : '';
  return /\[[^\]]+\]/.test(text) ? BRACKETS_LEFT : true;
}

/** The words for any "where does this button go" box. */
export const BUTTON_LINK_HELP =
  'A page on your website, written like /request-a-quote or /style-gallery.';
