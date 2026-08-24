import type { Metadata } from 'next';
import { ROUTES } from '@/lib/navigation';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

/**
 * Page metadata, built from one place.
 *
 * Every absolute URL here — canonical, Open Graph, Twitter, JSON-LD — comes
 * from `absoluteUrl`, which derives from NEXT_PUBLIC_SITE_URL. That is what
 * makes the domain cutover a configuration change rather than a search across
 * the codebase, and `pnpm guard:domains` fails the build if anything under
 * `src/` writes a domain out longhand.
 */

export const SITE_NAME = 'ApprentiGate';

/**
 * The social card. One image for the whole site: it carries the proposition
 * and nothing that needs qualifying, so there is no page it would be wrong on,
 * and a per-page variant would be twelve more things to keep true.
 */
const OG_IMAGE = {
  url: absoluteUrl('/og.png'),
  width: 1200,
  height: 630,
  alt: 'ApprentiGate — apprenticeships for growing businesses in England',
} as const;

/** Title and description limits from Content Spec 5, enforced by test. */
export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

interface PageMetaOptions {
  /** Page title, without the site name — the layout template appends it. */
  readonly title: string;
  readonly description: string;
  /** Site-relative path, used for the canonical URL. */
  readonly path: string;
  /** Set for pages that must not be indexed. */
  readonly noindex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: PageMetaOptions): Metadata {
  const canonical = absoluteUrl(path);
  // The template in the root layout appends the site name; Open Graph has no
  // template, so the full form is built once here.
  const fullTitle = path === ROUTES.home ? title : `${title} — ${SITE_NAME}`;

  return {
    // The home page already names the business in its title, so it opts out of
    // the template rather than reading "ApprentiGate … — ApprentiGate".
    title: path === ROUTES.home ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: canonical,
      locale: 'en_GB',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * Organization structured data.
 *
 * No `aggregateRating`, no `review`, no `award`. Those would be fabrication,
 * and structured data is where a fabricated claim is likeliest to survive
 * unnoticed, because nobody reads it. There is also no `logo` property pointing
 * at a mark that search engines would treat as a verified brand asset, and no
 * `foundingDate`, `numberOfEmployees` or `address` — the business is not
 * incorporated and has no registered address to give.
 *
 * `areaServed` is England, not the United Kingdom. Apprenticeship funding is
 * devolved and the other nations run different systems, so claiming UK coverage
 * would be a factual error, in the markup as much as in the copy.
 */
export function organizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl(ROUTES.home),
    description:
      'ApprentiGate helps smaller employers in England set up and run apprenticeship programmes, working between the employer and approved training providers.',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'England',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: 'English',
      url: absoluteUrl(ROUTES.contact),
      ...(siteConfig.enquiriesEmail ? { email: siteConfig.enquiriesEmail } : {}),
      ...(siteConfig.hasPhone ? { telephone: siteConfig.phone } : {}),
    },
  };
}
