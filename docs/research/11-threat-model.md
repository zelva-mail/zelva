# 11 · Threat model (architecture stage)

| | |
|---|---|
| Status | Analysis snapshot taken 2026-11-23, before the founder made the decisions. Its SEC and PRIV requirement IDs are carried into PRD-02 unchanged |
| Basis | The planned architecture and the security research of that day |
| Precedence | Where this model conflicts with the decision records in `docs/decisions/`, the decisions win |

All ten of its design questions are addressed in `docs/gap-analysis.md`, section 6; DEC-017, DEC-018, DEC-019 and DEC-055 answer the first three. Two notes for whoever writes PRD-02: DEC-051's web-build key storage is the recorded exception to SEC-07, and one mitigation below is labeled SEC-07 where SEC-06 is meant.

---

**Bottom line**
- Only message content and the webview/IPC boundary let a stranger run code on a user's device. Containment (opaque-origin frame, IPC granted only to the main UI window) matters more than a perfect sanitiser.
- The privacy promise is several independent leak channels. No single control covers them; each needs its own deny-by-default and its own test.
- Three decisions change the architecture rather than configuration: the web build's root of trust, Workspace admin-token custody, and signing-key custody.

## 1. System decomposition

```
[Mail / CalDAV / CardDAV server]
   |  TLS                          B1  server to client (server semi-trusted)
   v
[Rust core: sync, parser, sanitiser, mail-auth, cms, rules, model manager, SQLite+FTS5]
   |  IPC, capability-scoped       B3  UI to core (privileged)
   v
[Shell UI webview]  <- B7  OS: keystore, disk, OS backup, lock screen, deep links, mailto, other apps
   |  srcdoc/blob + postMessage    B4  shell to message frame (untrusted)
   v
[Message iframe: sandbox, CSP default-src 'none', cid: resources]

[Core]  -->  [DoH resolver, OCSP/CRL]              B2  device to third parties
[Mail server] --webhook--> [Push relay] --> APNs/FCM/Web Push --> [iOS notification extension]
[Core]  <-->  [Kanidm, entitlement, E2EE sync store, telemetry SaaS, update/model storage]   B5  device to Zelva
[Workspace console]  -->  [customer Stalwart / James]    B8  post-v1
[CI, Nix build, signer]  -->  [stores, updater]          B9  supply chain
[Hosting origin]                                       B6  web build only
```

**Actors and trust**
- Any sender: unauthenticated, fully controls what reaches the parser and renderer.
- Mail/DAV server: semi-trusted. Sees all mail, can alter anything not end-to-end encrypted, can flood pushes.
- Zelva services (relay, Kanidm, entitlement, sync store): semi-trusted; the design goal is that they cannot learn mail metadata.
- Third parties (push providers, resolvers, CAs, stores, telemetry SaaS): each sees a slice.
- Local OS: trusted for keystore and sandbox (ASSUMPTION: no root or admin malware); untrusted for lock screen, backups, car and watch surfaces.
- Any web page: hostile to the web build, able to fire deep links.
- Customer organization admin (Workspace): controls employees' policy.
- Founder and CI: single point of trust for every service and signing key.

**Assets**

| Asset | Sensitivity | Lives in |
|---|---|---|
| Mail, contacts, calendar, search index | Critical | SQLite and WAL, FTS5, temp files, frame |
| Account credentials | Critical | OS keystore; browser storage on web |
| DB key, device key, E2EE private keys | Critical | OS keystore; browser storage on web |
| Who mails the user, what arrives, when it is read | High (the core promise) | Mail server, relay, resolvers, logs, backups |
| Lock-screen previews | High | Notification shade, watch, car |
| Update, license, and manifest signing keys | Critical | KMS |
| Customer admin tokens (Workspace) | Critical | Console database |
| Device integrity | Critical | Webview, core, parsers |

**Entry points.** Client: message parts of every type, server API responses, push payloads, deep links and `mailto:`, open-with and share targets, drag-drop, clipboard, MDM policy, OAuth redirects. Server side: relay registration and webhook ingestion, OIDC, entitlement, sync blob API, Workspace console.

## 2. Threat register

