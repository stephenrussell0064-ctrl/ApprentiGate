#!/usr/bin/env node
/**
 * Refuses to deploy a build that carries a Cloudflare Turnstile *test* site key.
 *
 * Why this exists: `pnpm lighthouse` and the Playwright suite both build with
 * Turnstile's published test key, because the real key is restricted to
 * apprentigate.com and throws "TurnstileError 110200" on localhost — which
 * costs the audit four points of Best Practices for a fault that does not
 * exist in production.
 *
 * That fix creates a sharper hazard than the one it solves. The test key
 * `1x00000000000000000000AA` passes *every* challenge, including a bot's. Both
 * of those commands leave their build in `out/`, and an audit build is now
 * indistinguishable from a production one to the indexing guard, because both
 * set indexing on. Deploying straight afterwards would put a form on the live
 * site that waves through anything and posts it to the enquiries inbox.
 *
 * The failure would be silent — the form would look and behave perfectly. So
 * the check is mechanical and runs before every deploy.
 *
 * The keys are Cloudflare's documented test values, which all share one shape:
 * a digit, an `x`, twenty zeroes, then two letters.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../out', import.meta.url));

/** Matches every Cloudflare Turnstile dummy site key and dummy secret. */
const TEST_KEY = /\b[123]x0{20}[A-Z]{2}\b/;

function* htmlFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      yield* htmlFiles(path);
    } else if (entry.endsWith('.html') || entry.endsWith('.js')) {
      yield path;
    }
  }
}

const offenders = [];
for (const file of htmlFiles(OUT)) {
  const match = readFileSync(file, 'utf8').match(TEST_KEY);
  if (match) offenders.push(`${file.slice(OUT.length + 1)} contains ${match[0]}`);
}

if (offenders.length > 0) {
  console.error('\nTest-key check FAILED: the build carries a Turnstile test key.\n');
  for (const offender of offenders.slice(0, 5)) console.error(`  ${offender}`);
  if (offenders.length > 5) console.error(`  ...and ${offenders.length - 5} more`);
  console.error(
    '\nThis key passes every challenge, so deploying it would leave the enquiry\n' +
      'form open to any bot while still looking like it works.\n\n' +
      'It comes from an audit or test build — `pnpm lighthouse` and the Playwright\n' +
      'suite both use it. Run `pnpm build` to rebuild from .env.local before\n' +
      'deploying.\n',
  );
  process.exit(1);
}

console.log('Test-key check passed: no Turnstile test key in the build.');
