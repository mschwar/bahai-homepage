PYTHON ?= python3
NODE  ?= node

.PHONY: validate validate-collections collections check-collections parity parity-live wallpaper-check

# Legacy corpus validator (shipped contract: 153 checked / 0 errors / 0 warnings /
# 0 duplicates). Unchanged by H2B-B — the raw corpus is still the canonical scrape
# output. Collection-file validation is the target below.
validate:
	$(PYTHON) scripts/validate_quotes.py

# Contract validation for the collection files the page actually loads (H2B-B).
validate-collections:
	$(PYTHON) scripts/validate_collection.py data/collections/hidden-words.json data/collections/garden-homepage-preview.json

# Regenerate the derived collection files from the canonical raw corpus (dev-only).
# `check-collections` verifies they are current without writing (CI-friendly).
collections:
	$(PYTHON) scripts/build_collections.py

check-collections:
	$(PYTHON) scripts/build_collections.py --check

# Behavioral parity suite (queue H2A, first half). DEV-ONLY: needs the global
# playwright + its bundled Chromium (npx playwright install chromium). It drives the
# real page in headless Chromium and does not modify any frozen file.
parity:
	$(NODE) tests/parity.mjs

# Live-mode behavioral check against the DEPLOYED origin (queue candidate C9).
# DEV-ONLY, same global playwright as `parity` — but the OPPOSITE of it on determinism:
# it does NOT block the network, so it observes the real HTTPS path, the real vendor
# Badíʿ library, the real CDN and the browser's real security rules.
#
# NETWORK-DEPENDENT AND EXPECTED TO BE FLAKY-ON-OUTAGE: a Pages rebuild, a CDN hiccup or
# this host being offline will make it red even though the product is fine. That is exactly
# why it is a SEPARATE target and NOT part of `parity`: a live failure must never make the
# hermetic behavioral proof of record intermittently red. It also reports (never asserts)
# whether the Badíʿ element resolved or fell back, because that outcome depends on the geolocation
# permission and is therefore not assertable (C9 closed; a declined visitor gets the default sunset).
# Run it after any deploy — see docs/RUNBOOK.md §3.1.
parity-live:
	$(NODE) tests/parity-live.mjs

# Experimental e-ink lock-screen PNG (D25). DEV-ONLY: same global playwright
# as `parity`. Unlike `parity` it does not abort Google Fonts or unpkg, because
# the generated image must paint Cormorant Garamond. Off the homepage parity path.
wallpaper-check:
	$(NODE) tests/wallpaper-check.mjs
