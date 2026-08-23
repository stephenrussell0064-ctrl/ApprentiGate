import Link from 'next/link';

/**
 * Exported as out/404.html and served by Cloudflare for unmatched paths via
 * `not_found_handling: "404-page"` in wrangler.jsonc. Styled properly at WP2.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-lg text-slate-700">
        That page does not exist. It may have been moved or removed.
      </p>
      <p>
        <Link
          href="/"
          className="font-medium text-slate-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Return to the home page
        </Link>
      </p>
    </main>
  );
}
