import { test, expect, type Page } from '@playwright/test';
import { settle } from './helpers';

// =============================================================================
// Direction D ("The Atelier", 2026-10-04) feature behaviour
// =============================================================================
// The route sweeps (smoke, a11y, reflow, reduced-motion) prove every page
// renders cleanly; they never touch the interactive pieces. This file does,
// once each: the Monogram Atelier studio on the home page, the quote form's
// query-string prefill (including hostile input), the thread chart's spool
// rack, the gallery lightbox, and the lazily mounted phone menu.
//
// Every block skips (with a reason) when the build has no Sanity content for
// it: CI builds credential-less, so the studio, the rack and the gallery are
// simply not emitted there. Locally, with .env, they all run.
//
// Chromium only (playwright.config.ts gives the webkit-iphone project the
// route sweeps). The phone-menu test sets its own phone viewport.
// =============================================================================

type StageEl = HTMLElement & { __atelier?: unknown };

/** Resolve once the stage's engine has drawn (data-ready) and, when asked, finished stitching. */
async function waitForStage(page: Page, selector: string, finished = false) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForFunction(
    ([sel, fin]) => {
      const el = document.querySelector<StageEl>(sel as string);
      if (!el?.dataset.ready) return false;
      if (!fin) return true;
      return (el as HTMLElement & { __lastProgress?: number }).__lastProgress === 1;
    },
    [selector, finished],
    { timeout: 20_000 },
  );
}

/** Record the latest atelier:progress value on the stage element itself. */
async function trackProgress(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector<HTMLElement & { __lastProgress?: number }>(sel);
    el?.addEventListener('atelier:progress', (e) => {
      el.__lastProgress = (e as CustomEvent<{ progress: number }>).detail.progress;
    });
  }, selector);
}

/** True when the canvas has painted more than one flat colour. */
async function canvasHasInk(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const c = document.querySelector<HTMLCanvasElement>(`${sel} canvas`);
    if (!c || !c.width || !c.height) return false;
    const ctx = c.getContext('2d');
    if (!ctx) return false;
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const seen = new Set<number>();
    for (let i = 0; i < data.length; i += 4 * 97) {
      seen.add((data[i] >> 4) * 256 + (data[i + 1] >> 4) * 16 + (data[i + 2] >> 4));
      if (seen.size > 8) return true;
    }
    return false;
  }, selector);
}

