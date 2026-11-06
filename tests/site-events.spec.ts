import { test, expect, type Page } from './fixtures';
import { settle } from './helpers';

// =============================================================================
// Visitor actions sent to GA4 (PORTS.md card 217)
// =============================================================================
// The real tag never loads under Playwright (navigator.webdriver), so each test
// stubs window.gtag before the page runs and reads the calls back. The stub hands
// every call to an exposed function, which survives the page moving on to
// /thank-you/. This site's map is pinned in src/lib/events-map.test.ts.
// =============================================================================

type Call = unknown[];

async function stub(page: Page): Promise<Call[]> {
  const calls: Call[] = [];
  await page.exposeFunction('__ga', (a: Call) => void calls.push(a));
  await page.addInitScript(() => {
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag = (...a: unknown[]) =>
      void (window as unknown as { __ga: (a: unknown[]) => void }).__ga(a);
  });
  return calls;
}

const named = (calls: Call[], name: string) =>
  calls.filter((c) => c[0] === 'event' && c[1] === name);

async function fillQuote(page: Page) {
  for (const id of ['itemType', 'monogramStyle', 'placement', 'size', 'threadCount']) {
    await page.locator(`#${id}`).selectOption({ index: 1 });
  }
  await page.locator('#personalization').fill('MAS');
  await page.locator('#name').fill('Test Person');
  await page.locator('#email').fill('test@example.org');
  await page.locator('input[name="ownership"]').first().check({ force: true });
}

test.describe('site events', () => {
  test('email and phone links in the footer are contact_click, the kind and not the address', async ({
    page,
  }) => {
    const calls = await stub(page);
    await page.goto('/');
    await settle(page);
    // The live footer's links come from Site Settings, which the test build does not have,
    // so put the same two links in the footer and click them with navigation cancelled.
    await page.evaluate(() => {
      document.addEventListener('click', (e) => e.preventDefault());
      for (const href of ['mailto:someone@example.org', 'tel:+18035550100']) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = href;
        document.querySelector('footer')!.append(a);
        a.click();
      }
    });
    const hits = named(calls, 'contact_click');
    expect(hits.map((c) => (c[2] as { method: string }).method)).toEqual(['email', 'phone']);
    expect(hits[0][2]).toMatchObject({ location: 'footer' });
    expect(JSON.stringify(hits)).not.toMatch(/example|803|555/);
  });

  for (const [label, size] of [
    ['a phone', { width: 375, height: 667 }],
    ['a desktop', { width: 1440, height: 900 }],
  ] as const) {
    test(`the quote form is counted as seen once on ${label}`, async ({ page }) => {
      await page.setViewportSize(size);
      const calls = await stub(page);
      await page.goto('/request-a-quote');
      await settle(page);
      // The marker is on the form's first question: the whole form is taller than 2.5 screens.
      await page.locator('[data-track-form="quote"]').scrollIntoViewIfNeeded();
      await expect.poll(() => named(calls, 'form_view').length).toBe(1);
      // Away and back: still one.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await page.locator('[data-track-form="quote"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      expect(named(calls, 'form_view')).toHaveLength(1);
      expect(named(calls, 'form_view')[0][2]).toMatchObject({ form_name: 'quote' });
    });
  }

  test('a quote request that goes through sends generate_lead once, before leaving', async ({
    page,
  }) => {
    const calls = await stub(page);
    // The server's real success answer: 303 to /thank-you/.
    await page.route('**/api/quote/', (route) =>
      route.fulfill({ status: 303, headers: { Location: '/thank-you/' } }),
    );
    await page.goto('/request-a-quote');
    await settle(page);
    await fillQuote(page);
    await page.locator('#submit-btn').click();
    await page.waitForURL(/\/thank-you\/?$/);
    const leads = named(calls, 'generate_lead');
    expect(leads).toHaveLength(1);
    expect(leads[0][2]).toEqual({ form_name: 'quote' });
    // Nothing the visitor typed is in any event.
    expect(JSON.stringify(calls)).not.toMatch(/Test Person|test@example/);
  });

  test('a quote request the server refuses sends no generate_lead', async ({ page }) => {
    const calls = await stub(page);
    await page.route('**/api/quote/', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"no"}' }),
    );
    await page.goto('/request-a-quote');
    await settle(page);
    await fillQuote(page);
    await page.locator('#submit-btn').click();
    await expect(page.locator('#form-error')).toBeVisible();
    expect(named(calls, 'generate_lead')).toHaveLength(0);
  });
});
