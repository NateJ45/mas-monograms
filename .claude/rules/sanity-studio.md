---
paths:
  - 'src/sanity/**'
  - 'sanity.config.ts'
  - 'sanity.cli.ts'
  - 'src/lib/sanity.ts'
  - 'src/lib/sanity.types.ts'
  - 'src/lib/queries.ts'
  - 'src/lib/schemas.ts'
  - 'scripts/seed*.mjs'
  - 'scripts/lib/**'
  - 'scripts/import-content.mjs'
---

# Sanity schemas, Studio, queries, seed scripts

Loads when you touch schemas, the Studio, GROQ queries, typegen output or seed
and patch scripts.

## Query pattern

```ts
import { sanityClient } from '@/lib/sanity';
import type { SomePageType } from '@/sanity.types';

// In Astro page (build-time, token-authenticated)
const data = await sanityClient.fetch<SomePageType>(`*[_type == "homePage"][0]`);
```

## Project notes (Sanity and Studio)

- `npm run typegen` must be run after any schema changes to regenerate `sanity.types.ts`.
  It runs from the **repo root** now (`sanity schema extract --force && sanity typegen
generate`), not from a `studio/` workspace.
- **There is no separate studio dev server or deploy.** `npm run dev` serves the site at
  localhost:4321 and the Studio at **localhost:4321/studio**; deploying the site deploys the
  Studio. For CLI work (`sanity dataset`, `sanity cors`, typegen) run `npx sanity ...` from
  the repo root; `sanity.cli.ts` configures it. Do **not** run `npx sanity deploy`.
  The Studio theme is **Heirloom Coast** (`buildLegacyTheme` in the repo-root
  `sanity.config.ts` — Linen/Ink/Indigo/Claret, matches the site; kept deliberately across
  the Sanity 6 upgrade, see the file header). The "Start Here" handbook
  (StudioGuide/BusinessOverview/BrandKit/StudioPlaybook, now in `src/sanity/components/`)
  is what Mary Ann sees first — keep it current with the live site.
- A note on `npx sanity build`: it writes to `./dist` by default, which would clobber the
  Astro build. The Studio is built by `astro build`, so there is no `studio:build` script.
  A standalone bundle needs an explicit dir: `npx sanity build .studio-dist`.
- Content was bulk-seeded via `node scripts/seed-content.mjs` (re-runnable, deterministic ids)
- The "Start Here" studio guides (studioGuide/studioNotes/studioPlaybook singletons) are seeded via
  `node scripts/seed-studio-guides.mjs` (idempotent createOrReplace). Do NOT run `scripts/seed-core.mjs`
  — it is the leftover interior-design "Studio Starter" seed and would inject junk `service`/`journalEntry`
  docs.
- Any new seed or patch script should import `scripts/lib/sanity-lib.mjs` rather
  than build its own client: it brings a **dry-run-by-default** gate (`--apply`
  to actually write), Portable Text builders, and an idempotent asset uploader.

## Gotchas (Sanity)

<!-- prettier-ignore-start -->
1. **The committed `src/lib/sanity.types.ts` goes stale silently.** `npm run
build` does not chain typegen, so the file is committed by hand after every
   schema change — and on 2026-08-27 it was already two `studioGuide` fields
   behind, on a green build. presacademy shipped types describing a schema that
   no longer existed the same way. CI now regenerates and fails on any diff. Two
   consecutive local typegen runs are byte-identical, so a diff always means a
   stale commit, never generator noise. Fix: `npm run typegen`, commit.
7. **A quoted token in `.env` yields a 401 that reads like a permissions
   problem.** `scripts/lib/loadEnv.mjs` takes quoted values literally, quotes
   included. Write tokens bare. And Sanity refuses to delete a document that other
   documents still reference, so cleanup scripts must unlink before deleting.
8. **Studio files never port blindly between these repos.** This project is now on
   Sanity **6.4**, the same major as WCP, presacademy and the starter, but the
   rule stands: a file copied across a major boundary compiles and then dies at
   browser runtime — which is also where schema errors surface, since they pass
   the build. Port the pattern, write the file against the target repo's actual
   major, and open the Studio in a real browser to verify.
<!-- prettier-ignore-end -->
