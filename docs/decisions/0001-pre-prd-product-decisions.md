# Decision record 0001: Decisions made before the requirements were written

| | |
|---|---|
| Status | Accepted by the founder. DEC-001 to DEC-063 were approved with the plan on 2026-11-23; DEC-064 to DEC-069 were confirmed on 2026-11-24 |
| Decided | 2026-11-23 and 2026-11-24 |
| Scope | Product, scope, stack, privacy, AI, backend, business and brand |

This log is the single place that says what was decided and why. Where a research note or an analysis says something different, this log wins.

Later decisions go in new files in this directory. To change a decision recorded here, add a new record that supersedes it instead of editing this one.

## How to read a row

Each decision has an ID (`DEC-001`), the decision in one or two sentences, the reason with a pointer to the evidence, and the document that carries it.

"Note 01" and similar refer to the notes in `docs/research/`. `PRD-00` to `PRD-13` are the requirement documents in `docs/prd/`.

## Product and scope

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-001 | Zelva is built by a solo founder working with AI coding agents. | Stated by the founder. It sets the shape of the roadmap and the size of each change (note 09). | PRD-00 |
| DEC-002 | v1 ships on Windows, macOS, Linux, the web, Android and iOS. | Founder's choice. The web is a reduced tier (DEC-019). | PRD-08 |
| DEC-003 | JMAP comes first. IMAP is added later, and the account layer is designed now so that it can be. | IMAP would mean a second sync engine, with no push standard, no Sieve over an API and different search (note 01). | PRD-00, PRD-01, PRD-06 |
| DEC-004 | Zero-mail is assist-only. Zelva suggests, and never moves mail without confirmation. | Founder's choice. Users distrust clients that file mail silently (note 02). | PRD-03, PRD-05, PRD-11 |
| DEC-005 | A rule runs automatically once the user has approved it, whether the user built it or AI proposed it. AI never creates or changes a rule without that approval. | Rules are meant to run while the app is closed. Approval keeps the assist-only promise. | PRD-03 |
| DEC-006 | Zelva's built-in default rules only label mail until the user approves filing, one rule at a time or as a set during first-run. | New behavior should not surprise anyone on day one. | PRD-03, PRD-11 |
| DEC-007 | Bundles are an opt-in, free view that groups similar mail under collapsible headings in the inbox. Nothing is moved. Digests come later. | Bundles are a validated pattern. Making them a view keeps DEC-004 (notes 02 and 10). | PRD-03, PRD-11 |
| DEC-008 | v1 has mail, contacts and calendar, all read and write, including RSVP. | The blueprint promises one hub for all three. | PRD-04 |
| DEC-009 | Where a server does not offer calendar or contacts through JMAP, Zelva uses CalDAV and CardDAV. They are developed alongside JMAP from the start. | Fastmail has no JMAP calendar and is the largest hosted JMAP provider (note 01). | PRD-04, PRD-06 |
| DEC-010 | The client keeps no table of what each server supports. After sign-in, an account shows only the capabilities its server reports and hides the rest. | Every JMAP server reports its capabilities in the session resource (note 01). Four caveats are recorded in the gap analysis. | PRD-00, PRD-01, PRD-06, PRD-08 |
| DEC-011 | Fastmail and Stalwart are built against and certified equally from the first alpha. | Stalwart offers nearly every extension. Fastmail is the largest hosted provider (notes 01 and 09). | PRD-00, PRD-08 |
| DEC-012 | v1 supports S/MIME and OpenPGP end to end: verify, decrypt, sign and encrypt. | Founder's requirement. No server helps with this, so Zelva builds it (note 08). | PRD-13 |
| DEC-013 | Encryption at rest is mandatory. | The cache holds the user's whole mailbox. | PRD-02 |
| DEC-014 | Encryption in transit is mandatory in three places. TLS between Zelva and the mail server. Checks and clear labeling for mail traveling between mail servers. TLS, with signed updates and models, for Zelva's own services. | Founder's requirement. A client can enforce only the first. The others are shown as evidence (note 08). | PRD-02, PRD-08, PRD-10 |
| DEC-015 | Onboarding covers three things: account auto-discovery, a guided first-run setup, and admin-side provisioning in Workspace. | Founder's list. | PRD-06, PRD-12 |
| DEC-016 | Workspace is designed now and shipped after v1. | v1 is already large for one person (note 09). | PRD-12 |
| DEC-017 | Kanidm backs the Zelva Account for Pro, the Workspace console and internal administration. The Workspace console is hosted by Zelva and can also be self-hosted. | Founder's tooling choice. Kanidm has no organizations or SAML of its own, so they are modeled on top of it (note 06). | PRD-10, PRD-12 |
| DEC-018 | Zelva does not hold organization-wide admin tokens centrally. The Workspace console uses the narrowest access the server allows. Where only full-admin access exists, the customer runs that part or grants it for a provisioning window. | A central store of admin tokens would be a top-tier target (note 11). | PRD-12 |
| DEC-019 | The web build ships in v1 as a reduced build. It is also packaged so that Stalwart administrators can install it beside their mail server. | Browser limits: cross-origin rules, no keystore, storage eviction (note 07). | PRD-08 |
| DEC-020 | For Fastmail accounts, mobile notifications are best effort. Zelva never holds a Fastmail password or token on its servers. | Fastmail has no WebSocket push. Whether it can feed the relay is unverified (notes 01 and 06). | PRD-07 |

