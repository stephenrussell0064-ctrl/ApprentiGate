import { z } from 'zod';

/**
 * The enquiry form's shape, shared by the browser and the Worker.
 *
 * One schema, both sides. Client-side validation is a convenience and can be
 * bypassed trivially, so the Worker validates the same way — but a second,
 * hand-maintained copy of the rules is how the two drift until the form accepts
 * something the server rejects, or worse, the other way round.
 *
 * Fields are exactly those in Content Spec 4.8. Nothing else may be added: the
 * page's only job is to start a conversation, and every extra field costs
 * conversions.
 *
 * **No silent defaults.** An unanswered optional field arrives as absent, never
 * as an empty string, a zero or a guessed value. `stripEmptyOptionals` below
 * enforces that on the way out, and the schema never uses `.default()`.
 */

/** Fields the person must complete. */
const REQUIRED_MESSAGE = {
  name: 'Enter your name so we know who we are replying to.',
  company: 'Enter your company name.',
  email: 'Enter your work email so we can reply.',
  consent: 'We need your permission before we can contact you.',
} as const;

export const EMPLOYEE_BANDS = [
  { value: '1-9', label: '1 to 9' },
  { value: '10-49', label: '10 to 49' },
  { value: '50-249', label: '50 to 249' },
  { value: '250+', label: '250 or more' },
] as const;

const employeeBandValues = EMPLOYEE_BANDS.map((band) => band.value);

/**
 * A trimmed string, or `undefined` when it is empty.
 *
 * This is what keeps an untouched optional field out of the payload entirely
 * rather than sending "" and letting the far end guess what that meant.
 */
/**
 * A required string that gives the same written message whether the field was
 * left blank or never submitted at all.
 *
 * Without the preprocess step, a missing field falls to Zod's type error —
 * "expected string, received undefined" — which is what a developer needs and
 * the opposite of what the person filling in the form needs. Submitting an
 * empty form is the most common way to see these messages, so it is the case
 * that must read well.
 */
const requiredText = (message: string, max: number) =>
  z.preprocess(
    (value) => (value === undefined || value === null ? '' : value),
    z.string().trim().min(1, message).max(max),
  );

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((value) => (value === undefined || value === '' ? undefined : value));

export const enquirySchema = z.object({
  name: requiredText(REQUIRED_MESSAGE.name, 100),
  company: requiredText(REQUIRED_MESSAGE.company, 120),
  email: requiredText(REQUIRED_MESSAGE.email, 254).pipe(
    z.email('That does not look like an email address.'),
  ),

  phone: optionalText(40),
  employees: z
    .enum(employeeBandValues as [string, ...string[]])
    .optional()
    .catch(undefined),
  roles: optionalText(500),
  apprentices: optionalText(40),
  message: optionalText(2000),

  /**
   * Must be literally true. Not "truthy" — an unticked box submits nothing at
   * all, and a schema that accepted a missing value as consent would be the
   * single worst bug on this site.
   */
  consent: z.literal(true, { message: REQUIRED_MESSAGE.consent }),
});

export type Enquiry = z.infer<typeof enquirySchema>;

/**
 * Free webmail domains.
 *
 * Content Spec 4.8 asks for a *gentle message rather than a hard block*, so
 * this list drives a nudge in the browser and nothing on the server. Somebody
 * running a real business from a Gmail address is a real prospect, and refusing
 * their enquiry to enforce a preference would be self-defeating.
 */
const FREE_WEBMAIL = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'live.co.uk',
  'yahoo.com',
  'yahoo.co.uk',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'gmx.com',
  'mail.com',
  'btinternet.com',
  'sky.com',
  'talktalk.net',
  'virginmedia.com',
]);

export function isFreeWebmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  return domain !== undefined && FREE_WEBMAIL.has(domain);
}

export const FREE_WEBMAIL_NOTICE =
  'That looks like a personal address. A work email helps us reply to the right place — but send it either way if that is where you would rather hear from us.';

/**
 * Removes empty optional fields so they are submitted as absent.
 *
 * The brief is explicit that an unanswered optional field must never arrive as
 * a guessed value. Dropping the key is the only way to say "not answered" that
 * cannot later be mistaken for an answer.
 */
export function stripEmptyOptionals(
  values: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    }),
  );
}

/** Field-level errors, keyed by field name, as the Worker returns them. */
export type EnquiryErrors = Partial<Record<keyof Enquiry | 'form', string>>;

export function formatZodErrors(error: z.ZodError): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof EnquiryErrors] = issue.message;
    }
  }
  return errors;
}
