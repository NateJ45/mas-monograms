import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Box, Card, Flex, Grid, Heading, Stack, Text } from '@sanity/ui';
import { ToolHeading } from './ToolHeading';
import { HEADING_STACK, HEIRLOOM } from '../theme';
import {
  BRAND_COLORS,
  BRAND_FONTS,
  COLORWAYS,
  COLOR_PAIRS,
  FONT_FALLBACK_NOTE,
  FONT_LICENSE_NOTE,
  GOLD_THREAD,
  IMAGE_GROUPS,
  INSTALL_STEPS,
  KIT_IMAGES,
  KIT_PRINTS,
  KIT_ZIP,
  LOGOS,
  LOGO_RULES,
  READABILITY_WORDS,
  VOICE,
  ZIP_CONTENTS,
  cmykText,
  colorHex,
  colorName,
  logoFile,
  rgbText,
  type Colorway,
  type Logo,
} from '../../lib/brand/brandKit';
import manifest from '../../lib/brand/brandKitManifest.json';

// =============================================================================
// BrandKitPane: "My brand kit" (Phase F of the Studio upgrade, 2026-10-05)
// =============================================================================
// Everything made for Mary Ann's website, so she can use it anywhere else:
// logos, ready-made pictures for Facebook, Instagram, Pinterest and Google,
// printables, colors, fonts and how she sounds. A top-bar tool (`brand-kit` in
// sanity.config.ts) and a desk item (DESK.brandKit in structure.ts), with a
// Welcome card. It replaced the old static "Your brand colors and fonts" panel.
//
// All words and file names: src/lib/brand/brandKit.ts (tested). The files are
// drawn by scripts/generate-brand-kit.mjs into public/brand-kit/ and committed,
// so every button is a plain same-origin download link: no network call, no
// Sanity read, nothing for the Studio CSP to allow. The tagline and file sizes
// come from brandKitManifest.json, written by the same script.
//
// Buttons are real <a download> links, at least 48px tall, with an aria-label
// that says exactly what each one downloads.
// =============================================================================

const FILES = manifest.files as Record<string, { bytes: number; width?: number; height?: number }>;

/** "2.3 MB" / "84 KB". */
function sizeOf(path: string): string {
  const bytes = path === KIT_ZIP ? manifest.zip?.bytes : FILES[path]?.bytes;
  if (!bytes) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The file name a download is saved under. */
const fileName = (path: string) => path.split('/').pop() ?? path;

const RING = `0 0 0 3px ${HEIRLOOM.paper}, 0 0 0 5px ${HEIRLOOM.indigo}`;

const buttonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 48,
  padding: '10px 18px',
  borderRadius: 6,
  fontSize: 17,
  fontWeight: 600,
  lineHeight: 1.3,
  textDecoration: 'none',
  textAlign: 'center',
  cursor: 'pointer',
  boxSizing: 'border-box',
};

const TONES = {
  primary: {
    background: HEIRLOOM.claret,
    color: '#FFFFFF',
    border: `2px solid ${HEIRLOOM.claret}`,
  },
  blue: { background: HEIRLOOM.indigo, color: '#FFFFFF', border: `2px solid ${HEIRLOOM.indigo}` },
  plain: {
    background: HEIRLOOM.paper,
    color: HEIRLOOM.ink,
    border: `2px solid ${HEIRLOOM.indigo}`,
  },
} as const;

/** A big download (or outside) link that looks like a button. */
function DownloadButton({
  href,
  label,
  children,
  tone = 'blue',
  external = false,
  wide = false,
}: {
  href: string;
  /** Exactly what it downloads, for screen readers. */
  label: string;
  children: ReactNode;
  tone?: keyof typeof TONES;
  external?: boolean;
  wide?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <a
      href={href}
      aria-label={label}
      {...(external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : { download: fileName(href) })}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        ...buttonBase,
        ...TONES[tone],
        width: wide ? '100%' : undefined,
        boxShadow: focus ? RING : undefined,
        outline: 'none',
      }}
    >
      {children}
    </a>
  );
}

