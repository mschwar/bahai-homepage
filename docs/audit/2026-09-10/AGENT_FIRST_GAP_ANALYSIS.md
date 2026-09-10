# Agent-First Gap Analysis

Goal: can a **cold-start agent** (no chat history) determine what this repo/product is, what to touch, how to
run/validate it, and what's deferred? Assessed against `AGENT_FIRST_TARGET.md`. Each gap maps to the minimal
Phase-1 fix (recommended set at bottom; see `RECOMMENDED_RETROFIT_SEQUENCE.md`).

## Capability → current state → gap

| Capability a cold-start agent needs | Current state in repo | Gap |
|---|---|---|
| **What the product is for; what must not change** | `README.md` summarizes the core homepage well, but **omits the wallpaper/widget/ambient extensions** and the **abandoned multi-faith residue**; no doctrine doc separates "intent" from "leftovers". | HIGH — need a doctrine + "must-not-change" statement that names current vs experimental vs stale. |
| **Canonical docs & source-of-truth locations** | No `AGENTS.md`, no doc index. `README` points at a few paths only; `PROJECT_ROADMAP.md` is stale and misleading. | HIGH — need canonical docs map + archive/retire the stale roadmap. |
| **Current architecture & runtime/deployment topology** | Only ad-hoc in `README` ("lightweight static site"). `DEPLOYMENT_AND_RUNTIME_MAP` (this audit) now exists but isn't linked from any canonical file. | MED-HIGH — promote architecture + runtime/deploy into canonical docs. |
| **Setup / run / validate / test commands** | README has run (http.server) + update (scrape) + `make validate`. But `make` calls bare `python`; scrapers need unpinned `requests/bs4/lxml`; no pinned env; **no test/QA commands**. | HIGH — document exact commands + pinned env; add parity tests later (H2A). |
| **Data/corpus contracts & provenance expectations** | None explicit. Path is hard-coded in 3 places; no schema/version/provenance doc. | HIGH — define collection/data contract (H2B-owned, but document expectations in H1). |
| **Distinguish research tasks from implementation tasks** | No such distinction anywhere. Ruhi work is the canonical research-vs-impl boundary and it's not documented in-repo except the (seed) queue. | MED — encode "research = provenance/copyright/curation; implementation = contract + code". |
| **How work enters queues; states/gates** | No queue semantics. (Seed `WORKSTREAMS_AND_QUEUE_SEEDS.md` proposes them but they're not live.) | HIGH (for future) — a queue/contract proposal exists; make it tracked/canonical. |
| **What can be done autonomously vs requires human judgment** | Not stated. (This audit's gates imply: delete-orphaned-data and Ruhi-publish require human/Judgment; straightforward doc/refactor is autonomous.) | MED — state the autonomy boundary. |
| **How to return evidence & a handoff** | Not stated. | MED — add a handoff/evidence convention. |
| **What work is explicitly deferred** | Not consolidated in canon (only in the retrofit seed). | MED — surface deferred list (multi-faith cleanup, Ruhi, wallpaper/widget fate) in a canonical doc. |

## Structural enablers that already exist (good news)

- Tiny, framework-free, async-era plain JS — low complexity to document.
- Clean single `main`, no merge mess, no build/deploy pipeline to document beyond "push to main".
- Good commit conventions for the core timeline (conventional `feat/fix/style/docs` prefixes), so history is tractable.
- One real data-validator exists (`validate_quotes.py`). Its scope is just narrow.

## Recommended minimum agent-first artifact set (justified — do NOT create everything)

1. **`README.md` rewrite** — canonical entry: doctrine, structure, run/validate commands (pinned), current vs
   experimental vs stale tables, deployment note, "what's deferred". (README already exists, so this is an
   edit, not new surface.)
2. **`AGENTS.md`** — short agent contract: repo purpose, must-not-change invariants, command/validation, and
   "forbidden/blocked" list (Ruhi blocked; do not resurrect multi-faith; do not touch wallpaper/widget without
   a decision). *NOTE: AGENTS.md is a protected agent-instruction file in this runtime — a Phase 1 agent may
   need to deliver it via README appendix + manual step if writes are blocked.*
3. **`docs/audit/2026-09-10/`** (this set) promoted as canonical orientation (link from README/AGENTS).
4. **Archive/retire** `PROJECT_ROADMAP.md` (move to `docs/history/` or replace with a current, doctrine-aligned
   roadmap) and the stale `Updates.md`.
5. **Queue proposal adopted** (`QUEUE_PROPOSAL.md` → canonical `docs/queue.md` or equivalent tracked spec) so
   workstreams H2A/H2B/R1/H3 have explicit states/gates.
6. **Deferred/decision ledger** — a lightweight `docs/DECISIONS.md` (or ADR dir) to record doctrine/cleanup
   decisions, since cold-start agents otherwise rediscover only via git archaeology.

**Explicitly NOT in the minimum set:** a build system, a framework, a test harness (defer to H2A), a CI overhaul,
a data-loader/selector (that is H2B product work), or any dependency adds — none are needed to make the repo
navigable and safe.