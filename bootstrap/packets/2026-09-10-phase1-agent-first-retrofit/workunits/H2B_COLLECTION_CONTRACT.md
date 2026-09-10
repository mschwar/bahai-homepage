# Work Unit H2B — Collection / Source Abstraction

**State:** `pending` — **NOT authorized by this packet.** Requires H1 accepted + a new execution packet.
**Gate:** agent-executable **once an explicit data/provenance contract is written**. Does **not** depend on Ruhi.

## The seam this closes

`TECH_DEBT_AND_RISKS.md` #1: the corpus path (`data/quotes_hidden_words.json`) and the `75`-word cap are
hard-coded independently in `js/script.js`, `js/wallpaper.js`, and `ios/widget/QuoteStore.swift`, each
reimplementing selection + caching — with **no collection model, no schema version, no provenance record**.
Also #4: `data/quotes_hidden_words.json` and `ios/widget/quotes_hidden_words.json` are byte-identical with no
single source of truth or regeneration step.

## Shape of the change

Model the product as an explicit chain:
`homepage → selected collection → eligible passages → deterministic daily selection`.
Hidden Words is the default collection and must render **identically** before and after. The mechanism can be
tiny (a collection descriptor + a loader + the existing selection rule) — it must not become a dashboard.

## Acceptance (verbatim intent from the seed)

- Hidden Words remains default and behaves identically.
- A tiny **deterministic test fixture / second collection** can be selected.
- Selection is deterministic within a collection.
- Collection/source metadata and provenance have an **explicit contract** (schema version, source, attribution,
  eligibility rule such as the word cap, and a content-hash so regeneration is verifiable).
- The selector is deliberately low-weight; it does not turn the page into a settings dashboard.

## Also in scope

- Single source of truth for the corpus + a documented regeneration step for the root and iOS copies.
- Defining what a collection export must contain, which is precisely the interface R1/H3 will need.

## Explicitly out of scope

Any real second *content* collection (that is H3, and it is blocked behind R1's rights review); any Ruhi
extraction; any UI settings work beyond the minimum needed to prove selection.

## Evidence required

The contract document; the fixture collection; proof that Hidden Words output is unchanged (selection for the
same day yields the same passage before/after); the determinism check; the provenance/version fields shown in a
real generated artifact.
