#!/usr/bin/env node
// =============================================================================
// check-preview-bypass - the local `?dev-draft=1` switch must not ship
// (2026-10-05, Phase C of the Studio upgrade)
// =============================================================================
// src/pages/preview/[...slug].astro has a LOCAL DEVELOPMENT ONLY switch:
// `?dev-draft=1` turns draft mode on without the Studio's cookie, so the real
// pages can be rendered with drafts and stega against `astro dev` (and
// screenshotted) without a Sanity login. It sits inside `if
// (import.meta.env.DEV)`, which a production build replaces with `false` and
// then drops.
//
// This script proves the drop happened: it reads the built server bundle and
// fails if the switch's query name is anywhere in it. It also checks that the
// preview route IS in the bundle (by a string only that route carries), so an
// empty or wrong directory cannot pass by accident.
//
//   npm run build && node scripts/check-preview-bypass.mjs [dist/server]
//
// Wired into the CI build job after the build.
// =============================================================================
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? 'dist/server');
if (!existsSync(dir)) {
  console.error(`check-preview-bypass: ${dir} does not exist. Build first.`);
  process.exit(1);
}

const BYPASS = 'dev-draft';
const ROUTE_MARKER = 'is not a previewable page';

let routeFound = false;
const leaks = [];
const walk = (d) => {
  for (const name of readdirSync(d)) {
    const path = join(d, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(m?js|cjs)$/.test(name)) {
      const text = readFileSync(path, 'utf8');
      if (text.includes(ROUTE_MARKER)) routeFound = true;
      if (text.includes(BYPASS)) leaks.push(path);
    }
  }
};
walk(dir);

if (!routeFound) {
  console.error(`check-preview-bypass: the preview route is not in ${dir}; nothing was checked.`);
  process.exit(1);
}
if (leaks.length > 0) {
  console.error(`check-preview-bypass: the local "${BYPASS}" switch is in the production bundle:`);
  for (const leak of leaks) console.error(`  ${leak}`);
  process.exit(1);
}
console.log(`check-preview-bypass: OK, the preview route ships without the "${BYPASS}" switch.`);
