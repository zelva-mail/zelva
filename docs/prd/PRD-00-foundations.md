# PRD-00: Foundations

| | |
|---|---|
| Status | In review |
| Scope | Vision, users, principles, capabilities, tiers, guardrails, milestones, metrics |
| Decisions | Records 0001 and 0002 in `docs/decisions/`, cited where used |

This document is the base that every other requirements document builds on. It says what Zelva is, who it is for, what is free, and how progress is measured. The area documents say what Zelva does.

## 1. Vision

Zelva is the reference client for JMAP mailboxes: a private, fast, cross-platform home for mail, contacts and calendar that gets people to a clean inbox without their mail leaving their control.

The vision is deliberately scoped. "Replace legacy email clients" cannot be tested while only JMAP providers are reachable, so v1 sets out to be the reference client first (DEC-062).

The promise v1 makes to a user:

> A private, fast home for your Fastmail or self-hosted mailbox on all six platforms, that gets you to the bottom of your inbox.

## 2. Who Zelva is for

| # | Who | Job to be done | Role in v1 |
|---|---|---|---|
| 1 | A Fastmail customer with several devices, who already pays for email | "One polished, private client on all my devices that gets me to the bottom of my inbox fast." | The most important early segment. Buys Pro |
| 2 | A Stalwart or Cyrus self-hoster, at home or running a small business | "A first-class client for my own server, that I can audit." | The alpha cohort and the contributors. Later, Workspace seats |
| 3 | Someone on Gmail, Outlook or iCloud who wants their inbox triaged | "Triage my inbox for me." | Not reachable until IMAP. Joins the provider waitlist |

Segment 1 is served first because it is reachable today and is the only one that can fund the work. Segment 2 is served second, and from the first alpha, because the JMAP community lives there (DEC-011).

Two Fastmail facts shape onboarding. API access and calendar sync need a Standard plan or higher, so Basic and Lite customers cannot use Zelva. Until Fastmail registers Zelva as an OAuth client, sign-in is by API token (DEC-065).

## 3. Principles

1. **Nothing moves without you.** Zelva suggests, with a visible reason. A suggestion becomes an action only when you take it. A rule acts only once you have approved it (DEC-004, DEC-005).
2. **The server says what it supports.** Zelva keeps no table of server capabilities. After sign-in, an account shows what its server reports and hides the rest. The one built-in list is DAV endpoints, as a discovery fallback (DEC-010, DEC-052).
3. **Private by default, and never for a fee.** Protection — the list in guardrail G1 — is on before the first message, and no tier buys more of it (section 6).
4. **AI is an invited guest.** The app is complete without it. Without AI, your rules, Zelva's default rules and traditional filters do the work (DEC-021, DEC-026).
5. **Degrade visibly.** When a server, a platform or a device cannot do something, Zelva says so in plain words, at the moment it matters. It never pretends.
6. **One codebase, honest differences.** Six platforms share one codebase. Where a platform is weaker, the difference is published rather than hidden (DEC-019).
7. **Small, safe releases.** Milestones rather than dates, and pull requests small enough to review in one sitting (DEC-001, DEC-037).

## 4. How features appear

Features follow the server. An account on Stalwart reports calendar, Sieve rules and sharing, so those appear. An account on Fastmail reports mail, contacts and vacation settings, so those appear and the others are hidden.

Four things make this work, and PRD-01 and PRD-06 carry them as requirements:

- **An advertised capability may be incomplete.** Zelva treats an unknown capability, method or property as "not available for this account" and carries on.
- **Capabilities belong to an account.** Zelva uses the account's own list, not only the server's.
- **Draft extensions move.** Zelva parses them tolerantly, behind adapters that can be versioned.
- **Some things are not reported.** CalDAV and CardDAV are discovered separately (DEC-052), and server limits are discovered by probing.

The reasoning is in [the gap analysis](../gap-analysis.md), section 5.

## 5. Tiers

| Capability | Free | Pro | Workspace (after v1) |
|---|---|---|---|
| All six platforms, JMAP sync, TLS, encrypted cache, signed updates | Yes | Yes | Yes |
| Tracker and pixel blocking. Remote images off by default | Yes | Yes | Yes |
| Safety without a model, and the classifier after an opt-in download | Yes | Yes | Yes |
| OpenPGP and S/MIME: verify, decrypt, sign, encrypt | Yes | Yes | Yes |
| Local search, folders and labels, triage by keyboard, pointer and gesture | Yes | Yes | Yes |
| Default rules, which label until you approve filing. The bundles view | Yes | Yes | Yes |
| Rules you build by hand in Zelva | Yes (DEC-069) | Yes | Yes |
| Accessibility. An English interface built for translation | Yes | Yes | Yes |
| Mobile notifications through the push relay, after opt-in | Yes | Yes | Yes |
| Accounts | Up to 2 | Unlimited, with unified inbox and unified search | Unlimited, with unified inbox and unified search |
| Snooze, send later, follow-up reminders, VIP screener | No | Yes | Yes |
| Visual Sieve builder, where a server offers Sieve. AI rule proposals | No | Yes | Yes |
| Generative AI on-device: summaries and draft replies | No | Yes | Yes |
| Themes, icon packs, advanced shortcut schemes | No | Yes | Yes |
| Shared mailboxes, delegation and team aliases, where a server reports them | No | No | Yes |
| Console, device policy, single sign-on, archiving hooks, support agreement | No | No | Yes |

