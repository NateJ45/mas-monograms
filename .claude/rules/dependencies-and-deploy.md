---
paths:
  - 'package.json'
  - 'package-lock.json'
  - 'astro.config.mjs'
  - 'wrangler.jsonc'
  - 'worker-configuration.d.ts'
---

# Matched dependency set, adapter pins, deploy command

Loads when you touch package.json, the lockfile, the Astro or wrangler config.
Never bump one of the matched-set packages in isolation.

## Gotchas (dependencies and deploy)

<!-- prettier-ignore-start -->
9. **The Astro / adapter / wrangler / Sanity versions are a MATCHED SET. Do not
   bump one in isolation.** PORTS.md cards 10, 13 and 14 hold the reasons; the
   short version:
   - `@astrojs/cloudflare` is pinned **exactly 14.2.4**, the last release whose
     wrangler peer range is compatible with the pin below (14.2.5 demands
     wrangler ^4.125.0, one minor from the 4.126 rejection).
   - `wrangler` is pinned **`~4.110.0`**, and here that pin is **load-bearing, not
     belt-and-braces**. Verified 2026-08-28: adapter 14.2.4 on THIS config does
     emit `"legacy_env": true` into the generated `dist/server/wrangler.json`, and
     wrangler 4.126+ rejects that field outright. (The starter checked the same
     thing and found no `legacy_env` on its config, so do not take its "currently
     belt-and-braces" note as applying here.)
   - `react`, `react-dom` and `react-is` are pinned **exact** at 19.2.7. A
     mismatch dies inside workerd behind a wall of Miniflare stack frames; the
     real message, `Incompatible React versions`, is buried **above** the
     `MiniflareCoreError`.
   - The Sanity set is pinned to a combination known to work **together**, and
     it moves as a SET. As of 2026-09-06 (phase 1 of the coordinated stack
     migration): `sanity` **6.9.1**, `@sanity/vision` 6.9.1, `@sanity/ui`
     **3.5.4**, `styled-components` 6.5.3, `@sanity/client` **7.26.2**,
     `@sanity/visual-editing` **5.7.3**, `@sanity/preview-url-secret` **4.1.5**,
     `sanity-plugin-media` 5.0.11, `sanity-plugin-asset-source-unsplash` 7.0.15,
     `@sanity/orderable-document-list` 2.0.9, plus `sanity-plugin-utils` 2.0.6
     and `@sanity/visual-editing` 5.7.3 held through **`overrides`** — a plain
     dependency pin does not stop npm nesting a newer `@sanity/visual-editing`
     under `@sanity/astro` and dragging a second `@sanity/ui` in with it.
     `@sanity/visual-editing` therefore appears BOTH as a dependency and in
     `overrides`, and the two must be edited in the same step or npm refuses the
     whole install with EOVERRIDE.
   - **The rule is not "hold `@sanity/ui` at 3.3.5".** It is "`@sanity/ui` must
     be whatever the installed `sanity` core declares": 6.4.0 declared `^3.3.0`,
     6.9.1 declares `^3.5.1`. The worked example that taught it: `@sanity/ui`
     3.5.3 against `sanity` 6.4.0 cleared styled-components error #18 and then
     failed differently, because 6.4.0 expected the 3.3.x theme shape. So
     "latest v3" is still not the rule; "what the core declares" is.
     `sanity` **6.9.2 is the next wall**: that PATCH release moves to
     `@sanity/ui` 4, which is phase 2 and a real migration.
   - **Invariant after any Sanity dependency work:** exactly ONE `@sanity/ui` on
     disk, and exactly ONE styled-components chunk in the build. Verify on DISK,
     not from install output. Never delete or regenerate the lockfile: move
     packages with targeted `npm install <pkg>@<version>` only.
     `@sanity/icons` is deliberately NOT deduped (core wants v5, `@sanity/ui` v3
     wants 3.8; icons are stateless, and deduping them broke the build elsewhere
     in the family on a missing v5 `CogIcon`). Nine `@sanity/icons` copies on disk
     is expected and fine.
   - **`session: false` in `astro.config.mjs` is load-bearing.** Left on, the
     Cloudflare adapter auto-declares a `SESSION` KV binding in the generated
     config, and a KV binding with no namespace id fails the deploy. This site has
     no login.
   - **`fixSanityDedupeAlias()` in the `vite.plugins` list of `astro.config.mjs` is
     load-bearing on Windows (2026-09-29, starter PORTS.md card 60).**
     `@sanity/astro`'s dev-only `sanity:module-dedupe` plugin aliases `sanity` to
     `require.resolve('sanity/package.json')` with the trailing `/package.json`
     stripped by a forward-slash regex, which a Windows backslash path defeats, so
     `sanity` resolved to its package.json FILE and `npm run dev` died with
     `Build failed with N errors: [MISSING_EXPORT] "X" is not exported by
     "node_modules/sanity/package.json"`. `astro build` never loads the plugin, so
     CI and deploys never saw it. `src/lib/sanity-dedupe-alias.ts` (PORTABLE,
     spec beside it) rewrites the bad alias; it is a no-op off Windows and in
     build. Do not remove it, and do not "fix" this with
     `SANITY_ASTRO_DISABLE_MODULE_DEDUPE=1`: the Studio then fails to hydrate
     (`react-compiler-runtime ... does not provide an export named 'c'`: the
     switch also drops the plugin's pre-bundling of packages the Studio needs).
   - **No `assets.not_found_handling` in `wrangler.jsonc`** (removed 2026-08-28).
     With `404-page` set, Cloudflare answers navigation requests that miss the
     asset store from the static 404 page **without invoking the Worker**, which
     silently 404s every SSR route for real browsers while curl (which sends no
     `Sec-Fetch-*` headers) sees them working.
   - **Astro 7 wanted vite 8.** The `overrides: { "vite": "^7" }` carried since the
     initial commit held vite at 7.3.6 and the build died with "Could not find the
     prerender entry point in the build output", which reads like an Astro bug and
     is really a pinned bundler. The override is gone.
10. **`grep "errors.md#"` over the built chunks is a FALSE-POSITIVE-PRONE check.**
    The family's one-styled-components invariant is usually written as
    `grep -l "errors.md#" dist/client/_astro/*.js` must list ONE file. It lists TWO
    here and always will: `polished` (a Sanity dependency) uses the same
    `errors.md#` filename in its own error URL. The precise check is the
    styled-components-specific path:
    `Select-String -Path "dist\client\_astro\*.js" -Pattern "styled-components/src/utils/errors\.md#" -List`
    which must return exactly one file. Verified 2026-08-28.
11. **`wrangler deploy` must name the generated config.** Use
    `wrangler deploy -c dist/server/wrangler.json`; a plain `wrangler deploy` reads
    the root `wrangler.jsonc`, which knows nothing about the SSR entrypoint, and
    every SSR route 404s. The `deploy` and `preview` scripts already do this.
    **Cloudflare Workers Builds runs its own deploy command from the dashboard**,
    so that setting has to be changed by hand — see `docs/PENDING.md`.
<!-- prettier-ignore-end -->
