PYTHON ?= python3
NODE  ?= node

.PHONY: validate parity

validate:
	$(PYTHON) scripts/validate_quotes.py

# Behavioral parity suite (queue H2A, first half). DEV-ONLY: needs the global
# playwright + its bundled Chromium (npx playwright install chromium). It drives the
# real page in headless Chromium and does not modify any frozen file.
parity:
	$(NODE) tests/parity.mjs
