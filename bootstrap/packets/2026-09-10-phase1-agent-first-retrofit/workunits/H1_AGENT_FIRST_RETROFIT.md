# Work Unit H1 — Agent-First Repo Retrofit (docs + governance + non-runtime tooling)

**Gate:** agent-executable. **Owner:** executor of `01_PROMPT.txt`. **Freeze in force:** D8.
**One work unit per commit**, conventional prefixes, "what + why" bodies.

Derived from `docs/audit/2026-09-10/RECOMMENDED_RETROFIT_SEQUENCE.md` §1 and
`AGENT_FIRST_GAP_ANALYSIS.md`'s minimum artifact set — no artifact beyond that set is justified.

---

## H1.1 — `README.md` rewrite (canonical entry)

Replace the current README with a cold-start entry containing, in this order:

1. **What it is** — one-paragraph doctrine synthesised from
   `docs/audit/2026-09-10/PRODUCT_DOCTRINE_RECONSTRUCTION.md`: a quiet, deterministic, single-passage daily
   sacred-verse homepage — one Hidden Words passage per Gregorian day-of-year over the ≤75-word subset, Badíʿ
   date (location/sunset-aware when permitted, degrading gracefully), light "Yesterday" recall, clipboard copy,
   persistent dark/light theme. Static, client-side, GitHub Pages. **No backend, database, build step, auth, or
   runtime AI.**
2. **Must-not-change invariants** (short list, pointing at `AGENTS.md` for the full contract).
3. **Structure — three status tables:** *Current/production* (`index.html`, `css/style.css`, `js/script.js`,
   `js/badi-init.js`, `data/quotes_hidden_words.json`, `scripts/validate_quotes.py`,
   `scripts/scrape_hidden_words.py`, `.github/workflows/super-linter.yml`, `.nojekyll`); *Experimental ambient*
   (wallpaper + iOS widget, with their live URLs and the honest "no `.xcodeproj`, not buildable in-repo" note);
   *Archived/historical* (`docs/history/*`, `docs/audit/2026-09-10/*`, `bootstrap/*`).
4. **Run it** — `python3 -m http.server 8000` then open `http://localhost:8000/`.
5. **Validate it** — `make validate` and the explicit
   `python3 scripts/validate_quotes.py data/quotes_hidden_words.json` (expected `153 / 0 / 0 / 0`).
6. **Scrapers (dev-only)** — documented venv creation plus `pip install -r requirements-dev.txt`
   (`requests`, `beautifulsoup4`, `lxml`); state plainly that these are **not** runtime dependencies of the site.
7. **Deploy** — push to `main` → GitHub Pages rebuilds; **the entire branch is publicly served**
   (`build_type: legacy`, source `main` / `/`), so anything committed becomes reachable by URL. That sentence
   is the reader's protection against ever committing private or orphaned payload again.
8. **Where the truth lives** — links to `docs/audit/2026-09-10/` (orientation), `docs/queue.md`,
   `docs/DECISIONS.md`, `docs/RUNBOOK.md`, `AGENTS.md`.
9. **Deferred** — the deferred list from `QUEUE_SEED.md`.

**Evidence:** the new README renders as valid markdown; every command in it was actually run.

## H1.2 — Create `AGENTS.md` (root, real file)

Short contract, max ~80 lines, no duplicated history:

- **Purpose** (2–3 sentences) and **what must not change** (the frozen files; no framework/build/runtime
  dependency; single `main`; whole-branch serving).
- **Read first:** `README.md` → `docs/audit/2026-09-10/` → `docs/queue.md` → `docs/DECISIONS.md` →
  `docs/RUNBOOK.md`.
- **Commands:** run / validate (exact strings).
- **Data contract, current reality:** one corpus, `data/quotes_hidden_words.json`; the path and the 75-word cap
  are hard-coded in three places (`js/script.js`, `js/wallpaper.js`, `ios/widget/QuoteStore.swift`) — until
  H2B lands a contract, changing the corpus means changing all three, and there is no provenance/schema record.
  Do not pretend otherwise.
- **Autonomy boundary:** docs/refactor = agent; delete/unpublish, rights/provenance/canonical-text curation,
  publishing a new collection = human.
- **Forbidden/blocked:** Ruhi Book 1 subtask blocked; do not resurrect multi-faith; do not modify wallpaper or
  widget without an owner decision; never commit a payload that shouldn't be served.