Sorted by priority. S spoofing, T tampering, I information disclosure, D denial of service, E elevation of privilege. P preventive, D detective. L×I is likelihood × impact.

| # | Pri · STRIDE | Threat, component, attack sketch | Controls | L×I |
|---|---|---|---|---|
| 1 | P0 · I | **Remote content tracks on open** (sanitiser, frame). `img`, CSS `url()`, `@import`, `<base>`, `<a ping>`, SVG `<use>` fetch the sender's URL on open: IP, read time, fingerprint. | P: strip all URL-bearing constructs; CSP `default-src 'none'`; tokenised `cid:` only; remote content by per-sender allow. D: Email Privacy Tester at zero triggers in CI, every platform. | H×H |
| 2 | P0 · T, E | **Sanitiser or parser differential reaches script execution** (ammonia, mail parser, engine). Mutation XSS across SVG/MathML/`<noscript>` parse differences. | P: `sandbox` without `allow-scripts` or `allow-same-origin` gives an opaque origin with no IPC, so a bypass is contained; minimal tag allow-list; pinned, fuzzed parsers. D: CSP violation hook into the core log. | M×H |
| 3 | P0 · E | **Frame-to-shell message abuse** (postMessage). Frame content sends a message the shell treats as a user action. | P: `event.source` equality, per-frame random token, allow-listed types; frame input never reaches core commands. D: test with an injected script in a debug build. | M×H |
| 4 | P0 · E, I | **Webview/IPC origin bypass** (shell). Remote page treated as local through `http://<scheme>.attacker.com`, iframe-initiated IPC, cross-webview payload theft, replaced drag-drop handler, unsandboxed WebKitGTK; shell XSS reaching core commands. | P: Tauri at or above 2.11.6; explicit CSP; capability bound to the main window label; no remote URLs in IPC scope; no SQL, file, or shell plugins for JS; `cid:` handler requires a per-open token (custom schemes are visible to all webviews). D: IPC audit log; test that remote and iframe initiators are refused. | M×H |
| 5 | P0 · I | **Replay and analytics capture mail data** (OpenPanel, GlitchTip, OpenObserve, Flagsmith). A refactor breaks the block list; unlisted surfaces (toasts, dialogs, autocomplete, window title) carry content; config defaults consent on; SDK identity is the e-mail. | P: consent gate in the core's egress layer; closed typed events, no free text; message-rendering components auto-tagged private, capture fails closed; flags cannot change consent or security controls. D: canary test as a release gate. | M×H |
| 6 | P0 · I | **Data remanence and OS backup** (SQLite WAL and free pages, FTS5, temp files, web storage, relay registration). Removed rows persist; Android Auto Backup uploads the database; a removed account keeps firing pushes. | P: per-account key destroyed on removal; `secure_delete`, WAL truncate, VACUUM; backup and transfer exclusion; delete relay registration and server PushSubscription; clear IndexedDB, OPFS, Cache Storage, service worker. D: forensic CI scan for canaries. | H×H |
| 7 | P0 · T, E | **Supply chain** (updater, models, dependencies, CI). A compromised runner holds the updater key; a malicious crate or npm release; a model file exploits the inference runtime's parser. | P: lockfiles with `--locked` and `npm ci`; crate provenance vetting; Actions pinned by hash; reproducible Nix builds on pinned inputs; signing key non-extractable in KMS, CI on OIDC; model hash checked against a signed manifest; inference sandboxed; staged rollouts. D: third-party build verification. | M×H |
| 8 | P0 · S, E, I | **Workspace console holds full-admin tokens** for customer Stalwart servers and calls James WebAdmin. Leak from database or logs; request forgery through the WebAdmin URL; cross-tenant confused deputy. | P: per-tenant encryption with tenant and host bound as authenticated data; egress allow-list to the registered host, private and metadata ranges denied; no bodies in logs; staff passkey plus step-up. D: immutable audit; customer-visible connection log. | M×H |
| 9 | P0 · I, T | **E2EE sync keys and tampered state.** A weak passphrase gives an offline brute-force target; the sync server adds a device or rolls back state; the mail server re-signs the Free-tier hidden-mailbox record to plant a forwarding rule. | P: Argon2id with a strength floor; new devices approved from an existing device by QR comparison; AEAD with a monotonic version bound as authenticated data; record anchored on first device; rules never hard-delete; forwarding rules need explicit creation. D: device list with change alerts. | M×H |
| 10 | P0 · I | **Push relay linkability and abuse.** Derivable account ids allow targeted notification spam; registration overwrite suppresses pushes; stored timing, mail-server IP, and registration IP form activity metadata. | P: 128-bit random client-generated ids, never derived from address or JMAP id; registration bound to a device key; store only token, id, and webhook secret; no IP or URL logging; constant payload (ASSUMPTION: JMAP push carries types only). D: published schema; independent audit. | M×H |
| 11 | P0 · S, I | **Web build: one XSS is mailbox takeover.** Weak token protection; Stalwart co-hosting sends no CSP or nosniff and auto-updates unsigned; extensions read the DOM; query-string tokens leak through logs and Referer. | P: strict CSP without `unsafe-eval`, Trusted Types, minimal pinned dependencies; cookie auth where supported (ASSUMPTION), else short-lived narrow tokens; single-use stream tickets; app subdomain isolated from marketing; "weaker than native" warning. D: opt-in CSP reporting. | M×H |
| 12 | P1 · S, I | **Deep links and `mailto:` from any web page** pre-fill a hidden Bcc, attach a file, point setup or OAuth at an attacker server, or auto-open content. | P: compose fields only; never attachments, credentials, server URLs, or tokens; Bcc shown before send; no auto-send; no account changes by link. D: log invocations. | H×M |
| 13 | P1 · S | **Sender spoofing with false assurance** (mail-auth, cms, UI text). Valid DKIM on a cousin domain; SPF or DMARC taken from server headers; S/MIME badge on partial evidence or an RC-grade `cms` misparse; bidi or homoglyph names. | P: client-side DKIM with alignment; SPF labeled server-reported; never trust `Authentication-Results` alone; graded verdict; badge only with all five S/MIME conditions, else "not checked"; text nodes only. D: report-phishing action. | H×M |
| 14 | P1 · T, D | **Malicious attachments, invitations, vCards.** MIME bombs, pathological CSS, `FREQ=SECONDLY` expansion, invite bombing, remote `ATTACH` or photo fetch, double extensions, push storms. | P: size, depth, part-count, decompression limits; parsing in a capped sandboxed helper; no auto-add, fetch, or reply; opener scheme allow-list and quarantine marks; push backoff. D: crash and hang reporting (opt-in). | H×M |
| 15 | P1 · I | **Notification exposure past the lock screen:** sender, subject, and preview on watch and car surfaces, app-switcher snapshots, screenshots. | P: hidden by default (Android `VISIBILITY_PRIVATE` with a public "New message"; iOS content-protectable payload, verify support); car and watch opt-in; screenshot and recents protection. | H×M |
| 16 | P1 · I | **Side channels.** `_domainkey.<sender-domain>` reaches the resolver; OCSP reveals correspondents; RDAP would expose the contact graph; crash reports carry URLs and error context. | P: user-chosen or oblivious resolver (Oblivious DoH); revocation soft-fail, on demand; no RDAP by default; crash scrubbing with user preview. D: user-visible network log (domain, purpose). | H×M |
| 17 | P1 · I | **AI prompt injection.** A mail instructs the model to draft a reply that BCCs the attacker, call an invoice verified, or emit a malicious link. | P: read-only tools; output as text; no auto-send or auto-open; AI never sets trust indicators. D: machine-generated label (EU AI Act Art. 50). | H×M |
| 18 | P1 · I | **Outgoing metadata leakage.** Message-ID or `cid:` names containing the hostname, Date time-zone offset, X-Mailer, quoted remote content on reply or forward. | P: random domain-less Message-ID; optional time-zone rounding; neutral headers; strip remote URLs on reply and forward. | H×M |
| 19 | P1 · S, I | **Provisioning and OAuth credential capture.** Attacker autoconfig or a captive portal supplies the server; HTTP autoconfig; self-signed-cert habituation. | P: HTTPS with valid certificates only; no bypass without pinning; OAuth in the system browser with PKCE, code exchanged in the core. | M×H |
| 20 | P1 · T | **MDM/GPO policy abuse.** A managed profile forces telemetry, remote content, or an attacker-controlled account onto a personal device. | P: signed, allow-listed schema; policy cannot weaken content security or consent; "managed by `org`" view. D: diff of applied policy. | M×M |
| 21 | P1 · S, E, T | **License and entitlement.** Token replay across devices; entitlement or Kanidm compromise grants or revokes at scale; per-launch check-ins timestamp activity; security features gated by tier. | P: token bound to a device key, expiring, minimal claims; signing key in KMS; security and privacy features never tier-gated. D: anomaly alerts on issuance. | M×M |

