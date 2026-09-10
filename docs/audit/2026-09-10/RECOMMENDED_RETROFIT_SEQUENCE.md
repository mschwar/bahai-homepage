# Recommended Retrofit Sequence

Smallest high-leverage changes to turn this into a 2026 agent-first repo **without framework churn and without
breaking the live product.** Phase 0 creates nothing of this — it is a recommendation for the human-approved
H1 phase only.

## Guiding constraints
- Preserve live behavior byte-for-byte; any refactor must come after a parity test (H2A).
- Do not add a build system, framework, or runtime dependency to satisfy "agent-first".
- Do not delete anything (especially orphaned data) without explicit owner sign-off.
- The two product workstreams (H2A live refactor/parity, H2B collection/source abstraction) stay separated.

## Sequence

### 1 · H1 — Agent-first repo retrofit (docs + governance, no code/behavior change)
Order inside H1:
1. **Rewrite `README.md`** as canonical entry: doctrine (from `PRODUCT_DOCTRINE_RECONSTRUCTION.md`), structure
   (current vs experimental vs stale), exact pinned run/validate commands (`python3 -m http.server 8000`,
   `python3 scripts/validate_quotes.py data/quotes_hidden_words.json`, a documented venv + pinned
   `requests/beautifulsoup4/lxml` for scrapers), deployment note (push `main` → Pages; whole repo is served),
   and a "deferred" list.
2. **Create `AGENTS.md`** — short contract: repo purpose, must-not-change invariants, run/validate, forbidden
   list (Ruhi blocked; don't resurrect multi-faith; wallpaper/widget unchanged pending human decision). *(If
   this runtime blocks writes to AGENTS.md, land it verbatim in a README appendix and do it as a manual step —
   per the Phase-0 operational rule.)*
3. **Land this audit as canonical orientation**: ensure `docs/audit/2026-09-10/` is linked from README.
4. **Archive stale docs**: move `PROJECT_ROADMAP.md` → `docs/history/2025-06-roadmap.md` (or annotate as
   superseded) and reconcile `Updates.md` → `docs/history/`; replace roadmap's "next steps" with doctrine-aligned
   reality. Do not leave a live doc asserting the abandoned multi-faith sprint.
5. **Adopt queue** (`QUEUE_PROPOSAL.md` → canonical `docs/queue.md` or `tasks/` spec) with states/gates.
6. **Add a decisions ledger** (`docs/DECISIONS.md` / ADR dir) to record: minimalist pivot confirmed; multi-faith
   abandoned; wallpaper/widget = experimental; KJV/other datasets = orphaned-pending-cleanup; Ruhi blocked.

Result: a cold-start agent can orient, run, validate, and know the boundaries — with zero behavior/dependency change.

### 2 · H1 cleanup (owner-gated, still no product code change)
- **Remove/unpublish orphaned data + scrapers** (`data/quotes_kjv_bible.json`, `quotes_dhammapada.json`,
  `quotes_gita_arnold.json`, `data/quotes.json`, the 3 `scrape_*_pg.py` scripts) — **only with explicit owner
  sign-off** (they're publicly served on Pages). GHG: repo/site shrink by ~10 MB; dead-provenance content
  leaves the served surface. Keep `scrape_hidden_words.py` + `validate_quotes.py`. If owner wants to keep them,
  at minimum remove from live serving or move to git-lfs/archive.
- Decide wallpaper/widget fate: keep (document as experimental + link surface) or archive. Record the decision
  in the ledger.

### 3 · H2A — Live-site refactor/parity (after H1 accepted)
- First write **behavioral parity tests** for current behavior: deterministic day-of-year selection, today/yesterday
  match, cache-by-date (and the Badíʿ-day-cache wrinkle — see TECH_DEBT #7), theme persistence, Badíʿ fallback,
  copy path, reduced-motion. Then consider small safe refactors (extract selection/collection logic to a shared
  module; normalize `python` → `python3` run docs). No framework adoption.

### 4 · H2B — Collection/source abstraction (parallel with H2A once seams are clean)
- Make the hard-coded path + `MAX_QUOTE_WORDS` + selection rule an explicit **collection contract**
  (`homepage → selected collection → eligible passages → deterministic daily selection`). Hidden Words remains
  default and behaves identically. Add a tiny deterministic fixture collection to prove the abstraction.
  Keep the selector deliberately low-weight. H2B is blocked *until* this contract exists and is relied on.

### H3 / R1 — after R1 passes, add the real memorization collection
- R1 (Ruhi classification + rights review) must fully precede H3. See `QUEUE_PROPOSAL.md`.

## What is explicitly NOT in any recommended change
Rewriting working JS for a framework; adding React/build tooling to the core; resurrecting multi-faith data; any
edit to live production HTML/CSS/JS/data in H1; publishing or treating "all Book 1 quotes" as a memorization
collection.

## Fastest first commit worth making (H1 step 1+3)
README rewrite + audit-dir link + archive roadmap + decisions ledger — 4 small doc commits. No CI/deploy change.
No production-touch.