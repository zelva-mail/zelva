# Gap analysis

| | |
|---|---|
| Date | 2026-11-24 |
| Compares | The founder's brief and the brand blueprint with what the research found |
| Precedence | [The decision records](decisions/README.md) are authoritative. This page explains them |

## 1. Summary

The brief and the blueprint describe a sound product. Four things in them do not survive contact with the research:

- **Servers differ far more than the blueprint assumes.** Stalwart supports nearly every JMAP extension. Fastmail offers mail, contacts and vacation settings only. So Zelva shows what each server reports instead of promising one experience everywhere.
- **Several items on the brief's list are IETF drafts, not standards.** Calendars, object metadata, S/MIME signing, tasks and mail sharing are still drafts, and their data models are changing.
- **Only JMAP providers are reachable.** Gmail, Outlook, iCloud, Proton, Tuta and the Dovecot-based hosting stacks have no JMAP. The vision is therefore framed as "the reference client for JMAP mailboxes first".
- **The scope is too large for dates.** The roadmap is a list of milestones, and Workspace ships after v1.

Everything in the brief has a place: it is in v1, it is shown where a server supports it, or it is deliberately deferred. Nothing was dropped silently.

## 2. The brief, item by item

"PRD" names the requirement document that carries the item. They are listed in [docs/prd/README.md](prd/README.md).

| Item in the brief | Status in v1 | PRD |
|---|---|---|
| JMAP (RFC 8620, 8621) | Required | PRD-01 |
| JSContact | Required (RFC 9610). CardDAV is used where a server does not offer it | PRD-04 |
| JSCalendar | Required. Shown where a server reports JMAP calendars. CalDAV is used otherwise | PRD-04 |
| JMAP for Sieve Scripts | Should. The visual builder is Pro. Device-local rules are used where a server does not offer it | PRD-03 |
| JMAP Blob Management | Should. Hidden unless the server reports it | PRD-01 |
| JMAP for Quotas | Should. Hidden unless the server reports it | PRD-01 |
| JMAP Sharing | Should. Shared mailboxes where a server reports them. Delegation is designed for Workspace | PRD-01, PRD-12 |
| Message Disposition Notifications | Should. Never sent silently | PRD-01 |
| JMAP over WebSocket | Required where a server reports it. Otherwise a streaming event source | PRD-01 |
| VAPID for JMAP Web Push | Should. Only Stalwart reports it today | PRD-07 |
| JMAP Object Metadata | Should where a server reports it. It is a draft, and only Stalwart reports it today | PRD-01 |
| S/MIME and PGP | Required, end to end: verify, decrypt, sign, encrypt | PRD-13 |
| Vendor extensions | Should. Fastmail masked email first. Stalwart masked email later | PRD-01 |
| HTML signature | Required: a rich-text editor and a signature per identity | PRD-01, PRD-11 |
| Smart filtering | Pro: suggestions, rule proposals and the Sieve builder | PRD-03, PRD-05 |
| Advanced spam and phishing protection | Required. Without AI: default rules and traditional filters. With AI: the classifier, which is free, and model-based suggestions, which are Pro | PRD-02, PRD-05 |
| Privacy focused | Required: tracker blocking, no telemetry without consent, encryption at rest and in transit | PRD-02 |
| Easy, automated onboarding | Required: account discovery, token or OAuth sign-in, guided first-run. Admin-side provisioning is designed for Workspace | PRD-06, PRD-12 |
| Cross-platform | Required: six platforms, with the web as a reduced build | PRD-08 |
| Highly resource efficient | Required: set as measurable budgets | PRD-08 |
| Modern UI and UX | Required: flows, design tokens, voice | PRD-11 |
| Zero mails, clean inbox | Required: assist-only triage, default rules, bundles, "All caught up" | PRD-03, PRD-11 |
| Embedded tiny LLM | Replaced by the three-layer design | PRD-05 |
| Rust and Tauri | Confirmed, with a Solid 2 interface | PRD-08 |

## 3. Blueprint statements that changed

