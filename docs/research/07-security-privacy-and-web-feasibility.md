# 07 · Security, privacy and web-build feasibility

| | |
|---|---|
| Status | Research snapshot taken 2026-11-23. Not a living document |
| Method | Research agent reading RFCs, vendor and server documentation, registries, store policies and crates.io |
| Labels | **[V]** primary page read on the day · **[S]** search summary only · **[U]** not verified |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-013, DEC-014 (encryption at rest and in transit), DEC-019 (web build as a reduced tier), DEC-039 (on-demand sender checks). Its acceptance criteria are carried into PRD-02.

---


Checked 2026-11-23. Shell networking was blocked, so Fastmail's and the self-hosters' live CORS headers could not be probed; the Fastmail row rests on its documentation.

**Labels:** **[V]** primary page read today · **[S]** search summary only, source not opened · **[U]** not verified.

## 1. Can a browser-hosted web app talk to JMAP servers?

**Protocol constraints [V].**
- Every HTTP request must be authenticated, and the event source is "an authenticated GET" ([RFC 8620](https://www.rfc-editor.org/rfc/rfc8620.txt) §1.7, §7.3).
- The spec never mentions CORS and never says how a browser carries credentials on the event source.
- Basic auth is "NOT RECOMMENDED" (§8.2).
- Push sent through a third party must be encrypted with client-supplied keys (§8.7).
- The WASM build's Rust core still uses browser `fetch`, so CORS applies to it as well. Native builds escape this by doing JMAP I/O in the Rust core.

### 1.1 CORS per server

| Server | Foreign origin + `Authorization` | What a self-hoster must do | Source |
|---|---|---|---|
| Fastmail | "Our JMAP APIs are CORS enabled so you can create integrations directly from a web app". OAuth clients declare `clientOrigins` ("A list of origins the client may use to make CORS requests to the token endpoint and JMAP API"). Exact headers, and behavior for unregistered origins: **[U]**. | Nothing on the server. Zelva's production origin must be on a registered client; public-redirect clients register by email (partnerships@fastmailteam.com). | [fastmail.com/dev](https://www.fastmail.com/dev/) **[V]** |
| Stalwart | Off by default. `usePermissiveCors` adds `Access-Control-Allow-Origin: *` and allow-headers `Authorization, Content-Type, Accept, X-Requested-With`. It is all-or-nothing: no origin allow-list. It is forced on in bootstrap and recovery mode. | Admin sets one flag. There is no way to admit only Zelva's origin. | [HTTP settings](https://stalw.art/docs/http/settings), [Http object](https://stalw.art/docs/ref/object/http) **[V]** |
| Cyrus | Only if configured. `httpallowcors` is a wildmat list of origins; "By default, CORS requests are disabled." Preflight returned 401 until the fix of 2025-03-24 (PR #5354). | Add the origin, run a release containing that fix. Auth is Basic or JWT Bearer (`http_jwt_key_dir`). | [imapd.conf](https://www.cyrusimap.org/imap/reference/manpages/configs/imapd.conf.html), [issue #3568](https://github.com/cyrusimap/cyrus-imapd/issues/3568) **[V]** |
| Apache James | Yes, unconditionally on current `master`. Session, API, upload, download, WebSocket and event-source routes set `Access-Control-Allow-Origin: *`, methods `GET, POST, OPTIONS`, headers `Content-Type, Authorization, Accept`, max-age 86400. No config key is documented; only WebAdmin has `cors.enable` / `cors.origin`. First release carrying this: **[U]**. | Nothing, if the deployed version matches master. | `server/protocols/jmap/.../JMAPRoutes.java` (code search) **[V]**; [jmap config](https://james.apache.org/server/config-jmap.html) **[V]** |

### 1.2 Browser auth limits and workarounds

`EventSource` takes only `withCredentials` ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource)) **[V]**. RFC 8887 requires an authenticated handshake and says nothing about browsers ([text](https://www.rfc-editor.org/rfc/rfc8887.txt) §4.1–4.2) **[V]**.

| Technique | Works for | Risk |
|---|---|---|
| Streaming `fetch` with `Authorization` | Event source, API, upload, download | Own reconnection and `Last-Event-ID` logic to write |
| Service Worker header injection | Plain `EventSource` | The token sits in the SW's cache; it only intercepts requests in its scope **[S]** |
| Token in query string | WebSocket on servers that allow it | Server and proxy logs, extensions |
| One-time ticket | WebSocket | Lowest risk of the URL options |
| Cookies | Same-origin only | Third-party cookie blocking, CSRF, and incompatible with `*` CORS |

The one-time ticket design exists in Twake Mail (a James derivative): capability `com:linagora:params:jmap:ws:ticket`, `POST /jmap/websocket/ticket`, "During the next 60s this ticket can be used a single time via query parameters", IP-scoped, revocable by DELETE ([doc](https://github.com/linagora/tmail-backend/blob/master/docs/modules/ROOT/pages/tmail-backend/jmap-extensions/ticketAuthentication.adoc)) **[V]**. Apache James itself has no documented equivalent.

Stalwart's management API accepts a short-lived query-string token for live streams, because "Browsers cannot set an Authorization header on an EventSource connection" ([docs](https://stalw.art/docs/http/api)) **[S]**. For its JMAP WebSocket, discussion #2680 could not be fetched; status **[U]**.

### 1.3 Push in the web build

- **Stalwart** supports all three mechanisms and signs Web Push with VAPID, advertising `urn:ietf:params:jmap:webpush-vapid` ([push docs](https://stalw.art/docs/http/jmap/push)) **[V]**. That capability is RFC 9749, "Use of VAPID in JMAP Web Push", March 2025 ([datatracker](https://datatracker.ietf.org/doc/rfc9749/)) **[V]**.
- **Fastmail**: "no WebSocket" is **[U]**. Detect it at runtime by the absence of `urn:ietf:params:jmap:websocket` in session capabilities. No evidence of VAPID support was found for Fastmail, Cyrus or James.
- **Periodic Background Sync** is "Limited availability" and in Chrome is "granted only to an installed web app", gated by an engagement score ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)) **[V]**. Background Sync is likewise limited **[V]**.
- **Practical path for a Fastmail web user:** event source while the tab is open, plus an RFC 8620 `PushSubscription` pointing at Zelva's relay. The server POSTs to the relay, which sends Web Push. RFC 8620 §7.2 ties the subscription to the credential's lifetime and §8.7 requires client keys, which is what keeps the relay content-blind **[V]**.

### 1.4 Token protection in a PWA

- **Non-extractable `CryptoKey` in IndexedDB** stops raw-key exfiltration from storage only. Any script running in the origin can still use the key, so it does not defend against XSS.
- **WebAuthn PRF** can derive the wrapping key, but PRF evaluation at creation time "may not be supported" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/WebAuthn_extensions)) **[V]**. Keep a passphrase-derived key as the fallback.
- **Safari deletes script-written storage after seven days without interaction**, including IndexedDB and Service Worker registrations. Home-screen web apps keep their own counter ([WebKit](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)) **[V]**.
- **Quotas:** Chromium allows up to 60% of disk per origin and Firefox 10% or 10 GiB. Call `navigator.storage.persist()`, because eviction skips persistent origins ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)) **[V]**.

Fastmail's own token rules are a good model: refresh tokens rotate on every use, reuse revokes the grant, and "You cannot share a refresh token between devices" **[V]**.

### 1.5 Co-hosting on the mail server's origin

- **Stalwart Applications** (0.16.6+ or 1.0) downloads a zip bundle and serves it under its own HTTP listener. A `urlPrefix` such as `{"/webmail":true}` puts the app at `/webmail/`, so "the webmail and JMAP share an origin" and CORS stays off ([Bulwark install doc](https://bulwarkmail.org/docs/deployment/stalwart-app)) **[V]**.
- **Caveats:** Stalwart sends "no Content-Security-Policy and no `nosniff`", and an auto-update URL is fetched with no hash or signature check **[V]**.
- **Cyrus and James** have no app-hosting feature; the admin would serve the static files from a reverse proxy.
- **Fastmail** has no such path.

### 1.6 App shell ↔ message frame

- Set OWASP's rules: exact `targetOrigin`, check `event.origin`, validate `data`, never `eval` it ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)) **[V]**.
- A frame without `allow-same-origin` has an opaque origin, so `event.origin` is `"null"` ([whatwg/html#3585](https://github.com/whatwg/html/issues/3585)) **[S]**. Validate with `event.source === iframe.contentWindow` plus a `MessageChannel` and a per-frame random token.
- With scripts disabled the frame cannot post messages or be measured by the parent. Height must come from a second, script-free, same-origin measuring frame or from a fixed layout.
- `srcdoc` documents inherit the parent's CSP, so the app CSP must admit the `cid:` source. Add a first-in-head `<meta http-equiv="Content-Security-Policy">` with `default-src 'none'` as defence in depth **[S]**.
- Browsers have no custom URI scheme, so `cid:` images must be rewritten to `blob:` or `data:` in the web build. Platform-specific Tauri iframe quirks on WKWebView and WebView2: nothing found, **[U]**.

### 1.7 Verdict

| Server | Verdict | Conditions |
|---|---|---|
| Fastmail | Feasible for the official origin only | OAuth with registered `clientOrigins`, manual approval, push via event source and the Zelva relay, and compliance with the [API Developer Policy](https://www.fastmail.com/policies/api-developer-policy) (no unpublished APIs, no implied endorsement) **[V]** |
| Stalwart | Feasible, best case | `usePermissiveCors`, or co-host under `/webmail`; real Web Push available |
| Cyrus | Feasible | Origin listed in `httpallowcors`; release with the March 2025 preflight fix |
| James | Feasible | Wildcard CORS is built in on master; confirm the deployed release; WebSocket needs a ticket extension |

## 2. "Zero tracking pixels"

**Vectors to block by default.** ammonia 4.2.5's defaults are wrong for mail: `<img>` is allowed, `http`/`https` are permitted schemes and relative URLs pass through ([Builder docs](https://docs.rs/ammonia/latest/ammonia/struct.Builder.html)) **[V]**. A custom policy must neutralise all of these:

- Images: `<img src/srcset/lowsrc>`, `<picture>`, `<source>`, `<input type=image>`, `background` attributes, SVG `<image>` and external `<use>`.
- CSS: every `url()` (background, border-image, list-style, cursor, mask, `@font-face`), `image-set()`, `@import`. This needs a real CSS parser, because regex is defeated by escapes and comments.
- Media: `<video poster>`, `<audio>`, `<track>`.
- Embeds: `<iframe>`, `<object>`, `<embed>`, `<frame>`.
- Links and metadata: `<link rel=stylesheet|prefetch|preload|prerender|dns-prefetch|preconnect|icon>`, `<meta http-equiv=refresh>`, `<base href>` (it turns relative URLs into remote ones), `<a ping>`, XML-stylesheet PIs.

**Non-pixel leaks.**
- MDN read receipts: never send automatically.
- Click-tracking redirects: rewrite and confirm.
- `List-Unsubscribe` one-click POST (RFC 8058): send only on user action.
- Forward and quote: strip remote parts.
- No hover prefetch.
- Approved image loads should go through the Rust core on native, and with `referrerPolicy: 'no-referrer'` on web.

**Detection sources.**

| Source | Content | Source |
|---|---|---|
| Ugly Email tracker list | 60 regexes in `Vendor@@=regex` form | [list.txt](https://github.com/OneClickLab/ugly-email-trackers/blob/master/list.txt) **[V]** |
| EasyPrivacy | Spawned from EasyList's web-bug filters in 2006 | [easylist.to](https://easylist.to/pages/about.html) **[V]** |
| Peter Lowe | 3,557 hostnames and 7,195 IPs, updated 2026-11-22 | [pgl.yoyo.org](https://pgl.yoyo.org/as/index.php) **[V]** |

**Acceptance test.** The [Email Privacy Tester](https://emailprivacytester.com/about) sends crafted messages to a confirmed address and shows dynamic results. Its criterion: "If merely reading the message without selecting to load remote images triggers any of the tests, then either your email client has a 'privacy bug', or it is not configured for optimal privacy." **[V]**. Source is at gitlab.com/grepular/ept3.

**What other clients do.**

| Client | Behavior | Label |
|---|---|---|
| Fastmail | Three settings: show, show for contacts otherwise ask, always ask. Banner "Remote images blocked to protect your privacy:" with a "Load images" button. Images are fetched by Fastmail's servers. Always blocked in Spam. ([help](https://www.fastmail.help/hc/en-us/articles/1500000278102-Blocking-remote-images)) | **[V]** |
| Proton | Remote images shown automatically by default, with a "Block email tracking" switch. "remote images are automatically downloaded and cached on our servers as you receive emails". ([support](https://proton.me/support/protonmail-images)) | **[V]** |
| FairEmail | "Confirm showing images to prevent tracking", "Attempt to recognize and disable tracking images", "Confirm opening links", "Warning if messages could not be authenticated". ([README](https://github.com/M66B/FairEmail/blob/master/README.md)) | **[V]** |
| Thunderbird, Apple Mail | Default-blocked with per-message load; exact UI text not retrieved (support pages refused the fetch). | **[U]** |

## 3. Sender authentication in the client

| Check | Client-side? | Notes |
|---|---|---|
| DKIM | Yes | `mail-auth` 0.16.0 (2026-11-22; Apache-2.0/MIT) covers DKIM, SPF policy, DMARC and ARC. It has a `dns-doh` resolver that "works natively and on WASM", a `rust-crypto` backend, and pluggable `DnsCache` ([docs.rs](https://docs.rs/mail-auth/latest/mail_auth/)) **[V]** |
| DMARC | Yes | Policy and alignment are a DNS exercise. DMARCbis is RFC 9989 (May 2026), which obsoletes RFC 7489, removes `pct` and adds `np` / `psd` ([datatracker](https://datatracker.ietf.org/doc/rfc9989/)) **[V]** |
| SPF | No | `check_host()` needs "the IP address of the SMTP client" (RFC 7208 §4.1) **[V]**. Display it as server-reported only. |
| ARC | Parse only | RFC 8617 is still Experimental ([datatracker](https://datatracker.ietf.org/doc/rfc8617/)) **[V]**. `mail-auth` makes it opt-in. |
| BIMI | Yes | "DMARC policy MUST be at enforcement on the organizational domain and subdomains"; a VMC is "Highly recommended, but Optional" and each mailbox provider sets its own bar ([BIMI Group](https://bimigroup.org/implementation-guide/)) **[V]**. Apple Mail supports BIMI and "Branded Mail" **[S]**. |

**DNS-over-HTTPS.** Each lookup exposes `selector._domainkey.<sender-domain>` to the resolver. Make the resolver user-configurable, cache aggressively (mail-auth does negative caching), and disclose the leak. `mail-auth`'s default hickory constructor is `new_cloudflare_tls()` **[V]**.

**Provider indicators.** Gmail's red "?" and "Be careful with this message", Outlook's "?" avatar, "via" tag, safety-bar colors and first-contact tip are **[S]**. Proton and Yahoo are **[U]**. Fetch these before designing Zelva's badges.

**Crates.** `unicode-security` 0.1.3 and `publicsuffix` 2.3.0 **[V]**. `idna`, `strsim`, `psl`, `url` were not checked. QR: `rqrr` 0.11.0 and `quircs` 0.10.3 **[V]**; `bar-rs` is not on crates.io.

## 4. S/MIME verification in Rust

| Crate | State (crates.io) | Label |
|---|---|---|
| `cms` | 0.3.0-rc.2 (2026-11-09); last stable 0.2.3 | **[V]** |
| `x509-cert` | 0.3.1 (2026-11-20) | **[V]** |
| `cryptographic-message-syntax` | 0.28.0 (2025-08-17) | **[V]** |
| `openssl` | 0.10.82 | **[V]** |
| `boring` | 5.6.0 | **[V]** |
| `botan` | 0.14.1 | **[V]** |

Platform support for iOS, Android and WASM was not checked for any of these **[U]**.

**What RFC 8551 actually requires [V]** ([text](https://www.rfc-editor.org/rfc/rfc8551.txt)):
- The signed MIME entity "does not include the rfc822 header" (§3.1). From/Subject are protected only if the sender wrapped the message, so header spoofing is possible without it.
- Signed attributes are "SHOULD generate" (§2.5), not MUST. Receivers "MUST be able to handle zero or one instance".
- Line endings must be CRLF (§3.1.1), SHA-256 is mandatory (§2.1), and RSA keys under 2048 bits are forbidden (§4.1).

**"Verified sender" badge.** Require all of the following:
1. Signature valid over the content.
2. Chain to a trusted root (make OS store versus `webpki-roots` a setting).
3. Certificate valid at signing time.
4. Signer address matches From, or headers are wrapped.
5. Revocation known, or an explicit "not checked" state.

**Revocation leakage.** OCSP and CRL fetches reveal who mails the user. Mitigate with long-lived cached CRLs, soft-fail and an opt-in toggle; client behaviours here are **[U]**.

**Mailing lists.** Footers and header munging break signatures; show "signed, but altered in transit".

**Client UIs and interop corpus.** Thunderbird, FairEmail, Canary, Mimestream and Proton presentation, and the Outlook/Thunderbird/Apple Mail corpus, were not verified **[U]**.

## 5. Secrets and data at rest

**`keyring` 4.2.0** has been re-architected into `keyring-core` plus store crates ([features](https://docs.rs/crate/keyring/latest/features)) **[V]**:
- The default `v1` set is `apple-native`, `windows-native` and `zbus-secret-service`.
- Optional: `dbus-secret-service`, `linux-keyutils`, `android-native`, `db-keystore`.
- Headless or non-GNOME NixOS behavior, iOS accessibility classes and Windows persistence are **[U]**.

**Android.** `android-native-keyring-store` 1.0.0 uses SharedPreferences plus Android Keystore through JNI, and needs `ndk-context` initialised, apparently via a Kotlin helper ([docs.rs](https://docs.rs/android-native-keyring-store/latest/android_native_keyring_store/)) **[V]**. No Tauri glue is known **[U]**.

**Database.** `rusqlite` 0.43.0 has `bundled-sqlcipher` and `bundled-sqlcipher-vendored-openssl` **[V]**. SQLCipher encrypts the main file, WAL and journals, but "Other transient files are not encrypted". It uses PBKDF2-HMAC-SHA512 with 256,000 iterations ([design](https://www.zetetic.net/sqlcipher/design/)) **[V]**. Set temp storage to memory. FTS5 impact is unmeasured **[U]**; column-level AEAD cannot cover the FTS index.

**Android backup.** Auto Backup is on by default and includes databases, prefs and files ([docs](https://developer.android.com/identity/data/autobackup)) **[V]**. `allowBackup="false"` may not stop device-to-device transfer on some devices. Ship `dataExtractionRules` with `<exclude>` in both `<cloud-backup>` and `<device-transfer>`.

**iOS.** Data Protection class text was not retrievable **[U]**.

## 6. Hardening checklist (Tauri + web)

- **Pin Tauri ≥ 2.11.6** (2.12.7 is current). Two 2026 advisories are relevant:
  - [GHSA-7gmj-67g7-phm9](https://github.com/tauri-apps/tauri/security/advisories/GHSA-7gmj-67g7-phm9): on Windows and Android, `http://<scheme>.attacker.com` was treated as local, so remote pages could call local-only IPC. Patched in 2.11.1 **[V]**.
  - [GHSA-w28w-mhc8-qvjv](https://github.com/tauri-apps/tauri/security/advisories/GHSA-w28w-mhc8-qvjv): cross-webview theft of channel payloads. Patched in 2.11.6 **[V]**.
  - 2024's [GHSA-57fm-592m-34r7](https://github.com/tauri-apps/tauri/security/advisories) showed iframes bypassing IPC origin checks. Test that the message frame has no `__TAURI_INTERNALS__` **[V]**.
- **CSP is "only enabled if set"** ([docs](https://v2.tauri.app/security/csp/)) **[V]**. Configure it.
- **Navigation.** `on_navigation` "Returning false cancels the navigation"; allow only the app scheme ([docs.rs](https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html)) **[V]**.
- **Drag-and-drop.** Tauri replaces WebView2's drop handler. If you disable that to use HTML5 drag-and-drop, block the default `drop` so a file is not navigated to **[V]**.
- **Custom scheme.** It is "available to all webviews". The origin is `<scheme>://localhost` on macOS, iOS and Linux and `http://<scheme>.localhost` on Windows and Android ([docs.rs](https://docs.rs/tauri/latest/tauri/struct.Builder.html)) **[V]**.
  - Map IDs through a lookup, never through paths.
  - Percent-decode and reject `..`.
  - Set `nosniff`, and derive Content-Type from magic bytes.
- **Deep links.** "The user could trigger a fake deep link manually". Custom schemes need "no host required, no verification" ([docs](https://v2.tauri.app/plugin/deep-linking/)) **[V]**. Never auto-send from a `mailto:` link.
- **WebKitGTK.** wry issue [#935](https://github.com/tauri-apps/wry/issues/935) ("Enable sandbox on WebKitGTK") is still open; the last comment argues for opt-in **[V]**.
- **Android.** Cleartext is off by default since API 28. Certificate Transparency is on by default from Android 17 ([docs](https://developer.android.com/privacy-and-security/security-config)) **[V]**. Play recommends FLAG_SECURE for sensitive UI **[V]**.
- **iOS.** Listed SDKs need privacy manifests and signatures ([Apple](https://developer.apple.com/support/third-party-SDK-requirements/)) **[V]**. ATS and the required-reason API list are **[U]**.
- **Attachments.** On Windows, apply Mark of the Web through `IAttachmentExecute::Save()` ([Lawrence](https://textslashplain.com/2022/12/02/mark-of-the-web-additional-guidance)) **[S]**. Quarantine on macOS is **[U]**.
- **Wipe.** Delete keystore entries, DB, WAL/SHM, journals and thumbnails. Flash storage cannot be erased physically, so prefer key destruction **[U]**.

## 7. Distribution and compliance

**App Store ([guidelines](https://developer.apple.com/app-store/review/guidelines/)) [V]**
- **2.5.2:** no downloading or executing code that changes functionality. The current text keeps only the educational exception.
- **3.1.1:** in-app purchase is required to unlock features.
- **3.1.3(b):** multiplatform features bought elsewhere are allowed only if "also available as in-app purchases within the app". Pro must be purchasable in-app.
- **3.1.3(f):** a free companion to a paid "Email Services" tool needs no in-app purchase if there is no purchasing or call to action in the app.
- **4.2:** must "elevate it beyond a repackaged website". Ship local assets, not the hosted PWA.
- **5.1.1(v):** "If your app supports account creation, you must also offer account deletion within the app".
- **5.1.2(i):** disclose sharing "including with third-party AI".
- Tauri apps being accepted: one Reddit report **[S]**. macOS notarisation and sandbox: **[U]**.

**Google Play**
- **Target:** "New apps and app updates must target Android 16 (API level 36) or higher" since 2026-08-31; extension to 2026-11-01 ([policy](https://support.google.com/googleplay/android-developer/answer/11926878)) **[V]**.
- **UGC:** UGC is content "visible to or accessible by at least a subset of the app's users", with no email exemption ([policy](https://support.google.com/googleplay/android-developer/answer/18265346)) **[V]**. By that definition a pure mail client is out of scope. Shared Workspace content is a risk.
- **Data safety:** required. On-device-only processing is exempt ([form](https://support.google.com/googleplay/android-developer/answer/10787469)) **[V]**.

**Windows.** "EV certificates no longer bypass SmartScreen". Artifact Signing starts at $9.99/month. Reputation takes "several weeks and hundreds of clean installs" ([Learn](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation)) **[V]**.

**Flathub.** Redistribution rights and license in MetaInfo are required. "Static permissions must be kept to an absolute minimum", portals are mandatory where available, and "There is no network access during the build process" ([requirements](https://docs.flathub.org/docs/for-app-authors/requirements)) **[V]**.

**EU law.**
- **AI Act Art. 50** has applied since 2026-08-02. Marking does not apply where the system "performs an assistive function for standard editing". Commission guidelines followed on 2026-07-20 **[S]**. Label summaries and drafts; get counsel.
- **EDPB Guidelines 2/2023** on ePrivacy Art. 5(3): the final version is dated 2024-10-16 **[V]**; content not read. There is no blanket analytics exemption **[U]**.
- **European Accessibility Act:** microenterprise services exemption **[U]**. EUR-Lex returned empty pages.

## Prioritised acceptance criteria for the PRD

1. **P0, remote content.** With blocking on (the default), opening every Email Privacy Tester message fires zero tests. The frame's network log is empty for a corpus covering every vector in section 2.
2. **P0, message frame.** It is sandboxed without scripts, same-origin, forms or top navigation. It has no IPC (`__TAURI_INTERNALS__` absent). Receivers validate `event.source` and a per-frame token. No secret enters the frame.
3. **P0, native I/O.** All JMAP traffic is Rust-side. CI fails if any token is reachable from webview JS.
4. **P0, platform pin and policy.** Tauri is ≥ 2.11.6. CSP is configured. Capabilities are enumerated. The opener allows only `http`, `https` and `mailto`. A navigation to `http://<scheme>.attacker.com` is canceled.
5. **P0, custom scheme.** Traversal fuzz cases return 400. Every response carries `nosniff`. Type comes from magic bytes. Non-inline types get `Content-Disposition: attachment`.
6. **P0, secrets.** Tokens exist only in the OS keystore. The DB header is not plain SQLite. Temp store is in memory.
7. **P0, removal.** After account removal, keystore entries, DB, WAL/SHM, journals and thumbnails are gone on every OS.
8. **P0, Android backup.** A `bmgr` run shows no DB, prefs or tokens.
9. **P1, iOS.** No mail content in iCloud backup, logs or crash reports. A privacy manifest is present.
10. **P1, attachments.** Executable and markup types need confirmation. MotW and quarantine are applied before external open.
11. **P1, web tokens.** Tokens are key-wrapped, with `persist()` requested. URL tokens are single-use and last ≤ 60 s. App CSP has no inline scripts.
12. **P1, badges.** "Verified" requires a locally computed DKIM or DMARC pass; never trust `Authentication-Results` alone. S/MIME "verified" requires all five conditions in section 4.
13. **P2, telemetry.** A fresh install makes no network calls except to the user's server.

## Top risks

1. **Web token protection is weak.** One XSS means full mailbox access, and Safari's 7-day eviction forces re-auth.
2. **Fastmail web access depends on manual origin registration.**
3. **No reliable closed-tab push** on Safari or Firefox, or from Fastmail.
4. **Pure-Rust S/MIME is release-candidate grade.** A false "verified" badge is a liability.
5. **Renderer exposure.** Untrusted HTML and CSS still reach the webview, and the WebKitGTK sandbox is not enabled by wry.
6. **Compliance.** In-app purchase for Pro on iOS, in-app account deletion, AI disclosure, API 36.
7. **Stale matrix.** James and Cyrus findings are for master; deployed releases may differ.
8. **Tracking is an arms race.** CSS-only leaks need a maintained sanitiser, not regex.