#!/usr/bin/env node
/**
 * Exercises the enquiry Worker against a real Workers runtime.
 *
 * Kept out of `pnpm verify` deliberately: it boots `wrangler dev`, which is
 * slower and more failure-prone than the static suites, and a flaky gate is
 * worse than a gate you run on purpose. It is what produces the evidence for
 * the WP10 acceptance criteria that do not need live credentials.
 *
 * What it cannot prove is the criterion that needs them: that a real enquiry
 * lands in the enquiries mailbox. That needs a Resend key and the operator's
 * Cloudflare account, and is signed off at handover.
 *
 * Run: pnpm verify:worker
 */

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 8799;
const BASE = `http://127.0.0.1:${PORT}`;

/**
 * Cloudflare's documented always-passes Turnstile test keys, so the challenge
 * step can be exercised without real credentials. Never used in production.
 */
const TEST_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA';

const results = [];

function record(name, passed, detail) {
  results.push({ name, passed, detail });
  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`  ${mark}  ${name}${detail ? ` — ${detail}` : ''}`);
}

/**
 * The rate limit is deliberately tight — five POSTs per minute per address —
 * and it is checked before anything else, so every request consumes budget
 * whatever its outcome. The functional checks therefore track their own spend
 * and wait out the window when it runs down, rather than reporting a rate-limit
 * response as a functional failure. Finding this the hard way is itself
 * evidence the limiter works.
 */
const RATE_LIMIT = 5;
const WINDOW_SECONDS = 60;
let spent = 0;

async function budget() {
  if (spent < RATE_LIMIT) {
    spent += 1;
    return;
  }
  console.log(
    `  ..   rate-limit window exhausted; waiting ${WINDOW_SECONDS + 2}s for it to reset`,
  );
  await sleep((WINDOW_SECONDS + 2) * 1000);
  spent = 1;
}

async function post(body, { asForm = false, headers = {}, metered = true } = {}) {
  if (metered) await budget();
  return fetch(`${BASE}/api/enquiry`, {
    method: 'POST',
    headers: asForm
      ? { 'Content-Type': 'application/x-www-form-urlencoded', ...headers }
      : { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: asForm ? new URLSearchParams(body).toString() : JSON.stringify(body),
    redirect: 'manual',
  });
}

const validEnquiry = {
  name: 'Sam Okafor',
  company: 'Bell & Croft Accountants',
  email: 'sam@bellcroft.test',
  consent: true,
  turnstileToken: 'test-token',
};

async function waitForReady(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/api/enquiry`, { method: 'GET' });
      if (response.status === 405) return true;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  return false;
}

async function run() {
  console.log('\nStarting wrangler dev…\n');

  const wrangler = spawn(
    'pnpm',
    [
      'exec',
      'wrangler',
      'dev',
      '--port',
      String(PORT),
      '--local',
      '--var',
      'ENQUIRIES_TO:enquiries@example.test',
      '--var',
      'ENQUIRIES_FROM:site@example.test',
      '--var',
      'EMAIL_TRANSPORT:fail',
      '--var',
      `TURNSTILE_SECRET_KEY:${TEST_TURNSTILE_SECRET}`,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env } },
  );

  let stderr = '';
  wrangler.stderr.on('data', (chunk) => {
    stderr += String(chunk);
  });

  try {
    if (!(await waitForReady())) {
      console.error('wrangler dev did not become ready.\n');
      console.error(stderr.slice(-2000));
      process.exitCode = 1;
      return;
    }

    console.log('Worker is up. Running checks:\n');

    // --- Method handling -------------------------------------------------
    const getResponse = await fetch(`${BASE}/api/enquiry`, { method: 'GET' });
    record(
      'GET is rejected; the endpoint accepts POST only',
      getResponse.status === 405,
      `status ${getResponse.status}`,
    );

    // --- Validation ------------------------------------------------------
    const missing = await post({ name: '', company: '', email: '', consent: true });
    const missingBody = await missing.json();
    record(
      'A submission missing required fields is rejected with per-field errors',
      missing.status === 400 &&
        Boolean(missingBody.errors?.name) &&
        Boolean(missingBody.errors?.company) &&
        Boolean(missingBody.errors?.email),
      `status ${missing.status}`,
    );

    const noConsent = await post({ ...validEnquiry, consent: false });
    record(
      'A submission without consent is rejected',
      noConsent.status === 400,
      `status ${noConsent.status}`,
    );

    const consentAsString = await post({ ...validEnquiry, consent: 'on' });
    record(
      'Consent must be literally true, not merely truthy',
      consentAsString.status === 400,
      `status ${consentAsString.status}`,
    );

    // --- Honeypot --------------------------------------------------------
    const honeypot = await post({ ...validEnquiry, website: 'https://spam.example' });
    record(
      'A filled honeypot is accepted silently and never sent',
      honeypot.status === 200,
      `status ${honeypot.status} (deliberately indistinguishable from success)`,
    );

    // --- Turnstile -------------------------------------------------------
    const badToken = await post({ ...validEnquiry, turnstileToken: '' });
    record(
      'A missing challenge token is rejected',
      badToken.status === 403,
      `status ${badToken.status}`,
    );

    // --- Forced send failure ---------------------------------------------
    const failed = await post(validEnquiry);
    const failedBody = await failed.json().catch(() => ({}));
    record(
      'A failed send returns the fallback address so the enquiry is not lost',
      failed.status === 502 && failedBody.fallbackEmail === 'enquiries@example.test',
      `status ${failed.status}, fallback ${failedBody.fallbackEmail ?? 'none'}`,
    );

    // --- Form-encoded fallback -------------------------------------------
    const formPost = await post(
      {
        name: 'Sam Okafor',
        company: 'Bell & Croft',
        email: 'sam@bellcroft.test',
        consent: 'on',
        website: 'bot',
      },
      { asForm: true },
    );
    record(
      'A no-JavaScript form post is understood and redirected',
      formPost.status === 303,
      `status ${formPost.status}`,
    );

    // --- Rate limiting, last, because it deliberately exhausts the window --
    let limited = 0;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await post(validEnquiry, { metered: false });
      if (response.status === 429) limited += 1;
    }
    record(
      'A scripted flood is rate limited',
      limited > 0,
      `${limited} of 12 rapid requests refused with 429`,
    );
  } finally {
    wrangler.kill('SIGTERM');
    await sleep(500);
    wrangler.kill('SIGKILL');
  }

  const failures = results.filter((result) => !result.passed);
  console.log(`\n${results.length - failures.length}/${results.length} checks passed.\n`);
  console.log(
    "Not covered here, and requiring the operator's credentials:\n" +
      '  - a real enquiry arriving in the enquiries mailbox\n' +
      '  - a real booking appearing in the Cal.com calendar\n',
  );

  if (failures.length > 0) process.exitCode = 1;
}

await run();
