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

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const INDEX = fileURLToPath(new URL('../out/index.html', import.meta.url));

let html;
try {
  html = readFileSync(INDEX, 'utf8');
} catch {
  console.error('\nIndexing check FAILED: out/index.html does not exist.\n');
  console.error('Run `pnpm build` before deploying.\n');
  process.exit(1);
}

const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING?.trim() === 'true';
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
      ? 'This is almost always a leftover audit build. `pnpm lighthouse` builds\n' +
          'with indexing on. Run `pnpm build` to rebuild before deploying.\n'
      : 'Rebuild with NEXT_PUBLIC_ALLOW_INDEXING=true if the site is meant to be\n' +
          'indexed at this point.\n',
  );
  process.exit(1);
}

console.log(
  `Indexing check passed: build is ${builtIndexable ? 'indexable' : 'noindex'}, matching configuration.`,
);
