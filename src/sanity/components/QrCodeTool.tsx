import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Box, Button, Card, Checkbox, Flex, Grid, Stack, Text, TextInput } from '@sanity/ui';
import { useClient } from 'sanity';
import { ToolHeading } from './ToolHeading';
import { useStudioLink, type StudioTarget } from './studioLink';
import { HEIRLOOM, HEADING_STACK } from '../theme';
import { DESK } from '../studioTargets';
import { QR_COPY, REVIEW_GUIDE_ID } from '../qrCopy';
import { sealSvg } from '../../lib/brand/brandSvg.js';
import {
  DESTINATION_IDS,
  SITE_PATHS,
  socialUrl,
  type DestinationId,
} from '../../lib/qr/destinations';
import { makeQr } from '../../lib/qr/make';
import {
  PLACEMENT_IDS,
  PLACEMENTS,
  inchesText,
  sizeText,
  type PlacementId,
} from '../../lib/qr/placements';
import { guideById } from '../guides';
import { printPageHtml } from '../../lib/qr/print';
import { type QrBackground } from '../../lib/qr/svg';
import { parseWebAddress } from '../../lib/qr/url';

// =============================================================================
// QrCodeTool: "Make a QR code" (Phase E of the Studio upgrade, 2026-10-05)
// =============================================================================
// A top-bar tool (registered in sanity.config.ts as `qr-codes`) and a desk pane
// (structure.ts, DESK.qrCodes), so it is reachable from the Welcome card, the
// top bar and the menu. Three steps, each shown once the one before is chosen:
//
//   1. Where should the QR code take people?   (her pages, review link, socials)
//   2. Where will you put it?                   (sets size, border and the tag)
//   3. Your QR code                             (preview, options, four buttons)
//
// Everything is made IN THE BROWSER by src/lib/qr/* (the qrcode-generator
// encoder): no network request, no outside QR service, nothing for the Studio
// CSP to allow (downloads are blob: links). The only Sanity read is her
// business details, for the Google review link and the Facebook/Instagram
// addresses. Nothing here writes to Sanity.
//
// Words: every string is in ../qrCopy.ts. Sizes: src/lib/qr/placements.ts.
// =============================================================================

/** Where her pasted Google review link is remembered, in this browser only. */
const REVIEW_KEY = 'mas-qr-google-review-url';

/**
 * "Open the handbook": Help > Guides and quick answers. GuideView has no link
 * format that opens one guide yet, so the card names the guide
 * (REVIEW_GUIDE_ID, its title read from the guide data) and opens the handbook.
 */
const GUIDE_TARGET: StudioTarget = { pane: `${DESK.help};${DESK.helpGuides}` };
/** Her social and review links in My business details. */
const SOCIAL_FIELD: StudioTarget = { doc: 'siteSettings', field: 'socialLinks' };
const REVIEW_FIELD: StudioTarget = { doc: 'siteSettings', field: 'googleReviewUrl' };

/** The title of the review guide, from the handbook itself (never a stale copy). */
const reviewGuideTitle = guideById(REVIEW_GUIDE_ID)?.title ?? null;

const PLATFORM: Partial<Record<DestinationId, string>> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
};

interface Details {
  googleReviewUrl?: string | null;
  socialLinks?: Array<{ platform?: string | null; url?: string | null } | null> | null;
}

const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

