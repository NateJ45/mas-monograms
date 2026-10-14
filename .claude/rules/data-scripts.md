---
paths:
  - 'scripts/**'
---

# The gate on every write

Loads when you write or edit scripts that change data. Added 2026-10-13 from the starter's
`.claude/rules/data-scripts.md` (PORTS.md card 86); the bullets below keep its wording.

## Every write: dry by default, and a second factor on production

- **A script that writes is dry by default.** Build it on `scripts/lib/sanity-lib.mjs` (`apply()` and `done()`), which prints the plan and writes nothing unless the run carries `--apply`. A script that cannot use it gives itself the same gate. Here that is `scripts/lib/write-gate.mjs` (`writeGate({ dataset })`, called before any request), used by the older scripts that build their own client: `apply-asset-patches`, `cleanup-testimonials-stats`, `fix-orphan-data`, `import-content`, `import-squarespace-images`, `patch-combos`, `patch-footer-credit`, `seed-core`, `seed-gallery-filter-groups`, `seed-legal`, `upload-headshot`.
- **On the `production` dataset `--apply` is not enough.** `sanity-lib` exits at import, before any request, unless the same command also sets `NCS_PRODUCTION_WRITE=yes` in the process environment: `NCS_PRODUCTION_WRITE=yes node scripts/x.mjs --apply` (PowerShell: `$env:NCS_PRODUCTION_WRITE='yes'; node scripts/x.mjs --apply; Remove-Item Env:NCS_PRODUCTION_WRITE`). It is read from `process.env` directly, never from `.env`, so it cannot be set once and forgotten. Only Nathan sets it, in person; a delegated agent never does, and never passes a production URL or dataset to a write script. Every site in the family writes to `production` (none has a scratch dataset), so in practice every write needs it. `write-gate.mjs` does the same, and captures the variable when it is imported, so a script that copies `.env` into `process.env` cannot open it.
- **Test a guard against a dummy host, never against what it guards.** Point the client at `SANITY_API_HOST=https://example.invalid` with a fake project and token (as `scripts/lib/sanity-lib.test.mjs` and `scripts/lib/write-gate.test.mjs` do), or unit-test the pure check. Running the real write command to "see if the guard stops it" is how a guard gets tested on production. A new script with its own client goes in the `GATED` list in `write-gate.test.mjs`.
- **Never put text containing backticks or `$(...)` inside a shell string** (`node -e "..."`, `echo "..."`, a heredoc with an unquoted delimiter). The shell runs what is inside as a command substitution: on 2026-10-04 a markdown plan written through `node -e` quoted a content-load command in backticks, and bash ran it against production. Write such text with the file-writing tool (Write/Edit), then run a script file. Git Bash heredocs also drop backslashes, which is a second reason to write scripts to a file first.
- **Array objects need `_type` and `_key`** in anything a script writes (see `.claude/rules/sanity-studio.md`), and `npm run audit:data` checks the result (PORTS.md card 95).
- **Procedure for any live write:** back up (`npx sanity dataset export production <file> --raw`, outside the repo or in the gitignored `tmp/backups/`), dry run, apply, then verify read-only (`npm run audit:data` must say "Data matches the schema.").
