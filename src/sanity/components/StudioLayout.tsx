import { useEffect } from 'react';
import { useWorkspace, type LayoutProps } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import { StudioTour } from './StudioTour';
import { DESK, shouldOpenWelcome, studioTargetPath } from '../studioTargets';

// =============================================================================
// StudioLayout: the three things Sanity has no setting for
// =============================================================================
// Ported from stonesteps-50k (PORTS.md card 31) on 2026-10-05 and given two
// more jobs for Mary Ann. Registered as `studio.components.layout` in
// sanity.config.ts.
//
//   1. THE TOUR. Sanity gives no "run something once when the Studio opens"
//      hook, so the first-visit tour rides the layout: it renders after the
//      default chrome, so its dialog stacks above everything.
//
//   2. OPEN ON WELCOME. The desk used to open on a menu and a blank pane. An
//      empty desk (no pane open, no edit link being resolved) is sent to the
//      Welcome pane, replacing the history entry so Back still works. This is
//      also what happens when she clicks "Edit my content" in the top bar, so
//      Welcome is always one click away. Checked against sanity 6.9.1's router
//      (see shouldOpenWelcome in ../studioTargets.ts).
//
//   3. NO "DRAFTS" MENU. `releases: { enabled: false }` removes the Releases
//      tool, but sanity 6.9.1 still draws the perspective picker (the "Drafts"
//      menu in the top bar: StudioNavbar renders ReleasesNav unless beta
//      variants are on, and ReleasesNav only hides its Releases link). With
//      releases off it can only switch her view to "Published", which hides
//      her own unpublished changes and looks like lost work. One CSS rule
//      takes it away. If a Sanity upgrade changes the `data-ui` name, the menu
//      simply comes back; nothing breaks.
// =============================================================================

const HIDE_PERSPECTIVE_MENU = '[data-ui="ReleasesNav"] { display: none !important; }';

function OpenOnWelcome() {
  const state = useRouterState();
  const router = useRouter();
  const { basePath } = useWorkspace();

  useEffect(() => {
    if (!shouldOpenWelcome(state)) return;
    router.navigateUrl({
      path: studioTargetPath(basePath, { pane: DESK.welcome }),
      replace: true,
    });
  }, [state, router, basePath]);

  return null;
}

export function StudioLayout(props: LayoutProps) {
  return (
    <>
      <style>{HIDE_PERSPECTIVE_MENU}</style>
      {props.renderDefault(props)}
      <OpenOnWelcome />
      <StudioTour />
    </>
  );
}
