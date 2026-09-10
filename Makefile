PYTHON ?= python3
NODE  ?= node

.PHONY: validate parity parity-live

validate:
	$(PYTHON) scripts/validate_quotes.py

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
