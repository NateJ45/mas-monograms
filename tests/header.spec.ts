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

// The pill's frosted glass (2026-10-05). For its first life the blur never rendered:
// <header> carried a view-transition-name, which makes it a "backdrop root", so the
// backdrop-filter on .site-header__ground (inside it) could only see what <header>
// painted, which is nothing. Two guards: no ancestor of the glass may be a backdrop
// root, and a striped strip under the pill must come out blurred (pixel check).
test.describe('Header: the pill is real frosted glass', () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`at ${viewport.width}px the glass has a backdrop-filter and no backdrop root above it`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/pricing', { waitUntil: 'load' });
      await page.evaluate(() => window.scrollTo(0, 700));
      await expect(page.locator('.site-header[data-scrolled]')).toHaveCount(1);
      await page.waitForTimeout(900);
      const report = await page.evaluate(() => {
        const glass = document.querySelector('.site-header__ground') as HTMLElement;
        const g = getComputedStyle(glass);
        const filter =
          g.backdropFilter ||
          (g as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter ||
          'none';
        // Every property that makes an element a backdrop root (Filter Effects 2), on
        // each ancestor between the glass and <html> (the root always is one).
        const offenders: string[] = [];
        for (let el = glass.parentElement; el && el !== document.documentElement;) {
          const s = getComputedStyle(el) as CSSStyleDeclaration & {
            viewTransitionName?: string;
            webkitBackdropFilter?: string;
            webkitMaskImage?: string;
          };
          const tag = el.tagName.toLowerCase() + (el.className ? `.${el.className}` : '');
          const bad: [string, boolean][] = [
            ['clip-path', s.clipPath !== 'none'],
            ['opacity', parseFloat(s.opacity) < 1],
            ['filter', s.filter !== 'none'],
            ['mask', (s.maskImage || s.webkitMaskImage || 'none') !== 'none'],
            ['mix-blend-mode', s.mixBlendMode !== 'normal'],
            ['backdrop-filter', (s.backdropFilter || s.webkitBackdropFilter || 'none') !== 'none'],
            ['will-change', /opacity|filter|clip-path|mask|view-transition/.test(s.willChange)],
            ['view-transition-name', (s.viewTransitionName ?? 'none') !== 'none'],
          ];
          for (const [prop, hit] of bad) if (hit) offenders.push(`${tag} ${prop}`);
          el = el.parentElement;
        }
        return { filter, offenders };
      });
      expect(report.filter).not.toBe('none');
      expect(report.filter).toContain('blur');
      expect(report.offenders, 'ancestors of the glass that are backdrop roots').toEqual([]);
    });
  }

  test('a striped strip behind the pill comes out blurred', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'pixel check is calibrated on Chromium');
    await page.setViewportSize(DESKTOP);
    await page.goto('/pricing', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect(page.locator('.site-header[data-scrolled]')).toHaveCount(1);
    await page.waitForTimeout(900);
    // Black and white bars in the page flow at the header's place, under it (z 40 < 50),
    // and the header's content hidden so only the glass is measured.
    await page.evaluate(() => {
      const s = document.createElement('div');
      s.style.cssText = `position:absolute;left:0;top:${window.scrollY}px;width:100%;height:160px;
        z-index:40;pointer-events:none;
        background:repeating-linear-gradient(90deg,#000 0 6px,#fff 6px 12px)`;
      document.body.appendChild(s);
      const st = document.createElement('style');
      st.textContent = '.site-header__bar{visibility:hidden!important}';
      document.head.appendChild(st);
    });
    // mean brightness step between neighbouring pixels in a band through the pill's middle
    const energy = async () => {
      const png = await page.screenshot({ clip: { x: 400, y: 34, width: 600, height: 20 } });
      return page.evaluate(async (bytes: number[]) => {
        const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
        const bmp = await createImageBitmap(blob);
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = c.getContext('2d')!;
        ctx.drawImage(bmp, 0, 0);
        const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
        let sum = 0;
        let n = 0;
        for (let y = 0; y < bmp.height; y++)
          for (let x = 1; x < bmp.width; x++) {
            const i = (y * bmp.width + x) * 4;
            sum += Math.abs(d[i] - d[i - 4]);
            n++;
          }
        return sum / n;
      }, Array.from(png));
    };
    const blurred = await energy();
    await page.addStyleTag({
      content:
        '.site-header__ground{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
    });
    await page.waitForTimeout(600);
    const sharp = await energy();
    expect(sharp, 'the stripes show through the tint').toBeGreaterThan(3);
    expect(blurred, 'the glass blurs them away').toBeLessThan(sharp / 5);
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
