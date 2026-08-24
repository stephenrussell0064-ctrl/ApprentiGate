import type { Metadata } from 'next';
import { RelayBand } from '@/components/brand/RelayBand';
import { AppMark, Wordmark } from '@/components/brand/Wordmark';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardGrid } from '@/components/ui/Card';
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { StepSequence } from '@/components/ui/StepSequence';
import { ROUTES } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo';

/**
 * The component gallery, required by WP2 acceptance: a route showing every
 * component in every state, including error and empty.
 *
 * It is an internal reference, not a public page. It is not in the navigation
 * or the sitemap, and it carries its own hard `noindex` rather than relying on
 * the site-wide indexing flag — so it stays unindexable even after WP16 flips
 * indexing on for the real pages.
 *
 * The strings here are invented for demonstration, which is exactly why this
 * route must never be linked from the site: none of it has been through the
 * claim audit.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Component gallery',
  description: 'Internal reference: every component in every state.',
  path: ROUTES.components,
  noindex: true,
});

const EMPLOYEE_BANDS = [
  { value: '1-9', label: '1 to 9' },
  { value: '10-49', label: '10 to 49' },
  { value: '50-249', label: '50 to 249' },
  { value: '250+', label: '250 or more' },
];

const DEMO_STEPS = [
  {
    title: 'Tell us the roles you need',
    detail:
      'We start from the job you already want to fill, not from a course catalogue.',
    employerAction: 'describe the role and the team it sits in.',
  },
  {
    title: 'We assess whether it suits an apprenticeship',
    detail:
      'We compare the day-to-day work against the standard, not the job title against the standard name.',
  },
  {
    title: 'You choose your provider',
    detail: 'We put a shortlist in front of you and explain the reasoning behind it.',
    employerAction: 'make the final decision.',
  },
];

function Swatch({ token, label }: { readonly token: string; readonly label: string }) {
  return (
    <div className="flex flex-col gap-[var(--spacing-ag-2)]">
      <div
        className="h-16 rounded-[var(--radius-ag-md)] border border-[var(--color-ag-mist)]"
        style={{ background: `var(${token})` }}
      />
      <p className="font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] text-[color:var(--color-ag-slate)]">
        {label}
      </p>
    </div>
  );
}

export default function ComponentGallery() {
  return (
    <>
      <Section eyebrow="Internal reference" heading="Component gallery" headingLevel={1}>
        <Notice tone="info" title="This page is not part of the public site.">
          It is not linked from the navigation, is excluded from the sitemap, and carries
          its own noindex. The text below is written for demonstration and has not been
          through the claim audit, so nothing here may be copied onto a real page.
        </Notice>
      </Section>

      <Section divided eyebrow="Brand" heading="Wordmark and mark">
        <div className="flex flex-wrap items-center gap-[var(--spacing-ag-8)]">
          <Wordmark />
          <Wordmark size={20} />
          <AppMark size={48} />
          <AppMark size={32} />
          <AppMark size={16} />
        </div>
      </Section>

      <Section divided eyebrow="Tokens" heading="Colour">
        <div className="grid grid-cols-2 gap-[var(--spacing-ag-4)] sm:grid-cols-3 lg:grid-cols-6">
          <Swatch token="--color-ag-ink" label="ink 17.08:1" />
          <Swatch token="--color-ag-slate" label="slate 7.00:1" />
          <Swatch token="--color-ag-mist" label="mist surface" />
          <Swatch token="--color-ag-signal" label="signal 6.16:1" />
          <Swatch token="--color-ag-paper" label="paper" />
          <Swatch token="--color-ag-alert" label="alert 6.54:1" />
        </div>
      </Section>

      <Section divided eyebrow="Tokens" heading="Type scale">
        <div className="flex flex-col gap-[var(--spacing-ag-4)]">
          {(
            [
              ['5xl', 'Build your apprenticeship programme'],
              ['4xl', 'Build your apprenticeship programme'],
              ['3xl', 'Build your apprenticeship programme'],
              ['2xl', 'Build your apprenticeship programme'],
              ['xl', 'Build your apprenticeship programme'],
              ['lg', 'Body lead, eighteen pixels'],
              ['base', 'Body text, sixteen pixels, the minimum on this site'],
              ['sm', 'Small print, fourteen pixels'],
              ['xs', 'Utility label, twelve pixels'],
            ] as const
          ).map(([step, sample]) => (
            <div
              key={step}
              className="flex flex-wrap items-baseline gap-[var(--spacing-ag-4)] border-b border-[var(--color-ag-mist)] pb-[var(--spacing-ag-3)]"
            >
              <span className="w-16 shrink-0 font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] text-[color:var(--color-ag-slate)]">
                {step}
              </span>
              <span
                className={
                  step === 'xs'
                    ? 'font-[family-name:var(--font-utility)] tracking-[0.08em] uppercase'
                    : step === 'lg' || step === 'base' || step === 'sm'
                      ? ''
                      : 'font-[family-name:var(--font-display)] font-semibold'
                }
                style={{ fontSize: `var(--text-ag-${step})` }}
              >
                {sample}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section divided eyebrow="Controls" heading="Buttons">
        <div className="flex flex-col gap-[var(--spacing-ag-8)]">
          <div className="flex flex-wrap items-center gap-[var(--spacing-ag-3)]">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="quiet">Quiet</Button>
          </div>
          <div className="flex flex-wrap items-center gap-[var(--spacing-ag-3)]">
            <Button variant="primary" size="lg">
              Primary large
            </Button>
            <Button variant="secondary" size="lg">
              Secondary large
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-[var(--spacing-ag-3)]">
            <Button variant="primary" disabled>
              Primary disabled
            </Button>
            <Button variant="secondary" disabled>
              Secondary disabled
            </Button>
            <ButtonLink href="/components">Link styled as a button</ButtonLink>
          </div>
        </div>
      </Section>

      <Section divided eyebrow="Surfaces" heading="Cards">
        <CardGrid>
          <Card label="01" title="With a label and title">
            A card carrying a monospace label, a title and a short body.
          </Card>
          <Card title="Title only">
            A card with no label, which is the common case in a services grid.
          </Card>
          <Card label="Empty" title="Nothing yet" />
        </CardGrid>
      </Section>

      <Section divided eyebrow="Sequence" heading="Step sequence">
        <StepSequence steps={DEMO_STEPS} />
      </Section>

      <Section divided eyebrow="Signature" heading="Relay band">
        <div className="flex flex-col gap-[var(--spacing-ag-12)]">
          <div>
            <p className="mb-[var(--spacing-ag-4)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
              Full
            </p>
            <RelayBand />
          </div>
          <div>
            <p className="mb-[var(--spacing-ag-4)] font-[family-name:var(--font-utility)] text-[length:var(--text-ag-xs)] tracking-[0.08em] text-[color:var(--color-ag-slate)] uppercase">
              Rule
            </p>
            <RelayBand variant="rule" />
          </div>
        </div>
      </Section>

      <Section divided eyebrow="Feedback" heading="Notices">
        <div className="flex flex-col gap-[var(--spacing-ag-4)]">
          <Notice tone="error" title="We could not send your enquiry.">
            Nothing was lost — please email us directly and we will pick it up. This is
            the state WP10 needs so an enquiry is never silently dropped.
          </Notice>
          <Notice tone="info" title="Rules last reviewed 23 August 2026.">
            Apprenticeship funding rules change. Eligibility is confirmed for each
            employer.
          </Notice>
          <Notice tone="empty" title="Nothing to show yet.">
            The empty state. It explains why it is empty rather than showing a blank
            panel.
          </Notice>
        </div>
      </Section>

      <Section divided eyebrow="Forms" heading="Controls, default state">
        <form className="flex max-w-2xl flex-col gap-[var(--spacing-ag-6)]">
          <TextField id="demo-name" label="Your name" autoComplete="name" />
          <TextField
            id="demo-email"
            label="Work email"
            type="email"
            autoComplete="email"
            helper="We use this to reply to your enquiry."
          />
          <TextField
            id="demo-phone"
            label="Phone"
            type="tel"
            optional
            autoComplete="tel"
          />
          <SelectField
            id="demo-size"
            label="Approximate number of employees"
            optional
            options={EMPLOYEE_BANDS}
          />
          <TextAreaField id="demo-message" label="Message" optional />
          <CheckboxField
            id="demo-consent"
            label="I'm happy for ApprentiGate to contact me about my enquiry."
          />
          <div className="flex flex-wrap gap-[var(--spacing-ag-3)]">
            <Button type="submit">Send enquiry</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </form>
      </Section>

      <Section divided eyebrow="Forms" heading="Controls, error and disabled states">
        <form className="flex max-w-2xl flex-col gap-[var(--spacing-ag-6)]">
          <TextField
            id="demo-name-error"
            label="Your name"
            error="Enter your name so we know who we are replying to."
            defaultValue=""
          />
          <TextField
            id="demo-email-error"
            label="Work email"
            type="email"
            helper="We use this to reply to your enquiry."
            error="That does not look like an email address."
            defaultValue="not-an-email"
          />
          <SelectField
            id="demo-size-error"
            label="Approximate number of employees"
            options={EMPLOYEE_BANDS}
            error="Choose a range."
          />
          <TextAreaField
            id="demo-message-disabled"
            label="Message"
            optional
            disabled
            defaultValue="Disabled control."
          />
          <CheckboxField
            id="demo-consent-error"
            label="I'm happy for ApprentiGate to contact me about my enquiry."
            error="We need your permission before we can contact you."
          />
          <div className="flex flex-wrap gap-[var(--spacing-ag-3)]">
            <Button type="submit" disabled>
              Sending…
            </Button>
          </div>
        </form>
      </Section>

      <Section divided tone="mist" eyebrow="Surfaces" heading="Mist section tone">
        <p className="max-w-[62ch] text-[length:var(--text-ag-base)] text-[color:var(--color-ag-slate)]">
          The alternate section tone, used sparingly to separate a block from the sections
          either side of it without introducing a second accent colour.
        </p>
      </Section>
    </>
  );
}
