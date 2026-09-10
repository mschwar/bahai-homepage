# HANDOFF — Phase 0 Repo Archaeology (Bahá'í Homepage)

**Date:** 2026-09-10 · **Agent:** home-steward (Hermes) · **Branch:** `main` @ `6e09218` + audit docs
**Status:** Phase 0 **COMPLETE**. **STOP GATE REACHED.** No modernization performed.

---

## 1 · Concise model of the repo's intent

A quiet, deterministic, **single-passage** daily-sacred-verse homepage: each day shows one Hidden Words
passage (selected by Gregorian day-of-year over the ≤75-word subset), the Badíʿ date (location/sunset-aware
when permitted, degrading gracefully), a light "Yesterday" recall, clipboard copy, and a persistent dark/light
theme. It is static, client-side only, deployed on GitHub Pages, and has **no backend, database, build step,
auth, or runtime AI**. Ambient experimental extensions exist (wallpaper generator, iOS widget) that surface the
*same* daily verse on other devices; the original **multi-faith** vision (Dhammapada/Gita/KJV) was planned and
data-prepped in 2025 but **abandoned** before integration.

Full doctrine: `docs/audit/2026-09-10/PRODUCT_DOCTRINE_RECONSTRUCTION.md`.

## 2 · Current production surface

`index.html` + `css/style.css` + `js/script.js` + `js/badi-init.js` + `data/quotes_hidden_words.json`
(153 verses) + external `BadiDateToday.v1.js` + Google Fonts. **Live site verified identical to repo `main`**
(byte-identical corpus; same JS path; title "Daily Sacred Verse").

## 3 · Important historical / experimental / residue artifacts

