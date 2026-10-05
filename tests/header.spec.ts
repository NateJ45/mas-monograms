import { test, expect, type Page } from '@playwright/test';
import { routes } from './routes';

// =============================================================================
// The site header (2026-10-04 rework): centred Hoop Seal, no top rail, a glass
// pill on scroll. Guards the promises Header.astro makes:
//   - the old contact strip (the "top rail") is gone on every route
//   - the header's reserved height never changes between rest and pill, so the
//     page cannot shift when it condenses
//   - on overlay pages the hero's first words clear the header
//   - the dropdowns open and close from the keyboard
//   - with no JavaScript the header is a solid, usable row
// Runs on chromium (desktop) with its own viewports.
// =============================================================================

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

async function headerBox(page: Page) {
  return page.evaluate(() => {
    const h = document.querySelector('.site-header') as HTMLElement;
    const bar = document.querySelector('.site-header__bar') as HTMLElement;
    const r = h.getBoundingClientRect();
    return {
      height: r.height,
      scrolled: h.hasAttribute('data-scrolled'),
      radius: parseFloat(getComputedStyle(bar).borderTopLeftRadius),
      // the pill is drawn by a layer at its rect (the row's own layout never changes)
      pillWidth: (
        document.querySelector('.site-header__pill') as HTMLElement
      ).getBoundingClientRect().width,
      pillOpacity: parseFloat(
        getComputedStyle(document.querySelector('.site-header__pill') as HTMLElement).opacity,
      ),
      barLeft: bar.getBoundingClientRect().left,
      barHeight: bar.getBoundingClientRect().height,
    };
  });
}

test.describe('Header: the top rail is gone', () => {
  for (const route of routes) {
    test(`${route}: no contact strip, no phone or email in the header`, async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.site-header__strip')).toHaveCount(0);
      await expect(page.locator('.site-header a[href^="mailto:"]')).toHaveCount(0);
      await expect(page.locator('.site-header a[href^="tel:"]')).toHaveCount(0);
    });
  }
});

test.describe('Header: rest and pill', () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`at ${viewport.width}px the pill condenses inside a fixed box`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'load' });
      const rest = await headerBox(page);
      expect(rest.scrolled).toBe(false);
      expect(rest.radius).toBe(0);
      // the pill layer is hidden at rest (polled: under a loaded test run the page can still
      // be settling a transition when load fires)
      await expect
        .poll(() =>
          page
            .locator('.site-header__pill')
            .evaluate((el) => parseFloat(getComputedStyle(el).opacity)),
        )
        .toBe(0);
      // the hero's first heading starts below the header (nothing hides under it)
      const h1Top = await page
        .locator('h1')
        .first()
        .evaluate((el) => el.getBoundingClientRect().top);
      expect(h1Top).toBeGreaterThanOrEqual(rest.height);

      await page.evaluate(() => window.scrollTo(0, 1200));
      await expect(page.locator('.site-header[data-scrolled]')).toHaveCount(1);
      await page.waitForTimeout(900);
      const pill = await headerBox(page);
      expect(pill.height, 'reserved header height is the same in both states').toBe(rest.height);
      expect(pill.radius).toBeGreaterThan(20);
      expect(pill.pillWidth).toBeLessThan(viewport.width);
      expect(pill.pillOpacity).toBe(1);
      // compositor-only morph: the content row keeps its layout box in both states
      expect(pill.barLeft).toBe(rest.barLeft);
      expect(pill.barHeight).toBe(rest.barHeight);

      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.locator('.site-header[data-scrolled]')).toHaveCount(0);
    });
  }

  test('a light-opening page starts below the header', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/pricing', { waitUntil: 'load' });
    await expect(page.locator('.site-header')).toHaveAttribute('data-tone', 'solid');
    const box = await headerBox(page);
    const mainTop = await page.locator('#main').evaluate((el) => el.getBoundingClientRect().top);
    expect(mainTop).toBeGreaterThanOrEqual(box.height - 1);
  });
});

test.describe('Header: dropdowns from the keyboard', () => {
  test('Enter opens a group, Escape closes it and returns focus', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/', { waitUntil: 'load' });
    const group = page.locator('.site-header .site-nav__group').first();
    test.skip(
      (await group.count()) === 0,
      'no dropdown groups in this build (no Site Settings menu)',
    );
    const summary = group.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(group).toHaveAttribute('open', '');
    const firstLink = group.locator('.site-nav__menu a').first();
    await expect(firstLink).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(group).not.toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
  });
});

test.describe('Header: no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the overlay header is a solid Midnight row with its links', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    // 'load', not 'domcontentloaded': with JS off nothing holds DOMContentLoaded back for the
    // stylesheet, so a busy run could read the bar before the CSS applies
    await page.goto('/', { waitUntil: 'load' });
    await expect
      .poll(() =>
        page.locator('.site-header__bar').evaluate((el) => getComputedStyle(el).backgroundColor),
      )
      .toBe('rgb(15, 27, 45)');
    await expect(page.locator('.site-header__brand')).toBeVisible();
    await expect(page.locator('.site-header__cta')).toBeVisible();
  });
});
