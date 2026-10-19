// Safe to edit by hand (the pieces are the kit's: src/sanity/kit/ui/, PORTS.md card 128)
import { useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button, Flex, TextInput } from '@sanity/ui';
import { ArrowLeftIcon } from '@sanity/icons/ArrowLeft';
import { SearchIcon } from '@sanity/icons/Search';
import { useStudioLink } from './studioLink';
import {
  InlineText,
  KitCard,
  KitNotice,
  KitScope,
  PageBanner,
  SectionRule,
  Stone,
  StepPath,
  StoneTag,
} from '../kit/ui';
import type { GuideViewProps } from '../kit/types';
import {
  ALL_GUIDES,
  GUIDE_MEANINGS,
  guideById,
  guidesByCategory,
  searchGuides,
  type Guide,
  type GuideBadge,
  type GuideBlock,
  type GuideStep,
  type GuideTarget,
} from '../guides';

// =============================================================================
// GuideView: the handbook reader inside Help (Mary Ann's Studio, Phase B;
// redrawn in the Studio's design language, starter card 128, 2026-10-19)
// =============================================================================
// Her handbook keeps everything it had: 18px+ step text with "What you will
// see" under a step, the "can I do this myself?" badge, the time and the cost,
// "Before you start, have ready", "Take me there" cards (to a place in the
// Studio or an outside page), See also, a search box and Print this guide.
//
// What changed is the drawing. It is now the kit's pieces in HER look
// (brand/brand.config.json studio.look): a Midnight banner with the guide's
// title in the swash italic in thread gold and the running-stitch hem along
// its foot, the gold cross stitch opening each section (the site's list
// stitch), steps in round claret stones joined by a claret running stitch that
// sews itself along (the How It Works path on her home page), callouts in her
// indigo, gold and claret, and art tiles with her own hoop, needle, spool,
// hang tag and tote.
//
// The guides are DATA in ../guides (repo files, tested by
// src/lib/studio-guides.test.ts), never editable documents, so they cannot be
// edited out of date or deleted by accident.
//
// PRINTING. window.print() prints the whole Studio, so while a guide is open a
// plain-HTML copy of it is portalled to <body> (#mas-guide-print), hidden on
// screen, and a print stylesheet hides everything else. Plain HTML because the
// Studio's own styles print badly (fixed heights, scroll boxes).
// =============================================================================

/** Her badge as a stone tag: the same three tones as the kit's StatusBadge, in her words. */
const BADGE_TONE: Record<GuideBadge, 'note' | 'tip' | 'careful'> = {
  'You can do this yourself': 'note',
  'Mostly yourself': 'tip',
  'Check with Nathan first': 'careful',
};

/** Her three callouts: tip, take care, and why (the reason, in her indigo). */
const CALLOUT: Record<
  'tip' | 'careful' | 'why',
  { tone: 'tip' | 'careful' | 'note'; word: string }
> = {
  tip: { tone: 'tip', word: 'Tip' },
  careful: { tone: 'careful', word: 'Take care' },
  why: { tone: 'note', word: 'Why' },
};

/** Strip the marks for the printed copy. */
const plain = (text: string) =>
  text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '"$1"');

const stepText = (s: GuideStep) => (typeof s === 'string' ? s : s.text);

/** Body text at her size (18px), on the look's ink. */
const BODY = { fontSize: 18, lineHeight: 1.6 } as const;

// ── "Take me there" ───────────────────────────────────────────────────────────