| As written | Now | Decision |
|---|---|---|
| Vision: "replace legacy, bloated email clients" | "The reference client for JMAP mailboxes first" | DEC-062 |
| Phase 1 in months 1 to 6, on every platform | Milestones without dates | DEC-037 |
| Success measured by daily active users, a store rating above 4.7, and 4 to 7% conversion | Activated users and retention, a rating of 4.5 or better with 100+ ratings, and 3% of activated users buying Pro by day 90 | DEC-063 |
| Free tier includes a "standard IMAP fallback" | JMAP first. IMAP later, started by a demand signal | DEC-003, DEC-058 |
| Native JMAP support for Fastmail, Stalwart and Cyrus | Each account shows what its own server reports | DEC-010, DEC-011 |
| "Rules run even when the Zelva app is closed" | True where a server offers Sieve over JMAP, which is Stalwart and Cyrus. On Fastmail, rules run on the device while Zelva is open | DEC-005 |
| The Sieve visual builder is the headline Pro feature | It appears where a server offers Sieve. Elsewhere Zelva offers device-local rules and Sieve export, and the pricing page says so | DEC-010, DEC-072 |
| Workspace offers "custom onboarding for Stalwart/Fastmail fleets" | Stalwart and Apache James only. Fastmail has no admin API | DEC-071 |
| Workspace offers "SSO (SAML/OIDC)" | OIDC and SCIM first. SAML later through a bridge, because Kanidm has no SAML | DEC-017 |
| Shared mailboxes and delegated access ship as a Workspace feature | They are designed now and ship after v1, where a server reports sharing | DEC-016 |
| License "AGPLv3 / Apache-2.0" | Apache-2.0 for the core. Pro is source-available | DEC-033, DEC-034 |
| Pro at roughly $4 to $6 a month billed annually | $3 to $4 at launch, then $5 a month billed annually or $8 monthly for new customers | DEC-035 |
| "Plus Jakarta Sans or Inter" | Inter. JetBrains Mono is kept for addresses, headers and rule conditions | DEC-061 |
| Three icon concepts, none chosen | Concept A, the Folded Z-Plane | DEC-041 |
| Palette used as given | Emerald, coral and sky get darker text variants. Danger and warning colors are added | DEC-061 |
| "Built-in tracker and pixel blocking" | Unchanged, with a stricter definition: opening a message must cause no request at all | PRD-02 |
| "S/MIME verification" | Full S/MIME and OpenPGP | DEC-012 |
| "JMAP Object Metadata" as a feature | It is an IETF draft, not an RFC. It is shown where a server reports it | DEC-010 |
| "Embed a custom tiny LLM" | Three layers: checks without a model, a small classifier, and a generative model | DEC-023 |
| "Rust and Tauri", asking for a better alternative | Confirmed after evaluating seven alternatives | DEC-042 |
| "Easy, automated onboarding" | Account discovery, guided first-run, and admin-side provisioning for Workspace | DEC-015 |

## 4. Missing from the blueprint, now covered

| Gap | Where it is covered |
|---|---|
| A way to know what each server supports | DEC-010, and the caveats in section 5 |
| A measurable definition of "zero", and a rule that notifications never hide mail | DEC-004, DEC-045. PRD-00 defines the clean-inbox day; PRD-03 and PRD-07 carry the rest |
| Client state across devices without a Zelva account: local rules, labels and preferences | DEC-047, clarified by DEC-070. PRD-03, PRD-10 |
| Sync of encryption keys between devices | DEC-050. PRD-13 |
| Encryption at rest and in transit, defined | DEC-013, DEC-014, DEC-049. PRD-02 |
| Mobile notifications without Zelva holding credentials | DEC-020, DEC-028. PRD-07 |
| Security and privacy requirements that can be tested | The 31 SEC and PRIV requirements from [the threat model](research/11-threat-model.md), carried into PRD-02 |
| The web build's trust model and limits | DEC-019, DEC-051. PRD-08 |
| Accessibility, translation and right-to-left layout | DEC-056. PRD-08, PRD-11 |
| Selling Pro: stores, merchant of record, VAT, trial, offline licenses | DEC-054. PRD-09 |
| Signing, updates and the integrity of model files | DEC-055. PRD-08 |
| Support: a redacted diagnostics export, and documentation | PRD-08, PRD-10 |
| Legal: trademark clearance, GDPR roles, labeling of AI output | DEC-040. PRD-05, PRD-08 |
| A stance on post-quantum and version 5 OpenPGP keys | Not in v1. PRD-13 |
| A demand signal for IMAP | DEC-058. PRD-06 |
| A sample inbox for reviewers and new users | DEC-067. PRD-06, PRD-11 |

## 5. Four caveats on server-reported capabilities

DEC-010 says the client keeps no table of servers. Four things make that work in practice. PRD-01 and PRD-06 carry them as requirements.

