# Zelva documentation

Zelva is in its requirements phase. These documents say what will be built, why, and on what evidence.

## Reading order

1. [The decision log](decisions/README.md). What was decided, and why. Start with [record 0001](decisions/0001-pre-prd-product-decisions.md).
2. [The gap analysis](gap-analysis.md). How the original brief and blueprint compare with what the research found, and what is still unproven.
3. [The requirements](prd/README.md). Start with [PRD-00, Foundations](prd/PRD-00-foundations.md).
4. [The research](research/README.md). The evidence, gathered on 2026-11-23.

## Folders

| Folder | Content |
|---|---|
| `decisions/` | One record per set of decisions |
| `prd/` | Requirements: a foundations document and one document per capability area |
| `research/` | Research notes and analysis snapshots, with their sources |

## Checking the documentation

The documentation check verifies that identifiers are defined once, that cited identifiers exist, and that links resolve:

```
node scripts/docs-lint.mjs
```

Node comes from the development shell. The same check runs on every pull request.
