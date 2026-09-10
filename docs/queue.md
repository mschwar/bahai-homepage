# Work Queue

Canonical forward plan for `bahai-homepage`. Supersedes `PROJECT_ROADMAP.md` and
`docs/audit/2026-09-10/QUEUE_PROPOSAL.md` (the latter is historical input; this file is the plan of record).

## Semantics

- **States:** `pending` · `in-progress` · `blocked` · `done`.
- **Owner gate:** `agent` = agent-executable once its contract exists; `human` = requires owner judgment
  and sign-off.
- **Evidence is a field, not a vibe.** A unit is `done` only with recorded command output. A unit that
  cannot be proven is reported `OPEN`, never `done`.
- **Standing rule:** provenance / copyright / canonical-text / curation questions are **human-gated
  research**. Contract design and code are **agent-executable**. A unit enters the queue only with a named
  contract **and** a gate.

---

## H1 — agent-first repo retrofit · **done** · gate: agent · accepted 2026-09-10

Units H1.1–H1.9 (`bootstrap/packets/2026-09-10-phase1-agent-first-retrofit/workunits/H1_AGENT_FIRST_RETROFIT.md`)
plus H1C (`…/H1C_ORPHAN_UNPUBLISH.md`).

**Exit gate:** the ten gates in `SCOPE_AND_GATES.md` closed with pasted command output, then owner review of
`PHASE1_HANDOFF.md`. **Closed:** the owner accepted H1 on 2026-09-10 (in-session, recorded in
`PHASE1_HANDOFF.md` §9). Gate 3's deviation D-A was closed before acceptance by delivering the root `AGENTS.md`
(§8), so all ten gates stand as recorded.

**Evidence:** `PHASE1_HANDOFF.md` (per-gate command output, plus §8 closure note and §9 acceptance record).
`H1.2` is complete; `H1.10` is not part of H1 and remains a separate owner-gated unit below.

**H1.2 closure — 2026-09-10, post-handoff (deviation D-A closed).** The root `AGENTS.md` now exists, with
content byte-identical to the retired `README.md` Appendix A, and the appendix is gone. Alongside it: the three
`README.md` pointer references and `docs/RUNBOOK.md`'s header now name `AGENTS.md`; `CONTRIBUTING.md`'s broken
commands were fixed (`python` → `python3`; unpinned `pip install requests beautifulsoup4 lxml` →
`pip install -r requirements-dev.txt`) because bare `python` is the pyenv failure mode `RUNBOOK.md` §7 already
records; and `PHASE1_HANDOFF.md`'s deviation section carries an append-only closure note.

## H1.10 — on-page link to the ambient surfaces · **pending (optional, owner-visible)** · gate: human

Owner decision Q1 was "document + link" for the wallpaper and widget; H1 links them from the docs only,
because an on-page link would edit `index.html`. If the owner wants an unobtrusive footer link, this unit adds it
with before/after screenshot evidence and knowingly re-runs the parity hashes. This is the one sanctioned
exception to the freeze and requires an explicit new authorization.

**Evidence:** before/after screenshots, re-run sha256s, owner sign-off.

## H2A — live-site refactor / parity · **pending** · gate: agent (H1 accepted 2026-09-10 → gate satisfied)

