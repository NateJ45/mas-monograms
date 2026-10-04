---
paths:
  - '.github/workflows/**'
  - 'scripts/**'
  - 'tests/**'
  - 'playwright.config.ts'
  - 'lighthouserc.json'
  - 'src/lib/*.test.ts'
---

# CI workflows, build scripts, tests

Loads when you touch workflows, scripts or tests.

## Scripts and workflows

- New scripts (2026-08-27, from the starter): `npm run parity` (render-parity
  harness), `npm run sync-check` (library-drift check), `npm run free-dist`
  (also wired as the `prebuild` hook). `scripts/with-workerd.mjs` became the
  `build` wrapper on 2026-08-28 with the Astro 7 upgrade — see gotcha 3.
- Workflows: `ci.yml` (family test standard since 2026-09-05: a `build` job with
  install + typegen + stale-types guard + `astro check` + lint + prettier check
  - unit tests + build + link check, and a parallel `test` job running the
    Playwright smoke/axe/reflow/reduced-motion suites on chromium and a WebKit iPhone),
    `lighthouse.yml` (workflow name stays `Lighthouse CI`, dependabot-auto-merge listens for it; accessibility hard-gated at 1.0, LCP/CLS errors; PRs run a 6-URL sample and only when score-moving paths change, push/weekly/manual run all 12),
    `sanity-backup.yml` (nightly), `uptime.yml` (hourly). The last two are gated
    on a secret/variable that is not set yet — see `docs/PENDING.md`.
    `npm run check` is now `astro check && npm run lint` (the family shape);
    `npm run check:full` is the old typegen + build + unit-test sweep.

- Parity and Tailwind: `src/styles/globals.css` carries `@source not` for
  `scripts/.parity`, `docs`, `.claude`, `CLAUDE.md` and `README.md` so committed
  baselines and Markdown cannot keep dead utility rules alive. Do not name utility
  classes in new committed HTML fixtures without excluding them too. See the
  "Render parity" section of `docs/TESTING.md`.

## Gotchas (build, CI, parity)

<!-- prettier-ignore-start -->
2. **`EPERM, Permission denied: ...\dist\client` is not a permissions problem.**
   It means a `wrangler dev` / `astro preview` is still holding `dist`, and Astro
   empties `dist` at the start of every build. The `prebuild` hook
   (`scripts/free-dist.mjs`) now clears it automatically on Windows, killing only
   node/workerd processes whose command line mentions **both** this project's
   directory **and** a dev server. Doing it by hand: killing `workerd.exe` alone
   is not enough (the parent wrangler/node process keeps the handle and can
   respawn it), and never blanket-kill `node.exe` — the editor/agent session is
   itself node.
3. **`scripts/with-workerd.mjs` is now WIRED** (`"build": "node
scripts/with-workerd.mjs astro build"`, 2026-08-28). It works around a Windows
   workerd crash that happens on Astro 7 / `@astrojs/cloudflare` 14, where
   prerendering routes through `@cloudflare/vite-plugin`: the plugin's pinned
   workerd dies instantly with `std::terminate` behind a
   `MiniflareCoreError [ERR_RUNTIME_FAILURE]`, and the newer workerd bundled
   inside wrangler runs the identical config fine. It is a no-op off Windows, so
   Linux CI is untouched. This note said "must stay unwired" until the upgrade
   landed; the upgrade is the day it was meant to be wired.
5. **Parity baselines come from a plain `npm run build`, nothing else.** A build
   run under a test runner or with different env (fake tracker ids, empty Sanity
   credentials) produces a diff that is not a regression. Re-capture only when a
   markup change is intended, and say so in the commit message.
6. **`sanity-backup.yml` is DISABLED in GitHub** (Nathan, 2026-10-03: no backups for
   MAS), and **`uptime.yml` is silently inert** until the `SITE_URL` repo
   **variable** (not a secret) exists. They warn-and-skip by design so they can be
   committed before launch — which also means "the workflow is green" does not mean
   "the check ran". Check `gh workflow list --all` and `gh variable list` before
   believing in either. To re-enable the backup see `docs/PENDING.md`.
<!-- prettier-ignore-end -->

- `.claude/settings.json` (deny rules for `git reset --hard` and force pushes) is PORTABLE
  from the starter (card 71). Change it there and pull forward; `sync-check` reports drift.
  `.claude/settings.local.json` stays per-machine and uncommitted.
