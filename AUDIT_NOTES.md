# Audit Notes (2026-01-31)

## Baseline findings

- `.DS_Store` and `.obsidian/` were present in the repo root.
- Badíʿ date UI could remain stuck on “Loading…” when location permission was denied or the library failed.
- Quotes JSON fetch failures returned empty content with no user-facing error or retry.
- “Yesterday” and arrow controls were anchors; keyboard/focus behavior was inconsistent.
- Multiple `<h1>` elements existed on the page.
- No local caching for daily verse, so refreshes could flicker.

## Decisions

- **Option A** for Obsidian: remove `.obsidian/` from the repo and block it in `.gitignore`.
- Add minimal docs for security, contributing, and licensing.
- Add client-side fallback messaging for location and network errors.
- Add localStorage caching keyed by local date (and Badíʿ day when available).
- Add a small JSON validation script and `make validate`.

## QA checklist (manual)

- Desktop + mobile widths
- Location allowed vs denied
- Hard refresh (cache cold)
- Offline / JSON fetch failure
- Keyboard-only navigation
- Confirm `.DS_Store` and `.obsidian/` are not in `main`

## Pending manual validation

- Browser-based checks (location allow/deny, offline simulation, mobile layout) need to be run locally in a browser.
