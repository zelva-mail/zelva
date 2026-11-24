# 02 · JMAP clients, competitors and market

| | |
|---|---|
| Status | Research snapshot taken 2026-11-23. Not a living document |
| Method | Research agent reading GitHub, Codeberg, crates.io, npm, Docker Hub, vendor pricing pages and press coverage |
| Labels | **V** read on the primary page or API on the day · **V2** from a search-result summary · **U** unverified |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-035 (pricing), DEC-062 (vision framing), DEC-063 (recalibrated metrics).

---


**Labels:** **V** = read on the primary page or API today · **V2** = from a search-result summary of a named source, page not opened · **U** = UNVERIFIED.

**Method note:** star counts and dates come from the GitHub, Codeberg, crates.io, npm and Docker Hub APIs on the day. Pages that timed out are flagged.

## 1. JMAP clients

There is still no mature, general-purpose, cross-platform consumer JMAP client. 2025–26 produced a wave of Stalwart-centric, mostly single-developer projects, and push is missing or relayed in several of them. I found no independent UI-quality reviews for any of them (U).

| Client | Owner; license | Platforms; stack | JMAP scope | Status 2026 | Mobile push |
|---|---|---|---|---|---|
| Ltt.rs | D. Gultsch; Apache-2.0 | Android; Java | Core and mail (U) | 0.4.4 (2025-04-08); last commit 2026-09-16; 101★; still "proof of concept" ([V](https://codeberg.org/iNPUTmice/lttrs-android)) | U |
| Sterna Mail | emon; GPLv3 | Android; Kotlin/Compose | JMAP, plus IMAP/SMTP; tested on Stalwart | v1.6.8 (2026-11-19), 86 releases, 124★ ([V](https://codeberg.org/emon/sterna-mail)) | JMAP EventSource, IMAP IDLE or UnifiedPush; no FCM |
| Twake Mail | Linagora; AGPL-3.0 | Android, iOS, early web; Flutter | Mail only; calendar and contacts explicitly excluded | Pushed 2026-11-23; 670★; 373 open issues ([V](https://github.com/linagora/tmail-flutter)) | U (`fcm` directory in repo) |
| Boogie | KTP Digital (AU); proprietary | macOS, iOS, iPadOS, watchOS; SwiftUI | RFC 8620 and 8621 "in full" (vendor claim) | v1.4.6, shipping ([V](https://boogie.digital/)) | Optional "Boogie Push" add-on; mechanism U (page timed out) |
| WMail | WOW Media UK; proprietary | iOS and iPadOS (iOS 26+) | JMAP only, Fastmail-centric | Launched 2026-10-02; Pro $3.99/mo ([V](https://wmail.download)) | Not described; snooze is on-device |
| Allodia | Allodia; GPL-3.0 | Six platforms; Rust core | JMAP, IMAP, CalDAV, CardDAV, Gmail, Microsoft | Created 2026-08-26; 26★ ([V](https://api.github.com/repos/allodia-eu/mail-calendar)) | "Coming soon" for Supporters (€20.30/yr) ([V](https://allodia.eu/mail-calendar)) |
| Flectar Mail | Flectar (ES); AGPL-3.0 | Windows, Linux, macOS; experimental Android; Rust | Listed among protocols | Alpha; created 2026-09-03; 1,990★ ([V](https://flectar.com/mail)) | Not described |
| Aria | PolarisMail; U | Six platforms; Kotlin Multiplatform | RFC 8621 | Waitlist, not released ([V](https://www.ariamailclient.com/)) | Not described |
| Mailwell | Solo; proprietary | macOS (Apple silicon) | "Any IMAP or JMAP" | Selling; $59–69 one-time ([V](https://mailwell.app)) | Not applicable |
| Mailtemi | Mailtemi EOOD; closed | iOS, Android | JMAP mail and contacts, IMAP, Graph | Site dated 2023; activity U ([V](https://mailtemi.com)) | Not stated |

**Web clients**
- **Bulwark:** AGPL-3.0, Node, Stalwart-only (0.16.6+); the most complete, with shared mailboxes, policies, scheduled send and Sieve. Mobile apps are beta ([V](https://bulwarkmail.org/)).
- **jmap-webmail:** MIT, TypeScript, 240★, created 2025-12, pushed 2026-09-20 ([V](https://api.github.com/repos/root-fr/jmap-webmail)).
- **ihasmail:** AGPL, Stalwart 0.16+, no AI by design ([V](https://ihasmail.org/)).
- **Frappe Suite:** AGPL-3.0, 124★, marked WIP ([V](https://api.github.com/repos/frappe/suite)).
- **Cypht:** LGPL-2.1, 1,820★, handles IMAP, JMAP and EWS ([V](https://api.github.com/repos/cypht-org/cypht)).
- **Group-Office:** AGPL, 289★ ([V](https://api.github.com/repos/Intermesh/groupoffice)).
- **JMAP Demo Webmail:** MIT, last push 2026-02-02 ([V](https://api.github.com/repos/jmapio/jmap-demo-webmail)).

**CLI and TUI**
- **aerc:** 0.22.0 about three months ago, Go, JMAP backend ([V](https://git.sr.ht/~rjarry/aerc/refs)).
- **meli:** melib 0.9.0 on 2026-11-01 ([V](https://crates.io/api/v1/crates/melib)).
- **jmapcli:** proprietary, macOS ([V](https://jmap.io/software/)).
- **audriga/jmap-cli:** MIT, Dart, pushed 2026-09-25 ([V](https://api.github.com/repos/audriga/jmap-cli)).
- Also listed: mujmap, mjmap, xin ([V](https://jmap.io/software/)).
- No project named exactly "jmap-cli" appears in the official directory; two GitHub repos use that name.

**Not JMAP, despite common assumptions**
- **Roundcube:** pushed 2026-11-23, 7,295★, IMAP-only; the JMAP request has been open since 2017 ([V2](https://github.com/roundcube/roundcubemail/issues/5918)).
- **Apple Mail:** IMAP/SMTP plus the proprietary XAPPLEPUSHSERVICE ([V2](https://news.ycombinator.com/item?id=44836196)).
- **Thunderbird desktop and Android:** no JMAP shipped ([V2]; one search summary claimed Android has it — U). Thunderbird for iOS is in TestFlight on IMAP; JMAP exploration completed September 2026 and full implementation is planned for 2027 ([V](https://github.com/thunderbird/roadmaps-overview/blob/main/docs/ios.md)).
- **eM Client:** reportedly on its 2026 roadmap ([V2](https://forum.emclient.com/t/feature-request-jmap-support-with-native-ios-push-notifications-fastmail/115681)).
- **mailbox.org, Posteo, Infomaniak, Migadu, Zoho:** no JMAP found ([V2](https://userforum-en.mailbox.org/topic/2551); otherwise U).
- **MailMate:** JMAP support not confirmed ([V2](https://freron.com)).

**Server vendors' own web clients**
- **Stalwart:** v1.1.1 (2026-11-16), 16,140★; ships no webmail, webmail is added as a third-party web app ([V2](https://github.com/stalwartlabs/stalwart)).
- **Cyrus:** 3.12.5, no bundled webmail ([V](https://www.cyrusimap.org/)).
- **Apache James:** 3.9.1 (2026-09-25), no bundled webmail ([V](https://james.apache.org/)).
- **mailbox.org:** webmail is Open-Xchange App Suite ([V](https://en.wikipedia.org/wiki/Mailbox.org)).
- **Fastmail:** proprietary webmail only.
- **Thundermail (formerly "Thunderbird Pro"):** JMAP-capable hosting in beta at $6/mo paid annually, 30 GB, hosted in Germany ([V](https://www.tb.pro/)).

## 2. JMAP client libraries

| Language | Library | License | Latest | Assessment |
|---|---|---|---|---|
| Rust | [jmap-client](https://crates.io/api/v1/crates/jmap-client) (Stalwart) | Apache-2.0 OR MIT | 0.4.4, 2026-11-23; 113,663 downloads | De facto standard; full Core, Mail and WebSocket (vendor claim) |
| Rust | melib | EUPL-1.2 OR GPL-3.0+ | 0.9.0, 2026-11-01 | Copyleft |
| Rust | [jmap-rs](https://gitlab.com/jmap-rs/jmap-rs) | MPL-2.0 | 13 commits since 2020; not on crates.io | Dormant |
| TypeScript | [jmap-jam](https://registry.npmjs.org/jmap-jam) | MIT | 0.13.8, 2026-09-24; 94★ | Active, about 2 kb |
| TypeScript | [jmap-kit](https://registry.npmjs.org/jmap-kit) | MIT | 1.0.3, 2026-03-09; 6★ | New |
| TypeScript | [jmap-client-ts](https://github.com/OpenPaaS-Suite/jmap-client-ts) | MIT | npm stuck at 1.0.0 (2022-04-11); repo pushed 2026-11-02; 48★ | Use from source |
| TypeScript | [jmap-js](https://api.github.com/repos/jmapio/jmap-js) | MIT | Last push 2020 | Stale |
| TypeScript | [jmap-yacl](https://registry.npmjs.org/jmap-yacl) | MIT | 1.2.1, 2025-03-06; 12★ | Small; no OAuth or push ([V](https://jmap.io/software/)) |
| Kotlin | [kmp-jmap-client](https://api.github.com/repos/Awesome-Technologies/kmp-jmap-client) | Apache-2.0 | Created 2026-02-17; 2★; last push 2026-04-14 | Immature |
| Swift | [swift-jmap-client](https://api.github.com/repos/kukushechkin/swift-jmap-client) | MIT | 11★; last push 2026-03-17 | Early |
| Dart | [jmap-dart-client](https://api.github.com/repos/linagora/jmap-dart-client) | MIT | Pushed 2026-11-19; 41★ | Mail only |

- Per-spec coverage is documented only for Stalwart's crate; for the rest it is U.
- `frappe/jmaplib` is Python and AGPL-3.0, though the directory labels it TypeScript ([V](https://api.github.com/repos/frappe/jmaplib)).
- The Java library behind Ltt.rs is `iNPUTmice/jmap` ([V](https://jmap.io/software/)).

## 3. Competitors

| Product | Platforms | Price | Triage mechanics | AI | Privacy | Common complaints |
|---|---|---|---|---|---|---|
| Superhuman | All major (U) | Starter $25, Business $33 per user/mo, annual ([V](https://superhuman.com/pricing)); suite Free/Pro exclude Mail ([V](https://superhuman.com/plans)) | Split Inbox, Auto Labels (60+ presets) ([V2](https://help.superhuman.com/hc/en-us/articles/46005636204941-Custom-Split-Inbox)) | Cloud (U); Auto Summaries, Auto Drafts | Stores mail server-side (U) | Price (U); acquired by Grammarly July 2025 ([V2](https://www.reuters.com/business/grammarly-acquires-email-startup-superhuman-ai-platform-push-2025-07-01)) |
| Mimestream | macOS; iOS beta | $4.99/mo, $49.99/yr; no free tier ([V](https://mimestream.com/pricing)) | Labels, inbox categories (U) | None advertised ([V](https://mimestream.com/)) | Direct to Gmail | Gmail-only ([V](https://mimestream.com/)) |
| Spark | iOS, Android, macOS, Windows | Free; Plus $10/mo ($99/yr); Pro $20/mo ($199/yr) ([V](https://sparkmailapp.com/pricing)) | Smart Inbox, Gatekeeper, Set Aside, Mark as Done | Cloud, off by default, credit-metered ([V](https://sparkmailapp.com/pricing)) | Credentials and encrypted snippets on Readdle servers for push ([V2](https://readdle.com/blog/how-we-handle-your-account-information-in-spark)) | Server-side credentials ([V2](https://www.reddit.com/r/privacy/comments/5grsan/do_not_use_the_spark_email_client_by_readdle)) |
| Shortwave | Web and apps (U) | Business $30, Premier $45, Max $120 per seat/mo ([V](https://www.shortwave.com/pricing)); individual Pro ≈$18 (U) | Bundles, Splits, Mark as Done ([V2](https://www.makeuseof.com/shortwave-email-client-inbox-management)) | Cloud, Claude-based ([V](https://www.shortwave.com/pricing)) | Gmail OAuth | Gmail-only ([V2](https://www.pcmag.com)) |
| Canary Mail | macOS, Windows, iOS, Android | Free; Growth $36/yr; Pro+ $100/yr ([V](https://canarymail.io/pricing)) | Inbox Cleaner, snooze, send later (paid) | Copilot from Growth; optional | Claims on-device triage ([V](https://canarymail.io/pricing)) | U |
| eM Client | Windows, macOS, mobile | Free (2 accounts); Personal £42.95/yr or £64.95 once ([V](https://www.emclient.com/pricing)) | Snooze, send later, rules | Add-on included in paid | Local | No JMAP yet ([V2](https://forum.emclient.com/t/feature-request-jmap-support-with-native-ios-push-notifications-fastmail/115681)) |
| Thunderbird | Desktop and Android free; iOS in beta | Thundermail $6/mo ([V](https://www.tb.pro/)) | Tags, unified folders (U) | U | Local; Android has no FCM ([V2](https://support.mozilla.org/en-US/kb/configure-push-email-thunderbird-android)) | Android push dies ([V2](https://github.com/thunderbird/thunderbird-android/issues/6035)) |
| Apple Mail | Apple only | Free | Categories (iOS 18.2), Priority ([V2](https://support.apple.com/guide/iphone/use-categories-iphfe4a36baf/ios)) | On-device ([V2](https://knak.com/blog/apple-intelligence-ios18-2)) | Strong | Mis-sorting, notification inconsistency ([V](https://sixcolors.com/post/2024/12/ios-18-2-mail-is-a-misfire)) |
| New Outlook | Windows, web, mobile | Free ([V2](https://www.windowslatest.com)) | Focused Inbox, snooze, scheduled send | Copilot (U) | Mobile sync runs through Microsoft cloud ([V](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq)) | Ads, Copilot prompts ([V2]) |
| Proton Mail | Web, desktop, mobile | Free; Mail Plus $4.99/mo; Unlimited $12.99/mo ([V](https://proton.me/mail/pricing)) | Filters, labels (U) | Lumo (U) | E2EE; no JMAP (U) | U |
| Tuta | Web, desktop, mobile | Free; Revolutionary €3; Legend €8 per month ([V](https://tuta.com/pricing)) | Labels, rules (U) | U | E2EE; own API (U) | U |
| HEY | Web and apps (U) | $99/yr ([V](https://www.hey.com/pricing/)) | Screener, Imbox, Feed, Paper Trail, Reply Later ([V](https://www.hey.com/features/)) | None | Mail stays with 37signals (U) | No IMAP (U) |
| SaneBox | Add-on for any client | Snack $4.54, Lunch $7.46, Dinner $22.04 per month, paid biyearly ([V](https://www.sanebox.com/pricing)) | SaneLater, SaneNoReplies, SaneBlackHole, Reminders ([V](https://www.sanebox.com/pricing)) | Cloud | Reads mail server-side | Misfiling (U) |
| Clean Email | Web, macOS, iOS, Android | ≈$9.99/mo single account ([V2](https://clean.email/plans)) | Auto Clean, Screener ([V](https://clean.email/plans)) | Cloud ([V](https://clean.email/plans)) | Cloud | U |
| Inbox Zero | Web, desktop, iPhone | Starter $25/user/mo ([V](https://www.getinboxzero.com/pricing)) | AI triage, bulk unsubscribe; open source, 13,098★ ([V](https://api.github.com/repos/elie222/inbox-zero)) | Cloud; self-hostable | Gmail and Outlook | No evidence found of a Resend acquisition (U) |
| Edison Mail | iOS, Android, macOS | Mail+ $14.99/mo or $99.99/yr ([V2](https://play.google.com/store/apps/details?id=com.easilydo.mail)) | Assistant, unsubscribe (U) | Cloud | Sells de-identified data for "commercial purposes" ([V](https://www.edisonmail.com/privacy)) | Data practices (U) |
| BlueMail | All major (U) | Plus ≈$6, Business $8 per user/mo annual ([V2](https://bluemail.me/pricing)) | Clusters (U) | U | U | U |
| FairEmail | Android | Free; GPL-3.0; 4,811★; pushed 2026-11-21; "Maintained and supported" ([V](https://github.com/M66B/FairEmail)) | Filters, folders (U) | None | Direct, no FCM ([V](https://github.com/M66B/FairEmail)) | Dense UI (U) |

**New entrants:** Notion Mail launched April 2025 and shut down 2026-09-22; Notion said more than half of its users managed email without opening the inbox ([V](https://techcrunch.com/2026/06/25/notion-mail-shuts-down-amid-agent-takeover)). Fyxer AI runs about $30–50 per month ([V2](https://fyxer.com)); Cora and Tasklet also appeared ([V2](https://techcrunch.com/2026/06/25/notion-mail-shuts-down-amid-agent-takeover)).

## 4. Validated inbox-zero patterns

- **Swipe triage and snooze** come from Mailbox (2013); the app shut down 2015-12-21 ([V2](https://en.wikipedia.org/wiki/Mailbox_(application))).
- **Bundles:** Inbox by Gmail pioneered them and closed 2019-04-02; bundles never reached Gmail. Smart Reply accounted for 10% of mobile replies by 2016 ([V](https://en.wikipedia.org/wiki/Inbox_by_Gmail)). Shortwave and HEY carry bundles today ([V](https://www.hey.com/features/)).
- **Screener and outbox:** HEY's Screener, Feed and Paper Trail are verified, with notifications off by default ([V](https://www.hey.com/features/)).
- **Follow-up nudges:** Superhuman's Auto Reminders default to "if no reply" and pre-write a follow-up draft ([V2](https://help.superhuman.com/hc/en-us/articles/46005658551053-Auto-Reminders-Auto-Drafts)). Gmail's Nudges are a simple toggle ([V2](https://www.eesel.ai/blog/gmail-nudges-and-follow-up-reminders)).
- **Unread badge:** Apple counts only Primary toward the badge; the rest show dots ([V](https://sixcolors.com/post/2024/12/ios-18-2-mail-is-a-misfire)).
- **"All caught up":** Gmail popularised the empty-state message ([V2](https://www.reddit.com/r/Android)).
- **Onboarding:** no best-in-class onboarding teardown was found (U).

**Adoption data is thin.** SaneBox claims 100,000+ users ([V](https://www.sanebox.com/pricing)); Clean Email says "hundreds of thousands" ([V](https://clean.email/plans)); Notion Mail's number is above ([V](https://techcrunch.com/2026/06/25/notion-mail-shuts-down-amid-agent-takeover)).

**Failure modes**
- Opaque fixed categories that misfile, with all-or-nothing re-categorization per sender; Six Colors wants opt-in, custom categories and per-category badges ([V](https://sixcolors.com/post/2024/12/ios-18-2-mail-is-a-misfire)).
- Server-side classification glitches: Gmail, January 2026 ([V2](https://biz.chosun.com)).
- Notification rules that silently hide mail ([V](https://sixcolors.com/post/2024/12/ios-18-2-mail-is-a-misfire)).

## 5. Mobile constraints

**iOS**
- Background refresh gives 30 seconds per launch, timed from learned usage patterns; silent push is best-effort ([V](https://developer.apple.com/videos/play/wwdc2019/707/)).
- Microsoft's FAQ states that iOS "automatically freezes third-party apps", while native Mail refreshes without restriction ([V](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq)).
- JMAP live push needs an open EventSource or WebSocket; a PushSubscription webhook needs an HTTPS endpoint somewhere ([V](https://stalw.art/docs/http/jmap/push)). Stalwart accepts public HTTPS URLs only, with 15 subscriptions per account.

**Android**
- Foreground service types are mandatory from API 34+ ([V](https://developer.android.com/develop/background-work/services/fgs/service-types)).
- `dataSync` is capped at 6 hours per 24 and cannot start from `BOOT_COMPLETED` for target 35+ ([V](https://developer.android.com/about/versions/15/behavior-changes-15)).
- Background starts are banned since Android 12 except for exemptions such as FCM high priority ([V](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start)).
- Doze suspends network and defers jobs and syncs; the docs now steer to FCM v2 message types ([V](https://developer.android.com/training/monitoring-device-state/doze-standby)).
- High-priority FCM may be downgraded if it does not produce visible notifications, judged over 7 days ([V](https://firebase.google.com/docs/cloud-messaging/android/message-priority)).
- The Android 16 behavior-change page lists no new foreground-service restriction ([V](https://developer.android.com/about/versions/16/behavior-changes-16)).

**How peers get mail in time**

| Approach | Who | Cost |
|---|---|---|
| Vendor cloud watches the mailbox, sends APNs or FCM | Spark ([V2](https://readdle.com/blog/how-we-handle-your-account-information-in-spark)), Outlook mobile ([V](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq)); Edison (U) | Credentials or tokens leave the device |
| Proprietary IMAP push via APNs | Apple Mail with Fastmail ([V2](https://news.ycombinator.com/item?id=44836196)) | Closed to third parties |
| Foreground service plus IMAP IDLE | Thunderbird Android, per-folder and off by default ([V2](https://support.mozilla.org/en-US/kb/configure-push-email-thunderbird-android)); FairEmail ([V](https://github.com/M66B/FairEmail)) | Persistent notification, battery use, OEM task killers |
| Self-hostable content-blind relay | Bulwark: AGPL-3.0, converts JMAP push to FCM, Web Push or UnifiedPush ([V](https://github.com/bulwarkmail/relay)); stores only a push address and label, and iOS requires the hosted relay ([V](https://bulwarkmail.org/docs/features/mobile)) | Small server to run |
| No relay | Sterna uses EventSource, IDLE or UnifiedPush ([V](https://codeberg.org/emon/sterna-mail)) | Foreground service details U |

**Implications for Zelva**
1. "No backend" and timely iOS notifications are mutually exclusive: Boogie ships an add-on, Bulwark runs a relay, Allodia has none yet.
2. The acceptable norm is a minimal relay that sees only state strings, is open and self-hostable, and is opt-in.
3. On Android with Stalwart, UnifiedPush could route pushes straight from the user's server with no Zelva infrastructure. Whether Fastmail accepts arbitrary webhook URLs is U ([V2](https://www.fastmail.com/blog/what-we-talk-about-when-we-talk-about-push)).
4. A persistent listener cannot use `dataSync` under target 35+.
5. Server-side snooze is only a draft (`draft-ietf-extra-email-snooze`, RFC 9979 roles) and there is no `sendAt` ([V2](https://datatracker.ietf.org/doc/draft-ietf-extra-email-snooze)). Without a backend, snooze and send-later live on the device; WMail relies on Fastmail to hold scheduled sends ([V](https://wmail.download)).
6. Sieve over JMAP moves raw script blobs; Stalwart's structured `x:MailRule/set` is vendor-specific ([V](https://stalw.art/docs/sieve/user-scripts)). A visual builder must generate Sieve text itself.

## 6. Market sizing and benchmarks

- **JMAP-capable mailboxes:** no public count exists for Fastmail or mailbox.org ([V](https://en.wikipedia.org/wiki/Fastmail)). The only adoption proxies are Stalwart at 16,140★ and 3.77M Docker pulls ([V](https://hub.docker.com/v2/repositories/stalwartlabs/stalwart/)). Cyrus deployment counts are U.
- **Client share by opens, October 2026:** Apple 75.84%, Gmail 17.02%, Outlook 3.49%, Yahoo 2.25%, Thunderbird 0.13% ([V](https://litmus.com/email-client-market-share)). This is tracking-pixel data, which a privacy-first client does not report.
- **Conversion:** median freemium download-to-paid at day 35 is 2.1%, against 10.7% for hard paywalls. Median trial-to-paid is 42.5% for 17–32-day trials and 25.5% under 4 days ([V](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026)).
- **Pricing fit:** Pro at $4–6 undercuts Spark Plus, HEY ($8.25/mo equivalent) and Fastmail (£4.50/mo annual, [V](https://www.fastmail.com/pricing/)), and is far below Superhuman. Workspace at $8–12 matches BlueMail Business and HEY for Domains ($12).