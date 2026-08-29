// Foundation, edit with care
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { usePresentationNavigate, usePresentationParams } from 'sanity/presentation';
import { Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { LaunchIcon } from '@sanity/icons';
import { SINGLETON_PREVIEW_PATHS } from '../resolve';
import { startNav, stepNav, type PendingNav } from '../../lib/preview-navigation';
import { LiveDraftBridge } from './LiveDraftBridge';

// =============================================================================
// PreviewNavigator - the Squarespace-style page list beside the live preview
// (ported from ncs-astro-sanity-starter 2026-08-28, PORTS.md card 10)
// =============================================================================
// Docked to the left of the Presentation tool (components.unstable_navigator).
// Click a page and the preview jumps there while the edit panel follows
// (Presentation resolves the URL through resolve.mainDocuments).
//
//  - Status dots: amber = published with unpublished edits, hollow = never
//    published. Answers "did my change go live?" at a glance.
//  - A live-page link per published row.
//  - Business info pinned at the bottom.
//
// PER-SITE ADAPTATION (2026-08-28): the starter's copy also lists editor-created
// `page` documents under a "Custom pages" heading and carries a "New page"
// button. This site has no `page` document type: its twelve pages are fixed
// singletons and adding a thirteenth means adding a route in code. So the custom
// group, the create button and the client.listen subscription that kept the
// custom list fresh are all gone, and the list is a static one instead. Restore
// them from the starter on the day a `page` type is introduced here.
// =============================================================================

const APIV = '2026-05-01';

// Pages in the order a visitor meets them. Labels are static; the doc id equals
// the type (the desk structure's singleton convention).
const MAIN_PAGES: { type: string; label: string }[] = [
  { type: 'homePage', label: 'Home' },
  { type: 'howItWorksPage', label: 'How It Works' },
  { type: 'pricingPage', label: 'Pricing' },
  { type: 'aboutPage', label: 'About' },
  { type: 'requestAQuotePage', label: 'Request a Quote' },
  { type: 'shopIndexPage', label: 'Shop by Item' },
  { type: 'styleGalleryPage', label: 'Style Gallery' },
  { type: 'fontGuidePage', label: 'Font & Lettering Guide' },
  { type: 'threadChartPage', label: 'Thread Color Chart' },
  { type: 'clearancePage', label: 'Clearance' },
  { type: 'thankYouPage', label: 'Thank You' },
  { type: 'notFoundPage', label: '404 page' },
];

// Live path per singleton (preview path minus the /preview prefix).
const livePathFor = (type: string) => {
  const href = SINGLETON_PREVIEW_PATHS[type];
  if (!href) return undefined;
  return href === '/preview' ? '/' : href.replace(/^\/preview/, '');
};

interface NavRow {
  id: string;
  type: string;
  label: string;
  href: string;
  liveHref?: string;
  hasDraft: boolean;
  hasPublished: boolean;
}

async function fetchRows(client: ReturnType<typeof useClient>): Promise<NavRow[]> {
  // Raw perspective on purpose: we need BOTH twins for the status dots.
  const docs = await client.fetch<{ _id: string; _type: string }[]>(
    '*[_type in $types]{ _id, _type }',
    { types: MAIN_PAGES.map((p) => p.type) },
  );

  const byType = new Map<string, { draft: boolean; published: boolean }>();
  for (const d of docs) {
    const isDraft = d._id.startsWith('drafts.');
    const prev = byType.get(d._type) ?? { draft: false, published: false };
    byType.set(d._type, {
      draft: prev.draft || isDraft,
      published: prev.published || !isDraft,
    });
  }

  return MAIN_PAGES.map(({ type, label }) => ({
    id: type, // singleton doc id == type
    type,
    label,
    href: SINGLETON_PREVIEW_PATHS[type],
    liveHref: byType.get(type)?.published ? livePathFor(type) : undefined,
    hasDraft: byType.get(type)?.draft ?? false,
    hasPublished: byType.get(type)?.published ?? false,
  }));
}

/** Amber = live page with unpublished edits; hollow = never published. */
function StatusDot({ row }: { row: NavRow }) {
  if (!row.hasDraft) return null;
  const unpublished = !row.hasPublished;
  return (
    <span
      title={unpublished ? 'Not published yet' : 'Has unpublished edits'}
      style={{
        flexShrink: 0,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: unpublished ? 'transparent' : '#B98A3E',
        border: unpublished ? '1.5px solid #9aa4b2' : 'none',
      }}
    />
  );
}

export function PreviewNavigator() {
  const client = useClient({ apiVersion: APIV });
  const navigate = usePresentationNavigate();
  const params = usePresentationParams();
  const [rows, setRows] = useState<NavRow[] | null>(null);

  const refetch = useCallback(() => {
    fetchRows(client)
      .then(setRows)
      .catch(() => setRows([]));
  }, [client]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // params.preview is the iframe's current URL; compare pathnames only.
  const current = (params.preview ?? '').split('?')[0];

  // BOUNCE-AWARE navigation (2026-08-28, editor feedback). Clicking a page took
  // two clicks every time: the panel changed, the iframe did not, the panel
  // bounced back, and the second click worked. The whole rule set, and the host
  // sources it was read out of, live in ../../lib/preview-navigation.ts; this is
  // only the timer and the navigate call. It replaces an earlier sticky retry
  // that re-issued navigate() with the SAME href, which leaves params.preview at
  // the value it already had, so the host's effect never re-ran and nothing was
  // ever posted to the frame.
  //
  // `pending` also drives the row highlight, and because it now survives the
  // bounce the list stays put instead of flickering back and forth.
  const [pending, setPending] = useState<PendingNav | null>(null);
  const go = useCallback(
    (href: string, type: string, id: string) => {
      // The updater form hands over the intent still in flight, if any - a
      // second click inside a second supersedes it, and startNav remembers
      // where it was heading so stepNav can re-issue this click when that
      // predecessor lands (the swallowed-click fix, 2026-08-29).
      setPending((prev) => startNav(href, type, id, current, Date.now(), prev?.href));
      navigate(href, { type, id });
    },
    [navigate, current],
  );
  useEffect(() => {
    if (!pending) return undefined;
    const step = () => {
      const next = stepNav(pending, current, Date.now());
      if (next.action === 'settle') {
        setPending(null);
        return;
      }
      if (next.action === 'retry' && next.pending) {
        setPending(next.pending);
        navigate(next.pending.href, { type: next.pending.type, id: next.pending.id });
        return;
      }
      // Identity is the signal: stepNav hands back the same object when nothing
      // moved, which is what keeps this effect from re-running itself forever.
      if (next.pending !== pending) setPending(next.pending);
    };
    step();
    // The window has to close on its own: params.preview can sit still for the
    // whole of it, and a stale `pending` would pin the row highlight.
    const timer = setInterval(step, 400);
    return () => clearInterval(timer);
  }, [pending, current, navigate]);

  // Which page the preview is showing, as a row. `pending` wins so the answer
  // follows the click rather than the page load, exactly as the highlight does.
  // Only used to mount the live-draft bridge below.
  const currentRow = useMemo(() => {
    if (!rows) return null;
    const href = pending?.href ?? current;
    if (!href) return null;
    return rows.find((r) => r.href === href) ?? rows.find((r) => href.endsWith(r.href)) ?? null;
  }, [rows, pending, current]);

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      {/* KEYSTROKE-INSTANT PREVIEW (2026-08-28). Renders nothing. It lives here
          because this panel is the one place inside Presentation that already
          knows WHICH page the preview is showing, and it is always mounted
          alongside the preview iframe it posts into. See ./LiveDraftBridge.tsx
          for what it sends and src/lib/preview-live-draft.ts for the contract. */}
      {currentRow && (
        <LiveDraftBridge
          key={currentRow.id}
          documentId={currentRow.id}
          documentType={currentRow.type}
        />
      )}
      <Box flex={1} padding={3} style={{ overflowY: 'auto' }}>
        <Stack space={2}>
          <Text size={1} weight="semibold" muted style={{ textTransform: 'uppercase' }}>
            Website pages
          </Text>
          {rows === null ? (
            <Flex align="center" gap={2} padding={2}>
              <Spinner muted />
              <Text size={1} muted>
                Loading
              </Text>
            </Flex>
          ) : (
            <Stack space={1}>
              {rows.map((r) => {
                const active = pending
                  ? pending.href === r.href
                  : current === r.href || (r.href !== '/preview' && current.endsWith(r.href));
                return (
                  <Flex key={r.id} align="center" gap={1}>
                    <Card
                      as="button"
                      flex={1}
                      padding={2}
                      radius={2}
                      tone={active ? 'primary' : 'default'}
                      pressed={active}
                      style={{ cursor: 'pointer', textAlign: 'left', minWidth: 0 }}
                      onClick={() => go(r.href, r.type, r.id)}
                    >
                      <Flex align="center" gap={2}>
                        <Text
                          size={1}
                          weight={active ? 'semibold' : 'regular'}
                          textOverflow="ellipsis"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          {r.label}
                        </Text>
                        <StatusDot row={r} />
                      </Flex>
                    </Card>
                    {r.liveHref && (
                      /* Outside the row button: a button may not nest a link.
                         Opens the REAL page in a new tab. */
                      <Button
                        as="a"
                        href={r.liveHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        mode="bleed"
                        padding={2}
                        icon={LaunchIcon}
                        title={`Open the live page (${r.liveHref})`}
                        aria-label={`Open the live page for ${r.label}`}
                      />
                    )}
                  </Flex>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Box>
      {/* Pinned under the page list so "edit the business details" never needs a
          trip back to the Structure tool. */}
      <Box padding={3} style={{ borderTop: '1px solid var(--card-border-color, #e2e8f0)' }}>
        <Card
          as="button"
          padding={2}
          radius={2}
          style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
          onClick={() =>
            navigate(current || '/preview', { type: 'siteSettings', id: 'siteSettings' })
          }
        >
          <Text size={1}>Business info & contact</Text>
        </Card>
      </Box>
    </Flex>
  );
}
