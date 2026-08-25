# Source drift check

Last run 2026-08-25 by `pnpm check:sources`. Regenerate it rather than editing it.

Every factual claim on this site traces to a GOV.UK page recorded in
`CONTENT-SOURCES.md`. This checks that each of those pages still contains the
wording the claim rests on.

It looks for specific phrases rather than comparing the whole page, because
GOV.UK pages change constantly for reasons that do not matter. A report that
cries wolf every month is a report nobody reads.

---

## Result

**No drift.** Every source still contains the wording the site relies on.

Funding page last reviewed: **2026-08-24** (1 days ago).
Reviews are due every 90 days.

## Sources checked

| Source | Claim | Status |
|---|---|---|
| `S1` | What a funding band maximum is | unchanged |
| `S2` | Who pays above the funding band maximum | unchanged |
| `S3` | Non-levy government contribution by apprentice age | unchanged |
| `S4` | The employer pays the apprentice's wage | unchanged |
| `S5` | Approved training providers (APAR) | unchanged |
| `S6` | What employers can already do for themselves | derived |
| `S7` | Occupational standards are built around KSBs | unchanged |
| `S8` | End-point assessment tests competency against the KSBs | unchanged |
| `S9` | The apprenticeship levy threshold | unchanged |
| `S10` | The £2,000 hiring payment from 1 October 2026 | unchanged |
| `S11` | Transferring unused levy funds | unchanged |
| `S12` | Lead generation and employer recruitment are ineligible costs | unchanged |
| `S13` | The apprentice minimum wage | unchanged |

---

## What this does not do

- It cannot tell you a claim has become **wrong**, only that the sentence it
  came from is still there. A page can keep its wording and change its
  meaning around it. The quarterly read-through is still a human job.
- It does not check pages the site links to but makes no claim from.
- It does not re-run the accessibility or performance suites. The monthly
  workflow runs those separately, and `QA-REPORT.md` records them.

