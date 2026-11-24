# 03 · Stack decision: Tauri 2 with a web UI, and the alternatives considered

| | |
|---|---|
| Status | Two research snapshots taken 2026-11-23. Not a living document |
| Method | Research agents reading the crates.io and npm registry APIs, official documentation, release pages and GitHub |
| Labels | Each part explains its own VERIFIED / UNVERIFIED labels |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-042 (Rust core, Tauri 2, Solid 2), DEC-044 (direnv and Nix flake tooling).

## Part A · Initial stack research

---


Labels: **VERIFIED** means I read the claim in a primary source today (crates.io API, npm registry, official docs, blogs or release pages). **UNVERIFIED** means it comes from a search summary or the page could not be opened.

## TL;DR
- Tauri's stable line is 2.12.7 and actively shipped. On mobile it is a webview wrapper with no first-party push or background API, and Linux still depends on the distro's WebKitGTK.
- No alternative beats it across all of Zelva's constraints. The web target forces a DOM UI, which rules out Flutter, Compose, React Native and pure-Rust GUIs as the shared UI layer.
- Keep Rust + Tauri 2.x behind a shell-agnostic web UI, and de-risk mobile with a push relay and a Capacitor fallback.
- Tauri's efficiency win over Electron is bundle size, not idle RAM. A 2026 measurement put idle memory at 109 MB against Electron's 128 MB.

## 1. Tauri