// -----------------------------------------------------------------------------
// The Monogram Atelier studio (home page)
// -----------------------------------------------------------------------------
test.describe('Atelier studio', () => {
  const STUDIO = '[data-atelier-studio]';
  const STAGE = `${STUDIO} [data-atelier-stage]`;

  test('typing, style, thread and fabric all update the stage and its text alternative', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    test.skip((await page.locator(STUDIO).count()) === 0, 'no atelierSettings in this build');
    await settle(page);
    const canvas = page.locator(`${STAGE} canvas`);
    const status = page.locator(`${STUDIO} [data-atelier-status]`);
    await trackProgress(page, STAGE);
    await waitForStage(page, STAGE);

    // Initials: junk is stripped, lower case is raised, three letters max.
    const input = page.locator(`${STUDIO} [data-atelier-initials]`);
    await input.fill('j<w');
    await expect(input).toHaveValue('JW');
    await expect(page.locator(STAGE)).toHaveAttribute('data-text', 'JW');
    await expect(canvas).toHaveAttribute('aria-label', /^JW\b/);
    await expect(status).toHaveText(/^JW\b/);

    // Style: the blurb follows and the label names the new style.
    const styles = page.locator(`${STUDIO} input[name="style"]`);
    if ((await styles.count()) > 1) {
      const second = styles.nth(1);
      const key = await second.getAttribute('value');
      const label = (await second.getAttribute('data-label')) ?? '';
      await second.check({ force: true });
      await expect(page.locator(STAGE)).toHaveAttribute('data-style', key ?? '');
      await expect(canvas).toHaveAttribute('aria-label', new RegExp(escapeRe(label)));
      await expect(page.locator(`${STUDIO} [data-style-blurb="${key}"]`)).toBeVisible();
    }

    // Thread: the stage colour, the named thread and the label all follow.
    const threads = page.locator(`${STUDIO} input[name="thread"]`);
    if ((await threads.count()) > 1) {
      const pick = threads.nth(2);
      const hex = (await pick.getAttribute('data-hex')) ?? '';
      const label = (await pick.getAttribute('data-label')) ?? '';
      await pick.check({ force: true });
      await expect(page.locator(STAGE)).toHaveAttribute('data-thread', hex);
      await expect(page.locator(`${STUDIO} [data-thread-name]`)).toHaveText(label);
      await expect(canvas).toHaveAttribute('aria-label', new RegExp(escapeRe(label)));
    }

    // Fabric: same contract.
    const fabrics = page.locator(`${STUDIO} input[name="fabric"]`);
    if ((await fabrics.count()) > 1) {
      const pick = fabrics.nth(1);
      const hex = (await pick.getAttribute('data-hex')) ?? '';
      const label = (await pick.getAttribute('data-label')) ?? '';
      await pick.check({ force: true });
      await expect(page.locator(STAGE)).toHaveAttribute('data-fabric', hex);
      await expect(canvas).toHaveAttribute('aria-label', new RegExp(escapeRe(label)));
    }

    // The engine was handed the final design, and it painted embroidery.
    await expect
      .poll(() =>
        page.evaluate(
          (sel) =>
            (
              document.querySelector(sel) as HTMLElement & {
                __atelier?: { getDesign(): { text: string } };
              }
            ).__atelier?.getDesign().text,
          STAGE,
        ),
      )
      .toBe('JW');
    await expect.poll(() => canvasHasInk(page, STAGE), { timeout: 15_000 }).toBe(true);
  });

  test('Replay restitches from the start and finishes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const replay = page.locator(`${STUDIO} [data-atelier-replay]`);
    test.skip((await replay.count()) === 0, 'no atelierSettings in this build');
    await settle(page);
    await trackProgress(page, STAGE);
    await waitForStage(page, STAGE);
    // Record every progress value seen after the click.
    await page.evaluate((sel) => {
      const el = document.querySelector<HTMLElement & { __seen?: number[] }>(sel)!;
      el.__seen = [];
      el.addEventListener('atelier:progress', (e) =>
        el.__seen!.push((e as CustomEvent<{ progress: number }>).detail.progress),
      );
    }, STAGE);
    await replay.click();
    await expect
      .poll(
        () =>
          page.evaluate(
            (sel) => document.querySelector<HTMLElement & { __seen?: number[] }>(sel)!.__seen!,
            STAGE,
          ),
        { timeout: 20_000 },
      )
      .toEqual(expect.arrayContaining([1]));
    const seen = await page.evaluate(
      (sel) => document.querySelector<HTMLElement & { __seen?: number[] }>(sel)!.__seen!,
      STAGE,
    );
    expect(Math.min(...seen), 'replay starts from (near) the beginning').toBeLessThan(0.5);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('renders the finished piece at once', async ({ page }) => {
      await page.goto('/', { waitUntil: 'load' });
      test.skip((await page.locator(STUDIO).count()) === 0, 'no atelierSettings in this build');
      await page.evaluate((sel) => {
        const el = document.querySelector<HTMLElement & { __seen?: number[] }>(sel)!;
        el.__seen = [];
        el.addEventListener('atelier:progress', (e) =>
          el.__seen!.push((e as CustomEvent<{ progress: number }>).detail.progress),
        );
      }, STAGE);
      await page.locator(STAGE).scrollIntoViewIfNeeded();
      await page.waitForFunction(
        (sel) => !!document.querySelector<HTMLElement>(sel)?.dataset.ready,
        STAGE,
        { timeout: 20_000 },
      );
      const seen = await page.evaluate(
        (sel) => document.querySelector<HTMLElement & { __seen?: number[] }>(sel)!.__seen!,
        STAGE,
      );
      // No intermediate frames: the first progress the page hears is the end.
      expect(seen[0], `progress events: ${JSON.stringify(seen.slice(0, 5))}`).toBe(1);
      await expect.poll(() => canvasHasInk(page, STAGE), { timeout: 10_000 }).toBe(true);
    });
  });

  test('with no JS the studio is a plain GET form to the quote page', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'load' });
    const form = page.locator(`${STUDIO} form[data-atelier-form]`);
    if ((await form.count()) === 0) {
      await ctx.close();
      test.skip(true, 'no atelierSettings in this build');
    }
    await expect(form).toHaveAttribute('method', 'get');
    await expect(form).toHaveAttribute('action', /^\/request-a-quote/);
    await page.locator(`${STUDIO} [data-atelier-initials]`).fill('ABC');
    await Promise.all([
      page.waitForURL(/\/request-a-quote\/?\?/),
      form.locator('button[type="submit"], input[type="submit"]').first().click(),
    ]);
    const url = new URL(page.url());
    expect(url.searchParams.get('initials')).toBe('ABC');
    expect(url.searchParams.get('style')).toBeTruthy();
    await ctx.close();
  });
});

