# 04 · CalDAV/CardDAV, Apple build options, Thundermail and the name check

| | |
|---|---|
| Status | Research snapshot taken 2026-11-23. Not a living document |
| Method | Direct checks by the lead agent: registry lookups through RDAP, the Apple App Store search API, the GitHub search API, crates.io and npm registry APIs, web search |
| Labels | **V** read on the primary page or API on the day · **V2** from a search-result summary, page not opened · **U** unverified |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-009 (CalDAV/CardDAV alongside JMAP), DEC-040 (the name Zelva), DEC-043 (Apple builds), DEC-057 (Thundermail as a provider preset).

---

## 1. CalDAV and CardDAV where JMAP has no calendar or contacts

### Fastmail
- CalDAV is served at `caldav.fastmail.com` and CardDAV at `carddav.fastmail.com`, port 443, TLS required. `dav.fastmail.com` is the legacy combined host. **V2**
- Both hosts answer the RFC 6764 well-known addresses `/.well-known/caldav` and `/.well-known/carddav`, which is how clients find the principal and the calendar or address-book roots. **V2**
- Sign-in needs an app password, not the account password. App passwords require a Standard plan or higher; Basic and Lite accounts cannot use CalDAV, CardDAV, IMAP or SMTP. **V2**

### Rust crates (crates.io API)
| Crate | Version and date | License | What it offers |
|---|---|---|---|
| `libdav` | 0.11.2, 2026-10-30 | ISC | CalDAV and CardDAV client implementations; the most downloaded (60k) |
| `fast-dav-rs` | 0.19.0, 2026-10-04 | not checked | CalDAV and CardDAV client on hyper and rustls, with HTTP/2 and compression |
| `io-webdav` | 0.13.0, 2026-11-21 | not checked | WebDAV client and server |
| `icalendar` | 0.17.17, 2026-10-26 | MIT or Apache-2.0 | Strongly typed iCalendar builder and parser |
| `rrule` | 0.14.0, 2025-04-20 | MIT or Apache-2.0 | Recurrence rules as defined in the iCalendar RFC |
| `calcard` | 0.3.14, 2026-09-15 | not checked | From Stalwart Labs: iCalendar/JSCalendar and vCard/JSContact parsing, building and conversion |
| `vcard-rs` | 0.6.1, 2026-11-20 | not checked | vCard parser, validator, editor, merger and builder |

Stale: `minicaldav` (last updated 2023), `caldav-utils` (2023), `kitchen-fridge` (2022), `carddav` (2018). All **V**.

### Limits
- **From a browser, DAV is usually blocked.** `PROPFIND`, `REPORT`, `MKCOL`, `COPY` and `MOVE` with XML bodies each trigger a CORS preflight. The server must answer `OPTIONS` without authentication and allow the WebDAV methods and the `Authorization`, `Depth`, `If-Match` and `Prefer` headers. Third-party DAV servers rarely do, and library documentation advises proxying instead. **V2**
- **Not tested:** whether Fastmail's DAV hosts send permissive CORS. Until a test proves otherwise, assume CalDAV and CardDAV do not work from the web build against Fastmail. **U**
- **Not tested:** whether RFC 6764 discovery succeeds for a Fastmail account on a custom domain, where the domain's own web host is not Fastmail. **U**

### Scheduling
- iTIP (RFC 5546) defines the scheduling messages. iMIP (RFC 6047) carries them as `text/calendar` parts in ordinary email, which works with any mail server. CalDAV scheduling (RFC 6638) adds schedule-inbox and schedule-outbox collections and the `SCHEDULE-AGENT` setting. **V2**
- Reported pitfalls: updates arriving out of order because of sequence numbers; a server outbox that answers free-busy queries but not scheduling requests; replies arriving by email without being folded back into the organizer's event; servers whose CalDAV is not compliant. **V2**

## 2. Building and testing for Apple platforms from Linux
- **Docker-OSX** (`sickcodes/docker-osx`) runs macOS as a QEMU/KVM virtual machine inside a Docker container. Xcode and the iOS Simulator reportedly work inside it. It needs KVM and about 50 GB of disk with Xcode, and has no graphics acceleration. **V2**
- **License.** Apple's macOS license does not permit installing, using or running the software on a non-Apple-branded computer, and the developer tools license applies the same limit to the SDKs and simulators. **V2**
- **No iOS emulator exists for Linux.** The Simulator runs on macOS only. **U**
- **GitHub-hosted runners.** Standard runners, macOS included, are free and unlimited on public repositories. Larger runners are billed even on public repositories. **V**
- **Rented Macs.** Scaleway offers an M1 Mac mini from about €0.11 an hour (about €75 a month) and an M4 from about €149 a month. MacStadium starts around $139 to $149 a month. AWS EC2 Mac costs about $1.23 an hour with a 24-hour minimum, roughly $900 a month. A new Mac mini M4 with 16 GB costs about $599. **V2**

