/**
 * The single source of every absolute URL and every operator-supplied value.
 *
 * Brief s5 / constraint 4: nothing may hardcode a domain. Canonical tags, the
 * sitemap, OG and Twitter tags, JSON-LD `url` properties and llms.txt all read
 * from here, so the cutover from the preview URL to the real domain (WP16) is a
 * configuration change rather than a refactor.
 *
 * `scripts/check-hardcoded-domains.mjs` enforces this at build time.
 */

export interface SiteConfig {
  /** Absolute origin with no trailing slash, scheme and host only. */
  readonly url: string;
  /**
   * Whether crawlers may index the site. Defaults to `false` so that a preview
   * deployment can never be indexed by accident — an indexed preview URL creates
   * duplicate content against the real domain. Flipped to `true` at cutover.
   *
   * This is an explicit flag rather than something inferred from the hostname,
   * because inferring it would require hardcoding the production domain.
   */
  readonly allowIndexing: boolean;
  /**
   * Business telephone number. Defaults to a non-dialable notice: constraint 5
   * bars any real number from the repository, and a founder's personal mobile
   * must never be committed (risk R3). Substituted at cutover.
   */
  readonly phone: string;
  /** True when `phone` is a real number rather than the default notice. */
  readonly hasPhone: boolean;
  /**
   * Companies House number, or `null` while unincorporated. Constraint 3 bars a
   * company number, "Ltd" and a registered office until incorporation; setting
   * this one variable is all that is needed to add it to the footer later.
   */
  readonly companyNumber: string | null;
}

export interface SiteConfigEnv {
  readonly NEXT_PUBLIC_SITE_URL?: string | undefined;
  readonly NEXT_PUBLIC_ALLOW_INDEXING?: string | undefined;
  readonly NEXT_PUBLIC_BUSINESS_PHONE?: string | undefined;
  readonly NEXT_PUBLIC_COMPANY_NUMBER?: string | undefined;
}

/** Shown wherever a phone number would go until the operator provisions a VoIP line. */
export const PHONE_NOT_YET_AVAILABLE = 'Telephone number to be confirmed';

/** Used when no site URL is configured, i.e. local development. */
const LOCAL_DEVELOPMENT_URL = 'http://localhost:3000';

function normaliseUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is not a valid absolute URL: ${JSON.stringify(raw)}. ` +
        'Expected an absolute origin including the scheme, such as the ' +
        'Cloudflare preview host or the production domain.',
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be http or https, received ${JSON.stringify(parsed.protocol)}.`,
    );
  }

  // Strip any path, query, fragment and trailing slash so callers can safely
  // concatenate: `${siteConfig.url}/funding`.
  return `${parsed.protocol}//${parsed.host}`;
}

export function resolveSiteConfig(env: SiteConfigEnv): SiteConfig {
  const rawUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  const rawPhone = env.NEXT_PUBLIC_BUSINESS_PHONE?.trim();
  const rawCompanyNumber = env.NEXT_PUBLIC_COMPANY_NUMBER?.trim();

  const hasPhone = rawPhone !== undefined && rawPhone.length > 0;

  return {
    url: rawUrl && rawUrl.length > 0 ? normaliseUrl(rawUrl) : LOCAL_DEVELOPMENT_URL,
    // Anything other than the exact string "true" leaves indexing disabled.
    allowIndexing: env.NEXT_PUBLIC_ALLOW_INDEXING?.trim() === 'true',
    phone: hasPhone ? rawPhone : PHONE_NOT_YET_AVAILABLE,
    hasPhone,
    companyNumber:
      rawCompanyNumber && rawCompanyNumber.length > 0 ? rawCompanyNumber : null,
  };
}

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path: string, config: SiteConfig = siteConfig): string {
  return `${config.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Each variable is read as a literal member access so that Next inlines it at
 * build time under `output: 'export'`. Passing `process.env` wholesale would
 * defeat that and leave the values undefined in the exported HTML.
 */
export const siteConfig: SiteConfig = resolveSiteConfig({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING,
  NEXT_PUBLIC_BUSINESS_PHONE: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
  NEXT_PUBLIC_COMPANY_NUMBER: process.env.NEXT_PUBLIC_COMPANY_NUMBER,
});
