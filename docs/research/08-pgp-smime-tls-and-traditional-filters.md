# 08 · OpenPGP, S/MIME, transport TLS, sender checks and traditional filters

| | |
|---|---|
| Status | Research snapshot taken 2026-11-23. Not a living document |
| Method | Research agent reading crates.io and docs.rs, project documentation, RFCs, client documentation and registries |
| Labels | **V** read from the primary page or API on the day · **U** unverified: search summary, inference or unreachable page |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-012 (full S/MIME and OpenPGP), DEC-039 (sender checks), DEC-048 to DEC-051 (traditional filters, in-transit presentation, key storage, web crypto).

---


**V** = read from the primary page or API today. **U** = UNVERIFIED: search-summary only, my inference, or the page was unreachable.

## 0. Corrections to the brief

1. **`Email/junkScore` and `junkScoreThreshold` exist in no JMAP spec.** Datatracker returns zero documents for "junk" and "spam" ([junk](https://datatracker.ietf.org/doc/search/?name=junk), [spam](https://datatracker.ietf.org/doc/search/?name=spam)). The jmapio spec tree has no spam file, and Stalwart's capability list has no spam capability ([Stalwart](https://stalw.art/docs/http/jmap/capabilities)). Only the `$junk` and `$notjunk` keywords are real (RFC 8621). `junkScore` exists only in Thunderbird's WebExtension API (U).
2. **`draft-ietf-mtls` (SMTP TLS Routing) is not on Datatracker.** Searches for "mtls", "tls-routing" and "smtp-tls-routing" return nothing. The closest document is the individual `draft-nurpmeso-smtp-tls-srv-08` (2026-08-03, Informational), which defines an `_smtp-tls` SRV record ([V](https://datatracker.ietf.org/doc/draft-nurpmeso-smtp-tls-srv/)).
3. **Header protection is now RFC 9788** (August 2025), not the LAMPS draft. It uses `hp="cipher"`/`"clear"`, the `HP-Outer` field and the `hcp_baseline` policy, which replaces the Subject with `[...]` ([V](https://www.rfc-editor.org/rfc/rfc9788.html)).
4. **`bayan`, `spam-filter` and `mailspam` are not on crates.io or docs.rs.** Each returns 404 from the crates.io API and docs.rs, and search returns zero hits.
5. **mail-auth 0.16.0 has no Authentication-Results parser.** `auth_results` only contains builders ([V](https://docs.rs/mail-auth/0.16.0/mail_auth/auth_results/index.html)).

## 1. OpenPGP in Rust

| Crate | Version (date) | License | Maintainers, cadence | Standards | Targets |
|---|---|---|---|---|---|
| `pgp` (rPGP) | 0.21.1 (2026-11-11) | MIT OR Apache-2.0 | Published by dignifiedquire; recent commits from link2xt, H. Schaefer, C. Reitter, A. Kjäll. Seven 0.x releases since 2025-05, each breaking | Targets RFC 9580 plus "latest v6 formats and AEAD"; all RFC 4880/6637 formats; PQC behind the `pqc` flag (RFC 9980) | CI-tested: wasm32-unknown-unknown, arm-linux-androideabi, x86_64-apple-darwin, x86_64-pc-windows-gnu. "Should work, not in CI": Android aarch64/armv7/x86_64; iOS i386/x86_64/armv7/armv7s only |
| `rpgpie` | 0.12.1 (2026-10-26) | MIT OR Apache-2.0 | H. Schaefer; 64 versions since 2024-02 | "Experimental high level API for rPGP" | Same as rPGP |
| `sequoia-openpgp` | 2.4.2 (2026-10-14) | LGPL-2.0-or-later | nwalfield, teythoon; six releases in 2026 | RFC 9580 and 9980 plus RFC 4880 | README lists Linux, macOS, Windows only; iOS, Android and WASM are not mentioned (U) |
| `rnp-rs` | 0.1.18 (2026-09-19) | BSD-2-Clause |Bindings to librnp (Thunderbird desktop's engine) | U | U |

Sources: [pgp](https://crates.io/api/v1/crates/pgp), [rpgpie](https://crates.io/api/v1/crates/rpgpie), [sequoia](https://crates.io/api/v1/crates/sequoia-openpgp), [PLATFORMS](https://raw.githubusercontent.com/rpgp/rpgp/main/docs/PLATFORMS.md), [releases](https://api.github.com/repos/rpgp/rpgp/releases?per_page=8), [rnp-rs](https://crates.io/api/v1/crates/rnp-rs).

**rPGP specifics**
- **Layers:** it implements layers 1 to 3 only: "The APIs are low level building blocks and do not claim that using them are (a) secure or (b) following the OpenPGP specification". Expiry, revocation and key flags are left to the application ([V](https://github.com/rpgp/rpgp)).
- **Algorithms:** RSA, DSA, ECDH, ECDSA, EdDSA, X25519/Ed25519, X448/Ed448, SECP256k1 are implemented. Brainpool is missing. Elgamal encryption and v5 (LibrePGP) are "Not planned". GnuPG's proprietary v5 SKESK and OCB are decrypt-only ([V](https://raw.githubusercontent.com/rpgp/rpgp/main/docs/IMPL_STATUS.md)).
- **Autocrypt 1.1 is fully implemented** (README).
- **Audits:** Radically Open Security, December 2024 (CVE-2024-53856 and CVE-2024-53857, fixed); ETH, March 2024. The `rsa` crate is flagged as "vulnerable to the Marvin attack" ([V](https://raw.githubusercontent.com/rpgp/rpgp/main/docs/SECURITY_STATUS.md)).
- **Production users named in the README:** Delta Chat, GpgFrontend, rpm, himalaya, prs, rsop, signstar, oct-git.

**Sequoia specifics**
- **Backends:** Nettle (default), Botan, OpenSSL, Rust, or Windows CNG. "Exactly one can be enabled at a time" ([V](https://gitlab.com/sequoia-pgp/sequoia/-/raw/main/README.md)).
- **Ecosystem:** `sequoia-wot` (web of trust), `sequoia-net` 0.31.0 (WKD and key servers), `sequoia-autocrypt` 0.26.0, and the high-level `sequoia` crate.
- **Named users:** `sq`, `sqv`, and the `gpg-sq`/`gpgv-sq` drop-in replacements.

Binary size and compile time: no published figures found (U). Both need measuring.

**Key discovery and header protection**
- **Autocrypt Level 1:** `Autocrypt: addr=…; prefer-encrypt=mutual; keydata=…` (under 10 KiB), `Autocrypt-Gossip` inside the encrypted payload, and the Setup Message for multi-device. The newest valid header wins. A peer whose key is more than 35 days stale gets `discourage`. The four UI states are disable, discourage, available and encrypt ([V](https://docs.autocrypt.org/level1.html)).
- **WKD:** SHA-1 of the local part, z-base-32 encoded, then the advanced method followed by the direct method. It is an individual draft, not an RFC (status U) ([V](https://www.ietf.org/archive/id/draft-koch-openpgp-webkey-service-18.html)).
- **keys.openpgp.org:** only verified user IDs are distributed. Requests are logged for 30 days with anonymised IPs. Verifying a new key unpublishes the address from the previous key. Thunderbird (since v78), GPG Suite, OpenKeychain 5.3 and `sq` use it by default ([V](https://keys.openpgp.org/about/privacy), [usage](https://keys.openpgp.org/about/usage)).
- **Receiving:** handle both the RFC 8551 wrapped form and RFC 9788 injected headers. Hide Legacy Display elements.

**How clients present it**

| Client | Behavior |
|---|---|
| Thunderbird 115/128 | Custom acceptance model: "Thunderbird ignores key signatures". Automatically discovered keys are unconfirmed but usable (U for the default state) ([V](https://sequoia-pgp.org/blog/2021/04/08/202103-a-new-backend-for-thunderbird)). 115 added automatic enabling/disabling of encryption, combined sign+encrypt as the default, an expired-key warning on send, and an "always send public key with autocrypt header" option. 128 disabled LibrePGP v5 decryption and permissive import ([V](https://www.thunderbird.net/en-US/thunderbird/115.0/releasenotes/), [128](https://www.thunderbird.net/en-US/thunderbird/128.0/releasenotes/)). Whether discovery is on by default is U (conflicting sources). |
| FairEmail | PGP is delegated to OpenKeychain or PGPony. It sends the Autocrypt header only on signed and encrypted mail "because too many email servers have problems with the often long Autocrypt header". It never sends inline PGP. Sign-by-default and encrypt-by-default toggles exist ([V](https://raw.githubusercontent.com/M66B/FairEmail/master/FAQ.md)). |
| Thunderbird Android | Built-in OpenPGP and no S/MIME (U: release notes and the issue list reachable today do not confirm it) ([releases](https://api.github.com/repos/thunderbird/thunderbird-android/releases?per_page=12)). |
| Proton | Per-contact "trusted keys" act as pinning. "You will be asked if you want to trust their new primary key" ([V](https://proton.me/support/address-verification)). |
| Canary | U (page 404). |

**Classic pitfalls**
- **Sign inside encrypt:** never send a bare outer signature over encrypted data. Thunderbird 115 fixed decryption "with an additional outer signature layer".
- **MDC checking:** rPGP 0.20 made MDC-checked-first decryption of SEIPDv1 the default.
- **AEAD-flagged keys:** these fail against MDC-mode senders (FairEmail's Posteo note).
- **Mailing lists:** subject prefixes and footers break inline signatures (U for a fetched source).
- **Nested encryption:** handle it explicitly (Thunderbird 115 added this).

## 2. S/MIME in Rust

| Piece | Crate | State |
|---|---|---|
| CMS | `cms` 0.3.0-rc.2 (2026-11-09), MSRV 1.87 | Modules: signed_data, enveloped_data, authenveloped_data, encrypted_data, compressed_data, digested_data, kemri, revocation, timestamped_data, builder. "Decoding does not verify signatures or establish certificate trust." Three release candidates in four weeks ([V](https://docs.rs/cms/0.3.0-rc.2/cms/), [README](https://raw.githubusercontent.com/RustCrypto/formats/master/cms/README.md)) |
| PFX import | `pkcs12` 0.2.0-rc.0 (2026-11-05); stable is 0.1.0 (2024-01) | ([V](https://crates.io/api/v1/crates/pkcs12)) |
| Certificate | `x509-cert` 0.3.1 (2026-11-20) | Features: pem, std, builder, fingerprint, hazmat, sct, signature |
| Signature check | `x509-verify` 0.4.10 | Signature only, "early, experimental", no chain logic |
| Path validation | `pkix-path` 0.4.0 (RFC 5280, no_std), `pkix-chain` 0.5.0, `pkix-profiles` 0.4.0 (includes RFC 8551), `x509-path-finder` 0.7.1 | Versions only; quality U |
| Revocation | `ocsp` 0.4.0, `pkix-revocation` 0.4.0 | Versions only |
| Glue | `smime-tree` 0.4.1 ("S/MIME sign/verify/encrypt/decrypt via key traits") | 342 downloads |

**`cryptographic-message-syntax` is not the more mature choice for mail.** 0.28.0 (2025-08-17) offers SignedData and RFC 3161 only: no EnvelopedData, no S/MIME attributes, no PFX. It was built for `apple-codesign`, and only 31% of it is documented ([V](https://docs.rs/cryptographic-message-syntax/0.28.0/cryptographic_message_syntax/)).

**Interop baseline, from Stalwart's matrix:** RSA + AES-256-CBC + PKCS#1 v1.5 is "the safe default for unknown clients". Outlook only decrypts ECDH with the NULL-parameter key-wrap encoding. Stalwart's doc places Apple Mail as supporting none of GCM, OAEP or EC (V as Stalwart's claim) ([V](https://stalw.art/docs/encryption/smime/)).

**Vendored C backends on mobile and WASM: U per crate.**
- The `openssl` README covers versions and license only ([V](https://raw.githubusercontent.com/sfackler/rust-openssl/master/README.md)).
- The `boring` README does not state WASM or iOS support.
- `botan` has a `vendored` flag that "Build[s] a copy of the C++ library directly" ([V](https://github.com/randombit/botan-rs)).
- `aws-lc-rs` 1.19.0 pulls in `aws-lc-sys`, a C build ([V](https://docs.rs/crate/aws-lc-rs/1.19.0/features)).
- My inference: every one of these needs a C or C++ toolchain per target, so the pure-Rust path is the only one that compiles unchanged on all five targets.

**Platform keystores**
- **`keyring` 4.2.0:** the default set is Apple keychain, Windows native and zbus secret-service. The Android store is non-default (`android-native-keyring-store`). It stores "both plain-text and binary secrets", so it suits a wrapping key, not a non-exportable private key ([V](https://github.com/open-source-cooperative/keyring-rs)).
- **Android Keystore:** keys are non-exportable and can be TEE- or StrongBox-backed. StrongBox supports only "RSA 2048, AES 128 and 256, ECDSA, ECDH P-256, HMAC-SHA256, Triple DES". Wrapped-key import needs API 28 ([V](https://developer.android.com/privacy-and-security/keystore)).
- **Apple and Windows:** Secure Enclave is P-256 only, and the TPM KSP supports RSA and P-256. Both U.

**Certificates**
- **Actalis:** the mailbox-validated certificate is free for the first year and renews at €6 + VAT per year. IV is €45 + VAT, OV €60 + VAT, SV €80 + VAT. Validity is 1 or 2 years ([V](https://www.actalis.com/s-mime-certificates)).
- **Certum and SwissSign prices:** U.
- **ACME for S/MIME:** RFC 8823 is Informational (April 2021). No public ACME S/MIME CA was found, and Let's Encrypt S/MIME is U ([V](https://datatracker.ietf.org/doc/draft-ietf-acme-email-smime/)).
- **Test corpora:** U. The Fastmail JMAP-TestSuite covers RFC 9219 but has no S/MIME test paths ([V](https://api.github.com/repos/fastmail/JMAP-TestSuite/git/trees/master?recursive=1)).

## 3. End-to-end encrypted mail over JMAP

**Mechanics (RFC 8621, V)** ([message](https://raw.githubusercontent.com/jmapio/jmap/master/spec/mail/message.mdown), [submission](https://raw.githubusercontent.com/jmapio/jmap/master/spec/mail/messagesubmission.mdown))
- **Composing:** build raw MIME client-side, upload it, then `Email/import` it into Drafts with `$draft`, or create it through `Email/set` with `bodyStructure`.
- **Sending:** create an `EmailSubmission`. The server "MUST remove any *Bcc* header field" and "MAY add or remove other header fields".
- **Reading:** `bodyStructure` does not recurse into `message/rfc822`. Download the raw message through `downloadUrl` (`accountId`, `blobId`, `type`, `name`), or fetch the `application/pkcs7-mime` part by `blobId`.
- **`bodyValues`:** covers `text/*` parts only. Encrypted bodies are therefore opaque, while multipart/signed plaintext stays server-searchable.
- **`preview`:** at most 256 characters. What it shows for encrypted mail is server-dependent.

**Stalwart (V)**
- **Capabilities:** it advertises no `smimeverify`, `smime-advanced` or spam capability.
- **Submission:** sending goes through its internal SMTP pipeline. Imports must be valid RFC 5322 ([mail](https://stalw.art/docs/email/jmap/mail/), [capabilities](https://stalw.art/docs/http/jmap/capabilities)).
- **Server-side S/MIME:** it can apply S/MIME itself for at-rest encryption or as a gateway, and refuses private-key upload.

**Fastmail behavior for encrypted or signed mail:** U (not accessible). The dev page documents only Masked Email ([V](https://www.fastmail.com/dev/)).

**Draft-05 of the S/MIME sender extension** (2026-11-17, Proposed Standard): adds `urn:ietf:params:jmap:smime-advanced`, `smimeOperations`, `headersToObscure`, `headersToProtect`, `Email/smimeDecrypt` and the `isEncrypted`/`isSigned` filters. It "doesn't support management of user's private keys" ([V](https://datatracker.ietf.org/doc/draft-ietf-jmap-smime-sender-extensions/)).

**Attachments and `cid:`:** inside an encrypted payload they have no server `blobId` or `cid` handle, so map `cid:` to decrypted in-memory blobs. In multipart/signed mail they are ordinary siblings (V).

**Spam handling**
- **Keywords:** `$junk` and `$notjunk` are RFC 8621.
- **Retraining on Stalwart:** there is no JMAP spam-settings API. Retrain by moving to the Junk-role mailbox and flipping the keywords through `Email/set`.
- **Training minimum:** the classifier needs "at least 100 spam and 100 ham samples before it is trained for the first time" ([V](https://stalw.art/docs/spamfilter/classifier/)).

## 4. "Encryption in transit": what a client can do

| Item | Feasible? | Notes |
|---|---|---|
| (a) TLS to the server | Yes, enforce | RFC 8620: "all requests MUST use TLS 1.2" and "Clients MUST validate TLS certificate chains" ([V](https://raw.githubusercontent.com/jmapio/jmap/master/spec/jmap/securityconsiderations.mdown)). FairEmail offers pin-on-exception (V). |
| (b) TLS evidence in `Received` | Display only | Annotation formats differ per MTA (U). Only the header your own server added is attributable, and it covers one hop. Opportunistic STARTTLS is not authentication. |
| (c) Recipient posture at compose | Inform only | MTA-STS (RFC 8461): `_mta-sts` TXT plus HTTPS policy, mode enforce, testing or none ([V](https://www.rfc-editor.org/rfc/rfc8461.html)). `TLS-Required: No` is a sender-MTA instruction and a client cannot enforce it ([V](https://www.rfc-editor.org/rfc/rfc8689.html)). Enforcement belongs to the user's server. |
| (d) TLS-RPT | Display presence | RFC 8460 is receiver-side aggregate reporting ([V](https://www.rfc-editor.org/rfc/rfc8460.html)). |

**Precedent:** Gmail's help page still describes a lock icon with standard TLS, none and enhanced (S/MIME) ([V](https://support.google.com/mail/answer/7039474)). The retired-padlock claim, and Outlook, Apple Mail, Fastmail and Proton behavior, are all U.

**Crates**
- **hickory-resolver 0.26.3:** `https-ring`, `dnssec-ring`, `rustls-platform-verifier`, `webpki-roots`. WASM support is not stated (U) ([V](https://docs.rs/crate/hickory-resolver/latest/features/)).
- **hickory-proto 0.26.3:** has a `wasm-bindgen` feature.
- **mail-auth 0.16.0:** has an `mta_sts` module for parsing MTA-STS and TLS-RPT records. It "compiles and runs on wasm32-unknown-unknown" with `--no-default-features --features dns-doh,rust-crypto` ([V](https://docs.rs/mail-auth/0.16.0/mail_auth/)).
- **`mailrs-mta-sts` 2.0.2:** 221 downloads.
- **MTA-STS policy fetch, cache and MX matching:** write it yourself.

## 5. SPF and domain age

**SPF**
- **API:** `MessageAuthenticator::verify_spf(SpfParameters::helo(...)` or `mail_from(...))`. `SpfParameters` is "the client IP, the identity to check and the values used for macro expansion", so the caller must supply the IP ([V](https://docs.rs/mail-auth/0.16.0/mail_auth/spf/verify/index.html)).
- **Trust:** an IP taken from `Received` is forgeable unless it comes from your own server's header. Call it "client-side evaluation".
- **Authentication-Results:** the server's header is the authoritative input, but needs its own parser and a trusted `authserv-id`. Per-registry rate limits for DNS: U.
- **RFC 9979:** `$istrusted` "must not be applied based only on SPF/DKIM/DMARC" ([V](https://www.rfc-editor.org/rfc/rfc9979.html)).

**Domain age via RDAP**
- **Bootstrap:** [data.iana.org/rdap/dns.json](https://data.iana.org/rdap/dns.json), publication 2026-11-20. The TLD coverage I read from it is unreliable because of truncation.
- **`events`:** the response carries `eventAction: registration`. Verified for `.com` ([Verisign](https://rdap.verisign.com/com/v1/domain/example.com)) and `.ch` ([SWITCH](https://rdap.nic.ch/domain/example.ch)).
- **Coverage:** RDAP has been "the definitive source" for gTLDs since 28 January 2025 ([ICANN](https://www.icann.org/en/announcements/details/icann-update-launching-rdap-sunsetting-whois-27-01-2025-en)). ccTLD coverage is uneven (per-TLD U).
- **Crates:** `icann-rdap-client` 1.0.1 (2026-10-06), `rdap_client` 0.2.0 (2021), `whois-rust` 3.1.0.
- **Privacy:** the registry sees each query. The bootstrap file is static.

## 6. Traditional filtering

**Precedent:** Thunderbird has an adaptive filter, Apple Mail has on-device junk filtering with training, FairEmail relies on the server's spam folder, and Outlook relies on EOP. Details and constants are U (Mozilla Support blocked, Apple returned 429).

**Crates (V)**

| Crate | Suitability |
|---|---|
| `linfa-bayes` 0.9.0 | Not incremental |
| `bayesian` 0.3.0 | TF-IDF, binary serialisation, 358 downloads |
| `ikigai-bayes` 0.5.1 | SpamBayes-style Robinson and Fisher, idempotent training and exact untraining, 1,976 downloads |

**Blocklists**
- **SURBL:** free use covers organizations with "fewer than 1,000 users" or "fewer than 250,000 messages per day". It "does not include embedding our data in any way into products or services for which a fee is charged", and "Any product or service which makes use of our intelligence must have a valid SDS usage agreement" ([V](https://surbl.org/usage-policy)).
- **Spamhaus:** free for "low-volume, non-commercial users"; otherwise "an annual subscription-based service is required". The numeric limit conflicts between sources (U) ([V](https://www.spamhaus.org/blocklists/domain-blocklist/)).
- **URIBL and offline snapshots:** terms U. No bundling right was found.
- **Lookup privacy:** DNS lookups disclose the queried domain.

**Heuristics and accuracy**
- **Attachment types:** dangerous extensions, HTML with script, mismatched MIME type.
- **QR codes:** "22% of phishing attacks used QR codes in October 2023" (Hoxhunt, U).
- **Accuracy:** BERT reaches about 99% against about 90–95% for naive Bayes in benchmarks (U).

## Recommendations

### v1 scope per platform

| Layer | Desktop (Win, macOS, Linux) | iOS and Android | Web (WASM) |
|---|---|---|---|
| OpenPGP | rPGP 0.21.x, pinned. PGP/MIME sign, encrypt, sign-inside-encrypt, verify and decrypt. Ed25519/X25519 and RSA, v4 and v6 keys. Inline PGP read-only. Autocrypt Level 1. RFC 9788 on send and receive. | Same | Same (rPGP `wasm` target is CI-tested). Keys encrypted with a passphrase-derived key in IndexedDB; there is no OS keystore |
| S/MIME | `cms` rc + `pkcs12` rc + `x509-cert`. Sign with signed attributes. EnvelopedData with AES-256-CBC, RSA v1.5, and ECDH P-256/384. Receive-only AES-GCM and triple-wrap. | Same code path. PFX import. Hardware-backed keys deferred | Same code path, but a `cms` WASM build is unverified; treat as a gated goal |
| Keys at rest | Database key in `keyring` | Database key in Keychain or Keystore-wrapped | IndexedDB only |
| Not in v1 | Sequoia (LGPL-2.0-or-later, Nettle, no documented mobile/WASM), PQC, v5 generation, web of trust, vendored OpenSSL on mobile | | |

### Definition of "encryption in transit" for a client
1. **Enforced claim:** "TLS 1.2+ with validated certificates between Zelva and your server; cleartext refused". Allow pin-on-exception only as an explicit user action.
2. **Evidence, not a guarantee:** show the first-hop `Received` TLS annotation, and at compose show each recipient domain's MTA-STS mode, DANE TLSA and TLS-RPT presence, labeled "depends on your server".
3. **Never claim:** end-to-end or server-to-server transport encryption. Do not emit `TLS-Required: No`.

### On-demand sender check
- **Trigger:** on user tap, and only then on the network.
- **Local steps:** parse trusted Authentication-Results. Check `From` against envelope and `Reply-To`, display-name lookalikes and homographs.
- **Network steps, with disclosure and a cache:**
  - SPF record and evaluation via mail-auth over DoH, preferring the server's result.
  - RDAP with the IANA bootstrap; flag domains under 90 days and say "unknown" where a TLD is absent.
  - TLS posture.
- **Output:** one card with pass/fail/unknown and the provenance of each verdict.

### Top risks
1. S/MIME in pure Rust is release-candidate grade with no integrated chain validation.
2. rPGP breaks its API with every release and ships no semantics layer.
3. A "verified" signature is not an authenticated identity, so the TOFU and expiry UX carries the security story.
4. Server variability for encrypted mail is unmeasured, and Fastmail is unverified.
5. Keys are not synced across devices by JMAP, so Zelva needs its own sync.
6. Transit claims are easy to overstate.
7. Client-evaluated SPF is spoofable.
8. RDAP has ccTLD gaps and rate limits.
9. Blocklist licenses and lookup leakage.
10. The local filter has a cold start of about 100/100 and false positives, so auto-move only on high confidence.
11. Sequoia's LGPL does not fit static linking into app-store binaries without a relink provision.