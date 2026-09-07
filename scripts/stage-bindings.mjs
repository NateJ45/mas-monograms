#!/usr/bin/env node
// =============================================================================
// stage-bindings.mjs — point the staging Worker at STAGING data
// =============================================================================
// deploy-staging.yml said it would "override only the Worker name so production
// is never touched". The first half is true and the second does not follow:
// `--name` redirects the DEPLOYMENT, not the BINDINGS. The emitted
// dist/server/wrangler.json still carries production's R2 bucket, so the
// staging Worker wrote quote submissions into `mas-monograms-quotes` — Mary
// Ann's live enquiries — alongside the real ones.
//
// Isolated at the code layer, shared at the data layer, which is the worst
// version because separate Worker, separate URL and separate workflow all say
// otherwise. Ported here 2026-09-07 from WCP, where the same pattern had the
// "staging" site bound to the live family directory and the real bucket of
// children's photographs. See _vault/gotchas/staging-worker-inherits-production-bindings.
//
// Nothing was actually corrupted here — no one had been submitting test quotes
// on staging — but the quote form is the ONE write path this site has, so it is
// also the one thing anyone would want to exercise on a preview.
//
// wrangler has no flag to override a bucket name, so the emitted config is
// rewritten in place between build and deploy.
//
// NOT rebound: KV SESSION. The session fingerprint derives from the shared
// secret, so staging and production sessions are interchangeable whatever store
// they sit in — splitting it would buy nothing.
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs';

const CONFIG = 'dist/server/wrangler.json';
const QUOTES_STAGING_BUCKET = 'mas-monograms-quotes-staging';

const config = JSON.parse(readFileSync(CONFIG, 'utf8'));

const r2 = (config.r2_buckets ?? []).find((b) => b.binding === 'QUOTE_BACKUP');
if (!r2) {
  console.error('stage-bindings: no QUOTE_BACKUP r2_bucket in the emitted config.');
  process.exit(1);
}

// Refuse to no-op silently. If this already points at staging, something else
// changed and the assumption behind this script no longer holds — and a quiet
// pass here would recreate exactly the failure it exists to prevent.
if (r2.bucket_name === QUOTES_STAGING_BUCKET) {
  console.error('stage-bindings: config already points at staging — check why before deploying.');
  process.exit(1);
}

const was = r2.bucket_name;
r2.bucket_name = QUOTES_STAGING_BUCKET;

writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`stage-bindings: QUOTE_BACKUP ${was} -> ${r2.bucket_name}`);