**Attack tree A: code execution with mail and credential access**
```
OR  A. Message content
    AND  1. sanitiser/parser bypass        [SEC-01: minimal allow-list, fuzzing]
    AND  2. script runs in the frame       [sandbox: opaque origin, CSP default-src 'none']
    AND  3. frame reaches shell or IPC     [SEC-03, SEC-04]
OR  B. memory bug in a native parser or the inference runtime   [SEC-07: capped sandbox]
OR  C. signed malicious update or model    [SEC-10, SEC-11]  no user-side control exists
OR  D. XSS in the web app shell            [SEC-12]  web build only
```

**Attack tree B: profiling a user**
```
OR  1. tracker fetch on open, click, reply, forward     [SEC-01, SEC-02]
OR  2. telemetry, replay, crash reports                 [PRIV-01 to PRIV-04]
OR  3. relay ids and timing                             [SEC-15]
OR  4. resolver and OCSP lookups                        [PRIV-10]
OR  5. sync-store metadata                              [PRIV-08]
OR  6. device backups and lock screen                   [PRIV-05 to PRIV-07]
OR  7. Workspace console breach                         [SEC-16]
```
Tree B is all OR: each channel is independent, so each needs its own test.

## 3. Privacy abuse cases

| Vector | What leaks, to whom | Preventing control |
|---|---|---|
| Tracker in a message | IP and read time to the sender, on open, click, reply, forward, unsubscribe | Default-deny egress; strip on reply and forward; no read receipt, RSVP, or unsubscribe without confirmation |
| Mail server | Which bodies are fetched and when; seen state; client User-Agent | Full-body prefetch so fetch is not read (ASSUMPTION); optional delayed seen sync; neutral User-Agent |
| Push relay and APNs/FCM/Web Push | Device token, mail-server IP (provider), push timing including the user's own activity | Random ids; minimal stored mapping; no logs; audited; providers inherent and disclosed |
| DNS and revocation lookups | Sender domains through `_domainkey` and `_dmarc`; which correspondents sign with S/MIME | Oblivious DoH or user-chosen resolver; on-demand, soft-fail revocation |
| Zelva endpoints (account, entitlement, updates, models) | E-mail, IP, version, activity timing | Pseudonymous sign-up allowed; long-lived offline tokens; no unique check-in id |
| Sync store | Blob size, count, update times, IP | Ciphertext only; padded, batched uploads; short IP retention |
| Analytics, replay, crash, flags | Content, addresses, search terms, IPs | Consent gate in core egress; closed events; canary test; flags local only |
| Cloud AI | Message content | On-device only unless per-feature opt-in (ASSUMPTION) |
| OS surfaces | Lock screen, watch, car, recents, screenshots, cloud backup | Hidden by default; backup exclusion; crypto-erasure |
| Recipients | Hostname, time zone, client name, the fact a mail was forwarded | Neutral headers; strip remote content on forward |
| Support | Addresses and server URLs in pasted logs | Redacted diagnostics export with preview |

