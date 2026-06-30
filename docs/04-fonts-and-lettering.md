# 04: Fonts & Lettering

The full lettering catalog, and the single most fiddly piece of content to model. Read the key fact
first, then the catalog.

**Key fact:** these are embroidery fonts, not web fonts. Mary Ann does not have font files we can
install and render in CSS. So every font is presented as an **uploaded image preview**, the same way
the Squarespace build handled it. In Sanity, each font is a `font` document with a `previewImage`.
The Font & Lettering Guide page and the quote form's font dropdown both read from these same
documents, so they never drift apart.

The original source images live in `assets/`. Upload them into Sanity (and crop the PDF, see below).

---

## Group A: Named line fonts (for names and text)

Ten named fonts, shown together in `assets/font-10-popular.jpg`. These are the everyday lettering
choices for names, words, and text. Available stitch heights vary by font:

| Font | Available sizes |
|---|---|
| Meadow | 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Moonlight | 0.5", 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Fuchsia | 0.5", 1", 1.5", 2", 2.5", 3", 3.5" |
| Hydrangea | 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Subscriber | 0.5", 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Melissa | 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Swallow | 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Green Lemonade | 0.5", 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Katherine | 0.5", 1", 1.5", 2", 2.5", 3", 3.5", 4" |
| Edelweiss | 0.5", 1", 1.5", 2", 2.5", 3", 3.5", 4" |

For the guide, you can either crop `font-10-popular.jpg` into ten individual previews (cleaner, lets
each font be its own card and its own dropdown option) or show the single combined image with a
caption listing the names. Individual crops are the better experience.

---

## Group B: Monogram styles (the decorative 3-letter arrangements)

These are the ornate alphabets used for classic monograms (and some work for full names too).

| Style | Asset | What it is |
|---|---|---|
| **Master Circle** | `assets/font-master-circle.jpg` | The classic interlocking 3-letter monogram, set in a circular/oval shape. The "AAA, BBB, CCC..." grid. The default when someone says "monogram." |
| **Vine / Heirloom** | `assets/font-vine-heirloom.jpg` | A full ornate vine script alphabet with paired upper/lower forms. Elegant, works for monograms and names. |
| **Pillow** | `assets/font-pillow.jpg` | An ornate single-letter flourished script alphabet (A to Z). Works for monograms and names. |

A monogram "style" is conceptually different from a "font": the style is the *arrangement* of the
three letters (interlocking circle, stacked, etc.), while the font is the *typeface* used for a name
or word. The quote form reflects this with two separate fields (see below).

---

## Group C: Image-based / appliqué fonts

Five additional fonts that live in `assets/fonts-from-pdf.pdf`. Squarespace could not display the PDF
inline, and neither can the new site, so these need to be **exported as individual JPG crops** before
upload. Same task carries over.

| Font | Character |
|---|---|
| **Golden Valley** | Flowing connected script |
| **Fishtail** | Tall decorative serif caps (used in one of the homepage popular combos) |
| **Curlz** | Playful, curly, casual |
| **Classic** | Clean serif, full a–z plus numbers and symbols |
| **CA Liberty** | Tall condensed appliqué-style lettering |

Action item: open the PDF, crop each font's sample to its own JPG, name them to match
(`font-golden-valley.jpg`, etc.), and upload as the `previewImage` on each `font` document.

---

## How this feeds the quote form

The form has two related choices plus the universal fallback.

**Font** (the typeface for a name/word), dropdown options:
Meadow, Moonlight, Fuchsia, Hydrangea, Subscriber, Melissa, Swallow, Green Lemonade, Katherine,
Edelweiss, Golden Valley, Fishtail, Curlz, Classic, CA Liberty, **Recommend for me**.

**Monogram style** (the 3-letter arrangement), dropdown options:
Master Circle, Vine / Heirloom, Pillow, **Recommend for me**.

**"Recommend for me"** must be an option on both, and the copy should actively invite it ("not sure?
just say recommend for me, we love that"). It is the anxiety-reducer that makes the quote model work.

Reminder from the Squarespace build: in a hosted form builder you often cannot edit dropdown options
in code. That constraint is gone here. The dropdowns are generated from the `font` documents in
Sanity at build time, so adding a font is: add the document, the option appears. Model a boolean like
`isMonogramStyle` (or a `kind` field with values `lineFont` / `monogramStyle` / `appliqueFont`) so
the build can split them into the right dropdown and the right section of the guide page.

---

## Font & Lettering Guide page layout

Group the cards by the three groups above, each card showing the preview image, the font name, and
(for Group A) the available sizes. Add a short intro explaining that final sizing is confirmed in the
quote, and end with a CTA to the quote form. Because the cards come from Sanity, the guide and the
form stay in sync automatically.
