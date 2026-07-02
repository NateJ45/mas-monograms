/**
 * Quote form Worker — POST /api/quote
 *
 * Flow:
 *  1. Parse multipart/form-data
 *  2. Validate Turnstile token (if TURNSTILE_SECRET_KEY is set)
 *  3. Validate required fields
 *  4. Back up form data + attachments to R2 (QUOTE_BACKUP binding)
 *  5. Send owner notification email via Resend
 *  6. Send customer confirmation email via Resend
 *  7. Redirect → /thank-you (303)
 */

import type { APIContext } from 'astro';

export const prerender = false;

interface Env {
  RESEND_API_KEY: string;
  QUOTE_OWNER_EMAIL: string;
  TURNSTILE_SECRET_KEY?: string;
  QUOTE_BACKUP?: R2Bucket;
}

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

    const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    });
    const tsBody = await tsRes.json() as { success: boolean };
    if (!tsBody.success) return jsonError('CAPTCHA verification failed', 400);
  }

  // ── 2. Validate required fields ────────────────────────────────────────────
  // NOTE: the select fields carry a "Recommend for me" / "Not sure" option that
  // is a VALID submitted value — we only reject the empty placeholder (""), so a
  // simple non-empty check is exactly right here.
  const itemType        = (formData.get('itemType')        as string | null)?.trim() ?? '';
  const ownership       = (formData.get('ownership')       as string | null)?.trim() ?? '';
  const personalization = (formData.get('personalization') as string | null)?.trim() ?? '';
  const monogramStyle   = (formData.get('monogramStyle')   as string | null)?.trim() ?? '';
  const placement       = (formData.get('placement')       as string | null)?.trim() ?? '';
  const size            = (formData.get('size')            as string | null)?.trim() ?? '';
  const threadCount     = (formData.get('threadCount')     as string | null)?.trim() ?? '';
  const name            = (formData.get('name')            as string | null)?.trim() ?? '';
  const email           = (formData.get('email')           as string | null)?.trim() ?? '';
  const phone           = (formData.get('phone')           as string | null)?.trim() ?? '';

  if (
    !itemType || !ownership || !personalization || !monogramStyle ||
    !placement || !size || !threadCount || !name || !email || !phone
  ) {
    return jsonError('Required fields are missing', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError('Invalid email address', 400);
  }

  // ── 3. Collect optional fields ────────────────────────────────────────────
  const itemDescription = (formData.get('itemDescription') as string | null)?.trim() ?? '';
  const quantity        = (formData.get('quantity')        as string | null)?.trim() ?? '';
  const fontPreference  = (formData.get('fontPreference')  as string | null)?.trim() ?? '';
  const threadColor     = (formData.get('threadColor')     as string | null)?.trim() ?? '';
  const neededBy        = (formData.get('neededBy')        as string | null)?.trim() ?? '';
  const rush            = (formData.get('rush')            as string | null)?.trim() ?? '';
  const isGift          = (formData.get('isGift')          as string | null)?.trim() ?? 'no';
  const referral        = (formData.get('referral')        as string | null)?.trim() ?? '';
  const notes           = (formData.get('notes')           as string | null)?.trim() ?? '';
  const isRush          = rush === 'yes';

  // ── 4. Validate file attachments ──────────────────────────────────────────
  const rawFiles = formData.getAll('attachments') as File[];
  const attachments = rawFiles.filter((f) => f instanceof File && f.size > 0) as File[];

  for (const file of attachments) {
    if (file.size > MAX_FILE_SIZE) return jsonError(`File "${file.name}" exceeds 5 MB`, 400);
    if (!ALLOWED_MIME.has(file.type)) return jsonError(`File "${file.name}" has unsupported type`, 400);
  }

  // ── 5. Backup to R2 ───────────────────────────────────────────────────────
  const submissionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const submissionData = {
    id: submissionId,
    submittedAt: new Date().toISOString(),
    // Contact
    name, email, phone, referral,
    // Item
    itemType, ownership, itemDescription, quantity,
    // Monogram spec
    personalization, monogramStyle, placement, size,
    threadCount, fontPreference, threadColor,
    // Logistics
    neededBy, rush: isRush, isGift, notes,
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
        await env.QUOTE_BACKUP.put(
          `submissions/${submissionId}/attachments/${file.name}`,
          buf,
          { httpMetadata: { contentType: file.type } },
        );
      }
    } catch (err) {
      console.error('R2 backup failed (non-fatal):', err);
    }
  }

  // ── 6. Send emails via Resend ─────────────────────────────────────────────
  if (!env.RESEND_API_KEY || !env.QUOTE_OWNER_EMAIL) {
    console.error('Resend not configured — missing RESEND_API_KEY or QUOTE_OWNER_EMAIL');
    return new Response(null, { status: 303, headers: { Location: '/thank-you' } });
  }

  const attachmentRows = attachments.length
    ? `<p><strong>Attachments:</strong> ${attachments.map((f) => f.name).join(', ')}</p>`
    : '';

  const ownerHtml = `
<!DOCTYPE html><html><body style="font-family: sans-serif; color: #2c2c28; max-width: 600px; margin: 0 auto; padding: 24px;">
<h2 style="color:#4a5e4c;">New Quote Request — MAS Monograms</h2>
<p><strong>Submission ID:</strong> ${submissionId}</p>
<p><strong>Date:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
<hr style="border:1px solid #e8ede8;margin:16px 0;"/>
<h3>Contact</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>Phone:</strong> ${phone}</p>
${referral ? `<p><strong>How they heard about us:</strong> ${referral}</p>` : ''}
<hr style="border:1px solid #e8ede8;margin:16px 0;"/>
<h3>Item</h3>
<p><strong>Item Type:</strong> ${itemType}</p>
<p><strong>Owns the item?</strong> ${ownership}</p>
${itemDescription ? `<p><strong>Item Description:</strong> ${itemDescription}</p>` : ''}
${quantity ? `<p><strong>Quantity:</strong> ${quantity}</p>` : ''}
<hr style="border:1px solid #e8ede8;margin:16px 0;"/>
<h3>Monogram Spec</h3>
<p><strong>Personalization:</strong><br/>${personalization.replace(/\n/g, '<br/>')}</p>
<p><strong>Monogram Style:</strong> ${monogramStyle}</p>
<p><strong>Placement:</strong> ${placement}</p>
<p><strong>Approximate Size:</strong> ${size}</p>
<p><strong>Number of Thread Colors:</strong> ${threadCount}</p>
${fontPreference ? `<p><strong>Font Preference:</strong> ${fontPreference}</p>` : ''}
${threadColor ? `<p><strong>Thread Color Preference:</strong> ${threadColor}</p>` : ''}
<hr style="border:1px solid #e8ede8;margin:16px 0;"/>
<h3>Logistics</h3>
${neededBy ? `<p><strong>Needed By:</strong> ${neededBy}</p>` : ''}
<p><strong>Rush?</strong> ${isRush ? 'Yes — rush requested' : 'No'}</p>
<p><strong>Gift?</strong> ${isGift === 'yes' ? 'Yes' : 'No'}</p>
${notes ? `<p><strong>Notes:</strong><br/>${notes.replace(/\n/g, '<br/>')}</p>` : ''}
${attachmentRows}
<hr style="border:1px solid #e8ede8;margin:16px 0;"/>
<p style="color:#8a9e8c;font-size:12px;">Reply directly to this email to respond to the customer.</p>
</body></html>
`;

  const customerHtml = `
<!DOCTYPE html><html><body style="font-family: sans-serif; color: #2c2c28; max-width: 600px; margin: 0 auto; padding: 24px;">
<h2 style="color:#4a5e4c;">We received your quote request!</h2>
<p>Hi ${name},</p>
<p>Thank you for reaching out to MAS Monograms! Mary Ann has received your request and will be in touch within 1–2 business days to discuss your order.</p>
<hr style="border:1px solid #e8ede8;margin:16px 0;"/>
<h3 style="color:#4a5e4c;">What you submitted</h3>
<p><strong>Item:</strong> ${itemType}${quantity ? ` (Qty: ${quantity})` : ''}</p>
<p><strong>Do you own the item?</strong> ${ownership}</p>
${itemDescription ? `<p><strong>Item description:</strong> ${itemDescription}</p>` : ''}
<p><strong>Personalization:</strong> ${personalization}</p>
<p><strong>Monogram style:</strong> ${monogramStyle}</p>
<p><strong>Placement:</strong> ${placement}</p>
<p><strong>Approximate size:</strong> ${size}</p>
<p><strong>Number of thread colors:</strong> ${threadCount}</p>
${fontPreference ? `<p><strong>Font preference:</strong> ${fontPreference}</p>` : ''}
${threadColor ? `<p><strong>Thread color:</strong> ${threadColor}</p>` : ''}
${neededBy ? `<p><strong>Needed by:</strong> ${neededBy}</p>` : ''}
${isRush ? `<p><strong>Rush requested:</strong> Yes — a rush fee may apply.</p>` : ''}
<hr style="border:1px solid #e8ede8;margin:16px 0;"/>
<p>If you have any questions in the meantime, you can reply to this email or contact Mary Ann directly.</p>
<p style="color:#8a9e8c;font-size:12px;">MAS Monograms — St. Matthews, SC</p>
</body></html>
`;

  const resendRequests = [
    // Owner notification
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MAS Monograms <noreply@mas-monograms.com>',
        to: [env.QUOTE_OWNER_EMAIL],
        reply_to: email,
        subject: `New Quote Request from ${name}`,
        html: ownerHtml,
      }),
    }),
    // Customer confirmation
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MAS Monograms <noreply@mas-monograms.com>',
        to: [email],
        subject: 'We got your quote request! — MAS Monograms',
        html: customerHtml,
      }),
    }),
  ];

  const results = await Promise.allSettled(resendRequests);
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`Resend email ${i} failed:`, r.reason);
  });

  return new Response(null, { status: 303, headers: { Location: '/thank-you' } });
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
