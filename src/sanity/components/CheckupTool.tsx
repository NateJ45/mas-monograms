import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { Badge, Box, Button, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { ToolHeading } from './ToolHeading';
import { useStudioLink } from './studioLink';
import { HEIRLOOM } from '../theme';
import { isAllClear, runChecks, type CheckResult, type Severity } from '../../lib/studio-checkup';

// =============================================================================
// CheckupTool: "What needs attention", in plain words (2026-10-05, Phase B)
// =============================================================================
// Ported from stonesteps-50k's CheckupTool. READ-ONLY: it runs the checks in
// src/lib/studio-checkup.ts (queries + pure, unit-tested logic) and points; it
// never changes anything. Each card has one plain sentence and a "Take me
// there" button that goes through the router (useStudioLink), because the
// embedded Studio is hash-routed.
//
// Registered twice, on purpose: as a top-bar tool (sanity.config.ts, name
// 'checkup') and as a desk item (structure.ts, DESK.checkup), so the Welcome
// card can open it inside "Edit my content" where she already is.
// =============================================================================

const TONE: Record<Severity, 'critical' | 'caution' | 'primary'> = {
  'Needs doing': 'critical',
  'Worth a look': 'caution',
  'For information': 'primary',
};

function ResultCard({ r }: { r: CheckResult }) {
  const linkTo = useStudioLink();
  const link = r.target ? linkTo(r.target) : null;
  return (
    <Card padding={4} radius={3} border tone={TONE[r.severity]}>
      <Stack space={4}>
        <Flex align="center" gap={3} wrap="wrap">
          <Badge tone={TONE[r.severity]} padding={2} fontSize={2}>
            {r.severity}
          </Badge>
          <Text size={3} weight="semibold">
            {r.label}
          </Text>
        </Flex>
        <Text size={2} style={{ lineHeight: 1.6 }}>
          {r.detail}
        </Text>
        {link && (
          <Flex>
            <Button
              as="a"
              href={link.href}
              onClick={link.onClick}
              text={`${r.targetLabel ?? 'Take me there'} →`}
              tone="primary"
              mode="ghost"
              fontSize={2}
              padding={4}
            />
          </Flex>
        )}
      </Stack>
    </Card>
  );
}

export function CheckupTool() {
  const client = useClient({ apiVersion: '2026-05-01' });
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [busy, setBusy] = useState(false);

  const runAll = useCallback(async () => {
    setBusy(true);
    try {
      setResults(await runChecks((q, p) => client.fetch(q, p ?? {})));
    } finally {
      setBusy(false);
    }
  }, [client]);

  useEffect(() => {
    // Start after the effect body (no setState inside the effect itself), and
    // drop it if the pane closes first.
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void runAll();
    });
    return () => {
      cancelled = true;
    };
  }, [runAll]);

  const todo = (results ?? []).filter((r) => r.severity !== 'For information');
  const info = (results ?? []).filter((r) => r.severity === 'For information');

  return (
    <Box padding={[4, 4, 5]}>
      <Stack space={5} style={{ maxWidth: 760, margin: '0 auto' }}>
        <Stack space={4}>
          <ToolHeading emoji="🩺">What needs attention</ToolHeading>
          <Text size={3} style={{ lineHeight: 1.6 }}>
            A quick look over your website for things worth fixing, such as a photo with no
            description or a Buy button with no Stripe link. Nothing is changed here. It only points
            the way.
          </Text>
        </Stack>

        <Flex>
          <Button
            text={busy ? 'Checking...' : 'Check again'}
            mode="ghost"
            fontSize={3}
            padding={4}
            disabled={busy}
            onClick={() => void runAll()}
          />
        </Flex>

        {results === null ? (
          <Flex align="center" gap={3}>
            <Spinner muted />
            <Text size={2} muted>
              Checking...
            </Text>
          </Flex>
        ) : (
          <Stack space={3}>
            {isAllClear(results) && (
              <Card padding={4} radius={3} tone="positive" border>
                <Flex align="center" gap={3} wrap="wrap">
                  <Badge tone="positive" padding={2} fontSize={2}>
                    All clear
                  </Badge>
                  <Text size={3}>Nothing needs fixing right now.</Text>
                </Flex>
              </Card>
            )}
            {todo.map((r) => (
              <ResultCard key={r.id} r={r} />
            ))}
            {info.length > 0 && (
              <Box paddingTop={3}>
                <Text size={2} weight="semibold" style={{ color: HEIRLOOM.ink }}>
                  Good to know
                </Text>
              </Box>
            )}
            {info.map((r) => (
              <ResultCard key={r.id} r={r} />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
