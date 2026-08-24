import {
  enquirySchema,
  formatZodErrors,
  type Enquiry,
  type EnquiryErrors,
} from '../src/lib/enquiry';
import { createFailingSender, createResendSender, type EmailSender } from './email';

/**
 * The only dynamic surface on the site: one POST route that turns an enquiry
 * into an email. Everything else is a static asset.
 *
 * `run_worker_first` in wrangler.jsonc lists just this path, so no other
 * request invokes the Worker at all.
 *
 * The ordering of the checks below is deliberate — cheapest and most certain
 * first, so an abusive client is rejected before it costs a Turnstile round
 * trip or a Resend call:
 *
 *   1. method and content type
 *   2. rate limit at the edge
 *   3. honeypot
 *   4. schema
 *   5. Turnstile
 *   6. send
 */

export interface Env {
  readonly ASSETS: Fetcher;
  readonly ENQUIRY_RATE_LIMITER?: RateLimit;

  /** Secrets, loaded by the operator with `wrangler secret put`. */
  readonly RESEND_API_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;

  /** Plain configuration. */
  readonly ENQUIRIES_TO?: string;
  readonly ENQUIRIES_FROM?: string;
  /** Set to "fail" to force the send to fail, for exercising the failure path. */
  readonly EMAIL_TRANSPORT?: string;
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

const ENQUIRY_PATH = '/api/enquiry';

/** The honeypot field's name. Hidden from people, irresistible to bots. */
const HONEYPOT_FIELD = 'website';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      // This endpoint is only ever called by the site's own form.
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function readSubmission(
  request: Request,
): Promise<{ values: Record<string, unknown>; honeypot: string } | null> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (body === null || typeof body !== 'object') return null;
    const { [HONEYPOT_FIELD]: honeypot, ...values } = body;
    return { values, honeypot: typeof honeypot === 'string' ? honeypot : '' };
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await request.formData().catch(() => null);
    if (form === null) return null;

    const values: Record<string, unknown> = {};
    let honeypot = '';
    for (const [key, value] of form.entries()) {
      if (typeof value !== 'string') continue;
      if (key === HONEYPOT_FIELD) {
        honeypot = value;
        continue;
      }
      // A checkbox arrives as "on" when ticked and is absent when not. The
      // schema demands a literal true, so the conversion happens here, once.
      if (key === 'consent') {
        values['consent'] = value === 'on' || value === 'true';
        continue;
      }
      // Empty strings are dropped rather than passed on, so an untouched
      // optional field is absent rather than an empty answer.
      if (value.trim() === '') continue;
      values[key] = value;
    }
    return { values, honeypot };
  }

  return null;
}

async function verifyTurnstile(
  token: unknown,
  secret: string,
  remoteIp: string | null,
): Promise<boolean> {
  if (typeof token !== 'string' || token === '') return false;

  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteIp) body.append('remoteip', remoteIp);

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

function composeEmail(enquiry: Enquiry): { subject: string; text: string } {
  const lines = [
    `Name:      ${enquiry.name}`,
    `Company:   ${enquiry.company}`,
    `Email:     ${enquiry.email}`,
  ];

  // Only answered fields appear. An absent field is shown as absent rather
  // than as an empty line, so the reader can tell the difference.
  if (enquiry.phone) lines.push(`Phone:     ${enquiry.phone}`);
  if (enquiry.employees) lines.push(`Employees: ${enquiry.employees}`);
  if (enquiry.apprentices) lines.push(`Apprentices (approx): ${enquiry.apprentices}`);
  if (enquiry.roles) lines.push('', 'Roles being recruited:', enquiry.roles);
  if (enquiry.message) lines.push('', 'Message:', enquiry.message);

  lines.push(
    '',
    '---',
    'Consent to be contacted about this enquiry: yes, given on the form.',
    'Sent by the ApprentiGate website enquiry form.',
  );

  return {
    subject: `Enquiry from ${enquiry.name} at ${enquiry.company}`,
    text: lines.join('\n'),
  };
}

function selectSender(env: Env): EmailSender | null {
  if (env.EMAIL_TRANSPORT === 'fail') {
    return createFailingSender('EMAIL_TRANSPORT=fail');
  }
  if (!env.RESEND_API_KEY) return null;
  return createResendSender(env.RESEND_API_KEY);
}

async function handleEnquiry(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405);
  }

  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const clientIp = request.headers.get('CF-Connecting-IP');

  // 2. Rate limit before doing any work. Keyed by IP; the binding is
  //    per-location and eventually consistent, which is fine for slowing a
  //    scripted flood and is not relied on for anything else.
  if (env.ENQUIRY_RATE_LIMITER) {
    const { success } = await env.ENQUIRY_RATE_LIMITER.limit({
      key: clientIp ?? 'unknown',
    });
    if (!success) {
      return json({ ok: false, error: 'rate_limited' }, 429);
    }
  }

  const submission = await readSubmission(request);
  if (submission === null) {
    return json({ ok: false, error: 'unsupported_media_type' }, 415);
  }

  // 3. Honeypot. A real person never sees this field, so anything in it is a
  //    bot. Answered with 200 rather than an error: telling a bot it failed
  //    invites it to try again differently.
  if (submission.honeypot.trim() !== '') {
    return wantsJson
      ? json({ ok: true }, 200)
      : Response.redirect(new URL('/contact/confirmed', request.url).toString(), 303);
  }

  // 4. Schema.
  const { turnstileToken, ...fields } = submission.values;
  const parsed = enquirySchema.safeParse(fields);
  if (!parsed.success) {
    const errors: EnquiryErrors = formatZodErrors(parsed.error);
    return json({ ok: false, error: 'invalid', errors }, 400);
  }

  // 5. Turnstile. Fail closed: with no secret configured the endpoint refuses
  //    submissions rather than accepting unverified ones, because an open
  //    relay to an inbox is worse than a form that is temporarily unavailable.
  if (!env.TURNSTILE_SECRET_KEY) {
    return json({ ok: false, error: 'bot_protection_unconfigured' }, 503);
  }
  const humanVerified = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    clientIp,
  );
  if (!humanVerified) {
    return json({ ok: false, error: 'failed_challenge' }, 403);
  }

  // 6. Send.
  const sender = selectSender(env);
  const to = env.ENQUIRIES_TO;
  const from = env.ENQUIRIES_FROM;

  if (sender === null || !to || !from) {
    return json(
      { ok: false, error: 'email_unconfigured', fallbackEmail: to ?? null },
      503,
    );
  }

  const { subject, text } = composeEmail(parsed.data);
  const result = await sender.send({
    to,
    from,
    replyTo: parsed.data.email,
    subject,
    text,
  });

  if (!result.ok) {
    // The enquirer is told, and given the address, so the enquiry is never
    // silently lost. The underlying error is logged, not shown.
    console.error('Enquiry send failed:', result.error);
    return json({ ok: false, error: 'send_failed', fallbackEmail: to }, 502);
  }

  return wantsJson
    ? json({ ok: true }, 200)
    : Response.redirect(new URL('/contact/confirmed', request.url).toString(), 303);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === ENQUIRY_PATH) {
      return handleEnquiry(request, env);
    }

    // Everything else is a static asset. In practice this is unreachable,
    // because run_worker_first names only the enquiry path.
    return env.ASSETS.fetch(request);
  },
};
