// Foundation, edit with care
// =============================================================================
// Move to Trash / Bring it back / Delete forever (2026-10-05, Phase D)
// =============================================================================
// Ported from ReidDesignAstro/reid-design-site src/sanity/actions/archive.tsx.
// Sanity's own Delete is immediate and permanent, and the only undo is a dataset
// restore (MAS has no nightly backup). For everyday content Mary Ann's Delete
// becomes "Move to Trash": the item is copied into a `trashedItem` and removed,
// and "Trash (bring things back)" on the desk can put it back with one click.
// Only "Delete forever", INSIDE the Trash and behind two questions, is final.
//
// Wiring: src/sanity/editorActions.ts (ARCHIVABLE_TYPES lose the stock Delete
// and get MoveToTrashAction; a trashedItem gets only Restore + Delete forever).
// The pure rules (what is copied, how it comes back) are in ../lib/trash.ts.
//
// MAS CHANGES FROM REID, all for safety:
//   - ONE TRANSACTION each way. Moving writes the Trash copy and deletes the
//     original together; restoring writes the original back and removes the
//     Trash copy together. Either all of it happens or none of it, so there is
//     never a Trash row for something still on the site, or a restored item
//     still sitting in the Trash.
//   - Restore uses `create`, not `createOrReplace`, so it can never overwrite a
//     document that has appeared under the same id since.
//   - Dialogs, not window.alert, in her words.
// =============================================================================

import { useState } from 'react';
import { useClient } from 'sanity';
import type { DocumentActionComponent, DocumentActionProps } from 'sanity';
import { useToast } from '@sanity/ui';
import { RestoreIcon, TrashIcon } from '@sanity/icons';
import {
  REFERRERS_QUERY,
  buildTrashRecord,
  parseTrashPayload,
  publishedId,
  referrersMessage,
  restoreDocs,
} from '../lib/trash';

const API_VERSION = '2026-05-01';

export const TRASH_CONFIRM =
  'Move this to Trash? It comes off your website, and you can bring it back from Trash if you change your mind.';
export const TRASH_DONE =
  'It comes off your website in about 2 to 3 minutes. To bring it back, open "Trash (bring things back)" in the menu.';

type Stage = 'idle' | 'confirm' | 'blocked' | 'busy';

export const MoveToTrashAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, draft, published, onComplete } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const [stage, setStage] = useState<Stage>('idle');
  const [blockedBy, setBlockedBy] = useState('');

  const close = () => setStage('idle');
  const hasSomething = Boolean(draft || published);

  const moveIt = async () => {
    setStage('busy');
    const pub = publishedId(id);
    try {
      const record = buildTrashRecord(type, pub, published, draft, new Date().toISOString());
      await client
        .transaction()
        .create(record as { _type: string })
        .delete(pub)
        .delete(`drafts.${pub}`)
        .commit();
      toast.push({
        status: 'success',
        title: 'Moved to Trash',
        description: TRASH_DONE,
        duration: 12000,
        closable: true,
      });
      onComplete();
    } catch (err) {
      toast.push({
        status: 'error',
        title: 'It could not be moved to Trash',
        description: `Nothing was changed. Please try again, or ask Nathan. (${err instanceof Error ? err.message : String(err)})`,
        closable: true,
      });
    } finally {
      setStage('idle');
    }
  };

  return {
    label: stage === 'busy' ? 'Moving to Trash...' : 'Move to Trash',
    icon: TrashIcon,
    tone: 'critical',
    disabled: stage === 'busy' || !hasSomething,
    onHandle: async () => {
      // Check first whether anything still uses it: removing a font a photo
      // names would leave that photo pointing at nothing.
      setStage('busy');
      try {
        const pub = publishedId(id);
        const rows = await client.fetch(REFERRERS_QUERY, { id: pub, draftId: `drafts.${pub}` });
        const message = referrersMessage(Array.isArray(rows) ? rows : []);
        if (message) {
          setBlockedBy(message);
          setStage('blocked');
          return;
        }
      } catch {
        // If the check itself fails, the transaction below still refuses to
        // delete anything another item points at, so it is safe to go on.
      }
      setStage('confirm');
    },
    dialog:
      stage === 'confirm'
        ? {
            type: 'confirm',
            tone: 'critical',
            message: TRASH_CONFIRM,
            confirmButtonText: 'Yes, move it to Trash',
            cancelButtonText: 'No, keep it',
            onCancel: close,
            onConfirm: () => void moveIt(),
          }
        : stage === 'blocked'
          ? {
              type: 'dialog',
              header: 'This cannot go in the Trash yet',
              content: (
                <p style={{ fontSize: '1.0625rem', lineHeight: 1.6, margin: 0 }}>{blockedBy}</p>
              ),
              onClose: close,
            }
          : null,
  };
};

