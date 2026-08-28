// Foundation, edit with care
// =============================================================================
// Sanity CLI config - used by `sanity typegen`, `sanity dataset`, `sanity cors`
// =============================================================================
// Moved here from studio/sanity.cli.ts on 2026-08-28, when the nested studio/
// package was folded into this one (PORTS.md card 10).
//
// There is ONE canonical Studio: the one embedded at /studio on the built site.
// It rebuilds on every deploy, so its schema is always current and cannot drift.
//
// DO NOT run `npx sanity deploy`. That publishes a SEPARATE standalone Studio to
// mas-monograms.sanity.studio, which only updates when someone re-runs the deploy
// by hand: it silently falls behind the embedded Studio while pointing at the same
// production data. The old `studioHost: 'mas-monograms'` + `deployment` block that
// lived here is deliberately GONE so a stray `sanity deploy` cannot recreate the
// split. Mary Ann's bookmark moves to <site>/studio (see docs/PENDING.md).
//
// Also note `sanity build` writes to ./dist by default, which would clobber the
// Astro build output. There is no `studio:build` script for that reason: the
// Studio is built by `astro build` as part of the site. If you ever need a
// standalone Studio bundle, pass an explicit output dir:
//   npx sanity build .studio-dist

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId:
      process.env.SANITY_STUDIO_PROJECT_ID ||
      process.env.PUBLIC_SANITY_PROJECT_ID ||
      'placeholder-project-id',
    dataset:
      process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production',
  },
  // The embedded Studio is served at /studio (set by @sanity/astro's
  // studioBasePath in astro.config.mjs). Mirror it here so standalone CLI
  // tooling agrees the Studio lives at the sub-path.
  project: { basePath: '/studio' },
  // Typegen: `sanity schema extract --force` writes ./schema.json, then
  // `sanity typegen generate` reads it and writes src/lib/sanity.types.ts.
  // Both are wrapped by `npm run typegen`.
  //
  // NOTE on `path`: it is the SOURCE GLOB typegen scans for GROQ queries, not
  // the schema file. It names './schema.json' here to match the starter's copy
  // byte for byte, which means GROQ RESULT types are deliberately not generated:
  // this codebase types its query results by hand in src/lib/queries.ts and only
  // consumes the schema types. Point it at './src/**/*.{ts,astro}' on the day
  // someone wants generated result types. (This closes the "half-right typegen
  // config" item opened in docs/PENDING.md on 2026-08-27 - same behavior, now
  // deliberate, matching the library of record, and written down.)
  typegen: {
    path: './schema.json',
    generates: './src/lib/sanity.types.ts',
  },
});
