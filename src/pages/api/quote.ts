/**
 * Quote form Worker — POST /api/quote
 *
 * Flow:
 *  1. Parse multipart/form-data
 *  2. Validate Turnstile token (if TURNSTILE_SECRET_KEY is set)
 *  3. Validate required fields
 *  4. Back up form data + attachments to R2 (QUOTE_BACKUP binding)
 *  5. Send owner notification email via the Cloudflare Email Service binding (EMAIL)
 *  6. Send customer confirmation email via the same binding
 *  7. Redirect → /thank-you (303)
 */

import type { APIContext } from 'astro';
import {
  buildCustomerEmail,
  buildOwnerEmail,
  type EmailContext,
  type QuoteSubmission,
} from '@/lib/quote-email';
import { pickUtm } from '@/lib/utm';

export const prerender = false;

interface EmailMessage {
  to: string | string[];
  from: string | { email: string; name?: string };
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

interface Env {
  /** Cloudflare Email Service `send_email` binding (wrangler.jsonc). */
  EMAIL?: { send(message: EmailMessage): Promise<{ messageId?: string }> };
  QUOTE_OWNER_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  QUOTE_BACKUP?: R2Bucket;
}

/** Must match data-action on the widget in request-a-quote.astro. */
const TURNSTILE_ACTION = 'quote';
/** Frontend hostnames that may mint a token for this form (never localhost in production). */
const TURNSTILE_HOSTNAMES = new Set([
  'mas-monograms.com',
  'www.mas-monograms.com',
  'mas-monograms.nathanjnixon86.workers.dev',
]);

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST({ request, locals }: APIContext): Promise<Response> {
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env) return jsonError('Server misconfiguration', 500);

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return jsonError('Expected multipart/form-data', 400);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('Could not parse form data', 400);
  }

  // ── 1. Validate Turnstile ──────────────────────────────────────────────────
  if (env.TURNSTILE_SECRET_KEY) {
    const token = formData.get('cf-turnstile-response') as string | null;
    if (!token) return jsonError('Missing CAPTCHA token', 400);

    // Fail closed on network errors, non-2xx and non-JSON replies. A token is only
    // accepted for THIS form (action) on one of OUR hostnames, so a token minted on
    // another site's widget or another form cannot be replayed here.
    let tsBody: { success?: boolean; action?: string; hostname?: string } = {};
    try {
      const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: request.headers.get('CF-Connecting-IP') ?? undefined,
        }),
      });
      if (!tsRes.ok) throw new Error(`siteverify ${tsRes.status}`);
      tsBody = await tsRes.json();
    } catch (err) {
      console.error('Turnstile siteverify failed:', err);
      return jsonError('CAPTCHA verification failed', 400);
    }
    if (
      !tsBody.success ||
      tsBody.action !== TURNSTILE_ACTION ||
      !TURNSTILE_HOSTNAMES.has(tsBody.hostname ?? '')
    ) {
      return jsonError('CAPTCHA verification failed', 400);
    }
  }

  // ── 2. Validate required fields ────────────────────────────────────────────
  // NOTE: the select fields carry a "Recommend for me" / "Not sure" option that
  // is a VALID submitted value — we only reject the empty placeholder (""), so a
  // simple non-empty check is exactly right here.
  const itemType = (formData.get('itemType') as string | null)?.trim() ?? '';
  const ownership = (formData.get('ownership') as string | null)?.trim() ?? '';
  const personalization = (formData.get('personalization') as string | null)?.trim() ?? '';
  const monogramStyle = (formData.get('monogramStyle') as string | null)?.trim() ?? '';
  const placement = (formData.get('placement') as string | null)?.trim() ?? '';
  const size = (formData.get('size') as string | null)?.trim() ?? '';
  const threadCount = (formData.get('threadCount') as string | null)?.trim() ?? '';
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const phone = (formData.get('phone') as string | null)?.trim() ?? '';

  if (
    !itemType ||
    !ownership ||
    !personalization ||
    !monogramStyle ||
    !placement ||
    !size ||
    !threadCount ||
    !name ||
    !email
  ) {
    return jsonError('Required fields are missing', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError('Invalid email address', 400);
  }

  // ── 3. Collect optional fields ────────────────────────────────────────────
  const itemDescription = (formData.get('itemDescription') as string | null)?.trim() ?? '';
  const quantity = (formData.get('quantity') as string | null)?.trim() ?? '';
  const fontPreference = (formData.get('fontPreference') as string | null)?.trim() ?? '';
  const threadColor = (formData.get('threadColor') as string | null)?.trim() ?? '';
  const neededBy = (formData.get('neededBy') as string | null)?.trim() ?? '';
  const rush = (formData.get('rush') as string | null)?.trim() ?? '';
  const isGift = (formData.get('isGift') as string | null)?.trim() ?? 'no';
  const referral = (formData.get('referral') as string | null)?.trim() ?? '';
  const notes = (formData.get('notes') as string | null)?.trim() ?? '';
  const isRush = rush === 'yes';
  // Where they came from (hidden utm_* fields filled from the landing URL, see
  // src/lib/utm.ts). Re-validated here: only utm_source/medium/campaign, each
  // 1 to 40 letters, digits, hyphens or underscores; anything else is ignored.
  const utm = pickUtm(formData);

  // ── 4. Validate file attachments ──────────────────────────────────────────
  const rawFiles = formData.getAll('attachments') as File[];
  const attachments = rawFiles.filter((f) => f instanceof File && f.size > 0) as File[];

  for (const file of attachments) {
    if (file.size > MAX_FILE_SIZE) return jsonError(`File "${file.name}" exceeds 5 MB`, 400);
    if (!ALLOWED_MIME.has(file.type))
      return jsonError(`File "${file.name}" has unsupported type`, 400);
  }

  // ── 5. Backup to R2 ───────────────────────────────────────────────────────
  const submissionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const submissionData = {
    id: submissionId,
    submittedAt: new Date().toISOString(),
    // Contact
    name,
    email,
    phone,
    referral,
    // Item
    itemType,
    ownership,
    itemDescription,
    quantity,
    // Monogram spec
    personalization,
    monogramStyle,
    placement,
    size,
    threadCount,
    fontPreference,
    threadColor,
    // Logistics
    neededBy,
    rush: isRush,
    isGift,
    notes,
    attachmentNames: attachments.map((f) => f.name),
    // Source tags ({} when none)
    utm,
  };

  if (env.QUOTE_BACKUP) {
    try {
      await env.QUOTE_BACKUP.put(
        `submissions/${submissionId}/data.json`,
        JSON.stringify(submissionData, null, 2),
        { httpMetadata: { contentType: 'application/json' } },
      );
      for (const file of attachments) {
        const buf = await file.arrayBuffer();
        await env.QUOTE_BACKUP.put(`submissions/${submissionId}/attachments/${file.name}`, buf, {
          httpMetadata: { contentType: file.type },
        });
      }
    } catch (err) {
      console.error('R2 backup failed (non-fatal):', err);
    }
  }

  // ── 6. Send emails via Cloudflare Email Service ───────────────────────────
  // The request is already safe in R2 above, but a visitor must never be shown
  // "Thank you" for a quote Mary Ann was not told about. If the owner email is
  // not configured or fails, say so (502) so the form shows its error state.
  if (!env.EMAIL || !env.QUOTE_OWNER_EMAIL) {
    console.error('Email not configured: missing EMAIL binding or QUOTE_OWNER_EMAIL');
    return jsonError('We could not send your request. Please email us directly.', 502);
  }

  // The bodies are built (and every form value escaped) in src/lib/quote-email.ts.
  const submission: QuoteSubmission = {
    submissionId,
    submittedAt: new Date(),
    name,
    email,
    phone,
    referral,
    itemType,
    ownership,
    itemDescription,
    quantity,
    personalization,
    monogramStyle,
    placement,
    size,
    threadCount,
    fontPreference,
    threadColor,
    neededBy,
    isRush,
    isGift: isGift === 'yes',
    notes,
    attachmentNames: attachments.map((f) => f.name),
    utm,
  };
  const ctx = await loadEmailContext();
  // The customer can always reach Mary Ann: Sanity's email first, the owner inbox if Sanity is down.
  if (!ctx.email) ctx.email = env.QUOTE_OWNER_EMAIL;
  const owner = buildOwnerEmail(submission, ctx);
  const customer = buildCustomerEmail(submission, ctx);

  const from = { email: 'noreply@mas-monograms.com', name: 'MAS Monograms' };
  const results = await Promise.allSettled([
    // Owner notification (index 0)
    env.EMAIL.send({
      from,
      to: env.QUOTE_OWNER_EMAIL,
      replyTo: email,
      subject: owner.subject,
      html: owner.html,
      text: owner.text,
    }),
    // Customer confirmation (index 1)
    env.EMAIL.send({
      from,
      to: email,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
    }),
  ]);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(
        `Email ${i === 0 ? 'owner notification' : 'customer confirmation'} failed:`,
        r.reason,
      );
    }
  });
  // Mary Ann's copy is the one that matters. If it failed, do not claim success.
  if (results[0].status === 'rejected') {
    return jsonError('We could not send your request. Please email us directly.', 502);
  }

  return new Response(null, { status: 303, headers: { Location: '/thank-you/' } });
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Escape a user-supplied string for safe interpolation into email HTML.
 * Neutralizes the five HTML-significant characters so submitted values can't
 * inject markup, break out of attributes (e.g. the mailto: href), or spoof
 * content in Mary Ann's / the customer's inbox.
 */

/**
 * Contact details and the "what's next" lines for the emails, read from Sanity's
 * public CDN at send time so Mary Ann's edits reach the emails too. Bounded (2.5s)
 * and never fatal: on any failure the emails use their built-in wording.
 */
async function loadEmailContext(): Promise<EmailContext> {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
  if (!projectId) return {};
  const query = `{
    "site": *[_id == "siteSettings"][0]{ title, email, phone, "city": address.city, "state": address.state },
    "ty": *[_id == "thankYouPage"][0]{ nextStepsLabel, nextSteps }
  }`;
  try {
    const res = await fetch(
      `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) throw new Error(`Sanity ${res.status}`);
    const { result } = (await res.json()) as { result?: any };
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
    return {
      businessName: str(result?.site?.title),
      email: str(result?.site?.email),
      phone: str(result?.site?.phone),
      city: str(result?.site?.city),
      state: str(result?.site?.state),
      nextStepsLabel: str(result?.ty?.nextStepsLabel),
      nextSteps: Array.isArray(result?.ty?.nextSteps)
        ? result.ty.nextSteps.map(str).filter(Boolean)
        : undefined,
    };
  } catch (err) {
    console.error('Email context fetch failed (using built-in wording):', err);
    return {};
  }
}