// -----------------------------------------------------------------------------
// /request-a-quote query-string prefill
// -----------------------------------------------------------------------------
test.describe('Quote form prefill', () => {
  type Prefill = {
    threads: Array<{ slug: string; name: string }>;
    fabrics: Array<{ key: string; label: string }>;
    styles: Array<{ key: string; label: string }>;
  };

  async function prefillData(page: Page): Promise<Prefill | null> {
    const raw = await page
      .locator('[data-quote-preview]')
      .getAttribute('data-prefill')
      .catch(() => null);
    return raw ? (JSON.parse(raw) as Prefill) : null;
  }

  test('valid params fill the form and reveal the preview', async ({ page }) => {
    await page.goto('/request-a-quote', { waitUntil: 'load' });
    const data = await prefillData(page);
    test.skip(
      !data || !data.threads.length || !data.styles.length,
      'no prefill data in this build',
    );
    const thread = data!.threads[0];
    const style = data!.styles[0];
    const fabric = data!.fabrics[0];
    const q = new URLSearchParams({
      initials: 'mas',
      style: style.key,
      thread: thread.slug || thread.name,
      ...(fabric ? { fabric: fabric.key } : {}),
    });
    await page.goto(`/request-a-quote?${q}`, { waitUntil: 'load' });
    await expect(page.locator('#personalization')).toHaveValue(/: MAS$/m);
    await expect(page.locator('#personalization')).toHaveValue(
      new RegExp(`: ${escapeRe(style.label)}$`, 'm'),
    );
    await expect(page.locator('#threadColor')).toHaveValue(thread.name);
    if (fabric)
      await expect(page.locator('#itemDescription')).toHaveValue(new RegExp(fabric.label));
    await expect(page.locator('[data-quote-preview]')).toBeVisible();
    await expect(page.locator('[data-quote-preview] [data-atelier-stage]')).toHaveAttribute(
      'data-text',
      'MAS',
    );
    await expect(page.locator('[data-qp-spec] dd').first()).toHaveText('MAS');
  });

  test('junk and HTML-ish params inject nothing and leave the form empty', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });
    const evil = '<img src=x onerror="alert(1)">';
    const q = new URLSearchParams({
      initials: evil,
      style: '<script>alert(2)</script>',
      thread: '"><svg onload=alert(3)>',
      fabric: '../../etc/passwd',
      item: '<b>bold</b>',
      font: '<i>x</i>',
    });
    await page.goto(`/request-a-quote?${q}`, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    expect(dialogs, 'no script ran').toEqual([]);
    // Nothing became markup anywhere on the page.
    const injected = await page.evaluate(
      () =>
        document.querySelectorAll('img[src="x"], img[onerror], svg[onload], b:not([class])').length,
    );
    expect(injected).toBe(0);
    // Junk initials are rejected outright (never salvaged into "IMG").
    await expect(page.locator('#personalization')).toHaveValue('');
    await expect(page.locator('#threadColor')).toHaveValue('');
    await expect(page.locator('#itemDescription')).toHaveValue('');
    const preview = page.locator('[data-quote-preview]');
    if (await preview.count()) await expect(preview).toBeHidden();
  });
});

