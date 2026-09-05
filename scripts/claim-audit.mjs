#!/usr/bin/env node
/**
 * The claim audit (WP14).
 *
 * Two jobs. It runs the prohibited-content and hygiene scans across the whole
 * rendered site, and it accounts for **every number** that renders — each one
 * either traced to a CONTENT-SOURCES.md entry or explicitly classified as
 * something other than a factual claim.
 *
 * The register below is deliberately exhaustive rather than a pattern that
 * waves numbers through. Anything unaccounted for is a finding, so adding a
 * figure to a page without deciding where it came from breaks this.
 *
 * Run: pnpm claim:audit
 */

import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const PORT = 4400;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  '/',
  '/how-it-works',
  '/for-employers',
  '/for-training-providers',
  '/funding',
  '/about',
  '/faq',
  '/contact',
  '/contact/confirmed',
  '/privacy',
  '/cookies',
  '/terms',
  '/accessibility',
  '/no-such-page',
];

/**
 * Every number that may appear, and why it is allowed to.
 *
 * `source` points at a CONTENT-SOURCES.md entry — a claim about the world that
 * someone could check and that we would be wrong about if it changed.
 * `kind` classifies a number that is not such a claim at all.
 */
const CLAIM_REGISTER = [
  // --- Sourced claims about apprenticeship funding ----------------------
  { match: /£3 million/i, source: 'S9', note: 'apprenticeship levy threshold' },
  { match: /0\.5% of your pay bill/i, source: 'S9', note: 'levy rate' },
  {
    match: /aged 16 to 24|16 to 24 at the start/i,
    source: 'S3',
    note: 'age band for full funding, non-levy employers',
  },
  {
    match: /25 or over|funds 95%|remaining 5%/i,
    source: 'S3',
    note: 'co-investment split at 25 and over',
  },
  {
    match: /from 1 August 2026|changed on 1 August 2026/i,
    source: 'S3',
    note: 'date the funding position changed',
  },
  {
    match: /up to £2,000|£2,000, paid in instalments|1 October 2026/i,
    source: 'S10',
    note: 'hiring payment and the date it starts',
  },
  {
    match: /more than 90 days/i,
    source: 'S10',
    note: 'employment condition on the hiring payment',
  },
  {
    match: /under 19, or in the first year/i,
    source: 'S13',
    note: 'apprentice minimum wage condition',
  },

  // --- Numbers that are not claims about the world ----------------------
  {
    match: /60-person firm/i,
    kind: 'illustrative',
    note: 'a hypothetical firm, not a customer. No real employer is described anywhere on the site.',
  },
  {
    match: /Level 3 or Level 4|Levels 2 to 5/i,
    kind: 'self-descriptive',
    note: 'apprenticeship levels are a published framework; the sentence states our own focus, not a fact about anyone else',
  },
  {
    match: /Up to 24 months/i,
    kind: 'our own policy',
    note: 'a retention commitment we are making, not an external fact. UK GDPR requires it to be stated.',
  },
  {
    match: /Rules last reviewed|Last reviewed/i,
    kind: 'review date',
    note: 'the date the page was last checked',
  },
  {
    match: /Guidelines 2\.2|WCAG 2\.2/i,
    kind: 'standard reference',
    note: 'the version of the accessibility standard being conformed to',
  },
  {
    match: /320px, 768px and 1440px/i,
    kind: 'our own testing',
    note: 'the widths the automated suite runs at, recorded in QA-REPORT.md',
  },
  {
    match: /at least 95 in all four/i,
    kind: 'our own testing',
    note: 'the Lighthouse threshold enforced by lighthouserc.json',
  },
  {
    match: /lowest contrast is 5\.42:1|requirement of 4\.5:1/i,
    kind: 'our own testing',
    note: 'measured across every rendered text element and asserted by tests/e2e/contrast-rendered.spec.ts',
  },
  {
    match: /within five working days/i,
    kind: 'our own commitment',
    note: 'a response time we are promising, not a claim about the world',
  },
  {
    match: /fixed fee of £750 per role/i,
    kind: 'our own price',
    note: 'what we charge. A commercial decision, not a fact about the world — it needs no external source, but it does need to stay true: if the fee changes, this and the FAQ change together.',
  },
  {
    match: /1 to 9|10 to 49|50 to 249|250 or more/i,
    kind: 'form option',
    note: 'employee-count bands offered in the enquiry form',
  },
  {
    match:
      /0?[1-7]\s*(Tell us|We check|We explain|We research|You choose|We coordinate|We support|Role and standard|Funding guidance|Provider comparison|Setup coordination|Recruitment logistics|Ongoing programme)/i,
    kind: 'structural',
    note: 'step or card numbering; encodes order, claims nothing',
  },
  {
    match: /scrolls sideways at 320px|enlarged without the layout breaking/i,
    kind: 'our own testing',
    note: 'the narrowest width the layout is tested at',
  },
  {
    match: /requirement of 4\.5:1|lowest contrast is 5\.42:1/i,
    kind: 'our own testing',
    note: 'the WCAG AA threshold and our measured figure, asserted by tests/e2e/contrast-rendered.spec.ts',
  },
  {
    match: /©|Error 404|2026 ApprentiGate/i,
    kind: 'structural',
    note: 'copyright year or status code',
  },
  {
    match: /changes again on 1 October 2026|1 October 2026 onwards/i,
    source: 'S10',
    note: 'the date the next change takes effect',
  },
];

