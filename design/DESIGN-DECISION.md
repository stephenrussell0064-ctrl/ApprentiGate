# WP1 — Brand and design system: the three directions and the decision

Three visual directions were produced as token sets with hero mocks and judged
against the brief before any of them was built out. **Direction B, "Workbench",
won.** The two that lost are recorded below with the reason, as WP1 acceptance
requires.

---

## The constraint that shaped all three

The recommended design pattern for a business in this category is "Trust &
Authority", and its standard conversion devices are security badges, client
logos, certifications, case studies with metrics, and stat counters.

**Every one of those is on the prohibited-content list.** ApprentiGate has no
customers, no track record and no partnerships, so it has none of them to show
and must not invent any.

That is not a limitation to work around — it is the actual design problem.
Credibility has to be carried by typography, structure, information density and
honest disclosure instead of by borrowed proof. A direction was only viable if
it looked credible _with the proof panels removed_. This is what eliminated one
of the three, and it is the single most important judgement in this work
package.

The four forbidden resemblances — a college, a children's education brand, a
recruitment agency, a government department — were treated as hard filters, not
preferences.

The brief also names three current AI-design defaults to avoid: cream ground
with high-contrast serif and terracotta accent; near-black with a single acid
accent; and broadsheet layout with hairline rules and zero radius. None of the
three directions is any of those, and Direction A was marked down partly for
drifting toward the first.

---

## Direction A — "Ledger"

Quiet professional-services authority. The register of a modern accountancy or
legal-technology firm.

| Aspect  | Value                                         |
| ------- | --------------------------------------------- |
| Ground  | Warm stone `#F5F3EF`                          |
| Primary | Ink navy `#16202C`                            |
| Accent  | Brass `#8A6A2F`                               |
| Type    | Libre Franklin display / Source Sans 3 body   |
| Radius  | 4px                                           |
| Feel    | Dense, tight leading, restrained, understated |

**Why it lost.** Two reasons, and the second is disqualifying.

Its warm-neutral ground with a metallic accent sits one step away from the first
AI default the brief explicitly names. It is not that default — the accent is
brass rather than terracotta and the display face is a sans rather than a serif
— but it is close enough that it would invite the comparison.

More seriously, the register it lands in is management consultancy, which is one
of the four things the brief says the site must not resemble. Quiet authority is
a good look for a firm whose authority is already established. ApprentiGate's is
not, and cannot be evidenced on the site. Adopting the visual language of
seniority without the substance behind it reads as a bluff to exactly the
sceptical managing director this site is built for.

## Direction B — "Workbench" — **selected**

Software-grade operations tooling. Clean, generous, quietly technical.

| Aspect    | Value                                                        |
| --------- | ------------------------------------------------------------ |
| Ground    | White `#FFFFFF`                                              |
| Primary   | Ink `#0F1D2A`                                                |
| Secondary | Slate `#4A5B6B`                                              |
| Muted     | Mist `#EDF1F4`                                               |
| Signal    | Deep teal `#0B6E5F` (6.16:1 on white)                        |
| Type      | Figtree display / Source Sans 3 body / IBM Plex Mono utility |
| Radius    | 10px default                                                 |
| Feel      | Whitespace-led, calm, precise                                |

**Why it won.** It is the only one of the three that is _true_. ApprentiGate is
a managed service that intends to become a platform, and operations tooling is
what that actually looks like. The visual language is not borrowed from a more
established kind of company; it describes the thing being built.

It is also maximally distant from all four forbidden resemblances at once. No
college uses this language, no children's brand, no recruitment agency, and
emphatically no government department.

The utility monospace face does real work. Used for labels, step numbers and
metadata, it reads as "this business handles the administrative detail" — which
is the actual proposition — without making a single claim that would need
sourcing. It is credibility from texture rather than from assertion, which is
precisely what a business with no social proof needs.

The signal colour is a deep teal rather than the default B2B blue. This matters
more than it sounds: the apprenticeship and education sector is saturated with
blue and purple, and the deep teal is distinctive without being loud, holds
6.16:1 contrast on white — comfortably past AA — and carries no eco or
sustainability reading at this darkness.

**Its risk, stated honestly.** Executed lazily, this direction becomes generic
B2B SaaS. Three things are load-bearing against that: the monospace utility
layer, the relay band signature element, and the whitespace discipline. If any
of the three is dropped in later work packages, the direction stops being
distinctive. This is worth watching at WP2 and WP3.

## Direction C — "Beacon"

Confident, optimistic, friendly modern B2B.

| Aspect  | Value                              |
| ------- | ---------------------------------- |
| Ground  | White with sky tint `#F4F8FF`      |
| Primary | Deep blue `#123A8A`                |
| Accent  | Warm chalk `#F2E9D8`               |
| Type    | Poppins display / Inter body       |
| Radius  | 14px                               |
| Feel    | Larger, rounder, warmer, more open |

**Why it lost.** It is the most generic of the three. Deep blue with rounded
corners and a warm accent is the house style of a very large number of B2B
sites, and it is also where an AI asked for "professional and trustworthy"
lands by default. For a business whose entire problem is being unknown, looking
like everything else is a real cost.

The rounder geometry and warmer accent also drift toward the friendly-education
look — the children's-education adjacency the brief bans. Individually the
radius and the chalk accent are both defensible; together with an education
subject matter they compound in the wrong direction.

---

## What was built

Direction B, in full: named tokens as CSS custom properties, the type pairing
and scale, spacing and radius scales, the motion policy, an SVG wordmark and
favicon, and the signature element.

### Signature element — the relay band

A horizontal rule carrying three nodes: **Employer**, **ApprentiGate**,
**Training provider**. The middle node is filled; the outer two are outlined.

It is the signature element because it is simultaneously the most important
piece of information on the site. The Content Spec is explicit that a visitor's
default assumption will be that ApprentiGate is a training provider or a
recruiter, and that correcting this is the single most important job the page
has. Making the correction into the recurring visual device means the brand and
the message are the same thing, and every repetition of the motif reinforces the
proposition rather than merely decorating it.

It recurs as the hero graphic, as a section divider, and as a footer rule.
Drawn in SVG from tokens, so it costs no image weight and needs no alt text
beyond its accessible label.

### On the "gate" idea

The Content Spec permits "gate" once, lightly, if it earns its place, and bars
building the site around a gate metaphor or implying gatekeeping — the
proposition is the opposite of restricting access.

It is used exactly once: in the app mark, as a rounded square with a vertical
slot offset from centre, reading as a way through rather than a barrier. There
is no archway imagery, no gate imagery anywhere else in the system, and the
relay band deliberately shows an open path between three parties rather than a
threshold to be admitted past.
