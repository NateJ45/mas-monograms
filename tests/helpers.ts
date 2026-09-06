import type { Page } from '@playwright/test';

// =============================================================================
// settle(): put a page in a stable, fully-rendered state before we measure or
// audit it. Without this, tests are flaky for two real reasons:
//
//   1. Web fonts (Fraunces, Mulish, Petemoss) load async; text measured before
//      they load uses fallback metrics and can be a couple px wider, which is a
//      false Reflow fail.
//   2. The image-curtain reveal (`.img-curtain` in globals.css) hides images
//      until BaseLayout's IntersectionObserver adds `.is-revealed`; the
//      step-connector draw waits on `[data-reveal]` getting `.is-visible`. axe
//      run mid-animation sees half-drawn content.
//
// So: wait for fonts, kill all transitions/animations, then force every reveal
// element to its visible end-state. Keep the selectors in step with the motion
// vocabulary in src/styles/globals.css (PreviewLayout.astro forces the same
// end-states for the same reason).
// =============================================================================
export async function settle(page: Page): Promise<void> {
  // Race the font wait: WebKit can leave fonts.ready pending while heavy
  // resources never finish loading.
  await page.evaluate(() =>
    Promise.race([
      document.fonts.ready.then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(true), 5000)),
    ]),
  );
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none!important;animation:none!important}',
  });
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('.img-curtain').forEach((el) => el.classList.add('is-revealed'));
  });
}
