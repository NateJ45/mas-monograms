// Unit tests for src/lib/review-link.ts: draw nothing unless the address is real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reviewLink, REVIEW_LABEL_FALLBACK } from './review-link.ts';

test('no review address, no link', () => {
  for (const googleReviewUrl of [undefined, null, '', '   ']) {
    assert.equal(reviewLink({ googleReviewUrl, reviewLinkLabel: 'Leave me a review' }), null);
  }
  assert.equal(reviewLink(null), null);
  assert.equal(reviewLink(undefined), null);
});

test('only real https addresses are drawn', () => {
  for (const bad of ['g.page/r/abc', 'http://g.page/r/abc', 'javascript:alert(1)', 'https://g']) {
    assert.equal(reviewLink({ googleReviewUrl: bad }), null, bad);
  }
  assert.deepEqual(reviewLink({ googleReviewUrl: ' https://g.page/r/abc/review ' }), {
    href: 'https://g.page/r/abc/review',
    label: REVIEW_LABEL_FALLBACK,
  });
});

test('her words win; empty words fall back', () => {
  const url = 'https://g.page/r/abc/review';
  assert.equal(
    reviewLink({ googleReviewUrl: url, reviewLinkLabel: 'Leave me a review' })?.label,
    'Leave me a review',
  );
  assert.equal(
    reviewLink({ googleReviewUrl: url, reviewLinkLabel: '  ' })?.label,
    'Leave a review',
  );
});
