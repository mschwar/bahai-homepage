# Product Doctrine Reconstruction

Reconstructed **from behavior + history**, then used to test the hypothesis in `PRODUCT_DOCTRINE_SEED.md`.
Each seed claim is marked **SUPPORTED / REFINED / UNSUPPORTED** with evidence. (Distinguish observation from
interpretation: observations are from `index.html`/`js/script.js`; interpretations are labelled.)

## Core job — SUPPORTED (refined wording)

> Make encountering the Creative Word an ordinary, quiet part of opening a device.

Observation: the page loads into a single full-viewport jumbotron with today's verse; no feed, no dashboard,
no dashboard clutter; copy at a click; the only chrome is a floating theme toggle and a down-arrow to a date
panel. That matches "quiet, ordinary, first thing on a device". The device phrase is supported by the two
ambient surfaces (wallpaper, iOS widget) and by "Homepage". **Refinement:** it is person-scale/single-user,
not a shared/social feature — worth spelling out.

## North-star constraint — SUPPORTED

> Increase the breadth of what the homepage can quietly surface **without increasing the cognitive weight**.

Evidence: the product resists adding settings-drawer faith chooser (never built), rejects feeds/engagements;
the wallpaper and widget are *the same verse on another surface*, not more choices. Yesterday is one button.
This accurately predicts the `H2B` "deliberately low-weight" selector guidance — the doctrine is coherent.

## Likely stable invariants — tested one by one

| Invariant (seed) | Verdict | Evidence |
|---|---|---|
| Sacred text is visually/conceptually primary | **SUPPORTED** | Verse is the hero `<h1>`; citation secondary; date tertiary |
| Default experience is one passage, not a feed/dashboard | **SUPPORTED** | single jumbotron; "Yesterday" is opt-in reveal |
| Selection is deterministic enough that "today" is stable | **SUPPORTED** | `quotes[dayOfYear % len]`, cached by date, no randomness |
| Source/provenance is preserved | **SUPPORTED** (weakly) | `source` field rendered; but no citation edition, no collection contract |
| Badíʿ temporal context is meaningful; location/sunset-aware when available | **SUPPORTED** | `askForUserLocation`, sunset-aware via BadiDateToday; two-line Badíʿ display |
| Degrades gracefully if location/network fail | **SUPPORTED** | 4 s timeout, onFailure messaging, Gregorian-only; verse not blocked; Retry |
| Lightweight yesterday/history affordance is compatible | **SUPPORTED** | Yesterday jumbotron (one button, hidden by default) |
| Ambient surfaces (wallpaper/widget) are legitimate extensions of the same encounter idea | **SUPPORTED** | both added 2026-02-07 using the same corpus/selection; never linked into a settings maze |

**No supported invariant was contradicted.** Add two observed invariants the seed understated:
- **Dark/light theme is a real, persistent preference** (`localStorage.theme`, floating toggle).
- **The experience is single-corpus ("The Hidden Words") by deliberate pivot**, not by accident of scope — the
  multi-faith datasets were abandoned, not merely unshipped-yet.

## Product expansion (collection/source selector + explicit contract) — REFINED to match evidence

Seed: expand via unobtrusive collection/source selector + generalize hard-coded path to
`homepage → selected collection → eligible passages → deterministic daily selection`, Hidden Words default,
tiny deterministic fixture for tests, not blocked on Ruhi.

**Verdict: SUPPORTED as the directional plan**, with two evidence-based refinements:
1. **Do not resurrect the multi-faith roadmap** as the reason to build it. The selector's *first* real second
   collection should be the (eventual) provenanced Ruhi memorization export, not the old Gita/KJV/Dhammapada
   datasets — which are abandoned and untracked-provenance. The seed's "fixture to test the abstraction" is the
   right minimal acceptance path.
2. The selector must honor the north-star: **low-weight** (a single control, not the abandoned settings-drawer
   with faith icons). Evidence: the 2025 drawer vision died; a faithful extension is minimal.

## Explicit non-goals / warnings — SUPPORTED (and confirmed by residue)

| Non-goal (seed) | Observation |
|---|---|
| Don't clone Natalia's feature-rich devotional/study app | Natalia (separate repo) is heavier (journaling, streaks, calendar); homepage stayed minimal — supported |
| Don't assume old multi-faith roadmap still desired | Multi-faith data is orphaned residue; roadmap stale/contradictory — supported |
| No runtime AI interpretation/journaling/streaks/recommendation feeds/engagement mechanics | none present in src — supported |
| Don't rewrite working code for a fashionable framework | current impl is framework-free, small, working — supported |
| Don't publish a Ruhi Book 1 "memorization collection" until contract + curation/provenance/copyright exist | no Ruhi data present; correctly absent — supported (and it must stay BLOCKED) |

## Stated product intent (single line for reuse)

> A quiet, deterministic, single-passage daily verse from The Hidden Words (with Badíʿ date and a light
> yesterday/theme affordance) that degrades gracefully, and — without adding cognitive weight — may extend the
> same everyday verse to ambient surfaces (wallpaper, widget). Future collections follow only a deliberate,
> low-weight, provenance-first contract, and never reintroduce the abandoned multi-faith dashboard.