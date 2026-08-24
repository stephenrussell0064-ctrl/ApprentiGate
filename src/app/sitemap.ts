import type { MetadataRoute } from 'next';
import { ROUTES } from '@/lib/navigation';
import { absoluteUrl } from '@/lib/site-config';

/**
 * sitemap.xml.
 *
 * Lists only pages meant to be found. The component gallery and the enquiry
 * confirmation are deliberately absent: both carry their own noindex, and a
 * sitemap that lists non-indexable pages tells a search engine one thing while
 * the page tells it another.
 *
 * Priorities are relative, and deliberately not all 1.0 — a sitemap claiming
 * every page is maximally important conveys nothing.
 */
export const dynamic = 'force-static';

const PAGES: readonly { path: string; priority: number }[] = [
  { path: ROUTES.home, priority: 1 },
  { path: ROUTES.howItWorks, priority: 0.9 },
  { path: ROUTES.forEmployers, priority: 0.9 },
  { path: ROUTES.funding, priority: 0.9 },
  { path: ROUTES.contact, priority: 0.8 },
  { path: ROUTES.faq, priority: 0.7 },
  { path: ROUTES.forProviders, priority: 0.6 },
  { path: ROUTES.about, priority: 0.6 },
  { path: ROUTES.privacy, priority: 0.2 },
  { path: ROUTES.cookies, priority: 0.2 },
  { path: ROUTES.terms, priority: 0.2 },
  { path: ROUTES.accessibility, priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.priority >= 0.6 ? 'monthly' : 'yearly',
    priority: page.priority,
  }));
}
