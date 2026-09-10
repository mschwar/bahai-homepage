# Phase 0 — Repo Archaeology / State-of-System Audit

## Purpose

Before installing a 2026 agent-first repo contract or changing application architecture, establish what exists, why it exists, what actually runs, what is historical residue, and what product intent survived across history.

## Inspect

- root files and all directories
- README, roadmap, audit notes, update/security/contributing docs
- current HTML/CSS/JS
- data files and schemas
- scrapers/validators
- Badíʿ integration and external dependencies
- wallpaper page/assets/logic
- iOS widget files
- GitHub Actions/CI
- deployment/GitHub Pages assumptions
- meaningful Git history, branches, and PRs where available
- old experiments and planned-but-never-integrated directions
- file/data sizes or other operational liabilities that matter
- current live site behavior if accessible

## Required classifications

For every meaningful component: **what it is; why it was created; whether anything still depends on it; whether it is current/production, support tooling, experimental, stale/abandoned, or unknown; and what evidence supports the classification.**

## Required outputs

Create under `docs/audit/2026-09-10/`:

- `EXECUTIVE_MODEL.md`
- `REPO_MAP.md`
- `HISTORY_RECONSTRUCTION.md`
- `FEATURE_AND_SUBSYSTEM_STATUS.md`
- `DATA_AND_PROVENANCE_MAP.md`
- `DEPLOYMENT_AND_RUNTIME_MAP.md`
- `TECH_DEBT_AND_RISKS.md`
- `PRODUCT_DOCTRINE_RECONSTRUCTION.md`
- `AGENT_FIRST_GAP_ANALYSIS.md`
- `RECOMMENDED_RETROFIT_SEQUENCE.md`
- `QUEUE_PROPOSAL.md`
- `VALIDATION_EVIDENCE.md`

Also create/update `HANDOFF.md` at the repo root for the human review gate.

## Forbidden in Phase 0

No production/source-code edits. No CSS changes. No dataset changes. No dependencies. No package-manager migration. No file moves/deletes/renames. No CI changes. No deployment changes. No selector/collection implementation. No Ruhi extraction/curation.

The seed/bootstrap documentation itself may remain as historical input. Phase 0 output must be additive audit documentation only.
