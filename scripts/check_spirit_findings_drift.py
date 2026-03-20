#!/usr/bin/env python3
"""
Validate Spirit findings.json and optionally freeze verdict order for CI.

Run from repo root after `python spirit_of_the_law_analysis.py`.
Use --strict-verdicts only when the reference season (s5) pipeline output is stable.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

EXPECTED_VERDICTS_STRICT: tuple[str, ...] = (
    "CONFIRMED",
    "CONFIRMED",
    "BUSTED",
    "BUSTED",
    "CONFIRMED",
    "BUSTED",
    "CONFIRMED",
    "CONFIRMED",
    "BUSTED",
    "INCONCLUSIVE",
)


def resolve_default_path(repo: Path) -> Path | None:
    for rel in (
        Path("data/seasons/s5/spirit/findings.json"),
        Path("data/spirit/findings.json"),
    ):
        candidate = repo / rel
        if candidate.is_file():
            return candidate
    return None


def load_payload(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as fh:
        raw: Any = json.load(fh)
    if not isinstance(raw, dict):
        raise ValueError("root must be an object")
    return raw


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check Spirit findings.json structure and verdict summary.",
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=None,
        help="Path to findings.json (default: seasons/s5/spirit or data/spirit)",
    )
    parser.add_argument(
        "--strict-verdicts",
        action="store_true",
        help="Exit 2 if verdict order differs from frozen s5 reference.",
    )
    args = parser.parse_args()
    repo = Path.cwd()
    path = Path(args.path).resolve() if args.path else None
    if path is None:
        path = resolve_default_path(repo)
    if path is None:
        print("error: findings.json not found (try running spirit_of_the_law_analysis.py)", file=sys.stderr)
        return 1
    if not path.is_file():
        print(f"error: not a file: {path}", file=sys.stderr)
        return 1

    try:
        data = load_payload(path)
    except (OSError, UnicodeDecodeError) as e:
        print(f"error: read failed: {e}", file=sys.stderr)
        return 1
    except (json.JSONDecodeError, ValueError) as e:
        print(f"error: invalid JSON or shape: {e}", file=sys.stderr)
        return 1

    inv = data.get("investigations")
    if not isinstance(inv, list) or len(inv) != 10:
        print("error: expected investigations array of length 10", file=sys.stderr)
        return 1

    required = (
        "id",
        "slug",
        "title",
        "verdict",
        "effect_size",
        "statistical_weight",
    )
    for i, row in enumerate(inv, 1):
        if not isinstance(row, dict):
            print(f"error: investigation {i} is not an object", file=sys.stderr)
            return 1
        for key in required:
            if key not in row:
                print(f"error: investigation {i} missing {key!r}", file=sys.stderr)
                return 1

    sorted_inv = sorted(inv, key=lambda r: int(r["id"]))
    verdicts = tuple(str(r["verdict"]) for r in sorted_inv)

    print(f"ok: {path}")
    print(f"season_id: {data.get('season_id', '?')}")
    print(f"generated_at: {data.get('generated_at', '?')}")
    print("verdicts-by-id:", " ".join(f"{i + 1}:{verdicts[i]}" for i in range(10)))

    if args.strict_verdicts and verdicts != EXPECTED_VERDICTS_STRICT:
        print("error: verdict tuple differs from EXPECTED_VERDICTS_STRICT", file=sys.stderr)
        print(f"  got:      {verdicts}", file=sys.stderr)
        print(f"  expected: {EXPECTED_VERDICTS_STRICT}", file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
