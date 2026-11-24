# Security policy

Zelva is in its requirements phase and has no released versions yet. This page will list supported versions once there are any.

## Reporting a vulnerability

Please report security problems privately, through GitHub's vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**.

Please do not open a public issue for a security problem.

Include what you can of the following:

- What is affected, and on which platform.
- The steps needed to reproduce it.
- What an attacker could gain.
- Whether it is already being exploited.

You can expect an acknowledgement within three days. You will be told how the report is being handled and credited in the release notes unless you prefer otherwise.

## What is in scope

- The Zelva applications on every platform.
- The push relay and the other Zelva services.

Problems in a mail server, or a phishing email you have received, belong with the operator of that server or your mail provider.

## Safe harbor

We welcome good-faith security research. We will not take legal action against anyone who investigates responsibly: who accesses only their own accounts and data, and who reports what they find privately before publishing it.

## How security is approached

Zelva handles untrusted email on your device and keeps the keys to your mailbox, so its design assumes that message content is hostile. The threat model and the research behind it are published under `docs/research/`; the security and privacy requirements they produce will be carried into `docs/prd/` as PRD-02.