## AI

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-021 | AI is strictly on-device and optional. The app ships without models, asks before any download, and lets the user decline, disable or delete models at any time. | Founder's requirement. | PRD-05 |
| DEC-022 | Safety is free. Generative AI is Pro. | Matches the blueprint guardrail that basic protection is never paywalled. On-device AI costs Zelva only download bandwidth. | PRD-05, PRD-09 |
| DEC-023 | AI is three layers, not one custom model: checks that need no model (free), a small classifier for spam and phishing (free), and a generative model for summaries and drafts (Pro). | Small classifiers beat tiny language models at detection, and those models are too slow on phones (note 05). | PRD-05 |
| DEC-024 | The generative model is sized by device: 4B on desktop, 2B on phones, 0.8B on the web with summaries only. | Measured speed: a 2B model runs at about 15 to 39 tokens per second on recent phones (note 05). | PRD-05 |
| DEC-025 | The classifier arrives as a small opt-in download of about 70 MB. | It is AI too, so DEC-021 applies to it. | PRD-05, PRD-11 |
| DEC-026 | When the user does not want AI, Zelva falls back to three things: the user's rules, Zelva's default rules, and traditional spam and phishing filters. | Founder's requirement. | PRD-02, PRD-03 |
| DEC-027 | Generative AI is a beta feature in v1. It can move to a v1.x release without holding up v1 or changing Pro pricing. | No published evaluation exists for summaries at this model size (note 05). | PRD-00, PRD-05 |

## Backend and telemetry

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-028 | The free tier uses only minimal zero-knowledge services: web-app hosting, a content-blind push relay and offline license checks. Pro and Workspace may use a full backend. Privacy is mandatory on every tier. | Founder's requirement. | PRD-10 |
| DEC-029 | Analytics, session replay, feature flags and A/B tests exist on every tier only behind an explicit opt-in, through a privacy-focused, self-hostable stack. | Founder's requirement. The threat model treats telemetry as a leak channel (note 11). | PRD-10 |
| DEC-030 | The stack is OpenPanel for analytics and replay, Unleash for flags and A/B tests, OpenObserve for logs, traces and metrics, and GlitchTip for crash reports. | No single open-source tool covers all four needs. OpenObserve cannot delete stored records, so replay does not live there (note 06). | PRD-10 |
| DEC-031 | Feature flags ship with each release. Remote flags and experiments reach only users who opted in. Emergency switches ride on the signed update check. | Otherwise every install would contact Zelva even after declining analytics. | PRD-08, PRD-10 |
| DEC-032 | Session replay runs on desktop only and blocks all mail content rather than masking it. It never records without opt-in. | A leak of message content through replay would break the core promise (notes 06 and 11). | PRD-02, PRD-10 |

