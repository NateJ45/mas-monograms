import { Box, Button, Card, Flex, Grid, Stack, Text } from '@sanity/ui';
import { ToolHeading } from './ToolHeading';
import { useStudioLink } from './studioLink';
import { OPEN_EVENT } from './StudioTour';
import { WELCOME_TASKS, type WelcomeTask } from '../welcomeTasks';
import { HEIRLOOM } from '../theme';

// =============================================================================
// WelcomePane: the first thing Mary Ann sees
// =============================================================================
// Ported from stonesteps-50k (PORTS.md card 40) on 2026-10-05 and made larger
// for her: a calm hello, the one sentence that makes the Studio feel safe, and
// big task cards that go straight to the exact form or list for each job she
// actually does, instead of a menu she has to decode. The cards are data in
// ../welcomeTasks.ts (unit-tested against the desk ids, so a renamed pane
// cannot turn a card into a dead link).
//
// The desk opens here on its own: StudioLayout sends an empty desk to this pane
// (see shouldOpenWelcome in ../studioTargets.ts).
//
// Cards: at least 72px tall, 18px+ text, a big emoji, one column on a narrow
// window and two on a wide one.
// =============================================================================

function TaskCard({ task }: { task: WelcomeTask }) {
  const linkTo = useStudioLink();
  const link = linkTo(task.target);
  return (
    <Card
      as="a"
      padding={4}
      radius={3}
      border
      href={link.href}
      onClick={link.onClick}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        minHeight: 88,
        background: HEIRLOOM.paper,
      }}
    >
      <Flex align="center" gap={4} style={{ minHeight: 56 }}>
        <span
          aria-hidden
          style={{
            background: HEIRLOOM.linen,
            boxShadow: `inset 0 0 0 1.5px ${HEIRLOOM.claret}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            fontSize: 30,
            flexShrink: 0,
          }}
        >
          {task.emoji}
        </span>
        <Stack space={3} style={{ flex: 1 }}>
          <Text size={3} weight="semibold" style={{ color: HEIRLOOM.ink }}>
            {task.title}
          </Text>
          <Text size={2} muted style={{ lineHeight: 1.5 }}>
            {task.blurb}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}

export function WelcomePane() {
  return (
    <Box padding={[4, 4, 5]}>
      <Stack space={5} style={{ maxWidth: 960, margin: '0 auto' }}>
        <Stack space={4}>
          <ToolHeading emoji="🧵">Hello, Mary Ann</ToolHeading>
          <Text size={3} style={{ lineHeight: 1.6 }}>
            This is where you change the words, photos and prices on your website.
          </Text>
          <Card padding={4} radius={3} tone="positive" border>
            <Text size={3} weight="semibold" style={{ lineHeight: 1.5 }}>
              Nothing you do here reaches your website until you press Publish, so it is safe to
              look around.
            </Text>
            <Box marginTop={3}>
              <Text size={2} style={{ lineHeight: 1.5 }}>
                After you press Publish, your change shows on your website in about 2 to 3 minutes.
              </Text>
            </Box>
          </Card>
        </Stack>

        <Stack space={3}>
          <Text size={3} weight="semibold">
            What would you like to do?
          </Text>
          <Grid columns={[1, 1, 2]} gap={3}>
            {WELCOME_TASKS.map((t) => (
              <TaskCard key={t.title} task={t} />
            ))}
          </Grid>
        </Stack>

        {/* The tour greets her once per browser and then never again, so this
            is the only way back to it. */}
        <Flex>
          <Button
            text="Show me the tour again"
            mode="ghost"
            fontSize={3}
            padding={4}
            onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
          />
        </Flex>
      </Stack>
    </Box>
  );
}
