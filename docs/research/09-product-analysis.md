# 09 · Product analysis (snapshot taken before the decisions)

| | |
|---|---|
| Status | Analysis snapshot taken 2026-11-23, before the founder made the decisions. Kept as the reasoning behind scope, milestones and packaging |
| Basis | The brief and the research digest of that day. The repository was not inspected |
| Precedence | Where this analysis conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Two things to know when reading it:

- Its assumptions A1 to A6 were never verified. A2 is contradicted by research: Fastmail API tokens and CalDAV need a Standard plan or higher (notes 01 and 04).
- Its open questions OQ1 to OQ12 are all answered. Each one is mapped to a decision in `docs/gap-analysis.md`.

---


**Bottom line.** Narrow the vision to "the reference client for JMAP mailboxes". v1 is feasible for a solo founder only with a published capability matrix and a degrade-don't-pretend policy. Three blueprint hopes do not survive the research: an equal Fastmail and Stalwart experience, content-blind timely push on Fastmail, and rules that run while the app is closed on Fastmail. Pricing holds.

## Assumption register (each unverified)

- **ASSUMPTION A1**: JMAP-reachable consumer mailboxes number in the low millions, mostly Fastmail subscribers who already pay for email; Stalwart is tens of thousands of instances; Cyrus is mostly institutional.
- **ASSUMPTION A2**: Fastmail app passwords work on every plan, including Basic.
- **ASSUMPTION A3**: Fastmail exposes neither ManageSieve nor raw Sieve editing; Stalwart has no CalDAV/CardDAV; Cyrus 3.12 serves mature CalDAV/CardDAV.
- **ASSUMPTION A4**: The self-hosted analytics tool supports replay, flags and A/B tests, and feature flags need an anonymous poll even when analytics is declined.
- **ASSUMPTION A5**: Stores take 15–30% on in-app purchases; a merchant of record handles VAT.
- **ASSUMPTION A6**: Every threshold below is a starting target to recalibrate after alpha.

## 1. Product framing

**Positioning.** For people who pay for email and use more than one kind of device, Zelva is the open-source, JMAP-native client for mail, contacts and calendar that gets them to a clean inbox without their mail leaving their control. Unlike Thunderbird and Apple Mail (IMAP-era, no triage assist, weak privacy defaults) and Fastmail's bundled apps (single vendor, no local AI), it syncs fast by design, blocks trackers by default, and runs AI on-device or not at all.

| # | Persona | Job to be done | Commercial role |
|---|---|---|---|
| 1 | Multi-device Fastmail power user (Mac + Android, Linux + iPhone) [A1] | "One polished, private client on every device that gets me to zero fast." | Buys Pro |
| 2 | Stalwart or Cyrus self-hoster (homelab, small-business admin) | "A first-class client for my own server that I can audit." | Alpha cohort and contributors; rarely pays individually; later Workspace seats |
| 3 | Mainstream inbox-zero seeker on Gmail, Outlook or iCloud | "Triage my inbox for me." | Unreachable until IMAP; design the triage model for them, do not build |

**Most important early-adopter segment: persona 1.** It is reachable today through JMAP and DAV and is the only segment that can fund the product. Persona 2 is the must-serve second: the JMAP-client community is Stalwart-centric, so it supplies the alpha cohort and GitHub traction, which is why equal certification is right.

**The vision needs sharpening.** "Replace legacy, bloated email clients" is a giant-killing claim that v1 cannot test, because only JMAP providers are addressable.

1. Reframe: "Become the reference client for JMAP mailboxes first; earn the right to replace legacy clients when IMAP lands."
2. State the v1 promise in one sentence: "A private, fast, cross-platform home for your Fastmail or self-hosted mailbox that gets you to zero."
3. Replace parity promises with a published capability matrix, and define "zero" measurably (inbox-zero days per week) instead of as a feature list.

## 2. v1 scope (MoSCoW)

