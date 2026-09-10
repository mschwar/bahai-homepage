# Tech Debt & Risks

Classified by severity. Observations first; mitigation proposals noted as **proposed later-phase** items
(not Phase 0 work).

## High

1. **Hard-coded corpus path + implicit contract.** `js/script.js`, `js/wallpaper.js`,
   `ios/widget/QuoteStore.swift` each hard-code a Hidden-Words path/filename and the `75`-word cap, and each
   independently reimplements the same selection + caching logic. There is **no collection model, no schema
   version, no provenance/attribution record**. This blocks any safe second collection or the planned selector.
   → **H2B seam.**

2. **~10 MB orphaned KJV dataset served by the live repo** (`data/quotes_kjv_bible.json`, 24,930 records)
   plus the Dhammapada/Gita files — all unreferenced by code. Public Pages serves them. Bloat + provenance/rights
   exposure for a dead feature. → **H1 cleanup candidate** (with explicit owner sign-off).

3. **Experimental surfaces are undocumented and unlinked.** Wallpaper (React-CDN app) and iOS widget exist,
   reachable by URL, but are not linked from the homepage and have no build/run/extension docs. The widget
   is not buildable in-repo (no `.xcodeproj`). Future agents will not know whether to maintain, complete, or
   remove them. → **H1: document or gate.**

## Medium

4. **Duplicate corpus copies.** `data/quotes_hidden_words.json` and `ios/widget/quotes_hidden_words.json`
   are byte-identical today but there is no single source of truth or regeneration step for both. Scraper
   regenerates only one. → **H2B**: single collection artifact + generated copies.

5. **Stale, misleading roadmap.** `PROJECT_ROADMAP.md` (last edit 2025-06-07) presents the abandoned
   multi-faith "next sprint" as current intent and is contradicted by the actual minimalist, Hidden-Words-only,
   plus-wallpaper/widget product. A cold-start agent would be actively misled. → **H1: replace/archive.**

6. **Toolchain mismatch.** `Makefile validate` invokes `python` (present on many systems), but on this
   machine the python3 is 3.14.5 at `/opt/homebrew/bin/python3` and bare `python` may be missing; scrapers need
   `requests`, `bs4`, `lxml` (unpinned, no requirements file). No pinned dev environment. → **H1: document
   exact run commands; consider a requirements/venv.**

7. **`script.js` anti-pattern:** `saveCachedQuote(pendingBadiKey, todayObj)` writes the *today* quote under
   the *Badíʿ-day* key, so a Badíʿ cache hit later may render a mismatched verse if the Badíʿ relationship shifts
   (e.g. different date boundary). Low impact on a daily page, but it's a latent correctness smell worth a
   parity test. → **H2A candidate.**

## Low

8. **No tests** beyond `validate_quotes.py` (data-shape only); UI behavior (selection stability, caching,
   theme persistence, Badíʿ fallback) is manual. → **H2A**: define behavioral/parity tests *before* refactor.

9. **No pinned external deps / no integrity pins** (fonts/badi/react CDNs are version-tagged but react is
   `@18` UMD, badi lib is a fixed path). Supply-chain/modified-code risk is low but nonzero for a site
   serving sacred-text UI.

10. **ES tooling absent**: no package manifest, no formatter/linter running locally (only GH CI Super Linter,
   which mostly targets changed PY/JSON/yml), so local code style is unenforced.

11. **`index.html` uses `innerHTML` for the Badíʿ string** (`badi-init.js` → `el.innerHTML = line1+"<br>"+line2`).
   Input is generated internally (not attacker-controlled), so low risk, but worth converting to text nodes +
   `<br>` for strictness.

## Risk posture for Phase 1

Repo is **safe to modernize**: it is fully static, `main` is clean, live status == repo, no DB/auth/backend to
migrate, and the only destructive candidate (removing orphaned data) is explicitly gated behind owner sign-off.
The dominant risk is **losing the implicit product doctrine or silently dropping working behavior during
refactor** — hence H2A's parity-test-before-change rule.