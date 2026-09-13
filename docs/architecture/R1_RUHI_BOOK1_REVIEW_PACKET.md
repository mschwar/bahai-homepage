# R1 — Ruhi Book 1 memorization collection: review packet

**Status: RESOLVED — owner accepted all six decision items (A(a), B(b), C(a), D(a), E(a), F(a)) on
2026-09-13; recorded as `docs/DECISIONS.md` D30.** With this, `docs/queue.md` R1 is closed and `H3` (the
first real additional collection) is the unblocked next unit. The applied C(a) outcome is that the single
over-length designated passage (`RUHI-B01-U02-S08-Q03`, 118 words) is **excluded and recorded**, not silently
dropped — see §4. **No verse text is included in this packet on purpose** — the entire `main` branch is
publicly served (GitHub Pages, `build_type: legacy`, path `/`), and this review settled the rights posture
before any payload touches that branch. Verse text is resolved only in `R1`'s export step / `H3`, after the
review passes.

**Owner gate: human.** Producing the decision entry and the collection payload is a
rights/provenance/curation judgment, which `AGENTS.md` reserves for the owner — an agent does the
research and drafting under the chosen options, but the calls below are the owner's.

---

## 0. What R1 needs from this review (the queue's contract, restated)

> Determine which Book 1 passages are actually designated for memorization; map to
> `bahai-quote-ledger`; distinguish occurrence identity from passage/content identity; verify
> authoritative citations and text; document selection criteria; review redistribution/copyright;
> emit a versioned export conforming to the homepage collection contract.

**Explicit guard, not negotiable:** do **not** substitute "all direct quotations in Book 1". The
`R1` unit's whole reason to exist is that the set is *smaller and more specific* than the full
quotation set.

**Already satisfied (D28, closed):** the collection contract exists
(`docs/architecture/COLLECTION_CONTRACT.md`, decision D27), the import/provenance path works
(`docs/architecture/COLLECTION_IMPORTS.md`, byte-identical hash-gated vendoring), and a second
real collection is wired (Garden-of-Wisdom preview). So the *only* thing blocking R1 is this
rights/scope review — nothing technical is left to invent on the homepage side.

---

## 1. What a Book 1 memorization collection is (orientation, for the decision)

Book 1 of the Ruhi institute sequence ("Reflections on the Life of the Spirit", 3 units) has a
memorization component: students are asked to memorize specific passages from the Writings —
typically short prayers and verses, including the Short Obligatory Prayer — alongside studying the
units. The quote ledger already records every *direct quotation* the book contains (71 verified
`RUHI-B01` quotes, spread across Units 1–3), but the ledger has **no field that flags which of
those are the designated memorization set**. Establishing that set is the first research deliverable
of this review (Item A).

Two things are copyrighted and must not be conflated:

- **The Scripture passages themselves** — authoritative Bahá'í texts. The same library
  (`bahai.org`, the Reference Library) is the source the website already ships for Hidden Words.
  Quoting them with attribution is the site's existing, uncontroversial posture.
- **The Ruhi workbook framing** — the Ruhi Institute's own course text (the study-sheet wording,
  exercises, the sentence "Memorize the following passage…"). This is `© Ruhi Foundation` and must
  **not** be reproduced. A factual list of which Writings passages Book 1 designates, plus the
  quoted verses, is not the workbook's framing.

The whole risk in R1 is accidentally shipping the second. The decisions below keep the boundary.

### Checklist the ledger (`~/bahai-quote-ledger`) gives us

- B1 = `RUHI-B01`, 71 verified quotes, 3 units, `status: verified`, `verification_confidence` set,
  provenance (book / edition / unit / section / page) on every entry. *(Skill + draft files,
  `Sources/drafts/RUHI-B1-verified.jsonl`.)*
- Occurrence vs content identity is already modeled: one atomic note per unique quote, every
  appearance in an `appearing_in` list; dedup by normalized text + Writings source; `quote_key` is
  a one-way content hash (the site publishes `quote_key`, never text). This lines up exactly with
  the homepage contract's `upstream_id` cross-reference.

---

## 2. Decision items — three options + a recommendation each

### A. Selection scope: what "designated for memorization" means (Item 1, the core)

The guard forbids the lazy definition. The genuine answer is a specific, enumerable set.

- **(a) Strict enumeration — exactly the passages Book 1 asks students to memorize.** A small,
  curated, explicitly-listed set derived from the book's memorization component (research step R1.1
  below pins the authoritative list). Honors the guard, smallest set, cleanest rights posture.
  **← RECOMMENDED.**
- (b) The strict set **plus** a small set of commonly-memorized Book-1-associated prayers (e.g. the
  Short Obligatory Prayer where it is an exercise rather than a designated memo passage). Risk:
  scope drift — "commonly memorized" is exactly how "all quotations" sneaks back in.
