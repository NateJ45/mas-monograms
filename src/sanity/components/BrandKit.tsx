// BrandKit.tsx — Panel 3 of the Start Here handbook.
// Quick-reference card for the MAS Monograms brand — colors and fonts — built so
// Mary Ann can copy the exact values into Canva when she makes a social graphic,
// flyer, or business card. Colors and fonts mirror the live site's "Heirloom
// Coast" system (src/styles/globals.css + CLAUDE.md). Static content, no fetch.
// Safe to edit by hand.

import React from 'react';
import { Box, Card, Container, Heading, Stack, Text } from '@sanity/ui';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ColorSwatch {
  name: string;
  hex: string;
  note: string;
}

interface ColorGroup {
  label: string;
  colors: ColorSwatch[];
}

interface FontEntry {
  name: string;
  role: string;
  note: string;
  onDark?: boolean;
}

// ─── Data (Heirloom Coast — matches the live site) ───────────────────────────

const colorGroups: ColorGroup[] = [
  {
    label: 'Backgrounds',
    colors: [
      { name: 'Linen', hex: '#F4EEE3', note: 'The main page background — a warm, soft off-white. Use it as the base of most graphics.' },
      { name: 'Paper', hex: '#FBF8F1', note: 'Cards and raised surfaces. A touch brighter than Linen.' },
      { name: 'Sage Band', hex: '#E4E2D3', note: 'The quiet green-grey band used to separate sections.' },
    ],
  },
  {
    label: 'Text',
    colors: [
      { name: 'Heirloom Ink', hex: '#26312E', note: 'The main text color — a deep, warm near-black. Use for headings and body copy on light backgrounds.' },
      { name: 'Secondary Taupe', hex: '#5A5148', note: 'Softer body text and captions.' },
    ],
  },
  {
    label: 'The brand colors',
    colors: [
      { name: 'Heritage Indigo', hex: '#28486B', note: 'The primary brand blue. Links, the header band, and calm accents. Use it for dark backgrounds behind cream text.' },
      { name: 'Claret', hex: '#8C3A2E', note: 'The warm brick-red. This is the "do this" color — buttons and calls to action. Use it sparingly so it stays special.' },
      { name: 'Gold', hex: '#D9B15F', note: 'The script-accent gold. Only on dark (indigo) backgrounds — it disappears on light ones. Used for the handwritten "Handmade in St. Matthews" line.' },
    ],
  },
  {
    label: 'Brass accents',
    colors: [
      { name: 'Brass (text-safe)', hex: '#835A24', note: 'Small brass-toned text — prices, little labels. Readable on Linen.' },
      { name: 'Brass (decorative)', hex: '#B98A3E', note: 'Decorative lines and strokes only. Too light for text on Linen — do not use it for words on a light background.' },
    ],
  },
];

const fonts: FontEntry[] = [
  {
    name: 'Fraunces',
    role: 'Headings & big statements',
    note: 'The elegant serif used for every headline on the site. Set it light (not bold) at large sizes. In Canva, search "Fraunces" and use it for the main line of any graphic.',
  },
  {
    name: 'Mulish',
    role: 'Body text, buttons, labels',
    note: 'The clean, friendly sans-serif for all the smaller, readable text — descriptions, captions, button labels. Reliable at any size. Search "Mulish" in Canva.',
  },
  {
    name: 'Petemoss',
    role: 'The script accent — sparingly',
    note: 'The handwritten script, used for exactly ONE flourish per graphic (like the "Handmade in St. Matthews" line). In brand gold on a dark background. Never use it for whole sentences or small text — it gets hard to read. Search "Petemoss" in Canva.',
    onDark: true,
  },
];

// ─── Sub-component: color swatch ─────────────────────────────────────────────

interface SwatchProps {
  color: ColorSwatch;
}

