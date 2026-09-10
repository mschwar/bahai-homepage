# History Reconstruction

**Evidence source:** `git log --oneline --all` (123 commits, no tags, single `main` branch + two merged
PR branches in history: `audit-fixes` #1 and #2). No feature branches remain. Accessible PR merge
commits: `823d047` (PR #1), `5fdcd7f` (PR #2).

## Timeline

### 2025-06-03 — birth, and the original *multi-faith* vision (day 1)
- `ce27786` Initial commit; `41da276`/`c54e562` `index.html`; `692a789`/`21a98b4` `data/quotes.json`
  (a 4-passage starter: Gleanings ×2, Paris Talks, Hidden Words Arabic #1).
- `3a71f4d` **Project Vision and Roadmap** — the early ambition was a **multi-faith, multi-device
  spiritual companion** (Bahá'í / Dhammapada / Gita / KJV).
- Same day the multi-faith datasets & scrapers landed: `f5feb2b` Dhammapada, `7708338` KJV
  scraper + "combined quotes", `b51d2ce` Gita.
- Hidden Words scraper + data: `cc4ecbe` / `3815e6b` (`scrape_hidden_words.py`), plus deterministic
  daily selection + `MAX_QUOTE_WORDS` filtering (`a98d8b4`, `336915e`).
- Badíʿ date: `b2e9687` `badi-init.js`, fixed mixed-content + `askForUserLocation`
  (`9d3df3c`, `d73b2d0`, `3926858`, `bc6ed94`, `b38716e`, `165f8ac`).

**Reading:** the product began as a multi-tradition aggregator. The Hidden Words + Badíʿ date core
emerged within the first hours and quickly became the center of gravity.

### 2025-06-06/07 — the Sensible-Words minimalist redesign (and the fork in the road)
- `b746a56`, `2eafd5b` — CSS/jumbotron overhaul "inspired by Sensible Words" (a minimalist,
  single-passage daily-verse template — see `Updates.md`).
- `f5d20d7`, `5503063`, `e02f478`, `336915e`, `68e52b4` — Yesterday jumbotron, smooth scroll,
  citation, Gregorian-reveal, panels, copy-on-click.
- `de82064`, `206963a`, `fa3ce27` — Badíʿ date redesign (two-line "Day X, Month (meaning)" + "Year BE").
- `3f5f046` — roadmap updated, **outlining a "Multi-Tradition & Settings Drawer" sprint** (IDs 4.1–4.7:
  normalize scrapers to a unified `{text,author,source,tradition}` schema, dataset loader & cache,
  settings drawer with faith icons, `selectedTradition`/`theme` persistence).

**Reading:** this is the pivotal fork. The **design philosophy** committed to minimalism and a single
daily passage, but the **roadmap** still pointed at a multi-faith settings drawer. The minimalist
`{text,author,source,tradition}` schema DID land in the Dhammapada/Gita/KJV files, but:

- the **dataset loader / settings drawer / selectedTradition persistence were never implemented**;
- the multi-faith data and its scrapers were **never wired into the running homepage**;
- the homepage stayed Hidden-Words-only.

→ The multi-faith direction was **planned and partially data-prepped, then abandoned** in favor of the
Hidden-Words-focused minimalist design. The roadmap was never updated to reflect that; `PROJECT_ROADMAP.md`
still reads as the June-2025 multi-faith plan.

### 2026-01-31 — reliability / accessibility / hygiene audit (PRs #1 & #2, both merged)
- `63da802` Audit fixes: removed `.DS_Store` and `.obsidian/` from repo + gitignored them, added
  `AUDIT_NOTES.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `Makefile` + `validate_quotes.py`,
  rewrote README, added fetch/error retry + Badíʿ timeout/fallback, added localStorage caching
  keyed by local date (and Badíʿ day when available), a11y (single `h1`, aria, focus, reduced-motion).
- `f590080` docs; `0dbefa1` (PR #2) restored copy-on-click and auto-scroll.
- **Reading:** mature heat — reliability, accessibility, offline/caching resilience, repo hygiene.
This is the current product doctrine era: quiet, robust, single-source.

### 2026-02-07 — ambient extensions, one commit
- `ead7a22` added `wallpaper.html`, `js/wallpaper.js`, `css/wallpaper.css` (React-18-based iPhone
  wallpaper generator) **and** `ios/widget/*.swift` + `ios/widget/quotes_hidden_words.json`
  (WidgetKit daily-verse widget). Committed as a single "update".
- **Reading:** the author explored "same daily verse, different ambient surfaces" (wallpaper, home-screen
  widget). Neither is linked from `index.html`; both were added as **experiments**. The widget has no
  Xcode project scaffold in-repo, so it is not buildable as committed (source + data only).

### 2026-03-12 — CI
- `e4ebc79` adds GitHub **Super Linter** workflow (pushes + PRs to `main`). Linters run on changed files.

### 2026-09-10 — Phase 0 seed (this audit)
- `6e09218` commits the agent-first retrofit seed (docs only). This audit.

## What history explains (why important artifacts exist)

| Artifact | Origin | Why it exists today |
|---|---|---|
| Hidden Words + Badíʿ + deterministic selection | first days, 2025-06-03 | The surviving core product. |
| Multi-faith datasets/scrapers | 2025-06-03 | Original multi-faith vision; **abandoned**, never integrated. |
| Minimalist single-passage design | 2025-06-06/07 | Deliberate fork to "Sensible Words"-style minimalism. |
| Caching/error/a11y | 2026-01-31 | Reliability/audit pass — still current. |
| Wallpaper + iOS widget | 2026-02-07 | Ambient extensions of the same idea; experimental, unlinked. |
| Super Linter CI | 2026-03-12 | Minimal hygiene CI on `main` push/PR. |
| Stale roadmap | 2025-06-07 (last edit) | Never reconciled with the minimalist pivot or 2026 work. |

## Historical-limitation notes
- **No tags / releases** — cannot anchor versions.
- Only one long-lived branch (`main`); archaeology of abandoned directions relies on commit messages
  (many are terse, e.g. `update`, `updates`, `a1e8bf3`), so some detailed "why" is inferred from
  file content + dates rather than prose.