| Artifact | Classification | Evidence |
|---|---|---|
| Wallpaper app (`wallpaper.html`/`.js`/`.css`) | **EXPERIMENTAL** — deployed-but-unlinked (React/CDN) | no link in `index.html`; Pages serves `/wallpaper.html` (200) |
| iOS widget (`ios/widget/*.swift`) | **EXPERIMENTAL** — source-only, no Xcode project | `find ios -name '*.xcodeproj'` → none |
| Multi-faith datasets + 3 scrapers (Dhammapada/Gita/KJV) | **STALE/ABANDONED** — unreferenced by code (KJV ≈**10 MB/24,930 recs**) | grep: only `quotes_hidden_words.json` fetched; no loader/settings drawer ever built |
| Root `data/quotes.json` (4-passage starter) | **STALE/LEGACY** | no code references it |
| `PROJECT_ROADMAP.md`, `Updates.md` | **STALE docs** — assert the abandoned multi-faith plan; never updated past 2025-06-07 | git log dates; content vs current product |
| `AUDIT_NOTES.md` (2026-01-31), `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `Makefile`, `scripts/validate_quotes.py`, `.github/workflows/super-linter.yml`, `.nojekyll` | **CURRENT/support** | verified present + used |

## 4 · Contradictions / staleness found

- `PROJECT_ROADMAP.md` (live doc) claims a **multi-faith settings-drawer sprint** as the current/next direction;
  the actual product is single-corpus Hidden Words and the multi-faith datasets are orphaned. **Doc contradicts
  product.**
- `README.md` describes the core well but **omits** wallpaper, widget, CI, and the residue — a cold-start agent
  gets an incomplete map.
- `Updates.md` is a one-line historical note, not a real changelog.
- Toolchain mismatch: `Makefile` calls bare `python`; on this host only `python3` exists. Scrapers need unpinned
  `requests/bs4/lxml`.

## 5 · Risks

See `docs/audit/2026-09-10/TECH_DEBT_AND_RISKS.md`. Top: implicit data/provenance contract; ~10 MB orphaned
publicly-served KJV data; undocumented experimental surfaces (wallpaper/widget); stale misleading roadmap. The
repo is otherwise **clean and safe to modernize** (static, single `main`, live==repo).

## 6 · Validation performed

Full evidence: `docs/audit/2026-09-10/VALIDATION_EVIDENCE.md`. Headlines: `validate_quotes.py` passes on hidden
words (153/0/0/0); live Pages HTTP 200 + corpus byte-identical; both external core deps reachable (HTTP 200);
grep confirms only `quotes_hidden_words.json` is referenced by code.

## 7 · Files created (all additive audit docs; no production change)

- `docs/audit/2026-09-10/EXECUTIVE_MODEL.md`
- `docs/audit/2026-09-10/REPO_MAP.md`
- `docs/audit/2026-09-10/HISTORY_RECONSTRUCTION.md`
- `docs/audit/2026-09-10/FEATURE_AND_SUBSYSTEM_STATUS.md`
- `docs/audit/2026-09-10/DATA_AND_PROVENANCE_MAP.md`
- `docs/audit/2026-09-10/DEPLOYMENT_AND_RUNTIME_MAP.md`
- `docs/audit/2026-09-10/TECH_DEBT_AND_RISKS.md`
- `docs/audit/2026-09-10/PRODUCT_DOCTRINE_RECONSTRUCTION.md`
- `docs/audit/2026-09-10/AGENT_FIRST_GAP_ANALYSIS.md`
- `docs/audit/2026-09-10/RECOMMENDED_RETROFIT_SEQUENCE.md`
- `docs/audit/2026-09-10/QUEUE_PROPOSAL.md`
- `docs/audit/2026-09-10/VALIDATION_EVIDENCE.md`

(Plus the immutable seed committed earlier: `bootstrap/seed/2026-09-10-homepage-retrofit/`, `START_HOMEPAGE_RETROFIT.md`.)

## 8 · Unresolved questions for the owner (please answer at review)

1. **Wallpaper & iOS widget:** keep as experimental (document/link), or archive them? (No owner signal in history.)
2. **Orphaned multi-faith data (≈10 MB) + 3 scrapers + root `quotes.json`:** OK to **delete / stop serving** on Pages,
   or must they be preserved (git history retains them regardless)? Needs explicit sign-off before H1 cleanup.
3. **Roadmap:** replace `PROJECT_ROADMAP.md` with a doctrine-aligned current plan, or archive it outright?
4. **Ruhi Book 1:** confirm it stays **BLOCKED** and is not treated as "all 71 direct quotes" — the audit kept
   it blocked per the packet. Any timeline for the provenance/rights review?
5. **`AGENTS.md`:** this runtime can block direct writes to agent-instruction files; if so, H1 will land it in a
   README appendix + manual step. OK?

## 9 · Recommended bounded Phase 1 (do NOT run now)

Execute **H1** per `RECOMMENDED_RETROFIT_SEQUENCE.md`: (1) rewrite `README.md` as canonical + link this audit;
(2) create `AGENTS.md` (or README-appendix equivalent); (3) archive stale roadmap/Updates → `docs/history/`;
(4) adopt `QUEUE_PROPOSAL.md` as canonical queue; (5) add a decisions ledger. **Owner-gated cleanup:** orphaned
multi-faith data + wallpaper/widget decision. Then H2A (parity-first refactor) and H2B (collection/source
abstraction) as the two product streams; R1 → H3 only after the Ruhi review.

## 10 · Scope compliance

Phase 0 produced **only additive audit/handoff documentation**. No production HTML/CSS/JS/data, no dependency,
no CI/deploy, no file move/delete/rename, no selector/collection implementation, and **no Ruhi extraction**, were
performed. **STOP — awaiting human review of the acceptance gates.**

The exact seeded Phase 1 prompt is intentionally a placeholder; regenerate it from the accepted audit before running.

---

## 11 · Review outcome — §8 questions ANSWERED (2026-09-10)

Answers recorded in `bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/OWNER_DECISIONS.md`.

1. **Wallpaper + iOS widget → KEEP both as experimental** (document + doc-link; no code change). The widget
   stays unbuildable in-repo (no `.xcodeproj`) and both stay off the parity path.
2. **Orphaned multi-faith data (≈10 MB) + 3 scrapers + root `quotes.json` → UNPUBLISH, KEEP IN GIT.** Removed
   from `main`, retained on a pushed never-merged `archive/legacy-multifaith` branch. *Mechanism correction:*
   Pages serves the whole `main` branch (`build_type: legacy`, root path, `.nojekyll`), so moving the files into
   a repo subdirectory would **not** unpublish them — only removal from `main` does. Re-verified live:
   `/data/quotes_kjv_bible.json` → 200, 10,023,950 bytes.
3. **Roadmap → ARCHIVE, do not rewrite in place.** `PROJECT_ROADMAP.md` + `Updates.md` → `docs/history/` under a
   SUPERSEDED banner; the queue + doctrine replace them as the forward plan.
4. **Ruhi Book 1 (`R1`) → stays BLOCKED, no review scheduled.** The gate is generated by H2B's collection
   contract, not by a date; still explicitly not "all direct quotations in Book 1".
5. **`AGENTS.md` → creatable in-repo.** Probe verified on this host (write exit 0, file created, then removed;
   tree clean), so the README-appendix fallback is **not** needed. A future blocked runtime must fall back and
   say so explicitly.

**Next phase is now available:** run the regenerated Phase 1 packet —
`bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/01_PROMPT.txt` (H1 + owner-approved H1C).
The Phase 0 `prompts/02_*` placeholder is superseded and must not be used.