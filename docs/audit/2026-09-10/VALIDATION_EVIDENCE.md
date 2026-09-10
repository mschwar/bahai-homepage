# Validation Evidence

Everything below was performed live (not fabricated) during this audit on 2026-09-10. Evidence lines state
exactly what ran and what it returned.

## Git / history
- `git rev-list --count HEAD` → **123 commits**.
- `git log --oneline --all` → single `main`, two historical PR merges (`823d047` #1, `5fdcd7f` #2); **no tags** (`git tag -l` empty).
- `git log --format=... --date=format:'%Y-%m-%d' --reverse` → timeline anchors (2025-06-03 init; 06-06/07 design;
  2026-01-31 audit; 2026-02-07 wallpaper+widget; 2026-03-12 CI).
- `git log --oneline --follow -- <path>` per artifact → subsystem origins (e.g. `ead7a22` added wallpaper + ios/widget;
  `7708338` KJV; `f5feb2b` Dhammapada; `b51d2ce` Gita; `b2e9687` `badi-init.js`; `63da802` added `validate_quotes.py`).

## Static inventory
- `find .` (excl `.git`/`.venv`) → complete file tree used for REPO_MAP (all 12 of the 12 seed scaffolds present
  under `bootstrap/seed/2026-09-10-homepage-retrofit/`).
- File sizes (bytes) → e.g. KJV dataset **10,023,950 B (24,930 recs)**; hidden Words **60,008 B (153 recs)**.

## Data correctness
- `python3 scripts/validate_quotes.py data/quotes_hidden_words.json` → `Quotes checked: 153, Errors: 0, Warnings: 0,
  Duplicate texts: 0` (exit 0).
- `python3 scripts/validate_quotes.py data/quotes_kjv_bible.json` → `Quotes checked: 24930, Errors: 0` (exit 0).
- Schema/records extracted via `json.load` per `data/*.json` + `ios/widget/quotes_hidden_words.json` (see DATA map).

## Live deployment (GitHub Pages)
- `curl -sS -w "%{http_code}" https://mschwar.github.io/bahai-homepage/` → **HTTP 200, size 4701**.
- Live `<title>` → **`Daily Sacred Verse`** (matches repo `index.html`).
- Live `js/script.js` `grep QUOTES_PATH` → `data/quotes_hidden_words.json`.
- Live `data/quotes_hidden_words.json` via `wc -c` → **60,008 B = repo copy** (byte-identical bytes: `60008 = 60008`).
- `curl -o /dev/null -w "%{http_code}" https://mschwar.github.io/bahai-homepage/wallpaper.html` → **200** (reachable but
  unlinked from homepage); same for `data/quotes_kjv_bible.json` → **200**.

## External runtime deps (reachability only)
- `https://wondrous-badi.today/scripts/BadiDateToday.v1.js` → **HTTP 200**.
- Google Fonts CSS URL → **HTTP 200**.

## Code-reference checks
- `grep -rn "quotes_" js/ index.html wallpaper.html ios/` → **only `quotes_hidden_words.json`** is referenced
  (`js/script.js`, `js/wallpaper.js`, `ios/widget/QuoteStore.swift`).
- `grep -rn "quotes\.json" js/ index.html wallpaper.html` → **none** (root `data/quotes.json` unreferenced).
- `grep -rn "wallpaper.html" index.html css/ js/` → **none** (wallpaper not linked from homepage).
- `find ios -name '*.xcodeproj' -o -name '*.xcworkspace'` → **none** (widget is source-only, not buildable in-repo).

## Scope-compliance check
- `git status --porcelain` post-commit → only **additive** untracked/added files: `docs/audit/2026-09-10/*` and the
  earlier seed commit. **No production HTML/CSS/JS/data, dependency, CI, deploy, or config file was modified.**
- The machine's `python3` is `/opt/homebrew/bin/python3` (3.14.5); bare `python` is **missing** here, so `make validate`
  would fail on this host — a real (documented) toolchain finding, not an audit error.

## What could **not** be independently verified
- **React `unpkg` CDN** fetch was not independently curl-checked this run (only the two core deps were). Marked as
  `(not re-verified this run; standard CDN)` — the wallpaper app is experimental and unlinked, so low risk.
- **Wallpaper / iOS widget behavioral correctness** (canvas rendering, WidgetKit timelines) cannot be verified in a
  static bootstrap; classified EXPERIMENTAL on structural evidence (unlinked, no Xcode project) rather than by running them.
- Local browser-based **location-allow/deny** and **offline** flows were not executed in a browser here; they remain
  the manual QA items already listed in `AUDIT_NOTES.md` (2026-01-31). Nothing in the audit depends on them.