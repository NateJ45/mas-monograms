// Foundation, edit with care
// =============================================================================
// "Copy a link so someone can see this before it is on your website"
// (2026-10-05, Phase D; PORTS.md card 19, Reid's shareWhenPreviewable)
// =============================================================================
// The mechanism is the PORTABLE components/shareDraftLink.tsx, unchanged: the
// Studio mints a one-time preview secret (@sanity/preview-url-secret, the same
// call the "Edit on the page" tool makes) and the link opens
//   /api/draft-mode/enable?sanity-preview-secret=...&sanity-preview-pathname=/preview/...
// which shows the page with her unpublished changes, no login needed.
//
// WHY A MAS WRAPPER AND NOT THE PORTABLE ACTION ITSELF. The canonical action's
// label and toasts say "Copy share link", "the current draft" and "a Sanity
// login": words the spec says she must never read. The canonical file stays
// byte-identical (sync-check), and its pure helpers (previewPathFor, the TTL)
// are used here; only the words and two guards are MAS's:
//   - shown only when the preview route can draw the page (../lib/previewable,
//     Reid's shareWhenPreviewable rule: a link to a page it cannot draw opens an
//     error), so Site settings, legal pages and the help pages get no button;
//   - on http (her Studio on a test copy) it says the link only works from her
//     real website address instead of handing over a link that fails: the
//     preview cookie is `secure`, so a browser drops it over plain http.
//
// THE LINK EXPIRES AFTER ONE HOUR and cannot be extended (SECRET_TTL is fixed in
// @sanity/preview-url-secret); the toast says so. Pressing again makes a new one.
// =============================================================================

import { useCallback, useState } from 'react';
import { useClient, type DocumentActionComponent, type DocumentActionDescription } from 'sanity';
import { useToast } from '@sanity/ui';
import { ShareIcon } from '@sanity/icons';
import { createPreviewSecret } from '@sanity/preview-url-secret/create-secret';
import {
  urlSearchParamPreviewPathname,
  urlSearchParamPreviewSecret,
} from '@sanity/preview-url-secret/constants';
import { previewPathFor } from '../components/shareDraftLink';
import {
  SHARE_COPIED,
  SHARE_COPIED_TITLE,
  SHARE_LABEL,
  SHARE_LOCAL_ONLY,
  canPreviewPath,
  shareLinksWorkHere,
} from '../lib/previewable';

/** The API version @sanity/preview-url-secret uses (as in shareDraftLink.tsx). */
const SECRET_API_VERSION = '2025-02-19';

export const ShareLinkAction: DocumentActionComponent = (props) => {
  // Hooks first and unconditionally (rules of hooks: a category gaining a web
  // address mid-edit flips the answer below without a remount).
  const client = useClient({ apiVersion: SECRET_API_VERSION });
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const pathname = previewPathFor(props.type, props.draft ?? props.published);

  const share = useCallback(async () => {
    if (!pathname) return;
    if (!shareLinksWorkHere(window.location.protocol)) {
      toast.push({
        status: 'info',
        title: 'This link would not work from here',
        description: SHARE_LOCAL_ONLY,
        duration: 12000,
        closable: true,
      });
      return;
    }
    setBusy(true);
    try {
      const { secret } = await createPreviewSecret(
        client,
        'share-link',
        `${window.location.origin}/studio`,
      );
      const url = new URL('/api/draft-mode/enable', window.location.origin);
      url.searchParams.set(urlSearchParamPreviewSecret, secret);
      url.searchParams.set(urlSearchParamPreviewPathname, pathname);
      const link = url.toString();
      try {
        await navigator.clipboard.writeText(link);
        toast.push({
          status: 'success',
          title: SHARE_COPIED_TITLE,
          description: SHARE_COPIED,
          duration: 15000,
          closable: true,
        });
      } catch {
        // The browser can refuse the copy; show the link so it is not lost.
        toast.push({
          status: 'warning',
          title: 'Please copy this link yourself',
          description: `Select it and copy it: ${link}`,
          duration: 60000,
          closable: true,
        });
      }
    } catch (err) {
      toast.push({
        status: 'error',
        title: 'The link could not be made',
        description: `Please try again in a minute, or ask Nathan. (${err instanceof Error ? err.message : String(err)})`,
        closable: true,
      });
    } finally {
      setBusy(false);
    }
  }, [client, pathname, toast]);

  if (!canPreviewPath(pathname)) return null;

  return {
    label: busy ? 'Making the link...' : SHARE_LABEL,
    icon: ShareIcon,
    disabled: busy,
    title: 'The person does not need to sign in. The link stops working after about an hour.',
    onHandle: () => {
      void share();
      props.onComplete?.();
    },
  } satisfies DocumentActionDescription;
};