function readStored(): string {
  try {
    return window.localStorage.getItem(REVIEW_KEY) ?? '';
  } catch {
    return '';
  }
}
function writeStored(value: string) {
  try {
    if (value) window.localStorage.setItem(REVIEW_KEY, value);
    else window.localStorage.removeItem(REVIEW_KEY);
  } catch {
    // Private window or blocked storage: the link still works for this visit.
  }
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function svgToPng(svg: string): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('The picture did not load'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No PNG'))), 'image/png'),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function StepHeading({ n, children }: { n: number; children: ReactNode }) {
  return (
    <Stack space={3}>
      <Text size={1} weight="semibold" style={{ color: HEIRLOOM.taupe, letterSpacing: 0.3 }}>
        {fill(QR_COPY.stepNumber, { n })}
      </Text>
      <h2
        style={{
          margin: 0,
          fontFamily: HEADING_STACK,
          fontSize: 26,
          lineHeight: 1.25,
          fontWeight: 600,
          color: HEIRLOOM.ink,
        }}
      >
        {children}
      </h2>
    </Stack>
  );
}

/** A big choice: a real button, at least 72px tall, with "pressed" state. */
function Choice({
  selected,
  title,
  blurb,
  onClick,
}: {
  selected: boolean;
  title: string;
  blurb?: string;
  onClick: () => void;
}) {
  return (
    <Card
      as="button"
      type="button"
      padding={4}
      radius={3}
      border
      aria-pressed={selected}
      onClick={onClick}
      __unstable_focusRing
      style={{
        width: '100%',
        minHeight: 72,
        textAlign: 'left',
        cursor: 'pointer',
        background: selected ? HEIRLOOM.linen : HEIRLOOM.paper,
        boxShadow: selected ? `inset 0 0 0 3px ${HEIRLOOM.indigo}` : undefined,
      }}
    >
      <Flex align="center" gap={3}>
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 14,
            border: `2px solid ${selected ? HEIRLOOM.indigo : HEIRLOOM.taupe}`,
            background: selected ? HEIRLOOM.indigo : 'transparent',
            color: HEIRLOOM.paper,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {selected ? '✓' : ''}
        </span>
        <Stack space={3} style={{ flex: 1 }}>
          <Text size={3} weight="semibold" style={{ color: HEIRLOOM.ink }}>
            {title}
          </Text>
          {blurb && (
            <Text size={2} muted style={{ lineHeight: 1.5 }}>
              {blurb}
            </Text>
          )}
        </Stack>
      </Flex>
    </Card>
  );
}

/** A choice she cannot use yet (no Facebook link): says why, and how to fix it. */
function MissingChoice({ title, platform }: { title: string; platform: string }) {
  const linkTo = useStudioLink();
  const link = linkTo(SOCIAL_FIELD);
  return (
    <Card padding={4} radius={3} style={{ border: `2px dashed ${HEIRLOOM.taupe}`, minHeight: 72 }}>
      <Stack space={3}>
        <Text size={3} weight="semibold" style={{ color: HEIRLOOM.taupe }}>
          {title}
        </Text>
        <Text size={2} style={{ lineHeight: 1.5, color: HEIRLOOM.taupe }}>
          {fill(QR_COPY.missingSocial, { platform })}
        </Text>
        <Flex>
          <Button
            as="a"
            href={link.href}
            onClick={link.onClick}
            text={fill(QR_COPY.missingSocialButton, { platform })}
            mode="ghost"
            fontSize={2}
            padding={4}
          />
        </Flex>
      </Stack>
    </Card>
  );
}

function BigButton(props: {
  text: string;
  help: string;
  onClick: () => void;
  tone?: 'primary' | 'default';
  disabled?: boolean;
}) {
  return (
    <Stack space={2}>
      <Button
        text={props.text}
        tone={props.tone ?? 'default'}
        mode={props.tone === 'primary' ? 'default' : 'ghost'}
        fontSize={3}
        padding={4}
        style={{ width: '100%', minHeight: 56 }}
        onClick={props.onClick}
        disabled={props.disabled}
      />
      <Text size={1} muted style={{ lineHeight: 1.5 }}>
        {props.help}
      </Text>
    </Stack>
  );
}

// ── The tool ─────────────────────────────────────────────────────────────────

export function QrCodeTool() {
  const client = useClient({ apiVersion: '2025-02-19' });
  const linkTo = useStudioLink();
  const [details, setDetails] = useState<Details | null>(null);
  const [stored, setStored] = useState('');
  const [pasted, setPasted] = useState('');
  const [destination, setDestination] = useState<DestinationId | null>(null);
  const [placement, setPlacement] = useState<PlacementId | null>(null);
  const [label, setLabel] = useState('');
  const [campaign, setCampaign] = useState('');
  const [sealWanted, setSealWanted] = useState(true);
  const [background, setBackground] = useState<QrBackground>('white');
  const [status, setStatus] = useState('');
  const [pngBusy, setPngBusy] = useState(false);
  const step2 = useRef<HTMLDivElement>(null);
  const step3 = useRef<HTMLDivElement>(null);

  // Her business details: published, or what she has typed but not published.
  useEffect(() => {
    let live = true;
    client
      .fetch<Array<Details & { _id: string }>>(
        `*[_id in ["siteSettings", "drafts.siteSettings"]]{_id, googleReviewUrl, socialLinks[]{platform, url}}`,
      )
      .then((docs) => {
        if (!live) return;
        const doc =
          docs.find((d) => d._id.startsWith('drafts.')) ??
          docs.find((d) => d._id === 'siteSettings');
        setDetails(doc ?? {});
      })
      .catch(() => live && setDetails({}));
    const s = readStored();
    setStored(s);
    setPasted(s);
    return () => {
      live = false;
    };
  }, [client]);

  const fromDetails = parseWebAddress(details?.googleReviewUrl)?.toString() ?? null;
  const reviewUrl = fromDetails ?? parseWebAddress(stored)?.toString() ?? null;
  const links = useMemo(
    () => ({ googleReviewUrl: reviewUrl, socialLinks: details?.socialLinks ?? [] }),
    [reviewUrl, details],
  );
  const seal = useMemo(() => sealSvg({ idp: 'qrseal', cut: 'bold' }), []);

  const made = useMemo(() => {
    if (!destination || !placement) return null;
    try {
      return makeQr({
        destination,
        placement,
        links,
        label,
        campaign,
        seal: sealWanted,
        sealSvg: seal,
        background,
      });
    } catch {
      return null;
    }
  }, [destination, placement, links, label, campaign, sealWanted, seal, background]);

  const canGoOn =
    destination != null &&
    (SITE_PATHS[destination] != null ||
      (destination === 'review' && reviewUrl != null) ||
      socialUrl(links, PLATFORM[destination] ?? '') != null);

  const chooseDestination = (id: DestinationId) => {
    setDestination(id);
    setLabel(QR_COPY.labels[id]);
    setStatus('');
  };
  const choosePlacement = (id: PlacementId) => {
    setPlacement(id);
    setStatus('');
  };

  // Bring the next step into view once it appears.
  useEffect(() => {
    if (canGoOn && !placement)
      step2.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [canGoOn, placement]);
  useEffect(() => {
    if (placement) step3.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [placement]);

  const fileBase = destination && placement ? `mas-monograms-qr-${destination}-${placement}` : 'qr';

  const downloadSvg = () => {
    if (!made) return;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${made.printSvg}`;
    saveBlob(new Blob([xml], { type: 'image/svg+xml' }), `${fileBase}.svg`);
  };
  const downloadPng = async () => {
    if (!made) return;
    setPngBusy(true);
    setStatus(QR_COPY.pngWorking);
    try {
      saveBlob(await svgToPng(made.pngSvg), `${fileBase}.png`);
      setStatus('');
    } catch {
      setStatus(QR_COPY.pngFailed);
    } finally {
      setPngBusy(false);
    }
  };
  const printIt = () => {
    if (!made) return;
    const html = printPageHtml({
      svg: made.printSvg,
      title: QR_COPY.printPage.title,
      note: fill(QR_COPY.printPage.note, { size: inchesText(made.printInches) }),
      ink: HEIRLOOM.ink,
    });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const w = window.open(url, '_blank');
    if (!w) setStatus(QR_COPY.printBlocked);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  const copyLink = async () => {
    if (!made) return;
    try {
      await navigator.clipboard.writeText(made.link);
      setStatus(QR_COPY.copied);
    } catch {
      setStatus(QR_COPY.copyFailed);
    }
  };

  const pastedOk = parseWebAddress(pasted) != null;
  const guide = linkTo(GUIDE_TARGET);
  const reviewField = linkTo(REVIEW_FIELD);

  return (
    <Box padding={[4, 4, 5]} style={{ height: '100%', overflow: 'auto' }}>
      <Stack space={6} style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 64 }}>
        {/* ── Hello ─────────────────────────────────────────────────── */}
        <Stack space={4}>
          <ToolHeading emoji="🔳">{QR_COPY.heading}</ToolHeading>
          <Text size={3} style={{ lineHeight: 1.6 }}>
            {QR_COPY.intro}
          </Text>
          <Card padding={4} radius={3} tone="positive" border>
            <Text size={2} style={{ lineHeight: 1.5 }}>
              {QR_COPY.safe}
            </Text>
          </Card>
        </Stack>

        {/* ── Step 1 ────────────────────────────────────────────────── */}
        <Stack space={4}>
          <StepHeading n={1}>{QR_COPY.step1}</StepHeading>
          <Grid columns={[1, 1, 2]} gap={3}>
            {DESTINATION_IDS.map((id) => {
              const copy = QR_COPY.destinations[id];
              const platform = PLATFORM[id];
              if (platform && !socialUrl(links, platform)) {
                // Wait for her details before saying a link is missing.
                return details ? (
                  <MissingChoice key={id} title={copy.title} platform={platform} />
                ) : null;
              }
              return (
                <Choice
                  key={id}
                  selected={destination === id}
                  title={copy.title}
                  blurb={copy.blurb}
                  onClick={() => chooseDestination(id)}
                />
              );
            })}
          </Grid>

          {destination === 'review' && (
            <Card padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
              {fromDetails ? (
                <Text size={2} style={{ lineHeight: 1.5 }}>
                  {QR_COPY.review.fromDetails}
                </Text>
              ) : (
                <Stack space={4}>
                  <Stack space={3}>
                    <label htmlFor="qr-review-link">
                      <Text size={3} weight="semibold">
                        {QR_COPY.review.pasteLabel}
                      </Text>
                    </label>
                    <TextInput
                      id="qr-review-link"
                      fontSize={3}
                      padding={4}
                      inputMode="url"
                      value={pasted}
                      onChange={(e) => {
                        const v = e.currentTarget.value;
                        setPasted(v);
                        const ok = parseWebAddress(v);
                        const keep = ok ? ok.toString() : '';
                        setStored(keep);
                        writeStored(keep);
                      }}
                    />
                    <Text size={2} muted style={{ lineHeight: 1.5 }}>
                      {pasted && !pastedOk
                        ? QR_COPY.review.invalid
                        : pastedOk
                          ? QR_COPY.review.savedHere
                          : QR_COPY.review.pasteHelp}
                    </Text>
                  </Stack>
                  <Card padding={4} radius={3} tone="caution" border>
                    <Stack space={3}>
                      <Text size={2} weight="semibold">
                        {QR_COPY.review.howTitle}
                      </Text>
                      <Text size={2} style={{ lineHeight: 1.5 }}>
                        {QR_COPY.review.how}
                      </Text>
                      {reviewGuideTitle && (
                        <Text size={2} style={{ lineHeight: 1.5 }}>
                          {fill(QR_COPY.review.guideIntro, { guide: reviewGuideTitle })}
                        </Text>
                      )}
                      <Flex gap={3} wrap="wrap">
                        <Button
                          as="a"
                          href={guide.href}
                          onClick={guide.onClick}
                          text={QR_COPY.review.guideButton}
                          mode="ghost"
                          fontSize={2}
                          padding={4}
                        />
                        <Button
                          as="a"
                          href={reviewField.href}
                          onClick={reviewField.onClick}
                          text={QR_COPY.review.keepButton}
                          mode="ghost"
                          fontSize={2}
                          padding={4}
                        />
                      </Flex>
                      <Text size={1} muted style={{ lineHeight: 1.5 }}>
                        {QR_COPY.review.keepHelp}
                      </Text>
                    </Stack>
                  </Card>
                </Stack>
              )}
            </Card>
          )}
        </Stack>

        {/* ── Step 2 ────────────────────────────────────────────────── */}
        {canGoOn && (
          <div ref={step2} style={{ scrollMarginTop: 16 }}>
            <Stack space={4}>
              <StepHeading n={2}>{QR_COPY.step2}</StepHeading>
              <Grid columns={[1, 1, 2]} gap={3}>
                {PLACEMENT_IDS.map((id) => (
                  <Choice
                    key={id}
                    selected={placement === id}
                    title={QR_COPY.placements[id].title}
                    blurb={`${sizeText(PLACEMENTS[id])}. ${QR_COPY.placements[id].blurb}`}
                    onClick={() => choosePlacement(id)}
                  />
                ))}
              </Grid>
            </Stack>
          </div>
        )}

        {/* ── Step 3 ────────────────────────────────────────────────── */}
        {canGoOn && placement && made && (
          <div ref={step3} style={{ scrollMarginTop: 16 }}>
            <Stack space={5}>
              <StepHeading n={3}>{QR_COPY.step3}</StepHeading>

              <Grid columns={[1, 1, 2]} gap={5}>
                {/* The code, at a size a phone can read off the screen. */}
                <Stack space={4}>
                  <Card
                    padding={3}
                    radius={3}
                    border
                    style={{ background: '#FFFFFF', maxWidth: 360, width: '100%' }}
                  >
                    <div
                      role="img"
                      aria-label={fill(QR_COPY.previewAlt, { label: label || '' })}
                      style={{ width: '100%', lineHeight: 0 }}
                      dangerouslySetInnerHTML={{ __html: made.svg }}
                    />
                  </Card>
                  <Card padding={4} radius={3} tone="primary" border>
                    <Stack space={3}>
                      <Text size={3} weight="semibold">
                        {QR_COPY.testTitle}
                      </Text>
                      <Text size={2} style={{ lineHeight: 1.6 }}>
                        {QR_COPY.testText}
                      </Text>
                    </Stack>
                  </Card>
                  <Stack space={2}>
                    <Text size={2} weight="semibold">
                      {fill(QR_COPY.sizeLine, { size: sizeText(PLACEMENTS[placement]) })}
                    </Text>
                    <Text size={2} muted>
                      {fill(QR_COPY.printSizeLine, { size: inchesText(made.printInches) })}
                    </Text>
                  </Stack>
                </Stack>

                {/* Her options. */}
                <Stack space={5}>
                  <Stack space={3}>
                    <label htmlFor="qr-label">
                      <Text size={3} weight="semibold">
                        {QR_COPY.labelBox}
                      </Text>
                    </label>
                    <TextInput
                      id="qr-label"
                      fontSize={3}
                      padding={4}
                      maxLength={40}
                      value={label}
                      onChange={(e) => setLabel(e.currentTarget.value)}
                    />
                    <Text size={2} muted style={{ lineHeight: 1.5 }}>
                      {QR_COPY.labelHelp}
                    </Text>
                  </Stack>

                  {made.fit.fits ? (
                    <Stack space={2}>
                      <label
                        htmlFor="qr-seal"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          minHeight: 48,
                          cursor: 'pointer',
                        }}
                      >
                        <Checkbox
                          id="qr-seal"
                          checked={sealWanted}
                          onChange={(e) => setSealWanted(e.currentTarget.checked)}
                          style={{ transform: 'scale(1.5)', margin: 6 }}
                        />
                        <Text size={3} weight="semibold">
                          {QR_COPY.sealToggle}
                        </Text>
                      </label>
                      <Text size={2} muted style={{ lineHeight: 1.5 }}>
                        {QR_COPY.sealHelp}
                      </Text>
                    </Stack>
                  ) : (
                    <Text size={2} muted style={{ lineHeight: 1.5 }}>
                      {QR_COPY.sealTooSmall}
                    </Text>
                  )}

                  <Stack space={3}>
                    <Text size={3} weight="semibold">
                      {QR_COPY.backgroundTitle}
                    </Text>
                    <Grid columns={1} gap={2}>
                      <Choice
                        selected={background === 'white'}
                        title={QR_COPY.backgroundWhite}
                        onClick={() => setBackground('white')}
                      />
                      <Choice
                        selected={background === 'linen'}
                        title={QR_COPY.backgroundLinen}
                        onClick={() => setBackground('linen')}
                      />
                    </Grid>
                  </Stack>

                  <Stack space={3}>
                    <label htmlFor="qr-campaign">
                      <Text size={3} weight="semibold">
                        {QR_COPY.campaignBox}
                      </Text>
                    </label>
                    <TextInput
                      id="qr-campaign"
                      fontSize={3}
                      padding={4}
                      maxLength={40}
                      value={campaign}
                      onChange={(e) => setCampaign(e.currentTarget.value)}
                    />
                    <Text size={2} muted style={{ lineHeight: 1.5 }}>
                      {QR_COPY.campaignHelp}
                    </Text>
                  </Stack>
                </Stack>
              </Grid>

              {/* The four buttons. */}
              <Grid columns={[1, 1, 2]} gap={4}>
                <BigButton
                  text={QR_COPY.downloadSvg}
                  help={QR_COPY.downloadSvgHelp}
                  tone="primary"
                  onClick={downloadSvg}
                />
                <BigButton
                  text={QR_COPY.downloadPng}
                  help={QR_COPY.downloadPngHelp}
                  onClick={downloadPng}
                  disabled={pngBusy}
                />
                <BigButton text={QR_COPY.print} help={QR_COPY.printHelp} onClick={printIt} />
                <BigButton text={QR_COPY.copy} help={made.link} onClick={copyLink} />
              </Grid>
              <div aria-live="polite" style={{ minHeight: 28 }}>
                {status && (
                  <Text size={2} weight="semibold">
                    {status}
                  </Text>
                )}
              </div>

              <Stack space={2}>
                <Text size={2} weight="semibold">
                  {QR_COPY.linkCaption}
                </Text>
                <Text size={2} style={{ wordBreak: 'break-all', userSelect: 'all' }}>
                  {made.link}
                </Text>
              </Stack>

              <Card padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
                <Stack space={3}>
                  <Text size={3} weight="semibold">
                    {QR_COPY.tipsTitle}
                  </Text>
                  <ul style={{ margin: 0, paddingLeft: 24 }}>
                    {[...QR_COPY.tips, QR_COPY.testAfterPrint].map((t) => (
                      <li key={t} style={{ marginBottom: 8 }}>
                        <Text size={2} style={{ lineHeight: 1.5 }}>
                          {t}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </Stack>
              </Card>

              <Flex>
                <Button
                  text={QR_COPY.startOver}
                  mode="ghost"
                  fontSize={2}
                  padding={4}
                  onClick={() => {
                    setDestination(null);
                    setPlacement(null);
                    setCampaign('');
                    setStatus('');
                  }}
                />
              </Flex>
            </Stack>
          </div>
        )}
      </Stack>
    </Box>
  );
}

/** The top-bar icon: a tiny QR-like square. */
export function QrIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 25 25" fill="currentColor" aria-hidden="true">
      <path d="M5 5h6v6H5zM7 7v2h2V7zM14 5h6v6h-6zm2 2v2h2V7zM5 14h6v6H5zm2 2v2h2v-2zM14 14h2v2h-2zM18 14h2v2h-2zM16 16h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
    </svg>
  );
}