- (c) Every ≤75-word Writings passage quoted anywhere in Book 1. **This is the forbidden "all
  direct quotations"** — it collapses R1 back into the guard's negative case and is not acceptable.

**Recommendation (a).** The entire unit is predicated on a *precise, defensible* selection; (a) is
the only option that stays strictly inside the guard. If the research shows the designated set is
small (typical), (a) is also the cheapest to verify and easiest to rights-review.

### B. Rights / publication posture for the served passages

- (a) **Publish publicly, as Hidden Words already is**: ship only the authoritative Scripture text,
  verified against bahai.org (the same Reference Library), with author + `source_ref` +
  `source_url`; `rights_note` states text = authoritative Scripture, and a documented rule that
  Ruhi workbook framing is never copied. **← RECOMMENDED.**
- (b) Same as (a) but keep the served `label`/selector surface **neutral** (e.g. "Prayers of the
  Spirit") and carry the "Book 1 memorization" designation only in `provenance_note`/`description`,
  so the shipped UI never names the Ruhi course. Conservative fallback if the course name in the
  public surface makes you uncomfortable.
- (c) Hold everything private / archive-branch until formal written permission from the Ruhi
  Institute. Highest bar; likely slow, and arguably unnecessary for authoritative Scripture that is
  already public on bahai.org.

**Recommendation (a),** with the workbook-framing boundary stated and encoded. The Scripture verse
text ═ the same class of content already served; the copyrighted workbook copy is never imported.
Choose (b) if you want the public surface to avoid the course name; choose (c) only if you want a
recorded permission gate before *any* payload ships.

### C. Length / eligibility (max_words: 75)

`schema_version: 1` supports exactly one rule shape: `{ "max_words": 75 }`. Selection runs over the
eligible subset.

- (a) **Ship only designated passages ≤75 words**; no rule change, no schema bump. **← RECOMMENDED.**
- (b) If the authoritative designated set genuinely contains a passage >75 words, surface it as a
  decision *at that point*: either exclude it (option a), or extend the contract by bumping
  `schema_version` and adding a rule shape (allowed by the contract's design, but a bigger change).
- (c) Silently drop over-length passages with no recorded exception — not acceptable (an unrecorded
  exclusion is invisible curation).

**Recommendation (a)**, which is also the useful direction: Book 1 memorization pieces are short
prayers and verses, so the set likely fits today's rule. Only elevate to (b) if measurement shows a
designated passage genuinely exceeds 75 words — that is a separate, small decision to record.

### D. Author / attribution

Book 1 memorization spans multiple Manifestations (Bahá'u'lláh, the Báb, 'Abdu'l-Bahá).

- (a) **Set `author` explicitly on every item.** The contract requires this for any collection
  whose default author isn't the Hidden Words default — and Book 1's set is inherently multi-author. **← RECOMMENDED.**
- (b) Default all to "Bahá'u'lláh" and rely on the fallback — factually wrong for the Báb /
  'Abdu'l-Bahá passages.
- (c) Omit `author` and lean on `source_ref` — the contract's `source_ref` is a citation, not an
  author display; callers expect an author.

**Recommendation (a).** No reasoning to defend — it is simply what the contract and the material
require.

### E. Source of the item set — ledger import vs. hand-built (occurrence vs. content identity)

- (a) **Derive from the ledger's verified `RUHI-B01` set** (71 verified quotes), filtered to the
  designated memorization subset, inheriting `verified` status + provenance; homepage items are
  **one per unique passage** (content identity), each `appearing_in` occurrence mapped back via
  `upstream_id` → ledger quote id and the non-text-revealing `quote_key`. **← RECOMMENDED.**
- (b) Build the collection directly, fresh verification per passage — redundant work the ledger
  already did for B1, and it abandons the occurrence→content mapping the queue explicitly asks for.
- (c) Keep the collection standalone with no ledger link — loses the provenance trail this unit was
  created to carry.

**Recommendation (a).** It directly answers the queue's "map to `bahai-quote-ledger`; distinguish
occurrence identity from passage/content identity" clause: uniqueness by content (one item per
passage), occurrences recorded in provenance/`upstream_id`. If a designated passage is somehow not
among the 71 verified quotes, that passage is a new research+verification item, not a silent gap.

### F. Versioned export + packaging / timing

- (a) **Review now (this packet → owner decision entry), and let `H3` (agent, after the review
  passes) build the real export and wire the registry.** No `data/` or `index.html` change in this
  review. **← RECOMMENDED.**
- (b) Also stage a *draft* collection skeleton under `tests/` (never `data/`) so H3 is a formality —
  premature; the set isn't decided until the review passes.
- (c) Land the collection payload concurrently with the decision — races the rights gate the whole
  unit exists to clear.

**Recommendation (a).** Keep R1 = the owner's decision record; make the payload an `H3` (agent)
deliverable against that decision. This preserves the gate in `AGENTS.md` (a rights/curation
question is the owner's) and keeps the served branch clean until authorized.

---

## 3. Research steps the review needs (agent-draftable under the chosen options)

These produce the evidence the owner's decision pins; they are listed so the decision has a concrete
"what will happen next" attached, and so the chosen options each know their inputs.

- **R1.1 — Pin the designated memorization set.** Source the authoritative list of passages Book 1
  designates for memorization (the book's memorization component / official Ruhi curriculum
  guidance / the Bahá'í Reference Library), and enumerate it as a bounded set with a citation each.
  *This is the one step that has to touch external/curriculum sources, so it is the research that
  gates everything else.*
- **R1.2 — Filter the ledger.** Take the 71 verified `RUHI-B01` quotes; identify which are in the
  designated set; report any designated passage missing from the ledger (→ new research item).
- **R1.3 — Verify text.** Cross-check each selected passage's text + citation against
  bahai.org (the authoritative library; matches how `verification_state: verified` already works in
  this repo). Record per-passage `source_ref` / `source_url`.
- **R1.4 — Build the export.** A versioned file conforming to `COLLECTION_CONTRACT.md`: required
  collection fields, explicit `author` on every item, `default_eligibility: {"max_words": 75}`,
  `item_type: full-passage|excerpt` per-passage, `verification_state: verified` (post-R1.3),
  `upstream_id` = ledger quote id, byte-identity enforced via
  `scripts/import_collection.py --expected-sha256` when vendored.
- **R1.5 — Handoff.** Close R1 in `docs/queue.md`, decide the `collection_id`/`label`, record the
  decision entry + `rights_note`, and set `H3` up to wire the file + `[data-source]` button.

---

## 4. Exit gate for this review

The review is complete when it produces: **(1)** a recorded decision entry (`docs/DECISIONS.md`,
next free D-number) naming the answer to each item in §2 above, **(2)** the pinned designated set
from R1.1 with citations, and **(3)** a `rights_note` and `provenance_note` statement of record.
`R1` then closes and `H3` becomes the unblocked next unit. Until then, R1 stays `BLOCKED` and
**no** collection payload or `data/*`/`index.html` change is made.

**Exit gate — CLOSED (2026-09-13).** All three deliverables exist: **(1)** decision entry
`docs/DECISIONS.md` **D30**, recording the owner's acceptance of A(a), B(b), C(a), D(a), E(a), F(a);
**(2)** the pinned designated set — `docs/architecture/R1_RESEARCH_FINDINGS.md`, 22 passages across Unit 1
(Sections 1, 3, 5, 7, 9) and Unit 2 (Sections 7, 8, 9), each with its book directive and citation, all
verified to confidence tier A; **(3)** the `rights_note` of record (B(b)): verse text = authoritative
Scripture already public on `bahai.org`, neutral shipped `label`, Ruhi workbook framing never reproduced.

**Applied C(a) exclusion, recorded not silent.** Of the 22 designated passages, **21 are ≤75 words and
eligible**; the single over-length one — `RUHI-B01-U02-S08-Q03`, the 118-word 'Abdu'l-Bahá passage
(Selections from the Writings of 'Abdu'l-Bahá no. 22.1) — is **excluded under C(a)** and recorded here and in
the findings file. No schema bump was taken.

**What closes and what opens.** `R1` closes; `H3` is the unblocked, agent-executable next unit (payload + the
registry/`[data-source]` wiring, then a day-of-year selection check with Hidden Words parity unchanged). **No
collection payload or `data/*`/`index.html` change was made by this review** — that remains `H3`'s work, under
D30.

---

## 5. What needs your eyes (the short list)

Only three calls in this packet are genuinely judgment, not research:

1. **Item A — the scope boundary** (strict designated set vs. any additive set). The default is
   (a); it is the whole reason R1 exists.
2. **Item B — the publication posture** (public as authoritative Scripture, neutral-labelled, or a
   formal-permission gate). The copyrighted risk is the workbook framing; the verse text is not.
3. **Item C — whether a >75-word designated passage, if found, is acceptable to exclude** (vs.
   extending the contract). Almost certainly moot; flagged so it is a decision, not a surprise.

Items D, E, F are near-automatic (explicit authors; ledger-derived content-identity mapping;
payload deferred to H3) — you are asked to confirm, not agonize. The research steps (R1.1–R1.5)
are execution I, or you, run once the decisions above are recorded.