# Operator handover

Everything you need to take the ApprentiGate website from a finished codebase to
a live site on `apprentigate.com`. It is written to be followed on its own — you
should not need to open another file or ask a question.

**Every step here is yours by design.** They all involve a purchase, a
credential, or a DNS change, and none of them belongs to Claude Code. That is a
control, not a convenience: nothing in this repository has ever held a secret,
and nothing should start now.

When you have finished Part 1, hand back with the exact sentence in Part 3 and
the cutover gets done for you.

---

## Before you start

You will need, on your own machine:

- **Node 20.11 or newer.** Check with `node --version`.
- **pnpm.** Check with `pnpm --version`. If it is missing, install it with
  `corepack enable --install-directory ~/.local/bin pnpm`.
- The repository, at `~/Projects/apprentigate`.

Confirm the project builds before you change anything:

```bash
cd ~/Projects/apprentigate && pnpm install && pnpm verify
```

That runs lint, type checks, both build-time guards, 60 unit tests and 213
browser tests. It takes a couple of minutes and should end green. If it does
not, stop and say so — everything below assumes a working starting point.

---

## What is already true

So you are not re-checking things that are done:

- The site is built: fourteen pages, an enquiry form, a booking calendar and a
  custom 404.
- No domain is written into the code anywhere. A build-time check fails the
  build if one appears, which is why the cutover is a configuration change.
- The site sets **no cookies** and stores nothing in the browser, so it needs no
  consent banner.
- Crawling is **refused by default**. The site cannot be indexed until you
  explicitly turn indexing on, which happens at cutover and not before.
- Every number on the site traces to a GOV.UK source or is recorded as not being
  a factual claim. See `CLAIM-AUDIT.md`.

**There is no preview URL yet.** Creating the Cloudflare account is step 3
below, and the preview URL does not exist until you have done it. Step 3 tells
you where to find it once it does.

---

# Part 1 — Things only you can do

Work through these in order. Later steps depend on earlier ones.

## 1. Domain

`apprentigate.com` is already purchased. Two things to check:

- **Turn on WHOIS privacy** at Hostinger if it is not already on. Without it,
  your home address is published in a database that is scraped constantly.
- **Consider registering `apprentigate.co.uk`** and redirecting it to the `.com`.
  It costs a few pounds a year, stops anyone else taking the obvious UK variant
  of your name, and gives UK SMEs a familiar address to land on.

## 2. Create the enquiries mailbox

Create **`enquiries@apprentigate.com`** on Hostinger.

Send a message to it from a personal address, and reply from it to a personal
address. Confirm both directions work before going further — everything about
the enquiry form depends on this mailbox existing and receiving mail.

## 3. Create the Cloudflare account and add the site

1. Sign up at <https://dash.cloudflare.com/sign-up>.
2. Add `apprentigate.com` as a site. Choose the **Free** plan.
3. Cloudflare shows you **two nameservers**. Write them down — step 5 needs them.

Cloudflare will also import the DNS records it can see. **Before you go further,
do step 4.**

## 4. Copy the existing mail records out of Hostinger

**Do this before changing nameservers, not after.**

Moving nameservers moves DNS authority away from Hostinger. Any mail record that
does not exist in Cloudflare stops working the moment the switch takes effect,
and the mailbox you created in step 2 goes dark.

In the Hostinger DNS panel, write down every record of these types:

| Type                      | Why it matters                                                                |
| ------------------------- | ----------------------------------------------------------------------------- |
| `MX`                      | Routes incoming mail to the Hostinger mailbox. Note the **priority** of each. |
| `TXT` starting `v=spf1`   | Says which servers may send as your domain.                                   |
| `TXT` or `CNAME` for DKIM | Signs outgoing mail. Often named `default._domainkey` or similar.             |
| `TXT` at `_dmarc`         | Tells receivers what to do with mail that fails the checks.                   |

Keep the exact host, value and priority of each. A screenshot is fine.

## 5. Change the nameservers at Hostinger

In Hostinger, set the domain's nameservers to the two Cloudflare gave you in
step 3.

This can take up to 24 hours, though it is usually much faster. Wait until
Cloudflare's dashboard shows `apprentigate.com` as **Active** before continuing.

## 6. Recreate the mail records in Cloudflare

In Cloudflare → your domain → **DNS**, recreate every record you noted in step 4,
with the same host, value and priority.

For each mail record, set the proxy status to **DNS only** (a grey cloud, not
orange). Proxying mail records breaks mail delivery.

Then **send a test message to `enquiries@apprentigate.com` from an outside
address and confirm it arrives.** If it does not, the records are wrong and
nothing below will work properly. Fix this before continuing.

## 7. Create a Resend account and verify a sending subdomain

Resend delivers the enquiry notifications.

1. Sign up at <https://resend.com>.
2. Add a domain, and use a **subdomain**: `send.apprentigate.com`, not
   `apprentigate.com`.

   This matters. Verifying the root domain would have you add records that can
   conflict with the Hostinger mailbox records you have just recreated.
   Verifying a subdomain leaves them untouched.

