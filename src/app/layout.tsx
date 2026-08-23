import type { Metadata } from 'next';
import { Figtree, IBM_Plex_Mono, Source_Sans_3 } from 'next/font/google';
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
  title: 'ApprentiGate',
  description:
    'ApprentiGate helps growing businesses in England set up and run apprenticeship programmes.',
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
      <body>{children}</body>
    </html>
  );
}
