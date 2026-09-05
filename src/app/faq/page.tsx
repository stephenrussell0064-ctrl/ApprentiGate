import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Accordion } from '@/components/ui/Accordion';
import { ButtonLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { ROUTES } from '@/lib/navigation';

/**
 * FAQ — Content Spec 4.7.
 *
 * The fifteen questions, each expanded to two or three sentences.
 *
 * Questions and answers live in one array and are used twice: to render the
 * page and to build the FAQPage structured data. That is not tidiness — search
 * engines require structured data to match what the visitor sees, and hand-
 * maintaining a second copy is how the two drift apart until the markup is
 * describing a page that no longer exists. A test asserts they still match.
 *
 * Funding answers trace to CONTENT-SOURCES.md S1, S2, S3 and S4, and say the
 * same thing as the Funding page. Where a claim carries conditions there, it
 * carries them here — a short answer format is exactly where conditions get
 * quietly dropped.
 */

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description:
    'Straight answers on who employs the apprentice, who chooses them, who pays for training, how we compare providers, and what ApprentiGate does not do.',
  path: ROUTES.faq,
});

/**
 * Answers are plain strings so the structured data can use them verbatim.
 * Anything needing rich markup would have to be duplicated for the JSON-LD,
 * which is the drift this structure exists to prevent.
 */
const FAQS = [
  {
    question: 'What is ApprentiGate?',
    answer:
      'A service that helps smaller employers set up and run apprenticeship programmes. We sit between you and the approved training providers who deliver the training, and handle the process that connects the two.',
  },
  {
    question: 'Are you a training provider?',
    answer:
      'No. All training and assessment is delivered by approved training providers. ApprentiGate does not teach, assess or award anything.',
  },
  {
    question: 'Who employs the apprentice?',
    answer:
      'You do. The apprentice is your employee, on your contract, working in your business. Being on an apprenticeship changes none of that.',
  },
  {
    question: 'Who chooses the apprentice?',
    answer:
      'You do. We can help with vacancy logistics, scheduling and keeping candidates informed, but we do not interview and we do not select. The hiring decision is yours.',
  },
  {
    question: 'Who pays the apprentice?',
    answer:
      'You do, along with employer National Insurance and pension contributions. Apprenticeship funding cannot be used for wages.',
  },
  {
    question: 'Who pays for the training?',
    answer:
      'Government funding may cover eligible training and assessment up to the funding band maximum for that standard. How much depends on the apprentice’s age, on whether you pay the apprenticeship levy, and on the standard. Any price agreed above the band maximum is yours to pay.',
  },
  {
    question: 'Can government cover the whole training cost?',
    answer:
      'It can. For eligible employers who do not pay the levy, where the apprentice is aged 16 to 24 at the start of training, government funds eligible training and assessment in full up to the funding band maximum, for apprenticeships starting from 1 August 2026. Eligibility is confirmed case by case rather than assumed.',
  },
  {
    question: 'What does ApprentiGate cost?',
    answer:
      'A fixed fee of £750 per role, agreed before any work starts, so you know what you are committing to before you commit to it. It is a commercial fee paid by you — separate from apprenticeship funding, and never taken from it.',
  },
  {
    question: 'How do you choose which providers to recommend?',
    answer:
      'Against one consistent set of factors: training outcomes, fit with your requirement, support for you and for the apprentice, delivery model and location, relevant experience of the standard, and progression. Any commercial arrangement carries no weight at all. You see the reasoning and you make the final choice.',
  },
  {
    question: 'Can we use a provider we already know?',
    answer:
      'Yes. If you already work with a provider you are happy with, we can work alongside them rather than replace them.',
  },
  {
    question: 'Why not go to a training provider directly?',
    answer:
      'A provider can only advise on the standards it delivers, so going direct leaves the comparison, the standard-matching and the setup admin sitting with you. We take that on — identifying the standard the role actually fits, comparing approved providers against published criteria, and coordinating setup with the one you choose — so your managers stay on the work they were hired to do.',
  },
  {
    question: 'Do you manage recruitment?',
    answer:
      'Partly. We can structure the job description, coordinate advertising, administer applications and schedule interviews. We do not interview candidates and we do not select them.',
  },
  {
    question: 'Do you work with degree apprenticeships?',
    answer:
      'Our initial focus is Levels 2 to 5. Ask us anyway and we will tell you honestly whether we can help with what you have in mind.',
  },
  {
    question: 'What size businesses do you work with?',
    answer:
      'Smaller and mid-sized employers in England, typically those without a dedicated early-careers function. If you already have a team doing this internally, you probably do not need us.',
  },
  {
    question: 'Does the apprentice pay anything?',
    answer:
      'No. Apprentices are not charged for their apprenticeship training, and they are never charged by us.',
  },
] as const;

/**
 * FAQPage structured data, built from the same array the page renders.
 *
 * No aggregateRating, review or award properties. Those would be fabrication,
 * and structured data is exactly the place fabricated claims hide, because
 * nobody reads it.
 */
const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function Faq() {
  return (
    <>
      <script
        type="application/ld+json"
        // The content is built from the constant above, not from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <Section
        eyebrow="FAQ"
        heading="The questions we get asked."
        headingLevel={1}
        width="narrow"
      >
        <p className="max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          Mostly about who is responsible for what, and who pays for what. If yours is not
          here, ask us.
        </p>
      </Section>

      <Section divided width="narrow">
        <Accordion
          items={FAQS.map((faq) => ({ question: faq.question, answer: faq.answer }))}
        />
      </Section>

      <Section divided tone="mist" width="narrow">
        <h2 className="max-w-[22ch] text-[length:var(--text-ag-2xl)] font-semibold text-balance text-[color:var(--color-ag-ink)] md:text-[length:var(--text-ag-3xl)]">
          Still not sure whether this fits?
        </h2>
        <p className="mt-[var(--spacing-ag-4)] max-w-[62ch] text-[length:var(--text-ag-lg)] text-[color:var(--color-ag-slate)]">
          A short call will settle it faster than a page of answers. If an apprenticeship
          is not right for the role, we will say so.
        </p>
        <div className="mt-[var(--spacing-ag-8)] flex flex-col gap-[var(--spacing-ag-3)] sm:flex-row sm:items-center">
          <ButtonLink href={ROUTES.contact}>Book a call</ButtonLink>
          <ButtonLink href={ROUTES.funding} variant="secondary">
            How funding works
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