/** Prohibitions, mirroring tests/e2e/prohibitions.spec.ts. */
const PROHIBITED = [
  { pattern: /\btrusted by\b/i, why: 'implies customers that do not exist' },
  { pattern: /\baward[-\s]?winning\b/i, why: 'no awards' },
  { pattern: /\b(the|a)\s+leading\b|\bmarket[-\s]?leading\b/i, why: 'superiority claim' },
  { pattern: /\bas featured in\b/i, why: 'no press coverage' },
  { pattern: /\bproven\b/i, why: 'no track record' },
  { pattern: /\btestimonial\b/i, why: 'no testimonials' },
  {
    pattern:
      /\bin our experience\b|\bwe have (helped|worked with|placed|delivered)\b|\bour (clients|customers)\b|\bour track record\b|\bevery time\b/i,
    why: 'implies a delivery history the business does not have',
  },
  { pattern: /\bcase stud(y|ies)\b/i, why: 'no case studies' },
  {
    pattern:
      /(?<![£\d,])\b\d[\d,]*\+? (employers|providers|apprentices|placements|clients|customers)\b/i,
    why: 'a count implying a track record',
  },
  { pattern: /\bwe guarantee\b|\b(is|are) guaranteed\b/i, why: 'nothing is guaranteed' },
  {
    pattern: /\btraining is free\b|\bfree training\b/i,
    why: 'training is not free without qualification',
  },
  {
    pattern: /\bwe are an approved (training )?provider\b/i,
    why: 'not an approved provider',
  },
  {
    pattern: /\b(government|DfE)[-\s]?(approved|endorsed|backed)\b/i,
    why: 'implies endorsement',
  },
  { pattern: /\bour partners?\b|\bpartner(ed)? with\b/i, why: 'there are no partners' },
  { pattern: /\bLtd\b|\bLimited\b/, why: 'not incorporated' },
  { pattern: /\bregistered office\b/i, why: 'no registered office' },
  { pattern: /lorem ipsum/i, why: 'placeholder text' },
  { pattern: /\bTODO\b|\bFIXME\b/, why: 'unfinished-work marker' },
  { pattern: /\[placeholder\]/i, why: 'placeholder marker' },
  {
    pattern: /\bacross the UK\b|\bUK[-\s]wide\b/i,
    why: 'funding is devolved; England only',
  },
];

/**
 * A number, including decimals, percentages and ratios.
 *
 * Context is taken as a character window around each match rather than by a
 * regex that stops at sentence punctuation. The earlier version used `.` as a
 * boundary, which split every decimal it was meant to be reading: "0.5%" was
 * reported as "5%" and "4.5:1" as "5:1", each landing as an unaccounted number
 * whose context had lost the very digits that identified it.
 */
const NUMBER_TOKEN = /£?\d[\d,]*(?:\.\d+)?%?(?::\d+)?/g;
const CONTEXT_RADIUS = 80;