function TakeMeThere({ label, detail, to }: { label: string; detail?: string; to: GuideTarget }) {
  const linkTo = useStudioLink();
  if ('url' in to) {
    const url = to.url;
    return (
      <KitCard
        title={label}
        lead={detail ? `${detail} Opens in a new tab.` : 'Opens in a new tab.'}
        meaning="link"
        href={url}
        onClick={(e) => {
          e.preventDefault();
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
      />
    );
  }
  const link = linkTo(to);
  return (
    <KitCard
      title={label}
      lead={detail ?? 'Take me there'}
      meaning="redirect"
      href={link.href}
      onClick={link.onClick}
    />
  );
}

// ── Blocks ────────────────────────────────────────────────────────────────────

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr)', gap: 8 }}>
          <span style={{ paddingTop: 9 }}>
            <Stone index={0} size={11} seed={i + 50} />
          </span>
          <span style={BODY}>
            <InlineText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Step({ item }: { item: GuideStep }) {
  return (
    <span style={{ display: 'grid', gap: 8 }}>
      <span style={BODY}>
        <InlineText text={stepText(item)} />
      </span>
      {typeof item !== 'string' && item.see && (
        <span className="ui-muted" style={{ fontSize: 16, lineHeight: 1.55 }}>
          <strong>What you will see: </strong>
          <InlineText text={item.see} />
        </span>
      )}
      {typeof item !== 'string' && item.picture && (
        <span className="ui-muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
          Picture: {item.picture}
        </span>
      )}
    </span>
  );
}

function BlockView({ block, open }: { block: GuideBlock; open: (id: string) => void }) {
  switch (block.kind) {
    case 'h':
      return null; // Headings open a section (see sections() below).
    case 'p':
      return (
        <p className="ui-p" style={{ ...BODY, margin: 0 }}>
          <InlineText text={block.text} />
        </p>
      );
    case 'steps':
      return (
        <StepPath
          items={block.items.map((item, i) => (
            <Step key={i} item={item} />
          ))}
        />
      );
    case 'bullets':
      return <Bullets items={block.items} />;
    case 'path':
      return <TakeMeThere label={block.label} detail={block.detail} to={block.to} />;
    case 'callout': {
      const c = CALLOUT[block.tone];
      return (
        <KitNotice tone={c.tone} title={block.title ? `${c.word}: ${block.title}` : c.word}>
          <span style={BODY}>
            <InlineText text={block.text} />
          </span>
        </KitNotice>
      );
    }
    case 'seealso':
      return <SeeAlso ids={block.ids} open={open} />;
    default:
      return null;
  }
}

function SeeAlso({ ids, open }: { ids: string[]; open: (id: string) => void }) {
  const guides = ids.map(guideById).filter((g): g is Guide => Boolean(g));
  if (!guides.length) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 14,
      }}
    >
      {guides.map((g) => (
        <KitCard
          key={g.id}
          title={g.title}
          lead={g.summary}
          meaning={GUIDE_MEANINGS[g.icon]}
          onClick={() => open(g.id)}
        />
      ))}
    </div>
  );
}

/** Splits a guide's blocks at each heading, so every heading's section carries its rule. */
function sections(blocks: GuideBlock[]) {
  const out: { h?: string; blocks: GuideBlock[] }[] = [{ blocks: [] }];
  for (const b of blocks) {
    if (b.kind === 'h') out.push({ h: b.text, blocks: [] });
    else if (b.kind === 'seealso') out.push({ h: 'See also', blocks: [b] });
    else out[out.length - 1].blocks.push(b);
  }
  return out.filter((s) => s.h || s.blocks.length);
}