// -----------------------------------------------------------------------------
// Where the visitor came from (utm_* tags from QR codes, src/lib/utm.ts)
// -----------------------------------------------------------------------------
test.describe('Quote source tags', () => {
  const field = (page: Page, name: string) =>
    page.locator(`#quote-form input[type="hidden"][name="${name}"]`);

  test('tags from the landing page follow the visitor to the quote form', async ({ page }) => {
    await page.goto('/?utm_source=qr&utm_medium=tag&utm_campaign=test', { waitUntil: 'load' });
    // Click through, as a visitor would (the router swaps the page in place).
    await page.locator('header a[href="/request-a-quote"]').first().click();
    await page.waitForURL(/\/request-a-quote\/?$/);
    await expect(field(page, 'utm_source')).toHaveValue('qr');
    await expect(field(page, 'utm_medium')).toHaveValue('tag');
    await expect(field(page, 'utm_campaign')).toHaveValue('test');
    // First touch wins: a later tagged visit in the same session does not replace it.
    await page.goto('/request-a-quote?utm_source=facebook&utm_medium=social', {
      waitUntil: 'load',
    });
    await expect(field(page, 'utm_source')).toHaveValue('qr');
    await expect(field(page, 'utm_medium')).toHaveValue('tag');
  });

  test('a tagged visit straight to the quote page fills the fields', async ({ page }) => {
    await page.goto('/request-a-quote?utm_source=qr&utm_medium=card&utm_campaign=2026-10', {
      waitUntil: 'load',
    });
    await expect(field(page, 'utm_source')).toHaveValue('qr');
    await expect(field(page, 'utm_medium')).toHaveValue('card');
    await expect(field(page, 'utm_campaign')).toHaveValue('2026-10');
  });

  test('junk tags are dropped and inject nothing', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });
    const q = new URLSearchParams({
      utm_source: '<script>alert(1)</script>',
      utm_medium: 'hang tag',
      utm_campaign: 'x'.repeat(41),
    });
    await page.goto(`/?${q}`, { waitUntil: 'load' });
    await page.goto('/request-a-quote', { waitUntil: 'load' });
    await page.waitForTimeout(200);
    expect(dialogs, 'no script ran').toEqual([]);
    for (const name of ['utm_source', 'utm_medium', 'utm_campaign'])
      await expect(field(page, name)).toHaveValue('');
    const stored = await page.evaluate(() => sessionStorage.getItem('mas-utm-v1'));
    expect(stored).toBeNull();
  });

  test('no tags, empty fields (and the existing prefill still works alongside)', async ({
    page,
  }) => {
    await page.goto('/request-a-quote?initials=ab', { waitUntil: 'load' });
    for (const name of ['utm_source', 'utm_medium', 'utm_campaign'])
      await expect(field(page, name)).toHaveValue('');
  });
});

// -----------------------------------------------------------------------------
// /thread-color-chart spool rack
// -----------------------------------------------------------------------------
test.describe('Thread chart', () => {
  test('choosing a spool recolours the stage, names the thread and updates the hand-off', async ({
    page,
  }) => {
    await page.goto('/thread-color-chart', { waitUntil: 'load' });
    const spools = page.locator('[data-rack] input[name="thread"]');
    test.skip((await spools.count()) < 2, 'no threadColor documents in this build');
    await settle(page);
    const pick = spools.nth(3);
    const hex = (await pick.getAttribute('data-hex')) ?? '';
    const name = (await pick.getAttribute('data-name')) ?? '';
    const value = (await pick.getAttribute('value')) ?? '';
    await pick.check({ force: true });
    await expect(pick).toBeChecked();
    await expect(page.locator('#thread-stage')).toHaveAttribute('data-thread', hex);
    await expect(page.locator('[data-now-name]')).toHaveText(name);
    await expect(page.locator('#thread-stage canvas')).toHaveAttribute(
      'aria-label',
      new RegExp(escapeRe(name)),
    );
    const cta = page.locator('[data-thread-cta]');
    if (await cta.count()) {
      const href = (await cta.getAttribute('href')) ?? '';
      expect(new URL(href, 'http://x').searchParams.get('thread')).toBe(value);
    }
  });

  test('the search filter narrows the rack and counts what it shows', async ({ page }) => {
    await page.goto('/thread-color-chart', { waitUntil: 'load' });
    const cells = page.locator('[data-rack-cell]');
    const total = await cells.count();
    test.skip(total < 2, 'no threadColor documents in this build');
    const firstName =
      (await page.locator('[data-rack] input[name="thread"]').first().getAttribute('data-name')) ??
      '';
    await page.locator('[data-rack-filter]').fill(firstName);
    await expect
      .poll(async () => (await cells.filter({ visible: true }).count()) < total)
      .toBe(true);
    await expect(page.locator('[data-rack-shown]')).toHaveText(
      String(await cells.filter({ visible: true }).count()),
    );
  });
});

