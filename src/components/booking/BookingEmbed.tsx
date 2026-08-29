'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';

/**
 * The Cal.com booking calendar, loaded only when the person asks for it.
 *
 * Click-to-load rather than lazy-on-scroll, for three reasons that all point
 * the same way:
 *
 *   - It cannot block first paint, because nothing third-party is requested
 *     until a deliberate click.
 *   - Nobody's browser contacts Cal.com unless they intend to book. Most
 *     visitors never will, and loading an embed on their behalf hands a third
 *     party a page view they had no reason to receive.
 *   - It keeps the cookie policy honest. Nothing Cal.com sets exists on this
 *     site until the visitor opts in by clicking, which is a far simpler and
 *     more truthful thing to write down than a consent banner.
 *
 * The button says what clicking will do, rather than pretending the calendar is
 * already there.
 */

interface BookingEmbedProps {
  /** Cal.com link slug, e.g. "team/consultation". Null when unconfigured. */
  readonly calLink: string | null;
}

export function BookingEmbed({ calLink }: BookingEmbedProps) {
  const [requested, setRequested] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!requested || !calLink || !containerRef.current) return;

    const frame = document.createElement('iframe');
    /*
     * `cal.com/<link>/embed`, not `app.cal.com/<link>`.
     *
     * app.cal.com is Cal's own dashboard, where a booking link does not exist —
     * it answered every embed with Cal's 404 page, framed inside our contact
     * page, for as long as the calendar has been switched on. The public
     * booking host is cal.com, and the `/embed` suffix serves the same page
     * without Cal's site chrome, which is the version meant to sit in an
     * iframe. `theme=light` stops it rendering dark inside a light page.
     */
    frame.src = `https://cal.com/${calLink}/embed?theme=light`;
    frame.title = 'Booking calendar';
    frame.loading = 'lazy';
    frame.className =
      'h-[70vh] min-h-[560px] w-full rounded-[var(--radius-ag-lg)] border-0';
    containerRef.current.replaceChildren(frame);
  }, [requested, calLink]);

  if (!calLink) {
    return (
      <Notice tone="info" title="Online booking is not switched on yet.">
        The calendar goes live once we have set it up. In the meantime, send an enquiry
        using the form and we will find a time by email.
      </Notice>
    );
  }

  if (!requested) {
    return (
      <div className="flex flex-col gap-[var(--spacing-ag-4)] rounded-[var(--radius-ag-lg)] border border-dashed border-[var(--color-ag-slate)] p-[var(--spacing-ag-8)]">
        <p className="max-w-[52ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          The calendar is provided by Cal.com. We do not load it until you ask, so nothing
          is requested from them unless you intend to book.
        </p>
        <div>
          <Button size="lg" onClick={() => setRequested(true)}>
            Load the calendar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-[var(--radius-ag-lg)] border border-[var(--color-ag-mist)]"
    >
      <p className="p-[var(--spacing-ag-6)] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
        Loading the calendar…
      </p>
    </div>
  );
}