Pro features that depend on a server are offered only where that server reports the needed capability. On other servers they are replaced by a device-local version or hidden, and the pricing page says which (DEC-010).

| Tier | Price |
|---|---|
| Free | Nothing |
| Pro | $3 to $4 a month billed annually at launch. From v2, $5 a month billed annually or $8 monthly for new customers (DEC-035). A 21-day trial without a card (DEC-054) |
| Workspace | $8 per seat per month (DEC-060) |

Workspace is designed during v1 and shipped after it (DEC-016). Its requirements are in PRD-12.

## 6. Guardrails

These hold on every tier and in every release. A change that breaks one is a defect.

| ID | Guardrail |
|---|---|
| G1 | Safety and privacy are never sold. Tracker blocking, TLS, the encrypted cache, sender warnings, OpenPGP, S/MIME and the classifier are identical on every tier. |
| G2 | Declining analytics, AI or a model never removes a feature and never triggers a nag. |
| G3 | Accessibility and basic keyboard operation are never sold. |
| G4 | A lapsed Pro license never reduces privacy or safety, and never takes mail away. |
| G5 | The push relay serves free accounts exactly as it serves paid ones. |
| G6 | Nothing moves, hides or deletes mail without the user's approval. |
| G7 | AI never acts on mail, and what it writes never sends itself. |

## 7. Milestones

There are no dates. Each milestone ends when its exit criteria are met.

Exit criteria say where each number comes from. Counts of installs, activations, purchases and crashes come from the store consoles and the license server, which see no message content. Quality measures — retention, trial conversion among activated users, summary helpfulness — come only from users who opted in, and are read as trends, not censuses (DEC-029).

### Foundation

No release. The work that everything else depends on, and the experiments listed in [the gap analysis](../gap-analysis.md), section 7.

Scope:
- A Rust core with one canonical model for mail, contacts and events, with versioned schemas.
- An account layer that takes JMAP now and can take IMAP later (DEC-003).
- Session discovery, sign-in, and the server-reported capability model.
- Contract tests that run against Fastmail and Stalwart.
- Every Foundation experiment settled and recorded.
- The Fastmail OAuth application submitted (DEC-065). Trademark clearance started (DEC-040).

Exit criteria:
- Contract tests pass on Fastmail and Stalwart for every capability v1 needs.
- Every Foundation experiment has a written verdict.
- Continuous integration is green on Windows, macOS and Linux.
- Every architecture-level security question in the threat model is answered in the gap analysis, and each one left open there has a milestone that settles it.

### Desktop alpha

Windows, macOS and Linux, for Fastmail and Stalwart accounts. Published as early as it is usable (DEC-038).

Scope:
- Mail: sync, folders, conversations, compose, reply, forward, signatures, attachments, search, two accounts.
- Privacy and safety without a model. Encrypted cache. No telemetry unless opted in.
- Triage: keyboard and pointer, undo, bulk actions, suggestions that need no model.
- Default rules that label. The bundles view.
- Desktop notifications. Account discovery, token sign-in and the guided first-run.
- Signed updates.

Exit criteria:
- 200 activated users per certified server, counted from store consoles and the license server.
- Account discovery succeeds for at least 95% of attempts, counted from opt-in telemetry.
- At least 99.5% of sessions are free of crashes, from store console crash rates.
- No data-loss defect of the highest severity.
- At least 40% of activated users return in week four, an opt-in trend.
- Opening a message causes no network request. Verified in continuous integration.

### Public beta

Adds Android, iOS and the web, and the rest of v1.

Scope:
- Contacts and calendar, over JMAP where reported and over CalDAV and CardDAV otherwise, including RSVP.
- OpenPGP and S/MIME end to end.
- Mobile notifications through the relay, and web push where a server reports it.
- On-device AI behind a flag: the model manager, the free classifier, summaries, drafts and rule proposals.
- The sample inbox with clearly marked demonstration data (DEC-067).
- Snooze, send later, follow-up reminders, the VIP screener.
- The visual Sieve builder, and device-local rules elsewhere.
- Unified inbox. The Pro trial and purchase.
- Thundermail as a provider preset (DEC-057).
- An accessibility pass, and the translation framework.

Exit criteria:
- Every required capability works on all six platforms, with the published differences.
- On Stalwart, a push notification arrives within 30 seconds in the 95th percentile, measured in the field from opt-in devices.
- At least 35% of activated users return within 30 days, an opt-in trend.
- At least 10% of activated users start a Pro trial (license server), and at least 35% of trials convert.
- At least 70% of summaries are rated helpful, among those rated.
- The OpenPGP and S/MIME tests pass against messages produced by GnuPG, Thunderbird and Outlook.
- iOS and macOS builds are signed and notarised.

