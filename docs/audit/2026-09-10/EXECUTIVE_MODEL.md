# Executive Model

**Date:** 2026-09-10 · **Phase:** 0 — repo archaeology / state-of-system audit
**Repo:** `mschwar/bahai-homepage` (GitHub Pages) · **Branch audited:** `main` (HEAD `6e09218`)

## What this is, in one breath

A **minimalist, static, single-source daily-sacred-verse homepage**: every day it shows one
Hidden Words passage (deterministically selected by Gregorian day-of-year), the Badíʿ date
(sunset/location aware when permission is granted), a light "Yesterday" recall affordance,
clipboard copy, and a dark/light theme. Deployment is GitHub Pages. It has **no backend, no
database, no build step, no auth**.

## Current production surface (what actually serves users)

- `index.html` + `css/style.css` + `js/script.js` — the live homepage (verified: deployed HEAD
  bytes match repo `main` exactly; title "Daily Sacred Verse"; `QUOTES_PATH = data/quotes_hidden_words.json`).
- `js/badi-init.js` + external `BadiDateToday.v1.js` (CDN) — Badíʿ date rendering with graceful
  degradation.
- `data/quotes_hidden_words.json` — the **only** corpus the running site loads (153 records, 0
  validate errors, 60,008 bytes, deployed copy byte-identical).
- `data/` + `ios/widget/quotes_hidden_words.json` — deployed-but-not-loaded support copies.

## What else exists and why (condensed)

| Artifact | Reality | Distribution |
|---|---|---|
| `wallpaper.html`, `js/wallpaper.js`, `css/wallpaper.css` | Unlinked from the homepage — a React 18/CDN-based iPhone-wallpaper generator | experimental, deployed-but-unreachable |
| `ios/widget/*.swift` + json copy | WidgetKit daily-verse widget, **source-only** (no `.xcodeproj`) | experimental, not buildable in-repo |
| `data/quotes_dhammapada.json`, `quotes_gita_arnold.json`, `quotes_kjv_bible.json` | Multi-faith datasets from the original 2025 vision; **not referenced by any code** (KJV is 10 MB / 24,930 rows) | abandoned/residue |
| 4 × `scripts/scrape_*.py` | Data harvesters; only `scrape_hidden_words.py` feeds a live corpus | hidden-words = support tooling; other 3 = abandoned |
| `data/quotes.json` (root) | Original 4-row starter dataset; unreferenced | stale/legacy |
| `PROJECT_ROADMAP.md` | June-2025 aspirational multi-faith plan; never updated past 06-07 | stale, contradicts current intent |
| `.github/workflows/super-linter.yml` | CI linter on push/PR | current |
| `.nojekyll` | Required for GH Pages to serve source | current |
| `AUDIT_NOTES.md`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `Makefile`, `.gitignore` | Repo governance/support | current (README incomplete) |

## Reconstructed product doctrine (see `PRODUCT_DOCTRINE_RECONSTRUCTION.md`)

Quiet, single-passage encounter with the Creative Word; deterministic "today"; preserved
provenance; Badíʿ temporal context that degrades gracefully; a light yesterday/history
affordance; and **ambient extensions** (wallpaper, widget) of the same encounter thesis. The
2025 multi-faith "settings drawer" vision was **planned but never integrated** and was
superseded by the minimalist single-source design — it is residue, not intent.

## Bottom line for the human

`main` is **clean and safe** to build the next phase on. The live site is current with the repo.
The only real liabilities are (a) a stale aspirational roadmap, (b) ~11 MB of orphaned
multi-faith datasets/scrapers sitting in the repo (and served by Pages), (c) undocumented
experimental surfaces (wallpaper/widget), and (d) an implicit (not explicit) data/provenance
contract. Phase 0 changed **no production code**; only additive audit docs were created.