import type { NextConfig } from 'next';

/**
 * Refuse to build a production bundle with the bot check switched off.
 *
 * The Turnstile site key is compiled into the HTML, so a build made without it
 * ships a contact page that tells every visitor "The form is not accepting
 * enquiries yet". That artefact has reached the live domain twice, and it is
 * invisible in the build output — `next build` succeeds, the deploy succeeds,
 * and the page looks normal unless you read it.
 *
 * The pre-deploy guards and the post-deploy smoke check both catch it now, but
 * they catch it downstream. This stops the artefact existing.
 *
 * Scoped to builds aimed at a real origin, so it never obstructs local work:
 * `pnpm dev` and the Playwright build have no production `NEXT_PUBLIC_SITE_URL`,
 * and the Lighthouse audit build supplies Turnstile's test key.
 */
function assertProductionBuildIsComplete() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim();
  const turnstile = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '').trim();

  const targetsRealOrigin =
    siteUrl.startsWith('https://') && !siteUrl.includes('localhost');

  if (targetsRealOrigin && turnstile === '') {
    throw new Error(
      [
        '',
        `Refusing to build for ${siteUrl} with NEXT_PUBLIC_TURNSTILE_SITE_KEY unset.`,
        '',
        'The site key is compiled into the HTML. Without it the contact page',
        'renders "The form is not accepting enquiries yet" and every submission',
        'is declined — on the live domain, silently.',
        '',
        'Set it in .env.local (it is public by design; the secret half lives on',
        'the Worker), or build without NEXT_PUBLIC_SITE_URL for a local build.',
        '',
      ].join('\n'),
    );
  }
}

assertProductionBuildIsComplete();

const nextConfig: NextConfig = {
  /**
   * Fully static. The site has no server-rendering requirement; the only dynamic
   * surface is the enquiry POST, which is a separate Worker route (WP10).
   */
  output: 'export',

  /**
   * `false` emits `out/about.html` rather than `out/about/index.html`, which pairs
   * with Cloudflare's default `auto-trailing-slash` asset routing. Changing one of
   * these without the other causes redirect loops.
   */
  trailingSlash: false,

  /** next/image optimisation requires a server; unavailable under `output: 'export'`. */
  images: { unoptimized: true },

  reactStrictMode: true,

  /**
   * Fail the build on a type error rather than shipping one. There is no
   * corresponding `eslint` key: Next 16 removed `next lint`, so linting is run
   * directly by `pnpm lint` and gated in `pnpm verify`.
   */
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
