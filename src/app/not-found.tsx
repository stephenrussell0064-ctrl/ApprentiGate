import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';

/**
 * Exported as out/404.html and served by Cloudflare for unmatched paths via
 * `not_found_handling: "404-page"` in wrangler.jsonc.
 */
export default function NotFound() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center px-[var(--spacing-ag-6)] py-[var(--spacing-ag-6)]">
        <Link href="/" aria-label="ApprentiGate home">
          <Wordmark decorative />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-[var(--spacing-ag-6)] py-[var(--spacing-ag-16)]">
        <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
          Error 404
        </p>

        <h1 className="mt-[var(--spacing-ag-4)] text-[length:var(--text-ag-3xl)] font-semibold text-[color:var(--color-ag-ink)]">
          Page not found
        </h1>

        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          That page does not exist. It may have been moved or removed.
        </p>

        <Link
          href="/"
          className="mt-[var(--spacing-ag-8)] inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-ag-lg)] bg-[var(--color-ag-signal)] px-[var(--spacing-ag-6)] text-[length:var(--text-ag-base)] font-semibold text-[color:var(--color-ag-paper)] transition-opacity duration-[var(--duration-ag-micro)] ease-[var(--ease-ag-enter)] hover:opacity-90"
        >
          Return to the home page
        </Link>
      </main>
    </div>
  );
}