## 4. Requirements for the PRD

**SEC**
- SEC-01 P0: Message HTML renders only in a frame sandboxed without `allow-scripts`, `allow-same-origin`, or `allow-top-navigation`, under `default-src 'none'`. Test: 30 URL-bearing constructs, zero requests leave the device.
- SEC-02 P0: Opening, previewing, notifying, replying, or forwarding must not emit any content-triggered request without a per-sender allow. Test: Email Privacy Tester, zero triggers, every platform.
- SEC-03 P0: The shell accepts a frame message only when source, token, and type all match. Test: an injected script in a debug build is ignored.
- SEC-04 P0: Only the main window holds a capability; remote URLs and other webviews must not reach IPC; Tauri at or above 2.11.6; no SQL, file, or shell plugins for JS; links open only in the system browser over `https:` or `mailto:`. Test: config lint in CI.
- SEC-05 P0: Deep links and `mailto:` accept compose fields only; must not accept attachments, credentials, server URLs, tokens, or account changes; must not auto-send.
- SEC-06 P0: Untrusted parsers (MIME, HTML, CSS, iCalendar, vCard, JMAP JSON, model files) run under size, depth, and time limits; attachments and invitations must not auto-open, auto-add, auto-fetch, or auto-reply. Test: fuzzing, zero hangs over one second.
- SEC-07 P0: Credentials and keys live only in the OS keystore; the app must not run on a plaintext fallback; the local database is encrypted with a keystore-held key.
- SEC-08 P0: Updates and model manifests are signature-verified with pinned keys; signing keys are non-extractable in KMS; CI uses OIDC, not static secrets.
- SEC-09 P0: Builds are reproducible from locked inputs; CI fails on unlocked or unvetted dependencies and on Actions pinned by tag.
- SEC-10 P0: The web build is served with strict CSP, nosniff, HSTS, and `frame-ancestors 'none'`; no third-party scripts on the app origin; no long-lived token in a URL.
- SEC-11 P0: Feature flags, MDM policy, and tier must not change consent, content security, or any SEC or PRIV control.
- SEC-12 P1: A trust badge appears only with the five S/MIME conditions or client-verified DKIM alignment; otherwise "unverified" or "not checked".
- SEC-13 P1: AI tools are read-only and on-device; AI output must not auto-send, auto-open, or set trust indicators; cloud processing only by per-feature opt-in.
- SEC-14 P1: E2EE sync rejects rollback and replay; a new device requires approval from an existing device.
- SEC-15 P1: Relay registration requires a device key; ids are 128-bit random; payloads constant; the relay must not log IPs, addresses, or server URLs.
- SEC-16 P1: Workspace tokens are encrypted per tenant and host-bound, used only against the registered host, audited on every use, never logged.

