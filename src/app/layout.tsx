import type { Metadata } from 'next';
import { Figtree, IBM_Plex_Mono, Source_Sans_3 } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { organizationStructuredData } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

/**
 * Faces are self-hosted by next/font at build time, so there is no request to
 * an external font host, no render-blocking stylesheet and no layout shift.
 * `display: swap` keeps text visible while the face loads.
 */
const figtree = Figtree({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-source-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

/**
 * Scaffold-level metadata. WP12 owns per-page titles, descriptions, Open Graph
 * and Twitter cards, and structured data.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  /**
   * Pages set their own title; the template appends the business name so every
   * tab and search result is attributable without each page repeating it.
   * Titles stay under 60 characters and descriptions under 155 (Content Spec 5).
   */
  title: {
    default: 'ApprentiGate — apprenticeships for growing businesses',
    template: '%s — ApprentiGate',
  },
  description:
    'ApprentiGate helps smaller employers in England set up and run apprenticeship programmes, working between the employer and approved training providers.',
  /**
   * Indexing is off unless explicitly enabled, so the preview deployment cannot
   * be indexed and create duplicate content against the real domain (Brief s5).
   */
  robots: siteConfig.allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${figtree.variable} ${sourceSans.variable} ${plexMono.variable}`}
    >
      <head>
        {/*
          Organization data, on every page. No aggregateRating, review or award
          property — structured data is where a fabricated claim is likeliest to
          survive unnoticed, because nobody reads it.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData()),
          }}
        />
        {/*
          Cloudflare Web Analytics: cookieless, aggregate, and unable to
          identify a visitor or follow them off the site — which is why this
          site needs no consent banner. It is still a third-party script, and
          the cookie policy names it whenever this token is set.
        */}
        {siteConfig.analyticsToken && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: siteConfig.analyticsToken })}
          />
        )}
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        {/* The skip link's target. `main` is also the page's only <main>
            landmark, so pages compose sections inside it rather than each
            declaring their own. */}
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