// -----------------------------------------------------------------------------
// /style-gallery lightbox
// -----------------------------------------------------------------------------
test.describe('Gallery lightbox', () => {
  test('opens on a photo, closes on Escape and the close button, and returns focus', async ({
    page,
  }) => {
    await page.goto('/style-gallery', { waitUntil: 'load' });
    const triggers = page.locator('button[data-lightbox]');
    test.skip((await triggers.count()) === 0, 'no gallery items in this build');
    await settle(page);
    const dialog = page.locator('dialog#lightbox');
    const first = triggers.first();

    await first.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-lightbox-close]')).toBeFocused();
    await expect(page.locator('[data-lightbox-img]')).toHaveAttribute('src', /.+/);
    await expect(page.locator('[data-lightbox-count]')).toHaveText(/^1 \/ \d+$/);

    if ((await triggers.count()) > 1) {
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('[data-lightbox-count]')).toHaveText(/^2 \/ \d+$/);
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('[data-lightbox-count]')).toHaveText(/^1 \/ \d+$/);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
    await expect(page.locator('html')).not.toHaveClass(/lightbox-open/);

    await first.click();
    await expect(dialog).toBeVisible();
    await page.locator('[data-lightbox-close]').click();
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
  });
});

// -----------------------------------------------------------------------------
// FAQ accordion (/pricing): answers are force-mounted, so they must still
// open and close with JS and be readable without it
// -----------------------------------------------------------------------------
test.describe('FAQ accordion', () => {
  test('closed answers are hidden, a click opens and closes one', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'load' });
    const triggers = page.locator('[data-slot="accordion-trigger"]');
    test.skip((await triggers.count()) === 0, 'no FAQs in this build');
    const trigger = triggers.first();
    await trigger.scrollIntoViewIfNeeded();
    const answer = page.locator('[data-slot="accordion-content"]').first();
    // client:visible: wait for hydration before judging the closed state. The island's
    // `ssr` attribute goes when React has hydrated; a click before that lands on static
    // markup and does nothing (a load-dependent flake, 1 in 10 under 6 workers, 2026-10-04).
    await expect(page.locator('astro-island[component-url*="FaqAccordion"]')).not.toHaveAttribute(
      'ssr',
      /.*/,
      { timeout: 10_000 },
    );
    await expect(answer).toBeHidden({ timeout: 10_000 });
    await trigger.click();
    await expect(answer).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect(answer).toBeHidden();
  });

  test('with no JS every answer is in the page and visible', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/pricing', { waitUntil: 'load' });
    const answers = page.locator('[data-slot="accordion-content"]');
    const n = await answers.count();
    if (n === 0) {
      await ctx.close();
      test.skip(true, 'no FAQs in this build');
    }
    for (let i = 0; i < n; i++) {
      await expect(answers.nth(i)).toBeVisible();
      expect(((await answers.nth(i).textContent()) ?? '').trim().length).toBeGreaterThan(0);
    }
    await ctx.close();
  });
});

