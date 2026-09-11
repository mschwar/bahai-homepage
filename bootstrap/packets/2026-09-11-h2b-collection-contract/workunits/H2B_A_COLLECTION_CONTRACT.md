# H2B-A — collection/source contract

**State:** authorized  
**Implementation of a real second collection:** NOT authorized in this unit

## Goal

Replace the implicit one-corpus runtime assumption with a producer-agnostic collection contract while preserving the homepage product doctrine.

## Required design decisions

- collection identity and version
- human label/description
- provenance/rights metadata
- item identity
- item type (full passage/excerpt/paraphrase/etc.)
- verification state
- authoritative source URL / human source reference
- author/attribution
- eligibility/word-length semantics
- deterministic selection semantics
- collection-scoped cache keys
- selected-source persistence/default behavior
- today/yesterday semantics
- empty/error/fallback behavior
- schema validation
- single source of truth / iOS export or regeneration strategy

## Constraints

- Hidden Words remains default.
- No feed/dashboard/settings drawer.
- Source selector stays lightweight.
- No Garden-specific or Ruhi-specific fields in the core contract.
- No framework/build system/runtime dependency.
- No real second production collection in H2B-A.

## Evidence

- written contract
- migration mapping for current Hidden Words JSON
- fixture proposal
- proposed parity changes
- cache-key examples
- unresolved human decisions
