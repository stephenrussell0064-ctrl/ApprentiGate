# QA report

Generated 2026-08-25 by `pnpm qa:report`. Every number here comes from a run
that happened, not from a claim about the code. Regenerate it rather than
editing it — a hand-edited QA report is worth nothing.

---

## Summary

| Check | Result |
|---|---|
| axe violations | **0** across 15 routes × 3 widths (45 runs) |
| axe rules passed | 1,738 |
| axe incomplete (needs human judgement) | 1 |
| Lighthouse routes audited | 16 |
| Lowest performance | 0.97 |
| Lowest accessibility | 1.00 |
| Lowest best practices | 1.00 |

## Accessibility — axe-core

Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`.

The `best-practice` tag is included alongside the WCAG tags. Running the
WCAG tags alone previously let a real defect through — a page went from h1
straight to h3, and axe stayed silent because `heading-order` is a
best-practice rule rather than a success criterion.

| Route | 320px | 768px | 1440px |
|---|---|---|---|
| Home | 0 violations (39 passed) | 0 violations (37 passed) | 0 violations (37 passed) |
| How it works | 0 violations (38 passed) | 0 violations (36 passed) | 0 violations (36 passed) |
| For employers | 0 violations (40 passed) | 0 violations (39 passed) | 0 violations (39 passed) |
| For training providers | 0 violations (38 passed) | 0 violations (36 passed) | 0 violations (36 passed) |
| Funding explained | 0 violations (41 passed) | 0 violations (39 passed) | 0 violations (39 passed) |
| About | 0 violations (38 passed) | 0 violations (36 passed) | 0 violations (36 passed) |
| FAQ | 0 violations (39 passed) | 0 violations (38 passed) | 0 violations (38 passed) |
| Contact | 0 violations (44 passed) | 0 violations (44 passed) | 0 violations (44 passed) |
| Enquiry confirmed | 0 violations (39 passed) | 0 violations (37 passed) | 0 violations (37 passed) |
| Privacy notice | 0 violations (39 passed) | 0 violations (37 passed) | 0 violations (37 passed) |
| Cookie policy | 0 violations (39 passed) | 0 violations (37 passed) | 0 violations (37 passed) |
| Terms of use | 0 violations (39 passed) | 0 violations (37 passed) | 0 violations (37 passed) |
| Accessibility statement | 0 violations (39 passed) | 0 violations (37 passed) | 0 violations (37 passed) |
| Component gallery (internal) | 0 violations (46 passed) | 0 violations (45 passed) | 0 violations (45 passed) |
| 404 | 0 violations (38 passed) | 0 violations (36 passed) | 0 violations (36 passed) |

### Incomplete results (1)

Checks axe could not decide automatically and flagged for a person to
judge. They are not violations and not failures — but they are listed
rather than counted, because a real problem hides most easily inside a
number nobody expanded.

| Rule | What it means | Routes |
|---|---|---|
| `color-contrast` | Elements must meet minimum color contrast ratio thresholds | /components |

## Keyboard walkthrough

Recorded by pressing Tab from a fresh page load and reading back what took
focus, in order, with its computed outline. A focus ring that is present in
the stylesheet but overridden at runtime would show as `none` here.

### `/`

| # | Element | Accessible name | Focus outline |
|---|---|---|---|
| 1 | `a` | Skip to main content | 3px solid |
| 2 | `a` | ApprentiGate home | 3px solid |
| 3 | `a` | How it works | 3px solid |
| 4 | `a` | For employers | 3px solid |
| 5 | `a` | For training providers | 3px solid |
| 6 | `a` | Funding | 3px solid |
| 7 | `a` | About | 3px solid |
| 8 | `a` | FAQ | 3px solid |
| 9 | `a` | Book a call | 3px solid |
| 10 | `a` | Explore apprenticeships for your business | 3px solid |
| 11 | `a` | See how it works | 3px solid |
| 12 | `a` | GOV.UK | 3px solid |
| 13 | `a` | How apprenticeship funding works | 3px solid |
| 14 | `a` | Book a call | 3px solid |
| 15 | `a` | Send an enquiry | 3px solid |
| 16 | `a` | ApprentiGate home | 3px solid |

### `/contact`

| # | Element | Accessible name | Focus outline |
|---|---|---|---|
| 1 | `a` | Skip to main content | 3px solid |
| 2 | `a` | ApprentiGate home | 3px solid |
| 3 | `a` | How it works | 3px solid |
| 4 | `a` | For employers | 3px solid |
| 5 | `a` | For training providers | 3px solid |
| 6 | `a` | Funding | 3px solid |
| 7 | `a` | About | 3px solid |
| 8 | `a` | FAQ | 3px solid |
| 9 | `a` | Book a call | 3px solid |
| 10 | `button[button]` | Load the calendar | 3px solid |
| 11 | `input` | Your name | 3px solid |
| 12 | `input` | Company | 3px solid |
| 13 | `input[email]` | Work email | 3px solid |
| 14 | `input[tel]` | PhoneOptional | 3px solid |
| 15 | `select` | Approximate number of employeesOptional | 3px solid |
| 16 | `input` | Roles you are recruitingOptional | 3px solid |

### `/faq`

| # | Element | Accessible name | Focus outline |
|---|---|---|---|
| 1 | `a` | Skip to main content | 3px solid |
| 2 | `a` | ApprentiGate home | 3px solid |
| 3 | `a` | How it works | 3px solid |
| 4 | `a` | For employers | 3px solid |
| 5 | `a` | For training providers | 3px solid |
| 6 | `a` | Funding | 3px solid |
| 7 | `a` | About | 3px solid |
| 8 | `a` | FAQ | 3px solid |
| 9 | `a` | Book a call | 3px solid |
| 10 | `summary` | What is ApprentiGate? | 3px solid |
| 11 | `summary` | Are you a training provider? | 3px solid |
| 12 | `summary` | Who employs the apprentice? | 3px solid |
| 13 | `summary` | Who chooses the apprentice? | 3px solid |
| 14 | `summary` | Who pays the apprentice? | 3px solid |
| 15 | `summary` | Who pays for the training? | 3px solid |
| 16 | `summary` | Can government cover the whole training cost? | 3px solid |

The first stop on every page is the skip link (Skip to main content), so a
keyboard user reaches the content without walking the navigation.

## Screen reader semantics

These are the accessibility trees a screen reader reads from, captured for
the three interactive surfaces the brief names. They show the roles, names
and states that would be announced.

**This is not the same as listening.** Inspecting the tree confirms the
semantics are right; it does not confirm that the experience is good, that
announcements arrive in a sensible order, or that a real screen reader
behaves as the specification suggests. A person using VoiceOver or NVDA is
still required, and is item 16 on the operator handover checklist.

### Header navigation

```yaml
- navigation "Main":
  - list:
    - listitem:
      - link "How it works":
        - /url: /how-it-works
    - listitem:
      - link "For employers":
        - /url: /for-employers
    - listitem:
      - link "For training providers":
        - /url: /for-training-providers
    - listitem:
      - link "Funding":
        - /url: /funding
    - listitem:
      - link "About":
        - /url: /about
    - listitem:
      - link "FAQ":
        - /url: /faq
