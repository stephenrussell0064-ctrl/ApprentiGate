# ApprentiGate — website

Pre-launch marketing site for ApprentiGate, a UK B2B apprenticeship intermediary
serving SMEs in England.

This repository is standalone. It shares no history, remote, dependency tree or
configuration with any other project.

**Current state: WP0 complete — scaffold and quality gates only.** There is no
site copy yet. The single page is a build scaffold and is replaced at WP3.

---

## Local setup

Requires Node 20.11+ and pnpm.

```bash
pnpm install
```

```bash
pnpm exec playwright install chromium
```

```bash
pnpm dev
```

The dev server runs on <http://localhost:3000>. Environment variables are
optional locally — see the table below for the defaults.

### Commands

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm dev`           | Next dev server                                                     |
| `pnpm build`         | Static export to `out/`                                             |
| `pnpm verify`        | **The gate.** Lint, format, types, domain assertion, unit, e2e, axe |
| `pnpm lint`          | ESLint                                                              |
| `pnpm format`        | Rewrite files with Prettier                                         |
| `pnpm format:check`  | Fail if anything is unformatted                                     |
| `pnpm typecheck`     | `tsc --noEmit`                                                      |
| `pnpm guard:domains` | Fail if a domain is hardcoded in `src/`                             |
| `pnpm test:unit`     | Vitest                                                              |
| `pnpm test:e2e`      | Playwright end-to-end, against the real static export               |
| `pnpm test:a11y`     | axe-core, WCAG 2.2 AA, at 320/768/1440px                            |
| `pnpm lighthouse`    | Lighthouse CI against `out/`                                        |
| `pnpm preview`       | Serve `out/` through the real Worker runtime (`wrangler dev`)       |
| `pnpm deploy`        | Deploy to Cloudflare (operator only — requires credentials)         |

`pnpm verify` is what CI runs and what every work package must leave green.

The Playwright suites serve the **built static export**, not the dev server, so
an export-only bug cannot slip through. The build happens automatically as part
of the Playwright `webServer` step.

---

## Deployment target

**Cloudflare Workers Static Assets**, not Cloudflare Pages.

The brief asked for this to be checked against current documentation rather than
assumed. Cloudflare's present guidance is that Workers is the target for new
projects: Workers now serves static assets as well as server-side logic, Pages
remains supported but all new investment, optimisation and feature work is going
to Workers, and Cloudflare explicitly recommends starting new projects on
Workers instead of Pages.

That also suits the shape of this project. The site is fully static except for a
single enquiry `POST` (WP10). On Workers, the static assets and that one route
deploy as a single unit under one configuration file, rather than being split
across a Pages project and a Pages Function.

Configuration is in [`wrangler.jsonc`](./wrangler.jsonc). It is assets-only
today; `main` is added at WP10 when the enquiry Worker lands.

Two settings are coupled and must be changed together:

- `trailingSlash: false` in `next.config.ts` makes the export emit `out/about.html`
- `html_handling: "auto-trailing-slash"` in `wrangler.jsonc` resolves `/about` to it

Changing one without the other causes redirect loops.

`not_found_handling: "404-page"` serves `out/404.html` for unmatched paths, which
is the custom 404 page.

---

## Environment

Every URL on the site derives from `NEXT_PUBLIC_SITE_URL` via
[`src/lib/site-config.ts`](./src/lib/site-config.ts). No domain is hardcoded
anywhere, which is what makes the eventual domain cutover a configuration change
rather than a refactor. `pnpm guard:domains` fails the build if a domain literal
appears in `src/`.

### Domain

The production domain is **`apprentigate.com`**, owned by the operator.

It is deliberately **not** written into `src/` — the guard actively fails the
build if it appears there. Knowing the domain does not change the build: DNS
delegation, mail routing and Resend sending-domain verification are still
outstanding, and the site must not be publicly reachable on the real domain
until it has passed Stage 5 verification. So the site continues to build and
deploy against the Cloudflare preview URL, and cuts over at WP16 by setting
`NEXT_PUBLIC_SITE_URL` to `https://apprentigate.com` and flipping
`NEXT_PUBLIC_ALLOW_INDEXING` to `true`. Nothing else changes.

### Public variables

Set in the Cloudflare project settings. Inlined into the exported HTML at build
time, so they are public by definition — never put anything sensitive here.