/** A section with a big heading and an anchor the top menu scrolls to. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <Box id={`brand-kit-${id}`} style={{ scrollMarginTop: 16 }}>
      <Stack space={4}>
        <Heading
          as="h2"
          size={3}
          style={{ fontFamily: HEADING_STACK, color: HEIRLOOM.ink, lineHeight: 1.25 }}
        >
          {title}
        </Heading>
        {children}
      </Stack>
    </Box>
  );
}

const SECTIONS = [
  { id: 'logo', title: 'My logo' },
  { id: 'pictures', title: 'Pictures for Facebook, Instagram, Pinterest and Google' },
  { id: 'print', title: 'Ready to print' },
  { id: 'colors', title: 'My colors' },
  { id: 'fonts', title: 'My fonts' },
  { id: 'voice', title: 'How I sound' },
];

function JumpMenu() {
  const go = (id: string) =>
    document
      .getElementById(`brand-kit-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <nav aria-label="Parts of my brand kit">
      <Flex wrap="wrap" gap={2}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(s.id)}
            style={{ ...buttonBase, ...TONES.plain, fontSize: 16, minHeight: 48 }}
          >
            {s.id === 'pictures' ? 'Pictures for social media' : s.title}
          </button>
        ))}
      </Flex>
    </nav>
  );
}

// ── Download everything ──────────────────────────────────────────────────────

function DownloadEverything() {
  return (
    <Card padding={[4, 4, 5]} radius={3} border style={{ background: HEIRLOOM.paper }}>
      <Stack space={4}>
        <Text size={3} weight="semibold" style={{ lineHeight: 1.4 }}>
          Everything in one file
        </Text>
        <Box>
          <DownloadButton
            href={KIT_ZIP}
            tone="primary"
            wide
            label={`Download everything in one file: my whole brand kit, about ${sizeOf(KIT_ZIP)}`}
          >
            Download everything (one file, {sizeOf(KIT_ZIP)})
          </DownloadButton>
        </Box>
        <Stack space={3}>
          <Text size={2} weight="semibold">
            What is in it
          </Text>
          <Stack as="ul" space={3} style={{ margin: 0, paddingLeft: '1.3rem' }}>
            {ZIP_CONTENTS.map((line) => (
              <Text as="li" size={2} key={line} style={{ lineHeight: 1.5 }}>
                {line}
              </Text>
            ))}
          </Stack>
          <Text size={2} muted style={{ lineHeight: 1.5 }}>
            It downloads as one zipped folder. On a Windows computer, right-click it and choose
            Extract All. On a Mac, double-click it. Keep a copy, and send it to anyone making
            something for you.
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}

// ── My logo ──────────────────────────────────────────────────────────────────

const WAY_SHORT: Record<Colorway['id'], string> = {
  'color-light': 'for a white background',
  'color-dark': 'for a dark background',
  'one-color-midnight': 'in one color (dark)',
  'one-color-white': 'in one color (white)',
};

function LogoTile({ logo, way }: { logo: Logo; way: Colorway }) {
  const svg = logoFile(logo.id, way.id, 'svg');
  const png = logoFile(logo.id, way.id, 'png');
  const small = logoFile(logo.id, way.id, 'small');
  const what = `${logo.name}, ${WAY_SHORT[way.id]}`;
  const isWide = logo.id === 'wordmark';
  return (
    <Card radius={3} border style={{ overflow: 'hidden', background: HEIRLOOM.paper }}>
      <Flex
        align="center"
        justify="center"
        style={{
          background: way.tile,
          minHeight: 200,
          padding: 20,
          borderBottom: `1px solid ${HEIRLOOM.taupe}33`,
        }}
      >
        <img
          src={svg}
          alt={what}
          loading="lazy"
          style={{
            display: 'block',
            maxWidth: '100%',
            width: isWide ? '100%' : 170,
            height: 'auto',
          }}
        />
      </Flex>
      <Stack space={3} padding={4}>
        <Text size={2} style={{ lineHeight: 1.5 }}>
          {way.useWhen}
        </Text>
        <DownloadButton
          href={png}
          wide
          label={`Download ${what}, as a picture (PNG, 2000 pixels wide)`}
        >
          {way.button}
        </DownloadButton>
        <Grid columns={[1, 2]} gap={2}>
          <DownloadButton
            href={small}
            tone="plain"
            label={`Download ${what}, as a small picture (PNG, 512 pixels wide)`}
          >
            Small picture (PNG)
          </DownloadButton>
          <DownloadButton
            href={svg}
            tone="plain"
            label={`Download ${what}, for printing (SVG, any size)`}
          >
            For printing (SVG)
          </DownloadButton>
        </Grid>
      </Stack>
    </Card>
  );
}

/** The clear-space rule as a picture: the seal with an M-high margin all round. */
function ClearSpaceDiagram() {
  return (
    <svg
      viewBox="0 0 240 240"
      width="200"
      height="200"
      role="img"
      aria-label="The Hoop Seal with empty space around it on every side, as tall as the letter M"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x="1" y="1" width="238" height="238" rx="6" fill={HEIRLOOM.paper} />
      <rect
        x="10"
        y="10"
        width="220"
        height="220"
        fill="none"
        stroke={HEIRLOOM.claret}
        strokeWidth="2"
        strokeDasharray="6 5"
      />
      <rect
        x="50"
        y="50"
        width="140"
        height="140"
        fill="none"
        stroke={HEIRLOOM.taupe}
        strokeWidth="1"
      />
      <image href={logoFile('mark', 'color-light', 'svg')} x="50" y="50" width="140" height="140" />
      {/* The margin, marked with an M on each side. */}
      {[
        [120, 34],
        [120, 216],
        [30, 126],
        [210, 126],
      ].map(([x, y]) => (
        <text
          key={`${x}-${y}`}
          x={x}
          y={y}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="22"
          fill={HEIRLOOM.claret}
        >
          M
        </text>
      ))}
    </svg>
  );
}

