import json
import sys
from pathlib import Path


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/quotes_hidden_words.json")
    if not path.exists():
        print(f"ERROR: Missing quotes file: {path}")
        return 1

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"ERROR: Failed to parse JSON: {exc}")
        return 1

    if not isinstance(data, list):
        print("ERROR: Quotes JSON should be a list.")
        return 1

    errors = []
    warnings = []
    seen = {}

    for idx, item in enumerate(data):
        if not isinstance(item, dict):
            errors.append(f"Item {idx} is not an object.")
            continue

        text = str(item.get("text", "")).strip()
        source = str(item.get("source", "")).strip()
        author = str(item.get("author", "")).strip()

        if not text:
            errors.append(f"Item {idx} missing text.")
        if not source:
            errors.append(f"Item {idx} missing source.")
        if not author:
            warnings.append(f"Item {idx} missing author.")

        if text:
            normalized = " ".join(text.split())
            seen.setdefault(normalized, []).append(idx)

    duplicates = {text: idxs for text, idxs in seen.items() if len(idxs) > 1}

    print(f"Quotes checked: {len(data)}")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")
    print(f"Duplicate texts: {len(duplicates)}")

    if errors:
        for err in errors[:10]:
            print(f"ERROR: {err}")
        if len(errors) > 10:
            print(f"ERROR: ...and {len(errors) - 10} more.")
        return 1

    if duplicates:
        for text, idxs in list(duplicates.items())[:5]:
            snippet = text[:80] + ("..." if len(text) > 80 else "")
            print(f"WARNING: Duplicate text at items {idxs}: {snippet}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
