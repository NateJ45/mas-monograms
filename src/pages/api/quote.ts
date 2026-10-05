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
    console.error('Email not configured — missing EMAIL binding or QUOTE_OWNER_EMAIL');
    return jsonError('We could not send your request. Please email us directly.', 502);
  }

  // All values below originate from the public form, so every interpolation
  // into email HTML must be escaped to prevent HTML/attribute injection into
  // Mary Ann's (and the customer's) inbox. escapeHtml() handles the raw fields;
  // multi-line fields escape FIRST, then swap newlines for <br/>.
  const eName = escapeHtml(name);
  const eEmail = escapeHtml(email);
  const ePhone = escapeHtml(phone);
  const eReferral = escapeHtml(referral);
  const eItemType = escapeHtml(itemType);
  const eOwnership = escapeHtml(ownership);
  const eItemDescription = escapeHtml(itemDescription);
  const eQuantity = escapeHtml(quantity);
  const eMonogramStyle = escapeHtml(monogramStyle);
  const ePlacement = escapeHtml(placement);
  const eSize = escapeHtml(size);
  const eThreadCount = escapeHtml(threadCount);
  const eFontPreference = escapeHtml(fontPreference);
  const eThreadColor = escapeHtml(threadColor);
  const eNeededBy = escapeHtml(neededBy);
  const ePersonalization = escapeHtml(personalization);
  const eNotes = escapeHtml(notes);

  const attachmentRows = attachments.length
    ? `<p style="margin:0 0 10px;"><strong style="color:#0f1b2d;">Attachments:</strong> ${attachments.map((f) => escapeHtml(f.name)).join(', ')}</p>`
    : '';

  // Both bodies wear Heirloom Coast in inline styles (email clients ignore stylesheets):
  // a Linen ground, a Paper card with a soft border, Midnight and Indigo headings in a
  // serif, Ink text, a dashed brass hairline between sections, Brass for the small meta
  // line, Claret only for the one thing that needs emphasis (a rush). Every submitted
  // value is still escaped above; htmlToText() makes the plain-text twin from the same HTML.
  const S = {
    body: 'margin:0;padding:0;background-color:#f4eee3;',
    wrap: 'max-width:600px;margin:0 auto;padding:24px 16px;',
    card: 'background-color:#fbf8f1;border:1px solid #d8cfbc;padding:28px 24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#26312e;',
    h2: 'margin:0 0 14px;font-family:Georgia,Times New Roman,serif;font-size:24px;font-weight:normal;line-height:1.25;color:#0f1b2d;',
    h3: 'margin:0 0 10px;font-family:Georgia,Times New Roman,serif;font-size:18px;font-weight:normal;line-height:1.3;color:#28486b;',
    p: 'margin:0 0 10px;',
    label: 'color:#0f1b2d;',
    link: 'color:#28486b;',
    hr: 'border:0;border-top:1px dashed #b98a3e;margin:20px 0;',
    meta: 'margin:0;font-size:12px;line-height:1.5;color:#835a24;',
    em: 'color:#8c3a2e;font-weight:bold;',
  };
  const hr = `<hr style="${S.hr}"/>`;
  // A question label ("Owns the item?") takes no colon, as before.
  const row = (label: string, value: string) =>
    `<p style="${S.p}"><strong style="${S.label}">${label}${label.endsWith('?') ? '' : ':'}</strong> ${value}</p>`;
  const shell = (inner: string) => `
<!DOCTYPE html><html><body style="${S.body}"><div style="${S.wrap}"><div style="${S.card}">
${inner}
</div></div></body></html>
`;

  const ownerHtml = shell(`
<h2 style="${S.h2}">New quote request</h2>
${row('Submission ID', submissionId)}
${row('Date', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))}
${hr}
<h3 style="${S.h3}">Contact</h3>
${row('Name', eName)}
${row('Email', `<a href="mailto:${eEmail}" style="${S.link}">${eEmail}</a>`)}
${row('Phone', ePhone)}
${eReferral ? row('How they heard about us', eReferral) : ''}
${hr}
<h3 style="${S.h3}">Item</h3>
${row('Item Type', eItemType)}
${row('Owns the item?', eOwnership)}
${eItemDescription ? row('Item Description', eItemDescription) : ''}
${eQuantity ? row('Quantity', eQuantity) : ''}
${hr}
<h3 style="${S.h3}">Monogram Spec</h3>
<p style="${S.p}"><strong style="${S.label}">Personalization:</strong><br/>${ePersonalization.replace(/\n/g, '<br/>')}</p>
${row('Monogram Style', eMonogramStyle)}
${row('Placement', ePlacement)}
${row('Approximate Size', eSize)}
${row('Number of Thread Colors', eThreadCount)}
${eFontPreference ? row('Font Preference', eFontPreference) : ''}
${eThreadColor ? row('Thread Color Preference', eThreadColor) : ''}
${hr}
<h3 style="${S.h3}">Logistics</h3>
${eNeededBy ? row('Needed By', eNeededBy) : ''}
${row('Rush?', isRush ? `<span style="${S.em}">Yes, rush requested</span>` : 'No')}
${row('Gift?', isGift === 'yes' ? 'Yes' : 'No')}
${eNotes ? `<p style="${S.p}"><strong style="${S.label}">Notes:</strong><br/>${eNotes.replace(/\n/g, '<br/>')}</p>` : ''}
${attachmentRows}
${hr}
<p style="${S.meta}">Reply directly to this email to respond to the customer.</p>
`);

  const customerHtml = shell(`
<h2 style="${S.h2}">We received your quote request!</h2>
<p style="${S.p}">Hi ${eName},</p>
<p style="${S.p}">Thank you for reaching out to MAS Monograms! Mary Ann has received your request and will be in touch within 1–2 business days to discuss your order.</p>
${hr}
<h3 style="${S.h3}">What you submitted</h3>
${row('Item', `${eItemType}${eQuantity ? ` (Qty: ${eQuantity})` : ''}`)}
${row('Do you own the item?', eOwnership)}
${eItemDescription ? row('Item description', eItemDescription) : ''}
${row('Personalization', ePersonalization)}
${row('Monogram style', eMonogramStyle)}
${row('Placement', ePlacement)}
${row('Approximate size', eSize)}
${row('Number of thread colors', eThreadCount)}
${eFontPreference ? row('Font preference', eFontPreference) : ''}
${eThreadColor ? row('Thread color', eThreadColor) : ''}
${eNeededBy ? row('Needed by', eNeededBy) : ''}
${isRush ? row('Rush requested', `<span style="${S.em}">Yes, a rush fee may apply.</span>`) : ''}
${hr}
<p style="${S.p}">If you have any questions in the meantime, you can reply to this email or contact Mary Ann directly.</p>
<p style="${S.meta}">MAS Monograms, St. Matthews, SC</p>
`);

  const from = { email: 'noreply@mas-monograms.com', name: 'MAS Monograms' };
  const results = await Promise.allSettled([
    // Owner notification (index 0)
    env.EMAIL.send({
      from,
      to: env.QUOTE_OWNER_EMAIL,
      replyTo: email,
      subject: `New Quote Request from ${name}`,
      html: ownerHtml,
      text: htmlToText(ownerHtml),
    }),
    // Customer confirmation (index 1)
    env.EMAIL.send({
      from,
      to: email,
      subject: 'We got your quote request! | MAS Monograms',
      html: customerHtml,
      text: htmlToText(customerHtml),
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

  return new Response(null, { status: 303, headers: { Location: '/thank-you' } });
}

/** Plain-text twin of the HTML bodies (helps deliverability and text-only clients). */
function htmlToText(html: string): string {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|div|tr)>/gi, '\n')
    .replace(/<hr[^>]*>/gi, '\n---\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
