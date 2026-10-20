# The Studio plan: who edits, what they do, and where

Written 2026-10-19 (studio-complete, Phase A). This is the map from the owner's real jobs to the Studio surface that
serves each one. When a job changes, change this file, then the surface. Plain words, no business details.

## Who edits

| Who                    | Role in the Studio             | Skill                                                            | Device                                                                    | Notes                                                                                  |
| ---------------------- | ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Mary Ann (the owner)   | Staff view (`kitConfig.staff`) | Not technical; confident with email, Facebook and a phone camera | Phone at the worktable for photos and notices; a computer for longer jobs | Works alone. Wants to know a change is safe before she makes it.                       |
| Nathan (the developer) | Administrator                  | Technical                                                        | Desk                                                                      | Shop categories, legal pages, Stripe links, anything marked "Check with Nathan first". |

There is one editor, so there is no approval step and no roles beyond staff and administrator.

## Weekly jobs (the "My weekly 15 minutes" card on Home)

| Job                                         | How often                      | Where she does it                                                                          | Phone?                             | Ticks itself?                        |
| ------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------ |
| Add a photo of something she made           | Weekly, often more             | Quick update, `Post a photo` (phone); Home, `Add a photo of my work` (desk)                | Yes                                | Yes, a new published photo this week |
| Answer the quote requests (order enquiries) | As they arrive; checked weekly | Her email, then `Messages` to mark each one Replied (Quick update has a link tile)         | Reading yes, replying in her email | By hand (card 138 idea below)        |
| Mark clearance items sold                   | When one sells                 | Quick update, `Mark a clearance item sold` (phone); or Home, then the item's `Sold` switch | Yes                                | Yes, no sold-out item still for sale |
| Share one photo on Facebook or Instagram    | Weekly                         | Outside the Studio                                                                         | Yes                                | By hand                              |
| Clear the Checkup                           | Weekly                         | `Checkup`                                                                                  | Desk is easier                     | Yes                                  |

## Monthly jobs

- Look over the clearance rack: add new items (`Clearance and prices`), mark sold ones.
- Check the price tags on the Pricing page (`Change a price` on Home).
- Read the questions and answers; add one for anything asked twice (Quick update, `Add a question and answer`).
- Look at the visitor numbers on Home.
- Get found: a Google Business post, a review request (the Get found guides).

## Seasonal jobs (promotions)

| Job                                                                             | When                                                                    | Where                                                                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Holiday order deadline ("Order by December 1 to have it in time for Christmas") | 4 to 6 weeks before Christmas, Mother's Day, graduation, wedding season | Quick update, `Order deadline` (new 2026-10-19)                                       |
| A gift guide or season page                                                     | Same seasons                                                            | `Gift guides and seasons`; tag photos and they join the page                          |
| A notice across the top (new stock, a sale)                                     | Any time                                                                | Quick update, `Put up a notice`; or `Notices across the top` with a ready-made notice |
| Away notice                                                                     | Before a vacation or a very busy week                                   | Quick update, `I am away for a while`                                                 |
| New products and styles: a new embroidery font or thread color                  | When she buys one                                                       | `Fonts, threads and categories`                                                       |
| A new shop category (a new kind of item)                                        | Rarely                                                                  | Nathan (it is a page on the site)                                                     |

## Once in a while

Business details (phone, email, hours), page words (Edit on the page), the Monogram preview words, QR codes and the
brand kit for print. Each has a guide in the Site Guide and a link on Home's "Your pages".

## The surfaces

- **Home**: big buttons (photo, clearance, price, quote requests, phone number), "My weekly 15 minutes", whether the
  last change is live, visitor numbers, "Your pages", "Watch how it is done" (empty until Phase B records videos).
- **Quick update** (her phone): `Post a photo` (a Style Gallery photo, saved for her to check and Publish),
  `Put up a notice`, `Order deadline`, `I am away for a while`, `Add a question and answer`. Notices, deadlines and
  questions publish straight away; the photo waits for Publish so she sees it on a bigger screen first.