1. **An advertised capability is not proof of a complete implementation.** Fastmail and Apache James reject a whole request that names a capability they do not know. Stalwart fails each affected method instead. Zelva therefore builds every request's capability list from the session, and treats an unknown capability, an unknown method or a rejected property as "not available for this account".
2. **Capabilities belong to an account, not only to a server.** The session lists capabilities for the server and again for each account. A sign-in with limited permissions on Stalwart reports fewer capabilities than an administrator's. The interface uses the account's own list.
3. **Draft extensions move.** JMAP calendars, object metadata, the S/MIME sender extensions and mail sharing are drafts. Their object models change between versions. Zelva parses them tolerantly, behind adapters that can be versioned.
4. **Some things are not reported at all.** CalDAV and CardDAV endpoints are not part of the JMAP session and are discovered separately (DEC-052). Limits such as the longest delayed send a server accepts are discovered by probing or from the server's limits capability.

## 6. Open questions raised during the analysis

The product analysis (note 09), the UX analysis (note 10) and the threat model (note 11) each ended with questions for the founder. All of them are answered except one: whether a Workspace administrator may consent to telemetry on behalf of employees, which waits for PRD-12.

### From the product analysis

| Question | Answer | Decision |
|---|---|---|
| OQ1. Fastmail mobile push | Best effort. Zelva never holds a Fastmail credential | DEC-020 |
| OQ2. May approved rules move mail, and which assist features are free | Yes, once approved. Suggestions that need no model are free. Model-based suggestions are Pro | DEC-004, DEC-005, DEC-022, DEC-074 |
| OQ3. Minimum capability set for the web build | A reduced, published build, also self-hostable beside Stalwart | DEC-019 |
| OQ4. Cross-device state without an account | A signed record in the user's own mailbox. Pro adds encrypted sync | DEC-047 |
| OQ5. Pro code open or closed, and DCO or CLA | Source-available Pro. DCO for the core, a separate agreement for Pro | DEC-033, DEC-034 |
| OQ6. Which DAV servers are certified, and the RSVP fallback | Fastmail in v1. RSVP by email where a server has no scheduling | DEC-057, DEC-064 |
| OQ7. Is generative AI a v1 blocker | No. A beta feature that can slip | DEC-027 |
| OQ8. Pricing mechanics | Lower launch price, then the recommended price for new customers | DEC-035, DEC-054, DEC-060 |
| OQ9. Telemetry and flag polling without consent | Flags ship with releases. Remote flags and replay only with consent | DEC-029, DEC-031, DEC-032 |
| OQ10. Does Fastmail expose any rules API | Not verified. Fastmail gets device-local rules until it is | Section 7 |
| OQ11. Trademark clearance and outreach to Fastmail and Stalwart | Clearance is an early task. Outreach is an early task | DEC-040 |
| OQ12. When IMAP starts | On a demand signal with a number attached | DEC-058 |

### From the UX analysis

| Question | Answer | Decision |
|---|---|---|
| 1. What counts as Priority | Direct mail from people, VIP senders and calendar alerts, chosen during first-run | DEC-045 |
| 2. Are bundles a view only, and are they Pro | An opt-in free view. "Always file this" creates a rule | DEC-005, DEC-007 |
| 3. Is the classifier offered in its own consent step | Yes, as a small opt-in download | DEC-025 |
| 4. Multi-account default, and cross-account search | Two accounts with a switcher. Unified inbox and search are Pro | DEC-046 |
| 5. Are snooze and send later device-local in v1 | They are Pro features, so their state exists only for Pro, synced end to end and encrypted. The free tier's device-local state is local rules, labels and preferences, kept in the user's own mailbox | DEC-047, DEC-070 |
| 6. The push relay in v1 | One opt-in relay for every tier, which stores no content | DEC-028 |
| 7. Is Fastmail OAuth available to third-party clients | Only after Fastmail registers the client. API tokens until then | DEC-065 |
| 8. Platform models as a fallback | Not in v1 | DEC-053 |
| 9. RSVP on Fastmail, and undo after sending | By email where there is no scheduling. Every RSVP is confirmed before sending | DEC-064 |
| 10. Is the analytics opt-in asked in first-run | Yes, off by default | DEC-066 |
| 11. Is a sample inbox needed | Yes | DEC-067 |
| 12. Icon and typeface | Concept A and Inter | DEC-041, DEC-061 |
| 13. The Fastmail token path shown in the sign-in screen | Not verified | Section 7 |

### From the threat model

