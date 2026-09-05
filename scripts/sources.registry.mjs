/**
 * The machine-readable half of CONTENT-SOURCES.md.
 *
 * Each entry pairs a source with the **wording the site actually relies on**.
 * The drift check fetches the page and looks for those phrases. If one has gone,
 * the claim resting on it may no longer be true and someone has to go and read
 * the source.
 *
 * Checking for specific phrases rather than hashing the page is the whole
 * design. GOV.UK pages change constantly for reasons that do not matter —
 * banners, related-content lists, timestamps — and a hash would cry wolf every
 * month until nobody read the report. A missing phrase is a signal worth acting
 * on; a changed byte is not.
 *
 * Phrases are matched case-insensitively against the page text with whitespace
 * collapsed, so line wrapping in the source cannot cause a false alarm.
 *
 * `pnpm check:sources` fails if CONTENT-SOURCES.md defines a source that has no
 * entry here, so a new claim cannot be added without deciding how its source
 * would be monitored.
 */

export const SOURCE_REGISTRY = [
  {
    id: 'S1',
    what: 'What a funding band maximum is',
    url: 'https://www.gov.uk/government/publications/apprenticeship-technical-funding-guide/apprenticeship-technical-funding-guide-from-august-2026',
    phrases: ['funding band maximum'],
  },
  {
    id: 'S2',
    what: 'Who pays above the funding band maximum',
    url: 'https://www.gov.uk/government/publications/apprenticeship-technical-funding-guide/apprenticeship-technical-funding-guide-from-august-2026',
    phrases: ['more than the funding band maximum'],
  },
  {
    id: 'S3',
    what: 'Non-levy government contribution by apprentice age',
    url: 'https://www.gov.uk/government/publications/apprenticeship-technical-funding-guide/apprenticeship-technical-funding-guide-from-august-2026',
    // The two figures the funding page and the FAQ both state.
    phrases: ['95%', 'do not pay the levy'],
  },
  {
    id: 'S4',
    what: "The employer pays the apprentice's wage",
    url: 'https://www.gov.uk/employing-an-apprentice',
    phrases: ['pay the apprentice at least the minimum wage'],
  },
  {
    id: 'S5',
    what: 'Approved training providers (APAR)',
    url: 'https://www.gov.uk/guidance/apply-to-the-apar-as-an-apprenticeship-training-provider',
    phrases: ['apprenticeship provider and assessment register'],
  },
  {
    id: 'S6',
    what: 'What employers can already do for themselves',
    // Rests on S1 and S5 rather than a page of its own; nothing separate to watch.
    url: null,
    phrases: [],
    note: 'Derived from S1 and S5. No independent source to monitor.',
  },
  {
    id: 'S7',
    what: 'Occupational standards are built around KSBs',
    url: 'https://www.gov.uk/guidance/developing-an-occupational-standard',
    phrases: ['knowledge, skills and behaviours'],
  },
  {
    id: 'S8',
    what: 'End-point assessment tests competency against the KSBs',
    url: 'https://www.gov.uk/guidance/developing-an-occupational-standard',
    // The sentence the For Employers page's central point rests on.
    phrases: ['competency against the KSBs'],
  },
  {
    id: 'S9',
    what: 'The apprenticeship levy threshold',
    url: 'https://www.gov.uk/guidance/pay-apprenticeship-levy',
    phrases: ['£3 million', '0.5%'],
  },
  {
    id: 'S10',
    what: 'The £2,000 hiring payment from 1 October 2026',
    url: 'https://www.gov.uk/government/publications/apprenticeship-funding/apprenticeship-funding',
    phrases: ['£2,000', '90 days', '1 October 2026'],
  },
  {
    id: 'S11',
    what: 'Transferring unused levy funds',
    url: 'https://www.gov.uk/government/publications/apprenticeship-funding/apprenticeship-funding',
    phrases: ['transfer'],
  },
  {
    id: 'S12',
    what: 'Lead generation and employer recruitment are ineligible costs',
    url: 'https://www.gov.uk/government/publications/apprenticeship-unit-funding-rules-2026-to-2027/apprenticeship-unit-funding-rules-august-2026-to-july-2027',
    // The regulatory basis of the fee statement, and of risk R6. If this
    // wording goes, the business model statement needs re-examining, not just
    // the sentence on the funding page.
    phrases: ['lead generation'],
    critical: true,
  },
  {
    id: 'S13',
    what: 'The apprentice minimum wage',
    url: 'https://www.gov.uk/national-minimum-wage-rates',
    // The rate itself is deliberately not on the site, so the phrase watched is
    // the condition that is: the apprentice rate applies while under 19 or in
    // the first year.
    phrases: ['apprentice'],
  },
  {
    id: 'S14',
    what: 'Provider achievement rates and reviews are published per course',
    // A course-specific results page rather than the service's front door,
    // because the front door proves nothing: the claim is about what is
    // published *per provider on a course*, and only a results page carries
    // it. Business administration is used as the probe because it is one of
    // the most widely delivered standards in the country, so its provider
    // list is the least likely to empty out for reasons unrelated to the
    // service.
    url: 'https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses/196/providers?location=HP15%207QS&distance=20',
    // Every phrase here is load-bearing for a sentence on the site.
    //
    // "out of" is the one that matters most and the one most likely to be
    // dropped in a redesign: it is what ties an achievement rate to the
    // cohort behind it. Four pages say a rate must be read against the number
    // of apprentices it covers. If the service stops publishing that number,
    // those sentences describe a comparison we can no longer make, and the
    // rule is that they come down rather than get softened.
    phrases: [
      'course achievement rate',
      'out of',
      'employer reviews',
      'apprentice reviews',
      'day release',
      'block release',
    ],
    critical: true,
  },
];
