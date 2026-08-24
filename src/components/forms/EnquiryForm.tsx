'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import {
  EMPLOYEE_BANDS,
  FREE_WEBMAIL_NOTICE,
  enquirySchema,
  formatZodErrors,
  isFreeWebmail,
  stripEmptyOptionals,
  type EnquiryErrors,
} from '@/lib/enquiry';
import { ROUTES } from '@/lib/navigation';

/**
 * The enquiry form.
 *
 * It posts to the Worker as JSON and shows the result inline. The form element
 * also carries a real `action` and `method`, so a submission still reaches the
 * Worker if the JavaScript fails — in which case the Worker replies with a
 * redirect to the confirmation page rather than JSON.
 *
 * The failure state is the part that matters most. If the send fails, the
 * person is told plainly and given the email address, because an enquiry that
 * disappears silently is worse than a form that visibly did not work.
 */

interface EnquiryFormProps {
  /** Cloudflare Turnstile site key. Without it the form cannot be submitted. */
  readonly turnstileSiteKey: string | null;
  /** Shown if sending fails, so an enquiry is never lost. */
  readonly fallbackEmail: string | null;
}

type Status = 'idle' | 'submitting' | 'failed';

export function EnquiryForm({ turnstileSiteKey, fallbackEmail }: EnquiryFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [webmailNotice, setWebmailNotice] = useState(false);
  const [failureEmail, setFailureEmail] = useState<string | null>(fallbackEmail);
  const errorRef = useRef<HTMLDivElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());

    // Absent, never guessed: empty optional fields are removed rather than
    // submitted as empty strings.
    const values = stripEmptyOptionals({
      ...raw,
      consent: raw['consent'] === 'on',
    });

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const found = formatZodErrors(parsed.error);
      setErrors(found);
      setStatus('idle');
      // Move focus to the first thing that is wrong.
      const firstField = Object.keys(found)[0];
      if (firstField) form.querySelector<HTMLElement>(`#enquiry-${firstField}`)?.focus();
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          website: raw['website'] ?? '',
          turnstileToken: raw['cf-turnstile-response'] ?? '',
        }),
      });

      if (response.ok) {
        window.location.assign(ROUTES.bookingConfirmed);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as {
        errors?: EnquiryErrors;
        fallbackEmail?: string | null;
      };

      if (response.status === 400 && body.errors) {
        setErrors(body.errors);
        setStatus('idle');
        return;
      }

      if (body.fallbackEmail) setFailureEmail(body.fallbackEmail);
      setStatus('failed');
      errorRef.current?.focus();
    } catch {
      setStatus('failed');
      errorRef.current?.focus();
    }
  }

  return (
    <form
      action="/api/enquiry"
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-[var(--spacing-ag-6)]"
    >
      {status === 'failed' && (
        <div ref={errorRef} tabIndex={-1}>
          <Notice tone="error" title="We could not send your enquiry.">
            <div className="flex flex-col gap-[var(--spacing-ag-2)]">
              <p>
                Nothing has been lost — it simply did not reach us, so please try again in
                a moment.
              </p>
              {failureEmail && (
                <p>
                  If it keeps failing, email us directly at{' '}
                  <a
                    href={`mailto:${failureEmail}`}
                    className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
                  >
                    {failureEmail}
                  </a>{' '}
                  and we will pick it up.
                </p>
              )}
            </div>
          </Notice>
        </div>
      )}

      <TextField
        id="enquiry-name"
        name="name"
        label="Your name"
        autoComplete="name"
        {...(errors.name ? { error: errors.name } : {})}
      />

      <TextField
        id="enquiry-company"
        name="company"
        label="Company"
        autoComplete="organization"
        {...(errors.company ? { error: errors.company } : {})}
      />

      <div className="flex flex-col gap-[var(--spacing-ag-3)]">
        <TextField
          id="enquiry-email"
          name="email"
          type="email"
          label="Work email"
          autoComplete="email"
          onBlur={(event) => setWebmailNotice(isFreeWebmail(event.target.value))}
          {...(errors.email ? { error: errors.email } : {})}
        />
        {/*
          A nudge, not a block. Content Spec 4.8 asks for a gentle message
          rather than a hard block, and somebody running a real business from a
          personal address is still a real prospect.
        */}
        {webmailNotice && !errors.email && (
          <p className="text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-slate)]">
            {FREE_WEBMAIL_NOTICE}
          </p>
        )}
      </div>

      <TextField
        id="enquiry-phone"
        name="phone"
        type="tel"
        label="Phone"
        optional
        autoComplete="tel"
      />

      <SelectField
        id="enquiry-employees"
        name="employees"
        label="Approximate number of employees"
        optional
        options={[...EMPLOYEE_BANDS]}
      />

      <TextField
        id="enquiry-roles"
        name="roles"
        label="Roles you are recruiting"
        optional
      />

      <TextField
        id="enquiry-apprentices"
        name="apprentices"
        label="Approximate number of potential apprentices"
        optional
      />

      <TextAreaField id="enquiry-message" name="message" label="Message" optional />

      {/*
        The honeypot. Hidden from people and from assistive technology, left in
        the tab order's shadow with tabIndex -1, and never autofilled.
      */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input
          id="enquiry-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <CheckboxField
        id="enquiry-consent"
        name="consent"
        label={
          <>
            I&rsquo;m happy for ApprentiGate to contact me about my enquiry.
            <br />
            <a
              href={ROUTES.privacy}
              className="text-[length:var(--text-ag-sm)] text-[color:var(--color-ag-signal)] underline underline-offset-4"
            >
              How we handle your details
            </a>
          </>
        }
        {...(errors.consent ? { error: errors.consent } : {})}
      />

      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-appearance="interaction-only"
        />
      ) : (
        <Notice tone="info" title="The form is not accepting enquiries yet.">
          Bot protection has not been configured on this deployment, so submissions are
          declined. Use the calendar above, or the email address in the footer.
        </Notice>
      )}

      <div>
        <Button type="submit" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
        </Button>
      </div>
    </form>
  );
}