function* numbersWithContext(text) {
  for (const match of text.matchAll(NUMBER_TOKEN)) {
    const start = Math.max(0, match.index - CONTEXT_RADIUS);
    const end = Math.min(text.length, match.index + match[0].length + CONTEXT_RADIUS);
    yield {
      value: match[0],
      context: text.slice(start, end).replace(/\s+/g, ' ').trim(),
    };
  }
}

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(BASE)).ok) return true;
    } catch {
      /* not up */
    }
    await sleep(400);
  }
  return false;
}

function classify(context) {
  return CLAIM_REGISTER.find((entry) => entry.match.test(context));
}

async function run() {
  console.log('\nRunning hygiene scans\n');
  const hygiene = [];
  for (const [name, command] of [
    ['No domain hardcoded in src/', 'pnpm guard:domains'],
    ['No hex colour outside the token file', 'pnpm guard:tokens'],
  ]) {
    try {
      execSync(command, { stdio: 'pipe' });
      hygiene.push({ name, passed: true });
      console.log(`  PASS  ${name}`);
    } catch (error) {
      hygiene.push({ name, passed: false, detail: String(error.stdout ?? error) });
      console.log(`  FAIL  ${name}`);
    }
  }

  // The discarded former working name, assembled so it never appears here.
  const discarded = ['Apprenti', 'F', 'low'].join('');
  let nameHits = '';
  try {
    nameHits = execSync(
      `grep -ril "${discarded}" src worker scripts tests *.md 2>/dev/null || true`,
      { encoding: 'utf8' },
    ).trim();
  } catch {
    nameHits = '';
  }
  hygiene.push({
    name: 'The discarded former working name appears nowhere',
    passed: nameHits === '' || nameHits.includes('check-hardcoded-domains'),
    detail: nameHits,
  });
  console.log(
    `  ${nameHits === '' || nameHits.includes('check-hardcoded-domains') ? 'PASS' : 'FAIL'}  discarded name absent`,
  );

  console.log('\nServing and auditing every rendered number\n');
  const server = spawn('pnpm', ['exec', 'serve', 'out', '--listen', String(PORT)], {
    stdio: 'ignore',
  });

  const numbers = [];
  const prohibitions = [];

  try {
    if (!(await waitForServer())) throw new Error('server did not start');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const route of ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(300);

      const bodyText = ((await page.locator('body').textContent()) ?? '').replace(
        /\s+/g,
        ' ',
      );
      for (const { pattern, why } of PROHIBITED) {
        const found = bodyText.match(pattern);
        if (found) prohibitions.push({ route, match: found[0], why });
      }

      const mainText = ((await page.locator('main').textContent()) ?? '').replace(
        /\s+/g,
        ' ',
      );
      for (const { value, context: contextText } of numbersWithContext(mainText)) {
        const entry = classify(contextText);
        numbers.push({
          route,
          value,
          context: contextText.slice(0, 110),
          source: entry?.source ?? null,
          kind: entry?.kind ?? null,
          note: entry?.note ?? null,
          accounted: Boolean(entry),
        });
      }
      process.stdout.write('.');
    }
    process.stdout.write('\n');

    await browser.close();
  } finally {
    server.kill('SIGTERM');
    await sleep(300);
    server.kill('SIGKILL');
  }

  writeReport({ hygiene, numbers, prohibitions });

  const unaccounted = numbers.filter((entry) => !entry.accounted);
  const failed = hygiene.filter((entry) => !entry.passed);
  if (unaccounted.length > 0 || prohibitions.length > 0 || failed.length > 0) {
    console.log(
      `\nFINDINGS: ${unaccounted.length} unaccounted numbers, ${prohibitions.length} prohibited matches, ${failed.length} failed scans\n`,
    );
    for (const entry of unaccounted.slice(0, 20)) {
      console.log(`  ${entry.route}  ${entry.value}  ${entry.context}`);
    }
    process.exitCode = 1;
  } else {
    console.log('\nClean: every number accounted for, no prohibited content.\n');
  }
}

