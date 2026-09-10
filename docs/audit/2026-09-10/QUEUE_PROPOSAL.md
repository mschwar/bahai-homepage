# Queue Proposal — future workstreams (preserved during audit; NOT executed)

Proposed queue semantics (simple): units have **state** (pending / in-progress / blocked / done), an **owner
gate** (human / agent) where noted, and an **evidence** field. Adoption of this queue is an H1 task; nothing
here is run in Phase 0.

## Workstream H1 — agent-first repo retrofit (docs/governance)
Proposal in `RECOMMENDED_RETROFIT_SEQUENCE.md`. States: README rewrite → AGENTS.md → link audit → archive stale
docs → adopt queue → decisions ledger. **Agent-executable**; owner reviews at the gate after H1.

## Workstream H2A — live-site refactor / parity
- **Contract:** define behavioral/visual parity tests **before** changing implementation. No framework churn.
- Heads-up items from audit: shared selection logic extraction; `python`→`python3` run-docs; the Badíʿ-day-cache
  wrinkle (`TECH_DEBT_AND_RISKS.md` #7); fragile `innerHTML` (→ text nodes).
- **Gate:** parity suite green on current behavior → then refactor → parity suite still green.

## Workstream H2B — collection / source abstraction
**Contract / acceptance (from `WORKSTREAMS_AND_QUEUE_SEEDS.md`, kept verbatim intent):**
- Hidden Words remains default and behaves identically.
- A tiny deterministic test fixture/second collection can be selected.
- Selection is deterministic within a collection.
- Collection/source metadata + provenance have an **explicit** contract.
- Selector is deliberately low-weight; does not turn the page into a settings dashboard.

**Gate:** owned by the H2B stream; depends on data/provenance contract, not on Ruhi.

## R1 — Ruhi Book 1 memorization collection — **BLOCKED**
- **Blocked by:** H2B's collection contract **and** a rights/provenance review.
- **Research task:** determine which Book 1 passages are actually designated/intended for memorization; map to
  `bahai-quote-ledger`; distinguish occurrence identity from passage/content identity; verify exact authoritative
  citations/text; document selection criteria; review redistribution/copyright; emit a versioned collection
  export conforming to the homepage contract.
- **Explicit guard:** do **not** substitute "all direct quotations in Book 1." The existing ledger is broader than
  a memorization subset. (Audit confirms: **no Ruhi data exists in this repo** — it is correctly absent.)
- **Gate:** research/R1 requires human sign-off before it becomes implementation (H2B-compatible export).

## H3 — first real additional collection
- Only after R1 passes: add the verified Ruhi memorization export as a real collection; test the selector in
  normal daily use.

## Standing classification rule
Research tasks (provenance, copyright, curation, "what is actually canonical") are **human/judgment gated**.
Implementation tasks (contract, refactor, code) are **agent-executable** once their contract/gate exists. A unit
enters the queue only with a named contract + gate, so a cold-start agent cannot conflate the two.

## Explicitly deferred / never-to-run-in-Phase-0 (listed for the ledger)
- Multi-faith data integration (abandoned — do not resurrect).
- Wallpaper/widget final fate (needs a human decision; both are experimental/unlinked).
- Orphaned KJV/Dhammapada/Gita cleanup (needs owner sign-off).
- Runtime AI / journaling / streaks / feeds (doctrine non-goals).