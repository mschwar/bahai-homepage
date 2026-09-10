# Deployment & Runtime Map

## Deployment: GitHub Pages (static, repo branch `main`)

- **Published URL:** `https://mschwar.github.io/bahai-homepage/`
- **Mechanism:** GH Pages serves the repo's `main` as static files. Confirmed live: `/` → `index.html`
  (title "Daily Sacred Verse"), `HTTP 200`.
- **`.nojekyll`:** present → tells Pages to serve source without Jekyll processing (needed for the
  raw JSON/JS artifacts).
- **No custom domain; no Actions-based deploy step.** Deployment = pushing to `main` on the GitHub
  `origin` (`https://github.com/mschwar/bahai-homepage`).
- **CI:** Super Linter on push/PR to `main` (lint only — does **not** gate or deploy).

## Runtime behavior (all client-side, no server)

- **Zero backend**: no API, no database, no auth, no build step, no runtime asset pipeline. Any static
  host would work; `CORS`/`file://` caveat — README explicitly warns **do not run via `file://`**; use
  `python -m http.server 8000` (a simple static server). Rationale: `fetch()` of JSON needs an origin.

## Client-side runtime dependencies (from source inspection + live checks)

| Dependency | Used by | Loaded from | Live-reachable (verified 2026-09-10) | Failure mode |
|---|---|---|---|---|
| Google Fonts: Source Sans/Serif Pro | `index.html`, `wallpaper.html` | `fonts.googleapis.com` | HTTP 200 | fallback fonts; text remains readable |
| `BadiDateToday.v1.js` (Glen Little) | `js/badi-init.js` | `wondrous-badi.today` | HTTP 200 | code has 4 s timeout + "Badíʿ date unavailable" + Gregorian-only |
| React 18 + ReactDOM (UMD) | **only** `wallpaper.html` | `unpkg.com` | (not re-verified this run; standard CDN) | wallpaper app won't mount |

## Browsers & capabilities the code assumes

- `fetch`, `localStorage`, `navigator.clipboard` (with `execCommand('copy')` fallback), `CanvasRenderingContext2D`
  (wallpaper), `matchMedia('prefers-reduced-motion')`, `<dialog>`-free plain DOM. No transpilation — ES2017-ish
  syntax (async/await, arrow funcs, optional chaining `?.`). No package build; served as authored source.

## Topology (what talks to what)

```
browser ──index.html──▶ data/quotes_hidden_words.json          (fetch, no-store)
   │                    js/script.js (selection+cache+copy+theme+yesterday)
   ├──▶ BadiDateToday.v1.js (CDN) │→ (optional) Geolocation ask
   ├──▶ fonts.googleapis.com (fonts)
   └── (experimental) /wallpaper.html ─▶ React 18 (CDN) ─▶ data/quotes_hidden_words.json
```

- **Every branch of the runtime that matters for the core product** degrades gracefully if its
  CDN/network dependency fails (fonts → fallback; Badíʿ → Gregorian-only; corpus fetch → error + Retry + cached copy).

## Deployment-behavior finding

The **entire repo is served** by Pages (so `wallpaper.html`, `data/quotes_kjv_bible.json`,
`ios/widget/*.json`, and the old datasets are all reachable HTTP 200 even though the homepage never links
them). The homepage hides these, but they are publicly fetchable. For the audit this is a **deployment-state
observation**, not a defect to fix in Phase 0.