import Link from 'next/link';
import { RelayBand } from '@/components/brand/RelayBand';
import { Wordmark } from '@/components/brand/Wordmark';

/**
 * WP1 hero, demonstrating Direction B ("Workbench") in code.
 *
 * All copy here is the approved Home hero from Content Spec 4.1 and is used
 * verbatim. Nothing on this page is invented, and it makes no claim that would
 * need a source. The rest of the Home page is built at WP3.
 *
 * The two calls to action point at routes that land at WP2 (How It Works) and
 * WP10 (Contact). Until then they resolve to the custom 404. The site is not
 * publicly reachable and carries noindex, so no visitor and no crawler meets
 * them; the e2e suite asserts the destinations are correct rather than that
 * they resolve.
 */
export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center px-[var(--spacing-ag-6)] py-[var(--spacing-ag-6)]">
        <Link href="/" aria-label="ApprentiGate home">
          <Wordmark decorative />
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-[var(--spacing-ag-6)] pt-[var(--spacing-ag-12)] pb-[var(--spacing-ag-16)] md:pt-[var(--spacing-ag-24)]">
          <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
            Apprenticeships for growing businesses in England
          </p>

          <h1 className="mt-[var(--spacing-ag-6)] max-w-[18ch] text-[length:var(--text-ag-3xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-4xl)] lg:text-[length:var(--text-ag-5xl)]">
            Build your apprenticeship programme without the complexity.
          </h1>

          <p className="mt-[var(--spacing-ag-6)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
            ApprentiGate helps growing businesses identify suitable apprenticeship routes,
            compare approved training providers and coordinate programme setup — without
            needing a dedicated internal apprenticeship team.
          </p>

          <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
            {/*
              Plain anchors, not next/link. Link prefetches its destination on
              load, and these two routes do not exist until WP2 and WP10, so
              every page view was firing a 404 for each of them. `prefetch`
              set to false did not stop it.

              A plain anchor is the right primitive here regardless: the site is
              a fully static export with no shared client state, so the client
              router earns nothing on these links. WP2 settles the navigation
              approach for the site as a whole.
            */}
            <a
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-ag-lg)] bg-[var(--color-ag-signal)] px-[var(--spacing-ag-6)] text-[length:var(--text-ag-base)] font-semibold text-[color:var(--color-ag-paper)] transition-opacity duration-[var(--duration-ag-micro)] ease-[var(--ease-ag-enter)] hover:opacity-90"
            >
              Explore apprenticeships for your business
            </a>

            <a
              href="/how-it-works"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-ag-lg)] border border-[var(--color-ag-mist)] px-[var(--spacing-ag-6)] text-[length:var(--text-ag-base)] font-semibold text-[color:var(--color-ag-ink)] transition-colors duration-[var(--duration-ag-micro)] ease-[var(--ease-ag-enter)] hover:bg-[var(--color-ag-mist)]"
            >
              See how it works
            </a>
          </div>
        </section>

        {/* The signature element. It carries the single most important
            correction the page has to make: ApprentiGate is neither the
            training provider nor the recruiter. */}
        <section className="border-t border-[var(--color-ag-mist)] bg-[var(--color-ag-paper)]">
          <div className="mx-auto max-w-6xl px-[var(--spacing-ag-6)] py-[var(--spacing-ag-12)]">
            <RelayBand />
          </div>
        </section>
      </main>
    </div>
  );
}
