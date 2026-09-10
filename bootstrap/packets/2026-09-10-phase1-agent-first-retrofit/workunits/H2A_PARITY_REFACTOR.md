# Work Unit H2A — Live-Site Refactor / Parity

**State:** `pending` — **NOT authorized by this packet.** Requires H1 accepted + a new execution packet.
**Gate:** agent-executable once the parity suite exists. **Rule:** parity tests before implementation change.

## Why it is not now

H1 freezes the product and installs the docs/queue/ledger. H2A is the first unit allowed to *touch* the live
code, so it needs its own authorization and its own packet generated after H1's handoff is reviewed.

## Contract

1. **Write behavioral parity tests against the current implementation first.** They must pin, at minimum:
   - deterministic day-of-year selection over the ≤75-word subset;
   - today/yesterday relationship and the "Yesterday" recall;
   - the cache-by-date path **including the Badíʿ-day-cache wrinkle** — `saveCachedQuote(pendingBadiKey,
     todayObj)` writes today's quote under the *Badíʿ-day* key (`TECH_DEBT_AND_RISKS.md` #7), so a later Badíʿ
     cache hit can render a mismatched verse;
   - theme persistence across reloads;
   - the Badíʿ date path and its graceful degradation when the external `BadiDateToday.v1.js` is unreachable;
   - clipboard copy behavior;
   - reduced-motion handling.
2. **Only then refactor**, in small reviewed steps: extract the duplicated selection/caching logic into a shared
   module (`js/script.js` and `js/wallpaper.js` currently reimplement it); replace the `innerHTML` Badíʿ
   string with text nodes + `<br>` (#11); normalize run docs.
3. **Parity suite green before and after** every change. No framework, bundler, or build step.
4. The iOS widget (`ios/widget/QuoteStore.swift`) reimplements the same logic in Swift — do **not** attempt to
   unify it here; note it for H2B's contract.

## Out of scope

Any collection model, selector, or settings UI (H2B); any visual redesign; any dependency add.

## Evidence required

The test file(s), the command that runs them, the pass output before the refactor, and the pass output after.