- **Evidence/handoff convention:** every task ends with a handoff stating what changed, why, and the raw
  command output that proves each claim; deviations are stated explicitly, never silent.

Writing `AGENTS.md` works in this repo (verified by probe). If a runtime blocks it, use the README-appendix
fallback and report it (see `../RECOVERY.md`).

## H1.3 — Promote the audit as canonical orientation

Ensure `docs/audit/2026-09-10/` is linked from `README.md` and `AGENTS.md` with one line each on what it is:
*the reconstructed state of the repo as of 2026-09-10; historical, evidence-backed, not a live spec.*

## H1.4 — Archive the stale docs (do not rewrite them in place)

- `PROJECT_ROADMAP.md` → `docs/history/2025-06-roadmap.md`, with a banner at the top:
  `> SUPERSEDED — historical only. This file describes the abandoned multi-faith direction. Current product
  doctrine: README.md / docs/DECISIONS.md.`
- `Updates.md` → `docs/history/2025-06-updates.md` with the same class of banner.
- Add `docs/history/README.md` (3 lines): what lives here and why (superseded residue, kept for history).
- **Verify no live doc still asserts the abandoned direction:**
  `grep -rniE "multi-?faith|multi-?tradition" --include='*.md' . | grep -v -e docs/history -e docs/audit -e bootstrap/`
  must return nothing.

## H1.5 — Land the queue as `docs/queue.md`

Copy `../QUEUE_SEED.md` semantics in, with H1 marked in-progress and the exit gate named. Keep the
state/gate/evidence triple and the research-vs-implementation rule intact.

## H1.6 — Land the decision ledger as `docs/DECISIONS.md`

Record D1–D8 exactly as in `../OWNER_DECISIONS.md`, each with a one-line rationale, each dated 2026-09-10,
each naming its source (Phase 0 audit section / owner review answer). Include the ledger format note
(*append-only; supersede by adding a new entry, never by editing history*) and the H1C restoration command.

## H1.7 — Land `docs/RUNBOOK.md`

Promote the operational content of `docs/audit/2026-09-10/DEPLOYMENT_AND_RUNTIME_MAP.md` into a live runbook:
runtime topology (static files + external `BadiDateToday.v1.js` + Google Fonts + React CDN for wallpaper only),
deployment (push `main` → Pages, whole branch served), local run, validation, scraper regeneration,
rollback/recovery, and known failure modes (bare `python` shadowing, CDN failure → graceful degradation).

## H1.8 — Toolchain parity (non-runtime only)

- `Makefile`: `PYTHON ?= python3` so `make validate` works on this host. Run it; paste output.
- Add `requirements-dev.txt` pinning `requests`, `beautifulsoup4`, `lxml` (dev-only, for the scrapers).
  **Not** a runtime dependency; the served site must not reference it.
- Re-run `python3 scripts/validate_quotes.py data/quotes_hidden_words.json` and confirm 153 / 0 / 0 / 0.

## H1.9 — Document the experimental surfaces (owner decision Q1)

Add to `README.md` and `AGENTS.md`: what wallpaper and the iOS widget are, their live URLs, that they are
unlinked ambient surfaces, that the widget is source-only with no `.xcodeproj`, and that both are **outside the
parity path** (a change to `js/script.js` has no obligation to propagate to them — that coupling is H2B's
problem). **Do not edit `index.html`** (see H1.10 in `../QUEUE_SEED.md`).

---

## Commit plan (one unit per commit, in order)

```
docs: rewrite README as canonical cold-start entry
docs: add AGENTS.md agent contract
docs: link the 2026-09-10 audit as canonical orientation
docs: archive superseded roadmap and updates notes to docs/history
docs: land work queue as docs/queue.md
docs: add decision ledger docs/DECISIONS.md
docs: add operational runbook docs/RUNBOOK.md
chore: make validate green on python3 and pin dev-only scraper deps
docs: document wallpaper and iOS widget as experimental surfaces
chore: unpublish orphaned multi-faith payload (kept on archive/legacy-multifaith)
docs: add PHASE1_HANDOFF.md with gate evidence
```

## H1 exit

All ten gates in `../SCOPE_AND_GATES.md` closed with pasted evidence → `PHASE1_HANDOFF.md` → push → **STOP**.