export const RestoreAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { draft, published, onComplete } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const doc = (draft || published) as Record<string, any> | null;

  return {
    label: busy ? 'Bringing it back...' : 'Bring it back',
    icon: RestoreIcon,
    tone: 'primary',
    disabled: busy || !doc?.payload || !doc?.originalId,
    onHandle: async () => {
      if (!doc?.payload || !doc?.originalId) return;
      setBusy(true);
      try {
        const docs = restoreDocs(parseTrashPayload(doc.payload, doc.originalId));
        let tx = client.transaction();
        // `create` refuses if the id is taken, so a restore can never
        // overwrite anything. Then the Trash copy goes, in the same step.
        for (const d of docs) tx = tx.create(d as { _type: string });
        await tx
          .delete(publishedId(doc._id))
          .delete(`drafts.${publishedId(doc._id)}`)
          .commit();
        toast.push({
          status: 'success',
          title: 'It is back',
          description:
            doc.wasPublished === false
              ? 'It is back where it was. It was never on your website, so it still needs Publish.'
              : 'It is back where it was, and it will be on your website again in about 2 to 3 minutes.',
          duration: 12000,
          closable: true,
        });
        onComplete();
      } catch (err) {
        toast.push({
          status: 'error',
          title: 'It could not be brought back',
          description: `Nothing was changed. Please ask Nathan. (${err instanceof Error ? err.message : String(err)})`,
          closable: true,
        });
      } finally {
        setBusy(false);
      }
    },
  };
};

type ForeverStage = 'idle' | 'first' | 'second' | 'busy';

export const DeleteForeverAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, onComplete } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const [stage, setStage] = useState<ForeverStage>('idle');
  const close = () => setStage('idle');

  return {
    label: stage === 'busy' ? 'Deleting...' : 'Delete forever',
    icon: TrashIcon,
    tone: 'critical',
    disabled: stage === 'busy',
    onHandle: () => setStage('first'),
    dialog:
      stage === 'first'
        ? {
            type: 'confirm',
            tone: 'critical',
            message:
              'Delete this forever? After this it cannot be brought back, not even by Nathan.',
            confirmButtonText: 'Yes, delete it forever',
            cancelButtonText: 'No, keep it in the Trash',
            onCancel: close,
            onConfirm: () => setStage('second'),
          }
        : stage === 'second'
          ? {
              type: 'confirm',
              tone: 'critical',
              message: 'Are you sure? This is the last question. It will be gone for good.',
              confirmButtonText: 'Delete it forever',
              cancelButtonText: 'Keep it',
              onCancel: close,
              onConfirm: async () => {
                setStage('busy');
                try {
                  const pub = publishedId(id);
                  await client.transaction().delete(pub).delete(`drafts.${pub}`).commit();
                  onComplete();
                } catch (err) {
                  toast.push({
                    status: 'error',
                    title: 'It could not be deleted',
                    description: err instanceof Error ? err.message : String(err),
                    closable: true,
                  });
                } finally {
                  setStage('idle');
                }
              },
            }
          : null,
  };
};
