import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Box, Button, Card, Flex, Heading, Stack, Text, TextInput } from '@sanity/ui';
import { ArrowLeftIcon, LaunchIcon, SearchIcon } from '@sanity/icons';
import { useStudioLink } from './studioLink';
import { HEADING_STACK, HEIRLOOM } from '../theme';
import {
  ALL_GUIDES,
  guideById,
  guidesByCategory,
  searchGuides,
  type Guide,
  type GuideBadge,
  type GuideBlock,
  type GuideStep,
  type GuideTarget,
} from '../guides';
import { GUIDE_ICONS } from '../guides/icons';

// =============================================================================
// GuideView: the handbook reader inside Help (Mary Ann's Studio, Phase B)
// =============================================================================
// Ported from stonesteps-50k's GuideView (itself from west-chester-preschool)
// and made calmer and larger for Mary Ann: 18px+ step text, big numbered
// discs, a big "can I do this myself?" badge, "Take me there" cards, a search
// box, and a "Print this guide" button that prints ONLY the guide.
//
// The guides are DATA in ../guides (repo files, tested by
// src/lib/studio-guides.test.ts), never editable documents, so they cannot be
// edited out of date or deleted by accident.
//
// One component holds the list and the open guide (local state), so there is
// no extra desk pane per guide and "Back to all guides" is one click.
//
// PRINTING. window.print() prints the whole Studio, so while a guide is open a
// plain-HTML copy of it is portalled to <body> (#mas-guide-print), hidden on
// screen, and a print stylesheet hides everything else. Plain HTML because the
// Studio's own styles print badly (fixed heights, scroll boxes).
// =============================================================================

const BADGE_TONE: Record<GuideBadge, 'positive' | 'primary' | 'caution'> = {
  'You can do this yourself': 'positive',
  'Mostly yourself': 'primary',
  'Check with Nathan first': 'caution',
};
const BADGE_MARK: Record<GuideBadge, string> = {
  'You can do this yourself': '✓',
  'Mostly yourself': '◐',
  'Check with Nathan first': '!',
};

