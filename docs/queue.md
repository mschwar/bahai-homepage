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

## H2A — live-site refactor / parity · **done** · gate: agent (H1 accepted 2026-09-10 → gate satisfied; refactor half owner-authorized 2026-09-10)

**Authorization (2026-09-10).** H2A has two halves with different authority. The parity suite (first half)
was covered by H1's gate; the refactor half changes frozen files and, per `AGENTS.md`, needed its own
"owner decision and parity evidence". The owner granted that authorization in-session on 2026-09-10, and the
decision is recorded as **D11** — which supersedes D8's byte-identical freeze for exactly the files H2A
touched. An executor reading this later must not infer authority from the satisfied gate alone: D11 is the
authority, and it is scoped to this refactor.

Contract: **write behavioral parity tests first, change implementation second.** The parity set must cover
deterministic day-of-year selection, today/yesterday match, cache-by-date **including the Badíʿ-day-cache
wrinkle** (`TECH_DEBT_AND_RISKS.md` #7 — today's quote is written under the Badíʿ-day key), theme
persistence, the Badíʿ fallback path, clipboard copy, and reduced-motion.

**First half — parity suite written and green (2026-09-10).** `tests/parity.mjs` drives the *live* page
(`index.html` + `js/script.js` + `js/badi-init.js`) in headless Chromium via Playwright 1.59.1 (global
install, bundled Chromium; no new manifest — the file self-hosts a static server so `fetch()` works under a
real origin). Run: `make parity` (alias `node tests/parity.mjs`). Result: **18 passed, 0 failed**. Raw output
recorded verbatim in `docs/audit/2026-09-10/H2A_PARITY_SUITE_RUN.txt`. Coverage:

- A. deterministic `dayOfYear % len` selection over the ≤75-word subset (oracle reimplemented in the test);
- B. today/yesterday relationship + the "Yesterday" reveal (aria-expanded + hidden toggle);
- C. cache-by-date (Gregorian `dailyVerse:YYYY-MM-DD`): offline cache-boot on fetch failure + write-through +
  `lastKey`;
- D. **the #7 wrinkle, pinned**: `saveCachedQuote(pendingBadiKey, todayObj)` writes today's verse under the
  Badíʿ-day key `dailyVerse:badi:<y>-<m>-<d>` (prefix is applied by `saveCachedQuote`), and `lastKey` then
  points at the Badíʿ key — confirming the latent correctness smell is present in the current implementation;
- E. theme persistence (saved `theme` applied on load, default light-mode, toggle flips + persists across
  reload). Parity note: `index.html` hardcodes `<body class="light-mode">`, so after reload to a saved dark
  theme the body carries *both* classes (dark-mode wins via specificity);
- F. Badíʿ graceful degradation (unreachable lib → "unavailable" + "Enable location" guidance; happy path
  renders "Day 4, Núr (light) / 182 BE");
- G. clipboard copy (primary `navigator.clipboard` payload `<text>\n— <author>`, execCommand fallback,
  all-fail → "Copy failed."). Parity note: `.quote-actions{display:none}` hides the copy row, so the
  reachable copy affordance is a click on the quote text itself (wired to the same handler);
- H. reduced-motion scroll (`behavior: auto` under `prefers-reduced-motion: reduce`, `smooth` otherwise).

**First half carried no frozen-file change.** `tests/parity.mjs`, the `parity` Makefile target, and the run
log were the only additions.

**Second half — the refactor · executed 2026-09-10** (branch `refactor/h2a-shared-quote-core`)

Executed as the packet ordered, behavior-preserving, no framework/bundler/build step:

- **Selection/collection logic extracted** into `js/quote-core.js` (new) — the single JavaScript source of
  truth for `MAX_QUOTE_WORDS`, `QUOTES_PATH`, the word-count filter, day-of-year selection, the date and
  cache-key helpers, the corpus fetch, and a `createQuoteCache(prefix[, lastKeyKey])` factory.
  `js/script.js` and `js/wallpaper.js` consume it; each keeps its own cache namespace (`dailyVerse:` /
  `dailyWallpaper:`) and only `script.js` records a `lastKey`, so both caches behave exactly as before.
- **Debt `#11` closed** — `js/badi-init.js` builds the two-line Badíʿ label from text nodes + `<br>` instead
  of `el.innerHTML`. Same rendering, no HTML parsing of the value.
- **Run docs normalized** — `docs/RUNBOOK.md` §§1, 3, 6, 8, including a run-record format the new log follows.

**Not done, deliberately:** `ios/widget/QuoteStore.swift` is unchanged. The packet forbids unifying the
Swift reimplementation in H2A and defers it to `H2B`; a JS module cannot be shared with Swift in any case.
Debt `#1`'s "three places" is therefore now **two** (`js/quote-core.js`, `ios/widget/QuoteStore.swift`),
and `docs/RUNBOOK.md` §8 says so. Closing the remaining one is `H2B`'s job.

**No framework adoption**, no new runtime dependency, no new manifest. The wallpaper surface is on the
refactor's blast radius but off the parity path, so it was verified separately (headless: shared core
loaded, canvas painted, no console/page errors).