## 3. Thundermail
- Thundermail supports third-party clients. The user creates an app password in the Thundermail dashboard under Email Settings. **V2**
- JMAP is served on port 443 at `mail.thundermail.com`; IMAP uses port 993. No API-token mechanism was found. **V2**

## 4. Name check: "Zelva"
### Domains (RDAP)
| Domain | Status |
|---|---|
| zelva.com | Registered 2005-01-02. Parked on Afternic nameservers, so listed for sale. **V** |
| zelva.app | Registered 2026-03-01 through Namecheap. **V** |
| zelva.dev | Registered 2026-03-12 through GMO Internet. In use by an independent Japanese software brand that publishes browser music tools. **V** |
| zelva.io | Registered 2023-04-17 through GoDaddy, registrant privacy-protected. **V** |
| zelva.org | Registered 2004-11-23 through Tucows. **V** |
| zelva.email | Not registered. **V** |

### App stores and registries
- **Apple App Store (US):** no app named exactly "Zelva". "Zelva Scanner" exists (a QR ticket-scanning app for the Zelva Events platform), as does "Rychlá Želva Praha". **V**
- **Google Play:** no app named simply "Zelva" found. **V2**
- **GitHub:** the organization name `Zelva` is taken by an empty organization created in 2014. **V**
- **crates.io and npm:** the name `zelva` is unregistered on both. **V**

### Trademark
- US application serial 99732039 for "ZELVA" was filed 2026-03-30 by an individual. It is in International Class 25 (clothing), status live and pending, with a non-final action mailed 2026-08-10. **V**
- No software-class search could be completed: the registries blocked automated access. EUIPO, UKIPO, India and WIPO were not searched. **U**
- Several unrelated small companies use the name, including ZELVA LTD in the UK (company 12898225). **V2**

### Meaning
"Želva" means tortoise in Czech, Slovak, Slovene and Croatian. Želva is also a town in Lithuania and a small town in Belarus. **V2**

### Alternatives checked in a first pass
| Name | .com | .app | Other |
|---|---|---|---|
| Zelvo | registered 2007, parked | registered | |
| Zelvora | registered 2024, parked for sale | not registered | `.dev` not registered; no exact App Store match; GitHub user taken, several "Zelvora AI" accounts exist. **V** |
| Zerova | registered 2004, in use | registered | |
| Zephyo | registered 2025 | not registered | `.dev` not registered; no exact App Store match; GitHub user and project organization taken. **V** |
| Zenvo | registered 2004, parked for sale | registered | |
| Zelvi | registered 2010, parked | registered 2026-04-29 | |
| Zenivo | registered 2007 | registered | |
| Zeravo | registered 2017, parked | registered 2026-06-22 | |

Every short brandable name checked has its .com taken. Renaming would not buy a cleaner field.

## Sources
- Fastmail server names and ports: https://www.fastmail.help/hc/en-us/articles/1500000278342-Server-names-and-ports
- Fastmail app passwords: https://www.fastmail.help/hc/en-us/articles/360058752854-App-passwords
- crates.io API: https://crates.io/api/v1/crates?q=caldav, https://crates.io/api/v1/crates?q=carddav
- CORS and WebDAV from browsers: https://tsdav.vercel.app/intro, https://www.williamjbowman.com/blog/2021/05/13/enabling-cors-for-nginx-webdav-and-caldav-reverse-proxy
- Docker-OSX: https://github.com/sickcodes/docker-osx
- Apple software license agreements: https://www.apple.com/legal/sla
- GitHub-hosted runners: https://docs.github.com/en/actions/reference/runners/github-hosted-runners
- GitHub Actions billing: https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions
- Thundermail third-party clients: https://support.tb.pro/hc/en-us/articles/45584951087635-Can-I-use-Thundermail-with-third-party-clients
- ZELVA trademark application: https://www.trademarkia.com/zelva-99732039
- Apple App Store search API: https://itunes.apple.com/search?term=zelva&entity=software&country=us
