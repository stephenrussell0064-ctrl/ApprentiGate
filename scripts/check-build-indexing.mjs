#!/usr/bin/env node
/**
 * Asserts that the built output's robots directive matches the configured
 * indexing flag, and refuses to let a mismatched build be deployed.
 *
 * Why this exists: `pnpm lighthouse` deliberately builds with
 * NEXT_PUBLIC_ALLOW_INDEXING=true, because Lighthouse scores `noindex` as an
 * SEO failure and the audit has to reflect the production configuration. That
 * leaves `out/` indexable. Deploying straight after an audit would put an
 * indexable build on the preview URL, which is risk R9: a preview indexed by
 * Google before launch creates duplicate content against the real domain.
 *
 * Checking the flag alone would not catch it — the flag is right and the
 * artefact is wrong. So this reads what was actually built.
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const INDEX = fileURLToPath(new URL('../out/index.html', import.meta.url));

/**
 * Read the flag the way the build reads it.
 *
 * Next loads `.env.local` automatically; this script does not, and that
 * difference made the guard reject a correct build — the HTML said `index`
 * because `.env.local` said so, while the guard saw an unset variable and
 * concluded the artefact was a leftover audit build. A guard that disagrees
 * with the thing it is guarding is worse than no guard, because the advice it
 * prints ("run pnpm build") does not work and the obvious next move is to
 * bypass it.
 *
 * Precedence matches Next: a real environment variable wins over the file.
 */
function readConfiguredFlag() {
  const fromEnv = process.env.NEXT_PUBLIC_ALLOW_INDEXING;
  if (fromEnv !== undefined) return fromEnv.trim() === 'true';

  for (const name of ['.env.local', '.env']) {
    const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
    if (!existsSync(path)) continue;
    const match = readFileSync(path, 'utf8').match(
      /^\s*NEXT_PUBLIC_ALLOW_INDEXING\s*=\s*(.*)$/m,
    );
    if (match) return match[1].trim().replace(/^["']|["']$/g, '') === 'true';
  }
  return false;
}

let html;
try {
  html = readFileSync(INDEX, 'utf8');
} catch {
  console.error('\nIndexing check FAILED: out/index.html does not exist.\n');
  console.error('Run `pnpm build` before deploying.\n');
  process.exit(1);
}

const allowIndexing = readConfiguredFlag();
const builtIndexable =
  /<meta name="robots" content="[^"]*\bindex\b[^"]*"/.test(html) &&
  !/<meta name="robots" content="[^"]*noindex/.test(html);

if (builtIndexable !== allowIndexing) {
  console.error('\nIndexing check FAILED: the build does not match the configuration.\n');
  console.error(
    `  NEXT_PUBLIC_ALLOW_INDEXING = ${allowIndexing ? 'true' : 'false (or unset)'}`,
  );
  console.error(
    `  out/index.html is          = ${builtIndexable ? 'indexable' : 'noindex'}\n`,
  );
  console.error(
    builtIndexable
      ? 'Either this is a leftover audit build — `pnpm lighthouse` builds with\n' +
          'indexing on, so run `pnpm build` to rebuild — or the site is meant to\n' +
          'be indexed and NEXT_PUBLIC_ALLOW_INDEXING is missing from .env.local.\n'
      : 'Rebuild with NEXT_PUBLIC_ALLOW_INDEXING=true if the site is meant to be\n' +
          'indexed at this point.\n',
  );
  process.exit(1);
}

console.log(
  `Indexing check passed: build is ${builtIndexable ? 'indexable' : 'noindex'}, matching configuration.`,
);