## Business

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-033 | The core is licensed under the Apache License 2.0. | Founder's choice. | `LICENSE` |
| DEC-034 | Pro code is published under a source-available license. Anyone can read it. Production use needs a paid license. | Founder's choice: auditable, with legal enforcement. | `LICENSE-PRO`, PRD-09 |
| DEC-035 | Pro launches at a lower price to build adoption: $3 to $4 a month billed annually. From v2, new customers pay $5 a month billed annually or $8 monthly. Existing customers keep their price. | At $5, Pro undercuts Spark Plus and HEY (notes 02 and 09). | PRD-09 |
| DEC-036 | The repository is public from the first commit. | Matches the blueprint's promise of an auditable core. | `CONTRIBUTING.md` |
| DEC-037 | The roadmap is a list of milestones, not dates. | One person with AI agents. A date would force cuts the founder did not choose. | PRD-00 |
| DEC-038 | A desktop alpha is published as soon as it is usable. | Feedback and adoption start early (note 09). | PRD-00, PRD-08 |

## Privacy and security

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-039 | Sender checks run only when the user asks for them. They cover DKIM, DMARC, SPF and the age of the sending domain. Each verdict shows where it came from. | Founder's requirement. The lookups reveal sender domains to a resolver, so they are not automatic (notes 07 and 08). | PRD-02, PRD-11 |

## Brand, stack and operations

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-040 | The name stays Zelva. A formal trademark clearance and a store-name reservation are early tasks. | The alternatives are just as crowded (note 04). | PRD-08 |
| DEC-041 | The app icon is concept A, the Folded Z-Plane. | It reads as a bold Z at 16 pixels (note 10). | PRD-11 |
| DEC-042 | The stack is a Rust core, a Tauri 2 shell and a Solid 2 interface, with the core compiled to WASM for the web. | It is the only option that meets HTML email, text input, accessibility and six platforms with one codebase. Seven alternatives were evaluated (note 03). | PRD-08 |
| DEC-043 | For iOS and macOS, Docker-OSX is tried first for local work. Official builds and signing run on GitHub's macOS runners. | Founder's choice, made knowing the license position (note 04). | PRD-08 |
| DEC-044 | The default branch is `master`. All tooling comes from the Nix flake through direnv. | Founder's standing conventions. | `flake.nix`, `.envrc` |

## Defaults approved with the plan