| Question | Answer | Decision |
|---|---|---|
| 1. The web build's root of trust, and whether keys may live in a browser | A Zelva-hosted origin plus a self-hostable package. Keys are passphrase-protected; S/MIME only if the WASM experiment passes. The residual is accepted and stated: a self-hosted package makes that host's administrator the code-trust root, which PRD-08 discloses to the installing admin | DEC-019, DEC-051 |
| 2. Custody of customer admin tokens | Scoped and customer-controlled | DEC-018 |
| 3. Signing key custody | A KMS | DEC-055 |
| 4. The relay's data model | A device token, a random identifier and a webhook secret. No content. How long the relay keeps anything, and whether JMAP push payloads carry state types only, are settled when the relay is designed in PRD-10; the payload question is also tracked in section 7 | DEC-028. PRD-10 |
| 5. Sender authentication and revocation defaults | On demand only, with the source of each verdict shown | DEC-039 |
| 6. Recovery for encrypted sync | A passphrase. Zelva holds no key. The trust anchor for the free-tier state record — which device's signature key vouches for it — is not yet chosen; PRD-03 settles it | DEC-047, DEC-050 |
| 7. How the message frame is delivered and measured | Design work for the technical design phase. PRD-02 states the requirements it must meet | PRD-02 |
| 8. Telemetry architecture | Opt-in, desktop replay only, mail content blocked. Whether a Workspace administrator may consent for employees is open, and waits for PRD-12 | DEC-029, DEC-032 |
| 9. AI runtime and tools | On-device only, read-only access to mail, no cloud fallback in v1. The inference engine and its sandbox level are settled in PRD-05's design; the threat model's capped-sandbox mitigation depends on it | DEC-021, DEC-053 |
| 10. Shell choice, and whether whole bodies are prefetched | Tauri 2 with Solid 2. Bodies are prefetched within a size limit | DEC-042, DEC-068 |

## 7. Still unverified

Each row is a claim the research could not confirm. The last column names the milestone that settles it. Milestones are defined in [PRD-00](prd/PRD-00-foundations.md).

| Claim | Why it matters | Settled by | Milestone |
|---|---|---|---|
| Fastmail will deliver push webhooks to the Zelva relay | Timely notifications for Fastmail users on phones | Register a webhook against a Fastmail account | Foundation |
| JMAP push payloads carry state types only, no content | The relay's content-blindness rests on this assumption, which the threat model inherited unverified | Inspect live push payloads against Fastmail and Stalwart | Foundation |
| Fastmail offers no rules API at all | Whether server-side rules are possible on Fastmail | Ask Fastmail, and read its current API documentation | Foundation |
| Fastmail handles signed and encrypted mail as the JMAP specification says | OpenPGP and S/MIME on the largest hosted provider | Send and read signed and encrypted mail through a Fastmail account | Foundation |
| Fastmail's calendar and contacts can be discovered automatically, including on custom domains | Calendar for Fastmail users | Run discovery against Fastmail and custom-domain accounts | Foundation |
| Fastmail's calendar and contacts can be reached from a browser | Whether the web build can offer calendar to Fastmail users | Test cross-origin requests against Fastmail's DAV hosts | Foundation |
| S/MIME works when compiled to WASM | S/MIME on the web build | Build the S/MIME code for WASM and run the interop tests | Foundation |
| OpenPanel can delete an individual replay | Honoring a withdrawn consent | Check its deletion interface | Foundation |
| Docker-OSX is usable on the founder's hardware | iOS and macOS development without Apple hardware | Build and run the app on a simulator | Foundation |
| Solid 2's libraries are ready | Risk of blocking on the interface | Build a virtualised list, a router and a rich-text editor with Solid 2 | Foundation |
| Tauri can deliver push, background work and keystore access on iOS and Android | Mobile notifications and encrypted storage | Write and test the native plugins | Foundation |
| Domain-age lookups cover enough country suffixes | The sender check | Measure coverage across a sample of suffixes | Foundation |
| Thundermail's server reports the capabilities Zelva needs | Thundermail as a provider preset | Read a Thundermail session resource | Beta |
| Cyrus reports contacts, calendar and sharing | What Cyrus users get | Read a Cyrus session resource | v1 |

## 8. Traceability

Three kinds of identifier tie the documents together:

- `DEC-###` for decisions, defined in the decision log.
- `SEC-##` and `PRIV-##` for security and privacy requirements, defined in the threat model and carried into PRD-02.
- `FR-<AREA>-###` for functional requirements, defined in the PRD documents.

The documentation check verifies that every identifier is defined once and that every identifier cited anywhere exists. It also verifies that relative links between documents resolve.
