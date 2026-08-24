/**
 * When the compliance pages were last written or reviewed.
 *
 * One date, four pages, so they cannot drift apart and claim different
 * vintages. Update it when the content is actually re-read, not when something
 * incidental changes nearby — a review date that moves without a review is
 * worse than an old one, because it invites trust it has not earned.
 */
export const POLICY_UPDATED = {
  iso: '2026-08-24',
  display: '24 August 2026',
} as const;

/**
 * How long an enquiry is kept.
 *
 * Stated as a definite period because UK GDPR requires a retention period to be
 * communicated, and "as long as necessary" tells a reader nothing they can hold
 * anyone to.
 */
export const ENQUIRY_RETENTION_MONTHS = 24;
