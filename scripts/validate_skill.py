from pathlib import Path
import json
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"
README = ROOT / "README.md"
INSTALLERS = (ROOT / "install.ps1", ROOT / "install.sh")
GEMINI_COMMAND = ROOT / "commands" / "gemini" / "prose-humanizer.toml"
PACKAGE = ROOT / "package.json"
CODEX_PLUGIN = ROOT / ".codex-plugin" / "plugin.json"
CLAUDE_PLUGIN = ROOT / ".claude-plugin" / "plugin.json"
RULES = ROOT / "rules" / "patterns.json"
EVALS = ROOT / "evals" / "cases.json"
REFERENCES = (
    ROOT / "references" / "eval.md",
    ROOT / "references" / "file-safety.md",
    ROOT / "references" / "patterns.md",
)
CLI = ROOT / "bin" / "prose-lint.js"


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
if name_match.group(1) != "prose-humanizer":
    fail("skill name must match the repository")
if not description_match or len(description_match.group(1).strip('"')) < 30:
    fail("frontmatter needs a discriminating description")
if len(parts[2].strip()) < 500:
    fail("skill body is unexpectedly short")
if "TODO" in text:
    fail("unfinished scaffold text found")

for installer in INSTALLERS:
    if not installer.is_file():
        fail(f"{installer.name} is missing")

if not GEMINI_COMMAND.is_file():
    fail("Gemini slash-command adapter is missing")

gemini_command = GEMINI_COMMAND.read_text(encoding="utf-8")
if "{{args}}" not in gemini_command or "prose-humanizer" not in gemini_command:
    fail("Gemini command must activate the skill and pass command arguments")

if "—" in README.read_text(encoding="utf-8"):
    fail("README must use ordinary hyphens instead of em dashes")

for required in (*REFERENCES, CLI, RULES, EVALS, PACKAGE, CODEX_PLUGIN, CLAUDE_PLUGIN):
    if not required.is_file():
        fail(f"required package file is missing: {required.relative_to(ROOT)}")

package = json.loads(PACKAGE.read_text(encoding="utf-8"))
codex_plugin = json.loads(CODEX_PLUGIN.read_text(encoding="utf-8"))
claude_plugin = json.loads(CLAUDE_PLUGIN.read_text(encoding="utf-8"))
rules = json.loads(RULES.read_text(encoding="utf-8"))
versions = {package.get("version"), codex_plugin.get("version"), claude_plugin.get("version")}
if len(versions) != 1 or None in versions:
    fail("package and plugin versions must match")
if len(rules.get("patterns", [])) < 15:
    fail("machine-readable pattern catalog is unexpectedly small")

for reference in REFERENCES:
    relative = reference.relative_to(ROOT).as_posix()
    if relative not in text:
        fail(f"SKILL.md does not route to {relative}")

print("Skill is valid.")