**Gate satisfied, still not started.** Owner acceptance of H1 (`PHASE1_HANDOFF.md` §9) removes H2A's
precondition. As written, H2A has two halves with **different authority**: writing the parity suite is
agent-executable, but the refactor it enables changes frozen files (`AGENTS.md`: a frozen-file change "needs an
owner decision and parity evidence") and therefore needs its own explicit authorization. Executors must not
treat the satisfied gate as covering both halves.

Contract: **write behavioral parity tests first, change implementation second.** The parity set must cover
deterministic day-of-year selection, today/yesterday match, cache-by-date **including the Badíʿ-day-cache
wrinkle** (`TECH_DEBT_AND_RISKS.md` #7 — today's quote is written under the Badíʿ-day key), theme
persistence, the Badíʿ fallback path, clipboard copy, and reduced-motion.

Only then consider safe refactors: extract the selection/collection logic into a shared module (currently
duplicated across `js/script.js`, `js/wallpaper.js`, `ios/widget/QuoteStore.swift`), normalize run docs, and
convert the `innerHTML` Badíʿ string to text nodes (#11). **No framework adoption.**

**Exit gate:** parity suite green *before* and *after* the refactor.
**Evidence:** parity suite output, before and after; frozen-file hashes.

## H2B — collection / source abstraction · **pending** · gate: agent (after the data contract is written)

Acceptance criteria (preserved verbatim from the seed):

- Hidden Words remains the default and behaves identically.
- A tiny deterministic test fixture / second collection can be selected.
- Selection is deterministic within a collection.
- Collection/source metadata and provenance have an **explicit** contract.
- The selector is deliberately low-weight and does not turn the page into a settings dashboard.

Also in scope: a single source of truth for the corpus (the root and `ios/widget/` copies are byte-identical
today with no regeneration step — `TECH_DEBT_AND_RISKS.md` #4), and an explicit schema/version/provenance
header.

Depends on the data/provenance contract, **not** on Ruhi.
**Evidence:** the written contract + the fixture-selection test output + Hidden Words parity before/after.

## R1 — Ruhi Book 1 memorization collection · **BLOCKED** · gate: human

Blocked by **(a)** H2B's collection contract and **(b)** a rights/provenance review. **No timeline** (owner
decision Q4) — the gate is generated by H2B, not by a date.

Research task: determine which Book 1 passages are actually designated for memorization; map to
`bahai-quote-ledger`; distinguish occurrence identity from passage/content identity; verify authoritative
citations and text; document selection criteria; review redistribution/copyright; emit a versioned export
conforming to the homepage collection contract.

**Explicit guard:** do **not** substitute "all direct quotations in Book 1". Confirmed: no Ruhi data exists
in this repo (correctly absent).

**Unblock evidence required:** H2B contract merged + a recorded rights/provenance review outcome.

## H3 — first real additional collection · **BLOCKED (behind R1)** · gate: agent after R1 passes

Add the verified Ruhi memorization export as a real collection; exercise the selector in normal daily use.
**Evidence:** the loaded collection + a day-of-year selection check + Hidden Words parity unchanged.

---

## Candidate units — documented defects, not yet authorized

Found during the post-handoff review of `PHASE1_HANDOFF.md`, the appendix retirement and the CI repair. Each
names a contract and a gate. `C1` is done; `C2` and `C3` are not scheduled and not authorized.

### C1 — CI is red on `main`: Super Linter's natural-language rules reject the docs' own vocabulary · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option (a)):** CI now runs `super-linter/super-linter@v8.7.0`, pinned
by commit SHA; the natural-language category is off; markdownlint stays on and the 13 real MD040 findings are
fixed; the formatter/duplication categories that would rewrite frozen files or append-only records are off; and
zizmor's unpinned-action finding is fixed with SHA pins plus a Dependabot config that keeps them fresh.
**Evidence:** PR #4, run [`34527479040`](https://github.com/mschwar/bahai-homepage/actions/runs/34527479040) —
`success`, all sixteen categories `pass`. Full rationale, including the first attempt's six failures, is
`docs/DECISIONS.md` D10.

---

**The original diagnosis (kept as the executed contract):**

**Evidence (2026-09-10):** `gh run list --workflow "Lint Code Base"` returns `failure` for the HEAD commit
(`docs: add PHASE1_HANDOFF.md with gate evidence`, run `34524938962`, 1m57s) and for both Phase 0 doc commits.
The only post-H1 success is the code-only unpublish commit. Root cause from `gh run view --log-failed`: the
`textlint` terminology rule rejects the words this project documents itself with — `repo` → `repository`,
`build system` → `build tool` — in `README.md`, `PHASE1_HANDOFF.md`, `docs/RUNBOOK.md` and the Phase 0 audit
docs. Secondary: `.github/workflows/super-linter.yml` pins `github/super-linter@v4` (superseded/archived
upstream) and the run logs `Failed to call GitHub Status API` (curl 403) noise before exiting.

**Correction (added 2026-09-10, after the fix):** "the only post-H1 success" was wrong as a measure of
coverage. Two further runs on `main` — the merge-commit pushes `d4e1d30` and `a8bf7e5` — also reported
`success`, but they linted **nothing** (`No files were found in the GITHUB_WORKSPACE to lint!`). Only PR runs
and plain pushes lint their changed files. See `C3`.

**Why it is a defect, not cosmetics:** the default branch advertises a failing check to every cold-start agent,
while `README.md` and `docs/RUNBOOK.md` both claim CI is "hygiene only, does not gate or deploy". A red check
everyone has learned to ignore is worse than no check — and it trains agents to dismiss red before they can
tell the two kinds apart.

**Contract:** pick exactly one and record it in `docs/DECISIONS.md` —
(a) keep Super Linter but disable the natural-language/terminology rules for markdown (`.textlintrc` /
`FILTER_REGEX_EXCLUDE`), on a supported action version;
(b) adopt the rule's vocabulary project-wide (~30+ replacements across 5+ docs — manual rewrites of the
prohibitions in `AGENTS.md` / `DECISIONS.md` are explicitly not acceptable collateral); or
(c) delete the workflow and let `make validate` be the one documented check.
**Exit gate:** the resulting run on `main` is green, and the choice is recorded.
**Gate:** human — CI configuration is outside the agent autonomy boundary (`AGENTS.md`: "Do not add CI/deploy
changes … as a side effect").

### C2 — Root docs are unmapped: live docs, spent residue, and history are indistinguishable · gate: agent

**Evidence:** `README.md`'s "Where the truth lives" list and its three status bands do not name
`AUDIT_NOTES.md`, `CONTRIBUTING.md`, `HANDOFF.md`, `PHASE1_HANDOFF.md`, `START_HOMEPAGE_RETROFIT.md` or
`SECURITY.md`, and all six sit in the publicly served root. Two are spent by construction:
`START_HOMEPAGE_RETROFIT.md` is a launcher whose "first authorized task" is the Phase 0 archaeology prompt
(executed), and `AUDIT_NOTES.md` is dated 2026-01-31 and is not reconciled with the Phase 0 audit that
superseded it — its recorded decisions are not cited anywhere in `docs/DECISIONS.md`.

**Why it is a defect:** H1's stated purpose was that a cold-start agent can tell what is current. Six root
markdown files with no declared status leave the reader to guess which are live, which are historical, and
which are the bootstrap that produced this phase.

**Contract:** classify each root `.md` as live / historical / bootstrap, state the classification in
`README.md` ("Where the truth lives"), and move the historical ones under `docs/history/` behind a SUPERSEDED
banner using the D5 mechanism. Non-destructive: nothing is deleted, and no frozen file is touched.
**Evidence:** the classified map in `README.md` + `git ls-files '*.md'` before/after.
**Gate:** agent — documentation only.

### C3 — CI lints nothing on a merge-commit push · gate: human

**Evidence (2026-09-10):** of the five `Lint Code Base` runs examined, every plain commit push and PR run found
its files, and both merge-commit pushes to `main` found none:

| Run | Head | Commit kind | Result |
|---|---|---|---|
| `34524824941` | `ebe5b78` | plain | linted its files, success |
| `34524938962` | `20bfe1a` | plain | linted its files, **failure** (the C1 bug) |
| `34525756201` | `d4e1d30` | **merge** | `No files were found … to lint!`, success |
| `34526018773` | `a8bf7e5` | **merge** | `No files were found … to lint!`, success |
| `34527479040` | `f67f470` | plain (PR) | linted its files, success |

Super Linter computes "changed files" from the push range; for a merge commit that computation yields an empty
set, so the job exits green having checked nothing.

**Why it matters:** every unit in this repository's history has landed as a branch + merge. On that path the
merge commit is the only thing `main` sees, and it is unchecked — so "CI is green on `main`" can be true and
meaningless at the same time. This is the same failure mode as C1 (green/red that does not correspond to
reality), one level down.

**Contract (pick one and record it):** (a) accept it and rely on the PR run as the coverage point — already
documented in `docs/RUNBOOK.md` §5; (b) move the trigger to `pull_request` only, so the check always has a
diff to work from; or (c) drive the lint from a slightly different event so merges are covered too. Whichever
is chosen, the `docs/RUNBOOK.md` §5 claim must match what the workflow actually does.
**Exit gate:** a merged change to `main` whose lint coverage is provable (either by a run that names the files
it linted, or by a documented, deliberate decision that the PR run is the coverage point).
**Gate:** human — CI configuration is outside the agent autonomy boundary.

---

## Deferred / never (recorded, not schedulable)

- Multi-faith data integration — **abandoned; do not resurrect** (D2).
- Wallpaper / widget fate — **resolved**: experimental ambient surfaces (D3).
- Orphaned KJV/Dhammapada/Gita cleanup — **resolved by H1C** (D4).
- Runtime AI, journaling, streaks, recommendation feeds — doctrine non-goals.
- Font/CDN version-pinning pass — noted in `TECH_DEBT_AND_RISKS.md` #9; not scheduled.
- Reshaping `ios/widget/` into a real Xcode project — out of scope until an owner asks.
