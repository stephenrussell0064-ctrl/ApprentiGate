import type { MetadataRoute } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

/**
 * robots.txt.
 *
 * Crawling is refused outright unless indexing has been explicitly enabled.
 * That is the whole point of the arrangement in Brief s5: a preview URL indexed
 * by Google before launch creates duplicate content competing with the real
 * domain, and the damage is done long before anyone notices.
 *
 * The default is therefore "disallow everything", and it takes a deliberate
 * NEXT_PUBLIC_ALLOW_INDEXING=true at cutover to change that — the same flag the
 * per-page robots meta reads, so the two can never disagree.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Internal or non-content routes. They also carry their own noindex;
        // this simply saves crawlers the trip.
        disallow: ['/components', '/contact/confirmed', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  };
}
