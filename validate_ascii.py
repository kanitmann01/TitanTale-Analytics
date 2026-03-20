from __future__ import annotations

from pathlib import Path
import sys


DEFAULT_GLOBS = ("*.md", "*.txt")


def iter_target_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for pattern in DEFAULT_GLOBS:
        files.extend(root.rglob(pattern))
    return sorted(path for path in files if path.is_file())


def first_non_ascii(text: str) -> tuple[int, int, str] | None:
    for line_number, line in enumerate(text.splitlines(), start=1):
        for column_number, char in enumerate(line, start=1):
            if ord(char) > 127:
                return line_number, column_number, char
    return None


def main() -> int:
    root = Path(__file__).resolve().parent
    failures: list[str] = []

    for path in iter_target_files(root):
        try:
            content = path.read_text(encoding="utf-8")
        except OSError as exc:
            failures.append(f"Error: failed to read {path.name}: {exc}")
            continue

        result = first_non_ascii(content)
        if result is None:
            continue

        line_number, column_number, char = result
        failures.append(
            "Error: non-ASCII character found in "
            f"{path.relative_to(root)} at line {line_number}, column {column_number} "
            f"(U+{ord(char):04X})"
        )

    if failures:
        for message in failures:
            print(message)
        return 1

    print("Success: ASCII validation passed for markdown and text files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
