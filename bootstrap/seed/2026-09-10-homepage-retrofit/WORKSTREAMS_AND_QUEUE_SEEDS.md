# Future Workstream / Queue Seeds

These are future work units to preserve during audit. Do not execute them in Phase 0.

## H1 — agent-first repo retrofit

Use the accepted audit to install the minimum durable repo contract, canonical docs, validation path, queue semantics, and justified cleanup. Preserve working behavior and history.

## H2A — live site refactor / parity

Modernize/refactor current implementation only where justified. Define behavioral/visual parity tests before changing implementation. Avoid framework churn for its own sake.

## H2B — collection/source abstraction

Introduce a first-class collection model while preserving the minimal UX. Initial acceptance target:

- Hidden Words remains default and behaves identically.
- A tiny deterministic test fixture/second collection can be selected.
- Selection is deterministic within a collection.
- Collection/source metadata and provenance have an explicit contract.
- Selector is deliberately low-weight and does not turn the page into a settings dashboard.

H2A and H2B may become parallel streams after H1 if their seams are clean.

## R1 — Ruhi Book 1 memorization collection — BLOCKED

Blocked by H2B’s collection contract and a rights/provenance review.

Research task: determine which Book 1 passages are actually designated/intended for memorization; map them to `bahai-quote-ledger`; distinguish occurrence identity from passage/content identity; verify exact authoritative citations/text; document selection criteria; review redistribution/copyright constraints; emit a versioned collection export conforming to the homepage contract.

Do not substitute “all direct quotations in Book 1.” The existing ledger is broader than a memorization subset.

## H3 — first real additional collection

Only after R1 passes: add the verified Ruhi memorization export as a real collection and test the selector in normal daily use.
