# ApprentiGate — website

Pre-launch marketing site for ApprentiGate, a UK B2B apprenticeship intermediary
serving SMEs in England.

This repository is standalone. It shares no history, remote, dependency tree or
configuration with any other project.

**Current state: WP15 complete — the build is finished and waiting on the
operator.** Everything through the claim audit is done, and
[`OPERATOR-HANDOVER.md`](./OPERATOR-HANDOVER.md) is the next thing to read.

The only work package left is WP16, the domain cutover, and it cannot start
until the operator has completed the handover checklist. Nothing in this
repository has ever held a credential and nothing should start now, so every
remaining step — the Cloudflare account, the mailbox, the DNS records, the two
secrets — belongs to the operator by design.

**There is no preview URL.** Creating the Cloudflare account is step 3 of the
handover, and the URL does not exist before that.

Both adversarial findings are closed — see "Adversarial findings" below.

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

| Command               | What it does                                                            |
| --------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`            | Next dev server                                                         |
| `pnpm build`          | Static export to `out/`                                                 |
| `pnpm verify`         | **The gate.** Lint, format, types, domain assertion, unit, e2e, axe     |
| `pnpm lint`           | ESLint                                                                  |
| `pnpm format`         | Rewrite files with Prettier                                             |
| `pnpm format:check`   | Fail if anything is unformatted                                         |
| `pnpm typecheck`      | `tsc --noEmit`                                                          |
| `pnpm guard:domains`  | Fail if a domain is hardcoded in `src/`                                 |
| `pnpm guard:tokens`   | Fail if a hex colour appears outside the token file                     |
| `pnpm guard:indexing` | Fail if the built output's robots directive contradicts the config      |
| `pnpm icons:generate` | Regenerate `favicon.ico` and `apple-icon.png` from the tokens           |
| `pnpm test:unit`      | Vitest                                                                  |
| `pnpm test:e2e`       | Playwright end-to-end, against the real static export                   |
| `pnpm test:a11y`      | axe-core, WCAG 2.2 AA + best practice, at 320/768/1440px                |
| `pnpm verify:worker`  | Boots a real Worker runtime and exercises the enquiry endpoint          |
| `pnpm claim:audit`    | Audits every rendered number and regenerates `CLAIM-AUDIT.md`           |
| `pnpm check:sources`  | Re-checks every GOV.UK source for drift, regenerates `SOURCE-DRIFT.md`  |
| `pnpm qa:report`      | Regenerates `QA-REPORT.md` from a real axe, keyboard and Lighthouse run |
| `pnpm lighthouse`     | Lighthouse CI against `out/`                                            |
| `pnpm preview`        | Serve `out/` through the real Worker runtime (`wrangler dev`)           |
| `pnpm deploy`         | Deploy to Cloudflare (operator only — requires credentials)             |

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

**`pnpm lighthouse` leaves `out/` indexable.** It has to: Lighthouse scores
`noindex` as an SEO failure, so the audit builds with indexing on to reflect the
production configuration. Deploying straight after an audit would put an
indexable build on the preview URL — which is the duplicate-content risk the
whole arrangement exists to avoid. `pnpm deploy` therefore runs
`pnpm guard:indexing` first, which reads the built HTML and refuses to deploy
when it contradicts the configured flag. Checking the flag alone would not catch
this, because in that situation the flag is right and the artefact is wrong.

### Public variables

Set in the Cloudflare project settings. Inlined into the exported HTML at build
time, so they are public by definition — never put anything sensitive here.

| Variable                         | Default if unset        | Purpose                                                                                                                                                                                             |
| -------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | `http://localhost:3000` | Absolute origin. Drives canonical tags, sitemap, OG/Twitter URLs, JSON-LD `url`, `llms.txt`. The `*.workers.dev` preview URL until cutover, then `https://apprentigate.com`.                        |
| `NEXT_PUBLIC_ALLOW_INDEXING`     | `false`                 | `"true"` permits indexing; **any** other value disallows it. Must stay false on the preview deployment — an indexed preview URL creates duplicate content against the real domain. Flipped at WP16. |
| `NEXT_PUBLIC_BUSINESS_PHONE`     | a non-dialable notice   | The business VoIP number. Never commit a personal mobile.                                                                                                                                           |
| `NEXT_PUBLIC_COMPANY_NUMBER`     | `null`                  | Companies House number. Left unset until incorporation; setting it is the only change needed to show it in the footer.                                                                              |
| `NEXT_PUBLIC_ENQUIRIES_EMAIL`    | `null`                  | The enquiries mailbox. A variable rather than a literal because the address is on the production domain. While unset the footer omits the row rather than showing an address that bounces.          |
| `NEXT_PUBLIC_CAL_LINK`           | `null`                  | Cal.com link slug, e.g. `apprentigate/consultation`. While unset the contact page says booking is not switched on rather than showing a broken embed.                                               |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `null`                  | Turnstile site key, public by design. While unset the form declines submissions rather than accepting unverified ones.                                                                              |

Additional public variables arrive with the services that need them: the Cal.com
booking slug and Turnstile site key at WP10, the Cloudflare Web Analytics token
at WP12.

### Secrets

**Secrets are never committed and are never handled by Claude Code.** The
operator loads each one with `wrangler secret put <NAME>`.

| Secret                 | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `RESEND_API_KEY`       | Sends the enquiry notification to the enquiries mailbox |
| `TURNSTILE_SECRET_KEY` | Server-side verification of the Turnstile token         |

