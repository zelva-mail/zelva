# Zelva

Zelva is an open-source, JMAP-native email client with contacts and calendar, for people who want a clean inbox without giving up their privacy.

Zelva is in its requirements phase. There is nothing to install yet. Today it targets Fastmail and self-hosted JMAP servers such as Stalwart and Cyrus; Gmail and Outlook come later, when IMAP support arrives.

The [decision log](docs/decisions/README.md) records what has been settled and why, [the gap analysis](docs/gap-analysis.md) compares the founder's original brief and brand blueprint with what the research found, [the requirements](docs/prd/README.md) start with [PRD-00, Foundations](docs/prd/PRD-00-foundations.md), and [the research](docs/research/README.md) holds the evidence.

## What Zelva is meant to be

- **Assist-only triage.** Zelva suggests and you decide. Nothing moves unless you approve it. The goal is an inbox you can reach the bottom of.
- **Private by default.** Remote images and trackers are blocked. Nothing about you or your mail leaves your device without your consent. Mail is cached encrypted on your device.
- **JMAP-native, with contacts and calendar.** Mail, contacts and calendar over JMAP, and over CalDAV and CardDAV where a server does not offer them through JMAP.
- **End-to-end encryption.** OpenPGP and S/MIME: verify, decrypt, sign and encrypt.
- **Optional on-device AI.** Nothing is downloaded until you agree, and nothing leaves your device. Summaries, draft replies and better phishing detection run locally.
- **One codebase, six platforms.** Windows, macOS, Linux, the web, Android and iOS: a Rust core inside a Tauri shell. The web build is a reduced build, and its limits are published.

## Development

The repository has no application code yet. Every tool it needs comes from the Nix flake, loaded by [direnv](https://direnv.net):

```
direnv allow
```

That provides Node, Git, the GitHub CLI and direnv itself. Nothing has to be installed globally. See [CONTRIBUTING.md](CONTRIBUTING.md) for the rest.

## License

The core is under the [Apache License 2.0](LICENSE).

Pro features are published under the source-available [Zelva Pro license](LICENSE-PRO) and need a paid license for production use. That license is a draft and has not been reviewed by a lawyer yet.

## Conduct

Everyone taking part in Zelva is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).
