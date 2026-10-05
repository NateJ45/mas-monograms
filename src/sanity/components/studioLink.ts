import { useWorkspace } from 'sanity';
import { useRouter } from 'sanity/router';
import { studioTargetPath, type StudioTarget } from '../studioTargets';

// =============================================================================
// studioLink: turn "the Home page" into something a card can navigate to
// =============================================================================
// Ported from stonesteps-50k (PORTS.md card 40) on 2026-10-05. Shared by the
// Welcome pane and the help pane, so they deep-link the same way and only one
// of them can be wrong. The path itself is built by studioTargetPath() in
// ../studioTargets.ts, which is plain data and unit-tested.
//
// THE ROUTING RULE, which cost WCP a real bug: the deployed embedded Studio is
// HASH-routed. A plain <a href="/studio/structure/..."> leaves the Studio and
// 404s, so the click has to go through the router. The href is still built as a
// best-effort real URL, so middle-click and open-in-new-tab keep working.
// =============================================================================

export type { StudioTarget } from '../studioTargets';

export function useStudioLink() {
  const router = useRouter();
  const { basePath } = useWorkspace();

  return function linkTo(target: StudioTarget) {
    const path = studioTargetPath(basePath, target);
    const isHashRouted = typeof window !== 'undefined' && window.location.hash.startsWith('#/');
    const href = isHashRouted ? `${window.location.pathname}#${path}` : path;
    return {
      href,
      onClick: (event: { preventDefault: () => void; metaKey?: boolean; ctrlKey?: boolean }) => {
        // Let the browser handle a deliberate new-tab click.
        if (event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        router.navigateUrl({ path });
      },
    };
  };
}