// Inline marks: **bold** and `a thing you click` (a button-look chip).
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`'))
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                background: HEIRLOOM.linen,
                border: `1px solid ${HEIRLOOM.indigo}`,
                color: HEIRLOOM.ink,
                borderRadius: 6,
                padding: '0 0.4em',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {part.slice(1, -1)}
            </span>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Strip the marks for the printed copy. */
const plain = (text: string) =>
  text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '"$1"');

function BadgeChip({ badge, large }: { badge: GuideBadge; large?: boolean }) {
  return (
    <Card
      tone={BADGE_TONE[badge]}
      border
      radius={5}
      paddingX={large ? 4 : 3}
      paddingY={large ? 3 : 2}
      style={{ display: 'inline-block' }}
    >
      <Text size={large ? 2 : 1} weight="semibold">
        <span aria-hidden>{BADGE_MARK[badge]} </span>
        {badge}
      </Text>
    </Card>
  );
}

function IconChip({ guide, size = 48 }: { guide: Guide; size?: number }) {
  const Icon = GUIDE_ICONS[guide.icon];
  return (
    <span
      aria-hidden
      style={{
        background: HEIRLOOM.linen,
        boxShadow: `inset 0 0 0 1.5px ${HEIRLOOM.claret}`,
        color: HEIRLOOM.claret,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 14,
        fontSize: size * 0.6,
        flexShrink: 0,
      }}
    >
      <Icon />
    </span>
  );
}

// ── "Take me there" ───────────────────────────────────────────────────────────

function TakeMeThere({ label, detail, to }: { label: string; detail?: string; to: GuideTarget }) {
  const linkTo = useStudioLink();
  const external = 'url' in to;
  const link = external
    ? { href: to.url, onClick: undefined, target: '_blank', rel: 'noopener noreferrer' }
    : { ...linkTo(to), target: undefined, rel: undefined };
  return (
    <Card
      as="a"
      href={link.href}
      onClick={link.onClick}
      target={link.target}
      rel={link.rel}
      padding={4}
      radius={3}
      border
      tone="primary"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', minHeight: 64 }}
    >
      <Flex align="center" gap={3}>
        <Stack space={3} style={{ flex: 1 }}>
          <Text size={1} weight="semibold" style={{ color: HEIRLOOM.indigo }}>
            {external ? 'Opens in a new tab' : 'Take me there'}
          </Text>
          <Text size={3} weight="semibold">
            {label}
          </Text>
          {detail && (
            <Text size={2} muted>
              {detail}
            </Text>
          )}
        </Stack>
        <Text size={4} style={{ color: HEIRLOOM.indigo }}>
          {external ? <LaunchIcon /> : '→'}
        </Text>
      </Flex>
    </Card>
  );
}

// ── Blocks ────────────────────────────────────────────────────────────────────

const stepText = (s: GuideStep) => (typeof s === 'string' ? s : s.text);

function Steps({ items }: { items: GuideStep[] }) {
  // Explicit numbered discs: @sanity/ui's reset strips native list markers.
  return (
    <Stack as="ol" space={4} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((item, i) => (
        <Flex as="li" key={i} gap={3} align="flex-start">
          <span
            aria-hidden
            style={{
              background: HEIRLOOM.indigo,
              color: HEIRLOOM.paper,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              fontSize: 18,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </span>
          <Stack space={3} style={{ flex: 1, paddingTop: 6 }}>
            <Text size={3} style={{ lineHeight: 1.55 }}>
              <RichText text={stepText(item)} />
            </Text>
            {typeof item !== 'string' && item.see && (
              <Text size={2} style={{ lineHeight: 1.55, color: HEIRLOOM.ink }}>
                <strong>What you will see: </strong>
                <RichText text={item.see} />
              </Text>
            )}
            {typeof item !== 'string' && item.picture && (
              <Text size={1} muted style={{ lineHeight: 1.5 }}>
                Picture: {item.picture}
              </Text>
            )}
          </Stack>
        </Flex>
      ))}
    </Stack>
  );
}

const CALLOUT: Record<
  'tip' | 'careful' | 'why',
  { tone: 'positive' | 'caution' | 'primary'; word: string }
> = {
  tip: { tone: 'positive', word: 'Tip' },
  careful: { tone: 'caution', word: 'Take care' },
  why: { tone: 'primary', word: 'Why' },
};

function BlockView({ block, open }: { block: GuideBlock; open: (id: string) => void }) {
  switch (block.kind) {
    case 'h':
      return (
        <Box paddingTop={3}>
          <Heading as="h2" size={2} style={{ fontFamily: HEADING_STACK, color: HEIRLOOM.ink }}>
            {block.text}
          </Heading>
        </Box>
      );
    case 'p':
      return (
        <Text size={3} style={{ lineHeight: 1.6 }}>
          <RichText text={block.text} />
        </Text>
      );
    case 'steps':
      return <Steps items={block.items} />;
    case 'bullets':
      return (
        <Stack as="ul" space={4} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {block.items.map((item, i) => (
            <Flex as="li" key={i} gap={3} align="flex-start">
              <span
                aria-hidden
                style={{
                  background: HEIRLOOM.claret,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: 10,
                }}
              />
              <Text size={3} style={{ lineHeight: 1.55 }}>
                <RichText text={item} />
              </Text>
            </Flex>
          ))}
        </Stack>
      );
    case 'path':
      return <TakeMeThere label={block.label} detail={block.detail} to={block.to} />;
    case 'callout': {
      const c = CALLOUT[block.tone];
      return (
        <Card tone={c.tone} padding={4} radius={3} border>
          <Stack space={3}>
            <Text size={2} weight="semibold">
              {block.title ? `${c.word}: ${block.title}` : c.word}
            </Text>
            <Text size={3} style={{ lineHeight: 1.55 }}>
              <RichText text={block.text} />
            </Text>
          </Stack>
        </Card>
      );
    }
    case 'seealso': {
      const guides = block.ids.map(guideById).filter((g): g is Guide => Boolean(g));
      if (!guides.length) return null;
      return (
        <Stack space={3} paddingTop={2}>
          <Text size={2} weight="semibold">
            See also
          </Text>
          <Flex gap={2} wrap="wrap">
            {guides.map((g) => (
              <Button
                key={g.id}
                text={g.title}
                mode="ghost"
                fontSize={2}
                padding={3}
                onClick={() => open(g.id)}
              />
            ))}
          </Flex>
        </Stack>
      );
    }
    default:
      return null;
  }
}

// ── The printed copy ──────────────────────────────────────────────────────────

const PRINT_CSS = `
#mas-guide-print { display: none; }
@media print {
  body > *:not(#mas-guide-print) { display: none !important; }
  #mas-guide-print { display: block !important; color: #000; background: #fff;
    font: 14pt/1.5 Georgia, "Times New Roman", serif; padding: 0 0.5in; }
  #mas-guide-print h1 { font-size: 22pt; margin: 0 0 6pt; }
  #mas-guide-print h2 { font-size: 16pt; margin: 18pt 0 6pt; }
  #mas-guide-print .meta { font-size: 12pt; margin: 0 0 12pt; }
  #mas-guide-print ol li, #mas-guide-print ul li { margin: 0 0 8pt; }
  #mas-guide-print .see { font-style: italic; }
  #mas-guide-print .box { border: 1.5pt solid #000; padding: 6pt 10pt; margin: 10pt 0; }
}`;

function PrintableGuide({ guide }: { guide: Guide }) {
  return (
    <div id="mas-guide-print">
      <style>{PRINT_CSS}</style>
      <h1>{guide.title}</h1>
      <p className="meta">
        {guide.badge}. {guide.time}.{guide.cost ? ` ${guide.cost}` : ''}
      </p>
      <p>{guide.summary}</p>
      {guide.before?.length ? (
        <>
          <h2>Before you start</h2>
          <ul>
            {guide.before.map((b, i) => (
              <li key={i}>{plain(b)}</li>
            ))}
          </ul>
        </>
      ) : null}
      {guide.blocks.map((b, i) => {
        switch (b.kind) {
          case 'h':
            return <h2 key={i}>{b.text}</h2>;
          case 'p':
            return <p key={i}>{plain(b.text)}</p>;
          case 'steps':
            return (
              <ol key={i}>
                {b.items.map((s, j) => (
                  <li key={j}>
                    {plain(stepText(s))}
                    {typeof s !== 'string' && s.see && (
                      <div className="see">What you will see: {plain(s.see)}</div>
                    )}
                  </li>
                ))}
              </ol>
            );
          case 'bullets':
            return (
              <ul key={i}>
                {b.items.map((s, j) => (
                  <li key={j}>{plain(s)}</li>
                ))}
              </ul>
            );
          case 'callout':
            return (
              <div key={i} className="box">
                <strong>
                  {CALLOUT[b.tone].word}
                  {b.title ? `: ${b.title}` : ''}
                </strong>
                <div>{plain(b.text)}</div>
              </div>
            );
          case 'path':
            return (
              <p key={i}>
                <strong>Where to find it:</strong> {b.label}
                {b.detail ? ` (${b.detail})` : ''}
                {'url' in b.to ? `: ${b.to.url}` : ''}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

// ── One guide ─────────────────────────────────────────────────────────────────

function GuidePage({
  guide,
  back,
  open,
}: {
  guide: Guide;
  back: () => void;
  open: (id: string) => void;
}) {
  return (
    <Stack space={5}>
      <Flex gap={3} wrap="wrap">
        <Button
          icon={ArrowLeftIcon}
          text="Back to all guides"
          mode="ghost"
          fontSize={2}
          padding={4}
          onClick={back}
        />
        <Button
          text="Print this guide"
          mode="ghost"
          fontSize={2}
          padding={4}
          onClick={() => window.print()}
        />
      </Flex>
      <Stack space={4}>
        <Flex align="center" gap={3}>
          <IconChip guide={guide} />
          <Heading as="h2" size={4} style={{ fontFamily: HEADING_STACK, color: HEIRLOOM.ink }}>
            {guide.title}
          </Heading>
        </Flex>
        <Flex gap={3} align="center" wrap="wrap">
          <BadgeChip badge={guide.badge} large />
          <Text size={2} muted>
            {guide.time}
          </Text>
        </Flex>
        <Text size={3} style={{ lineHeight: 1.6 }}>
          {guide.summary}
        </Text>
        {guide.cost && (
          <Text size={2} style={{ lineHeight: 1.55 }}>
            <strong>What it costs: </strong>
            {guide.cost}
          </Text>
        )}
      </Stack>
      {guide.before?.length ? (
        <Card padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
          <Stack space={4}>
            <Text size={2} weight="semibold">
              Before you start, have ready
            </Text>
            <Stack as="ul" space={3} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {guide.before.map((b, i) => (
                <Flex as="li" key={i} gap={3}>
                  <Text size={3} aria-hidden>
                    ☐
                  </Text>
                  <Text size={3} style={{ lineHeight: 1.5 }}>
                    <RichText text={b} />
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </Card>
      ) : null}
      <Stack space={5}>
        {guide.blocks.map((block, i) => (
          <BlockView key={i} block={block} open={open} />
        ))}
      </Stack>
      <Flex>
        <Button
          icon={ArrowLeftIcon}
          text="Back to all guides"
          mode="ghost"
          fontSize={2}
          padding={4}
          onClick={back}
        />
      </Flex>
      {typeof document !== 'undefined' &&
        createPortal(<PrintableGuide guide={guide} />, document.body)}
    </Stack>
  );
}

// ── The list ──────────────────────────────────────────────────────────────────

function GuideRow({ guide, open }: { guide: Guide; open: (id: string) => void }) {
  return (
    <Card
      as="button"
      type="button"
      onClick={() => open(guide.id)}
      padding={4}
      radius={3}
      border
      style={{ textAlign: 'left', width: '100%', background: HEIRLOOM.paper, cursor: 'pointer' }}
    >
      <Flex gap={3} align="flex-start">
        <IconChip guide={guide} size={40} />
        <Stack space={3} style={{ flex: 1 }}>
          <Text size={3} weight="semibold" style={{ color: HEIRLOOM.ink }}>
            {guide.title}
          </Text>
          <Text size={2} muted style={{ lineHeight: 1.5 }}>
            {guide.summary}
          </Text>
          <Flex gap={3} align="center" wrap="wrap">
            <BadgeChip badge={guide.badge} />
            <Text size={1} muted>
              {guide.time}
            </Text>
          </Flex>
        </Stack>
      </Flex>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack space={3}>
      <Heading as="h2" size={2} style={{ fontFamily: HEADING_STACK, color: HEIRLOOM.ink }}>
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

/** The handbook: search, guides by topic, and the open guide. */
export function GuideView({ guides = ALL_GUIDES }: { guides?: Guide[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const top = useRef<HTMLDivElement>(null);

  const open = (id: string | null) => {
    setOpenId(id);
    top.current?.scrollIntoView({ block: 'start' });
  };
  const guide = openId ? guides.find((g) => g.id === openId) : undefined;
  const found = useMemo(() => searchGuides(query, guides), [query, guides]);

  return (
    <div ref={top}>
      {guide ? (
        <GuidePage guide={guide} back={() => open(null)} open={open} />
      ) : (
        <Stack space={5}>
          <Stack space={3}>
            <Text as="label" htmlFor="mas-guide-search" size={2} weight="semibold">
              Search the guides
            </Text>
            <TextInput
              id="mas-guide-search"
              icon={SearchIcon}
              fontSize={3}
              padding={4}
              placeholder="For example: photo, price, phone, sold"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              clearButton={query.length > 0}
              onClear={() => setQuery('')}
            />
          </Stack>
          {query.trim() ? (
            <Section
              title={found.length ? `Guides that mention "${query.trim()}"` : 'No guides found'}
            >
              {found.length ? (
                found.map((g) => <GuideRow key={g.id} guide={g} open={open} />)
              ) : (
                <Text size={2} muted>
                  Try a shorter word, such as "photo" or "price".
                </Text>
              )}
            </Section>
          ) : (
            guidesByCategory(guides)
              .filter(([, list]) => list.length > 0)
              .map(([category, list]) => (
                <Section key={category} title={category}>
                  {list.map((g) => (
                    <GuideRow key={g.id} guide={g} open={open} />
                  ))}
                </Section>
              ))
          )}
        </Stack>
      )}
    </div>
  );
}