// -----------------------------------------------------------------------------
// Phone menu: React mounts lazily (mobileNavMount.tsx)
// -----------------------------------------------------------------------------
test.describe('Phone menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a placeholder paints first; a tap mounts the real menu and opens it', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const slot = page.locator('[data-mobile-nav]');
    const placeholder = slot.locator('[data-mobile-nav-placeholder] button');
    // Not mounted at first paint (the 2.5s idle mount has not happened yet).
    await expect(placeholder).toBeVisible();
    await expect(slot.locator('[data-slot="sheet-trigger"]')).toHaveCount(0);

    await placeholder.click();
    await expect(slot.locator('[data-mobile-nav-placeholder]')).toHaveCount(0);
    const trigger = slot.locator('[data-slot="sheet-trigger"]');
    await expect(trigger).toHaveCount(1);
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  // A real Android phone showed the open menu scrolling for nothing (a decorative hoop
  // hanging 40px below the content made the scroll box taller than the screen) and a flat,
  // darker strip at the foot of that scroll (the twill was painted on a ::before the size of
  // the first screen). The panel now carries the twill itself, attached "local".
  test('the open menu fits the screen and its twill covers the whole scroll box', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await page.locator('[data-mobile-nav] button[aria-label="Open menu"]').first().click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();
    const box = await sheet.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        viewport: window.innerHeight,
        top: el.getBoundingClientRect().top,
        bgImage: cs.backgroundImage,
        bgAttachment: cs.backgroundAttachment,
        beforeContent: getComputedStyle(el, '::before').content,
      };
    });
    expect(box.top).toBe(0);
    expect(box.clientHeight).toBe(box.viewport);
    expect(box.scrollHeight, 'no needless scroll at 390x844').toBe(box.clientHeight);
    // the texture is on the scroll box itself and scrolls with its content
    expect(box.bgImage).not.toBe('none');
    expect(box.bgAttachment.split(',').every((v) => v.trim() === 'local')).toBe(true);
    expect(box.beforeContent === 'none' || box.beforeContent === 'normal').toBe(true);
  });

  test('with no interaction it mounts on its own shortly after load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('[data-mobile-nav] [data-slot="sheet-trigger"]')).toHaveCount(1, {
      timeout: 10_000,
    });
    await expect(page.locator('[data-mobile-nav-placeholder]')).toHaveCount(0);
  });
});

// -----------------------------------------------------------------------------
// /request-a-quote with JavaScript off: the form cannot send (Turnstile and the
// fetch submit need JS), so a <noscript> note (requestAQuotePage.noScriptMessage)
// gives Mary Ann's email as a mailto link and her phone (siteSettings).
// -----------------------------------------------------------------------------
test.describe('Quote form without JavaScript', () => {
  test('a note with a mailto link sits at the top of the form', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/request-a-quote', { waitUntil: 'load' });
    const note = page.getByTestId('quote-noscript');
    await expect(note).toBeVisible();
    await expect(note.locator('.quote-noscript__msg')).not.toHaveText('');
    // The note comes before the form's first field, and the fields still render.
    const order = await page.evaluate(() => {
      const n = document.querySelector('[data-testid="quote-noscript"]');
      const f = document.querySelector('#quote-form');
      return n && f ? n.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING : 0;
    });
    expect(order).toBeTruthy();
    await expect(page.locator('#quote-form #email')).toBeVisible();
    const mail = note.locator('a[href^="mailto:"]');
    if ((await mail.count()) === 0) {
      await ctx.close();
      test.skip(true, 'no siteSettings email in this build');
    }
    await expect(mail).toBeVisible();
    const href = (await mail.getAttribute('href')) ?? '';
    expect(href).toMatch(/^mailto:[^@\s]+@[^@\s]+$/);
    await expect(mail).toHaveText(href.replace(/^mailto:/, ''));
    const box = await mail.evaluate((el) => {
      const r = (el.parentElement as HTMLElement).getBoundingClientRect();
      return r.height;
    });
    expect(box).toBeGreaterThanOrEqual(44);
    await ctx.close();
  });

  test('with JavaScript on the note is not shown', async ({ page }) => {
    await page.goto('/request-a-quote', { waitUntil: 'load' });
    await expect(page.getByTestId('quote-noscript')).toHaveCount(0);
  });
});

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