**PRIV**
- PRIV-01 P0: Zero telemetry requests (analytics, replay, crash, flags, observability) before opt-in and after withdrawal. Test: egress capture on a fresh install.
- PRIV-02 P0: Telemetry events form a closed typed set; free-text fields are rejected at the transport layer.
- PRIV-03 P0: Canary addresses, subjects, bodies, attachment names, and search terms must never appear in outbound telemetry. Test: CI canary run.
- PRIV-04 P0: Replay must not capture anything rendering message or contact data, any input, or the window title; mobile builds must not include replay.
- PRIV-05 P0: Account removal crypto-erases and deletes the database, WAL, caches, temp files, relay registration, and PushSubscription. Test: forensic scan finds zero canaries.
- PRIV-06 P0: OS cloud backup and device transfer must not include the database, preferences, or tokens.
- PRIV-07 P0: Notification content is hidden on lock screen, watch, and car surfaces by default.
- PRIV-08 P0: The sync server stores ciphertext only; keys must not leave the device except by user-chosen recovery.
- PRIV-09 P1: Read receipts, RSVPs, one-click unsubscribe, and remote content are never sent automatically.
- PRIV-10 P1: Sender-auth and revocation lookups are off or batched by default, use a user-chosen or oblivious resolver, and appear in a user-visible network log; no RDAP.
- PRIV-11 P1: Outgoing mail must not contain hostname, local paths, or time zone without opt-in; reply and forward strip remote URLs by default.
- PRIV-12 P1: Zelva Account identity must never be joined to relay ids, sync blobs, or telemetry.
- PRIV-13 P1: Crash reports must not contain request bodies, headers, or addresses; the user previews before sending.
- PRIV-14 P2: AI summaries and drafts are labeled machine-generated (EU AI Act Art. 50).
- PRIV-15 P2: Onboarding states what the mail server, push providers, resolver, and Zelva can each see.

## 5. Open design questions

