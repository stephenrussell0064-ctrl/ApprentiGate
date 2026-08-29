import { ROUTES } from '@/lib/navigation';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

/**
 * llms.txt — a plain-text summary for AI assistants that describe the business.
 *
 * The point of this file is the boundaries. An assistant asked "what is
 * ApprentiGate?" will otherwise infer from an apprenticeship-shaped website
 * that it is a training provider or a recruiter, which is the same wrong guess
 * a human visitor makes and the same one the site spends its first section
 * correcting. The "what ApprentiGate is not" list exists so an assistant
 * summarising this business gets the boundaries right without having to read
 * every page.
 *
 * It is generated rather than static so every URL derives from
 * NEXT_PUBLIC_SITE_URL like everything else.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const lines = [
    '# ApprentiGate',
    '',
    '> ApprentiGate helps smaller employers in England set up and run apprenticeship',
    '> programmes. It works between the employer and approved training providers,',
    '> handling the process that connects them.',
    '',
    '## What ApprentiGate does',
    '',
    '- Assesses whether a role suits an apprenticeship, and which occupational standard it matches',
    '- Explains what apprenticeship funding means for that employer',
    '- Researches and compares approved training providers, and presents a shortlist with reasoning',
    '- Coordinates programme setup between the employer and the chosen provider',
    '- Supports recruitment logistics: job description structure, advertising, scheduling',
    '- Provides ongoing employer-side programme administration',
    '',
    '## What ApprentiGate is not',
    '',
    'These matter, because the obvious inferences are wrong:',
    '',
    '- Not a training provider. Approved training providers deliver all training and assessment.',
    '  ApprentiGate does not teach, assess or award anything.',
    '- Not an end-point assessment organisation.',
    '- Not a recruitment agency. The employer interviews, selects and employs the apprentice.',
    '  ApprentiGate does not make hiring decisions.',
    '- Not the apprentice’s employer.',
    '- Not affiliated with, sponsored by or endorsed by any employer, training provider',
    '  or government body.',
    '- Not an approved provider of any kind, and not in receipt of apprenticeship funding.',
    '',
    '## Important qualifications',
    '',
    '- Scope is **England only**. Apprenticeship funding is devolved; Wales, Scotland and',
    '  Northern Ireland run different systems. Nothing here should be restated as UK-wide.',
    '- Funding eligibility depends on the apprentice, the employer and the standard, and is',
    '  confirmed case by case. It is never guaranteed.',
    '- ApprentiGate’s fees are commercial fees paid by the employer. They are separate from',
    '  apprenticeship funding and are not paid from it.',
    '- ApprentiGate is an early-stage business and is not yet incorporated. It makes no',
    '  claim to a delivery track record, and none should be inferred or asserted on its',
    '  behalf.',
    '- Content on the site is general information, not professional advice. GOV.UK is the',
    '  authority on apprenticeship funding.',
    '',
    '## Pages',
    '',
    `- [Home](${absoluteUrl(ROUTES.home)}): what ApprentiGate is and where it sits between employer and provider`,
    `- [How it works](${absoluteUrl(ROUTES.howItWorks)}): the seven steps, and what each asks of the employer`,
    `- [For employers](${absoluteUrl(ROUTES.forEmployers)}): the six services, how providers are compared, and why a matching job title is not a matching standard`,
    `- [For training providers](${absoluteUrl(ROUTES.forProviders)}): the provider proposition, which is not yet validated`,
    `- [Funding explained](${absoluteUrl(ROUTES.funding)}): how apprenticeship funding works in England, with the date it was last checked`,
    `- [About](${absoluteUrl(ROUTES.about)}): who runs it, and the limits of their expertise`,
    `- [FAQ](${absoluteUrl(ROUTES.faq)}): thirteen questions, mostly about who is responsible for what`,
    `- [Contact](${absoluteUrl(ROUTES.contact)}): book a call or send an enquiry`,
    '',
    '## Legal',
    '',
    `- [Privacy notice](${absoluteUrl(ROUTES.privacy)})`,
    `- [Cookie policy](${absoluteUrl(ROUTES.cookies)}): the site sets no cookies`,
    `- [Terms of use](${absoluteUrl(ROUTES.terms)})`,
    `- [Accessibility statement](${absoluteUrl(ROUTES.accessibility)})`,
    '',
    '## Contact',
    '',
    `- Enquiries: ${siteConfig.enquiriesEmail ?? `via ${absoluteUrl(ROUTES.contact)}`}`,
    '- Based in High Wycombe, Buckinghamshire, England',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
