# Work Unit H3 — First Real Additional Collection

**State:** `BLOCKED` behind R1. **Gate:** agent-executable **only after** R1 passes.

## Scope (when unblocked)

- Add the verified, rights-cleared Ruhi Book 1 memorization export as a **real** collection, loaded through
  H2B's contract — not by hard-coding a second path.
- Exercise the selector in normal daily use (a full day boundary, not just a unit test): confirm the default
  Hidden Words experience is untouched, that switching collections is deterministic, and that the page stays a
  quiet single-passage page rather than becoming a browsing UI.
- Record the collection's provenance/version in `docs/DECISIONS.md` and `docs/queue.md`.

## Not in scope

Any further collections beyond the first; any settings dashboard; any streaks, journaling, feeds, or runtime AI
(doctrine non-goals).

## Evidence required

Live URL + screenshots of both collections for the same day, the deterministic selection check, and the parity
check that Hidden Words is byte-identical in behavior to pre-H3.