P: Must, Should, Could, Won't. Dep: All = any JMAP server; Stw = Stalwart only; DAV = CalDAV/CardDAV; Client = no server feature needed. No v1 item is Fastmail+Stalwart only; Cyrus gaps use probe plus DAV fallback. Parity is all six platforms unless noted. OQ numbers refer to §6c.

| Area | P | Item | Dep | Parity note | Size |
|---|---|---|---|---|---|
| Mail | M | Delta sync, mailboxes, threads (RFC 8620/8621); offline outbox and conflict policy | All | | L |
| Mail | M | Compose, send (JMAP submission), reply, forward, aliases, signatures, synced drafts | All | | L |
| Mail | M | Reading: sanitized HTML and plain bodies, attachments, conversation view | Client | | M |
| Mail | M | Archive, delete, restore, move, flag, spam, undo | All | | S |
| Mail | S | Vacation, quotas, read receipts, blob fetch | All | probe; hide if absent | S |
| Mail | S | S/MIME signature verification (RFC 9219; no server does it) | Client | free | M |
| Mail | C | Fastmail masked email | Fastmail | | S |
| Mail | W | IMAP; PGP; S/MIME sign/encrypt; end-to-end encryption | | post-v1 | |
| Triage | M | Keyboard and swipe triage with undo; bulk select | Client | | M |
| Triage | M | "All caught up" state; assist chips from header and behavior signals, each action confirmed | Client | tier per OQ2 | M |
| Triage | M | Notifications never hide mail by default; categories opt-in with per-category badges | Client | | S |
| Triage | S | Snooze, send later, follow-up reminders, VIP screener, custom categories (Pro) | Client | OQ4; send later device-local | M |
| Triage | C | Bundles and digests (Pro) | Client | post-v1 | M |
| Triage | W | AI moving mail without confirmation | | never | |
| Privacy | M | Remote images blocked by default; per-sender allow; tracker blocking with per-message report | Client | | M |
| Privacy | M | Layer 1 safety: SPF/DKIM/DMARC/ARC, lookalike and impersonation warnings, external-sender banner | Client | | M |
| Privacy | M | Encrypted local cache; TLS enforced; self-signed certificate prompt; app lock | Client | web: no keystore or app lock | M |
| Privacy | M | No telemetry without consent; CI test asserts zero requests to non-user servers | Client | flag poll per OQ9 | S |
| Privacy | S | Layer 2 detection encoder (about 70 MB, after consent) | Client | | M |
| AI | M | Model manager: one ask, size disclosure, download, disable, delete | Client | web: 0.8B only | M |
| AI | M | "AI" label on summaries and drafts (EU AI Act Art. 50); device check; Pro gate | Client | | S |
| AI | S | Thread summary with source snippets, async | Client | desktop 4B, phones 2B, web single message | L |
| AI | S | Draft reply, edit-before-send | Client | desktop only | M |
| AI | S | AI-assisted filtering: proposes a rule, user approves once | Client | then Sieve or local rule | L |
| Filters | S | Visual rule builder to Sieve over JMAP (RFC 9661), Pro | Stw | also Cyrus | L |
| Filters | S | Device-local rules fallback, labeled "runs while Zelva is open" | Client | Fastmail path | M |
| Filters | S | Sieve text export; ManageSieve transport if Fastmail allows | Client | OQ10 | S |
| Contacts | M | JSContact read/write incl. groups (RFC 9610, 9553/9982) | All | Cyrus: probe, else DAV | M |
| Contacts | M | CardDAV client (RFC 6352) | DAV | Fastmail Standard+; web per OQ3 | L |
| Contacts | M | Compose autocomplete; contact card from a header | Client | | S |
| Calendar | M | CalDAV read/write: events, recurrence, time zones (RFC 4791) | DAV | Fastmail Standard+; web per OQ3 | L |
| Calendar | M | Invitations and RSVP: CalDAV scheduling (RFC 6638) or reply by mail (IMIP) | DAV + All | | L |
| Calendar | M | Day, week, month, agenda views; local reminders | Client | | M |
| Calendar | S | JMAP calendars adapter (draft) | Stw | behind a capability flag | M |
| Search | M+S | Local full-text search; server search for uncached mail; unified and saved searches (Pro) | Client / All | | M |
| Accounts | M+S | Two accounts with switcher and identities; unlimited accounts and unified inbox (Pro) | Client | | M |
| Notifications | M | Desktop notifications from live push; per-account settings; deep links | All | Fastmail: EventSource only | M |
| Notifications | M | Mobile: content-blind relay wakes the app, which syncs and posts a local notification | Stw | Fastmail degraded, OQ1 | L |
| Notifications | S | Web Push | Client | browser push services disclosed | S |
| Onboarding | M | Auto-discovery (JMAP session, DAV), Fastmail and Stalwart presets, manual URL override | All | | M |
| Onboarding | M | App passwords; OAuth dynamic registration, PKCE, device code | Stw | Fastmail OAuth needs manual client registration | M |
| Onboarding | M | Guided first-run with a one-minute triage tour | Client | | S |
| Onboarding | S | Provisioning hooks: managed-config schema, claim token (design only) | Client | Workspace | S |
| Settings | M | Sync status, intervals, rate-limit backoff, content-free diagnostics export | Client | | S |
| Settings | S | Cross-device state for snooze, schedules, local rules | All | OQ4 | M |
| Shell | M | Tauri desktop (Windows, macOS, Linux) with signed auto-update | Client | | M |
| Shell | M | Mobile shells with native plugins (push, background, keystore, biometrics) | Client | | L |
| Shell | M | Web PWA with a published capability tier | Client | weakest platform, OQ3 | L |
| Shell | M | Accessibility: keyboard-only, screen reader, WCAG 2.2 AA | Client | never paywalled | M |
| Shell | S | Daylight Canvas and Midnight Slate; i18n framework | Client | | M |
| Shell | S | Basic shortcuts free; advanced schemes, themes, icon packs (Pro) | Client | | S |
| Licensing | M | Signed license checked offline; feature flags; offline grace | Client | | M |
| Licensing | M | Trial entitlement; checkout, restore, refund | Client | A5 | M |
| Licensing | S | Store in-app purchase on iOS and Android | Client | A5 | M |
| Workspace | M | Org, seat and entitlement model; policy schema (MDM app config, GPO/ADMX, macOS profile) | Client | design now | S |
| Workspace | M | Sync model separates a principal from owned and shared mailboxes | Client | design now | S |
| Workspace | S | Specs only: SSO via Kanidm, console, provisioning, shared mailboxes, archiving | Stw | post-v1 | S |

