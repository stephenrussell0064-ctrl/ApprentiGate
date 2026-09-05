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
  /**
   * Enquiries mailbox, or `null` until the operator creates it.
   *
   * It is a variable rather than a literal for the same reason as every URL:
   * the address is on the production domain, and no domain may be hardcoded in
   * `src/`. Where it is `null` the footer omits the row rather than showing an
   * address that does not receive mail.
   */
  readonly enquiriesEmail: string | null;
  /**
   * Cal.com link slug, e.g. "apprentigate/consultation". Null until the
   * operator creates the account and event type, in which case the contact
   * page says booking is not switched on rather than showing a broken embed.
   */
  readonly calLink: string | null;
  /**
   * Cloudflare Turnstile site key. Public by design — the secret half is a
   * Worker secret. Null until configured, and the form declines submissions
   * rather than accepting unverified ones.
   */
  readonly turnstileSiteKey: string | null;
  /**
   * Cloudflare Web Analytics token. The analytics are cookieless and count page
   * views in aggregate, which is why the site needs no consent banner — but the
   * beacon is still a third-party script, so the cookie policy names it
   * whenever this is set. Null until the operator enables it.
   */
  readonly analyticsToken: string | null;
  /**
   * The phone number as a `tel:` href, or null when there is no real number.
   *
   * Null rather than a link to the "to be confirmed" notice, because offering
   * to dial a sentence is worse than showing no link at all.
   */
  readonly phoneHref: string | null;
}

export interface SiteConfigEnv {
  readonly NEXT_PUBLIC_SITE_URL?: string | undefined;
  readonly NEXT_PUBLIC_ALLOW_INDEXING?: string | undefined;
  readonly NEXT_PUBLIC_BUSINESS_PHONE?: string | undefined;
  readonly NEXT_PUBLIC_COMPANY_NUMBER?: string | undefined;
  readonly NEXT_PUBLIC_ENQUIRIES_EMAIL?: string | undefined;
  readonly NEXT_PUBLIC_CAL_LINK?: string | undefined;
  readonly NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string | undefined;
  readonly NEXT_PUBLIC_ANALYTICS_TOKEN?: string | undefined;
}

/** Shown wherever a phone number would go until the operator provisions a VoIP line. */
export const PHONE_NOT_YET_AVAILABLE = 'Telephone number to be confirmed';

/**
 * Turn a displayed UK number into something a dialer can use.
 *
 * The displayed form is spaced for reading ("07484 196322"); a `tel:` href
 * must not be. A leading 0 becomes +44 so the link works from outside the UK,
 * where a national number simply does not connect — the people most likely to
 * tap a link rather than copy the number are on a phone, and some of them are
 * not in the country.
 */
export function toTelHref(displayed: string): string {
  const digits = displayed.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : digits.replace(/^0/, '+44');
}

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
  const rawEmail = env.NEXT_PUBLIC_ENQUIRIES_EMAIL?.trim();
  const rawCalLink = env.NEXT_PUBLIC_CAL_LINK?.trim();
  const rawTurnstile = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const rawAnalytics = env.NEXT_PUBLIC_ANALYTICS_TOKEN?.trim();

  const hasPhone = rawPhone !== undefined && rawPhone.length > 0;

  return {
    url: rawUrl && rawUrl.length > 0 ? normaliseUrl(rawUrl) : LOCAL_DEVELOPMENT_URL,
    // Anything other than the exact string "true" leaves indexing disabled.
    allowIndexing: env.NEXT_PUBLIC_ALLOW_INDEXING?.trim() === 'true',
    phone: hasPhone ? rawPhone : PHONE_NOT_YET_AVAILABLE,
    hasPhone,
    companyNumber:
      rawCompanyNumber && rawCompanyNumber.length > 0 ? rawCompanyNumber : null,
    enquiriesEmail: rawEmail && rawEmail.includes('@') ? rawEmail : null,
    calLink: rawCalLink && rawCalLink.length > 0 ? rawCalLink.replace(/^\/+/, '') : null,
    turnstileSiteKey: rawTurnstile && rawTurnstile.length > 0 ? rawTurnstile : null,
    analyticsToken: rawAnalytics && rawAnalytics.length > 0 ? rawAnalytics : null,
    phoneHref: hasPhone ? toTelHref(rawPhone) : null,
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
  NEXT_PUBLIC_ENQUIRIES_EMAIL: process.env.NEXT_PUBLIC_ENQUIRIES_EMAIL,
  NEXT_PUBLIC_CAL_LINK: process.env.NEXT_PUBLIC_CAL_LINK,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_ANALYTICS_TOKEN: process.env.NEXT_PUBLIC_ANALYTICS_TOKEN,
});
