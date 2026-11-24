# 01 · JMAP ecosystem map

| | |
|---|---|
| Status | Research snapshot taken 2026-11-23. Not a living document |
| Method | Research agent reading primary sources: RFC Editor, IETF Datatracker, IANA, vendor documentation, GitHub |
| Labels | `[S#]` points to the source list at the end. **UNVERIFIED** marks memory, search snippets or inference |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-003 (JMAP first), DEC-009 (CalDAV/CardDAV alongside JMAP), DEC-010 (capabilities come from the server's report), DEC-011 (Fastmail and Stalwart certified equally).

---


Tags [S#] point to the source list at the end. Anything marked **UNVERIFIED** is from memory, a search snippet I did not open, or inference.

## Corrections to the brief's assumptions

- **RFC 8985 and RFC 8986 are not JSCalendar.** They are RACK-TLP (TCP) and SRv6. JSCalendar is RFC 8984 only [S10].
- **There is no bis draft for RFC 8620 or 8621.** The WG document list has no core/mail item, and the bis URLs return 404 [S2].
- **JMAP Calendars is not an RFC.** draft-ietf-jmap-calendars-34 is in the RFC Editor queue and depends normatively on the JSCalendar 2.0 draft, not RFC 8984 [S11].
- **The legacy-model problem is contacts, not calendars.** The only WG calendar model has always been `Calendar`/`CalendarEvent` on JSCalendar. The pre-RFC contacts model was `Contact`/`ContactGroup`, for which jmaplib keeps separate Fastmail and Cyrus namespaces [S44].

## A. Specification inventory

**Working group:** JMAP, IETF ART area, chairs Bron Gondwana and Jim Fenton, state Active [S1]. Upcoming milestones: S/MIME sender extensions (Dec 2026), Filenode (Nov 2026), email push (Oct 2026), Tasks (Mar 2027) [S1]. CALEXT (JSCalendar/JSContact) is also Active [S58].

All RFCs below are Proposed Standard. Capability strings are from the IANA registry [S3] unless noted.

| Spec | Date | Capability | Client-visible function |
|---|---|---|---|
| RFC 8620 core [S4] | 2019-07, updated by RFC 9404 and 9670 | `urn:ietf:params:jmap:core` | Session, batching, `Foo/get|set|changes|query|queryChanges|copy`, upload/download, `PushSubscription/get|set`, EventSource |
| RFC 8621 mail [S5] | 2019-08, updates RFC 5788 | `…:mail`, `…:submission`, `…:vacationresponse` | Mailbox, Thread, Email, EmailSubmission, Identity, SearchSnippet, VacationResponse; `Email/parse`, `Email/import`, `Email/copy` |
| RFC 8887 WebSocket [S59] | 2020-08 | `…:websocket` (`url` is `wss://`, `supportsPush`) | Requests, responses and push over one socket |
| RFC 9007 MDN [S3] | 2021-03 | `…:mdn` | Parse and send read receipts (method detail UNVERIFIED) |
| RFC 9219 S/MIME verify [S3] | 2022-04 | `…:smimeverify` | Signature verification status on Email |
| RFC 9404 Blob [S3] | 2023-08 | `…:blob` | `Blob/copy|get|lookup|upload`; to be obsoleted by `blob2` |
| RFC 9425 Quotas [S3] | 2023-06 | `…:quota` | `Quota/get|changes` |
| RFC 9610 Contacts [S12] | 2024-12 | `…:contacts` | `AddressBook`, `ContactCard` (JSContact Card); groups are cards with `kind: "group"` plus `members`; no parse method found in the RFC text I read |
| RFC 9661 Sieve [S3] | 2024-09 | `…:sieve` | Manage and validate Sieve scripts |
| RFC 9670 Sharing [S3] | 2024-11, updates RFC 8620 | `…:principals`, `…:principals:owner` | Principal, ShareNotification, `shareWith`/`myRights` |
| RFC 9749 VAPID [S6] | 2025-03 | `…:webpush-vapid` (`applicationServerKey`) | Server signs push POSTs per RFC 8292 |

**JSContact (CALEXT):**
- RFC 9553 (JSContact), RFC 9554 (vCard extensions), RFC 9555 (vCard conversion) [S7].
- RFC 9982, "JSContact Version 2.0" (May 2026), makes `uid` optional and updates 9553 and 9555 [S8].
- RFC 10050 defines protocol-specific profiles (Sep 2026) [S9].
- In progress: draft-ietf-calext-rfc9555bis-03 and vcard4-bis [S58].

**JSCalendar (CALEXT):**
- RFC 8984 (Jul 2021) is the only RFC [S10].
- In working-group last call until 2026-11-26: draft-ietf-calext-jscalendarbis-23 ("JSCalendar 2.0", obsoletes 8984 with backwards-incompatible changes) and draft-ietf-calext-jscalendar-icalendar-30 (iCalendar conversion) [S10].
- No iCalendar conversion RFC exists.

**Active JMAP drafts** [S2][S13]:

| Draft (rev, date) | Capability | Adds |
|---|---|---|
| jmap-calendars-34 (in RFC Ed queue) [S11] | `…:calendars`, `…:calendars:parse`, `…:principals:availability` | Calendar, CalendarEvent, ParticipantIdentity, CalendarEventNotification; iTIP via `sendSchedulingMessages`; `Principal/getAvailability` |
| jmap-blobext-05 (2026-11-18) | `…:blob2` | `Blob/set|get|lookup|convert`; obsoletes RFC 9404 |
| jmap-conditional-03 | `…:conditional` | `ifUnchangedBy`, `atomic` on `/set` |
| jmap-emailpush-05 | `…:emailpush` | Push payloads with message content and mailbox counts |
| jmap-filenode-22 | `…:filenode` | FileNode (File, Directory, SymLink) |
| jmap-mail-sharing-02 | `…:mail:share` | `Mailbox.shareWith`, `mayShare` |
| jmap-metadata-05 | `…:metadata` | `metadata` / `privateMetadata` properties |
| jmap-object-history-04 | `…:object-history` | Version history and restore |
| jmap-refplus-02 | `…:refplus` | Result references inside `/set` and filters |
| jmap-smime-sender-extensions-05 | `…:smime-advanced` | Sign, encrypt, `Email/smimeDecrypt` |
| jmap-tasks-07 | `…:tasks`, `…:tasks:parse` | TaskList, Task, TaskNotification |

- **Expired:** JMAP Essential Profile, portability-extensions, REST mapping [S2].
- **Individual drafts:** `draft-gulbrandsen-jmap-ai-00` (JMAP for AI, relevant to on-device AI) [S2].
- **Related IETF work:** RFC 9698 JMAPACCESS lets an IMAP server hand out the JMAP session URL [S14]. RFC 9979 (Informational, May 2026) registers keywords such as `$maskedemail`, `$muted`, `$hasattachment` [S15].
- **Not found as drafts:** extra search filters, contact groups beyond RFC 9610, or SMTP submission extensions. Vacation is RFC 8621 only.

## B. Server and provider matrix

| Server | JMAP support | Auth | Push | Sieve | Contacts / calendars |
|---|---|---|---|---|---|
| **Fastmail** (hosted) [S18] | Core, mail, submission, vacation, contacts (RFC 9610), masked email. No JMAP calendars: "as soon as the specification is finalized" | API tokens as Bearer (not on Basic plan) or OAuth with manual client registration | EventSource [S54]; no WebSocket (community-reported) [S22] | Not via JMAP [S22] | RFC 9610 model documented; jmaplib still ships a legacy Fastmail namespace [S44] |
| **Stalwart** (self-hosted, v1.1.1, 2026-11-16) [S25] | Every capability in section A except smimeverify, smime-advanced, tasks, blob2 [S23] | OAuth with dynamic registration, OIDC, PKCE, device code; app passwords; API keys [S26][S28][S29] | EventSource, WebSocket, PushSubscription with RFC 8291 encryption and VAPID [S30] | Yes (RFC 9661) | RFC 9610 plus calendars draft (tracked to -33), JSCalendar -22, filenode [S25] |
| **Cyrus IMAP** (self-hosted, 3.12.5) | RFC 8620 except PushSubscription; 8621, 8887, 9404, 9425, 9661. Calendars, contacts, sharing and MDN "in development". Tasks and RFC 9219 not implemented [S38] | **UNVERIFIED** (Basic plus OAuth via SASL from memory) | EventSource, WebSocket; no PushSubscription [S38] | Yes | Contacts listed as draft; jmaplib has a legacy Cyrus namespace [S44] |
| **Apache James** (self-hosted, 3.9.1) | RFC 8620/8621 (partial, annotated), 8887, PushSubscription, MDN, quota; Blob/copy and VAPID in unreleased master [S41] | JWT, Basic, XUser/OIDC [S40] | EventSource, WebSocket, PushSubscription, VAPID (unreleased) | Server-side only; no JMAP Sieve | None: contacts and calendars rejected on 3.9.0 [S22] |
| **Twake Mail / tmail-backend** (Linagora, James-based) | RFC 8620, 8621, 8887, 9007 plus vendor extensions [S42] | Basic, JWT, OIDC | WebSocket, Firebase push [S43] | Filters extension | "We do not plan to add support for JMAP Contact and JMAP calendar" [S42] |

**No JMAP found:**
- **Dovecot:** no version has it (mailing-list statement seen only as a search snippet; UNVERIFIED URL). Dovecot-based stacks (mailcow, iRedMail, Poste.io) therefore lack it; Poste.io's changelog through 2.5.26 does not mention JMAP [S46].
- **mailbox.org:** only a user feature request with no staff reply [S47].
- **Infomaniak:** official FAQ lists IMAP, POP3 and SMTP only [S48].
- **Zimbra:** no JMAP in official 10.x material (search-level).
- **mox:** JMAP is on the roadmap only [S50].
- **Group-Office:** its "JMAP API" is a module API with API keys, not an RFC 8620/8621 mail server [S51].
- **Thundermail (Mozilla):** "includes support for JMAP" [S49]; third-party access is undocumented (UNVERIFIED).
- **Not individually checked:** BlueMind, Open-Xchange, Posteo, Runbox, Rackspace, Murena.
- **Gmail, Outlook.com/Microsoft 365, Yahoo, Zoho, iCloud, GMX, Proton, Tuta:** no JMAP for third-party clients. This is inferred from their official docs listing IMAP/POP/SMTP or proprietary APIs, plus open feature requests at Zoho [S52] and Proton [S53]. No vendor statement saying so was found.

User-base figures were not found for any server; treat all as unpublished.

## C. Onboarding and discovery

- **RFC 8620 §2.2:** look up SRV `_jmap._tcp.<domain>`, then fetch `https://<host>[:port]/.well-known/jmap` following redirects; otherwise try `https://<domain>/.well-known/jmap` [S4]. RFC 6186 defines the IMAP/submission SRV names, not `_jmap`.
- **Fastmail:** the session is at `https://api.fastmail.com/jmap/session` [S18]. I fetched `/.well-known/jmap` unauthenticated and got HTTP 401, so the endpoint exists.
  - API tokens carry scopes: read-only, Email, Email submission, Contacts, Masked Email [S19].
  - OAuth is authorization code with mandatory PKCE S256. Clients are "registered manually by contact with Fastmail developers", so there is no dynamic registration [S18].
  - Scopes are `urn:ietf:params:jmap:core` (required), `:mail`, `:submission`, `:vacationresponse`, `:contacts`, and `https://www.fastmail.com/dev/maskedemail` [S18].
  - Refresh tokens are single-use, and each device needs its own authorization [S18].
  - Rate limits are not published; masked-email creation can return a `rateLimit` SetError [S18].
- **Stalwart:**
  - `/.well-known/jmap` redirects to `/jmap/session`; it also serves Mozilla autoconfig, Microsoft Autodiscover and PACC at `<mechanism>.<domain>` [S34].
  - Dynamic registration is `POST /auth/register` with no credentials [S26]. PKCE S256 and device code are supported.
  - Scopes are `urn:ietf:params:oauth:scope:mail|contacts|calendars|files` [S27].
- **Draft autoconfig (mailmaint WG):** draft-ietf-mailmaint-autoconfig-07 defines an `incomingServer` type `jmap` [S16]. draft-ietf-mailmaint-pacc-04 serves `https://ua-auto-config.{domain}/.well-known/user-agent-configuration.json`, DNS-TXT-verified, and requires dynamic client registration [S17].
- **IMAP fallback:** RFC 9698 `GETJMAPACCESS` returns the session URL [S14]; Cyrus 3.12 implements it [S39].
- **Practical:** a provider allowlist is still needed, because Fastmail requires a registered client ID.

## D. Vendor extensions

**Fastmail Masked Email** [S18]:
- **Capability:** `https://www.fastmail.com/dev/maskedemail`.
- **Methods:** `MaskedEmail/get` (`ids: null` fetches all) and `MaskedEmail/set`.
- **Properties:** `id`, `email`, `state`, `forDomain`, `description`, `lastMessageAt`, `createdAt`, `createdBy` (server-set), `url`, `emailPrefix` (create-only, at most 64 characters, `[a-z0-9_]`).
- **States:** `pending`, `enabled`, `disabled` (mail goes to trash), `deleted` (bounced). Pending addresses are deleted after 24 hours and are auto-enabled when mail arrives. Nothing can return to pending.
- **Plans:** listed on Individual, Duo, Family and Business Basic, Standard and Professional [S20]. The help page says API tokens are unavailable on Basic plans [S19], which conflicts with Business Basic including the feature; confirm with Fastmail.

**Stalwart:**
- `urn:stalwart:jmap` is the management API, with `x:`-prefixed methods (for example `x:Account/get`, `x:Role/set`) [S35].
- Masked email is `x:MaskedEmail/get|set|query` with `enable` (Boolean), `expiresAt` and `emailDomain`. It is not compatible with Fastmail's schema, and the support forum says it is Enterprise-only [S35][S36].
- Per the support forum, Stalwart also has `urn:stalwart:oauth:scope:security|settings|full`; I found no other `https://stalw.art/jmap/...` URIs.

**James:**
- `urn:apache:james:params:jmap:mail:identity:sortorder` [S41].
- `urn:apache:james:params:jmap:mail:shares` [S42].

**Cyrus:** extra `Email/query` filters `messageId`, `references`, `inReplyTo` [S39]. No capability URN found.

**Twake Mail** [S42][S43]: `com:linagora:params:jmap:firebase:push`, `…:ws:ticket`, `…:filter`, `…:labels`, `…:settings`, `…:team:mailboxes`, `…:pgp`, `…:calendar:event`, `…:contact:autocomplete`.

## E. Push in practice

- **Mechanisms (RFC 8620 §7, RFC 8887):** there is no `Event` trigger. The server sends `StateChange` objects, and `PushVerification` before activation [S6].
- **PushSubscription fields:** `deviceClientId`, `url`, `keys` (p256dh, auth), `verificationCode`, `expires`, `types`. This list is from memory; `url`, keys and `verificationCode` are corroborated by Stalwart's docs [S25][S30].
- **VAPID (RFC 9749):** the client reads `applicationServerKey` from the session; the server signs each POST as a JWT per RFC 8292 [S6]. The spec is not browser-only but assumes a Web Push service.
- **Server support:** Stalwart has all three mechanisms plus VAPID, but only accepts public HTTPS push URLs, with `maxPushSize` of 4 KiB by default [S30]. James has all three, VAPID in unreleased master [S41]. Cyrus has EventSource and WebSocket only [S38]. Fastmail has EventSource; PushSubscription is UNVERIFIED.
- **Native mobile:** none of Fastmail, Stalwart, Cyrus or James documents an FCM/APNs relay for third parties. Twake Mail does: `FirebaseRegistration/set` with an FCM token, and the server pushes `StateChange` [S43]. Without such a relay, a native client needs its own small server holding a PushSubscription and forwarding to FCM/APNs (inference).

## F. Interop pitfalls

- **`using` discipline:** Fastmail and James reject the whole request with HTTP 400 `unknownCapability` if `using` names an unsupported capability. This is spec-compliant (RFC 8620 §3.6.1) [S22]. Stalwart drops the capability and fails per method with `unknownMethod` [S27].
- **Capability is not completeness:** "advertising a capability does not mean implementing all of it" [S44].
- **James:** the official docs still say PUSH is unsupported [S40], but the changelog shows PushSubscription since 3.7.0 [S41]. Default caps are `get.max.size` 500 and `set.max.size` 500 [S40].
- **Stalwart:** created objects return only their id [S25]. Identities are server-managed [S32]. A session scoped to an OAuth token lists only the capabilities of its scopes [S27]. Draft revisions move often [S25].
- **Cyrus:** needs `conversations` enabled [S38]; its RFC 5322 mapping is "incomplete" [S37].
- **Browser WebSocket auth:** browsers cannot set an Authorization header on the handshake, which Twake solves with one-time tickets [S42].

## G. Realistic common denominator

1. **Must ship:** RFC 8620, RFC 8621 (mail, submission, vacation), EventSource push, `using` computed from the session, Bearer or Basic auth.
2. **Works on at least two of the big three:** RFC 9610 contacts (Fastmail, Stalwart), WebSocket (Stalwart, Cyrus), RFC 9404 blob and RFC 9425 quota (Stalwart, Cyrus), RFC 9661 Sieve and RFC 9670 sharing (Stalwart, Cyrus).
3. **Stalwart only:** calendars draft, filenode, metadata, emailpush, mail-sharing, VAPID, refplus.
4. **Single-vendor or none:** Fastmail masked email, Twake FCM push, tasks and S/MIME (no server among the four documents them).
5. **JMAP-native calendar is effectively Stalwart-only today**; plan CalDAV or local-first calendar for Fastmail.

## Sources

- S1 https://datatracker.ietf.org/wg/jmap/about/
- S2 https://datatracker.ietf.org/wg/jmap/documents/
- S3 https://www.iana.org/assignments/jmap/jmap.xhtml
- S4 https://www.rfc-editor.org/rfc/rfc8620.html
- S5 https://www.rfc-editor.org/info/rfc8621
- S6 https://www.rfc-editor.org/rfc/rfc9749.html
- S7 https://www.rfc-editor.org/info/rfc9555
- S8 https://www.rfc-editor.org/info/rfc9982
- S9 https://www.rfc-editor.org/info/rfc10050
- S10 https://datatracker.ietf.org/doc/search/?name=jscalendar&rfcs=on&activedrafts=on
- S11 https://www.ietf.org/archive/id/draft-ietf-jmap-calendars-34.html
- S12 https://www.rfc-editor.org/rfc/rfc9610.html
- S13 https://datatracker.ietf.org/doc/draft-ietf-jmap-{blobext,conditional,emailpush,filenode,mail-sharing,metadata,object-history,refplus,smime-sender-extensions,tasks}/
- S14 https://datatracker.ietf.org/doc/rfc9698/
- S15 https://datatracker.ietf.org/doc/rfc9979/
- S16 https://datatracker.ietf.org/doc/draft-ietf-mailmaint-autoconfig/
- S17 https://datatracker.ietf.org/doc/draft-ietf-mailmaint-pacc/
- S18 https://www.fastmail.com/dev/
- S19 https://www.fastmail.help/hc/en-us/articles/5254602856719-API-tokens
- S20 https://www.fastmail.com/pricing/
- S22 https://github.com/stalwartlabs/jmap-client/issues/32
- S23 https://stalw.art/docs/http/jmap/capabilities
- S24 https://stalw.art/docs/development/rfcs
- S25 https://github.com/stalwartlabs/mail-server/releases
- S26 https://stalw.art/docs/auth/oauth
- S27 https://stalw.art/docs/auth/oauth/scopes
- S28 https://stalw.art/docs/auth/authentication/app-password
- S29 https://stalw.art/docs/auth/authentication/api-key
- S30 https://stalw.art/docs/http/jmap/push
- S31 https://stalw.art/docs/email/jmap/websockets/
- S32 https://stalw.art/docs/email/jmap/mail/
- S33 https://stalw.art/docs/email/jmap/limits/
- S34 https://stalw.art/docs/server/clients
- S35 https://stalw.art/docs/ref/object/masked-email
- S36 https://support.stalw.art/t/masked-email-password-manager-integration/246
- S37 https://www.cyrusimap.org/imap/rfc-support.html
- S38 https://www.cyrusimap.org/imap/download/installation/http/jmap.html
- S39 https://www.cyrusimap.org/imap/download/release-notes/3.12/x/3.12.0.html
- S40 https://james.apache.org/server/config-jmap.html
- S41 https://raw.githubusercontent.com/apache/james-project/master/CHANGELOG.md
- S42 https://github.com/linagora/tmail-backend/blob/master/docs/modules/ROOT/pages/tmail-backend/jmap-extensions/index.adoc
- S43 https://github.com/linagora/tmail-backend/blob/master/docs/modules/ROOT/pages/tmail-backend/jmap-extensions/pushWithFirebase.adoc
- S44 https://raw.githubusercontent.com/frappe/jmaplib/main/README.md
- S45 https://jmap.io/software/index.html
- S46 https://poste.io/changelog
- S47 https://userforum-en.mailbox.org/topic/2551-add-support-for-jmap-clients
- S48 https://www.infomaniak.com/en/support/faq/468/understanding-mail-server-ports-and-protocols
- S49 http://blog.thunderbird.net/2025/12/state-of-the-thunder-14-the-2026-mobile-roadmap/
- S50 https://raw.githubusercontent.com/mjl-/mox/main/README.md
- S51 https://www.group-office.com/docs/latest/developer/jmap.html
- S52 https://help.zoho.com/portal/en/community/topic/jmap-new-mail-protocol-light-fast-battery-friendly
- S53 https://protonmail.uservoice.com/forums/284483-proton-mail-calendar/suggestions/36649090-support-jmap
- S54 https://www.fastmail.com/blog/what-we-talk-about-when-we-talk-about-push
- S58 https://datatracker.ietf.org/wg/calext/about/
- S59 https://datatracker.ietf.org/doc/rfc8887/