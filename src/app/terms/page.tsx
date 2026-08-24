/**
 * ============================================================================
 * DRAFT — REQUIRES LEGAL REVIEW BEFORE TRADING.
 *
 * Not reviewed by a solicitor. Operator handover item 18 requires all four
 * compliance pages to be reviewed before any paid engagement.
 *
 * Two points for a reviewer, both from risk R4: the business is not
 * incorporated, so liability sits with the founders personally, and this page
 * is the site's main protection against an informational page being treated as
 * professional advice. It is not a substitute for professional indemnity cover,
 * which handover item 20 requires before any paid engagement.
 * ============================================================================
 */

import type { Metadata } from 'next';
import { LegalList, LegalPage, LegalSection } from '@/components/ui/LegalPage';
import { BUSINESS_LOCATION, ROUTES } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Terms of use',
  description:
    'What this website is and is not: information rather than professional advice, with no assurance about funding, providers or outcomes.',
};

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Terms of use"
      title="What this site is, and what it is not"
      intro="These terms cover reading this website. They are not a contract for any service — if we work together, that will be its own written agreement."
    >
      <LegalSection heading="Who runs this site">
        <p>
          ApprentiGate is operated by Stephen Russell and Zaim Rana, based in{' '}
          {BUSINESS_LOCATION}. The business is not incorporated, and no company number is
          shown anywhere on this site because there is not one yet.
        </p>
      </LegalSection>

      <LegalSection heading="This is information, not professional advice">
        <p>
          Everything here — particularly the{' '}
          <a
            href={ROUTES.funding}
            className="font-semibold text-[color:var(--color-ag-signal)] underline underline-offset-4"
          >
            funding page
          </a>{' '}
          — is written to help you understand how apprenticeships work in England. It is
          general information about a system, not advice about your business.
        </p>
        <p>
          It is not legal, financial, tax, employment or regulatory advice, and reading it
          does not create a professional relationship between us. If a decision turns on
          your particular circumstances, take advice that is actually about them.
        </p>
      </LegalSection>

      <LegalSection heading="What we do not promise">
        <p>Being direct about this is more useful than burying it:</p>
        <LegalList
          items={[
            'We do not guarantee that you will receive apprenticeship funding, or how much. Eligibility is decided by the funding rules and confirmed for each employer, not by us.',
            'We do not guarantee any particular outcome from an apprenticeship, for you or for an apprentice.',
            'We do not guarantee that a training provider will have capacity, an intake date that suits you, or a place available.',
            'We do not guarantee that you will find a suitable candidate, and we do not select candidates for you.',
            'We do not promise that this site is complete or free of error, although we would very much like to hear about anything that is wrong.',
          ]}
        />
      </LegalSection>

      <LegalSection heading="Funding rules change, and this site can fall behind">
        <p>
          Apprenticeship funding rules changed on 1 August 2026 and change again on 1
          October 2026. We check the funding page against GOV.UK and show the date it was
          last reviewed, but a page can still be out of date between reviews.
        </p>
        <p>
          Where anything here conflicts with GOV.UK, GOV.UK is right. Treat this site as a
          starting point and confirm the position before you commit to anything.
        </p>
      </LegalSection>

      <LegalSection heading="What we are not">
        <p>
          ApprentiGate is not a training provider, not an end-point assessment
          organisation, and not a recruitment agency. We are not affiliated with,
          sponsored by or endorsed by any employer, training provider or government body.
          Training and assessment are delivered by approved training providers; hiring
          decisions are made by you.
        </p>
      </LegalSection>

      <LegalSection heading="Links to other sites">
        <p>
          We link to GOV.UK, Skills England and other services where they are the proper
          source. We do not control those sites and are not responsible for what they say
          — though if we have linked to the wrong thing, we would like to know.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          We take reasonable care over what we publish, but we cannot accept liability for
          a loss arising from a decision made on the basis of general information on this
          website rather than advice about your circumstances.
        </p>
        <p>
          Nothing here limits liability where the law does not allow it to be limited,
          including for death or personal injury caused by negligence, or for fraud.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the law of England and Wales, and the courts of
          England and Wales have jurisdiction over any dispute about them.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