Must rows are GA blockers. Should rows are in unless a milestone exit criterion shows they should slip; AI slips first.

## 3. Milestone plan (no dates)

**M0 Foundation** (repo public from day one)
- Scope: Apache-2.0 repo with contributing and security policy; canonical domain model (mail, contact, event) with schema versioning; provider capability abstraction (JMAP now, IMAP later); session discovery and auth; contract-test harness for Fastmail, Stalwart 1.1.1 and a Cyrus 3.12 container; threat model; telemetry and flag pipeline; spikes for Fastmail OAuth, web CORS and auth, relay protocol, AI eval harness.
- Exit: Must-capability contract tests pass on Fastmail and Stalwart; one-million-message soak with zero loss or duplication; OQ1–OQ5 decided; desktop CI green on three OSes.

**M1 Desktop alpha** (Windows, macOS, Linux; Fastmail and Stalwart)
- Scope: Mail Musts; privacy Musts; local search; two accounts; triage Musts; desktop notifications; onboarding Musts; signed updates. No AI models beyond layer 1.
- Exit: 200 activated users per certified server [A6]; auto-discovery success 95%+; crash-free sessions 99.5%+; no data-loss P0; week-4 retention 40%+; zero tracker leaks in CI proxy tests.

**M2 Public beta** (adds Android, iOS, Web; contacts, calendar, AI, Pro)
- Scope: contacts and calendar Musts (JMAP calendars behind a flag); relay and mobile push; model manager, summaries, drafts, AI rule proposals; snooze, send later, follow-ups, screener; Sieve builder and local fallback; unified inbox; trial and purchase; accessibility pass; i18n framework.
- Exit: Must acceptance criteria pass on six platforms with degradations published in the capability matrix; push p95 within 30 s on Stalwart [A6]; day-30 retention 35%+; trial start 10%+ of activated and trial-to-paid 35%+; summary helpfulness 70%+; signing and notarization proven.