| Variable                     | Default if unset        | Purpose                                                                                                                                                                                             |
| ---------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | `http://localhost:3000` | Absolute origin. Drives canonical tags, sitemap, OG/Twitter URLs, JSON-LD `url`, `llms.txt`. The `*.workers.dev` preview URL until cutover, then `https://apprentigate.com`.                        |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false`                 | `"true"` permits indexing; **any** other value disallows it. Must stay false on the preview deployment — an indexed preview URL creates duplicate content against the real domain. Flipped at WP16. |
| `NEXT_PUBLIC_BUSINESS_PHONE` | a non-dialable notice   | The business VoIP number. Never commit a personal mobile.                                                                                                                                           |
| `NEXT_PUBLIC_COMPANY_NUMBER` | `null`                  | Companies House number. Left unset until incorporation; setting it is the only change needed to show it in the footer.                                                                              |

Additional public variables arrive with the services that need them: the Cal.com
booking slug and Turnstile site key at WP10, the Cloudflare Web Analytics token
at WP12.

### Secrets

**Secrets are never committed and are never handled by Claude Code.** The
operator loads each one with `wrangler secret put <NAME>`.

| Secret                 | Loaded at | Purpose                                                 |
| ---------------------- | --------- | ------------------------------------------------------- |
| `RESEND_API_KEY`       | WP10      | Sends the enquiry notification to the enquiries mailbox |
| `TURNSTILE_SECRET_KEY` | WP10      | Server-side verification of the Turnstile token         |

Neither exists yet — WP10 is the work package that consumes them.

---

## Quality floor

Every page must meet all of this before its work package is complete:

- **Zero axe violations** at WCAG 2.2 AA — a pass condition, not an aspiration
- Lighthouse **≥95** on performance, accessibility, best practices and SEO, under mobile emulation
- Full keyboard operation with a visible focus ring
- `prefers-reduced-motion` respected
- Correct rendering at 320px, 768px and 1440px
- No console errors

The axe suite runs every route at all three widths. Lighthouse runs in CI
against a build with `NEXT_PUBLIC_ALLOW_INDEXING=true`, so the SEO category
reflects the production configuration — Lighthouse scores `noindex` as an SEO
failure, which would make ≥95 unreachable on a correctly non-indexed preview
build.

The SEO category is **not** asserted on the two not-found pages, `404.html` and
`_not-found.html`. A correct not-found page is `noindex`, and Lighthouse treats
`noindex` as an SEO failure, so asserting it there would amount to requiring
that the 404 page be indexable. Performance, accessibility and best practices
are asserted on every page, not-found pages included.

### Measured at WP0 (Next.js 16.3.2)

| Route              | Performance | Accessibility | Best practices | SEO                            |
| ------------------ | ----------- | ------------- | -------------- | ------------------------------ |
| `/`                | 1.00        | 1.00          | 0.96           | 1.00                           |
| `/404.html`        | 1.00        | 1.00          | 0.96           | 0.60 (not asserted, see above) |
| `/_not-found.html` | 0.99        | 1.00          | 0.96           | 0.60 (not asserted, see above) |

Two known gaps, both recorded rather than papered over:

- Best practices is 0.96 rather than 1.00 because of a single console error:
  `favicon.ico` returns 404. WP1 delivers the wordmark and favicon set, which
  closes it. Not patched with a throwaway icon, because the brand assets are
  WP1's deliverable.
- Next 16 exports `_not-found.html` as well as `404.html`, so the not-found page
  is also reachable at `/_not-found`. It carries `noindex`, so there is no SEO
  consequence; it is cosmetic and revisited at WP12.

---

## Content rules

Content is governed by the Content Spec, and these are enforced, not advisory:

- **No fabricated social proof of any kind.** No testimonials, client counts,
  logos, savings figures, achievement rates, "leading", "trusted by", star
  ratings or awards. If a section looks empty without social proof, the section
  gets cut — it does not get filled.
- **Every factual claim traces to a source** in `CONTENT-SOURCES.md` with a URL
  and retrieval date. An untraceable claim is deleted, not softened.
- **No company number, no "Ltd", no registered office** — not yet incorporated.
- **No named employer**, past or present, anywhere, including metadata, alt text,
  comments and commit messages.
- **England only.** Devolved-nation apprenticeship funding differs; stating
  English rules as UK-wide is a factual error.
- **Funding content carries a visible review date** and states that eligibility
  is confirmed per employer.
- **The business is ApprentiGate** — one word, capital A, capital G. Never
  "Apprentigate" or "Apprenti Gate". The discarded former working name must not
  appear anywhere in the codebase, copy, metadata, comments, filenames or commit
  messages, and nothing may associate the business with it.

`pnpm guard:domains` fails the build on the discarded former name. That check
holds the only reference to it in this repository, and holds it as assembled
fragments rather than as a literal, so the name itself appears nowhere. The full
prohibited-content scan lands at WP14.

---

## Repository layout

```
src/app/          Routes. Currently the scaffold page and the 404.
src/lib/          site-config.ts — the single source of every absolute URL.
tests/unit/       Vitest.
tests/e2e/        Playwright end-to-end.
tests/a11y/       axe-core, run at three viewport widths.
scripts/          Build-time assertions.
wrangler.jsonc    Cloudflare Workers deployment configuration.
lighthouserc.json Lighthouse CI budgets.
```

---

## Work packages

One work package, one commit, in the form `WP<n>: <what changed>`. A work
package is not complete until its acceptance criteria pass.

Delivered: **WP0** (scaffold and gates). Next: **WP1** (brand and design system).