- **Edit my content** (the desk): her lists in the order she meets them, drag to reorder, Move to Trash.
- **Edit on the page**: click the words on the real page.
- **Messages**: every quote request, with New, Needs a person, Replied and Spam.
- **Site Guide**: a guide for every job above (see the table below), "How to" chips beside the boxes she gets wrong
  (`GUIDE_FOR_FIELD` in `src/sanity/guides/index.ts`), and "Help for this page" beside each kind of document.
- **Checkup**, **QR codes**, **My brand kit**, **Trash**.

## Guides per job, and what each needs

`shot` means a capture in `src/sanity/guides/shots.ts`; `video` means a clip from the Phase B pipeline
(scripts in `docs/agent/studio-videos.md`).

| Job                       | Guide                        | Picture                                    | Video |
| ------------------------- | ---------------------------- | ------------------------------------------ | ----- |
| The week                  | `my-week`                    | `home-weekly`                              |       |
| Quick update on the phone | `quick-update`               | `quick-update-tiles`                       | yes   |
| Photo from the phone      | `photo-from-phone`           | `post-photo-form`                          |       |
| Photo at a computer       | `add-a-photo`                | `photo-new-form`                           | yes   |
| Quote requests            | `quote-requests`             | `messages-list` (Phase B, sample messages) | yes   |
| Order deadline            | `order-deadline`             | `deadline-form`                            | yes   |
| Away notice               | `away-notice`                | `away-form`                                |       |
| The year                  | `my-year`                    |                                            |       |
| Mark sold                 | `clearance-sold`             | `clearance-sold-switch`                    | yes   |
| Add a clearance item      | `clearance-add`              | `clearance-new-form`                       |       |
| Change a price            | `change-a-price`             | `price-tag-form`                           | yes   |
| Notice (full editor)      | `notice`                     | `notice-templates`                         |       |
| Publish and the wait      | `start-here`                 | `publish-button`                           | yes   |
| Questions                 | `questions`                  | `question-form`                            |       |
| Fonts and threads         | `add-a-font`, `add-a-thread` |                                            |       |
| Everything else           | the existing 40-odd guides   |                                            |       |

Tours, the welcome and What's new are data in `src/sanity/studio-tours.ts`, passed to the kit as `tours`, `welcome` and `whatsNew`.

## Card 137: what arrived, what is left

Built in Phase B (2026-10-19), all in `kit.config.ts` as data:

1. **Patch an existing document from Quick update.** `Mark a clearance item sold` (pick an item still for sale, tick
   Sold, optionally set how many are left), `Change a price` (pick a price tag, type the new price) and `Change a
clearance price` (sale and original price). All are `edit` jobs with a `pick`, so they write the published
   document straight away, as notices do.
2. **A link tile on Quick update.** `See my quote requests` opens Messages.
3. **Tours, the welcome and What's new**, in `src/sanity/studio-tours.ts` (see "Tour anchors" below).

Still open:

- **A `select` field for "Add a question and answer"** (the page it goes on) is possible now; left because the form
  is short on purpose and the topic can be set in the full editor.
- **A `check: 'messages'` weekly job** that ticks itself when no quote request is still New (starter PENDING 32, card
  138). Today it is a hand tick.
- **`post.build` gets the client**, so a new gallery photo can take its place at the end of the drag order. Today a
  photo with no rank sorts last, which is the same place.
- **Post a photo's words.** `postPhoto.tileLead` and `draftNote` now reword two lines; the title label and the
  description example are still the kit's.

## Tour anchors

Checked 2026-10-19 in the local harness (phone and desk widths): the Home hooks, `navbar-status`, `quick-list` and every `quick:<id>` resolve, and the photo form carries Sanity's `field-image`, `field-relatedCategory` and `action-publish` test ids, so those three anchors and the `new-photo` template goTo hold. Not checked signed in: the tour on a real account, and the Messages stop (it needs real messages). A stop whose anchor is missing centres itself, so nothing breaks.

## Bigger ideas (not built)

- A "new this week" strip on Home showing the photos she added, as a small reward.
- A seasonal reminder on Home ("Christmas deadline in 3 weeks: put up an order deadline?") driven by a date list in
  kit.config.ts.
- Quick update "Add a clearance item" with a photo, price and Stripe link, once the kit has an image field kind.
