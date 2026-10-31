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
   - `react`, `react-dom` and `react-is` are pinned **exact** at 19.3.1 (since 2026-10-18, PORTS.md card 112). A
     mismatch dies inside workerd behind a wall of Miniflare stack frames; the
     real message, `Incompatible React versions`, is buried **above** the
     `MiniflareCoreError`.
   - The Sanity set is pinned to a combination known to work **together**, and
     since 2026-10-17 that is the family's phase-2 set (starter PORTS.md card
     103): `sanity` **6.19.0**, `@sanity/vision` 6.19.0, `@sanity/ui` **4.4.9**,
     `@sanity/icons` **5.2.3**, `styled-components` 6.6.0, `@sanity/client` 8.9.0,
     `@sanity/preview-url-secret` 4.1.5, `@sanity/astro` 3.5.1,
     `sanity-plugin-media` 6.3.5, `sanity-plugin-asset-source-unsplash` 7.0.29,
     `@sanity/orderable-document-list` 2.0.28, plus `sanity-plugin-utils` 2.0.22
     and `@sanity/visual-editing` 6.1.3 held through **`overrides`**.
     `@sanity/visual-editing` appears BOTH as a dependency and in `overrides`, and
     the two must be edited in the same step or npm refuses the whole install
     with EOVERRIDE. Studio code is written against `@sanity/ui` 4: `gap` not
     `space`, `gridTemplateColumns` not `columns`, no `Badge mode`, `Menu*` from
     `@sanity/ui/menu`, `useToast` from `@sanity/ui/toast`, and every icon from its
     own subpath (`import { BellIcon } from '@sanity/icons/Bell'`; the root
     exports none, and `astro check` does NOT catch a root icon import, only
     `astro build` does). That includes `sanity.config.ts` at the repo root, which
     is outside `src/`. A Studio file from a repo still on the phase-1 set
     (`sanity` 6.9.1, `@sanity/ui` 3.5.4) does not port without that migration.
   - **Invariant after any Sanity dependency work:** exactly ONE `@sanity/ui`
     and ONE `@sanity/icons` on disk (`find node_modules -path
     "*@sanity/ui/package.json"`, same for icons), and exactly ONE
     styled-components chunk in the build (`grep -l "errors.md#"
     dist/client/_astro/*.js`; a second hit that is the `polished` library's
     own errors.md link, bundled by `sanity`, is not a second styled-components).
     Verify on DISK, not from install output. Never delete or regenerate the
     lockfile. `react/compiler-runtime` stays in `optimizeDeps.include` in
     `astro.config.mjs`: `@sanity/ui` is excluded from pre-bundling, and without
     the include the dev Studio does not hydrate (`does not provide an export
     named 'c'`); the build cannot show it.
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

- **Transitive security pins (PORTS.md card 214, 2026-10-31).** The `overrides` block in `package.json` also pins patched copies of packages that a parent fixes at an exact old version (scoped to that parent, same major where possible). Dependabot cannot do this itself. After touching it, `npm ls --all` must exit 0 (plain `npm ls` only checks the top level), and an entry goes once its parent ships the patched pin. Alerts left open on purpose: `extract-zip` and `deepmerge` (no patched release), `zod` 3 and `minimatch` (their parents need a release); reasons are in the card.
