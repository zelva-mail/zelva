# Contributing to Zelva

Thank you for helping. Zelva is in its requirements phase, so the most useful contribution right now is a careful read of the requirements and the decisions behind them.

## Where to start

- The decision log under `docs/decisions/` records what has been settled and why.
- `docs/research/` holds the evidence those decisions rest on.
- `docs/prd/` holds the requirements, starting with `PRD-00-foundations.md`.

If something is unclear, missing or wrong, open an issue that says which document and which statement.

## Development environment

Zelva keeps its toolchain in `flake.nix`, so nothing is installed globally. With [Nix](https://nixos.org) and [direnv](https://direnv.net) installed:

```
direnv allow
```

direnv then loads the development shell whenever you enter the directory. You can also enter it by hand with `nix develop`.

Nix reads the flake through git, so a new file only affects the shell once it is staged or committed.

### Cloning

Nix reads the flake through git and cannot read repositories that use reftable ref storage. Most contributors never have this problem: git's default is the files format. You have it only if your Git is configured for reftable, and then entering the directory fails with `unsupported extension name extensions.refstorage`.

Clone with the files format to avoid it:

```
git clone --ref-format=files <repository url>
```

If a clone already uses reftable, convert it before making commits. Close editors and stop background git first, because concurrent writes during migration can leave the refs inconsistent, and the repository must have no linked worktrees:

```
git maintenance stop 2>/dev/null || true
git refs migrate --ref-format=files --dry-run
git refs migrate --ref-format=files
```

Then run `direnv reload`.

## Pull requests

- Pull requests target `master`.
- Keep each pull request small enough to review in one sitting.
- If a piece of work is too large for that, split it into stacked pull requests: each one based on its parent's branch and coherent on its own. They are merged from the bottom up.
- Describe what changed and why. Link to the requirement or decision it implements.

## Commits and sign-off

Sign off every commit:

```
git commit -s
```

The sign-off is the [Developer Certificate of Origin](https://developercertificate.org). It says that you have the right to submit the work under the project's license. It applies to commits produced with AI tools as well: you sign off because you take responsibility for what is submitted.

## License of contributions

- Contributions to files under the [Apache License 2.0](LICENSE) are accepted under that license through your sign-off.
- Some files are published under the source-available [Zelva Pro license](LICENSE-PRO). Contributions to those files need a separate contributor license agreement, because your work would not be under an open-source license. Until that agreement is published, pull requests that change files carrying the Pro license header cannot be accepted. Open an issue first so the change can be discussed.

## Writing

Documents are written in plain English with American spelling. Say what something does for the person using it before saying how it works.

## Reporting security problems

Please do not open a public issue for a security problem. See [SECURITY.md](SECURITY.md).

## Conduct

By taking part in this project you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).
