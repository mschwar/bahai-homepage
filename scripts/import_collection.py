#!/usr/bin/env python3
"""Import a producer's collection payload into data/collections/ — verified, not hand-edited.

Queue unit H2B-B. Contract: docs/architecture/COLLECTION_CONTRACT.md (accepted, D27).

The producer (e.g. Garden-of-Wisdom) owns its export; this repo consumes it. The
import is a byte-identical copy gated on a recorded SHA-256, so "verified quote text"
is never retyped or nudged inside the homepage repo. The output filename is derived
from the payload's own `collection_id`, so an import can never land under a name the
collection does not claim.

Usage:
    python3 scripts/import_collection.py --source <path/to/collection.json> \\
        --expected-sha256 <hex>

The provenance record for an import belongs in docs/architecture/COLLECTION_IMPORTS.md
(repo, path, commit, hash, date) — this script prints the values to paste there.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "collections"
COLLECTION_ID_RE = re.compile(r"^[a-z0-9-]+$")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path, help="producer payload to import")
    parser.add_argument("--expected-sha256", required=True, help="recorded SHA-256 of the payload")
    args = parser.parse_args()

    if not args.source.is_file():
        print(f"ERROR: source payload not found: {args.source}")
        return 1

    payload = args.source.read_bytes()
    actual = sha256_bytes(payload)
    if actual != args.expected_sha256.strip().lower():
        print("ERROR: SHA-256 mismatch — refusing to import.")
        print(f"  expected {args.expected_sha256.strip().lower()}")
        print(f"  actual   {actual}")
        return 1

    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        print(f"ERROR: payload is not valid JSON: {exc}")
        return 1
    if not isinstance(data, dict):
        print("ERROR: payload is not a collection object.")
        return 1

    collection_id = data.get("collection_id")
    if not isinstance(collection_id, str) or not COLLECTION_ID_RE.match(collection_id):
        print(f"ERROR: payload has no usable collection_id: {collection_id!r}")
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{collection_id}.json"
    out.write_bytes(payload)

    items = data.get("items")
    print(f"imported: {out.relative_to(ROOT)}")
    print(f"collection_id: {collection_id}")
    print(f"label: {data.get('label')}")
    print(f"version: {data.get('version')}  schema_version: {data.get('schema_version')}")
    print(f"items: {len(items) if isinstance(items, list) else 'MISSING'}")
    print(f"sha256: {actual}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
