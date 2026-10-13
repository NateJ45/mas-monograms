import { test, expect } from '@playwright/test';
import { routes } from './routes';
import { settle } from './helpers';

// =============================================================================
// WCAG 2.1 SC 1.4.10 Reflow: no horizontal scrolling at 320px CSS width
// =============================================================================
// A page fails Reflow if content forces a horizontal scrollbar at a 320px
// viewport (equivalent to 400% zoom on a 1280px screen). Runs on every route.
//
// A second block sweeps the tablet/laptop widths (768/1024/1440) the same way:
// 320px passing does not prove the in-between breakpoints hold (multi-column
// grids only exist there). One test per route, resizing down without reload;
// the layouts are CSS-driven, so a resize exercises the same media queries a
// fresh load would, at a fraction of the runtime.
// =============================================================================

const overflowOf = (page: Parameters<typeof settle>[0]) =>
  page.evaluate(() => ({
    docWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

test.describe('Reflow: no horizontal overflow at 320px', () => {
  test.use({ viewport: { width: 320, height: 720 } });

  for (const route of routes) {
    test(`${route} does not overflow at 320px`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'load' });
      await settle(page);
      const { docWidth, viewportWidth } = await overflowOf(page);
      expect(
        docWidth,
        `${route}: content is ${docWidth}px wide in a ${viewportWidth}px viewport`,
      ).toBeLessThanOrEqual(viewportWidth);
    });
  }
});

test.describe('Reflow: no horizontal overflow at tablet/laptop widths', () => {
  const widths = [1440, 1024, 768];

  for (const route of routes) {
    test(`${route} does not overflow at ${widths.join('/')}px`, async ({ page }) => {
      await page.setViewportSize({ width: widths[0], height: 900 });
      await page.goto(route, { waitUntil: 'load' });
      await settle(page);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const { docWidth, viewportWidth } = await overflowOf(page);
        expect(
          docWidth,
          `${route} at ${width}px: content is ${docWidth}px wide in a ${viewportWidth}px viewport`,
        ).toBeLessThanOrEqual(viewportWidth);
      }
    });
  }
});

// The quote form's Turnstile widget is drawn by Cloudflare's script, at a fixed 300px
// ("normal") or 130px ("compact", chosen by data-size). At 320px it once pushed the page to
// 336px. The widget only exists in a build that has PUBLIC_TURNSTILE_SITE_KEY (CI builds do
// not), so this skips there; with a key it stubs api.js with an iframe of Cloudflare's
// documented widths, so it needs no network and no real challenge.
test.describe('Reflow: the Turnstile widget cannot widen the quote form', () => {
  for (const width of [320, 360, 375, 390, 414]) {
    test(`/request-a-quote/ at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js', (route) =>
        route.fulfill({
          contentType: 'text/javascript',
          body: `document.querySelectorAll('.cf-turnstile').forEach(function (el) {
            var f = document.createElement('iframe');
            f.title = 'stub';
            f.style.cssText = 'border:0;height:65px;width:' + (el.dataset.size === 'compact' ? 130 : 300) + 'px';
            el.appendChild(f);
          });`,
        }),
      );
      await page.goto('/request-a-quote/', { waitUntil: 'load' });
      await settle(page);
      test.skip(
        (await page.locator('.cf-turnstile').count()) === 0,
        'this build has no PUBLIC_TURNSTILE_SITE_KEY, so there is no widget',
      );
      await expect(page.locator('.cf-turnstile iframe')).toHaveCount(1);
      const { docWidth, viewportWidth } = await overflowOf(page);
      expect(
        docWidth,
        `content is ${docWidth}px wide in a ${viewportWidth}px viewport`,
      ).toBeLessThanOrEqual(viewportWidth);
      const right = await page
        .locator('.cf-turnstile iframe')
        .evaluate((el) => el.getBoundingClientRect().right);
      expect(right, 'the widget ends inside the viewport').toBeLessThanOrEqual(viewportWidth);
    });
  }
});