function writeReport({ hygiene, numbers, prohibitions }) {
  const stamp = new Date().toISOString().slice(0, 10);
  const sources = new Set(
    readFileSync('CONTENT-SOURCES.md', 'utf8')
      .match(/^## (S\d+)/gm)
      ?.map((line) => line.replace('## ', '')) ?? [],
  );

  const unaccounted = numbers.filter((entry) => !entry.accounted);
  const sourced = numbers.filter((entry) => entry.source);
  const classified = numbers.filter((entry) => entry.kind);

  const lines = [];
  const push = (...text) => lines.push(...text);

  push(
    '# Claim audit',
    '',
    `Generated ${stamp} by \`pnpm claim:audit\`. Regenerate it rather than editing it.`,
    '',
    'Two questions. Does the site contain anything it must not? And can every',
    'number on it be accounted for — either traced to a source in',
    '`CONTENT-SOURCES.md`, or explicitly classified as something that is not a',
    'claim about the world?',
    '',
    '---',
    '',
    '## Summary',
    '',
    '| Check | Result |',
    '|---|---|',
    `| Numbers rendered on the site | ${numbers.length} |`,
    `| Traced to a source | ${sourced.length} |`,
    `| Classified as not a factual claim | ${classified.length} |`,
    `| **Unaccounted for** | **${unaccounted.length}** |`,
    `| Prohibited content found | ${prohibitions.length} |`,
    `| Hygiene scans failed | ${hygiene.filter((entry) => !entry.passed).length} |`,
    `| Sources defined in CONTENT-SOURCES.md | ${sources.size} |`,
    '',
  );

  if (unaccounted.length > 0) {
    push('## Unaccounted numbers', '', '| Route | Value | Context |', '|---|---|---|');
    for (const entry of unaccounted) {
      push(`| \`${entry.route}\` | ${entry.value} | ${entry.context} |`);
    }
    push('');
  }

  if (prohibitions.length > 0) {
    push('## Prohibited content', '', '| Route | Match | Why |', '|---|---|---|');
    for (const entry of prohibitions) {
      push(`| \`${entry.route}\` | ${entry.match} | ${entry.why} |`);
    }
    push('');
  }

  push('## Hygiene scans', '', '| Scan | Result |', '|---|---|');
  for (const entry of hygiene) {
    push(`| ${entry.name} | ${entry.passed ? 'pass' : '**FAIL**'} |`);
  }
  push('');

  // --- sourced claims -----------------------------------------------------
  push(
    '## Numbers traced to a source',
    '',
    'Each of these is a statement about the world that someone could check, and',
    'that we would be wrong about if it changed.',
    '',
    '| Source | Claim | Where it appears |',
    '|---|---|---|',
  );
  const bySource = new Map();
  for (const entry of sourced) {
    const key = `${entry.source}|${entry.note}`;
    const existing = bySource.get(key) ?? { ...entry, routes: new Set() };
    existing.routes.add(entry.route);
    bySource.set(key, existing);
  }
  for (const entry of [...bySource.values()].sort((a, b) =>
    a.source.localeCompare(b.source, undefined, { numeric: true }),
  )) {
    push(
      `| \`${entry.source}\` | ${entry.note} | ${[...entry.routes].map((route) => `\`${route}\``).join(', ')} |`,
    );
  }
  push('');

  // --- classified ---------------------------------------------------------
  push(
    '## Numbers that are not claims about the world',
    '',
    'Recorded rather than ignored: the distinction between a fact we could be',
    'wrong about and a number that simply is what it is has to be a decision',
    'someone made, not an omission.',
    '',
    '| Kind | Number | Why it needs no source |',
    '|---|---|---|',
  );
  const byKind = new Map();
  for (const entry of classified) {
    const key = `${entry.kind}|${entry.note}`;
    if (!byKind.has(key)) byKind.set(key, entry);
  }
  for (const entry of byKind.values()) {
    push(`| ${entry.kind} | ${entry.value} | ${entry.note} |`);
  }
  push('');

  push(
    '---',
    '',
    '## What this audit does not do',
    '',
    '- It does not re-verify the sources. `CONTENT-SOURCES.md` records the GOV.UK',
    '  URL and retrieval date behind each claim; whether GOV.UK still says that is',
    '  a quarterly job and the WP17 recurring check.',
    '- It reads the rendered pages, so it sees what a visitor sees. It does not',
    '  read the enquiry notification email, which is composed in the Worker.',
    '- It cannot judge tone or implication. A sentence can be literally true and',
    '  still mislead; that is what the adversarial pass in this work package was',
    '  for, and its findings are recorded in the commit rather than here.',
    '',
  );

  writeFileSync('CLAIM-AUDIT.md', `${lines.join('\n')}\n`);
  console.log('Wrote CLAIM-AUDIT.md');
}

await run();