function LogoSection() {
  return (
    <Section id="logo" title="My logo">
      <Text size={2} style={{ lineHeight: 1.6 }}>
        Three logos, each in four versions. Pick the one for the background it will sit on. A
        picture (PNG) works in Facebook, Word, Canva and email. For printing, give the printer the
        SVG file: it stays sharp at any size.
      </Text>
      {LOGOS.map((logo) => (
        <Stack key={logo.id} space={3}>
          <Text size={3} weight="semibold" style={{ lineHeight: 1.4 }}>
            {logo.name}
          </Text>
          <Text size={2} muted style={{ lineHeight: 1.5 }}>
            {logo.useWhen}
          </Text>
          <Grid columns={[1, 1, 2]} gap={3}>
            {COLORWAYS.map((way) => (
              <LogoTile key={way.id} logo={logo} way={way} />
            ))}
          </Grid>
        </Stack>
      ))}
      <Card padding={4} radius={3} border tone="caution">
        <Flex gap={4} wrap="wrap" align="flex-start">
          <ClearSpaceDiagram />
          <Stack space={3} style={{ flex: '1 1 280px' }}>
            <Text size={3} weight="semibold">
              Using my logo
            </Text>
            <Text size={2} style={{ lineHeight: 1.5 }}>
              {LOGO_RULES.clearSpace}
            </Text>
            {LOGO_RULES.minimumSizes.map((r) => (
              <Text size={2} key={r} style={{ lineHeight: 1.5 }}>
                {r}
              </Text>
            ))}
            <Stack as="ul" space={3} style={{ margin: 0, paddingLeft: '1.3rem' }}>
              {LOGO_RULES.doNot.map((r) => (
                <Text as="li" size={2} key={r} style={{ lineHeight: 1.5 }}>
                  {r}
                </Text>
              ))}
            </Stack>
          </Stack>
        </Flex>
      </Card>
    </Section>
  );
}

// ── Pictures ─────────────────────────────────────────────────────────────────

function ImageTile({ image }: { image: (typeof KIT_IMAGES)[number] }) {
  const tall = image.height > image.width;
  return (
    <Card radius={3} border style={{ overflow: 'hidden', background: HEIRLOOM.paper }}>
      <Flex
        align="center"
        justify="center"
        style={{ background: HEIRLOOM.linen, padding: 12, minHeight: 180 }}
      >
        <img
          src={image.file}
          alt={image.title}
          loading="lazy"
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: tall ? 280 : 220,
            height: 'auto',
            borderRadius: 4,
            boxShadow: `0 0 0 1px ${HEIRLOOM.taupe}33`,
          }}
        />
      </Flex>
      <Stack space={3} padding={4}>
        <Text size={3} weight="semibold" style={{ lineHeight: 1.4 }}>
          {image.title}
        </Text>
        <Text size={2} weight="semibold" style={{ color: HEIRLOOM.brassText, lineHeight: 1.4 }}>
          {image.sizeWords}
        </Text>
        <Text size={2} style={{ lineHeight: 1.5 }}>
          {image.howTo}
        </Text>
        <DownloadButton
          href={image.file}
          wide
          label={`Download ${image.title} (PNG picture, ${image.width} by ${image.height} pixels)`}
        >
          Download this picture
        </DownloadButton>
      </Stack>
    </Card>
  );
}