### v1

Scope:
- Hardening, and meeting every budget in PRD-08.
- Onboarding polish. The website, pricing and documentation.
- Cyrus added to the certified servers, for mail over JMAP. Its contacts, calendar and sharing stay behind the capability report, and its DAV side is certified after v1 (DEC-057).
- Launch on the app stores.

Exit criteria:
- A store rating of 4.5 or better, with at least 100 ratings on each store, from the store consoles.
- At least 3% of activated users have bought Pro by day 90 (DEC-063), from the license server over store-console activations.
- At least 40% of activated users return in week eight, an opt-in trend.
- The push relay is available at least 99.5% of the time, from its own monitoring.
- An accessibility audit against WCAG 2.2 AA finds no Level A or Level AA failure.

Generative AI is a beta feature. If it has not met its quality bar by v1, it ships in a v1 release afterwards, without delaying v1 or changing the price of Pro (DEC-027).

### After v1

- Workspace: the console, single sign-on, provisioning and shared mailboxes (PRD-12).
- IMAP, started by its demand signal (DEC-058).
- Digests. Tasks. Hardware-backed keys.
- Other CalDAV and CardDAV servers (DEC-057).
- An in-house classifier, and a possible second look at platform AI models (DEC-053).

### Deliberately not in v1

IMAP. Cloud AI of any kind. Bundles that file mail. End-to-end encryption of the mail store itself, beyond OpenPGP and S/MIME. Post-quantum and version 5 OpenPGP keys. Hardware-backed keys. Clients for mail services without JMAP.

## 8. Metrics

### Definitions

| Term | Meaning |
|---|---|
| Activated user | Someone who connects an account and then uses Zelva for at least three minutes |
| Week N retention | The share of activated users who use Zelva again during week N |
| Clean-inbox day | A day on which the user reaches the bottom of every view they chose to clear |
| Summary helpfulness | The share of summaries marked helpful, among those rated |

### How they are measured

Two kinds of number, from two kinds of place. Counts — installs, activations, purchases, crash rates — come from the store consoles and the license server, which see no message content. Quality measures — retention, conversion among activated users, summary helpfulness, clean-inbox days — come only from users who opted in (DEC-029), and are read as trends rather than censuses.

### Targets by milestone

The exit criteria in section 7 are the targets.

### How this differs from the blueprint

| Blueprint | Now | Why |
|---|---|---|
| Daily active users | Activated users and retention | At this scale, daily counts move with the alpha cohort |
| Store rating above 4.7 | 4.5 or better with at least 100 ratings | A rating is unstable below a few hundred |
| 4 to 7% free-to-Pro conversion | 3% of activated users by day 90 | The median for freemium apps is 2.1% |

## 9. Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| A small market | Only JMAP providers are reachable, and Fastmail Basic and Lite customers are excluded entirely, because API access needs a Standard plan | JMAP is the wedge. The account layer is shaped so that IMAP is one milestone. The provider waitlist measures demand |
| Pro value is thin for Fastmail buyers | The visual Sieve builder, the headline Pro feature, needs a server that reports Sieve, which Fastmail does not | Offer device-local rules and Sieve export there (DEC-072), say so on the pricing page, and lead Pro value for Fastmail users with unified triage, snooze, send later, reminders and the VIP screener |
| Competitors arriving first | Thunderbird for iOS plans JMAP for 2027, and new entrants appeared in 2026 | Ship the alpha early. Stand out on privacy by default, on-device AI, and mail with contacts and calendar |
| Fastmail controls OAuth registration | Sign-in depends on an API token until then | Apply during Foundation. Tokens carry the alpha |
| Draft extensions change | Calendars, metadata and sharing are drafts | Tolerant parsing behind versioned adapters. No feature that depends on a draft without a fallback |
| The scope is large for one person | Six platforms, three PIM areas, encryption and AI | Each milestone has a narrow scope. The list of what v1 excludes is binding. AI can slip |
| Generative AI is slow or poor | A long thread takes a minute on a phone, and quality is unproven | Generated in the background, single messages first, sources shown, edit before send |
| The web build is weak | Cross-origin rules, no keystore, no reliable push | A reduced, published build. Packaged for self-hosting beside Stalwart |
| A trust claim turns out false | "No trackers" and "on-device only" are promises | Leak tests in continuous integration, a public threat model, signed updates |
| Pure-Rust S/MIME is immature | A false "verified" badge is a liability | Interop tests before the beta, strict rules for the badge, and a fallback to an OpenSSL build if needed |

## 10. What this document does not cover

- What each area does: see the other documents in [docs/prd](README.md).
- Why decisions were made: see [the decision log](../decisions/README.md).
- What is still unproven: see [the gap analysis](../gap-analysis.md), section 7.
