import { describe, expect, it } from 'vitest';
import {
  PHONE_NOT_YET_AVAILABLE,
  absoluteUrl,
  resolveSiteConfig,
} from '@/lib/site-config';

describe('resolveSiteConfig', () => {
  describe('url', () => {
    it('falls back to localhost when unset, so local development works unconfigured', () => {
      expect(resolveSiteConfig({}).url).toBe('http://localhost:3000');
    });

    it('strips a trailing slash so callers can concatenate paths safely', () => {
      const config = resolveSiteConfig({
        NEXT_PUBLIC_SITE_URL: 'https://example.test/',
      });
      expect(config.url).toBe('https://example.test');
      expect(absoluteUrl('/funding', config)).toBe('https://example.test/funding');
    });

    it('strips a path, query and fragment', () => {
      expect(
        resolveSiteConfig({ NEXT_PUBLIC_SITE_URL: 'https://example.test/a/b?c=1#d' }).url,
      ).toBe('https://example.test');
    });

    it('preserves a non-default port, which preview and local hosts use', () => {
      expect(
        resolveSiteConfig({ NEXT_PUBLIC_SITE_URL: 'http://localhost:4321' }).url,
      ).toBe('http://localhost:4321');
    });

    it('throws on a malformed URL rather than emitting broken canonical tags', () => {
      expect(() => resolveSiteConfig({ NEXT_PUBLIC_SITE_URL: 'not-a-url' })).toThrow(
        /not a valid absolute URL/,
      );
    });

    it('throws on a non-http protocol', () => {
      expect(() =>
        resolveSiteConfig({ NEXT_PUBLIC_SITE_URL: 'ftp://example.test' }),
      ).toThrow(/must be http or https/);
    });
  });

  describe('allowIndexing', () => {
    it('defaults to false so a preview deployment is never indexed by accident', () => {
      expect(resolveSiteConfig({}).allowIndexing).toBe(false);
    });

    it('is true only for the exact string "true"', () => {
      expect(
        resolveSiteConfig({ NEXT_PUBLIC_ALLOW_INDEXING: 'true' }).allowIndexing,
      ).toBe(true);
    });

    it.each(['1', 'yes', 'TRUE', 'True', ''])(
      'stays false for the ambiguous value %o',
      (value) => {
        expect(
          resolveSiteConfig({ NEXT_PUBLIC_ALLOW_INDEXING: value }).allowIndexing,
        ).toBe(false);
      },
    );
  });

  describe('phone', () => {
    it('reports a non-dialable notice when unset, so no real number is committed', () => {
      const config = resolveSiteConfig({});
      expect(config.phone).toBe(PHONE_NOT_YET_AVAILABLE);
      expect(config.hasPhone).toBe(false);
    });

    it('uses the configured number when the operator supplies one', () => {
      const config = resolveSiteConfig({ NEXT_PUBLIC_BUSINESS_PHONE: '0333 000 0000' });
      expect(config.phone).toBe('0333 000 0000');
      expect(config.hasPhone).toBe(true);
    });

    it('treats whitespace as unset', () => {
      expect(resolveSiteConfig({ NEXT_PUBLIC_BUSINESS_PHONE: '   ' }).hasPhone).toBe(
        false,
      );
    });
  });

  describe('companyNumber', () => {
    it('is null while unincorporated', () => {
      expect(resolveSiteConfig({}).companyNumber).toBeNull();
    });

    it('is exposed once set, which is the only change needed to show it in the footer', () => {
      expect(
        resolveSiteConfig({ NEXT_PUBLIC_COMPANY_NUMBER: '12345678' }).companyNumber,
      ).toBe('12345678');
    });
  });
});

describe('absoluteUrl', () => {
  const config = resolveSiteConfig({ NEXT_PUBLIC_SITE_URL: 'https://example.test' });

  it('joins a leading-slash path', () => {
    expect(absoluteUrl('/faq', config)).toBe('https://example.test/faq');
  });

  it('adds the separator when the path lacks one', () => {
    expect(absoluteUrl('faq', config)).toBe('https://example.test/faq');
  });
});