**M3 v1 GA**
- Scope: hardening and performance budgets; onboarding polish; website, pricing, docs; Cyrus certification; store launch.
- Exit: rating 4.5+ with 100+ ratings per store [A6]; free-to-Pro 3%+ of activated users by day 90 [A6]; week-8 retention 40%+; relay uptime 99.5%+; accessibility audit clean.

**M4 Post-v1:** Workspace (console, SSO, provisioning, shared mailboxes on Stalwart); IMAP adapter; bundles and digests; PGP and S/MIME sign/encrypt; tasks; widgets and watch.

**Deferred from v1 on purpose:** every Won't row in §2, certification of other DAV servers (Nextcloud, Radicale, iCloud), web drafts and digests, generative AI on mid-range Android.

## 4. Packaging and pricing

| Capability | Free (up to 2 accounts) | Pro | Workspace |
|---|---|---|---|
| Six platforms, JMAP sync, TLS, encrypted cache, updates | Yes | Yes | Yes |
| Tracker and pixel blocking, remote images off, layer 1 and 2 safety, S/MIME verification | Yes | Yes | Yes |
| Local search, basic folders, triage, basic shortcuts, accessibility, push relay | Yes | Yes | Yes |
| Unlimited accounts, unified inbox and search | No | Yes | Yes |
| Snooze, send later, follow-ups, VIP screener, categories | No | Yes | Yes |
| Sieve visual builder with local fallback | No | Yes | Yes |
| On-device summaries, draft replies, AI rule proposals | No | Yes | Yes |
| Themes, icon packs, advanced shortcuts | No | Yes | Yes |
| Shared mailboxes, delegation, team aliases | No | No | Yes (Stalwart, Cyrus) |
| Console, MDM/GPO policy, SSO, archiving hooks, SLA | No | No | Yes |

**Pro features a server cannot support.** Policy: detect capabilities at session start and show them on a "Your server" screen; degrade, substitute or hide, always labeled; repeat the list on the pricing page; trial before purchase; 30-day refund.
- Sieve builder: native on Stalwart and Cyrus; on Fastmail it becomes device-local rules labeled "runs while Zelva is open", plus Sieve export.
- Shared mailboxes: Stalwart only (RFC 9670); Workspace is not sold to Fastmail-only organizations.
- Calendar: CalDAV on Fastmail Standard and above, JMAP calendars draft on Stalwart, none on Fastmail Basic.
- Push: server-originated on Stalwart, degraded on Fastmail (OQ1).

**AI Pro trial.** 21 days, full Pro, no card, triggered in context (first long thread, first rule attempt), never in first-run. Model download is a separate consent after a device check that shows expected speed. At expiry features become view-only and nothing is held hostage: Sieve stays on the server, local rules pause, snoozed mail resurfaces normally. A/B test 14 against 21 days in beta; the benchmark median for 17–32-day trials is 42.5% trial-to-paid.