The Worker also needs two plain variables set in the Cloudflare project:
`ENQUIRIES_TO` (the mailbox) and `ENQUIRIES_FROM` (an address on the verified
Resend sending subdomain).

**The endpoint fails closed.** With no `TURNSTILE_SECRET_KEY` it refuses
submissions outright rather than accepting unverified ones, because an open
relay into an inbox is worse than a form that is temporarily unavailable. With
no `RESEND_API_KEY` it returns the fallback address instead of pretending to
have sent.

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

### Measured at WP1 (Next.js 16.3.2)

| Route              | Performance | Accessibility | Best practices | SEO                            |
| ------------------ | ----------- | ------------- | -------------- | ------------------------------ |
| `/`                | 0.98        | 1.00          | 1.00           | 1.00                           |
| `/404.html`        | 0.98        | 1.00          | 1.00           | 0.60 (not asserted, see above) |
| `/_not-found.html` | 0.97        | 1.00          | 1.00           | 0.60 (not asserted, see above) |

Best practices reached 1.00 at WP1: the favicon set closed the console 404 that
was costing the point at WP0. Performance moved from 1.00 to 0.97–0.98 with the
introduction of three self-hosted font families, which is the expected cost and
remains comfortably above the 0.95 floor.

One known cosmetic gap: Next 16 exports `_not-found.html` as well as
`404.html`, so the not-found page is also reachable at `/_not-found`. It carries
`noindex`, so there is no SEO consequence; revisited at WP12.

## Design system

Direction B, "Workbench". Tokens are defined in
[`src/app/tokens.css`](./src/app/tokens.css) and that is **the only file in
`src/` permitted to contain a hex colour** — `pnpm guard:tokens` fails the build
on a hex literal anywhere else, so components consume tokens rather than raw
values.

|           |                                                                         |
| --------- | ----------------------------------------------------------------------- |
| Colour    | Six named tokens: ink, slate, mist, signal, paper, alert                |
| Type      | Figtree display / Source Sans 3 body / IBM Plex Mono utility, 16px base |
| Spacing   | 4px base, ten steps to 128px                                            |
| Radius    | Six steps, 10px default                                                 |
| Motion    | Transform and opacity only; 150/200/300ms; ease-out entering            |
| Signature | The relay band — employer, ApprentiGate, training provider              |

Fonts are self-hosted by `next/font` at build time, so there is no external
request and no layout shift.

**Watch item for WP2 and WP3.** Three things keep this direction from
collapsing into generic B2B SaaS: the monospace utility layer, the relay band,
and the whitespace discipline. If any is quietly dropped as pages are added,
the brand stops being distinctive. See `design/DESIGN-DECISION.md`.

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
src/app/          Routes, including /components — the internal gallery.
src/components/   brand/ (wordmark, relay band), layout/ (header, footer), ui/
src/lib/          site-config.ts and navigation.ts — URLs and the route map.
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

---

## Recurring checks

`.github/workflows/monthly-checks.yml` runs on the 3rd of each month, and can be
triggered by hand from the Actions tab after a rule change or before a round of
outreach. Three jobs, each failing loudly rather than filing a report nobody
opens:

| Job           | What it answers                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Source drift  | Do the GOV.UK pages still contain the wording our claims rest on?                                  |
| Quality floor | Does the site still pass lint, types, the guards, unit tests, axe at three widths, and Lighthouse? |
| Claims        | Is every number on the site still traced to a source or classified as not a claim?                 |

The drift check looks for **specific phrases** rather than comparing whole
pages. GOV.UK changes constantly for reasons that do not matter, and a report
that cries wolf every month is one nobody reads. A missing phrase means nobody
can point at the sentence a claim came from any more — which, under this
project's rule that an untraceable claim is deleted rather than softened, is
the thing worth being told about.

`scripts/sources.registry.mjs` pairs each source with the wording relied on, and
the check fails if `CONTENT-SOURCES.md` defines a source the registry does not
cover — so a new claim cannot be added without deciding how it will be watched.

**S12 is marked critical.** It is the funding rule that makes ApprentiGate's
fees separate from apprenticeship funding. If its wording goes, that is a
business question rather than a copy edit.

It also watches the funding page's review date, because that date is printed on
the page: a stale one stops being reassurance and becomes evidence that nobody
is looking.

---

## Adversarial findings

Both findings from the WP14 adversarial pass are closed.

### F1 — The employer journey did not disclose that the business is pre-launch

**Closed.** "Pre-launch" appeared on About and For Training Providers and
nowhere on Home, How It Works, For Employers, Funding, FAQ or Contact — the
whole path an employer actually takes.

Nothing on those pages claimed a track record, no customer was invented, and the
prohibited-content scan was clean, so the site passed the letter of the Content
Spec. That is precisely why it is worth recording: the problem was an omission on
one journey rather than a false statement anywhere, and no pattern-based gate
would ever have found it. The honesty was real but unevenly distributed — most
explicit to the audience that mattered least commercially, least explicit to the
one that mattered most. A managing director could have read the entire employer
path, booked a call, and first learned on that call that they would be the first
customer.

Closed on the Contact page rather than on Home: that is where a person commits
their details, and it leaves the Content Spec's approved Home copy untouched. It
sits above both the calendar and the form, because booking a call is a
commitment too, and a test asserts both its presence and that position so it
cannot drift below the things it is meant to precede.

### F2 — "every time" implied a delivery history

**Closed.** The wording now matches the Content Spec's own phrasing, and the
whole class of phrase is a prohibition with self-test coverage. See the WP14
commit.
# ApprentiGate
# ApprentiGate
