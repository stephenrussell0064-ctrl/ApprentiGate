import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * Exported as out/404.html and served by Cloudflare for unmatched paths via
 * `not_found_handling: "404-page"` in wrangler.jsonc.
 */
export default function NotFound() {
  return (
    <Section>
      <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
        Error 404
      </p>

      <h1 className="mt-[var(--spacing-ag-4)] text-[length:var(--text-ag-3xl)] font-semibold text-[color:var(--color-ag-ink)]">
        Page not found
      </h1>

      <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
        That page does not exist. It may have been moved or removed.
      </p>

      <div className="mt-[var(--spacing-ag-8)]">
        <ButtonLink href={ROUTES.home}>Return to the home page</ButtonLink>
      </div>
    </Section>
  );
}
