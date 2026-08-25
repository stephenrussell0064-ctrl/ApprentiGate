import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

// eslint-config-next 16 exports flat config arrays directly. The FlatCompat
// shim that eslintrc-style configs needed is no longer required, and breaks
// against these.
const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      '.wrangler/**',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      /**
       * A leading underscore marks a binding that exists only to be discarded —
       * `const { consent: _omitted, ...rest }` is how a test builds a payload
       * with one field missing. Flagging those as unused reports the intent as
       * a mistake, and the noise trains you to stop reading warnings.
       */
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Unfinished-work markers are banned site-wide (Content Spec s2) and the
      // WP14 scan enforces it, but failing at lint time is a faster feedback loop.
      'no-warning-comments': [
        'error',
        { terms: ['todo', 'fixme', 'lorem ipsum'], location: 'anywhere' },
      ],
    },
  },
];

export default config;
