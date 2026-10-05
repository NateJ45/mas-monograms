// Foundation, edit with care
// =============================================================================
// GooglePreviewInput: "How this looks on Google" (2026-10-05, Phase D)
// =============================================================================
// Adapted from the PORTABLE components/SeoSnippetInput.tsx (fbcm, the starter;
// PORTS card 34). It is a custom INPUT for the value-less `seoPreview` box
// (schemaTypes/_seoPreview.ts) at the top of "Google and sharing", and draws two
// pictures of the page as she types: the Google result and the card a shared
// link makes on Facebook or in a text message.
//
// WHY NOT THE PORTABLE FILE AS IT IS (it is not copied; nothing here is shared
// code, so sync-check has nothing to compare):
//   - Address. The PORTABLE input builds the address from a `slug` box, and
//     only a shop category has one here, so every other page would show the
//     bare domain. This reads the real path from pathForDoc (../urls.ts) and
//     the real domain, mas-monograms.com (as the QR tool does), never the
//     Studio's own origin.
//   - Her words and her size. Larger text, and soft length hints in letters
//     ("Google shows about 60 letters; yours has 72, so the end may be cut
//     off") instead of silent clipping. Hints, never errors (spec principle 4).
//
// THE INPUT/VIEW SPLIT (from the PORTABLE header, still true): useFormValue is
// allowed because an input always renders inside the document form. A document
// VIEW must never call it: inside "Edit on the page" there is no form provider,
// the hook throws and the panel freezes.
// =============================================================================

import { useFormValue } from 'sanity';
import { Box, Card, Flex, Stack, Text } from '@sanity/ui';
import { envVal, pathForDoc } from '../urls';
import { DESCRIPTION_IDEAL, TITLE_IDEAL, descriptionHint, titleHint } from '../lib/googlePreview';

/** The live site's domain, as Google shows it. */
const DOMAIN = 'mas-monograms.com';

/** What each page is called, for the title Google gets when hers is empty. */
const PAGE_NAMES: Record<string, string> = {
  homePage: 'MAS Monograms',
  aboutPage: 'About',
  howItWorksPage: 'How It Works',
  pricingPage: 'Pricing',
  requestAQuotePage: 'Request a Quote',
  shopIndexPage: 'Shop by Item',
  styleGalleryPage: 'Style Gallery',
  fontGuidePage: 'Font & Lettering Guide',
  threadChartPage: 'Thread Color Chart',
  clearancePage: 'Clearance',
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const clamp = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}...` : text;

/** The CDN address of an image box's picture, or null (as in SeoSnippetInput). */
function pictureUrl(value: unknown): string | null {
  const ref = (value as { asset?: { _ref?: string } } | undefined)?.asset?._ref;
  if (typeof ref !== 'string') return null;
  const parts = ref.split('-');
  if (parts.length < 4 || parts[0] !== 'image') return null;
  const projectId = envVal('SANITY_STUDIO_PROJECT_ID', 'PUBLIC_SANITY_PROJECT_ID');
  const dataset = envVal('SANITY_STUDIO_DATASET', 'PUBLIC_SANITY_DATASET') || 'production';
  if (!projectId) return null;
  const ext = parts[parts.length - 1];
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${parts.slice(1, -1).join('-')}.${ext}?w=600&h=315&fit=crop`;
}

function Hint({ text, tone }: { text: string; tone: 'ok' | 'soft' }) {
  return (
    <Text size={2} muted={tone === 'ok'} style={{ lineHeight: 1.5 }}>
      {text}
    </Text>
  );
}

export function GooglePreviewInput() {
  const doc = (useFormValue([]) ?? {}) as Record<string, unknown>;
  const type = str(doc._type);

  const path = pathForDoc(type, doc) ?? '/';
  // Google writes the address as "mas-monograms.com › pricing".
  const address = [DOMAIN, ...path.split('/').filter(Boolean)].join(' › ');

  const ownTitle = str(doc.seoTitle);
  const name =
    str(doc.name) || str(doc.title) || PAGE_NAMES[type] || str(doc.heroHeadline) || 'This page';
  const title = ownTitle || (type === 'homePage' ? name : `${name} | MAS Monograms`);

  const ownDescription = str(doc.seoDescription);
  const description =
    ownDescription ||
    str(doc.description) ||
    str(doc.heroSubhead) ||
    'No short description yet, so a general one is used.';

  const picture = pictureUrl(doc.seoImage);
  const tHint = titleHint(ownTitle.length);
  const dHint = descriptionHint(ownDescription.length);

  return (
    <Stack space={4}>
      <Text size={2} style={{ lineHeight: 1.6 }}>
        This is a picture of how this page shows up. It changes as you type in the boxes below.
      </Text>

      {/* The Google result */}
      <Card padding={4} radius={3} border tone="default" style={{ background: '#ffffff' }}>
        <Stack space={3}>
          <Text size={1} weight="semibold" muted>
            On Google
          </Text>
          <Text size={2} style={{ color: '#4d5156' }}>
            {address}
          </Text>
          <Text size={4} style={{ color: '#1a0dab', lineHeight: 1.3 }}>
            {clamp(title, TITLE_IDEAL)}
          </Text>
          <Text size={2} style={{ color: '#4d5156', lineHeight: 1.6 }}>
            {clamp(description, DESCRIPTION_IDEAL)}
          </Text>
        </Stack>
      </Card>
      <Stack space={2}>
        <Hint
          text={ownTitle ? tHint.text : 'Title: empty, so your usual title for this page is used.'}
          tone={tHint.tone}
        />
        <Hint
          text={
            ownDescription
              ? dHint.text
              : 'Short description: empty. Writing one helps people choose your page.'
          }
          tone={dHint.tone}
        />
      </Stack>

      {/* The shared-link card */}
      <Card radius={3} overflow="hidden" border style={{ maxWidth: 520 }}>
        <Box
          style={{
            height: 180,
            background: picture
              ? `center / cover no-repeat url(${JSON.stringify(picture)})`
              : 'linear-gradient(135deg,#2c3a5a,#8a7a5c)',
          }}
        >
          {!picture && (
            <Flex align="center" justify="center" style={{ height: '100%', padding: 16 }}>
              <Text size={2} style={{ color: 'rgba(255,255,255,0.92)', textAlign: 'center' }}>
                Your usual picture for this page
              </Text>
            </Flex>
          )}
        </Box>
        <Card padding={4} style={{ background: '#f2f3f5' }}>
          <Stack space={3}>
            <Text size={1} weight="semibold" muted>
              When someone shares a link to this page
            </Text>
            <Text size={1} muted style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {DOMAIN}
            </Text>
            <Text size={2} weight="semibold" style={{ color: '#1a1a1a' }}>
              {clamp(title, 70)}
            </Text>
            <Text size={2} style={{ color: '#4d5156', lineHeight: 1.5 }}>
              {clamp(description, 120)}
            </Text>
          </Stack>
        </Card>
      </Card>
    </Stack>
  );
}
