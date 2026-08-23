import { RelayBand } from '@/components/brand/RelayBand';
import { Wordmark } from '@/components/brand/Wordmark';
import { BUSINESS_LOCATION, FOOTER_NAV, ROUTES } from '@/lib/navigation';
import { siteConfig } from '@/lib/site-config';

/**
 * Site footer.
 *
 * What it deliberately does not contain, and why:
 *
 *   - No "Ltd", no company number, no registered office. The business is not
 *     incorporated (constraint 3). The company number appears here the moment
 *     NEXT_PUBLIC_COMPANY_NUMBER is set, and not before.
 *   - No street address. The location is the town and county only
 *     (constraint 6).
 *   - No telephone number in the repository. It comes from configuration and
 *     falls back to a non-dialable notice (constraint 5, risk R3).
 *   - No enquiries address until the mailbox exists. Showing an address that
 *     bounces is worse than showing none.
 *   - No claim of any kind. Footers are where "trusted by" and accreditation
 *     logos usually get smuggled in; there is nothing here to audit.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-ag-mist)] bg-[var(--color-ag-paper)]">
      {/* The signature element as a closing rule, its third recurrence after
          the hero and the section divider. */}
      <div className="mx-auto max-w-6xl px-[var(--spacing-ag-6)] pt-[var(--spacing-ag-12)] pb-[var(--spacing-ag-8)]">
        <RelayBand variant="rule" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-[var(--spacing-ag-8)] px-[var(--spacing-ag-6)] pb-[var(--spacing-ag-12)] md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-[var(--spacing-ag-4)]">
          <a
            href={ROUTES.home}
            aria-label="ApprentiGate home"
            className="rounded-[var(--radius-ag-sm)]"
          >
            <Wordmark decorative size={24} />
          </a>
          <address className="flex flex-col gap-[var(--spacing-ag-1)] text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)] not-italic">
            <span>{BUSINESS_LOCATION}</span>
            <span>{siteConfig.phone}</span>
            {siteConfig.enquiriesEmail && (
              <a
                href={`mailto:${siteConfig.enquiriesEmail}`}
                className="underline underline-offset-4"
              >
                {siteConfig.enquiriesEmail}
              </a>
            )}
          </address>
        </div>

        {FOOTER_NAV.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
              {group.title}
            </h2>
            <ul className="mt-[var(--spacing-ag-4)] flex list-none flex-col gap-[var(--spacing-ag-3)] p-0">
              {group.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)] transition-colors duration-[var(--duration-ag-micro)] ease-[var(--ease-ag-enter)] hover:text-[color:var(--color-ag-ink)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-[var(--color-ag-mist)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-[var(--spacing-ag-2)] px-[var(--spacing-ag-6)] py-[var(--spacing-ag-6)] text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} ApprentiGate</p>
          {siteConfig.companyNumber && (
            <p>
              Registered in England and Wales, company number {siteConfig.companyNumber}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
