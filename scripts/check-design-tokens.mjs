#!/usr/bin/env node
/**
 * Build-time assertion for WP1 acceptance: no hard-coded hex colour outside the
 * token file.
 *
 * Why this exists: a design system that is merely documented drifts. The first
 * time someone writes `#0B6E5F` into a component instead of
 * `var(--color-ag-signal)`, the token stops being the source of truth and the
 * system starts to rot silently. Failing the build is what keeps
 * "tokens are consumed by every component" true rather than aspirational.
 *
 * Two files are permitted to contain a hex literal, each for a reason that
 * cannot be designed around:
 *
 *   src/app/tokens.css  — the token definitions themselves.
 *   src/app/icon.svg    — the favicon is a standalone document served on its
 *                         own. It has no access to the page's CSS custom
 *                         properties, so its colours must be literal.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCAN_DIR = join(ROOT, 'src');
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.svg']);

/** Paths, relative to the repository root, allowed to contain hex colours. */
const ALLOWED_FILES = new Map([
  ['src/app/tokens.css', 'the token definitions themselves'],
  ['src/app/icon.svg', 'a standalone document with no access to CSS custom properties'],
]);

/**
 * favicon.ico and apple-icon.png are binary and are generated from the tokens
 * by `pnpm icons:generate`, so they are never scanned and never hand-edited.
 */

/** #rgb, #rrggbb and #rrggbbaa. */
const HEX_PATTERN = /#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;

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
  const shown = relative(ROOT, file).split('\\').join('/');
  if (ALLOWED_FILES.has(shown)) continue;

  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(HEX_PATTERN)) {
    violations.push(
      `${shown}:${lineOf(content, match.index)}  "${match[0]}" is a hard-coded colour`,
    );
  }
}

if (violations.length > 0) {
  console.error(`\nDesign-token check FAILED with ${violations.length} violation(s):\n`);
  for (const violation of violations) console.error(`  ${violation}`);
  console.error(
    '\nUse a token from src/app/tokens.css instead, for example\n' +
      '  var(--color-ag-signal)   not   #0B6E5F\n' +
      'If a new colour is genuinely needed, add it to tokens.css as a named\n' +
      'token with its measured contrast ratio, and consume the token here.\n',
  );
  process.exit(1);
}

console.log('Design-token check passed: no hard-coded colour outside the token file.');
