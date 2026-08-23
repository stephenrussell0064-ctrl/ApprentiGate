import { siteConfig } from '@/lib/site-config';

/**
 * WP0 scaffold page. It deliberately makes no claim about the business and
 * carries no marketing copy: every word on the public site must trace to the
 * Content Spec, and this page is replaced wholesale by the Home page at WP3.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">ApprentiGate</h1>

      <p className="text-lg text-slate-700">
        Build scaffold. The public site has not been written yet.
      </p>

      <dl className="grid gap-3 border-t border-slate-200 pt-6 text-sm">
        <div className="flex flex-wrap gap-x-3">
          <dt className="font-medium text-slate-900">Configured site URL</dt>
          <dd className="text-slate-700">{siteConfig.url}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3">
          <dt className="font-medium text-slate-900">Indexing</dt>
          <dd className="text-slate-700">
            {siteConfig.allowIndexing ? 'Allowed' : 'Disallowed'}
          </dd>
        </div>
      </dl>
    </main>
  );
}
