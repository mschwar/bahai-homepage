# V1 Responsive Typesetting — implementation handoff

**Date:** 2026-09-15  
**Branch:** `feat/v1-responsive-typesetting`  
**Gate:** OPEN pending foreign QA / Playwright execution before merge.

## Owner authorization

The owner explicitly requested the responsive-typesetting / visual-normalization change on 2026-09-15 and then
instructed that it be implemented directly, committed, pushed, and opened as a pull request for agent review.
That authorization covers the product-file changes in `index.html` and `css/style.css`.

This file is an execution record, not a substitute for the append-only decision ledger. The reviewing agent
should append the corresponding decision to `docs/DECISIONS.md` before merge if it requires the canonical
ledger entry in the same PR.

## What changed

- `index.html`
  - requests Source Sans Pro weight 300 in addition to the existing 400/700 faces.
- `css/style.css`
  - introduces five bounded visual tokens for passage size, line-height, measure, author size, and hero padding;
  - replaces the fixed `700px` / `90%` hero composition with a fluid bounded measure;
  - uses `100dvh` with `100vh` fallback;
  - sets the passage directly from `--quote-size`;
  - makes the author Source Sans Pro 300 at a fluid secondary size;
  - disables synthetic weights for passage and author;
  - adds `text-wrap: pretty`;
  - removes mobile-wide reductions of the global `body` font size.
- `tests/visual-contract.mjs`
  - adds a viewport + DPR matrix;
  - injects the longest eligible Hidden Words passage for content-envelope QA;
  - proves DPR does not change CSS geometry at fixed CSS viewports;
  - provides an optional live-font mode and screenshot evidence directory.
- `Makefile`
  - adds `visual-contract` and `visual-contract-live`.
- `docs/architecture/VISUAL_CONTRACT.md`
  - defines the visual system, invariants, validation matrix, and non-goals.

## Verification performed here

The execution environment has Node.js but does **not** have the repository's Playwright package/browser
runtime and has no outbound GitHub/network access from its shell. Therefore no claim is made that browser tests
were executed.

Performed:

```text
node --check tests/visual-contract.mjs
exit 0
```

Not performed here; required before merge:

```text
make validate
make validate-collections
make check-collections
make parity
make visual-contract
make visual-contract-live
```

Recommended review evidence:

```text
VISUAL_EVIDENCE_DIR=docs/audit/2026-09-15/V1 make visual-contract-live
```

## Foreign-QA focus

1. Inspect the screenshot matrix for perceptual hierarchy, especially the 1440×900, 1920×1080, and 4K cases.
2. Confirm Source Sans Pro 300 actually reads as the intended “unbolded” attribution on macOS and Windows.
3. Verify the longest eligible passage does not collide with the scroll arrow on 390×844.
4. Check that normal status/retry UI did not inherit the hero scale.
5. Run existing parity and confirm no behavior was re-pinned unintentionally.
6. Append the canonical decision-ledger entry before merge if required by repo governance.

## Stop condition

Do not merge merely because lint/CI is green. V1 closes only when the browser gates above are green and the
visual matrix is judged to preserve the intended quiet hierarchy across the supported envelope.

## Post-review addendum (2026-09-15, foreign-QA follow-up)

This handoff is the authoring record and is left intact. Three things in it are superseded; the live contract is
`docs/architecture/VISUAL_CONTRACT.md` and the merge-gate evidence is `docs/audit/2026-09-15/V1_*.txt`.

- **The OPEN browser gate is closed.** The gates listed under "Not performed here" were executed on the merge
  host and recorded in `V1_CHANGED_RUN.txt` (`make validate` 153/0/0/0, `make validate-collections` PASS,
  `make check-collections` PASS, `make parity` 39/0 unchanged, `make visual-contract` 13/0,
  `make visual-contract-live` 13/0, `make wallpaper-check` 4/0). The baseline is `V1_BASELINE_MAIN_RUN.txt`.
- **The recommended evidence path above is withdrawn.** `VISUAL_EVIDENCE_DIR=docs/audit/2026-09-15/V1` would
  commit PNGs into the publicly served branch; use an out-of-git path (e.g. `/tmp/v1-evidence`) unless a
  specific unit decides otherwise. The reviewer's findings and this follow-up are recorded in
  `V1_FOREIGN_QA_RUN.txt`, and the owner authorization for the frozen-file change is `docs/DECISIONS.md` D32.
- **The contract grew two assertion classes the review found missing.** The suite now asserts a WCAG contrast
  ratio of at least 4.5:1 for passage and attribution in **both** themes (the geometry-only suite could not
  falsify this repo's "visible but the same colour as its background" defect class), and it pins the wrapper's
  composition as a relation (`min(88vw, clamp(43rem, 45vw, 80rem))`) rather than a pixel snapshot, so a
  fixed-ceiling regression now fails at every matrix viewport instead of only at 2560/4K.