function PicturesSection() {
  return (
    <Section id="pictures" title="Pictures for Facebook, Instagram, Pinterest and Google">
      <Text size={2} style={{ lineHeight: 1.6 }}>
        Made at exactly the size each place asks for. Download one, then upload it where the website
        or app asks for a picture.
      </Text>
      {IMAGE_GROUPS.map((g) => (
        <Stack key={g.id} space={3}>
          <Text size={3} weight="semibold">
            {g.title}
          </Text>
          <Grid columns={[1, 1, 2, 3]} gap={3}>
            {KIT_IMAGES.filter((i) => i.group === g.id).map((i) => (
              <ImageTile key={i.id} image={i} />
            ))}
          </Grid>
        </Stack>
      ))}
    </Section>
  );
}

function PrintSection() {
  return (
    <Section id="print" title="Ready to print">
      <Grid columns={[1, 1, 3]} gap={3}>
        {KIT_PRINTS.map((p) => (
          <Card
            key={p.id}
            radius={3}
            border
            style={{ overflow: 'hidden', background: HEIRLOOM.paper }}
          >
            <Flex justify="center" style={{ background: HEIRLOOM.linen, padding: 12 }}>
              <img
                src={p.png}
                alt={p.title}
                loading="lazy"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: 300,
                  height: 'auto',
                  boxShadow: `0 1px 4px ${HEIRLOOM.ink}33`,
                }}
              />
            </Flex>
            <Stack space={3} padding={4}>
              <Text size={3} weight="semibold" style={{ lineHeight: 1.4 }}>
                {p.title}
              </Text>
              <Text size={2} weight="semibold" style={{ color: HEIRLOOM.brassText }}>
                {p.sizeWords}
              </Text>
              <Text size={2} style={{ lineHeight: 1.5 }}>
                {p.howTo}
              </Text>
              <DownloadButton href={p.pdf} wide label={`Download ${p.title}, ready to print (PDF)`}>
                Download to print (PDF)
              </DownloadButton>
              <DownloadButton
                href={p.png}
                tone="plain"
                wide
                label={`Download ${p.title}, as a picture (PNG)`}
              >
                Download as a picture (PNG)
              </DownloadButton>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}

// ── Colors ───────────────────────────────────────────────────────────────────

/** Copy text to the clipboard, with a fallback for browsers without the API. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function useCopied() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const copy = useCallback(async (id: string, text: string) => {
    if (await copyText(text)) {
      setCopied(id);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2500);
    }
  }, []);
  return { copied, copy };
}

function CopyButton({
  id,
  text,
  name,
  copied,
  onCopy,
}: {
  id: string;
  text: string;
  name: string;
  copied: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  const done = copied === id;
  const [focus, setFocus] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onCopy(id, text)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      aria-label={`Copy the color code for ${name}, ${text}`}
      style={{
        ...buttonBase,
        ...(done ? TONES.blue : TONES.plain),
        minWidth: 110,
        boxShadow: focus ? RING : undefined,
        outline: 'none',
      }}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}

function ColorsSection() {
  const { copied, copy } = useCopied();
  const gradient = `linear-gradient(${GOLD_THREAD.angle}deg, ${GOLD_THREAD.stops
    .map((s) => `${s.hex} ${s.at}%`)
    .join(', ')})`;
  return (
    <Section id="colors" title="My colors">
      <Text size={2} style={{ lineHeight: 1.6 }}>
        Each color has a code that starts with #. Press Copy, then paste the code into the color box
        in Canva, Word or Facebook to get exactly your color. The printing numbers (CMYK) are
        approximate: for printing, ask the print shop to match the code or show you a test print.
      </Text>
      {/* Announces "Copied" to screen readers. */}
      <div aria-live="polite" style={{ position: 'absolute', left: -9999 }}>
        {copied ? 'Copied' : ''}
      </div>
      <Grid columns={[1, 1, 2]} gap={3}>
        {BRAND_COLORS.map((c) => (
          <Card
            key={c.id}
            radius={3}
            border
            style={{ overflow: 'hidden', background: HEIRLOOM.paper }}
          >
            <div
              aria-hidden
              style={{
                background: c.hex,
                height: 96,
                borderBottom: `1px solid ${HEIRLOOM.taupe}33`,
              }}
            />
            <Stack space={3} padding={4}>
              <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                <Stack space={2}>
                  <Text size={3} weight="semibold">
                    {c.name}
                  </Text>
                  <Text
                    size={3}
                    style={{
                      fontFamily: 'ui-monospace, Consolas, monospace',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {c.hex}
                  </Text>
                </Stack>
                <CopyButton id={c.id} text={c.hex} name={c.name} copied={copied} onCopy={copy} />
              </Flex>
              <Text size={2} style={{ lineHeight: 1.5 }}>
                {c.useFor}
              </Text>
              <Text size={1} muted style={{ lineHeight: 1.5 }}>
                RGB {rgbText(c.hex)}. Printing (approximate): {cmykText(c.hex)}
              </Text>
            </Stack>
          </Card>
        ))}
        <Card radius={3} border style={{ overflow: 'hidden', background: HEIRLOOM.paper }}>
          <div aria-hidden style={{ background: gradient, height: 96 }} />
          <Stack space={3} padding={4}>
            <Text size={3} weight="semibold">
              {GOLD_THREAD.name}
            </Text>
            <Text size={2} style={{ lineHeight: 1.5 }}>
              {GOLD_THREAD.useFor}
            </Text>
            <Text size={1} muted>
              {GOLD_THREAD.stops.map((s) => s.hex).join(', ')}
            </Text>
          </Stack>
        </Card>
      </Grid>

      <Stack space={3}>
        <Text size={3} weight="semibold">
          Which words are easy to read on which color
        </Text>
        <Grid columns={[1, 1, 2]} gap={3}>
          {COLOR_PAIRS.map((p) => (
            <Card key={`${p.text}-${p.ground}`} radius={3} border style={{ overflow: 'hidden' }}>
              <Flex
                align="center"
                style={{ background: colorHex(p.ground), padding: '14px 16px', minHeight: 56 }}
              >
                <span style={{ color: colorHex(p.text), fontSize: 20, fontWeight: 600 }}>
                  {colorName(p.text)} on {colorName(p.ground)}
                </span>
              </Flex>
              <Box padding={3} style={{ background: HEIRLOOM.paper }}>
                <Text size={2} weight="semibold">
                  {p.verdict === 'easy' ? '✓ ' : p.verdict === 'no' ? '✗ ' : ''}
                  {READABILITY_WORDS[p.verdict]}
                </Text>
              </Box>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

// ── Fonts ────────────────────────────────────────────────────────────────────

function FontsSection() {
  return (
    <Section id="fonts" title="My fonts">
      <Text size={2} style={{ lineHeight: 1.6 }}>
        {FONT_LICENSE_NOTE}
      </Text>
      <Stack space={3}>
        {BRAND_FONTS.map((f) => (
          <Card key={f.id} padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
            <Stack space={4}>
              <Stack space={2}>
                <Text size={3} weight="semibold">
                  {f.name}: {f.role}
                </Text>
                <Text size={2} style={{ lineHeight: 1.5 }}>
                  {f.useFor}
                </Text>
              </Stack>
              <Box style={{ background: HEIRLOOM.linen, borderRadius: 6, padding: '12px 16px' }}>
                <img
                  src={`/brand-kit/specimens/${f.id}.svg`}
                  alt={`${f.specimen}, written in ${f.name}`}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: f.id === 'petemoss' ? 80 : 56,
                  }}
                />
              </Box>
              <Text size={2} muted>
                If you do not have it: {f.fallback}.
              </Text>
              <Flex wrap="wrap" gap={2}>
                {f.files.map((file) => (
                  <DownloadButton
                    key={file.file}
                    href={file.file}
                    label={`Download the ${f.name} ${file.style} font file (TTF, ${sizeOf(file.file)})`}
                  >
                    {f.name} {file.style}
                  </DownloadButton>
                ))}
                <DownloadButton
                  href={f.license}
                  tone="plain"
                  label={`Download the free license for ${f.name} (text file)`}
                >
                  License
                </DownloadButton>
                <DownloadButton
                  href={f.googleFonts}
                  tone="plain"
                  external
                  label={`Open ${f.name} on Google Fonts in a new tab`}
                >
                  Get it free from Google Fonts
                </DownloadButton>
              </Flex>
            </Stack>
          </Card>
        ))}
      </Stack>
      <Card padding={4} radius={3} border tone="primary">
        <Text size={2} style={{ lineHeight: 1.6 }}>
          {FONT_FALLBACK_NOTE}
        </Text>
      </Card>
      <Text size={3} weight="semibold">
        How to install the fonts
      </Text>
      <Grid columns={[1, 1, 2]} gap={3}>
        {INSTALL_STEPS.map((s) => (
          <Card key={s.id} padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
            <Stack space={3}>
              <Text size={3} weight="semibold">
                {s.title}
              </Text>
              <Stack as="ol" space={3} style={{ margin: 0, paddingLeft: '1.4rem' }}>
                {s.steps.map((step) => (
                  <Text as="li" size={2} key={step} style={{ lineHeight: 1.5 }}>
                    {step}
                  </Text>
                ))}
              </Stack>
              {s.note ? (
                <Text size={2} muted style={{ lineHeight: 1.5 }}>
                  {s.note}
                </Text>
              ) : null}
            </Stack>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}

// ── How I sound ──────────────────────────────────────────────────────────────

function VoiceSection() {
  const { copied, copy } = useCopied();
  return (
    <Section id="voice" title="How I sound">
      <Card padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
        <Stack space={4}>
          <Stack space={2}>
            <Text size={2} weight="semibold" muted>
              My business in one sentence
            </Text>
            <Text size={3} style={{ lineHeight: 1.5 }}>
              {VOICE.oneSentence}
            </Text>
          </Stack>
          <Stack space={2}>
            <Text size={2} weight="semibold" muted>
              My tagline (from My business details)
            </Text>
            <Text size={3} style={{ lineHeight: 1.5, fontStyle: 'italic' }}>
              {manifest.tagline}
            </Text>
          </Stack>
        </Stack>
      </Card>
      <Stack as="ul" space={3} style={{ margin: 0, paddingLeft: '1.3rem' }}>
        {VOICE.howISound.map((v) => (
          <Text as="li" size={2} key={v} style={{ lineHeight: 1.5 }}>
            {v}
          </Text>
        ))}
      </Stack>
      <Stack space={3}>
        <Text size={3} weight="semibold">
          Lines from my own website
        </Text>
        {VOICE.realLines.map((l) => (
          <Card
            key={l}
            padding={4}
            radius={3}
            border
            style={{ borderLeft: `4px solid ${HEIRLOOM.claret}` }}
          >
            <Text size={2} style={{ lineHeight: 1.5 }}>
              {l}
            </Text>
          </Card>
        ))}
      </Stack>
      <Stack space={3}>
        <Text size={3} weight="semibold">
          Three example posts
        </Text>
        <Text size={2} muted>
          {VOICE.captionsNote}
        </Text>
        {VOICE.captions.map((c, i) => (
          <Card key={c} padding={4} radius={3} border style={{ background: HEIRLOOM.paper }}>
            <Flex gap={3} align="flex-start" wrap="wrap">
              <Box style={{ flex: '1 1 260px' }}>
                <Text size={2} style={{ lineHeight: 1.6 }}>
                  {c}
                </Text>
              </Box>
              <CopyButton
                id={`caption-${i}`}
                text={c}
                name={`example post ${i + 1}`}
                copied={copied}
                onCopy={copy}
              />
            </Flex>
          </Card>
        ))}
      </Stack>
      <Card padding={4} radius={3} border tone="caution">
        <Stack space={3}>
          <Text size={3} weight="semibold">
            Words I never use
          </Text>
          <Stack as="ul" space={3} style={{ margin: 0, paddingLeft: '1.3rem' }}>
            {VOICE.neverUse.map((v) => (
              <Text as="li" size={2} key={v} style={{ lineHeight: 1.5 }}>
                {v}
              </Text>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Section>
  );
}

// ── The pane ─────────────────────────────────────────────────────────────────

export function BrandKitPane() {
  return (
    <Box padding={[3, 4, 5]}>
      <Stack space={6} style={{ maxWidth: 1040, margin: '0 auto' }}>
        <Stack space={4}>
          <ToolHeading emoji="🎨">My brand kit</ToolHeading>
          <Text size={3} style={{ lineHeight: 1.6 }}>
            Your logo, colors and fonts, and pictures made at the right size for Facebook,
            Instagram, Pinterest and Google. They are yours to use anywhere.
          </Text>
          <DownloadEverything />
          <JumpMenu />
        </Stack>
        <LogoSection />
        <PicturesSection />
        <PrintSection />
        <ColorsSection />
        <FontsSection />
        <VoiceSection />
        <Text size={2} muted style={{ lineHeight: 1.5 }}>
          Stuck, or need a size that is not here? Ask Nathan. Downloading never changes your
          website.
        </Text>
      </Stack>
    </Box>
  );
}

/** For the top-bar tool registration in sanity.config.ts. */
export function BrandKitTool() {
  return (
    <Box style={{ height: '100%', overflow: 'auto', background: HEIRLOOM.linen }}>
      <BrandKitPane />
    </Box>
  );
}
