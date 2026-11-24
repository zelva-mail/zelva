# Requirements

Zelva's requirements are one short foundations document and one document per capability area. Each is small enough to review in one sitting and to map onto a stack of small pull requests.

## Reading order

1. [PRD-00](PRD-00-foundations.md): vision, users, principles, tiers, milestones and metrics.
2. [The decision log](../decisions/README.md): why things are the way they are.
3. The area documents, in any order.

## Documents

| Document | Subject |
|---|---|
| [PRD-00](PRD-00-foundations.md) | Foundations |
| PRD-01 | Mail core and sync |
| PRD-02 | Privacy, safety, and encryption at rest and in transit |
| PRD-03 | Triage and automation |
| PRD-04 | Contacts and calendar |
| PRD-05 | On-device AI |
| PRD-06 | Onboarding and accounts |
| PRD-07 | Notifications and the push relay |
| PRD-08 | Platforms, shell and distribution |
| PRD-09 | Licensing and commerce |
| PRD-10 | Backend services |
| PRD-11 | UX specification |
| PRD-12 | Workspace (design only) |
| PRD-13 | Message encryption: OpenPGP and S/MIME |

The area documents are written one pull request at a time. A row becomes a link when its document exists.

## Structure of an area document

| Section | Content |
|---|---|
| Problem | The user's problem, in the user's terms |
| Users | Who the area serves, and on which platforms and servers |
| Goals and non-goals | What the area does in each milestone, and what it deliberately leaves out |
| Requirements | Functional requirements with their acceptance criteria |
| Non-functional requirements | Measurable budgets and qualities |
| Telemetry events | The closed set of events the area may emit, and only with consent |
| Security and privacy | The SEC and PRIV requirements this area must satisfy |
| Risks | What could go wrong, and the mitigation |

## Identifiers

| Kind | Form | Defined in |
|---|---|---|
| Decision | `DEC-001` | `docs/decisions/` |
| Functional requirement | `FR-<AREA>-001` | An area document |
| Non-functional requirement | `NFR-<AREA>-001` | An area document |
| Telemetry event | `EV-<AREA>-001` | An area document |
| Security requirement | `SEC-<nn>` | PRD-02 |
| Privacy requirement | `PRIV-<nn>` | PRD-02 |

`AREA` is a short uppercase code, at most six letters, that identifies the area: `SYNC`, `TRIAGE`, `AI` and so on. An identifier is defined exactly once and never reused. A requirement that replaces another gets a new identifier, and the old one is marked as retired.

An identifier counts as defined where it is the first cell of a table row, or the first thing in a heading or a list item. Anywhere else, it is a citation.

## Requirement format

Each requirement is one row or one short block with these parts:

- The identifier.
- A statement of what Zelva shall do.
- The tier: Free, Pro or Workspace.
- The server dependency: any server, or a capability the server must report.
- The platforms it applies to, and any platform it excludes.
- The milestone that delivers it: Foundation, Desktop alpha, Public beta, v1 or Post-v1.
- The decisions it implements.

Each requirement has one to five acceptance criteria, written as Given, When, Then. Each criterion names the servers and platforms it applies to. A criterion that protects the user is written as a "must not", so that it can fail.

## Status

Every document carries one status in its header:

| Status | Meaning |
|---|---|
| Draft | Written, not yet reviewed |
| In review | Under review by the founder and the review gates |
| Accepted | Merged by the founder |

A requirement can be marked as retired when a later decision replaces it. It stays in the document so that old references still resolve.

## Changing a requirement

Propose the change in a pull request. The description cites the decision the change implements. If no decision covers it, add one to the decision log first.

## Checks

The documentation check verifies that every identifier is defined once, that every cited identifier exists, and that relative links between documents resolve:

```
node scripts/docs-lint.mjs
```

Node comes from the development shell. The same check runs on every pull request.