3. Resend gives you a set of DNS records to add — typically an `MX` and two or
   three `TXT` records, all on the `send` subdomain. Add every one of them in
   Cloudflare exactly as given, set to **DNS only**.
4. Wait for Resend to show the domain as **Verified**.
5. Create an **API key** with send permission. Copy it somewhere safe for step 11. You will not be shown it again.

## 8. Create a Cal.com account

1. Sign up at <https://cal.com>.
2. Set your real availability. Only offer times you will actually take a call.
3. Create an event type named **"Apprenticeship consultation"**, 30 minutes.
4. Copy the booking link. It looks like
   `https://cal.com/your-name/apprenticeship-consultation`.

   The part you need is everything after `cal.com/` — for example
   `your-name/apprenticeship-consultation`. That is the value for
   `NEXT_PUBLIC_CAL_LINK` in step 12.

## 9. Get a business phone number

Any UK VoIP provider that forwards to your mobile. An `01494` or `0333` number.

**Never your personal mobile.** The site currently shows "Telephone number to be
confirmed" wherever a number would go, and it stays that way until you set the
variable in step 12.

## 10. Create a Turnstile widget

Turnstile is the bot check on the enquiry form.

1. In Cloudflare → **Turnstile** → **Add widget**.
2. Name it `apprentigate`, add `apprentigate.com` as the hostname.
3. Widget mode: **Managed**.
4. Copy both the **Site Key** and the **Secret Key**.

The site key is public and goes in step 12. The secret key is a secret and goes
in step 11.

**The enquiry form refuses all submissions until the secret key is set.** That is
deliberate: accepting unverified submissions into your inbox would be worse than
a form that is briefly unavailable.

## 11. Load the two secrets

From the repository directory, run each of these and paste the value when
prompted:

```bash
cd ~/Projects/apprentigate && pnpm exec wrangler secret put RESEND_API_KEY
```

```bash
cd ~/Projects/apprentigate && pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
```

The first will ask you to log in to Cloudflare in a browser. That is expected.

**Never paste a secret into a chat window, a file in this repository, or a
commit.** These two commands are the only place they belong.

## 12. Set the public variables

These are not secrets — they are compiled into the public HTML — but they must
be correct.

In Cloudflare → **Workers & Pages** → the `apprentigate` Worker → **Settings** →
**Variables and Secrets**, add each of the following as a plain text variable.

### The Worker's own variables

| Name             | Value                           |
| ---------------- | ------------------------------- |
| `ENQUIRIES_TO`   | `enquiries@apprentigate.com`    |
| `ENQUIRIES_FROM` | `website@send.apprentigate.com` |

`ENQUIRIES_FROM` must be on the **verified sending subdomain** from step 7, not
the root domain. Resend will refuse to send otherwise.

### The site's build variables

| Name                             | Value                        | Notes                                                                          |
| -------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`           | `https://apprentigate.com`   | No trailing slash.                                                             |
| `NEXT_PUBLIC_ALLOW_INDEXING`     | `true`                       | **Only at cutover.** Any other value keeps the site out of search results.     |
| `NEXT_PUBLIC_ENQUIRIES_EMAIL`    | `enquiries@apprentigate.com` | Shown in the footer and used as the fallback if sending fails.                 |
| `NEXT_PUBLIC_BUSINESS_PHONE`     | your VoIP number from step 9 | e.g. `01494 000000`. Leave unset to keep showing the placeholder notice.       |
| `NEXT_PUBLIC_CAL_LINK`           | the slug from step 8         | e.g. `your-name/apprenticeship-consultation`. No leading slash, no `https://`. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | the Site Key from step 10    | Public by design.                                                              |
| `NEXT_PUBLIC_ANALYTICS_TOKEN`    | the token from step 13       | Optional. Leave unset if you skip analytics.                                   |
| `NEXT_PUBLIC_COMPANY_NUMBER`     | **leave unset**              | Only once incorporated. Setting it adds the company number to the footer.      |

## 13. Enable Cloudflare Web Analytics (optional)

Cloudflare → **Web Analytics** → add `apprentigate.com`. Copy the token into
`NEXT_PUBLIC_ANALYTICS_TOKEN`.

It is cookieless and counts page views in aggregate, which is why the site still
needs no consent banner. The cookie policy names it automatically as soon as the
token is set, and says there is no analytics when it is not — so the page stays
accurate either way.

---

# Part 2 — What to check before handing back

Run through this list. If anything fails, fix it before Part 3.

- [ ] `apprentigate.com` shows as **Active** in Cloudflare.
- [ ] A test email sent from outside **arrives** at `enquiries@apprentigate.com`.
- [ ] Resend shows `send.apprentigate.com` as **Verified**.
- [ ] Both secrets are loaded: `pnpm exec wrangler secret list` shows
      `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`.
- [ ] Every variable in step 12 is set, with `NEXT_PUBLIC_ALLOW_INDEXING` set to
      `true`.
- [ ] Your Cal.com availability is real — times you would genuinely take a call.
- [ ] The phone number forwards to you, and it is **not** your personal mobile.

