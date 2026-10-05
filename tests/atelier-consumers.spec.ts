import { expect, test, type Page } from '@playwright/test';

// =============================================================================
// Pages that drive an Atelier stage from outside (QuotePrefillScript,
// ThreadChartScript). These assert what the ENGINE ends up drawing
// (`__atelier.getDesign()`), not just the data-* attributes, because the
// consumers no longer guard against the engine starting late: the engine
// applies the latest design itself (see .claude/rules/atelier-engine.md).
// Also checks that the quote preview's lazy stage never fetches the engine for
// a visitor without initials.
// =============================================================================

type Design = { text: string; style: string; thread: string; fabric: string };
type StageEl = HTMLElement & { __atelier?: { getDesign(): Design } };

async function engineDesign(page: Page, selector: string): Promise<Design | null> {
  return page.evaluate(
    (sel) => (document.querySelector(sel) as StageEl | null)?.__atelier?.getDesign() ?? null,
    selector,
  );
}

test.describe('Quote preview stage', () => {
  test('without initials the engine is never fetched', async ({ page }) => {
    const engine: string[] = [];
    page.on('request', (r) => {
      if (/\/_astro\/(engine|atelier\.worker)[.-]/.test(r.url())) engine.push(r.url());
    });
    await page.goto('/request-a-quote', { waitUntil: 'load' });
    // past the idle import (4s timeout) and a scroll through the whole form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(5000);
    expect(engine).toEqual([]);
  });

  test('with initials the engine draws the requested design', async ({ page }) => {
    await page.goto('/request-a-quote', { waitUntil: 'load' });
    const raw = await page.locator('[data-quote-preview]').getAttribute('data-prefill');
    const data = raw
      ? (JSON.parse(raw) as {
          threads: Array<{ slug: string; hex: string }>;
          styles: Array<{ key: string }>;
        })
      : null;
    test.skip(!data?.threads.length || !data.styles.length, 'no prefill data in this build');
    const thread = data!.threads[1] ?? data!.threads[0];
    const style = data!.styles.find((s) => s.key === 'block') ?? data!.styles[0];
    const q = new URLSearchParams({ initials: 'jdw', style: style.key, thread: thread.slug });
    await page.goto(`/request-a-quote?${q}`, { waitUntil: 'load' });
    await page.locator('[data-quote-preview]').scrollIntoViewIfNeeded();
    await expect
      .poll(() => engineDesign(page, '[data-quote-preview] [data-atelier-stage]'), {
        timeout: 15_000,
      })
      .toMatchObject({ text: 'JDW', style: style.key, thread: thread.hex.toLowerCase() });
  });
});

test.describe('Thread chart stage', () => {
  async function spools(page: Page) {
    const s = page.locator('[data-rack] input[name="thread"]');
    test.skip((await s.count()) < 4, 'no threadColor documents in this build');
    return s;
  }

  test('a spool picked before the engine starts is what it draws', async ({ page }) => {
    await page.goto('/thread-color-chart', { waitUntil: 'load' });
    const s = await spools(page);
    const pick = s.nth(2);
    const hex = ((await pick.getAttribute('data-hex')) ?? '').toLowerCase();
    // pick at once, then bring the stage in (the engine starts after the pick)
    await pick.check({ force: true });
    await page.locator('#thread-stage').scrollIntoViewIfNeeded();
    await expect
      .poll(() => engineDesign(page, '#thread-stage'), { timeout: 15_000 })
      .toMatchObject({ thread: hex });
  });

  test('spools picked while the engine is starting and running: the last one wins', async ({
    page,
  }) => {
    await page.goto('/thread-color-chart', { waitUntil: 'load' });
    const s = await spools(page);
    await page.locator('#thread-stage').scrollIntoViewIfNeeded();
    // fire picks across the engine's start-up, without waiting for it
    for (const k of [0, 1, 3]) {
      await s.nth(k).check({ force: true });
      await page.waitForTimeout(120);
    }
    await expect
      .poll(
        () => page.evaluate(() => !!(document.querySelector('#thread-stage') as StageEl).__atelier),
        {
          timeout: 15_000,
        },
      )
      .toBe(true);
    const last = s.nth(5);
    const hex = ((await last.getAttribute('data-hex')) ?? '').toLowerCase();
    await last.check({ force: true });
    await expect
      .poll(() => engineDesign(page, '#thread-stage'), { timeout: 15_000 })
      .toMatchObject({ thread: hex });
  });

  test('new initials typed in the panel restitch the stage', async ({ page }) => {
    await page.goto('/thread-color-chart', { waitUntil: 'load' });
    await spools(page);
    const input = page.locator('[data-initials]');
    test.skip(!(await input.count()), 'no initials field');
    await page.locator('#thread-stage').scrollIntoViewIfNeeded();
    await input.fill('KLM');
    await expect
      .poll(() => engineDesign(page, '#thread-stage'), { timeout: 15_000 })
      .toMatchObject({ text: 'KLM' });
  });
});
