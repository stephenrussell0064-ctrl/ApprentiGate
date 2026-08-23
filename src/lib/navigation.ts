/**
 * The site's route map and navigation structure, in one place.
 *
 * Header, footer and sitemap all read from here, so a page cannot appear in one
 * and be missing from another. Paths are site-relative: absolute URLs are built
 * from NEXT_PUBLIC_SITE_URL by `absoluteUrl`, never written out here.
 *
 * Most of these routes do not exist yet — pages land at WP3 to WP11. Links to
 * them resolve to the custom 404 in the meantime. They are declared now because
 * the shell is what WP2 delivers, and because a nav assembled page-by-page as
 * routes appear is how items end up inconsistent between header and footer.
 */

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Set until the work package that builds the page has landed. */
  readonly pending?: boolean;
}

export const ROUTES = {
  home: '/',
  howItWorks: '/how-it-works',
  forEmployers: '/for-employers',
  forProviders: '/for-training-providers',
  funding: '/funding',
  about: '/about',
  faq: '/faq',
  contact: '/contact',
  bookingConfirmed: '/contact/confirmed',
  privacy: '/privacy',
  cookies: '/cookies',
  terms: '/terms',
  accessibility: '/accessibility',
  components: '/components',
} as const;

/** Primary navigation, in the header. Kept to six so it fits without crowding. */
export const PRIMARY_NAV: readonly NavItem[] = [
  { label: 'How it works', href: ROUTES.howItWorks, pending: true },
  { label: 'For employers', href: ROUTES.forEmployers, pending: true },
  { label: 'For training providers', href: ROUTES.forProviders, pending: true },
  { label: 'Funding', href: ROUTES.funding, pending: true },
  { label: 'About', href: ROUTES.about, pending: true },
  { label: 'FAQ', href: ROUTES.faq, pending: true },
];

/** The single call to action carried by the header and the footer. */
export const PRIMARY_CTA: NavItem = {
  label: 'Book a call',
  href: ROUTES.contact,
  pending: true,
};

export interface NavGroup {
  readonly title: string;
  readonly items: readonly NavItem[];
}

export const FOOTER_NAV: readonly NavGroup[] = [
  {
    title: 'Service',
    items: [
      { label: 'How it works', href: ROUTES.howItWorks, pending: true },
      { label: 'For employers', href: ROUTES.forEmployers, pending: true },
      { label: 'For training providers', href: ROUTES.forProviders, pending: true },
      { label: 'Funding explained', href: ROUTES.funding, pending: true },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: ROUTES.about, pending: true },
      { label: 'FAQ', href: ROUTES.faq, pending: true },
      { label: 'Contact', href: ROUTES.contact, pending: true },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy notice', href: ROUTES.privacy, pending: true },
      { label: 'Cookie policy', href: ROUTES.cookies, pending: true },
      { label: 'Terms of use', href: ROUTES.terms, pending: true },
      { label: 'Accessibility statement', href: ROUTES.accessibility, pending: true },
    ],
  },
];

/**
 * The one place the business's location may be written.
 * Constraint 6: the town and county only, never a street address.
 */
export const BUSINESS_LOCATION = 'High Wycombe, Buckinghamshire';
