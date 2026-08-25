#!/usr/bin/env node
/**
 * Source drift check (WP17).
 *
 * Answers one question every month: is anything the site states still what
 * GOV.UK says?
 *
 * It fetches each source and looks for the specific wording the site's claims
 * rest on. A missing phrase does not prove the claim is now false — it proves
 * nobody can any longer point at the sentence it came from, which is the same
 * thing as far as this project is concerned, because the rule is that an
 * untraceable claim gets deleted rather than softened.
 *
 * It also watches the funding page's review date. That date is printed on the
 * page, so a stale one is visible to a prospect: it stops being reassurance and
 * becomes evidence that nobody is looking.
 *
 * Writes SOURCE-DRIFT.md and exits non-zero if anything needs a person.
 *
 * Run: pnpm check:sources
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { SOURCE_REGISTRY } from './sources.registry.mjs';

/** Re-read the sources at least this often, per the quarterly commitment. */
const REVIEW_INTERVAL_DAYS = 90;

/** GOV.UK is fine with this; it is one request per source, once a month. */
const USER_AGENT =
  'ApprentiGate-source-drift-check (+https://github.com/) monthly claim verification';

function normalise(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#163;|&pound;/g, '£')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function fetchSource(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      redirect: 'follow',
    });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    return { ok: true, text: normalise(await response.text()) };
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

function reviewDateAgeDays() {
  const file = readFileSync('src/lib/funding.ts', 'utf8');
  const match = file.match(/iso:\s*'(\d{4}-\d{2}-\d{2})'/);
  if (!match) return null;
  const reviewed = new Date(`${match[1]}T00:00:00Z`);
  const days = Math.floor((Date.now() - reviewed.getTime()) / 86_400_000);
  return { date: match[1], days };
}

/** Every source defined in the human record, so none can go unmonitored. */
function documentedSourceIds() {
  const doc = readFileSync('CONTENT-SOURCES.md', 'utf8');
  return (doc.match(/^## (S\d+)/gm) ?? []).map((line) => line.replace('## ', ''));
}

async function run() {
  console.log('\nChecking sources for drift\n');

  const findings = [];
  const results = [];

  // A source recorded in CONTENT-SOURCES.md but absent from the registry would
  // be a claim nobody is watching.
  const documented = documentedSourceIds();
  const registered = new Set(SOURCE_REGISTRY.map((entry) => entry.id));
  for (const id of documented) {
    if (!registered.has(id)) {
      findings.push({
        id,
        severity: 'unmonitored',
        detail: `${id} is documented in CONTENT-SOURCES.md but has no entry in scripts/sources.registry.mjs, so nothing is watching it.`,
      });
    }
  }

  for (const entry of SOURCE_REGISTRY) {
    if (entry.url === null) {
      results.push({ ...entry, status: 'derived' });
      console.log(`  ----  ${entry.id}  ${entry.what} (derived, nothing to fetch)`);
      continue;
    }

    const fetched = await fetchSource(entry.url);

    if (!fetched.ok) {
      results.push({ ...entry, status: 'unreachable', error: fetched.error });
      findings.push({
        id: entry.id,
        severity: entry.critical ? 'critical' : 'unreachable',
        detail: `Could not fetch ${entry.url} — ${fetched.error}. A source that has moved or been withdrawn needs a person to find where it went.`,
      });
      console.log(`  FAIL  ${entry.id}  unreachable — ${fetched.error}`);
      continue;
    }

    const missing = entry.phrases.filter(
      (phrase) => !fetched.text.includes(phrase.toLowerCase()),
    );

    if (missing.length > 0) {
      results.push({ ...entry, status: 'drifted', missing });
      findings.push({
        id: entry.id,
        severity: entry.critical ? 'critical' : 'drifted',
        detail: `The wording relied on is no longer on the page: ${missing
          .map((phrase) => `"${phrase}"`)
          .join(
            ', ',
          )}. Re-read the source and update CONTENT-SOURCES.md and the affected pages.`,
      });
      console.log(`  DRIFT ${entry.id}  missing: ${missing.join(', ')}`);
    } else {
      results.push({ ...entry, status: 'unchanged' });
      console.log(`  ok    ${entry.id}  ${entry.what}`);
    }
  }

  const review = reviewDateAgeDays();
  if (review && review.days > REVIEW_INTERVAL_DAYS) {
    findings.push({
      id: 'review-date',
      severity: 'stale',
      detail: `The funding page says it was last reviewed on ${review.date}, which is ${review.days} days ago. It is printed on the page, so a prospect can see it going stale. Re-read the sources, then update src/lib/funding.ts.`,
    });
    console.log(`\n  STALE review date: ${review.date} (${review.days} days ago)`);
  } else if (review) {
    console.log(`\n  ok    review date: ${review.date} (${review.days} days ago)`);
  }

  writeReport({ results, findings, review });

  if (findings.length > 0) {
    console.log(`\n${findings.length} finding(s) — see SOURCE-DRIFT.md\n`);
    process.exitCode = 1;
  } else {
    console.log('\nNo drift. Every source still says what the site says it says.\n');
  }
}

function writeReport({ results, findings, review }) {
  const stamp = new Date().toISOString().slice(0, 10);
  const lines = [];
  const push = (...text) => lines.push(...text);

  push(
    '# Source drift check',
    '',
    `Last run ${stamp} by \`pnpm check:sources\`. Regenerate it rather than editing it.`,
    '',
    'Every factual claim on this site traces to a GOV.UK page recorded in',
    '`CONTENT-SOURCES.md`. This checks that each of those pages still contains the',
    'wording the claim rests on.',
    '',
    'It looks for specific phrases rather than comparing the whole page, because',
    'GOV.UK pages change constantly for reasons that do not matter. A report that',
    'cries wolf every month is a report nobody reads.',
    '',
    '---',
    '',
    '## Result',
    '',
    findings.length === 0
      ? '**No drift.** Every source still contains the wording the site relies on.'
      : `**${findings.length} finding(s) below need a person.**`,
    '',
  );

  if (review) {
    push(
      `Funding page last reviewed: **${review.date}** (${review.days} days ago).`,
      `Reviews are due every ${REVIEW_INTERVAL_DAYS} days.`,
      '',
    );
  }

  if (findings.length > 0) {
    push('## Findings', '', '| Source | Severity | What to do |', '|---|---|---|');
    for (const finding of findings) {
      push(`| \`${finding.id}\` | ${finding.severity} | ${finding.detail} |`);
    }
    push(
      '',
      'A `critical` finding means the wording behind the statement that',
      "ApprentiGate's fees are separate from apprenticeship funding may have",
      'changed. That is the regulatory basis of the business model, not just a',
      'sentence on a page — treat it as a business question, not a copy edit.',
      '',
    );
  }

  push('## Sources checked', '', '| Source | Claim | Status |', '|---|---|---|');
  for (const entry of results) {
    push(`| \`${entry.id}\` | ${entry.what} | ${entry.status} |`);
  }
  push('');

  push(
    '---',
    '',
    '## What this does not do',
    '',
    '- It cannot tell you a claim has become **wrong**, only that the sentence it',
    '  came from is still there. A page can keep its wording and change its',
    '  meaning around it. The quarterly read-through is still a human job.',
    '- It does not check pages the site links to but makes no claim from.',
    '- It does not re-run the accessibility or performance suites. The monthly',
    '  workflow runs those separately, and `QA-REPORT.md` records them.',
    '',
  );

  writeFileSync('SOURCE-DRIFT.md', `${lines.join('\n')}\n`);
  console.log('Wrote SOURCE-DRIFT.md');
}

await run();
