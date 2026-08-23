#!/usr/bin/env node
/**
 * Build-time assertion for Brief s5 / constraint 4: no domain is hardcoded in src/.
 *
 * Why this exists: the site is built and verified on a Cloudflare preview URL and
 * cuts over to the real domain later (risk R9). If a domain string leaks into a
 * component, the cutover becomes a search-and-replace across the codebase instead
 * of a configuration change. Every URL must derive from NEXT_PUBLIC_SITE_URL via
 * src/lib/site-config.ts.
 *
 * Two classes of finding:
 *
 *   1. BANNED    — the project's own hostnames and deployment hostnames. These are
 *                  never legitimate in src/, in any form.
 *   2. UNLISTED  — any other absolute http(s) URL. The Content Spec requires real
 *                  outbound links (GOV.UK is the funding authority, Cal.com hosts
 *                  the booking embed), so a blanket ban on domain-shaped strings
 *                  would be unimplementable. Instead every external host must be
 *                  declared below, which keeps the list reviewable.
 *
 * Also catches the discarded former working name, which is barred from the
 * codebase entirely. See DISCARDED_WORKING_NAME below.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCAN_DIR = join(ROOT, 'src');
const SCAN_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.css',
  '.json',
  '.md',
]);

/**
 * The business's discarded former working name, which must never appear in the
 * codebase, copy, metadata, comments, filenames or commit messages. The business
 * is ApprentiGate.
 *
 * It is assembled from fragments rather than written out, so that the name
 * itself does not appear as a literal anywhere in this repository — including
 * here — while the check that keeps it out of the codebase still works.
 */
const DISCARDED_WORKING_NAME = ['Apprenti', 'F', 'low'].join('');

/** Strings that must never appear as literals in src/. */
const BANNED_PATTERNS = [
  {
    pattern: /apprentigate\.(com|co\.uk|net|org)/gi,
    why: 'the production domain — derive it from NEXT_PUBLIC_SITE_URL',
  },
  {
    pattern: /[a-z0-9-]+\.pages\.dev/gi,
    why: 'a Cloudflare Pages preview host — derive it from NEXT_PUBLIC_SITE_URL',
  },
  {
    pattern: /[a-z0-9-]+\.workers\.dev/gi,
    why: 'a Cloudflare Workers preview host — derive it from NEXT_PUBLIC_SITE_URL',
  },
  {
    pattern: new RegExp(DISCARDED_WORKING_NAME, 'gi'),
    why: 'the discarded former working name; the business is ApprentiGate',
  },
];

/**
 * External hosts that are allowed to appear as literals, each with the reason it
 * is load-bearing. Adding a host here is a deliberate, reviewable act.
 */
const ALLOWED_EXTERNAL_HOSTS = new Map([
  ['www.gov.uk', 'GOV.UK is the cited authority for all funding content'],
  ['gov.uk', 'GOV.UK is the cited authority for all funding content'],
  ['schema.org', 'JSON-LD @context'],
  ['cal.com', 'booking embed (WP10)'],
  ['app.cal.com', 'booking embed (WP10)'],
  ['challenges.cloudflare.com', 'Turnstile widget script (WP10)'],
  ['static.cloudflareinsights.com', 'Cloudflare Web Analytics beacon (WP12)'],
  ['localhost', 'local development only'],
]);

const URL_PATTERN = /https?:\/\/([a-z0-9.-]+)/gi;

function collectFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...collectFiles(full));
    } else if (SCAN_EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) {
      found.push(full);
    }
  }
  return found;
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

const violations = [];

for (const file of collectFiles(SCAN_DIR)) {
  const content = readFileSync(file, 'utf8');
  const shown = relative(ROOT, file);

  for (const { pattern, why } of BANNED_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      violations.push(
        `${shown}:${lineOf(content, match.index)}  "${match[0]}" is ${why}`,
      );
    }
  }

  for (const match of content.matchAll(URL_PATTERN)) {
    const host = match[1].toLowerCase().replace(/\.$/, '');
    if (!ALLOWED_EXTERNAL_HOSTS.has(host)) {
      violations.push(
        `${shown}:${lineOf(content, match.index)}  "${host}" is an undeclared external host — ` +
          `add it to ALLOWED_EXTERNAL_HOSTS in this script with a reason, or derive the URL from site-config.`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error(
    `\nHardcoded-domain check FAILED with ${violations.length} violation(s):\n`,
  );
  for (const violation of violations) console.error(`  ${violation}`);
  console.error('\nSee Brief s5: every URL derives from NEXT_PUBLIC_SITE_URL.\n');
  process.exit(1);
}

console.log('Hardcoded-domain check passed: no domain literals in src/.');