**Exit gate — closed, and landed.** Parity suite green *before* and *after*: `18 passed, 0 failed` both
times, the two raw outputs byte-identical. The refactor is proven on `refactor/h2a-shared-quote-core` and
merged to `main` via PR #9. The one thing that briefly held the landing — PR #9's lint going red on four
never-before-exercised CI categories — was resolved the same day as `C8`/`D12`, without touching a product
file.
**Evidence:** `docs/audit/2026-09-10/H2A_PARITY_SUITE_RUN.txt` (first-half run, 18/0) and
`docs/audit/2026-09-10/H2A_REFACTOR_PARITY_RUN.txt` (both halves of this unit — the before/after runs,
the frozen-file sha256 sets, and the separate wallpaper-surface check). The frozen-file hashes are recorded
in that second file and in `docs/DECISIONS.md` **D11**.

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
names a contract and a gate. `C1` is done; `C2` and `C3` are not scheduled and not authorized. `C4` and `C5`
were added on 2026-09-10 from the review of the `actions/checkout` bump (D10, third addendum); none of
`C2`–`C5` is scheduled or authorized. `C3` closed the same day on the retest its own contract asked for, using
no configuration change; `C2`, `C4` and `C5` remain open. `C6` and `C7` were added on 2026-09-10 from the
parity-suite review that closed H2A's first half; neither is scheduled or authorized. `C8` was added on
2026-09-10 from the first CI run whose changed set contained a product file (PR #9, H2A's refactor) and was
closed the same day when the owner authorized its option (a) — the four categories that had never run are now
off, recorded as `docs/DECISIONS.md` D12. `C9` was added on 2026-09-10 during the post-deploy live verification
of H2A: a genuine production defect (the Badíʿ date never resolves on the live site) that the parity suite
cannot see by design, and it is not schedulable without a decision about the vendor library.

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

### C3 — CI linted nothing on two merge-commit pushes (v4) · **done** · gate: human (no configuration change was needed)

**Outcome (2026-09-10): closed as a v4 artifact, on the retest the contract asked for.** No CI configuration was
touched, so nothing crossed the autonomy boundary this unit's gate exists to protect — the retest is an
observation and the closure is documentation.

**Evidence (2026-09-10), all nine runs examined:**

| Run | Head | How it reached the runner | Super Linter | Result |
|---|---|---|---|---|
| `34524824941` | `ebe5b78` | plain push | v4 | linted its files, success |
| `34524938962` | `20bfe1a` | plain push | v4 | linted its files, **failure** (the C1 bug) |
| `34525756201` | `d4e1d30` | local `git merge --no-ff`, pushed | v4 | **`No files were found … to lint!`**, success |
| `34526018773` | `a8bf7e5` | local `git merge --no-ff`, pushed | v4 | **`No files were found … to lint!`**, success |
| `34527479040` | `f67f470` | pull request | v8 | linted its files, success |
| `34528462515` | `acf706d` | pull request | v8 | linted its 8 files (named in the log), success |
| `34528829696` | `a5c046b` | merge commit created by GitHub's PR merge | v8 | linted its 8 files (named in the log), success |
| `34531219266` | `d094517` | merge commit created by GitHub's PR merge | v8 | linted its file (named in the log), success |
| `34531596264` | `1ea76c5` | **local `git merge --no-ff`, pushed** | v8 | linted its 2 files, named in the log, success |

**The answer the unit was waiting for.** Run `34531596264` is the local merge path — the one that produced both
empty-set runs under v4. It gathered a non-empty file list and named what it read:

```text
No merge conflicts found in /github/workspace/docs/DECISIONS.md /github/workspace/docs/queue.md
```

So the empty set was a **v4** behaviour, as the correction above suspected, and it does not reproduce on v8 on
any path this repository uses. `docs/RUNBOOK.md` §5 no longer carries the unresolved-caveat sentence.

**Why it was worth resolving rather than documenting again:** the failure mode is silent — the job reports
`success` having checked nothing — which is how C1 hid for three commits. "Green on `main`" only means something
if the run actually read the files, and on this repository's most common landing path that had been assumed
rather than observed.

### C4 — Dependabot has no stated policy for major-version bumps · gate: human

**Evidence.** `.github/dependabot.yml` declares one ecosystem (`github-actions`), a monthly schedule, a
seven-day cooldown and `open-pull-requests-limit: 3`. It says nothing about which update types this repository
wants. PR #5 raised `actions/checkout` from v6 to v7.0.1 — a semver-major — and looked exactly like a patch
bump: one line, every check green, nothing in the title or the checks marking it as a decision. It was merged
only after owner authorization (D10, third addendum), which is correct, but the entire gate rested on a human
reading the diff closely enough to notice the word "major".

**Why it is a defect, not cosmetics.** The care in this repository is concentrated in the SHA pin. The update
path added to keep that pin from rotting (D10 §5) is unsupervised in precisely the case that can break a
workflow, and its output is indistinguishable from routine maintenance.

**Contract:** pick exactly one and record it in `docs/DECISIONS.md` —
(a) `ignore` semver-major updates for actions in `.github/dependabot.yml`, so majors are performed deliberately;
(b) keep majors in the PR stream and state in `docs/RUNBOOK.md` §5 that a major Dependabot bump is owner-gated,
so whoever reads the PR can see the rule; or
(c) allow auto-merge for patch and minor updates only.
**Exit gate:** the chosen policy is recorded, and the next Dependabot PR is handled consistently with it.
**Gate:** human — CI configuration.

### C5 — Three super-linter settings announce checks that do not run · gate: human

**Evidence (2026-09-10).** Identical warnings in v8's first run (`34527479040`, 20:38–20:39Z) and in the
post-merge run for the checkout bump (`34531219266`):

```text
[WARN] Git commit message validation with commitlint is enabled, but no commitlint configuration file is
       available. Disabling commitlint.
[WARN] ENABLE_GITHUB_ACTIONS_STEP_SUMMARY is set to true, ENABLE_GITHUB_PULL_REQUEST_SUMMARY_COMMENT is set
       to true, but SAVE_SUPER_LINTER_SUMMARY is set to false.
[WARN] Black and Ruff are both enabled, and might conflict with each other.
```

**Why it is a defect.** This is `C1`'s class one notch quieter: a check that presents itself as active while
doing nothing, and a set of defaults that contradict each other. Commit messages are load-bearing evidence in
this repository, so "commitlint is on" is a claim a reader may rely on. The summary pair is a plain
misconfiguration — two flags enable a summary that a third prevents from existing.

**Contract:** for each of the three, either configure it to run for real or turn it off explicitly in
`.github/workflows/super-linter.yml`, with the reason written beside it in the style of the existing
`VALIDATE_*: false` block. Disabling a check purely to silence a warning is not an acceptable outcome.
**Exit gate:** a run on `main` with no warning of this class, and each of the three choices recorded in
`docs/DECISIONS.md`.
**Gate:** human — CI configuration.

### C6 — The designed copy affordance is invisible: `.quote-actions{display:none}` hides the copy row · gate: human

**Evidence (2026-09-10, parity suite section G).** The live page has a full clipboard handler — primary
`navigator.clipboard`, `execCommand` fallback, a `#copy-status` message — but the CSS rule
`.quote-actions{display:none}` hides the `#copy-button` row. The parity suite's computed-style check confirms
`display:none` on the row and a zero-size button. The only reachable copy affordance is clicking the quote
text itself (`#quote-text` is wired to the same handler), which is not discoverable.

**Why it is a defect.** The copy interaction was clearly designed (button, status, fallbacks) but ships hidden,
so the user-facing path to a core feature ("click-to-copy" is in the product doctrine) is an invisible
click-target. Hidden dead UI invites the "remove the dead code" reading, which would silently drop a working
behavior the parity suite now pins.

**Contract:** make the copy affordance visible and discoverable — either restore the `.quote-actions` row, or
add an explicit visible control wired to the same copy handler — with before/after screenshot evidence and the
parity suite re-run (section G must stay green).
**Exit gate:** a visible, discoverable copy control plus `make parity` green.
**Gate:** human — modifies `css/*` and/or `index.html` (frozen files).

### C7 — Saved dark theme leaves the body carrying *both* theme classes · gate: human

**Evidence (2026-09-10, parity suite section E).** `index.html` hardcodes `<body class="light-mode">`, while
`js/script.js` *appends* the saved theme class on load. After a reload to a saved dark theme the body carries
`light-mode dark-mode` together. The parity suite confirms the pair: `body ends with both
light-mode+dark-mode after reload to a saved dark theme`. `dark-mode` wins only by CSS specificity, so the
effective theme is currently correct, but the class list is not a single source of truth.

**Why it is a defect.** Correctness depends on specificity ordering between two contradictory classes rather
than the body carrying exactly one theme. Any future styling change that alters specificity, or any component
that styles off `light-mode`, will be applied on top of a dark theme — a latent wrong-theme class of bug.

**Contract:** reconcile so the body carries exactly one of `light-mode`/`dark-mode` after a reload to a saved
theme (e.g. the script replaces the class instead of appending, or the hardcoded default is removed at init),
with the parity suite re-run (section E must stay green).
**Exit gate:** `make parity` green and the body carries exactly one theme class after reload to a saved dark theme.
**Gate:** human — modifies `index.html` and/or `js/script.js` (frozen files).

### C8 — The first change to touch the product files turned CI red on four categories that only ever target those files · **done** · gate: human (authorized 2026-09-10)

**Outcome (executed 2026-09-10, contract option (a)):** the four categories are off in
`.github/workflows/super-linter.yml` — `VALIDATE_HTML`, `VALIDATE_HTML_PRETTIER`, `VALIDATE_JAVASCRIPT_ES`,
`VALIDATE_JAVASCRIPT_PRETTIER` — each with its reason recorded beside it in the D10 block's style, and the
decision is `docs/DECISIONS.md` **D12**. The trade is stated there plainly: CI now runs no static analysis over
the served site at all, and `make parity` (18 behavioral assertions) plus `make validate` are the product's
checks of record. Turning the categories off followed the D10 precedent rather than reformatting frozen product
files to satisfy a default config this repository never adopted.
**Exit gate — closed.** With the categories muted, the run whose changed set contains every product file is
green: PR #9 run [`34538252976`](https://github.com/mschwar/bahai-homepage/actions/runs/34538252976),
`run-lint` **pass**, all eleven remaining categories `pass`. The log was read rather than the badge — the four
flags arrive as `false`, and the job's file set names `index.html`, `wallpaper.html` and all four `js/*.js`, so
it is not the empty-set green of `C3`. Recorded in `docs/DECISIONS.md` D12's addendum.
**Evidence:** the red run that exposed it (`34536775907`, PR #9) is in the diagnosis below; the closing run is
`34538252976`.

**The original diagnosis (kept as the executed contract).** Evidence (2026-09-10, PR #9, run
[`34536775907`](https://github.com/mschwar/bahai-homepage/actions/runs/34536775907)) — the first run in this
repository's history whose changed set contains `index.html` or `js/*`. `run-lint` failed on four categories,
and **not one finding is caused by the H2A refactor**:

- `HTML` (htmlhint 1.9.2) — 2 errors in `index.html`, both pre-existing: L69 `id="badiDate"` and L77 `id="gregorianDatePanel"` violate `id-class-value` ("must be in lowercase and split by a dash" — these are camelCase ids).
- `HTML_PRETTIER` — `index.html` and `wallpaper.html` are not prettier-formatted.
- `JAVASCRIPT_ES` (eslint 9.39.4 on its default config) — `js/badi-init.js`: `initializeBadiCalendar`
  reported unused (it is called from `js/script.js`), `BadiDateToday` and `BadiDateLocationChoice`
  reported undefined (the former is the external library, the latter a global the library sets), plus an
  unused catch binding.
- `JAVASCRIPT_PRETTIER` — all four `js/*.js` files are not prettier-formatted.

**Why it is a defect, not cosmetics.** This is `C1`'s class exactly. `docs/DECISIONS.md` D10 turned off the
categories whose only targets here are frozen files (`BIOME_FORMAT`, `BIOME_LINT`, `MARKDOWN_PRETTIER`,
`JSCPD`) — but the four above were left on, because until now no change had ever included a product file, so
they were **never exercised** and their "pass" on every previous run was vacuous. The first legitimate
product-file change therefore lands as a red check on `main`, with sixteen green categories beside four red
ones whose findings predate the change and would be dismissed by any reader as noise. That is precisely the
state C1 existed to remove.

**Why it is not fixable inside H2A.** The two available fixes are both outside the refactor's authorization:
silencing the categories is a CI configuration change, which `AGENTS.md` puts behind owner sign-off (and
forbids "as a side effect"); making the files satisfy them means either a prettier reformat of all four
`js/*` files plus both HTML files, or adding an eslint config, either of which is the "tidying of working
code" `AGENTS.md` forbids as a side effect. Neither is H2A's to take.

**Contract:** pick exactly one and record it in `docs/DECISIONS.md` —
(a) turn the four categories off for this repository, following the D10 precedent and recording why per category (HTML/ESLint have no config here; prettier's targets are frozen product files) — the cheapest fix, and consistent with what D10 already did to four sibling categories;
(b) make the product files satisfy them — a one-off reformat pass over `index.html`, `wallpaper.html` and `js/*` plus an `id-class-value` fix, accepted knowingly as a product-file change because the frozen hashes would move again; or
(c) keep the four categories on, accept that every product-file PR is red, and record that in `docs/RUNBOOK.md` §5 as the intended state.
**Exit gate:** a run whose changed set includes a product file is green, with each of the four categories either passing or explicitly off for a recorded reason.
**Gate:** human — CI configuration; option (b) additionally modifies frozen files.

### C9 — The Badíʿ date never resolves on the live site: the vendor library's geolocation call is blocked as mixed content · gate: human

**Evidence (2026-09-10, live post-deploy verification of H2A;
`docs/audit/2026-09-10/H2A_REFACTOR_PARITY_RUN.txt`, "POST-DEPLOY LIVE VERIFICATION").** Against
`https://mschwar.github.io/bahai-homepage/` in headless Chromium, `#badiDate` settles to `Badíʿ date
unavailable.` with the guidance "Enable location for sunset-accurate Badíʿ date. Showing Gregorian date
only." — the documented fallback — rather than the two-line date label. The cause appears in both the console
and the failed-request log, and it is the only failure of either kind:

```text
Mixed Content: The page at 'https://mschwar.github.io/bahai-homepage/' was loaded over HTTPS,
but requested an insecure XMLHttpRequest endpoint 'http://ipinfo.io/geo?json'.
This request has been blocked; the content must be served over HTTPS.
```

The request is issued by the **third-party** library at `wondrous-badi.today`, not by this repository's code:
no `pageerror` and no failed request originates from `js/quote-core.js`, `js/script.js`, `js/badi-init.js` or
any asset served here.

**Why it is a defect.** The Badíʿ date is half of the product doctrine (D1: "one Hidden Words passage per
Gregorian day-of-year, Badíʿ date, …"). In production that half renders only its fallback, so a headline
feature is dark on the live HTTPS site — and nothing recorded it, because `tests/parity.mjs` blocks the vendor
library for determinism (section F) and therefore cannot observe the live failure. The suite's
`F. renders the Badici date when the lib resolves` proves the *page's* handling of a resolved date; it does
not and cannot prove the vendor resolves one.

**Why it is out of H2A's scope.** H2A is a behavior-preserving refactor and this behavior is unchanged by it —
the failing request is the vendor's, and the pre-refactor code path is identical. Every possible fix sits
outside that authorization: changing how the page loads or falls back modifies `js/badi-init.js` /
`index.html` (frozen files, and a product change), while "the vendor library is broken" may admit no in-repo
fix at all.

**Contract:** first establish the effective cause — is this the vendor's own `http`/`https` scheme choice (fixable only upstream), or does the library accept a configuration that avoids the geolocation call entirely (a `locationMethod` the page already passes, or a documented offline mode)? Then pick exactly one and record it in `docs/DECISIONS.md` —
(a) if the library offers a scheme-safe or location-free configuration, adopt it in `js/badi-init.js`, keeping the existing fallback intact;
(b) if it does not, stop relying on the vendor for a date the page could compute — the Badíʿ calendar is arithmetic — and record that as a deliberate replacement, not a patch;
(c) keep the vendor and the fallback as-is, accepting that the Badíʿ date is Gregorian-only in production, and record that in `README.md`'s status prose so the docs stop implying a feature that does not render.
**Exit gate:** the live HTTPS page either shows a resolved Badíʿ date, or the docs record that it will not and why — with the live check re-run and its output recorded.
**Gate:** human — options (a) and (b) modify frozen files (`js/badi-init.js`, `index.html`) and (b) is a product change; option (c) touches product doctrine.

---

## Deferred / never (recorded, not schedulable)

- Multi-faith data integration — **abandoned; do not resurrect** (D2).
- Wallpaper / widget fate — **resolved**: experimental ambient surfaces (D3).
- Orphaned KJV/Dhammapada/Gita cleanup — **resolved by H1C** (D4).
- Runtime AI, journaling, streaks, recommendation feeds — doctrine non-goals.
- Font/CDN version-pinning pass — noted in `TECH_DEBT_AND_RISKS.md` #9; not scheduled.
- Reshaping `ios/widget/` into a real Xcode project — out of scope until an owner asks.
