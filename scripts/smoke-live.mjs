#!/usr/bin/env node
/**
 * Checks the live site immediately after a deploy, and fails loudly if the
 * thing that just shipped is broken.
 *
 * Why this exists: the enquiry form went down on the live site and nothing
 * said so. A sequence of deploys — two of which failed partway through, on a
 * trigger error, after already uploading assets — left the domain serving a
 * build with no Turnstile site key in it. The form rendered "not accepting
 * enquiries yet" to every visitor. Every individual command had reported
 * success or a failure that looked unrelated, and the page looked completely
 * normal unless you knew to read it.
 *
 * The guards that run *before* a deploy check the artefact on disk. Nothing
 * checked what the domain actually served afterwards, which is the only thing
 * a visitor experiences.
 *
 * Everything here is derived from configuration rather than hardcoded, so
 * there is still no domain literal in the project.
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function fromEnvFile(name) {
  for (const file of ['.env.local', '.env']) {
    const path = fileURLToPath(new URL(`../${file}`, import.meta.url));
    if (!existsSync(path)) continue;
    const match = readFileSync(path, 'utf8').match(
      new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, 'm'),
    );
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

const setting = (name) => (process.env[name] ?? '').trim() || fromEnvFile(name);

const origin = setting('NEXT_PUBLIC_SITE_URL').replace(/\/$/, '');
const turnstileKey = setting('NEXT_PUBLIC_TURNSTILE_SITE_KEY');
const allowIndexing = setting('NEXT_PUBLIC_ALLOW_INDEXING') === 'true';

if (!origin) {
  console.error('\nSmoke check SKIPPED: NEXT_PUBLIC_SITE_URL is not set.\n');
  process.exit(0);
}

const failures = [];
const note = (ok, label, detail) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

/**
 * A problem worth showing on every deploy that must not block one.
 *
 * Reserved for things a deploy cannot cause and a rebuild cannot fix — zone
 * settings, DNS, anything owned by the Cloudflare dashboard. Failing the
 * deploy on those punishes a correct build for an unrelated setting, and a
 * guard that blocks work it has no business blocking is one people learn to
 * bypass. This project has already had to fix one of those.
 */
const warnings = [];
const warn = (label, detail, fix) => {
  console.log(`  warn  ${label}${detail ? ` — ${detail}` : ''}`);
  warnings.push({ label, fix });
};

/** A fresh deploy can take a moment to propagate; give it a few tries. */
async function get(path) {
  let last;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(`${origin}${path}`, {
        redirect: 'manual',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const body = await response.text();
      if (response.status < 500) return { status: response.status, body };
      last = `status ${response.status}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return { status: 0, body: '', error: last };
}

console.log(`\nSmoke-checking ${origin}\n`);

const home = await get('/');
note(home.status === 200, 'home responds 200', `got ${home.status}`);

const robotsOk = allowIndexing
  ? /content="index/.test(home.body)
  : /content="[^"]*noindex/.test(home.body);
note(
  robotsOk,
  `home robots directive matches configuration (${allowIndexing ? 'indexable' : 'noindex'})`,
);

const contact = await get('/contact');
note(contact.status === 200, 'contact responds 200', `got ${contact.status}`);

/*
 * The regression that prompted this file. The site key is compiled into the
 * page, so if it is configured it must be present in what the domain serves —
 * and the "not accepting enquiries" fallback must not be.
 */
if (turnstileKey) {
  note(contact.body.includes(turnstileKey), 'contact carries the Turnstile site key');
  note(
    !contact.body.includes('not accepting enquiries yet'),
    'enquiry form is accepting submissions',
  );
}

const missing = await get('/does-not-exist-smoke-check');
note(missing.status === 404, 'unknown path returns 404', `got ${missing.status}`);

const enquiry = await get('/api/enquiry');
note(enquiry.status === 405, 'enquiry endpoint rejects GET', `got ${enquiry.status}`);

/*
 * Plain HTTP on the apex.
 *
 * This warns and will keep warning, and that is the correct end state rather
 * than an outstanding task. The apex is attached to the Worker as a custom
 * domain, which the Workers platform serves directly — so the zone pipeline
 * never sees the request. Both available fixes were tried against the live
 * site and neither fired:
 *
 *   - SSL/TLS -> Edge Certificates -> Always Use HTTPS
 *   - A Redirect Rule on `not ssl`
 *
 * www proves the diagnosis: it is an ordinary proxied record, and its
 * redirect rule works. The only difference is the custom domain.
 *
 * It is left alone deliberately. Every page carries a canonical to the https
 * URL, so Google indexes the secure version and rankings are unaffected; the
 * only real cost is one unencrypted request from someone typing the domain by
 * hand. The remaining fix would be `run_worker_first: true`, putting the
 * Worker in front of every request site-wide — an invocation per page view
 * and a whole-site outage from any Worker error. That trade is not worth it
 * for this.
 *
 * The check stays because it is still true, and because it flips to passing
 * on its own if Cloudflare changes this or the apex ever stops being a custom
 * domain.
 */
if (origin.startsWith('https://')) {
  const insecure = origin.replace(/^https:/, 'http:');
  let status = 0;
  try {
    status = (await fetch(`${insecure}/`, { redirect: 'manual' })).status;
  } catch {
    status = 0;
  }

  if (status === 301 || status === 308 || status === 302 || status === 307) {
    note(true, 'plain HTTP redirects to HTTPS', `got ${status}`);
  } else if (status === 200) {
    warn(
      'plain HTTP serves the site instead of redirecting',
      'got 200 — known and accepted',
      'nothing to do: the apex is a Worker custom domain, so zone redirects do not reach it. See "Plain HTTP on the apex" in OPERATOR-HANDOVER.md.',
    );
  } else {
    note(false, 'plain HTTP responds sensibly', `got ${status}`);
  }
}

if (warnings.length > 0) {
  console.log('');
  for (const { label, fix } of warnings) {
    console.log(`  To fix "${label}": ${fix}`);
  }
}

if (failures.length > 0) {
  console.error(`\nSmoke check FAILED: ${failures.length} problem(s) on the live site.`);
  console.error('The deploy completed, so this is what visitors are seeing now.\n');
  process.exit(1);
}

console.log('\nSmoke check passed: the live site is serving what it should.\n');
