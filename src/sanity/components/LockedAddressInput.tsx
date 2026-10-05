// Foundation, edit with care
// =============================================================================
// LockedAddressInput: a page's web address, locked once it is on the website
// (2026-10-05, Phase D: "safe rename" for shop categories and legal pages)
// =============================================================================
// THE CHOICE (spec Phase D asked for "safe rename (redirects) for category
// addresses"). Two ways to keep old links working when an address changes:
//   1. fbcm's PORTABLE slugRedirect: wrap Publish, file a `redirect` document
//      old -> new, and have the build turn those into redirects.
//   2. Lock the address once the page has been published, with a plain note to
//      ask Nathan.
// This is 2, on purpose. A shop category IS a page (adding or removing one is
// already a "check with Nathan" job), she has never needed to rename one, and
// option 1 adds three moving parts she cannot see or fix (a redirect list, a
// build-time reader feeding Cloudflare, the Publish wrapper) to protect against
// a change she should not be making alone. A locked box cannot break a link,
// a Google result or a printed QR code. If an address ever must change, Nathan
// changes it with a script and adds the old one to public/_redirects by hand
// (see docs/PENDING.md and .claude/rules/sanity-studio.md).
//
// HOW. Until the page has a published copy, the normal box with its Generate
// button shows (a new category needs one). Once there is a published address,
// the box is replaced by the address in large type and the note. The check is
// the PUBLISHED copy (useEditState), not the box's own value, so pressing
// Generate on a new page does not lock it before it is ever published.
// =============================================================================

import type { ObjectInputProps } from 'sanity';
import { useEditState, useFormValue } from 'sanity';
import { Card, Stack, Text } from '@sanity/ui';
import { LockIcon } from '@sanity/icons';
import { pathForDoc } from '../urls';

export const LOCKED_NOTE =
  'This is the address of this page on your website. It is locked so that old links, Google and anything you have printed keep working. Ask Nathan to change this: it changes the page address.';

export function LockedAddressInput(props: ObjectInputProps) {
  const id = (useFormValue(['_id']) as string | undefined) ?? '';
  const type = (useFormValue(['_type']) as string | undefined) ?? '';
  const publishedId = id.replace(/^drafts\./, '');
  const { published } = useEditState(publishedId, type);
  const publishedSlug = (published as { slug?: { current?: string } } | null)?.slug?.current;

  if (!publishedSlug) return props.renderDefault(props);

  const current = (props.value as { current?: string } | undefined)?.current;
  const address = `mas-monograms.com${pathForDoc(type, { slug: { current: publishedSlug } }) ?? ''}`;

  return (
    <Card padding={4} radius={3} border tone="transparent">
      <Stack space={4}>
        <Text size={3} weight="semibold">
          <LockIcon style={{ marginRight: 8 }} />
          {address}
        </Text>
        <Text size={2} style={{ lineHeight: 1.6 }}>
          {LOCKED_NOTE}
        </Text>
        {current && current !== publishedSlug && (
          <Card padding={3} radius={2} tone="caution">
            <Text size={2} style={{ lineHeight: 1.6 }}>
              Your unpublished changes give this page a different address. Please ask Nathan before
              you press Publish.
            </Text>
          </Card>
        )}
      </Stack>
    </Card>
  );
}
