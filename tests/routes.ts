import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// =============================================================================
// Every public, PRERENDERED route on the site: the single source of truth for
// the sweeps. The suites serve the static `dist/client`, so only build-time HTML
// pages belong here.
//
// NOT here, on purpose:
//   /studio          the embedded Sanity Studio. dist/client carries only a
//                    mount shell; the real thing is a React app that needs a
//                    CORS-allowed origin, and curling it proves nothing
//                    (CLAUDE.md gotcha 13).
//   /preview/**      SSR draft preview (prerender = false), dist/server only.
//   /api/**          the quote Worker and draft-mode toggles, SSR only.
// lighthouserc.json and the `check:links` script exclude the same three.
// =============================================================================

// The fixed pages: one .astro file each under src/pages. These exist in EVERY
// build, including the credential-less CI build, so they are listed by hand and
// a missing one is a real failure.
const fixedRoutes = [
  '/',
  '/about',
  '/how-it-works',
  '/pricing',
  '/request-a-quote',
  '/shop-by-item',
  '/style-gallery',
  '/font-lettering-guide',
  '/thread-color-chart',
  '/clearance',
  '/thank-you',
];

// The CMS-driven templates: `/[slug]` (itemCategory) and `/legal/[slug]`
// (legalPage) get their paths from Sanity in getStaticPaths(). CI builds with
// no Sanity credentials, so those documents do not exist there and the pages
// are simply not emitted. Rather than hard-code slugs that exist in one build
// and not another, discover whatever the build actually produced: every
// `<dir>/index.html` in dist/client that is not a fixed route above and not one
// of the excluded SSR surfaces. Locally (with .env) that is the eight item
// categories and the three legal pages; in CI it is nothing, and the fixed
// routes still run.
const EXCLUDED = new Set(['studio', 'preview', 'api']);

function discoverBuiltRoutes(): string[] {
  const dist = join(process.cwd(), 'dist', 'client');
  if (!existsSync(dist)) return [];
  const found: string[] = [];
  const walk = (dir: string, prefix: string) => {
    for (const name of readdirSync(dir)) {
      if (name.startsWith('_') || name.startsWith('.')) continue;
      const full = join(dir, name);
      if (!statSync(full).isDirectory()) continue;
      if (prefix === '' && EXCLUDED.has(name)) continue;
      const route = `${prefix}/${name}`;
      if (existsSync(join(full, 'index.html')) && !fixedRoutes.includes(route)) {
        found.push(route);
      }
      walk(full, route);
    }
  };
  walk(dist, '');
  return found.sort();
}

export const routes = [...fixedRoutes, ...discoverBuiltRoutes()];
