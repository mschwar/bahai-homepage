# Phase 1 · H1 — Scope & Acceptance Gates

## Mission

Make a cold-start agent able to orient, run, validate, and know the boundaries of this repo — **without
changing the live product by a single byte.**

## In scope (sanctioned surfaces)

| Surface | Sanctioned change |
|---|---|
| `README.md` | Rewrite as canonical entry (H1.1) |
| `AGENTS.md` (new, root) | Create the agent contract (H1.2) |
| `docs/history/` (new) | Archive superseded docs (H1.4) |
| `docs/queue.md` (new) | Land the forward queue from `QUEUE_SEED.md` (H1.5) |
| `docs/DECISIONS.md` (new) | Decision ledger D1–D8 (H1.6) |
| `docs/RUNBOOK.md` (new) | Run / validate / deploy / toolchain runbook (H1.7) |
| `Makefile`, `requirements-dev.txt` (new) | Non-runtime dev tooling only (H1.8) |
| Fonts / CDN pins | **Not touched** (a version-pinning pass is a later, separate decision) |
| `data/`, `scripts/` | **Removals only**, exactly the 7 paths named in `OWNER_DECISIONS.md` Q2 (H1C) |
| `PHASE1_HANDOFF.md` (new, root) | The closeout |
| `HANDOFF.md` | Append-only review-outcome note (do not rewrite the Phase 0 record) |

## Out of scope / forbidden

- `index.html`, `css/*`, `js/*`, `data/quotes_hidden_words.json`, `ios/widget/*` — **frozen, byte-identical**.
- Any runtime dependency, build system, framework, bundler, or test harness (the harness is H2A's first step).
- Any CI/workflow or Pages configuration change.
- Any collection model, data-loader, selector, or settings UI (H2B).
- Any Ruhi extraction, curation, or publication (R1 — blocked); any multi-faith resurrection.
- Deleting anything not named in `OWNER_DECISIONS.md`.
- Adding or removing fonts/CDN pins, or "tidying" working code.

## Acceptance gates (all must pass, each with recorded evidence)

1. **Parity, frozen files.** After the final push, `index.html`, `css/style.css`, `js/script.js`,
   `js/badi-init.js`, `data/quotes_hidden_words.json` hash **exactly** as recorded at baseline; `git diff` on
   those paths across the H1 commit range is empty. Baseline:
   `index.html 0d1a6f0f…b36c5 · css/style.css 2a08588c…f56de7 · js/script.js 11f88eb2…9c8c8 ·
   js/badi-init.js 3bfd2054…2509a · data/quotes_hidden_words.json fdcd492d…aea4`.
2. **Parity, live site.** Live `index.html` and live `data/quotes_hidden_words.json` still HTTP 200 and
   sha256-identical to the repo, after the push lands.
3. **Orientation exists.** `README.md` is canonical (doctrine, current-vs-experimental-vs-stale structure,
   exact commands, deployment note, deferred list) and links `docs/audit/2026-09-10/`; `AGENTS.md` exists at
   root with purpose / must-not-change invariants / commands / forbidden-list.
4. **No live doc lies.** `PROJECT_ROADMAP.md` and `Updates.md` are gone from the root as live documents and
   present under `docs/history/` under a SUPERSEDED banner; no remaining repo doc asserts the abandoned
   multi-faith sprint as current intent (`grep -ri "multi-faith\|multi tradition\|multi-tradition"` returns
   only `docs/history/*`, `docs/audit/*`, and the packet/seed).
5. **Queue landed.** `docs/queue.md` carries H2A / H2B / R1 / H3 with explicit state + gate + evidence fields,
   and R1 is marked BLOCKED with its two blocking conditions.
6. **Ledger landed.** `docs/DECISIONS.md` records D1–D8 from `OWNER_DECISIONS.md`, each with a one-line why.
7. **Validation is real.** `make validate` succeeds on this host (bare `python` no longer required — `PYTHON`
   defaults to `python3`), `python3 scripts/validate_quotes.py data/quotes_hidden_words.json` still reports
   153 / 0 / 0 / 0, and `requirements-dev.txt` pins the scraper deps (`requests`, `beautifulsoup4`, `lxml`)
   while being explicitly **dev-only** (not required by the served site).
8. **Experimental surfaces documented.** Wallpaper + iOS widget are described as experimental ambient surfaces
   with their live URLs in `README.md`/`AGENTS.md`, including the honest note that the widget has no
   `.xcodeproj` and is not buildable in-repo.
9. **Orphaned payload unpublished.** The 7 named paths are absent from `main` and present on the pushed
   `archive/legacy-multifaith` branch; live `/data/quotes_kjv_bible.json` returns **404** (if still 200 after
   15 minutes, the unit is not done — report, don't claim); the homepage is unaffected; the one-line restoration
   command is recorded in `docs/DECISIONS.md`.
10. **Closeout.** `PHASE1_HANDOFF.md` exists with per-gate command evidence, an explicit deviation section,
    queue state, and the deferred list; all H1 commits are pushed to `main`; then work STOPS.

## Evidence standard

Paste the actual command and its actual output. "Should be fine", inferred results, and reconstructed output
are failures of this packet. Any gate that cannot be closed is reported as **OPEN**, never as done.
