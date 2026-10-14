// Tests for write-gate.mjs, the dry-run gate and production second factor on the
// scripts that build their own Sanity client (starter PORTS.md card 86).
//
// The guard is NEVER tested against production. Every child process gets a fake
// project, a fake token and SANITY_API_HOST=https://example.invalid (a reserved
// name that cannot resolve), all in process.env, which wins over any real .env.
// So even a run that got past the guard could not reach Sanity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { productionWriteRefusal, writeGate, normaliseDataset } from './write-gate.mjs';

const SCRIPTS = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Every script that writes with its own client. A new one belongs here.
const GATED = [
  'apply-asset-patches.mjs',
  'cleanup-testimonials-stats.mjs',
  'fix-orphan-data.mjs',
  'import-content.mjs',
  'import-squarespace-images.mjs',
  'patch-combos.mjs',
  'patch-footer-credit.mjs',
  'seed-core.mjs',
  'seed-gallery-filter-groups.mjs',
  'seed-legal.mjs',
  'upload-headshot.mjs',
];

function fakeEnv(extra = {}) {
  const env = {
    PATH: process.env.PATH,
    SYSTEMROOT: process.env.SYSTEMROOT,
    PUBLIC_SANITY_PROJECT_ID: 'fake0000',
    PUBLIC_SANITY_DATASET: 'production',
    SANITY_API_WRITE_TOKEN: 'fake-token',
    SANITY_API_HOST: 'https://example.invalid',
    ...extra,
  };
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  return env;
}

function run(script, args, extra) {
  return spawnSync(process.execPath, [resolve(SCRIPTS, script), ...args], {
    env: fakeEnv(extra),
    encoding: 'utf8',
    timeout: 60_000,
  });
}

test('a dry run never needs the second factor', () => {
  assert.equal(
    productionWriteRefusal({ apply: false, dataset: 'production', processEnv: {} }),
    null,
  );
});

test('--apply on production without NCS_PRODUCTION_WRITE is refused', () => {
  const r = productionWriteRefusal({ apply: true, dataset: 'production', processEnv: {} });
  assert.match(r, /NCS_PRODUCTION_WRITE=yes/);
});

test('only the exact value "yes" opens it', () => {
  for (const v of ['YES', 'true', '1', ' yes', '']) {
    assert.notEqual(
      productionWriteRefusal({
        apply: true,
        dataset: 'production',
        processEnv: { NCS_PRODUCTION_WRITE: v },
      }),
      null,
      `value ${JSON.stringify(v)} must not open the guard`,
    );
  }
  assert.equal(
    productionWriteRefusal({
      apply: true,
      dataset: 'production',
      processEnv: { NCS_PRODUCTION_WRITE: 'yes' },
    }),
    null,
  );
});

test('a missing or oddly cased dataset counts as production', () => {
  assert.equal(normaliseDataset(undefined), 'production');
  assert.equal(normaliseDataset(' Production '), 'production');
  assert.notEqual(
    productionWriteRefusal({ apply: true, dataset: undefined, processEnv: {} }),
    null,
  );
  assert.equal(productionWriteRefusal({ apply: true, dataset: 'scratch', processEnv: {} }), null);
});

test('writeGate exits 2 on a refused write and returns false on a dry run', () => {
  const quiet = { log() {}, error() {} };
  let code = null;
  const refused = writeGate({
    dataset: 'production',
    argv: ['node', 'x.mjs', '--apply'],
    processEnv: {},
    log: quiet,
    exit: (c) => {
      code = c;
    },
  });
  assert.equal(code, 2);
  assert.equal(refused, false);

  code = null;
  const dry = writeGate({
    dataset: 'production',
    argv: ['node', 'x.mjs'],
    processEnv: {},
    log: quiet,
    exit: (c) => {
      code = c;
    },
  });
  assert.equal(dry, false);
  assert.equal(code, null);

  const ok = writeGate({
    dataset: 'production',
    argv: ['node', 'x.mjs', '--apply'],
    processEnv: { NCS_PRODUCTION_WRITE: 'yes' },
    log: quiet,
    exit: () => assert.fail('must not exit'),
  });
  assert.equal(ok, true);
});

for (const script of GATED) {
  test(`${script} --apply without the second factor exits 2 before any request`, () => {
    const r = run(script, ['--apply']);
    assert.equal(r.status, 2, `${script}: stdout ${r.stdout}\nstderr ${r.stderr}`);
    assert.match(r.stderr, /Refusing to write/);
  });
}

test('a bare run is a dry run and writes nothing', () => {
  const r = run('patch-footer-credit.mjs', []);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /DRY RUN/);
  assert.match(r.stdout, /Would set on siteSettings/);
});

test('with the second factor the write is attempted, against the dummy host only', () => {
  const r = run('patch-footer-credit.mjs', ['--apply'], { NCS_PRODUCTION_WRITE: 'yes' });
  assert.notEqual(r.status, 2, 'the guard must let it through');
  assert.notEqual(r.status, 0, 'example.invalid cannot resolve, so the write must fail');
  assert.doesNotMatch(r.stderr, /Refusing to write/);
  assert.match(r.stderr, /example\.invalid/);
  assert.match(r.stdout, /WRITE: --apply/);
});

test('NCS_PRODUCTION_WRITE in a script-copied .env cannot open the guard', async () => {
  // The guard captures process.env at import; a later copy into process.env is ignored.
  delete process.env.NCS_PRODUCTION_WRITE;
  const mod = await import(`./write-gate.mjs?late=${Date.now()}`);
  process.env.NCS_PRODUCTION_WRITE = 'yes';
  try {
    let code = null;
    mod.writeGate({
      dataset: 'production',
      argv: ['node', 'x.mjs', '--apply'],
      log: { log() {}, error() {} },
      exit: (c) => {
        code = c;
      },
    });
    assert.equal(code, 2);
  } finally {
    delete process.env.NCS_PRODUCTION_WRITE;
  }
});