| Topic | Finding | Label and source |
|---|---|---|
| Latest stable | `tauri` 2.12.7 (18 Nov 2026); 2.12.0 shipped 26 Sep; MSRV 1.90 with a stable−3 policy; Windows 7 dropped | VERIFIED: [crates.io](https://crates.io/api/v1/crates/tauri), [blog](https://v2.tauri.app/blog/tauri-2.12/), [releases](https://v2.tauri.app/release/tauri) |
| Tauri 3 | 3.0.0-alpha.6 on crates.io; APIs may change; runtime becomes a direct dependency | VERIFIED: [crates.io](https://crates.io/api/v1/crates/tauri), [migration guide](https://v3.tauri.app/start/migrate/from-tauri-2) |
| CEF runtime | New in 3.0 alpha: bundled Chromium, desktop only, "hundreds of megabytes larger"; runs unsandboxed on Windows | VERIFIED: [v3 docs](https://v3.tauri.app/develop/cef) |
| Servo/Verso | `tauri-runtime-verso` is experimental, desktop only, 142 stars, with a hard-coded Origin header for IPC; `tauri-runtime-servo` 0.1.0 has 134 downloads and is third-party | VERIFIED: [repo](https://github.com/versotile-org/tauri-runtime-verso), [crates.io](https://crates.io/api/v1/crates/tauri-runtime-servo) |
| Memory, macOS app | Tauri 109 MB idle, 57 MB bundle, 311 ms startup; Electron 128 MB, 323 MB, 273 ms | VERIFIED: [Better Stack, Jul 2026](https://betterstack.com/community/guides/scaling-nodejs/tauri-vs-electron-vs-deno-vs-electrobun) |
| Idle RAM claims | "25–50 MB" blog figures count only the main process; the same measurement shows 36 MB for that process alone | VERIFIED for the 36 MB figure; blog figures UNVERIFIED |
| Production apps | Spacedrive, Clash Verge Rev, Plane, Cinny Desktop; I found no large Tauri mobile app | UNVERIFIED (search summaries) |
| Mobile multiwindow | Activity embedding (Android 12L+) and UIScene (iOS 13+), tablets only | VERIFIED: [docs](https://v2.tauri.app/learn/mobile-multiwindow/) |
| Background execution | Native Kotlin/Swift plugin code can call Rust "even when the application WebView is suspended"; there is no first-party background API; request #11688 is unanswered | VERIFIED: [docs](https://v2.tauri.app/develop/plugins/develop-mobile/), [discussion](https://github.com/tauri-apps/tauri/discussions/11688) |
| Push | The official notification plugin is local only on all five platforms; no official APNs/FCM plugin was found | VERIFIED: [docs](https://v2.tauri.app/plugin/notification/); community plugin UNVERIFIED |
| Mobile field report | Four Android/macOS hobby apps: fast prototyping, but UI testing was a pain point and the dialog plugin lacked a directory picker on Android | VERIFIED: [Erik Horton, Oct 2025](https://blog.erikhorton.com/2025/10/05/4-mobile-apps-with-tauri-a-retrospective.html) |
| Updater | Desktop only; signatures are mandatory; mobile goes through the stores | VERIFIED: [docs](https://v2.tauri.app/plugin/updater/) |
| Signing | iOS and macOS builds need a Mac and Apple Developer enrollment | VERIFIED: [docs](https://v2.tauri.app/distribute/app-store/) |
| Secure storage | 30 official plugins, none for the OS keyring; Stronghold is still published | VERIFIED: [docs](https://v2.tauri.app/plugin/stronghold/) |
| Stronghold status | A maintainer wrote in Nov 2024 that it "will be deprecated soon" | UNVERIFIED (search summary) |
| llama.cpp | `llama-cpp-2` 0.1.161 (3 Nov 2026) is active; no mature Tauri plugin for Metal/Vulkan/iOS/Android was found | VERIFIED: [crates.io](https://crates.io/api/v1/crates/llama-cpp-2); plugin gap UNVERIFIED |
| Linux graphics | NVIDIA/Wayland DMABUF failures; workarounds are env vars that disable the fast path | VERIFIED: [docs](https://v2.tauri.app/develop/debug/linux-graphics/) |
| WebKitGTK 2.54 | Shipped 16 Sep 2026 with a Skia-based compositor | UNVERIFIED (search summary of webkitgtk.org) |

- **Linux fragmentation:** WebKitGTK comes from the distro, and Tauri's own docs call their version table "very incomplete" ([VERIFIED](https://v2.tauri.app/reference/webview-versions/)). Shipping on Flattub pins a known WebKitGTK; Tauri documents a Flathub path.
- **App Store review:** bundling assets locally and shipping native features addresses guideline 4.2. That is UNVERIFIED (search summaries).

## 2. Alternatives

| Option | Status | Fit for Zelva |
|---|---|---|
| Flutter 3.50 (11 Nov 2026) + flutter_rust_bridge 2.13.0 | VERIFIED: [blog](https://flutter.dev/blog/whats-new-in-flutter-3-50), [pub.dev](https://pub.dev/packages/flutter_rust_bridge) | Weak. Web is canvas-rendered with a 3.75–5.46 MB engine (VERIFIED) and opt-in semantics (UNVERIFIED); HTML email needs an embedded WebView. |
| Kotlin Multiplatform + Compose 1.12.2 (1.13.0-rc01) | VERIFIED: [releases](https://github.com/JetBrains/compose-multiplatform/releases) | Weak. Web is still churning: Safari text-field fixes and a known wasm "memory access out of bounds" issue (VERIFIED). |
| React Native 0.88 | UNVERIFIED (search summary) | Weak. Web, Windows and macOS are out-of-tree platforms with separate maintainers (VERIFIED: [docs](https://reactnative.dev/docs/out-of-tree-platforms)). |
| PWA + Capacitor 8.5 | UNVERIFIED (search summary) | The fallback, not a replacement: no official desktop shell. |
| Electron 45.4.1 | VERIFIED: [releases](https://github.com/electron/electron/releases) | The baseline: consistent Chromium and mature text editing, but a 323 MB bundle and no mobile. |
| Neutralino 6.10.0 | UNVERIFIED | No Rust core, no mobile. |
| Wails v3.1.0 (1 Nov 2026) | VERIFIED: [releases](https://github.com/wailsapp/wails/releases) | Go, not Rust; mobile is experimental; documented iframe IPC caveats. |
| Slint 1.19.0 (16 Nov 2026) | VERIFIED: [crates.io](https://crates.io/api/v1/crates/slint), [pricing](https://slint.dev/pricing) | GPLv3-only, or a proprietary royalty-free license that excludes embedded use. Either way the Apache-2.0 half of the dual license is out. |
| Dioxus 0.7.10 (0.8.0-alpha.3) | VERIFIED: [crates.io](https://crates.io/api/v1/crates/dioxus) | Blitz native-renderer maturity UNVERIFIED. |
| Iced 0.14.0, egui 0.37.0, Makepad 1.0.0, Xilem 0.4.0 | VERIFIED: [iced](https://crates.io/api/v1/crates/iced), [egui](https://crates.io/api/v1/crates/egui), [makepad](https://crates.io/api/v1/crates/makepad-widgets), [xilem](https://crates.io/api/v1/crates/xilem) | None render HTML, so a webview is needed anyway. |
| Native UI per platform + UniFFI 0.32.2 | VERIFIED: [crates.io](https://crates.io/api/v1/crates/uniffi) | Best platform feel, but three UI codebases. |
| Electrobun 1.0, Deno Desktop | VERIFIED: [Better Stack](https://betterstack.com/community/guides/scaling-nodejs/tauri-vs-electron-vs-deno-vs-electrobun) | Electrobun was worst on every metric (208 MB idle); Deno Desktop is "not ready for complex production applications yet". |

## 3. Rust crates

| Crate | Latest | Notes | Label |
|---|---|---|---|
| [jmap-client](https://crates.io/api/v1/crates/jmap-client) | 0.4.4 (23 Nov 2026) | RFC 8620/8621/8887 plus a Sieve draft; the README lists no calendar or contacts; `reqwest` is a non-optional dependency, so native only | VERIFIED |
| [io-jmap](https://crates.io/api/v1/crates/io-jmap) | 0.11.0 (21 Nov 2026) | Contacts (RFC 9610) and a calendars draft; no_std coroutines usable from any runtime; 3 stars | VERIFIED |
| `jmap-*` family (MarkAtwood) | 0.6.2 (22 Nov 2026) | Mail, calendars, contacts and tasks; days old, about 1.6k downloads | VERIFIED: [search](https://crates.io/api/v1/crates?q=jmap&per_page=30) |
| [mail-parser](https://github.com/stalwartlabs/mail-parser) | 1.0.2 (23 Nov 2026) | MSRV 1.98; dependencies have no WASM blockers; no sanitisation | VERIFIED |
| mail-send / mail-builder / mail-auth / calcard | 0.7.0 / 2.0.1 / 0.16.0 / 0.3.14 | All Apache-2.0 or MIT, all active | VERIFIED |
| [async-imap](https://crates.io/api/v1/crates/async-imap) | 0.12.0 (Sep 2026) | `imap` is stalled at 3.0.0-alpha.15 (Feb 2025) | VERIFIED |
| [sieve-rs](https://crates.io/api/v1/crates/sieve-rs) | 0.7.3 | **AGPL-3.0-only**; 0.8.x and 1.0.x were yanked on 26 Oct 2026 | VERIFIED |
| ammonia / lol_html | 4.2.5 / 3.0.3 | MIT or Apache-2.0 / BSD-3; WASM builds expected but not tested here | VERIFIED / UNVERIFIED |
| url / idna / unicode-security / psl | 2.5.9 / 1.1.0 / 0.1.3 / 2.1.261 | `publicsuffix` is stale since Nov 2024 | VERIFIED |
| x509-cert / cms | 0.3.1 / 0.3.0-rc.2 | `cms` is still a release candidate for S/MIME | VERIFIED: [x509-cert](https://crates.io/api/v1/crates/x509-cert), [cms](https://crates.io/api/v1/crates/cms) |
| keyring / secret-service | 4.2.0 / 6.0.0 | `keyring` is now a core crate plus per-store crates; its platform matrix was not obtained | VERIFIED / UNVERIFIED |
| rusqlite / sqlx | 0.43.0 / 0.9.1 | Storage and search | VERIFIED |
| redb / fjall / native_db | 5.0.0 / 3.1.13 / 0.8.2 | `native_db` has been quiet since Jul 2025 | VERIFIED |
| [tantivy](https://crates.io/api/v1/crates/tantivy) | 0.27.0 | Native only | VERIFIED |
| SQLite WASM | — | `opfs-sahpool` is in the official build, with a digest bug for databases created from 3.50.0 to the fix | UNVERIFIED |
| tokio, reqwest, tokio-tungstenite, wasm-bindgen-futures | not checked | — | UNVERIFIED |

- **Storage:** use SQLite with FTS5 on both targets, which gives native and web the same schema and query code. Tantivy is faster but splits the search stack.
- **Sieve:** generate script text from the visual builder and avoid a parser dependency. If you need one, `mailrs-sieve` 2.0.1 or `sieve-form` 0.2.1 are small alternatives to the AGPL crate (VERIFIED: [search](https://crates.io/api/v1/crates?q=sieve&per_page=30)).
- **Encryption at rest:** rusqlite's `bundled-sqlcipher` feature exists, but a Windows ARM linking failure was reported (UNVERIFIED). App-level AEAD with the key in the OS keystore avoids it.

## 4. Frontend

| Framework | Latest (npm) | Benchmark weighted mean |
|---|---|---|
| SolidJS | 2.0.3 | about 1.08 |
| Svelte | 5.59.1 | about 1.10 |
| Vue | 3.5.46 | about 1.30 |
| React | 19.3.1 | about 2.0 |
| Preact | 11.2.0 | not obtained |

- Versions are VERIFIED from the npm registry. Benchmark numbers are UNVERIFIED from a secondary source ([arc.dev](https://arc.dev/employer-blog/svelte-vs-vue-vs-solidjs)); the [live table](https://krausest.github.io/js-framework-benchmark/current.html) did not render.
- **Solid 2.0:** it is now npm `latest` (VERIFIED); the November stable date is UNVERIFIED, so treat it as freshly released.
- **Production mail UIs:** Proton Mail web is React and Redux Toolkit, and Thunderbird Supernova is vanilla JS, not React (both UNVERIFIED, search summaries).
- **Virtual lists:** `@tanstack/virtual-core` 3.19.13 (framework-agnostic), `react-virtuoso` 4.18.24, `virtua` 0.55.0 (all VERIFIED).
- **Editor:** Lexical 0.53.0 (VERIFIED). A ProseMirror schema drops anything outside its spec, which suits producing email-safe HTML (UNVERIFIED).
- **Styling:** Tailwind 4.3.5 (VERIFIED).
- **Testing:** WebdriverIO's Tauri service with an embedded WebDriver server is the documented path on Windows, Linux and macOS; bare `tauri-driver` covers only Windows and Linux (VERIFIED: [docs](https://v2.tauri.app/develop/tests/webdriver/)). Playwright over CDP works only on WebView2 (UNVERIFIED).

## 5. Rendering HTML email

- **Thunderbird's model:** the body lives in a separate `about:message` document inside a content `<browser>` element (VERIFIED: [docs](https://source-docs.thunderbird.net/en/latest/frontend/mail_display.html)). Its content policy and sanitiser details are UNVERIFIED.
- **CSS tracking:** the "Cascading Spy Sheets" paper (NDSS 2025) shows CSS selectors plus remote stylesheets can track clients that block pixels, so block remote stylesheets and fonts too (UNVERIFIED, search summary).
- **Sanitiser spec:** the Email Markup Consortium publishes an Email Sanitizer spec (UNVERIFIED).
- **Mimestream:** WKWebView with a tracker blocklist (UNVERIFIED).

Tauri pitfalls (VERIFIED unless noted):
- CSP is off unless configured, and custom schemes must be allow-listed in `img-src`; IPC needs `ipc: http://ipc.localhost` in `connect-src` ([CSP](https://v2.tauri.app/security/csp/)).
- The asset protocol needs an explicit scope, and on Unix `requireLiteralLeadingDot` is true by default, so dot-prefixed cache directories must be named literally ([asset protocol](https://v2.tauri.app/security/asset-protocol/)).
- The v1-era iframe IPC bypass (CVE-2024-35222) is the risk class; whether v2 injects IPC into child frames is UNVERIFIED.
- The Isolation pattern protects IPC from your own frontend; it is not a message-body sandbox ([isolation](https://v2.tauri.app/concept/inter-process-communication/isolation/)).

Design that follows from this:
1. Sanitise in Rust with ammonia.
2. Render in an `<iframe sandbox="">` with neither `allow-scripts` nor `allow-same-origin`.
3. Rewrite `cid:` to a custom scheme served by `register_uri_scheme_protocol`.
4. Add a CSP inside the document that denies all network access.

## 6. Recommendation

**Keep Rust + Tauri 2.12.x (wry runtime) for desktop and mobile.** Stay off the 3.0 alpha and the CEF runtime.

- **Core:** a pure-Rust domain layer that compiles to WASM, with pluggable transport (reqwest and tokio natively, fetch and browser WebSocket on the web).
- **JMAP:** expect to own the calendar and contacts model, because no mature crate covers both and `jmap-client` is not WASM-ready.
- **Frontend:** React 19.3 with TypeScript, TanStack Virtual, and ProseMirror or Lexical. I chose React for its editor, testing and contributor ecosystem; Solid is the alternative if row updates profile badly.
- **Shell isolation:** keep the UI shell-agnostic behind a thin adapter so it ships as a PWA and can move to Capacitor if Tauri mobile stalls.
- **Storage:** SQLite with FTS5, and the OS keystore through the `keyring` crate rather than Stronghold.
- **ML:** `llama-cpp-2` through your own Rust crate, with a small classifier for spam and phishing.

**Top risks**
1. **Mobile notifications.** JMAP push needs a live connection or a webhook. The blueprint's promise of server-side push does not give iOS or Android alerts without an APNs/FCM relay, and Stalwart ships none for third-party clients (UNVERIFIED). Budget a relay for the Workspace tier.
2. **Tauri mobile maturity.** Evidence is hobby-scale, and push, background work and UI testing are all on you.
3. **Linux WebKitGTK.** Fragmentation and NVIDIA remain; budget a distro test matrix and ship on Flathub.
4. **S/MIME.** RustCrypto `cms` is a release candidate, so pin it and audit, or add a native fallback.
5. **Web parity.** The WASM path is design work, not a compile flag.
6. **On-device LLM.** Model size, battery and store limits on mobile are unsolved here.
7. **Licenses.** `sieve-rs` is AGPL-only and Slint is unusable under Apache-2.0.
8. **Tauri 3 churn.** The alpha already breaks the runtime API, so plan a migration window.
9. **Scope.** Five platforms plus mail, contacts, calendar, ML and S/MIME is a lot for a small team.
## Part B · Seven native-rendering alternatives evaluated

The founder asked for these to be weighed against Tauri: blinc.rs, Crux, gpui-kit, FerroUI, fission.rs, Dioxus and Lynx.

---


## Bottom line

- **None of the seven can render real-world HTML e-mail natively.** The only HTML/CSS engine among them is Blitz (behind Dioxus Native), which calls itself "currently in a beta state" ([Blitz README](https://raw.githubusercontent.com/DioxusLabs/blitz/main/README.md)).
- **None covers six platforms with native rendering in a credible way for production.** Lynx has no Linux; GPUI Kit is desktop-first; the web targets of GPUI Kit, Fission and Blinc are canvases without accessibility bridging.
- **Three of the seven are effectively one-person projects with tiny adoption:** Blinc (580 stars), FerroUI (331 stars, repo created 2026-10-05) and Fission (37 stars, created 2025-12-13).
- **Dioxus stable uses the same webview stack as Tauri** (wry/tao), so it is a Rust-only variant of the current plan, not a native renderer.
- **Recommendation:** keep Tauri 2 + web UI. Re-evaluate two things later: Tauri 3's Chromium runtime (alpha) and Blitz when it leaves beta.

Scores in the comparison table are my judgment from the verified facts; memory figures for every native option are unmeasured.

## 1. What each option actually is

| Option | Type | Latest version | License | Maintainer | Stars / downloads | Health signals |
|---|---|---|---|---|---|---|
| **blinc.rs** | Renderer plus component kit: signals, builder API, wgpu | 0.6.0, 2026-11-04 (crate first published 2026-01-14) | Apache-2.0 in LICENSE; site footer says "MIT licensed" | Damilare Akinlaja ("darmie"); 30 of 30 recent commits are his | 580 / 1,156 total | Daily commits; 7-month gap between 0.5.1 and 0.6.0; accessibility and devtools are roadmap items |
| **Crux** | Architecture pattern: Rust core plus native shells; not a renderer | crux_core 0.20.0, 2026-08-07 | Apache-2.0 | Red Badger | 2,857 / 393k | Monthly-ish minors; 0.19 replaced UniFFI with BoltFFI; still pre-1.0 |
| **gpui-kit** | Component kit on GPUI (Zed's framework) | 0.11.0, 2026-11-23 | Apache-2.0 code, CC BY 4.0 docs | Longbridge | 21,232 / ~499k | Weekly releases; shipped in Longbridge Pro |
| **FerroUI** | Port of Avalonia to Rust: retained-mode controls, XAML, plus `rsx!` and signals | 0.5.0, 2026-11-15 | MIT | Wiesław Šoltés; 5,205 of ~5,211 contributions | 331 / 191 total | Five minors in six weeks; "not on a range of real devices"; 0.5 "may change" the API |
| **fission.rs** | Flutter-style widget framework with Vello, `fission_component!` macro | 0.16.0, 2026-11-13 | Apache-2.0 | "zcourts" (2,026 of ~2,136 contributions) | 37 / 1,617 total | 11 months old; 31 open issues; no named production users found |
| **Dioxus** | React-like Rust framework; renderer chosen per platform | 0.7.10 stable (2026-07-30); 0.8.0-alpha.3 (2026-10-16) | MIT or Apache-2.0 | Dioxus Labs, joined Cognition 2026-09-10 | 39,885 / 3.9M | 933 open issues; "no official timeline for Dioxus 0.8" |
| **Lynx** | JS framework with its own native engine; ReactLynx or Vue front end | 4.2 | Apache-2.0 | ByteDance (lynx-family) | 15,273 / n/a | Monthly releases since mid-2026; 1,399 open issues; powers TikTok and CapCut |

Sources: [Blinc repo](https://github.com/project-blinc/Blinc), [Blinc API](https://api.github.com/repos/project-blinc/Blinc), [Blinc LICENSE](https://raw.githubusercontent.com/project-blinc/Blinc/main/LICENSE), [blinc_app crate](https://crates.io/api/v1/crates/blinc_app); [Crux repo](https://github.com/redbadger/crux), [Crux releases](https://github.com/redbadger/crux/releases), [crux_core crate](https://crates.io/api/v1/crates/crux_core); [gpui-kit repo](https://github.com/longbridge/gpui-kit), [gpui-kit releases](https://gpui-kit.com/releases), [gpui-kit crate](https://crates.io/api/v1/crates/gpui-kit); [FerroUI repo](https://github.com/wieslawsoltes/FerroUI), [ferroui crate](https://crates.io/api/v1/crates/ferroui), [FerroUI contributors](https://api.github.com/repos/wieslawsoltes/FerroUI/contributors); [fission repo](https://github.com/fission-ui/fission), [fission crate](https://crates.io/api/v1/crates/fission), [fission contributors](https://api.github.com/repos/fission-ui/fission/contributors); [Dioxus releases](https://github.com/DioxusLabs/dioxus/releases), [dioxus crate](https://crates.io/api/v1/crates/dioxus), [joining Cognition](https://dioxuslabs.com/blog/joining-cognition), [0.8 roadmap](https://github.com/DioxusLabs/dioxus/issues/5024); [Lynx repo](https://github.com/lynx-family/lynx), [Lynx API](https://api.github.com/repos/lynx-family/lynx).

## 2. Decisive criteria, side by side

| Option | Native backend | Web mechanism | Renders HTML e-mail itself | Webview escape hatch | Text input / IME | Accessibility |
|---|---|---|---|---|---|---|
| Tauri 2 (baseline) | None: system webview | Browser DOM | Yes | Is one | Browser-grade | Browser-grade |
| blinc.rs | wgpu SDF (Metal, DX12/Vulkan) | Canvas via WebGPU, WebGL2 fallback; "Tier 2 / preview" | No | None found | Web IME "Pending"; desktop IME unverified | "Pending"; roadmap item |
| Crux | None (native shells) | Any WASM or JS framework | Only if the shell has one | Up to each shell | Native per shell | Native per shell |
| gpui-kit | GPUI GPU; Win32 + DirectWrite on Windows | Canvas (WebGPU then WebGL2); "primarily to showcase" | No; TextView is "simple HTML" | `gpui-webview` (Wry), experimental | Desktop proven; web uses a hidden input, "not a general text-input solution" | AccessKit built in on desktop; none bridged on web |
| FerroUI | Skia (Graphite on Metal, Ganesh elsewhere), HarfBuzz | Canvas via WebGL2 or 2D canvas (`wasm32-unknown-emscripten`) | No | None | RichTextBlock and RichEditBox "with input methods on every platform" | Automation peers ported; no screen reader ever exercised |
| fission.rs | Vello with CPU fallback | Canvas | No; RichText is its own run model | macOS WKWebView only; other targets are a "no-op mock" | `ImeEvent` contract exists; per-platform support undocumented | AccessKit on desktop and iOS; Android TalkBack incomplete; web exposes only the focused field |
| Dioxus (stable) | None: wry/tao webview | DOM via web-sys; SSR and hydration | Yes | Is one | Browser-grade | Browser-grade |
| Dioxus Native (Blitz) | Stylo + Taffy + Parley + Vello | Uses the normal DOM web renderer | Intended to, but beta | n/a | Textarea and IME-composition fixes still landing weekly | AccessKit; tree work still landing |
| Lynx | Own engine (Clay on desktop) | `@lynx-js/web-core` `<lynx-view>` | No | `<webview>` on Android, iOS, HarmonyOS, desktop; not web | Mobile production-grade; desktop 73% attribute coverage | VoiceOver and TalkBack; no WCAG statement |

Sources: [Blinc web overview](https://blinc.rs/docs/web/overview.html); [gpui-kit WebAssembly](https://gpui-kit.com/docs/webassembly), [WebView](https://gpui-kit.com/docs/webview), [TextView](https://gpui-kit.com/component/text-view), [GPUI](https://github.com/zed-industries/zed/tree/main/crates/gpui); [FerroUI repo](https://github.com/wieslawsoltes/FerroUI); [Fission WebView](https://fission.rs/reference/widgets/web-view/), [RichText](https://fission.rs/reference/widgets/rich-text/), [accessibility](https://fission.rs/reference/platform/accessibility/), [IME](https://fission.rs/reference/core/environment-input-and-ime/); [Dioxus desktop](https://dioxuslabs.com/learn/0.7/guides/platforms/desktop), [mobile](https://dioxuslabs.com/learn/0.7/guides/platforms/mobile), [Cargo.toml](https://raw.githubusercontent.com/DioxusLabs/dioxus/main/packages/dioxus/Cargo.toml), [Blitz README](https://raw.githubusercontent.com/DioxusLabs/blitz/main/README.md), [Blitz commits](https://api.github.com/repos/DioxusLabs/blitz/commits); [Lynx webview](https://lynxjs.org/api/elements/built-in/webview.html), [accessibility](https://lynxjs.org/guide/inclusion/accessibility.html), [3.7 post](https://lynxjs.org/next/blog/lynx-3-7).

## 3. Specific questions

**Dioxus**
- **Desktop and mobile renderers (VERIFIED):** both use the system WebView through wry and tao. The 0.7 desktop guide says "Apps built with Dioxus desktop use the system WebView to render the page." On main, the `mobile` feature is "same as desktop" and `native` is opt-in, with a TODO to make webview the default. 0.8.0-alpha.3 sits on "tao 0.37 / wry 0.57", the same versions as Tauri's `tauri-runtime-wry` 2.12.5.
- **Blitz in late 2026 (VERIFIED):** an HTML/CSS engine with no JavaScript, in beta, about 4.5k stars. It is very active, with dozens of commits in the week to 2026-11-23 covering floats, textarea layout and accessibility-tree fixes. Browser builds are listed for Windows, macOS, Linux and Android; iOS is not listed.
- **Who ships it:** the "Used by" section is empty. Dioxus Labs says Cloudflare used Blitz for an agentic browser, and that Blitz now has a full-time lead engineer.
- **Fullstack:** axum-based server functions exist in 0.7 and are unchanged on the 0.8 roadmap.

**Lynx**
- **Desktop (VERIFIED):** macOS and Windows became "first-class platforms" in 3.7 (2026-04-16), with "311 out of 319" CSS properties and "179 out of 246" element attributes. Linux is not supported; the maintainers' 2025 discussion says Linux UI support is "yet to be planned."
- **Threading (VERIFIED):** a dual-thread model. The main thread runs PrimJS (QuickJS-based) for layout, rendering and main-thread scripts. The background thread runs the React runtime on PrimJS (Android) or JavaScriptCore (iOS). WASM is "basic WebAssembly support on Android" since 3.8, background thread only.
- **Accessibility:** four attributes on iOS and Android. "Only one accessibility element can be successfully accessed and focused by screen readers." No WCAG statement.
- **HTML:** no HTML-string rendering found. The `<webview>` element accepts an `html` attribute on mobile since 3.6.
- **Native bundle size:** UNVERIFIED; no official figure found.

**Crux**
- Confirmed as "app core + thin native shells" (SwiftUI, Compose, React/Svelte). The web build is WASM.
- For a solo founder it means three UI codebases. No shared-UI option is offered beyond a WASM framework on the web.
- Production use is claimed at Proton and PhotoRoom. Zelva's Rust core plus WASM already follows this shape.

**GPUI / gpui-kit**
- **Windows:** supported natively (Win32, DirectWrite).
- **Mobile:** "experimental"; iOS simulator path only; "supports one GPUI view for the application's lifetime."
- **Web:** canvas, single window, "not a general text-input solution."
- **WebView:** embeddable through the Wry-based `gpui-webview`. On Linux it needs X11 or XWayland; Wayland is "Not supported." On Windows the webview "covers GPUI content," including popovers and menus.

**Blinc, FerroUI, Fission**
- **Blinc:** a wgpu renderer with a CSS-like DSL. Web is preview. Accessibility and devtools are listed as unfinished roadmap items.
- **FerroUI:** the broadest native toolkit on the list (themes, TreeDataGrid, devtools, MCP server, hot reload), but seven weeks old with 191 downloads.
- **Fission:** a Flutter-style widget set with nine targets, but its webview works only on macOS.

**Is anything credible for six platforms with native rendering and real-world HTML e-mail? No (VERIFIED none on the list).** Adjacent findings:
- **Tauri 3.0 alpha:** adds `tauri-runtime-cef`, which "ships Chromium with your app" on desktop only. The docs say "Keep production apps on 2.x."
- **Servo:** on crates.io at 0.8.0 (2026-11-07) with monthly breaking releases, no iOS, and "a very basic accessibility tree."
- **Flutter:** `webview_flutter` 4.14.1 supports Android, iOS and macOS only, using platform webviews.

Sources: [Dioxus joining Cognition](https://dioxuslabs.com/blog/joining-cognition); [Lynx 3.7](https://lynxjs.org/next/blog/lynx-3-7), [runtime](https://lynxjs.org/guide/scripting-runtime/index.html), [ReactLynx](https://lynxjs.org/react/thinking-in-reactlynx.html), [desktop discussion](https://github.com/lynx-family/lynx/discussions/852); [Crux](https://github.com/redbadger/crux); [gpui-kit mobile](https://gpui-kit.com/docs/mobile); [Tauri 3 migration](https://v3.tauri.app/start/migrate/from-tauri-2/), [Tauri releases](https://api.github.com/repos/tauri-apps/tauri/releases); [servo crate](https://crates.io/api/v1/crates/servo), [April in Servo](https://servo.org/blog/2026/05/31/april-in-servo); [webview_flutter](https://pub.dev/packages/webview_flutter).

## 4. Comparison table (1 = poor, 5 = excellent)

| | Six platforms | HTML e-mail | Text / IME | Accessibility | Resource efficiency | Linux consistency | Mobile maturity | Web quality | Dev velocity (solo + AI) | License |
|---|---|---|---|---|---|---|---|---|---|---|
| **Tauri 2 + web UI** | 5 | 5 | 5 | 5 | 3 | 2 | 3 | 5 | 5 | 5 (not re-verified today) |
| **blinc.rs** | 2 | 1 | 1 | 1 | Unmeasured | 4 | 2 | 1 | 2 | 4 (site and LICENSE disagree) |
| **Crux** | Shell-dependent | Shell-dependent | 5 | 5 | n/a | n/a | 5 | 4 | 1 | 5 |
| **gpui-kit** | 1 | 1 (3 with Wry) | 4 desktop, 1 web | 4 desktop, 1 web | 4 (12 MB binary; memory unmeasured) | 3 | 1 | 1 | 3 | 5 |
| **FerroUI** | 2 | 1 | 3 | 2 | Unmeasured | 4 | 1 | 1 | 2 | 5 |
| **fission.rs** | 2 | 1 | 2 | 2 | Unmeasured | 4 | 1 | 1 | 1 | 5 |
| **Dioxus (webview)** | 4 | 5 | 5 | 5 | 3–4 (under 5 MB binary; same webview memory) | 2 | 3 | 5 | 3 | 5 |
| **Dioxus Native (Blitz)** | 2 | 2 | 2 | 2 | Unmeasured | 5 | 1 | n/a | 2 | 5 |
| **Lynx** | 2 | 2 | 3 | 2 | Unmeasured | n/a (no Linux) | 5 | 3 | 3 | 5 |

Tauri's resource-efficiency score uses the figures from Part A (109 MB idle, 57 MB bundle). GPUI Kit's own comparison gives a ~12 MB minimal binary and explicitly does not measure memory.

## 5. Verdict per option

- **blinc.rs:** not better than Tauri. It offers one Rust codebase and GPU rendering, at the cost of no accessibility, no IME on web, no devtools and a single maintainer.
- **Crux:** not a UI choice. It is better only as a testing discipline for the core, which Zelva can adopt without the framework.
- **gpui-kit:** the strongest native toolkit here for desktop, with virtual lists, data tables, AccessKit and headless tests. It is not better for Zelva: web is showcase-only, mobile is experimental, and its webview still means WebKitGTK under X11.
- **FerroUI:** not better. Its breadth is promising, but it is seven weeks old, unverified on real devices, and has no HTML or webview.
- **fission.rs:** not better. It covers the most targets on paper with the least evidence behind them.
- **Dioxus (webview):** equal renderer, smaller ecosystem. It buys a single Rust language and direct core calls without IPC. It costs Tauri's plugins and mobile tooling, and the JS rich-text-editor and component ecosystem.
- **Dioxus Native / Blitz:** not shippable today. It is the only native path that could ever render e-mail HTML natively, and it is worth a yearly re-check.
- **Lynx:** better than Tauri only on mobile, where it is proven at scale. It loses Linux and the web accessibility story, and it adds a JS host between the UI and the Rust core.

## 6. What "native rendering" would buy and cost

**Buys**
- Consistent pixels for the app chrome across desktops.
- No WebKitGTK dependency for the chrome, hence no distro fragmentation.
- Small binaries: GPUI Kit reports ~12 MB.
- Possibly lower memory, but this is unproven; I found no controlled measurement for any of the seven.

**Costs**
- **HTML e-mail:** every option needs a webview for the reading pane. On Linux that brings WebKitGTK back, with stricter limits (GPUI Kit needs X11 or XWayland).
- **Web build:** canvas targets fail WCAG 2.2 AA and IME out of the box, so a second web UI would be needed, which defeats "one codebase."
- **Text editing and accessibility:** these come free in a browser and must be built or validated per platform otherwise.
- **Tooling:** browser devtools, Playwright and mature rich-text editors are replaced by young harnesses.
- **AI-agent velocity:** agents know React and the DOM far better than the DSLs of 37-to-580-star projects.
- **Bus factor:** three of the options depend on one person.

## 7. Recommendation

**Keep Tauri 2 + web UI (React or Solid) with the Rust core compiled to WASM for the web build.** It is the only option that meets HTML e-mail, IME, WCAG and six platforms with one codebase.

Consider three hybrid shapes:
1. **Capacitor for iOS and Android with the same web UI,** if first-party push and background plugins matter more than one shell. Capacitor 8 details come from search summaries only (UNVERIFIED); check before adopting.
2. **Move desktop to Tauri 3's Chromium runtime once stable,** to fix Linux consistency. Bundle size and memory for it are UNVERIFIED.
3. **Re-check Blitz in mid-2027.** Trigger: stable release, iOS support, and evidence of e-mail-like HTML (tables, floats, inline styles) rendering correctly.

Do not build a native shell with an embedded webview reading pane. It keeps WebKitGTK on Linux and forces a second UI for the web build.

**Not verified today:** FerroUI, Fission and Blinc on real devices; memory or binary size for Blinc, FerroUI, Fission, Lynx and Dioxus Native; Lynx native library size; Fission's claimed production users; Blinc desktop IME; and the Tauri license text.