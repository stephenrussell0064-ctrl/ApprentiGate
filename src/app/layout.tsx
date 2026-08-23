import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

/**
 * Scaffold-level metadata only. WP12 owns per-page titles, descriptions,
 * Open Graph and Twitter cards, and structured data.
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
    <html lang="en-GB">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