**Assumptions this model rests on**
- ASSUMPTION: The Rust core owns all network I/O and secrets; the UI holds no raw tokens.
- ASSUMPTION: The client opens no listening port; push arrives only through platform channels.
- ASSUMPTION: On-device AI is the default and has read-only access.
- ASSUMPTION: Zelva Account is not an identity for mail providers, and mail itself is not end-to-end encrypted; "E2EE" covers client state only.
- ASSUMPTION: FTS5 stores terms in plaintext, so app-level AEAD cannot protect search data; file-level encryption is required.
- ASSUMPTION: Full-body prefetch for offline search is intended.
- ASSUMPTION: Any shell choice still uses the system webview for messages.
- ASSUMPTION: iOS `content-protectable` and car-surface exclusion behave as documented.

**Questions, ordered by security impact**
1. **Web build root of trust.** Who hosts the app code? Zelva-hosted makes Zelva the code-trust root for every web user's mailbox; mail-server co-hosting inherits Stalwart's unsigned auto-update. May sync keys live in a browser at all?
2. **Workspace admin-token custody.** Hold full-admin tokens (Zelva can read every customer mailbox and becomes a top-tier target), require a customer-side agent with a scoped role, or have the customer self-host the console? The tenancy model must be fixed before v1.
3. **Signing key custody.** KMS-held, on a laptop, or in CI secrets? This decides whether a runner compromise becomes a malicious signed update.
4. **Relay data model.** Exactly what is stored, for how long, and whether timing is persisted. Publish it.
5. **Sender-auth and revocation defaults.** Always-on DoH (which resolver, oblivious or not), on-demand, or server-reported only. This trades resolver leakage against badge value.
6. **E2EE recovery.** No recovery, a passphrase, or a key stored in Zelva Account (which breaks the claim). Also: the trust anchor for the Free-tier hidden-mailbox record.
7. **Message frame delivery.** A separate IPC-less webview or an iframe inside the privileged UI webview? Response-header CSP through the custom scheme or a `<meta>`? How do link clicks leave a script-free frame? How do notifications fetch content while the device is locked?
8. **Telemetry architecture.** DOM-capture replay at all, or semantic-only events? May a Workspace admin consent for employees? Is Flagsmith in the privacy-critical path?
9. **AI runtime and tools.** Which inference engine (memory safety), sandbox level, tool set, any cloud fallback?
10. **Shell choice and body fetch strategy.** A native Rust framework that still embeds the system webview inherits the same surface with less-audited IPC glue; re-derive SEC-01 to SEC-04 for whichever is chosen. Full prefetch hides per-message reads from the server; lazy fetch does not.

## 6. Top 8 risks

| # | Risk | Mitigation that breaks the most paths | Residual |
|---|---|---|---|
| 1 | Code execution from message content (T1–T4, T14) | Layered containment: opaque-origin frame, CSP none, IPC for the main window only, parsers in a capped sandbox | Engine zero-day, bounded by engine patch speed |
| 2 | Web build mailbox takeover through XSS (T11) | Strict CSP, Trusted Types, minimal dependencies, short-lived narrow tokens | High; must be documented as weaker than native |
| 3 | Telemetry leaks mail content (T5, T16) | Consent gate in core egress, closed events, canary test as release gate | Low while tests stay green |
| 4 | Malicious signed update or model (T7) | KMS-held key, OIDC CI auth, reproducible builds, staged rollout | The founder's identity is the root |
| 5 | Customer-wide mail compromise through the Workspace console (T8, T20) | Avoid full-admin tokens if possible; host-bound encryption; egress allow-list; audit | Depends on question 2 |
| 6 | Loss or rollback of synced state (T9) | Device-approved enrollment, monotonic versions, passphrase strength floor, explicit recovery choice | User-chosen passphrase |
| 7 | Metadata leakage to Zelva and third parties (T10, T16, T18) | Random ids, no logging, oblivious resolver, on-demand revocation, neutral headers | Mail server and push providers are inherent |
| 8 | Recovery of mail after removal, from backups or the lock screen (T6, T15) | Crypto-erasure, backup exclusion, hidden notifications | OS-level malware, out of scope |

Next step: decide questions 1 to 3, write the SEC and PRIV IDs into the PRD, then run `sec-auditor` on the first renderer, IPC, and relay prototypes.