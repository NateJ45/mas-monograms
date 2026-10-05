import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, Flex, Heading, Stack, Text } from '@sanity/ui';
import { HEADING_STACK, HEIRLOOM } from '../theme';

// =============================================================================
// StudioTour: the first-visit welcome
// =============================================================================
// Ported from stonesteps-50k (PORTS.md card 31) on 2026-10-05. A stepped dialog
// that greets Mary Ann the FIRST time this browser opens the Studio, then never
// again (the Welcome pane has a "Show me the tour again" button).
//
// WHY IT EXISTS ALONGSIDE THE WELCOME PANE. The Welcome pane has to be found;
// this arrives. The five steps are the five facts that decide whether an
// editor feels safe: nothing is public until Publish, Publish takes a couple of
// minutes to show, you can edit on the page itself, where help lives, and that
// a mistake can be undone.
//
// It rides StudioLayout, so it needs no Sanity feature beyond a custom layout.
// Nothing here writes anything: Escape, the close button and the last step all
// close it for good, on this device only.
//
// BUMP SEEN_KEY when the steps change enough that she should see them again.
// Do not bump it for a typo fix.
// =============================================================================

export const SEEN_KEY = 'mas-studio-tour-v1';

/** The Welcome pane dispatches this to replay the tour on demand. */
export const OPEN_EVENT = 'mas-studio-tour-open';

interface Step {
  emoji: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: Step[] = [
  {
    emoji: '🔒',
    title: 'Your changes are private until you press Publish',
    body: 'This is where you change the words, photos and prices on your website. Nothing you do here reaches your website until you press the Publish button, so it is safe to look around and click things.',
  },
  {
    emoji: '⏳',
    title: 'After Publish, wait 2 to 3 minutes',
    body: 'Publish puts your change on your website. The website rebuilds itself after each Publish, so wait two or three minutes and then refresh your website to see it. It is normal for it not to appear the same second.',
  },
  {
    emoji: '🖱️',
    title: 'You can change the words right on the page',
    body: 'Click "Edit on the page" in the bar at the top. Your website appears; click any words on it and a small box opens where you can type. You see your change there before anyone else does.',
  },
  {
    emoji: '❔',
    title: 'Help is always on the left',
    body: '"Help (how do I...?)" is in the menu on the left. The Welcome page also has big buttons for the jobs you do most: adding a photo, marking an item sold, changing a price.',
  },
  {
    emoji: '↩️',
    title: 'You can always undo',
    body: 'Changed something by mistake? Click the button with three dots beside the Publish button and choose "Undo last change". Until you press Publish, nothing you change is on your website anyway.',
  },
];

export function StudioTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // First visit on this device only. A private window or blocked storage
    // means the tour shows again, which is a much better failure than throwing.
    try {
      if (!localStorage.getItem(SEEN_KEY)) setOpen(true);
    } catch {
      /* storage unavailable: leave the tour closed rather than nag */
    }
  }, []);

  useEffect(() => {
    const replay = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, replay);
    return () => window.removeEventListener(OPEN_EVENT, replay);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* nothing to remember it with; the tour will greet her again */
    }
  }, []);

  if (!open) return null;
  const current = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;

  return (
    <Dialog
      id="studio-tour"
      header="Welcome to your website's editor"
      width={1}
      onClose={close}
      footer={
        <Box padding={3}>
          <Flex align="center" gap={3}>
            <Text size={2} muted style={{ flex: 1 }}>
              Step {step + 1} of {TOUR_STEPS.length}
            </Text>
            {step > 0 && (
              <Button
                text="Back"
                mode="ghost"
                fontSize={2}
                padding={4}
                onClick={() => setStep((s) => s - 1)}
              />
            )}
            <Button
              text={last ? 'Got it, let me start' : 'Next'}
              tone="primary"
              fontSize={2}
              padding={4}
              onClick={() => (last ? close() : setStep((s) => s + 1))}
            />
          </Flex>
        </Box>
      }
    >
      <Box padding={5}>
        <Stack space={5}>
          <Flex align="center" gap={3}>
            <span
              aria-hidden
              style={{
                background: HEIRLOOM.linen,
                boxShadow: `inset 0 0 0 1.5px ${HEIRLOOM.claret}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 52,
                borderRadius: 14,
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {current.emoji}
            </span>
            <Heading size={3} style={{ fontFamily: HEADING_STACK, color: HEIRLOOM.ink }}>
              {current.title}
            </Heading>
          </Flex>
          <Text size={3} style={{ lineHeight: 1.6 }}>
            {current.body}
          </Text>
          <Card padding={3} radius={2} tone="transparent">
            <Text size={2} muted>
              You can close this at any time. To see it again, use the button at the bottom of the
              Welcome page.
            </Text>
          </Card>
        </Stack>
      </Box>
    </Dialog>
  );
}