**Pricing verdict: holds.** Pro at $5 per month billed annually ($60), about $8 monthly: level with Mimestream and eM Client, below Spark Plus and HEY, and nearly free for Zelva to serve (on-device AI, state in the user's mail store). Anchor risk: Thundermail sells a whole mailbox for $6, so Pro must visibly save time. Offer a founding rate to alpha and beta testers. Workspace at $8 per seat holds because the customer runs the server, but only for Stalwart and Cyrus organizations (OQ8). Gross up store prices for fees [A5].

**Guardrail audit: holds.** Five lines belong in the PRD: accessibility and basic keyboard operation are never paid; safety warnings and S/MIME verification stay free; the relay serves free accounts identically; declining analytics, AI or models removes no feature and triggers no nag; a lapsed Pro never degrades privacy. One exposure: anonymous flag polling contacts Zelva even when analytics is declined (OQ9) [A4].

## 5. Metrics and risks

**Recalibration against benchmarks**
- DAU is meaningless at niche scale. Track activated users (account connected, 3-minute session) and their week-4 and week-8 retention.
- GitHub stars are vanity. Track external contributors, non-founder issues and alpha installs.
- "App Store rating above 4.7" is volatile below a few hundred ratings. Demote to a guardrail: 4.5+ with 100+ ratings per store.
- 4–7% free-to-Pro is two to three times the 2.1% median download-to-paid at day 35 (RevenueCat 2026). It is reachable only because this audience already pays for email, and only when measured on activated users by day 90: 3%+ at GA, 5%+ twelve months later.
- Report MRR per 1,000 activated users; the revenue ceiling is small at JMAP scale [A1].
- Workspace: count organizations with five or more seats and 12-month seat retention, not raw seats.
- The milestone KPI sets are the exit criteria in §3.

**Top risks and mitigations**
1. **Small addressable market [A1].** JMAP is the wedge; size the provider abstraction so IMAP is one milestone; capture a provider waitlist when discovery fails; start IMAP when activation growth stays under 5% month-over-month for three months or 30%+ of the waitlist names one provider (OQ12).
2. **Competitor timing** (Allodia, six platforms with a Rust core, is the nearest twin; Thunderbird iOS adds JMAP in 2027). Ship the alpha early; differentiate on privacy by default, on-device AI, mail plus contacts plus calendar, open-core; seek Fastmail and Stalwart partnerships.
3. **Fastmail OAuth registration is manual and vendor-controlled.** Request now; app passwords carry the alpha [A2]; gate the web build on it.
4. **Draft-protocol churn** (JMAP calendars, JSCalendar 2.0, JSContact 2.0, sharing). Canonical model, versioned adapters, mapping tests; drafts behind capability flags; CalDAV as the stable calendar baseline; no draft-only feature without a fallback.
5. **AI latency and quality** (50–70 s to first token for a 3,000-token thread on phones; no published eval). Async UX, precompute on charge and Wi-Fi, desktop-first generation, eval harness in Foundation, source snippets, edit-before-send; AI sits behind flags so it can be cut without repricing Pro.
6. **Web build limits** (CORS, no auth headers on EventSource and WebSocket, DAV pre-flight, no keystore, hosted code can change). Spike in Foundation; published capability tier; work with Stalwart upstream on CORS; self-hostable PWA image.
7. **Solo-founder scope.** Alpha is desktop mail only; one certified DAV family in v1 (OQ6); the Won't list is binding; a capability matrix replaces parity.
8. **Unverified trust claims** ("no trackers", "content-blind relay", "on-device only"). CI leak tests on every platform, public threat model, reproducible builds, signed updates and models.

## 6. Product gap analysis

**(a) Claims the research does not support as written**
1. "Replace legacy, bloated email clients" and a Phase-1 cross-platform launch: only JMAP providers are addressable, and six-platform GA is not a first-phase outcome.
2. "Fastmail and Stalwart certified equally": Fastmail has no WebSocket, VAPID, Sieve over JMAP, sharing or JMAP calendar, and Basic has no DAV. Equal certification, yes; equal experience, no.
3. "Content-blind push relay" plus timely mobile mail: Fastmail offers EventSource only, so either notifications are late or something holds a Fastmail credential (OQ1).
4. "Rules run even when the app is closed": impossible on Fastmail over JMAP; snooze and send later have no standard and are device-local without a backend.
5. Assist-only zero-mail versus Smart Filtering and server-side rules that move mail automatically: needs the rule-level consent reconciliation (OQ2).
6. Six-platform parity: web auth and CORS limits, Android's 6-hour background cap, generative AI desktop-first and never on web.
7. The headline Pro feature (Sieve builder) is unavailable to the main paying persona.
8. "Kanidm for user management" presumes accounts; the free tier must work with no Zelva account.

**(b) Missing from the blueprint**
- Capability matrix and degradation policy.
- Notification-hiding policy and a measurable definition of "zero".
- Cross-device state design without a Zelva account (OQ4).
- Web-build trust model: hosted code can change server-side; offer a self-hostable image.
- Security baseline: reproducible builds, signed updates and models, disclosure policy.
- Accessibility, i18n, RTL, time zones.
- Client-side S/MIME verification; a stated PGP stance.
- Commerce plumbing: merchant of record and VAT, refunds, store in-app purchase, Pro-lapse policy.
- Support operations: diagnostics export, docs, status page, Workspace SLA.
- Legal: trademark clearance, GDPR roles, AI Act labeling, contribution terms.
- Provider waitlist as the IMAP demand signal.

**(c) Open questions for the founder, by impact**
1. **OQ1** Fastmail mobile push: best-effort (desktop bridge plus periodic fetch) or an opt-in hosted poller that holds credentials?
2. **OQ2** Confirm that user-approved rules (Sieve, screener, bundles) may move mail and AI never creates or runs a rule unapproved; decide which assist features are free.
3. **OQ3** Web build: minimum capability set and the go/no-go research gate.
4. **OQ4** Cross-device state: the user's mail store (recommended) or a Zelva account; is device-local send later acceptable for v1?
5. **OQ5** Pro code: open with a license gate (recommended for persona-2 trust) or a closed module; CLA or DCO.
6. **OQ6** DAV certification scope: Fastmail and Cyrus only in v1? IMIP as the RSVP fallback?
7. **OQ7** Is generative AI a v1 blocker or v1.x, and what quality bar enables drafts?
8. **OQ8** Pricing mechanics: annual and monthly split, founding rate, store purchase versus direct.
9. **OQ9** Telemetry: anonymous flag polling without consent; session replay limited to consenting testers with content masked?
10. **OQ10** Does Fastmail expose ManageSieve or raw Sieve editing? [A3]
11. **OQ11** Trademark clearance; outreach to Fastmail (OAuth) and Stalwart.
12. **OQ12** IMAP trigger criteria.

## 7. Proposed PRD structure

One PRD per capability area, each small enough to map onto a PR stack, plus a foundations document:
- **PRD-0 Foundations**: vision, personas, capability matrix, tier boundaries, guardrails, glossary, KPI definitions, decision log (OQ1–OQ12).
- **PRD-1 to PRD-11**: Mail core and sync; Privacy and safety; Triage and Pro automation; Contacts and calendar; On-device AI; Onboarding and accounts; Notifications and relay; Platforms and distribution; Licensing, trial and commerce; Services (relay, analytics and flags, observability, license); Workspace (design only).

Per PRD: Problem, Users, Goals and non-goals, Scope by milestone, Requirements, Non-functional requirements, Telemetry events, Capability-matrix rows, Risks and open questions, Traceability to epics and PR stacks.

Requirement format: one ID (`FR-PRIV-003`) per requirement, carrying statement, tier, server dependency, platform parity, size and milestone, with one to five acceptance criteria.

Acceptance-criteria style: Given/When/Then, tagged with server and platform, with numeric thresholds and explicit "must not" criteria for privacy; degraded variants written as separate criteria. Examples:
- `FR-PRIV-003`: Given a message with a 1×1 remote pixel and remote CSS, when opened with default settings on each platform, then zero requests reach non-allowlisted hosts (CI proxy test) and the report shows "2 trackers blocked".
- `FR-SYNC-008`: Given a Fastmail account with 100,000 messages, the inbox is readable within 5 s of first open and background sync completes within 15 min on a 50 Mbps link.
- `FR-AI-007`: Given no model installed, when Summarize is tapped, the consent sheet shows size and expected speed; if declined, nothing downloads and the only way back is Settings.
- `FR-TRIAGE-021`: Given a thread snoozed on desktop, when due with the desktop closed, the phone resurfaces it within 1 min of its next sync, exactly once on every device.

Handoff: impl-planner starts from PRD-1; qa-engineer can turn each criterion into a server × platform test; threat-modeler covers the relay, license service and web build.