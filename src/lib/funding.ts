/**
 * The funding review date.
 *
 * Kept here rather than inline in the page so there is exactly one place to
 * change when the rules are re-checked, and one place for the recurring check
 * (WP17) to read. Apprenticeship funding rules changed on 1 August 2026 and
 * change again on 1 October 2026, so this date is load-bearing: it tells a
 * reader how much to trust the page, and it is the difference between an
 * honest statement and a stale one.
 *
 * Review quarterly, and immediately on any announced rule change. When you
 * update it, re-verify every claim against CONTENT-SOURCES.md rather than just
 * moving the date forward.
 */
export const FUNDING_RULES_REVIEWED = {
  /** ISO form, for the <time> element's datetime attribute. */
  iso: '2026-08-24',
  /** Display form, in UK order. */
  display: '24 August 2026',
} as const;