function Swatch({ color }: SwatchProps) {
  return (
    <Box style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <Box
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '6px',
          backgroundColor: color.hex,
          border: '1px solid rgba(0,0,0,0.12)',
          flexShrink: 0,
          marginTop: '2px',
        }}
      />
      <Stack space={1} style={{ minWidth: 0 }}>
        <Text size={1} weight="semibold">{color.name}</Text>
        {/* Hex as selectable monospace text for easy copy-paste into Canva */}
        <Text size={1} style={{ fontFamily: 'monospace', letterSpacing: '0.02em' }}>{color.hex}</Text>
        <Text size={1} muted>{color.note}</Text>
      </Stack>
    </Box>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BrandKit() {
  return (
    <Container width={1} padding={4}>
      <Stack space={6}>

        {/* Header */}
        <Box>
          <Heading as="h1" size={3}>Brand kit</Heading>
          <Box marginTop={3}>
            <Text muted size={1}>
              Your colors and fonts for MAS Monograms, in one place. Copy the hex codes and
              font names straight into Canva (or hand them to anyone making something for you)
              so every flyer, post, and business card looks like it belongs to your studio.
            </Text>
          </Box>
        </Box>

        {/* ── The one-line summary ──────────────────────────────────────────── */}
        <Card padding={4} radius={2} shadow={1} tone="primary">
          <Stack space={3}>
            <Heading as="h2" size={1}>The three-color version</Heading>
            <Text size={1}>
              When you only have a moment: <strong>Linen (#F4EEE3)</strong> background,
              <strong> Heirloom Ink (#26312E)</strong> text, and <strong>Claret (#8C3A2E)</strong> for
              the one button or highlight. That is the whole brand in three colors. Add
              Heritage Indigo for a richer, dark version.
            </Text>
          </Stack>
        </Card>

        {/* ── Colors ────────────────────────────────────────────────────────── */}
        <Box>
          <Heading as="h2" size={1} style={{ marginBottom: '1rem' }}>Brand colors</Heading>
          <Stack space={4}>
            {colorGroups.map((group) => (
              <Card key={group.label} padding={4} radius={2} shadow={1} tone="default">
                <Stack space={4}>
                  <Text size={1} weight="semibold" muted>{group.label.toUpperCase()}</Text>
                  <Stack space={4}>
                    {group.colors.map((color) => (
                      <Swatch key={color.hex} color={color} />
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        {/* ── Fonts ─────────────────────────────────────────────────────────── */}
        <Box>
          <Heading as="h2" size={1} style={{ marginBottom: '1rem' }}>Fonts</Heading>
          <Stack space={3}>
            {fonts.map((font) => (
              <Card key={font.name} padding={4} radius={2} shadow={1} tone="default">
                <Stack space={2}>
                  <Text size={1} weight="semibold">{font.name}</Text>
                  <Text size={1} muted>Role: {font.role}</Text>
                  <Text size={1}>{font.note}</Text>
                </Stack>
              </Card>
            ))}
          </Stack>
          <Box marginTop={3}>
            <Text size={1} muted>
              All three fonts are free on Canva and Google Fonts. Search each name in Canva's
              font picker and save them as your brand fonts. Reminder: the embroidery fonts you
              stitch with are a totally separate thing — these three are just for the website and
              your marketing graphics.
            </Text>
          </Box>
        </Box>

        {/* ── Using this in Canva ───────────────────────────────────────────── */}
        <Card padding={4} radius={2} shadow={1} tone="default">
          <Stack space={3}>
            <Heading as="h2" size={1}>Setting up your Canva Brand Kit</Heading>
            <Stack as="ol" space={3} style={{ margin: 0, paddingLeft: '1.2rem' }}>
              <Text as="li" size={1}>In Canva, open <strong>Brand → Brand Kit</strong> (free accounts get one).</Text>
              <Text as="li" size={1}>Under <strong>Brand colors</strong>, add each hex code above. Name them so you remember which is which.</Text>
              <Text as="li" size={1}>Under <strong>Brand fonts</strong>, search "Fraunces", "Mulish", and "Petemoss" and save each one.</Text>
              <Text as="li" size={1}>Now every new design starts from your palette instead of Canva's defaults.</Text>
            </Stack>
          </Stack>
        </Card>

        {/* ── Rules of thumb ────────────────────────────────────────────────── */}
        <Card padding={4} radius={2} shadow={1} tone="caution">
          <Stack space={3}>
            <Heading as="h2" size={1}>A few rules that keep it looking expensive</Heading>
            <Stack as="ul" space={2} style={{ margin: 0, paddingLeft: '1.2rem' }}>
              <Text as="li" size={1}>Let the photo of your work be the star. Lots of calm space around it beats a crowded design.</Text>
              <Text as="li" size={1}>Use Claret for one thing per graphic — the button or the single most important word. Not everywhere.</Text>
              <Text as="li" size={1}>Gold script only on the indigo (dark) background. On Linen it vanishes.</Text>
              <Text as="li" size={1}>One big Fraunces headline, everything else in Mulish. Avoid mixing lots of fonts.</Text>
            </Stack>
          </Stack>
        </Card>

      </Stack>
    </Container>
  );
}
