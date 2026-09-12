#!/usr/bin/env python3
"""Validate any H2B collection file against the accepted collection contract.

Queue unit H2B-B. Contract: docs/architecture/COLLECTION_CONTRACT.md (accepted, D27).
Dev-time only — the served page never calls this and takes no runtime dependency on it.

Checks (per the contract's "Validation" section):
  - required collection-level fields present and correctly typed;
  - `schema_version` is a version this validator recognizes;
  - `default_eligibility` is one of the recognized rule shapes;
  - every item has all required item-level fields;
  - `item_id` values are unique within the collection;
  - `item_type` and `verification_state` values are in their enums;
  - no exact-duplicate `text` within the collection (WARNING, not hard failure);
  - `source_url` is `null` or a well-formed URL string.

Usage:
    python3 scripts/validate_collection.py data/collections/hidden-words.json [more.json ...]
    python3 scripts/validate_collection.py data/collections/*.json
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

SCHEMA_VERSIONS = {1}
ELIGIBILITY_SHAPES = {"max_words"}
ITEM_TYPES = {"full-passage", "excerpt", "paraphrase", "oral-attribution", "unknown"}
VERIFICATION_STATES = {"unverified", "verified", "disputed"}
COLLECTION_ID_RE = re.compile(r"^[a-z0-9-]+$")
REQUIRED_COLLECTION = {
    "collection_id": str,
    "label": str,
    "version": int,
    "schema_version": int,
    "description": str,
    "producer": str,
    "provenance_note": str,
    "rights_note": str,
    "default_eligibility": dict,
    "items": list,
}
REQUIRED_ITEM = {
    "item_id": str,
    "text": str,
    "source_ref": str,
    "item_type": str,
    "verification_state": str,
}


def well_formed_url(value: object) -> bool:
    if value is None:
        return True
    if not isinstance(value, str) or not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def validate(path: Path) -> tuple[list[str], list[str], int]:
    errors: list[str] = []
    warnings: list[str] = []

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - deliberate: covers read + decode failures
        return [f"cannot read/parse JSON: {exc}"], warnings, 0

    if not isinstance(data, dict):
        return ["top level is not an object (contract shape is {..., items: [...]})"], warnings, 0

    for field, kind in REQUIRED_COLLECTION.items():
        if field not in data:
            errors.append(f"missing collection field: {field}")
        elif not isinstance(data[field], kind) or isinstance(data[field], bool):
            errors.append(f"collection field {field!r} must be {kind.__name__}")

    if isinstance(data.get("collection_id"), str) and not COLLECTION_ID_RE.match(data["collection_id"]):
        errors.append(f"collection_id {data['collection_id']!r} must match {COLLECTION_ID_RE.pattern}")

    schema_version = data.get("schema_version")
    if isinstance(schema_version, int) and schema_version not in SCHEMA_VERSIONS:
        errors.append(f"unrecognized schema_version {schema_version} (this validator knows {sorted(SCHEMA_VERSIONS)})")

    eligibility = data.get("default_eligibility")
    if isinstance(eligibility, dict):
        if set(eligibility) not in ({name} for name in ELIGIBILITY_SHAPES):
            errors.append(f"unrecognized default_eligibility rule shape: {sorted(eligibility)}")
        elif not isinstance(eligibility["max_words"], int) or isinstance(eligibility["max_words"], bool):
            errors.append("default_eligibility.max_words must be an integer")
    elif eligibility is not None:
        errors.append("default_eligibility must be an object")

    items = data.get("items")
    if not isinstance(items, list):
        return errors, warnings, 0

    seen_ids: dict[str, int] = {}
    seen_text: dict[str, list[int]] = {}
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            errors.append(f"item {idx} is not an object")
            continue
        for field, kind in REQUIRED_ITEM.items():
            if field not in item:
                errors.append(f"item {idx} missing required field: {field}")
            elif not isinstance(item[field], kind) or isinstance(item[field], bool):
                errors.append(f"item {idx} field {field!r} must be {kind.__name__}")
        if "source_url" not in item:
            errors.append(f"item {idx} missing required field: source_url (may be null)")
        elif not well_formed_url(item["source_url"]):
            errors.append(f"item {idx} has a malformed source_url: {item['source_url']!r}")
        if isinstance(item.get("tags"), list):
            if not all(isinstance(t, str) for t in item["tags"]):
                errors.append(f"item {idx} tags must all be strings")
        elif "tags" in item:
            errors.append(f"item {idx} tags must be an array when present")

        item_id = item.get("item_id")
        if isinstance(item_id, str):
            if item_id in seen_ids:
                errors.append(f"duplicate item_id {item_id!r} (items {seen_ids[item_id]} and {idx})")
            else:
                seen_ids[item_id] = idx
        if isinstance(item.get("item_type"), str) and item["item_type"] not in ITEM_TYPES:
            errors.append(f"item {idx} item_type {item['item_type']!r} not in {sorted(ITEM_TYPES)}")
        if isinstance(item.get("verification_state"), str) and item["verification_state"] not in VERIFICATION_STATES:
            errors.append(
                f"item {idx} verification_state {item['verification_state']!r} not in {sorted(VERIFICATION_STATES)}"
            )
        text = item.get("text")
        if isinstance(text, str) and text.strip():
            seen_text.setdefault(" ".join(text.split()), []).append(idx)
        elif isinstance(text, str):
            errors.append(f"item {idx} has empty text")

    for text, idxs in seen_text.items():
        if len(idxs) > 1:
            snippet = text[:60] + ("..." if len(text) > 60 else "")
            warnings.append(f"duplicate text at items {idxs}: {snippet}")

    return errors, warnings, len(items)


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print("ERROR: no collection file given. Usage: scripts/validate_collection.py <file.json> [...]")
        return 2

    failed = False
    for arg in args:
        path = Path(arg)
        errors, warnings, count = validate(path)
        print(f"collection: {path}")
        print(f"  items: {count}")
        print(f"  errors: {len(errors)}")
        print(f"  warnings: {len(warnings)}")
        for err in errors:
            print(f"  ERROR: {err}")
        for warn in warnings:
            print(f"  WARN: {warn}")
        if errors:
            failed = True

    print(f"\nRESULT: {'FAIL' if failed else 'PASS'}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
