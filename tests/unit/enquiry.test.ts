import { describe, expect, it } from 'vitest';
import {
  enquirySchema,
  formatZodErrors,
  isFreeWebmail,
  stripEmptyOptionals,
} from '@/lib/enquiry';

const valid = {
  name: 'Sam Okafor',
  company: 'Bell & Croft Accountants',
  email: 'sam@bellcroft.test',
  consent: true as const,
};

describe('enquirySchema', () => {
  describe('required fields', () => {
    it('accepts a submission with only the three required fields and consent', () => {
      const result = enquirySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    /**
     * The message matters as much as the rejection. A missing field otherwise
     * falls to Zod's own "expected string, received undefined", which is the
     * opposite of what someone who has just submitted an empty form needs to
     * read — and submitting an empty form is the commonest way to meet these
     * messages at all.
     */
    it.each([
      ['name', 'Enter your name so we know who we are replying to.'],
      ['company', 'Enter your company name.'],
      ['email', 'Enter your work email so we can reply.'],
    ] as const)(
      'rejects a missing %s with a message written for a person',
      (field, message) => {
        const { [field]: _omitted, ...rest } = valid;
        const result = enquirySchema.safeParse(rest);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(formatZodErrors(result.error)[field]).toBe(message);
        }
      },
    );

    it.each(['name', 'company', 'email'] as const)(
      'gives the same message for a blank %s as for a missing one',
      (field) => {
        const missing = enquirySchema.safeParse({ ...valid, [field]: undefined });
        const blank = enquirySchema.safeParse({ ...valid, [field]: '' });
        expect(missing.success).toBe(false);
        expect(blank.success).toBe(false);
        if (!missing.success && !blank.success) {
          expect(formatZodErrors(blank.error)[field]).toBe(
            formatZodErrors(missing.error)[field],
          );
        }
      },
    );

    it('rejects whitespace-only answers, which are not answers', () => {
      expect(enquirySchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
    });

    it('rejects a malformed email', () => {
      expect(enquirySchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(
        false,
      );
    });
  });

  describe('consent', () => {
    /**
     * The single most important assertion in this file. An unticked checkbox
     * submits nothing at all, so a schema that treated a missing value as
     * consent would collect contact details without permission.
     */
    it('rejects a missing consent value', () => {
      const { consent: _omitted, ...rest } = valid;
      expect(enquirySchema.safeParse(rest).success).toBe(false);
    });

    it('rejects consent that is false', () => {
      expect(enquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    });

    it.each(['on', 'true', 1, 'yes'])('rejects the truthy-but-not-true %o', (value) => {
      expect(enquirySchema.safeParse({ ...valid, consent: value }).success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('accepts a submission with every optional field answered', () => {
      const result = enquirySchema.safeParse({
        ...valid,
        phone: '01494 000000',
        employees: '50-249',
        roles: 'Two junior accounts assistants',
        apprentices: '2',
        message: 'We have never run an apprenticeship before.',
      });
      expect(result.success).toBe(true);
    });

    /**
     * "No silent defaults on any field" — an unanswered optional field must
     * arrive as absent, never as an empty string or a guess.
     */
    it('leaves an unanswered optional field undefined, not empty', () => {
      const result = enquirySchema.safeParse({ ...valid, phone: '', message: '' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBeUndefined();
        expect(result.data.message).toBeUndefined();
        expect('phone' in result.data && result.data.phone === '').toBe(false);
      }
    });

    it('never invents a value for an omitted field', () => {
      const result = enquirySchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.employees).toBeUndefined();
        expect(result.data.apprentices).toBeUndefined();
        expect(result.data.roles).toBeUndefined();
      }
    });

    it('ignores an employee band that is not one of the offered options', () => {
      const result = enquirySchema.safeParse({ ...valid, employees: '900000' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.employees).toBeUndefined();
    });

    it('trims surrounding whitespace rather than storing it', () => {
      const result = enquirySchema.safeParse({ ...valid, phone: '  01494 000000  ' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.phone).toBe('01494 000000');
    });
  });
});

describe('stripEmptyOptionals', () => {
  it('removes empty and absent values so they submit as absent', () => {
    expect(
      stripEmptyOptionals({
        name: 'Sam',
        phone: '',
        roles: '   ',
        message: undefined,
        employees: null,
        consent: true,
      }),
    ).toEqual({ name: 'Sam', consent: true });
  });

  it('keeps false, which is an answer rather than an absence', () => {
    expect(stripEmptyOptionals({ consent: false })).toEqual({ consent: false });
  });
});

describe('isFreeWebmail', () => {
  it.each(['sam@gmail.com', 'sam@HOTMAIL.co.uk', 'sam@icloud.com'])(
    'recognises %s',
    (email) => {
      expect(isFreeWebmail(email)).toBe(true);
    },
  );

  it.each(['sam@bellcroft.test', 'sam@acme-engineering.co.uk'])(
    'leaves a company address alone: %s',
    (email) => {
      expect(isFreeWebmail(email)).toBe(false);
    },
  );

  it('handles a malformed address without throwing', () => {
    expect(isFreeWebmail('not-an-email')).toBe(false);
  });
});
