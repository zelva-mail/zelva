# 06 · Backend, identity, payments and distribution

| | |
|---|---|
| Status | Research snapshot taken 2026-11-23. Not a living document |
| Method | Research agent reading project repositories, self-hosting documentation, store policies, pricing pages and Apple and Google developer documentation |
| Labels | Claims are VERIFIED unless marked UNVERIFIED |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-017, DEC-018 (Workspace identity and admin tokens), DEC-028 to DEC-032 (backend, telemetry and tooling), DEC-035 (pricing), DEC-054, DEC-055 (payments and distribution).

One recommendation was not followed: the note proposes Flagsmith for feature flags, and the founder chose Unleash for its official Rust, iOS and Android SDKs (DEC-030).

---


**Five premise corrections found while checking (all VERIFIED):**
- JMAP Sharing is **RFC 9670**, not RFC 9662 (which is secure-syslog ciphers). [rfc-editor.org/rfc/rfc9670](https://www.rfc-editor.org/rfc/rfc9670)
- **"Kindify" and "Hyperlog"** returned no analytics product in repeated searches. Treat them as non-existent.
- **Lemon Squeezy** is closed to new sign-ups and shuts down 2027-03-31. [docs.lemonsqueezy.com](https://docs.lemonsqueezy.com/help/getting-started/fees)
- **Azure Trusted Signing** is renamed **Artifact Signing**. [learn.microsoft.com](https://learn.microsoft.com/en-us/azure/artifact-signing/overview)
- **Fastmail has no admin API.** "Admin-side provisioning" on a Fastmail fleet is not buildable. [fastmail.com/dev](https://www.fastmail.com/dev/), [fastmail.help](https://www.fastmail.help/hc/en-us/articles/360058752594)

## 1. PostHog alternative

A = event analytics, R = session replay, F = feature flags, AB = experiments.

| Project | License | Stars | Covers | Notes |
|---|---|---|---|---|
| PostHog self-host | MIT | n/v | A+R+F+AB | "Officially unsupported", no tagged releases or CVEs, paid-plan features cloud-only; 4 vCPU / 16 GB. [docs](https://posthog.com/docs/self-host) |
| OpenPanel | AGPL-3.0 | 7.3k | A+R+AB ("variant testing") | F API UNVERIFIED. SDKs: web, Swift, Kotlin, React Native, Rust (server). ≥4 GB (2.x ≥2 GB). [repo](https://github.com/Openpanel-dev/openpanel), [self-host](https://openpanel.dev/docs/self-hosting/self-hosting) |
| Umami | MIT | 40.3k | A+R (v3.1) | No F. Postgres only. [replays](https://docs.umami.is/docs/replays) |
| Rybbit | AGPL-3.0 | 13.4k | A+R | No F listed; web + API; ≥2 GB. [self-host](https://www.rybbit.com/docs/self-hosting) |
| OpenReplay | AGPLv3 + commercial `ee/` | 13.2k | R+A | No F. 2 vCPU / 8 GB / 50 GB; mobile SDKs beta. [repo](https://github.com/OpenReplay/openreplay) |
| Highlight | Apache-2.0 (secondary) | 9.4k | R, errors, logs | Acquired by LaunchDarkly; hosted service ended 2026-02-28. Avoid. [source](https://posthog.com/blog/best-open-source-session-replay-tools) |
| Countly | AGPL-3.0 modified §7 | 5.9k | A, crash, push | Free tier "non-commercial". [repo](https://github.com/Countly/countly-server) |
| Plausible | AGPL-3.0 | 29.9k | A | No R, no F. [repo](https://github.com/plausible/analytics) |
| Matomo | GPL-3.0 | 22.0k | A | Replay is a paid proprietary plugin (secondary source). [source](https://posthog.com/blog/best-open-source-session-replay-tools) |
| Aptabase | AGPLv3 server / MIT SDKs | 1.9k | A | Only one with a native Tauri SDK. [repo](https://github.com/aptabase/aptabase) |
| GrowthBook | MIT + enterprise dirs | 8.7k | F+AB+A | Best statistics engine; no R. [repo](https://github.com/growthbook/growthbook) |
| Flagsmith | BSD-3 | 8.9k | F+AB | JS/React/iOS/Android/Flutter, Rust server SDK, OpenFeature. [repo](https://github.com/Flagsmith/flagsmith) |
| Unleash | AGPL-3.0 | 14.3k | F+AB | Official Rust, iOS, Android SDKs; 2 environments in OSS. [repo](https://github.com/Unleash/unleash) |
| Flipt | FSL-1.0-MIT | 5.0k | F | Git-native single binary; no AB. [repo](https://github.com/flipt-io/flipt) |

**Recommendation: OpenPanel 2.x (A+R) plus Flagsmith (F+AB).**
- Flagsmith's BSD-3 license avoids two AGPL stacks; Unleash is the drop-in alternative if you want an official Rust SDK.
- PostHog self-host is the only single stack, but its unsupported status is a poor fit for a solo operator.
- Umami is the lightest web-only path if you drop native replay.

**Gaps common to all of them:**
- Consent gating for desktop/mobile must be built in-app.
- None documents a native export to OpenObserve.
- OpenPanel's IP handling was not verified.

**Replay design for an email client.** rrweb's documented controls are `maskAllInputs`, `maskInputOptions`, `maskInputFn`, `maskTextSelector`, `maskTextClass`, `maskTextFn`, `blockClass`, `blockSelector`, `ignoreClass`, `ignoreSelector`, `slimDOMOptions`, `sampling`, `recordCrossOriginIframes` (default false). [rrweb guide](https://github.com/rrweb-io/rrweb/blob/master/guide.md)

1. **Never call `record()` until opt-in is true.**
2. **Render message bodies in a sandboxed iframe** with an opaque origin. rrweb cannot cross iframe boundaries by default.
3. **Block, don't mask:** put `blockSelector` on list rows, reading pane, compose editor, search and account chips. Blocking yields a same-size placeholder, so layout is preserved.
4. **Cover the offscreen DOM:** virtualised list buffers hold subjects of offscreen messages, so mask them too.
5. **Set `maskAllInputs: true`** and mask `<title>`; never put the subject in `document.title`.
6. **Treat attributes as captured.** The guide lists no attribute-masking option, so keep PII out of `aria-label`, `title` and `data-*` outside blocked subtrees.
7. **Server side:** keep OpenPanel defaults `maskAllText: true` and `maskAllInputs: true`, with an `unmaskTextSelector` allowlist for UI chrome only. Replays are kept 30 days. [OpenPanel replay](https://openpanel.dev/docs/session-replay)
8. **Disable mobile replay entirely.**

## 2. OpenObserve

- **Version and license:** v0.91.5 (2026-07-30), v0.92.0-rc2 in preview; AGPL-3.0, plus a commercial Enterprise edition. [releases](https://github.com/openobserve/openobserve/releases)
- **Ingest:** OTLP logs/metrics/traces and OTLP profiles, plus JSON `_json`, `_multi` and `_bulk` APIs. [ingestion](https://openobserve.ai/docs/user-guide/ingestion/)
- **Storage:** Parquet on local disk with SQLite (default single node) or S3, GCS, MinIO, RustFS, Azure Blob. [architecture](https://openobserve.ai/docs/architecture/)
- **Scale:** "over 2 TB on a single machine per day"; memory cache defaults to 25% of RAM single-node.
- **HA:** requires Kubernetes with Helm, PostgreSQL, NATS and object storage. "HA mode does not support local disk storage."
- **Dashboards, alerts, pipelines:** 19+ chart types; scheduled, real-time and composite alerts; email and webhook destinations; real-time and scheduled pipelines. Anomaly detection and audit trails are Enterprise-only. [repo](https://github.com/openobserve/openobserve)
- **Immutability (major):** "once ingested, it cannot be modified or deleted (only entire retention periods can be dropped)". Scrub before send.
- **Multi-tenancy:** organizations and streams, plus a "Super Org" model from v0.91.0. Per-stream default retention was not verified.

**Client shipping:**
- **Rust core:** `opentelemetry-otlp` 0.33.1 (2026-10-09), http/protobuf default, with gzip and retry. Batch via the `Sdk*Provider` builders. [docs.rs](https://docs.rs/opentelemetry-otlp/latest/opentelemetry_otlp/)
- **WASM:** not documented. Use `@openobserve/browser-rum` and `@openobserve/browser-logs` for the web build; `defaultPrivacyLevel` defaults to `mask-user-input`. Mobile SDKs are beta. [RUM](https://openobserve.ai/docs/user-guide/rum/)
- **Token:** the RUM `clientToken` ships in the app, so it must be ingestion-only.
- **Pipeline:** in-memory queue, batch, no disk queue before consent, drop on opt-out, sample errors at 100% and spans at 1–5%.

**Crash reporting:** none native; no minidump, DSN or symbolication found in docs. Pair with **GlitchTip**: MIT, Sentry-SDK compatible, PostgreSQL 14+, optional Valkey, 512 MB recommended. [install](https://glitchtip.com/documentation/install)

**Sentry self-hosted** is FSL-1.1-Apache-2.0 and needs 16 GB RAM plus 16 GB swap and about 19 services. [requirements](https://develop.sentry.dev/self-hosted/), [license](https://github.com/getsentry/sentry/blob/master/LICENSE.md)

## 3. Kanidm

- **Version and license:** v1.12.1 (2026-11-13); MPL-2.0. [tags](https://github.com/kanidm/kanidm/tags), [license](https://raw.githubusercontent.com/kanidm/kanidm/master/LICENSE.md)
- **OIDC:** code flow with S256 PKCE mandatory for public clients, localhost redirects for native apps, public and confidential clients, RFC 7662 introspection, RFC 7009 revocation. [OAuth2](https://kanidm.github.io/kanidm/stable/integrations/oauth2.html)
- **Federation:**
  - No SAML; maintainers suggest SimpleSAMLphp as a bridge. [#2874](https://github.com/kanidm/kanidm/discussions/2874)
  - Upstream OIDC "trust login" exists. [advisory](https://github.com/kanidm/kanidm/security/advisories/GHSA-x8cg-3c8h-gw55)
- **SCIM:** inbound only (Kanidm as SCIM server since 1.7.0). Outbound is an open request. [#4227](https://github.com/kanidm/kanidm/issues/4227)
- **Self-signup:** new in 1.12.0, disabled by default, needs outgoing email. [signup doc](https://raw.githubusercontent.com/kanidm/kanidm/master/book/src/accounts/account_signup.md)
- **Account policy:** zxcvbn plus badlist, minimum length, `credential-type-minimum` from `any` to `attested_passkey`. No rotation ("never support"). Lockout policy was not found. [policy](https://raw.githubusercontent.com/kanidm/kanidm/master/book/src/accounts/account_policy.md)
- **Service accounts:** API tokens are read-only by default, with expiry; RFC 8693 token exchange is supported. [service accounts](https://raw.githubusercontent.com/kanidm/kanidm/master/book/src/accounts/service_accounts.md)
- **Admin:** CLI-first, plus REST with OpenAPI at `/docs/v1/openapi.json`. There is no admin WebUI. [REST](https://raw.githubusercontent.com/kanidm/kanidm/master/book/src/developers/designs/rest_interface.md)
- **HA and backup:** two or more writeable nodes, eventually consistent, sticky sessions advised; same-version restore only. [replication](https://raw.githubusercontent.com/kanidm/kanidm/master/book/src/repl/readme.md), [backup](https://raw.githubusercontent.com/kanidm/kanidm/master/book/src/backup_and_restore.md)
- **Security record:** ten advisories in 2026, including a Critical privilege escalation fixed in 1.10.2. [security](https://github.com/kanidm/kanidm/security)
- **Not verified:** resource sizing, and the `kanidm_client` crate version.

| Job | Fit | Falls short |
|---|---|---|
| (a) Zelva Account (Pro) | Good: signup, passkeys, TOTP, email recovery | Entitlement, devices and billing need a separate Zelva DB keyed on Kanidm `sub`. Signup is three weeks old. |
| (b) Workspace identity | Weak | No SAML, no organizations, no per-tenant IdP federation (UNVERIFIED). |
| (c) Internal admin | Strong | None material. |

**Lightest bridge for (b):** drop SAML in v1. Offer Workspace login via Kanidm OIDC with group-encoded orgs, and use inbound SCIM for customers with a SCIM-capable IdP. For SAML, put SATOSA in front. A proof-of-concept container exists in the Kanidm thread.

## 4. Provisioning on JMAP fleets

| Server | Admin surface | Verdict for Workspace console |
|---|---|---|
| Stalwart v1.1.1 (2026-11-16), AGPL-3.0 | JMAP `Account/set` with `sysAccount*` permissions; REST is helpers only. Only the `urn:stalwart:oauth:scope:full` scope reaches administration. SCIM inbound is Enterprise-only (403 without a license). [accounts](https://stalw.art/docs/auth/accounts/manage), [scopes](https://stalw.art/docs/auth/oauth/scopes), [SCIM](https://stalw.art/docs/auth/scim) | Best target, but you must hold a full-admin token per fleet. Tenants and SCIM need Enterprise. |
| Fastmail | User-level JMAP/OAuth only; admin UI manual | Not buildable. |
| Apache James 3.9.1, Apache-2.0 | WebAdmin REST for domains, users, quotas, aliases, groups; JWT-only, off by default. [WebAdmin](https://james.apache.org/server/manage-webadmin.html) | Cleanest OSS API, but JMAP support is still maturing. |
| Cyrus 3.12.5 | cyradm; JMAP docs say "work in progress" | UNVERIFIED for principals and SCIM. |

**What RFC 9670 gives a non-admin:** Principal query/get, subscribe/unsubscribe to shared data, and `shareWith` edits where rights allow. `Principal/set` is defined but expected to be out-of-band, and servers MUST reject disallowed changes. Mailbox sharing is only draft-ietf-jmap-mail-sharing-02 (2026-07-29, Stalwart author). [draft](https://datatracker.ietf.org/doc/draft-ietf-jmap-mail-sharing/)

**Safe to build on:** Stalwart `Account/set` and James WebAdmin.

## 5. Mobile push relay

**Precedent: Bulwark relay.** AGPL-3.0, 26 stars, no tagged release. It stores device tokens and hashes only, "No server URL, no mail content". It forwards FCM, APNs, Web Push and UnifiedPush. [repo](https://github.com/bulwarkmail/relay)

**Server constraints:**
- **Stalwart:** "accepted only for a public https URL", private and loopback refused, 15 subscriptions per account, 4 KiB cap, VAPID supported. [push](https://stalw.art/docs/http/jmap/push)
- **Fastmail:** webhook push supported; limits UNVERIFIED.
- **Server to browser, no relay:** RFC 9749 lets the server POST straight to a Web Push service. [RFC 9749](https://www.rfc-editor.org/rfc/rfc9749)
- **Content in push:** draft-ietf-jmap-emailpush-05 (2026-11-15, Fastmail author) carries Email fields only when client keys are set. [draft](https://datatracker.ietf.org/doc/draft-ietf-jmap-emailpush/)

**iOS limits (VERIFIED, [Apple](https://developer.apple.com/tutorials/data/documentation/usernotifications/pushing-background-updates-to-your-app.json)):**
- Silent pushes: "don't try to send more than two or three per hour"; the system keeps only the newest held one.
- Notification Service Extension: about 30 seconds; requires `mutable-content: 1` and an alert. [Apple](https://developer.apple.com/tutorials/data/documentation/usernotifications/modifying-content-in-newly-delivered-notifications.json)
- Design: send visible alerts with a generic body, then fetch and decrypt inside the extension.

**Google-free Android:** ntfy's F-Droid build has no Firebase and uses a foreground service. Without it, "messages may arrive with a significant delay". [ntfy](https://docs.ntfy.sh/subscribe/phone/)

**Relay must never see:**
- JMAP credentials; the client creates the `PushSubscription` itself.
- Content: either state strings only, or emailpush encrypted to client keys.
- Sender addresses.
- Account email as a label (Bulwark does this, and it is "readable to Google and Apple").

**Native APNs/FCM for third-party JMAP clients:** none found (UNVERIFIED-negative).

**Recommendation:**
- One Zelva relay for every tier, strictly opt-in, storing only a device token, a random account id and timing.
- A self-hosted relay cannot serve the official apps, because APNs keys and FCM credentials are team-scoped (from general knowledge, not re-verified).
- **Free tier:** web uses direct Web Push where the server supports it; Android de-Googled uses UnifiedPush; otherwise foreground sync.
- **Pro/Workspace:** the same relay with a workspace kill switch.

## 6. Payments, licensing, stores

- **Apple 3.1.1:** in-app purchase is required to unlock features, and apps "may not use their own mechanisms… such as license keys". [guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **US storefront:** buttons and external links need no entitlement.
- **Rest of world:** a region-limited entitlement.
- **3.1.3(c):** Workspace, sold only to organizations, may use external purchase.
- **Small Business Program:** 15% under $1M. [SBP](https://developer.apple.com/app-store/small-business-program/)
- **Japan (iOS 26.2+):** alternative payments 21%, link-outs 15%. [Japan](https://developer.apple.com/support/payment-options-on-the-app-store-in-japan)
- **EU (from 2026-10-01):** 26% / 20% / 15%; Small Business rates 15% / 10%. [Apple](https://www.apple.com/newsroom/2026/08/apple-announces-changes-for-apps-in-the-european-union)
- **Google Play Billing Choice** (US, UK, EEA): alternative billing or web links alongside Play Billing. Service fee 10% on the first $1M and on subscriptions; 5% billing fee only when Play Billing is used. [blog](https://android-developers.googleblog.com/2026/06/play-expanded-billing.html), [US program](https://support.google.com/googleplay/android-developer/answer/16497028?hl=en)

| Merchant of record | Fee |
|---|---|
| Paddle | 5% + 50¢ [source](https://www.paddle.com/pricing) |
| Polar | 5% + 50¢; Pro $20/mo at 3.8% + 40¢ [source](https://polar.sh/docs/merchant-of-record/fees) |
| Creem | 3.9% + 40¢, no international fee [source](https://www.creem.io/pricing) |
| FastSpring | quote only [source](https://fastspring.com/pricing/) |
| Stripe Managed Payments | +3.5% on top of payments fees [source](https://stripe.com/pricing) |

At a $5 price, 5% + 50¢ is about 20%.

**Offline licenses:**
- **Format:** Ed25519-signed entitlement tokens with `kid` rotation. The public key is embedded in the app.
- **Claims:** plan, expiry, device cap.
- **Activation:** counted online, with offline grace.
- **iOS:** never surface it as "enter license key".

**Tauri billing:** only the community plugin `tauri-plugin-iap` (MIT, v0.10, 84 stars; StoreKit 2, Play Billing v9, Microsoft Store). [repo](https://github.com/Choochmeque/tauri-plugin-iap)

**Windows signing:**
- **Artifact Signing:** Basic $9.99/mo for 5,000 signatures. Individuals must be in the US or Canada. [pricing](https://azure.microsoft.com/en-us/pricing/details/artifact-signing), [quickstart](https://learn.microsoft.com/en-us/azure/artifact-signing/quickstart)
- **SmartScreen:** reputation is not immediate, and a March 2026 CA rotation caused warnings (secondary).

**macOS:** notarisation is mandatory for Developer ID distribution, with hardened runtime. [Apple](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)

**Flathub:** content must be redistributable; proprietary is allowed (search summary, docs page 404).

**VAT:**
- **Direct sales:** use a merchant of record.
- **DIY:** non-EU sellers owe EU VAT from the first sale via OSS, with no threshold (search summary).
- **Store sales:** Apple and Google handle VAT (UNVERIFIED).

## 7. Sync of client state

- **Scheduled send:** RFC 8621 `sendAt` is capped by `maxDelayedSend`.
- **Stalwart:** advertises 30 days but defaults to a 7-day hold, so dates are rejected. [thread](https://support.stalw.art/t/make-jmap-maxdelayedsend-configurable/1605)
- **Fastmail:** scheduled send exists in the UI; its JMAP exposure is UNVERIFIED.
- **Snooze:** draft-ietf-extra-email-snooze-00 is expired and parked. [datatracker](https://datatracker.ietf.org/doc/draft-ietf-extra-email-snooze/)
- **No standard custom metadata exists for arbitrary JMAP objects.**

**Free-tier design (no Zelva backend):**
- **Labels and read state:** custom keywords and `$seen`.
- **Snoozes, send-later and follow-ups:** one small signed JSON record in a hidden "Zelva" mailbox, synced through normal `Email/changes`.
- **Export:** the same file.
- **Send-later:** `sendAt` where supported, otherwise the client schedules it.

**Pro:** the same document, end-to-end encrypted to a key held in the OS keystore, with device approval; the server stores ciphertext only.

## 8. Distribution

| Host | Price | Notes |
|---|---|---|
| Cloudflare R2 | $0.015/GB-month; zero egress | Class A $4.50/M, Class B $0.36/M; 10 GB free. [pricing](https://developers.cloudflare.com/r2/pricing/) |
| Bunny | $0.005/GB (volume tier) | No request fees. [pricing](https://bunny.net/pricing/) |
| Backblaze B2 | $6.95/TB/month | Egress free up to 3× storage. [pricing](https://www.backblaze.com/cloud-storage/pricing) |
| Hugging Face Hub | free, "best-effort" | 5,000 resolve requests per 5 min per user token; 500 GB per file. [limits](https://huggingface.co/docs/hub/storage-limits), [rates](https://huggingface.co/docs/hub/rate-limits) |

- **Use Hub for model files only**, as a secondary mirror.
- **Tauri updater:** a static JSON file on R2 or Bunny, with mandatory minisign signatures given as file contents. Resumable downloads are not documented, so implement HTTP Range plus sha256 yourself. [updater](https://v2.tauri.app/plugin/updater/)

## Recommended architecture

```
FREE TIER (opt-in, zero-knowledge)
  App --(JMAP/IMAP direct)--> user's mail server
  App --Ed25519 license / signed manifest--> R2 static (updates, models, latest.json)
  App --(opt-in) opaque token + random id--> Push relay --> APNs / FCM / UnifiedPush
  App --(opt-in) scrubbed--> OpenPanel + Flagsmith + OpenObserve + GlitchTip (self-hosted, EU)

PRO / WORKSPACE
  Kanidm (Zelva Account, OIDC)  <->  Zelva entitlement DB (plan, devices)
  MoR webhook --> entitlement service --> signed tokens
  E2EE state sync (ciphertext blobs + wrapped keys only)
  Workspace console --full-admin token--> customer Stalwart (Account/set) / James WebAdmin
  Optional: customer IdP --SCIM--> Kanidm; SAML deferred or via SATOSA
```

## Gaps in the three tool choices

1. **Analytics:** no single OSS tool does all four well. PostHog self-host is unsupported, OpenPanel's flag API is unverified, and mobile replay should stay off.
2. **OpenObserve:**
   - Records are immutable, so erasure must happen by prevention.
   - Audit trail, SSO and advanced RBAC are Enterprise-only.
   - No native crash pipeline.
   - HA needs Kubernetes, PostgreSQL and NATS.
3. **Kanidm:**
   - No SAML and no organizations.
   - Self-signup is three weeks old.
   - Admin is CLI/REST only.
   - One Critical and several High advisories in 2026.

## Top risks

1. Promising Fastmail admin provisioning, which has no API.
2. Apple's ban on license-key unlocks outside the US, the EU and Japan, forcing in-app purchase on iOS in most markets.
3. APNs silent-push throttling, which breaks any sync-on-push design that is not a visible alert plus the notification extension.
4. A replay leak of message content if any of the masking rules is skipped.
5. Holding full-admin Stalwart tokens for customer fleets.
6. Margin loss to merchant-of-record fees at low price points.
7. Depending on immature components: Bulwark relay at 26 stars, a pre-1.0 Tauri IAP plugin.
8. Artifact Signing being unavailable to individuals outside the US and Canada.