---

# Part 3 — Hand back

When Part 2 is complete, send exactly this:

> Handover checklist complete. Domain is live in Cloudflare, secrets are loaded.
> Execute WP16.

That triggers the cutover: adding the custom domain to the Worker, verifying
HTTPS and the apex redirect, resubmitting the sitemap, and running production
smoke tests against the live domain.

**Do not deploy yourself first.** `pnpm deploy` runs a guard that refuses to
publish a build whose indexing setting contradicts its configuration, but the
cutover has several ordered steps and doing half of them makes the rest harder
to reason about.

---

# Part 4 — After the site is live

These are yours to do personally, and they are the ones that catch what
automated checks cannot.

- [ ] **Open the site on your own phone, on mobile data rather than wifi**, and
      submit a real enquiry. Confirm it arrives in the mailbox. This is the one
      test nothing in the repository can perform.
- [ ] **Book a test slot** through the calendar. Confirm the invitation appears
      in your own calendar.
- [ ] **Check deliverability** at <https://www.mail-tester.com>. Send from the
      site's enquiry form, not from your mailbox. A low score means enquiry
      notifications will land in spam and nobody will tell you.
- [ ] **Have Zaim walk the whole site on his own device** and read every page for
      tone. He is the Senior User; this is his sign-off, not a courtesy.
- [ ] **Search the domain in an incognito window** and confirm the site comes
      back and nothing unexpected does.
- [ ] **Check the social card** by pasting the URL into
      <https://www.opengraph.xyz>. The image should render with the ApprentiGate
      mark and headline.

---

# Part 5 — Before you take any money

Separate from the website, and genuinely important.

- [ ] **Get the four compliance pages reviewed by a solicitor.** The privacy
      notice, cookie policy, terms of use and accessibility statement are drafts.
      Each says so in a comment at the top of its file. They were written to be
      accurate about what the site does, not to be legally settled. Point the
      solicitor at one thing first: the business is not incorporated, so the
      privacy notice names **you and Zaim personally as the data controllers**.
      That is correct today and changes at incorporation.

- [ ] **Complete the IPO trade mark search** on `Apprenti*` in classes 35 and 41,
      before spending anything on printed brand assets. "Apprentify" and
      "Apprentago" both exist.

- [ ] **Incorporate**, then set `NEXT_PUBLIC_COMPANY_NUMBER`. That single
      variable adds the company number to the footer. The privacy notice will
      need rewriting at the same time, not just amending.

- [ ] **Take out professional indemnity cover** before any paid engagement. The
      terms of use limit what the site claims; they are not insurance.

- [ ] **Put a quarterly reminder in your calendar** to re-verify the funding page
      against GOV.UK. The rules changed on 1 August 2026 and change again on
      1 October 2026. The page shows the date it was last checked, so a stale
      page is visible to a prospect. Update the date in `src/lib/funding.ts`
      only after you have actually re-read the sources.

---

## If something goes wrong

| Symptom                                       | Most likely cause                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Enquiry form says it cannot send              | `RESEND_API_KEY` missing, or `ENQUIRIES_FROM` not on the verified subdomain. The form shows the enquiries address so nothing is lost. |
| Form refuses every submission                 | `TURNSTILE_SECRET_KEY` not loaded. The endpoint fails closed on purpose.                                                              |
| Enquiries arrive in spam                      | SPF, DKIM or DMARC on `send.apprentigate.com` is wrong. Check mail-tester.                                                            |
| Mail to the mailbox stops entirely            | An MX record was not recreated in Cloudflare, or was left proxied. See steps 4 and 6.                                                 |
| Calendar area says booking is not switched on | `NEXT_PUBLIC_CAL_LINK` is unset or has a leading slash.                                                                               |
| Site does not appear in search                | `NEXT_PUBLIC_ALLOW_INDEXING` is not exactly `true`.                                                                                   |

---

## Reference

For when you need a fact rather than a step.

**Cloudflare Worker name:** `apprentigate`
**Static output directory:** `out/`
**Worker entry point:** `worker/index.ts`
**The one dynamic route:** `POST /api/enquiry` — everything else is a static file
**Rate limit on that route:** 5 requests per 60 seconds per IP address

**Secrets** (loaded with `wrangler secret put`, never committed):
`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`

**Worker variables:** `ENQUIRIES_TO`, `ENQUIRIES_FROM`

**Build variables:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ALLOW_INDEXING`,
`NEXT_PUBLIC_ENQUIRIES_EMAIL`, `NEXT_PUBLIC_BUSINESS_PHONE`,
`NEXT_PUBLIC_CAL_LINK`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
`NEXT_PUBLIC_ANALYTICS_TOKEN`, `NEXT_PUBLIC_COMPANY_NUMBER`

**Useful commands:**

```bash
cd ~/Projects/apprentigate && pnpm verify
```

```bash
cd ~/Projects/apprentigate && pnpm exec wrangler secret list
```

```bash
cd ~/Projects/apprentigate && pnpm preview
```