function Section({
  heading,
  compact,
  children,
}: {
  heading?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <section style={{ display: 'grid', gap: compact ? 16 : 22 }}>
      {heading && (
        <div style={{ display: 'grid', gap: 14 }}>
          <SectionRule />
          <h2 className="ui-h2" style={compact ? { fontSize: 22 } : undefined}>
            {heading}
          </h2>
        </div>
      )}
      {children}
    </section>
  );
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

/** The guide itself: the banner (title, summary, badge, time, cost), "have ready" and the steps. */
function GuideBody({
  guide,
  open,
  compact = false,
}: {
  guide: Guide;
  open: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <KitScope>
      <article style={{ display: 'grid', gap: compact ? 28 : 40 }}>
        <PageBanner
          compact={compact}
          eyebrow={compact ? undefined : `Site Guide · ${guide.category}`}
          title={guide.title}
          lead={guide.summary}
          meaning={GUIDE_MEANINGS[guide.icon]}
          foot={
            <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <StoneTag tone={BADGE_TONE[guide.badge]} onDark>
                {guide.badge}
              </StoneTag>
              <StoneTag tone="plain" onDark>
                {guide.time}
              </StoneTag>
            </span>
          }
        />
        {guide.cost && (
          <p className="ui-p" style={{ ...BODY, margin: 0 }}>
            <strong>What it costs: </strong>
            {guide.cost}
          </p>
        )}
        {guide.before?.length ? (
          <KitNotice tone="tip" title="Before you start, have ready">
            <Bullets items={guide.before} />
          </KitNotice>
        ) : null}
        {sections(guide.blocks).map((s, i) => (
          <Section key={i} heading={s.h} compact={compact}>
            {s.blocks.map((b, j) => (
              <BlockView key={j} block={b} open={open} />
            ))}
          </Section>
        ))}
      </article>
    </KitScope>
  );
}

function GuidePage({
  guide,
  back,
  open,
}: {
  guide: Guide;
  back: () => void;
  open: (id: string) => void;
}) {
  const backButton = (
    <Button
      icon={ArrowLeftIcon}
      text="Back to all guides"
      mode="ghost"
      fontSize={2}
      padding={4}
      onClick={back}
    />
  );
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <Flex gap={3} wrap="wrap">
        {backButton}
        <Button
          text="Print this guide"
          mode="ghost"
          fontSize={2}
          padding={4}
          onClick={() => window.print()}
        />
      </Flex>
      <GuideBody guide={guide} open={open} />
      <Flex>{backButton}</Flex>
      {typeof document !== 'undefined' &&
        createPortal(<PrintableGuide guide={guide} />, document.body)}
    </div>
  );
}

/**
 * One guide on its own, for the kit's "Help for this page" panel beside each
 * document (starter PORTS.md cards 110 and 128; kitConfig.guide.view). The
 * panel passes variant 'panel', drawn compact. A "See also" card switches to
 * that guide in place.
 */
export function makeGuideView(slug: string): ComponentType<GuideViewProps> {
  return function OneGuide({ variant = 'page', onOpen }: GuideViewProps) {
    const [id, setId] = useState(slug);
    const guide = guideById(id);
    if (!guide) {
      return (
        <p style={{ fontSize: 16, margin: 0 }}>
          That guide has moved. Open the Site Guide to find it.
        </p>
      );
    }
    return <GuideBody guide={guide} open={onOpen ?? setId} compact={variant === 'panel'} />;
  };
}

// ── The list ──────────────────────────────────────────────────────────────────

function GuideRow({ guide, open }: { guide: Guide; open: (id: string) => void }) {
  return (
    <KitCard
      title={guide.title}
      lead={
        <>
          {guide.summary}
          <span
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
            }}
          >
            <StoneTag tone={BADGE_TONE[guide.badge]}>{guide.badge}</StoneTag>
            <span style={{ fontSize: 14 }}>{guide.time}</span>
          </span>
        </>
      }
      meaning={GUIDE_MEANINGS[guide.icon]}
      onClick={() => open(guide.id)}
    />
  );
}

/** Guide cards, two across when there is room. */
function Rows({ guides, open }: { guides: Guide[]; open: (id: string) => void }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 14,
      }}
    >
      {guides.map((g) => (
        <GuideRow key={g.id} guide={g} open={open} />
      ))}
    </div>
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
        <KitScope>
          <div style={{ display: 'grid', gap: 36 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <label htmlFor="mas-guide-search" style={{ fontSize: 16, fontWeight: 700 }}>
                Search the guides
              </label>
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
            </div>
            {query.trim() ? (
              <Section
                heading={found.length ? `Guides that mention "${query.trim()}"` : 'No guides found'}
              >
                {found.length ? (
                  <Rows guides={found} open={open} />
                ) : (
                  <p className="ui-p" style={{ ...BODY, margin: 0 }}>
                    Try a shorter word, such as "photo" or "price".
                  </p>
                )}
              </Section>
            ) : (
              guidesByCategory(guides)
                .filter(([, list]) => list.length > 0)
                .map(([category, list]) => (
                  <Section key={category} heading={category}>
                    <Rows guides={list} open={open} />
                  </Section>
                ))
            )}
          </div>
        </KitScope>
      )}
    </div>
  );
}
