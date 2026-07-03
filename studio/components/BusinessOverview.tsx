// BusinessOverview.tsx — Panel 2 of the Start Here handbook ("Your business at
// a glance"). Live data pulled straight from the real MAS Monograms documents
// (Pricing Tiers + Site Settings) alongside the editable notes (studioNotes),
// so the top of the panel is always current no matter what Mary Ann changes.
//
// Rewritten 2026-07-03: the original queried a generic `service` type and
// interior-design settings fields (availabilityStatus, travelFees,
// socialInstagram) that this project never had. It now queries pricingTier and
// the real siteSettings fields. Safe to edit by hand.

import React, { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { Box, Card, Container, Heading, Stack, Text } from '@sanity/ui';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PricingTier {
  label: string | null;
  pricePerPiece: number | null;
  note: string | null;
}

interface SocialLink {
  platform: string | null;
  url: string | null;
}

interface SiteSettingsData {
  email: string | null;
  phone: string | null;
  serviceArea: string | null;
  city: string | null;
  state: string | null;
  standardTurnaround: string | null;
  rushOrdersAvailable: boolean | null;
  rushTurnaround: string | null;
  priceRange: string | null;
  googleBusinessUrl: string | null;
  socialLinks: SocialLink[] | null;
}

interface NotesData {
  businessSummary: string | null;
  idealClient: string | null;
  voiceSummary: string | null;
  wordsToAvoid: string[] | null;
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

const PRICING_QUERY = `*[_type=="pricingTier"]|order(displayOrder asc){label, pricePerPiece, note}`;
const SETTINGS_QUERY = `*[_type=="siteSettings"][0]{
  email, phone, serviceArea,
  "city": address.city, "state": address.state,
  standardTurnaround, rushOrdersAvailable, rushTurnaround, priceRange,
  googleBusinessUrl,
  socialLinks[]{platform, url}
}`;
const NOTES_QUERY = `*[_type=="studioNotes"][0]{businessSummary, idealClient, voiceSummary, wordsToAvoid}`;

/** Split a text field on blank lines into paragraphs. */
function paragraphs(text?: string | null): string[] {
  return (text ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingCard({ label }: { label: string }) {
  return (
    <Card padding={4} radius={2} shadow={1} tone="transparent">
      <Text size={1} muted>Loading {label}...</Text>
    </Card>
  );
}

function ErrorCard({ label }: { label: string }) {
  return (
    <Card padding={4} radius={2} shadow={1} tone="caution">
      <Text size={1}>
        Could not load {label} right now. Open Site Settings or Content to see the current values.
      </Text>
    </Card>
  );
}

/** A labeled value row, only rendered when the value is present. */
function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <Box>
      <Text size={1} weight="semibold">{label}</Text>
      <Box marginTop={1}><Text size={1}>{value}</Text></Box>
    </Box>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BusinessOverview() {
  const client = useClient({ apiVersion: '2024-01-01' });

  const [pricing, setPricing] = useState<PricingTier[] | null>(null);
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [notes, setNotes] = useState<NotesData | null>(null);
  const [pricingError, setPricingError] = useState(false);
  const [settingsError, setSettingsError] = useState(false);

  useEffect(() => {
    client.fetch<PricingTier[]>(PRICING_QUERY).then((d) => setPricing(d ?? [])).catch(() => setPricingError(true));
    client.fetch<SiteSettingsData | null>(SETTINGS_QUERY).then((d) => setSettings(d ?? null)).catch(() => setSettingsError(true));
    client.fetch<NotesData | null>(NOTES_QUERY).then((d) => setNotes(d ?? null)).catch(() => { /* notes optional */ });
  }, [client]);

  const socials = (settings?.socialLinks ?? []).filter((s) => s?.url);

  return (
    <Container width={1} padding={4}>
      <Stack space={6}>

        {/* Header */}
        <Box>
          <Heading as="h1" size={3}>Your business at a glance</Heading>
          <Box marginTop={3}>
            <Text muted size={1}>
              The live sections below are pulled straight from your Pricing Tiers and Site
              Settings, so they are always current. To change anything here, edit those
              documents. The lower sections (who you are, ideal client, voice) are notes you
              can edit under "Edit notes".
            </Text>
          </Box>
        </Box>

        {/* ── LIVE: Pricing tiers ──────────────────────────────────────────── */}
        <Card padding={4} radius={2} shadow={1} tone="default">
          <Stack space={4}>
            <Heading as="h2" size={1}>Your pricing tiers (live)</Heading>

            {pricing === null && !pricingError && <LoadingCard label="pricing" />}
            {pricingError && <ErrorCard label="pricing" />}

            {pricing !== null && pricing.length === 0 && (
              <Text size={1} muted>No pricing tiers yet. Add them under Content → Pricing Tiers.</Text>
            )}
            {pricing !== null && pricing.length > 0 && (
              <Stack space={3}>
                {pricing.map((tier, i) => (
                  <Card key={i} padding={3} radius={2} tone="transparent" shadow={1}>
                    <Stack space={2}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                        <Text size={1} weight="semibold">{tier.label ?? 'Unnamed tier'}</Text>
                        <Text size={1}>{tier.pricePerPiece != null ? `$${tier.pricePerPiece.toFixed(2)} / piece` : '—'}</Text>
                      </Box>
                      {tier.note ? <Text size={1} muted>{tier.note}</Text> : null}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* ── LIVE: Contact, turnaround, reach ─────────────────────────────── */}
        <Card padding={4} radius={2} shadow={1} tone="default">
          <Stack space={4}>
            <Heading as="h2" size={1}>Contact, turnaround, and reach (live)</Heading>

            {settings === null && !settingsError && <LoadingCard label="site settings" />}
            {settingsError && <ErrorCard label="site settings" />}

            {settings !== null && (
              <Stack space={3}>
                <Field label="Email" value={settings.email} />
                <Field label="Phone" value={settings.phone} />
                <Field
                  label="Location"
                  value={[settings.city, settings.state].filter(Boolean).join(', ') || null}
                />
                <Field label="Service area" value={settings.serviceArea} />
                <Field label="Standard turnaround" value={settings.standardTurnaround} />
                <Field
                  label="Rush orders"
                  value={
                    settings.rushOrdersAvailable
                      ? (settings.rushTurnaround ? `Available — ${settings.rushTurnaround}` : 'Available')
                      : 'Not currently offered'
                  }
                />
                <Field label="Price range (Google listing)" value={settings.priceRange} />
                <Field label="Google Business Profile" value={settings.googleBusinessUrl} />
                {socials.length > 0 && (
                  <Box>
                    <Text size={1} weight="semibold">Social</Text>
                    <Box marginTop={1}>
                      <Stack space={1}>
                        {socials.map((s, i) => (
                          <Text key={i} size={1}>{s.platform}: {s.url}</Text>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* ── EDITABLE: Who you are ────────────────────────────────────────── */}
        {notes?.businessSummary && (
          <Card padding={4} radius={2} shadow={1} tone="default">
            <Stack space={3}>
              <Heading as="h2" size={1}>Who you are</Heading>
              {paragraphs(notes.businessSummary).map((p, i) => (<Text key={i} size={1}>{p}</Text>))}
            </Stack>
          </Card>
        )}

        {/* ── EDITABLE: Your ideal customer ────────────────────────────────── */}
        {notes?.idealClient && (
          <Card padding={4} radius={2} shadow={1} tone="default">
            <Stack space={3}>
              <Heading as="h2" size={1}>Your ideal customer</Heading>
              {paragraphs(notes.idealClient).map((p, i) => (<Text key={i} size={1}>{p}</Text>))}
            </Stack>
          </Card>
        )}

        {/* ── EDITABLE: Your voice ─────────────────────────────────────────── */}
        {(notes?.voiceSummary || (notes?.wordsToAvoid && notes.wordsToAvoid.length > 0)) && (
          <Card padding={4} radius={2} shadow={1} tone="default">
            <Stack space={3}>
              <Heading as="h2" size={1}>Your voice (how you sound in writing)</Heading>
              {paragraphs(notes?.voiceSummary).map((p, i) => (<Text key={i} size={1}>{p}</Text>))}
              {notes?.wordsToAvoid && notes.wordsToAvoid.length > 0 && (
                <>
                  <Text size={1} weight="semibold">Words to skip:</Text>
                  <Text size={1}>{notes.wordsToAvoid.join(', ')}.</Text>
                </>
              )}
            </Stack>
          </Card>
        )}

      </Stack>
    </Container>
  );
}
