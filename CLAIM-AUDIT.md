# Claim audit

Generated 2026-09-05 by `pnpm claim:audit`. Regenerate it rather than editing it.

Two questions. Does the site contain anything it must not? And can every
number on it be accounted for — either traced to a source in
`CONTENT-SOURCES.md`, or explicitly classified as something that is not a
claim about the world?

---

## Summary

| Check                                 | Result |
| ------------------------------------- | ------ |
| Numbers rendered on the site          | 81     |
| Traced to a source                    | 36     |
| Classified as not a factual claim     | 45     |
| **Unaccounted for**                   | **0**  |
| Prohibited content found              | 0      |
| Hygiene scans failed                  | 0      |
| Sources defined in CONTENT-SOURCES.md | 13     |

## Hygiene scans

| Scan                                              | Result |
| ------------------------------------------------- | ------ |
| No domain hardcoded in src/                       | pass   |
| No hex colour outside the token file              | pass   |
| The discarded former working name appears nowhere | pass   |

## Numbers traced to a source

Each of these is a statement about the world that someone could check, and
that we would be wrong about if it changed.

| Source | Claim                                         | Where it appears             |
| ------ | --------------------------------------------- | ---------------------------- |
| `S3`   | age band for full funding, non-levy employers | `/funding`, `/faq`           |
| `S3`   | co-investment split at 25 and over            | `/funding`                   |
| `S3`   | date the funding position changed             | `/funding`, `/faq`, `/terms` |
| `S9`   | apprenticeship levy threshold                 | `/funding`                   |
| `S10`  | hiring payment and the date it starts         | `/funding`                   |
| `S13`  | apprentice minimum wage condition             | `/funding`                   |

## Numbers that are not claims about the world

Recorded rather than ignored: the distinction between a fact we could be
wrong about and a number that simply is what it is has to be a decision
someone made, not an omission.

| Kind               | Number | Why it needs no source                                                                                                                                                                |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| illustrative       | 60     | a hypothetical firm, not a customer. No real employer is described anywhere on the site.                                                                                              |
| self-descriptive   | 3      | apprenticeship levels are a published framework; the sentence states our own focus, not a fact about anyone else                                                                      |
| structural         | 1      | step or card numbering; encodes order, claims nothing                                                                                                                                 |
| review date        | 24     | the date the page was last checked                                                                                                                                                    |
| our own price      | £750   | what we charge. A commercial decision, not a fact about the world — it needs no external source, but it does need to stay true: if the fee changes, this and the FAQ change together. |
| form option        | 1      | employee-count bands offered in the enquiry form                                                                                                                                      |
| our own policy     | 24     | a retention commitment we are making, not an external fact. UK GDPR requires it to be stated.                                                                                         |
| standard reference | 2.2    | the version of the accessibility standard being conformed to                                                                                                                          |
| our own testing    | 95     | the Lighthouse threshold enforced by lighthouserc.json                                                                                                                                |
| our own testing    | 5.42:1 | measured across every rendered text element and asserted by tests/e2e/contrast-rendered.spec.ts                                                                                       |
| our own testing    | 320    | the narrowest width the layout is tested at                                                                                                                                           |
| structural         | 404    | copyright year or status code                                                                                                                                                         |

---

## What this audit does not do

- It does not re-verify the sources. `CONTENT-SOURCES.md` records the GOV.UK
  URL and retrieval date behind each claim; whether GOV.UK still says that is
  a quarterly job and the WP17 recurring check.
- It reads the rendered pages, so it sees what a visitor sees. It does not
  read the enquiry notification email, which is composed in the Worker.
- It cannot judge tone or implication. A sentence can be literally true and
  still mislead; that is what the adversarial pass in this work package was
  for, and its findings are recorded in the commit rather than here.
