from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"


def fail(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(1)


if not SKILL.is_file():
    fail("SKILL.md is missing")

text = SKILL.read_text(encoding="utf-8")
if not text.startswith("---\n"):
    fail("SKILL.md must start with YAML frontmatter")

parts = text.split("---", 2)
if len(parts) != 3:
    fail("SKILL.md frontmatter is not closed")

frontmatter = parts[1]
name_match = re.search(r"(?m)^name:\s*([a-z0-9-]+)\s*$", frontmatter)
description_match = re.search(r"(?m)^description:\s*(.+?)\s*$", frontmatter)

if not name_match:
    fail("frontmatter needs a lowercase hyphenated name")
if name_match.group(1) != "human-written-content":
    fail("skill name must match the repository")
if not description_match or len(description_match.group(1).strip('"')) < 30:
    fail("frontmatter needs a discriminating description")
if len(parts[2].strip()) < 500:
    fail("skill body is unexpectedly short")
if "TODO" in text:
    fail("unfinished scaffold text found")

print("Skill is valid.")
