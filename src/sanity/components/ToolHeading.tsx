import type { ReactNode } from 'react';
import { Flex, Heading } from '@sanity/ui';
import { HEADING_STACK, HEIRLOOM } from '../theme';

// =============================================================================
// ToolHeading: the ONE header for the custom Studio panes
// =============================================================================
// Ported from stonesteps-50k (PORTS.md card 32) on 2026-10-05. Every custom
// pane (Welcome, Help) opens the same way, so they read as a family and a
// future pane gets the look for free. MAS has no square mark small enough to
// sit at 48px, so the chip carries the pane's own emoji on Linen with a Claret
// ring, the site's own pairing. The heading is the one place the Studio uses a
// serif (the spec's "brand serif only for pane headings"); everything else is
// the system sans for readability.
// =============================================================================

export function ToolHeading({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <Flex align="center" gap={3}>
      <span
        aria-hidden
        style={{
          background: HEIRLOOM.linen,
          boxShadow: `inset 0 0 0 1.5px ${HEIRLOOM.claret}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: 14,
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {emoji}
      </span>
      <Heading as="h1" size={4} style={{ fontFamily: HEADING_STACK, color: HEIRLOOM.ink }}>
        {children}
      </Heading>
    </Flex>
  );
}
