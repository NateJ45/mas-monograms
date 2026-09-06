import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routes } from './routes';
import { settle } from './helpers';

// =============================================================================
// Accessibility (axe-core): every route, default rule set
// =============================================================================
// WCAG AA is a hard requirement, and Lighthouse's a11y gate (minScore 1) is
// wired into CI. Lighthouse scores on axe's DEFAULT rules, which include
// best-practice checks (heading-order, landmark-unique, region, ...) beyond the
// wcag2a/aa tags. So we run the default rule set on ALL routes to stay in sync
// with (and slightly ahead of) the Lighthouse gate. About 1s per page.
//
// Do NOT narrow this to `.withTags([...])`: that would DROP the best-practice
// and WCAG 2.2 coverage (target-size, SC 2.5.8) the default set gives us.
// =============================================================================

test.describe('Accessibility: no axe violations', () => {
  for (const route of routes) {
    test(`${route} passes axe`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Settle fonts and reveal content so axe audits the real, fully-rendered
      // page; mid-transition opacity produces false color-contrast violations.
      await settle(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations,
        results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.help}`).join('\n'),
      ).toEqual([]);
    });
  }
});

// =============================================================================
// Focus indicators
// =============================================================================
// axe has NO rule for focus indicators, and the sweep above audits the resting
// DOM only, so nothing there ever focuses a field. That blind spot let the
// quote form ship with no keyboard focus indicator on any of its seven selects
// in Safari and iOS (found 2026-09-06, fixed in the same change as this test).
//
// The mechanism, measured rather than assumed: Tailwind's `focus:ring-*`
// compiles to a box-shadow, WebKit renders native form controls itself and
// drops box-shadow on them, and the `focus:outline-none` that pairs with the
// ring removes the fallback. The select still enters :focus and
// :focus-visible; nothing is painted. So this MUST run on the webkit project
// too, which it does (playwright.config.ts matches a11y.spec.ts on both). Do
// not skip it there: WebKit is the one engine where the bug exists.
// =============================================================================

// The quote form is the only route with a form of its own. Whatever the shared
// footer and header carry (newsletter signup, search) is swept here too, since
// this walks every visible field on the page.
const FORM_ROUTES = ['/request-a-quote'];

test.describe('Focus indicators are visible', () => {
  for (const route of FORM_ROUTES) {
    test(`${route} gives every field a visible focus indicator`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await settle(page);

      const fields = page.locator(
        'input:not([type=hidden]):visible, textarea:visible, select:visible',
      );
      const count = await fields.count();
      test.skip(count === 0, 'no form fields on this route');

      const bare: string[] = [];
      for (let i = 0; i < count; i++) {
        const field = fields.nth(i);
        // Read the RESTING box-shadow first, then focus and read it again. A
        // field with a decorative shadow at rest would otherwise pass on that
        // shadow alone even with its focus ring gone; only a shadow that
        // focus CHANGES is a focus indicator.
        const before = await field.evaluate((el) => getComputedStyle(el).boxShadow);
        await field.focus();
        const indicator = await field.evaluate((el, resting) => {
          const s = getComputedStyle(el);
          const outline =
            s.outlineStyle !== 'none' && parseFloat(s.outlineWidth || '0') >= 1
              ? parseFloat(s.outlineWidth)
              : 0;
          const shadow = s.boxShadow && s.boxShadow !== 'none' && s.boxShadow !== resting ? 1 : 0;
          return {
            outline,
            shadow,
            name: el.getAttribute('name') ?? el.id ?? el.tagName.toLowerCase(),
          };
        }, before);
        if (indicator.outline === 0 && indicator.shadow === 0) bare.push(indicator.name);
      }

      expect(bare, `fields with NO focus indicator: ${bare.join(', ')}`).toEqual([]);
    });
  }
});
