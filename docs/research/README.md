# Research

These notes are the evidence behind Zelva's decisions. They were gathered on 2026-11-23, before the requirements were written.

## How to read them
- They are snapshots, not living documents. Versions, prices and project health were accurate on the day they were checked.
- Each note explains its own labels. Read anything marked unverified as a lead, not a fact.
- Where a note conflicts with the decision records in `docs/decisions/`, the decisions win. The notes record what was true and what was recommended. The records record what was decided.
- Notes 09 to 11 are analyses written before the decisions were made. They are kept for their reasoning.

## Notes

| Note | Subject | Kind |
|---|---|---|
| [01](01-jmap-ecosystem.md) | JMAP specifications, server support, onboarding, push, interop pitfalls | Research |
| [02](02-market-and-competitors.md) | Existing JMAP clients, libraries, competitors, inbox-zero patterns, mobile constraints | Research |
| [03](03-stack-decision.md) | The UI stack: Tauri 2 with a web UI, and seven native-rendering alternatives | Research |
| [04](04-caldav-carddav-apple-builds-thundermail-and-naming.md) | CalDAV/CardDAV, Apple build options, Thundermail, the "Zelva" name check | Research |
| [05](05-on-device-ai.md) | Inference engines, models, classifiers, device speed, web feasibility, policy | Research |
| [06](06-backend-identity-payments.md) | Analytics and replay, OpenObserve, Kanidm, provisioning, push relay, payments, state sync | Research |
| [07](07-security-privacy-and-web-feasibility.md) | Browser access to JMAP servers, tracking protection, sender authentication, S/MIME, secrets, hardening, store rules | Research |
| [08](08-pgp-smime-tls-and-traditional-filters.md) | OpenPGP and S/MIME in Rust, encrypted mail over JMAP, transport TLS, SPF, domain age, traditional filters | Research |
| [09](09-product-analysis.md) | Framing, scope, milestones, packaging, metrics, gaps, PRD plan | Analysis |
| [10](10-ux-analysis.md) | Principles, navigation, journeys, wireframes, tokens, icon recommendation | Analysis |
| [11](11-threat-model.md) | Trust boundaries, threat register, privacy abuse cases, SEC and PRIV requirements | Analysis |

## What is still open
A few claims could not be verified on the day. They are listed with the experiment that will settle each one in the [gap analysis](../gap-analysis.md).
