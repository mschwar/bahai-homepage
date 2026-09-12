#!/usr/bin/env python3
"""Generate the contract-shaped Hidden Words collection from the canonical raw corpus.

Queue unit H2B-B. Contract: docs/architecture/COLLECTION_CONTRACT.md (accepted, D27).

The canonical raw corpus stays `data/quotes_hidden_words.json` (bare array of
{text, source, author}, byte-frozen). This script derives, from it and only from it:

  - `data/collections/hidden-words.json`  — the contract-shaped collection the web
    runtime loads (schema_version 1, provenance/rights header, per-item metadata).
  - `ios/widget/quotes_hidden_words.json` — the widget's bundled copy. The widget
    cannot share JS with the web core (no .xcodeproj either), so it keeps the LEGACY
    bare-array shape and is regenerated here from the same one source instead of being
    hand-maintained (TECH_DEBT_AND_RISKS.md #4).

Nothing here runs at page runtime or in CI; it is dev tooling, like
scripts/scrape_hidden_words.py.

Usage:
    python3 scripts/build_collections.py            # write both derived files
    python3 scripts/build_collections.py --check    # verify they are current; exit 1 if not
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_CORPUS = ROOT / "data" / "quotes_hidden_words.json"
COLLECTION_OUT = ROOT / "data" / "collections" / "hidden-words.json"
WIDGET_OUT = ROOT / "ios" / "widget" / "quotes_hidden_words.json"

COLLECTION_ID = "hidden-words"
SOURCE_URL = (
    "https://www.bahai.org/library/authoritative-texts/"
    "bahaullah/hidden-words/hidden-words.xhtml"
)
SOURCE_RE = re.compile(r"^The Hidden Words, From the (Arabic|Persian) #(\d+)$")

DESCRIPTOR = {
    "collection_id": COLLECTION_ID,
    "label": "The Hidden Words",
    "version": 1,
    "schema_version": 1,
    "description": (
        "The Hidden Words of Bahá'u'lláh — the product's default and original corpus. "
        "One numbered passage per Gregorian day-of-year over the <=75-word subset."
    ),
    "producer": "bahai-homepage (built-in)",
    "provenance_note": (
        "English text of The Hidden Words as published on the Bahá'í Reference Library "
        "(bahai.org authoritative-texts page), scraped 2026-09-10 by "
        "scripts/scrape_hidden_words.py. The scraper records the source page, not a "
        "print-edition/translation citation."
    ),
    "rights_note": (
        "Text copyright © Bahá'í International Community. Personal, non-commercial use "
        "with attribution; see https://www.bahai.org/legal."
    ),
    "default_eligibility": {"max_words": 75},
}


def item_id_for(source: str) -> str:
    m = SOURCE_RE.match(source.strip())
    if not m:
        raise SystemExit(f"ERROR: source string does not match the expected pattern: {source!r}")
    return f"{m.group(1).lower()}-{m.group(2)}"


def build_collection(raw: list[dict]) -> dict:
    items = []
    seen: set[str] = set()
    for idx, record in enumerate(raw):
        text = str(record.get("text", "")).strip()
        source = str(record.get("source", "")).strip()
        if not text:
            raise SystemExit(f"ERROR: item {idx} has no text")
        item_id = item_id_for(source)
        if item_id in seen:
            raise SystemExit(f"ERROR: duplicate derived item_id {item_id!r}")
        seen.add(item_id)
        author = str(record.get("author", "")).strip()
        item = {
            "item_id": item_id,
            "text": text,
            "source_ref": source,
            "source_url": SOURCE_URL,
            "item_type": "full-passage",
            "verification_state": "verified",
            "tags": [],
            "upstream_id": None,
        }
        if author:
            item["author"] = author
        items.append(item)

    collection = dict(DESCRIPTOR)
    collection["items"] = items
    return collection


def serialize(collection: dict) -> str:
    # Matches the repo's existing corpus formatting (2-space indent, non-ASCII kept).
    return json.dumps(collection, ensure_ascii=False, indent=2) + "\n"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify outputs are current; do not write")
    args = parser.parse_args()

    raw_bytes = RAW_CORPUS.read_bytes()
    try:
        raw = json.loads(raw_bytes)
    except json.JSONDecodeError as exc:
        print(f"ERROR: cannot parse {RAW_CORPUS.relative_to(ROOT)}: {exc}")
        return 1
    if not isinstance(raw, list):
        print(f"ERROR: {RAW_CORPUS.relative_to(ROOT)} is not a bare array; cannot generate from it.")
        return 1

    collection_bytes = serialize(build_collection(raw)).encode("utf-8")

    targets = [
        (COLLECTION_OUT, collection_bytes),
        # The widget bundle keeps the legacy bare-array shape: it is a byte-identical
        # copy of the canonical raw corpus, produced here so there is one regeneration
        # step for both copies (TECH_DEBT_AND_RISKS.md #4).
        (WIDGET_OUT, raw_bytes),
    ]

    drift = False
    for path, payload in targets:
        current = path.read_bytes() if path.exists() else None
        state = "current" if current == payload else ("missing" if current is None else "stale")
        if state != "current":
            drift = True
        print(f"{state:>7}  {path.relative_to(ROOT)}  sha256={sha256_bytes(payload)}")
        if not args.check and state != "current":
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
            print(f"         wrote {path.relative_to(ROOT)}")

    if args.check and drift:
        print("\nRESULT: FAIL — derived collection files are not current; run scripts/build_collections.py")
        return 1
    verb = "verified current" if args.check else "written"
    print(f"\nRESULT: PASS — {len(targets)} derived file(s) {verb}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
