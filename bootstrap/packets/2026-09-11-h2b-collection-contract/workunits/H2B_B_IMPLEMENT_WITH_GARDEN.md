# H2B-B — implement collection switching with verified Garden preview

**State:** BLOCKED until:
1. H2B-A contract accepted.
2. Garden exports a verified collection conforming to that contract.

## Goal

Wire the existing source-selector chrome to two real collections:
- The Hidden Words (default)
- Garden of Wisdom — Bahá’í preview (or owner-approved label)

## Acceptance criteria

- Hidden Words behavior remains parity-equivalent.
- Selector changes collection without page reload if feasible and proportionate.
- Selection is deterministic within each collection.
- Cache keys are collection-scoped.
- selected collection persists locally.
- today and yesterday use the same selected collection.
- citation/author render correctly for both.
- switching back restores Hidden Words behavior.
- no generic multi-faith product mode is introduced.
- no Garden-specific logic lives in the core collection runtime.
- tests cover both collections and selection persistence.
