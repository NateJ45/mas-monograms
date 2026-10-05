import { useEffect, useRef } from 'react';
import type { DocumentActionComponent, DocumentActionProps } from 'sanity';
import { useToast } from '@sanity/ui';

// =============================================================================
// publishNote: "Published. It will be on your website in about 2 to 3 minutes."
// =============================================================================
// Added 2026-10-05 (Phase A of docs/superpowers/specs/2026-10-05-studio-direction.md).
// Since the 2026-10-05 deploy hook, a Publish rebuilds the live site and the
// change appears about 2 to 3 minutes later. Without a word from the Studio,
// "I pressed Publish and nothing changed" is the obvious conclusion. This
// wraps the stock Publish action and, once the publish has actually landed,
// says so in a toast she can read at her own pace.
//
// NO BEHAVIOUR CHANGE. The wrapped action's label, shortcut, disabled state and
// onHandle are passed through untouched; the only addition is the toast.
//
// HOW "LANDED" IS DETECTED. The stock action's onHandle starts the publish and
// returns at once; the work finishes later. So the click only arms a flag, and
// an effect watches for the moment the draft has gone and the published copy
// carries a new revision, which is exactly what a finished publish looks like.
// A publish that fails leaves the draft in place, so the toast never lies.
// =============================================================================

export const PUBLISHED_TITLE = 'Published';
export const PUBLISHED_NOTE =
  'Your change will be on your website in about 2 to 3 minutes. Refresh your website after that to see it.';

const wrapped = new WeakMap<DocumentActionComponent, DocumentActionComponent>();

export function withPublishNote(publishAction: DocumentActionComponent): DocumentActionComponent {
  const cached = wrapped.get(publishAction);
  if (cached) return cached;

  const Wrapped: DocumentActionComponent = (props: DocumentActionProps) => {
    // Hooks first and unconditionally: the early return below must not change
    // how many hooks this component calls.
    const toast = useToast();
    const armed = useRef<string | null>(null);
    const original = publishAction(props);
    const draftRev = props.draft?._rev ?? null;
    const publishedRev = props.published?._rev ?? null;

    useEffect(() => {
      if (armed.current === null) return;
      // Finished: no draft left, and the published copy has moved on.
      if (!draftRev && publishedRev && publishedRev !== armed.current) {
        armed.current = null;
        toast.push({
          status: 'success',
          title: PUBLISHED_TITLE,
          description: PUBLISHED_NOTE,
          duration: 12000,
          closable: true,
        });
      }
    }, [draftRev, publishedRev, toast]);

    if (!original) return original;
    return {
      ...original,
      onHandle: () => {
        // Remember the published revision we started from ('' for a page that
        // has never been published), so the effect can tell when it changes.
        armed.current = publishedRev ?? '';
        original.onHandle?.();
      },
    };
  };
  // Keep the stock identity, so anything filtering on `action === 'publish'`
  // (the singleton rules in sanity.config.ts) still sees a publish action.
  Wrapped.action = publishAction.action;
  Wrapped.displayName = 'PublishWithNote';
  wrapped.set(publishAction, Wrapped);
  return Wrapped;
}