These defaults were proposed by the lead agent, recorded on 2026-11-24, and confirmed by the founder the same day.

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-045 | Notifications default to "Priority only": direct mail from people, VIP senders and calendar alerts. The user chooses during first-run. | Anything else either floods the user or silently hides mail (notes 02 and 10). | PRD-07, PRD-11 |
| DEC-046 | The free tier allows two accounts with a switcher. A unified inbox and unified search are Pro. | Blueprint boundary. | PRD-01, PRD-09 |
| DEC-047 | On the free tier, client state (snoozes, schedules, local rules) is a signed record in a hidden folder of the user's own mailbox. Pro adds end-to-end encrypted sync with a passphrase. Zelva holds no key. | No standard exists for this state, and the free tier has no Zelva account (note 06). | PRD-03, PRD-10 |
| DEC-048 | Traditional filters are header and authentication checks, URL, attachment and QR-code heuristics, and a Bayesian filter trained by the user's own spam and not-spam actions. No commercial blocklist is bundled. | Commercial blocklists forbid bundling in a paid product (note 08). | PRD-02 |
| DEC-049 | Zelva requires TLS 1.2 or later with validated certificates on every connection, and refuses cleartext unless the user explicitly overrides. When composing, it shows each recipient domain's MTA-STS and DANE status. Received mail shows the TLS hop the user's own server recorded. Both are labeled as evidence, never as a guarantee. | Between mail servers only the sending server can enforce anything (note 08). | PRD-02 |
| DEC-050 | Private keys are stored encrypted under a key held by the OS keystore. Hardware-backed keys come after v1. Keys are discovered through Autocrypt and the recipient's own domain. Public keyservers are used only on request. Pro sync carries public keys. Private keys sync only by opt-in, protected by a passphrase. | Public keyserver lookups reveal who the user writes to (note 08). | PRD-13 |
| DEC-051 | On the web build, OpenPGP keys are protected by a passphrase. S/MIME is included only if the WASM experiment passes. | A browser has no keystore, and S/MIME on WASM is unverified (note 08). | PRD-08, PRD-13 |
| DEC-052 | CalDAV and CardDAV endpoints are discovered automatically. If discovery fails, Zelva tries a short built-in list of known provider endpoints, then asks for the server address. | JMAP does not report DAV endpoints, and custom domains may not publish them (note 04). | PRD-06 |
| DEC-053 | Built-in platform AI models from Apple, Google, Microsoft and Chrome are not used in v1. Training an in-house classifier is post-v1. | None accepts a Zelva-trained model, and each covers only some devices (note 05). | PRD-05 |
| DEC-054 | Pro is sold through in-app purchase on iOS and Android, and through a merchant of record on web and desktop. Licenses are Ed25519-signed tokens that verify offline. Pro has a 21-day trial without a card. | Apple requires in-app purchase except in a few regions (notes 06 and 07). | PRD-09 |
| DEC-055 | Linux ships on Flathub and as native packages. macOS builds are notarised. Windows builds are signed. Mobile goes through the stores. Updates and models come from object storage under signed manifests. Signing keys live in a KMS. | Threat model: nothing on the user's side can stop a malicious signed update (note 11). | PRD-08 |
| DEC-056 | Accessibility targets WCAG 2.2 AA. The interface is built for translation, with English at launch. | Never paywalled (note 09). | PRD-08, PRD-11 |
| DEC-057 | Thundermail is a provider preset from beta. DAV servers other than Fastmail are certified after v1. | Thundermail accepts third-party clients (note 04). | PRD-06, PRD-08 |
| DEC-058 | IMAP work starts when either of these holds: activation growth stays under 5% a month for three months, or 30% of the provider waitlist names one provider. | Gives the demand signal a number (note 09). | PRD-00 |
| DEC-059 | The GitHub organization is `zelva-mail`, because the name `Zelva` is taken. The domain zelva.email is unregistered. | Name check (note 04). | PRD-08 |
| DEC-060 | Workspace costs $8 per seat per month. | It matches BlueMail Business and HEY for Domains (note 02). | PRD-09, PRD-12 |
| DEC-061 | The interface uses Inter, with JetBrains Mono for addresses, headers and rule conditions. The brand emerald, coral and sky get darker text variants, and danger and warning colors are added. | Inter covers more scripts than Plus Jakarta Sans, and the brand colors fail contrast as text (note 10). | PRD-11 |
| DEC-062 | The vision is framed as "the reference client for JMAP mailboxes first". | Only JMAP providers are reachable in v1, so "replace legacy clients" cannot be tested by it (note 09). | PRD-00 |
| DEC-063 | Success is measured differently from the blueprint. By day 90, 3% of activated users buy Pro. Store ratings reach 4.5 or better with at least 100 ratings. Activated users and retention replace daily active users. | The median freemium conversion is 2.1% (note 02). | PRD-00 |

## Defaults recorded after the plan was approved

These defaults follow from the decisions above and from the research. They were recorded by the lead agent on 2026-11-24 and confirmed by the founder the same day.

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-064 | An RSVP goes through the server's own scheduling when it offers one, and by email otherwise. Every RSVP is confirmed before it is sent, so there is no undo after sending. | CalDAV scheduling is not universal, and email works everywhere (note 04). | PRD-04 |
| DEC-065 | Until Fastmail registers Zelva as an OAuth client, Fastmail accounts sign in with an API token. Applying for that registration is an early task. | Fastmail registers each OAuth client and its origins by hand (note 01). | PRD-06 |
| DEC-066 | The analytics opt-in is asked during the guided first-run setup. It is off by default and can be changed later in Settings. | Consent must be explicit and easy to refuse (note 11). | PRD-10, PRD-11 |
| DEC-067 | Zelva ships a sample inbox with clearly marked demonstration data. | Store reviewers and new users need mail to look at before they connect an account. | PRD-06, PRD-11 |
| DEC-068 | New mail is fetched in full for offline search, within a size limit the user can change. | Server-side search cannot see encrypted mail, and fetching everything hides which messages the user reads. | PRD-01 |
| DEC-069 | Rules created by hand in Zelva are free on every tier, and so is switching on filing for the default rules. Pro adds the visual Sieve builder for servers that offer Sieve, AI rule proposals, and advanced conditions. | A free user must be able to keep the inbox clean without AI, as DEC-026 requires. The blueprint puts the paid value in server-side automation. | PRD-03, PRD-09 |
