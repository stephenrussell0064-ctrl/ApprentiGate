import type { NextConfig } from 'next';

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
