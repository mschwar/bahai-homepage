# Product Doctrine Seed — `bahai-homepage`

The audit agent must verify this against code/history and refine it; it is not a substitute for archaeology.

## Core job

Make encountering the Creative Word an ordinary, quiet part of opening a device.

## North-star constraint

**Increase the breadth of what the homepage can quietly surface without increasing the cognitive weight of using it.**

## Likely stable invariants

- Sacred text is visually and conceptually primary.
- The default experience is one passage, not a feed or dashboard.
- Selection is deterministic enough that “today” is stable.
- Source/provenance is preserved.
- Badíʿ temporal context is meaningful; current repo uses location-aware/sunset-aware behavior when available.
- The site should degrade gracefully if location/network dependencies fail.
- A lightweight yesterday/history affordance is compatible with the thesis.
- Ambient surfaces such as wallpaper/widget may be legitimate extensions of the same encounter idea.

## Product expansion currently envisioned

Introduce an unobtrusive **collection/source selector** and generalize the hard-coded data path into an explicit collection contract:

`homepage → selected collection → eligible passages → deterministic daily selection`

The Hidden Words remains the default. A tiny deterministic fixture can test the abstraction. Do not block this architecture on Ruhi corpus work.

## Explicit non-goals / warnings

- Do not clone Natalia’s feature-rich devotional/study app into the homepage.
- Do not assume the old multi-faith roadmap is still desired.
- Do not add runtime AI interpretation, journaling, streaks, recommendation feeds, or generic engagement mechanics as part of the modernization.
- Do not rewrite working code merely to adopt a fashionable framework.
- Do not identify/publish a Ruhi Book 1 “memorization collection” until the collection contract exists and the curation/provenance/copyright task is separately executed.
