// scripts/lib/write-gate.mjs
//
// The dry-run gate and the production second factor for the older scripts that
// build their own Sanity client instead of importing sanity-lib.mjs (starter
// PORTS.md card 86). New scripts should use sanity-lib.mjs, which carries the
// same guard; this file exists so the one-off patch and seed scripts written
// before it cannot write on a bare run either.
//
// The rule, same as sanity-lib:
//   node scripts/x.mjs                                    dry run, prints the plan
//   NCS_PRODUCTION_WRITE=yes node scripts/x.mjs --apply   writes to production
//   (PowerShell: $env:NCS_PRODUCTION_WRITE='yes'; node scripts/x.mjs --apply;
//    Remove-Item Env:NCS_PRODUCTION_WRITE)
//
// NCS_PRODUCTION_WRITE is read from the REAL process environment, captured the
// moment this module is imported. Imports run before the importing script's own
// body, so a script that copies .env into process.env (a few of the old ones did)
// cannot open the guard by having the variable in .env. Only Nathan sets it, in
// person; a delegated agent never does. Test the guard against
// SANITY_API_HOST=https://example.invalid (write-gate.test.mjs), never production.

const STARTUP_PRODUCTION_WRITE = process.env.NCS_PRODUCTION_WRITE;

/** The dataset a script will write to; a missing value counts as production. */
export function normaliseDataset(dataset) {
  const ds = String(dataset ?? '').trim();
  return ds.toLowerCase() || 'production';
}

/**
 * Pure: why this run may not write, or null when it may. A dry run always may
 * (it writes nothing); --apply on the production dataset needs exactly
 * NCS_PRODUCTION_WRITE=yes in `processEnv`.
 */
export function productionWriteRefusal({ apply, dataset, processEnv }) {
  if (!apply || normaliseDataset(dataset) !== 'production') return null;
  if (processEnv?.NCS_PRODUCTION_WRITE === 'yes') return null;
  return [
    'Refusing to write: --apply targets the production dataset, and --apply alone is not enough.',
    'Set NCS_PRODUCTION_WRITE=yes in the same command, and only with Nathan present',
    '(bash: NCS_PRODUCTION_WRITE=yes node <script> --apply). A delegated agent never sets it.',
    'Run without --apply to see the plan. PORTS.md card 86.',
  ].join('\n');
}

/**
 * Call once, before any request. Returns true when the run may write, false for
 * a dry run, and exits with code 2 when --apply on production lacks the second
 * factor. `argv`, `processEnv`, `log` and `exit` are injectable for the tests.
 */
export function writeGate({
  dataset,
  argv = process.argv,
  processEnv = { NCS_PRODUCTION_WRITE: STARTUP_PRODUCTION_WRITE },
  log = console,
  exit = (code) => process.exit(code),
} = {}) {
  const apply = argv.includes('--apply');
  const refusal = productionWriteRefusal({ apply, dataset, processEnv });
  if (refusal) {
    log.error(refusal);
    exit(2);
    return false;
  }
  const ds = normaliseDataset(dataset);
  log.log(
    apply
      ? `WRITE: --apply on dataset "${ds}".`
      : `DRY RUN on dataset "${ds}": nothing will be written. Re-run with --apply to write.`,
  );
  return apply;
}

/** Client option that points at SANITY_API_HOST when set (the tests aim it at example.invalid). */
export function apiHostOption(env = process.env) {
  return env.SANITY_API_HOST ? { apiHost: env.SANITY_API_HOST } : {};
}