```

### FAQ accordion — collapsed

```yaml
- group: What is ApprentiGate?
```

### FAQ accordion — expanded

```yaml
- group: What is ApprentiGate? A service that helps smaller employers set up and run apprenticeship programmes. We sit between you and the approved training providers who deliver the training, and handle the process that connects the two.
```

### Enquiry form

```yaml
- text: Your name
- textbox "Your name"
- text: Company
- textbox "Company"
- text: Work email
- textbox "Work email"
- text: PhoneOptional
- textbox "PhoneOptional"
- text: Approximate number of employeesOptional
- combobox "Approximate number of employeesOptional":
  - option "Please choose" [selected]
  - option "1 to 9"
  - option "10 to 49"
  - option "50 to 249"
  - option "250 or more"
- text: Roles you are recruitingOptional
- textbox "Roles you are recruitingOptional"
- text: Approximate number of potential apprenticesOptional
- textbox "Approximate number of potential apprenticesOptional"
- text: MessageOptional
- textbox "MessageOptional"
- checkbox "I’m happy for ApprentiGate to contact me about my enquiry. How we handle your details"
- text: I’m happy for ApprentiGate to contact me about my enquiry.
- link "How we handle your details":
  - /url: /privacy
- button "Send enquiry"
```

## Reduced motion

Measured as computed style on an interactive element, with the media
feature emulated in both states.

| `prefers-reduced-motion` | transition-duration | animation-duration |
|---|---|---|
| `no-preference` | 0.15s | 0s |
| `reduce` | 1e-05s | 1e-05s |

## Lighthouse

Mobile emulation, three runs per route, median reported. The target is 95
in all four categories.

| Route | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/_not-found.html` | 0.98 | 1.00 | 1.00 | 0.63 (not asserted) |
| `/404.html` | 0.98 | 1.00 | 1.00 | 0.63 (not asserted) |
| `/about.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/accessibility.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/components.html` | 0.99 | 1.00 | 1.00 | 0.66 (not asserted) |
| `/contact.html` | 0.97 | 1.00 | 1.00 | 1.00 |
| `/contact/confirmed.html` | 0.99 | 1.00 | 1.00 | 0.66 (not asserted) |
| `/cookies.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/faq.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/for-employers.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/for-training-providers.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/funding.html` | 0.98 | 1.00 | 1.00 | 1.00 |
| `/how-it-works.html` | 0.98 | 1.00 | 1.00 | 1.00 |
| `/index.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/privacy.html` | 0.99 | 1.00 | 1.00 | 1.00 |
| `/terms.html` | 0.99 | 1.00 | 1.00 | 1.00 |

SEO is not asserted on the deliberately non-indexable pages — the two
not-found variants, the internal component gallery and the enquiry
confirmation. A correct non-indexable page carries `noindex`, and Lighthouse
scores `noindex` as an SEO failure, so asserting it there would amount to
requiring those pages be indexable.

---

## What this report does not cover

- **A human using a screen reader.** See above. Automated semantics are not
  a substitute, and the accessibility statement says so publicly.
- **Real devices.** Everything here is Chromium with viewport emulation.
  Handover items 13 and 16 put the site on the founders' own phones.
- **The live enquiry path.** Exercised against a real Workers runtime by
  `pnpm verify:worker`, but delivery to the mailbox needs credentials that
  are not held in this repository.
- **Formal structured-data validation.** Google's Rich Results Test needs a
  publicly reachable URL, so it belongs at WP16.

