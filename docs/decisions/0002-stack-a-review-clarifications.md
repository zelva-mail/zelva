# Decision record 0002: Clarifications from the Stack A review

| | |
|---|---|
| Status | Accepted by the founder on 2026-11-24 |
| Scope | Clarifications to record 0001. None reverses a decision the founder approved |

The Stack A review gates found places where record 0001 was drafted loosely or where an operative choice existed in no record at all. Each clarification below keeps the decision the founder approved and tightens the wording, or records a choice that was already being relied on elsewhere in the documents.

## Decisions

| ID | Decision | Why | Carried in |
|---|---|---|---|
| DEC-070 | DEC-047's free-tier state record covers only state for features the free tier has: local rules, labels and preferences. Snooze, send later, follow-up reminders and the VIP screener are Pro features, so their state exists only for Pro, synced end to end. The free-tier record is signed but not encrypted, and therefore readable by the mail server. This residual is accepted and recorded: the record holds rule definitions and no message content, and the mail server already sees every sender and every message. | The review gates found the enumeration in DEC-047 contradicted the tier table, and that the confidentiality position was never stated. | PRD-03, PRD-09, PRD-10 |
| DEC-071 | Admin-side provisioning targets Stalwart and Apache James only. Fastmail has no admin API. | The gap analysis cited DEC-018 for this, but DEC-018 is about token custody and names no providers. The scope existed in no record. | PRD-12 |
| DEC-072 | Where a server reports no Sieve, Zelva offers device-local rules, free per DEC-069, plus export of the rule as a Sieve script. The Pro visual builder appears only where the server reports Sieve. | The device-local fallback was operative in three documents but existed in no decision. | PRD-03 |
| DEC-073 | The compose-time display of a recipient domain's MTA-STS and DANE status is fetched on demand or through the resolver the user chose, never automatically for all recipients. It appears in the user-visible network log. | DEC-049 as written would leak the correspondent set to a resolver, which the threat model's privacy requirements forbid for such lookups (note 11). | PRD-02 |
| DEC-074 | Assist features split by what powers them. Suggestions that need no model are free. Model-based suggestions, summaries and drafts are Pro. The classifier is free. | DEC-022 and DEC-023 already say this; the gap analysis summarized it wrongly in one row and one answer. | PRD-05, PRD-09 |

## Wording alignments in record 0001

These copy edits change no decision. They were made in place to keep one word per concept, per the review gates.

- The web build is a "reduced build", not a "reduced tier", so "tier" means only a price tier (DEC-019).
- Generative AI models are "sized by device", not "tiered by device" (DEC-024).

## Record 0001 status

Record 0001 is accepted. DEC-001 to DEC-063 were approved with the plan on 2026-11-23; DEC-064 to DEC-069 and this record were confirmed on 2026-11-24.
