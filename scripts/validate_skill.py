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
BENCHMARK = ROOT / "evals" / "benchmark.json"
CONFIG_SCHEMA = ROOT / "schemas" / "prose-humanizer.schema.json"
VOICE_SCHEMA = ROOT / "schemas" / "voice-profile.schema.json"
REFERENCES = (
    ROOT / "references" / "cli.md",
    ROOT / "references" / "eval.md",
    ROOT / "references" / "file-safety.md",
    ROOT / "references" / "patterns.md",
    ROOT / "references" / "scope-and-language.md",
    ROOT / "references" / "voice.md",
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

for required in (*REFERENCES, CLI, RULES, EVALS, BENCHMARK, CONFIG_SCHEMA, VOICE_SCHEMA, PACKAGE, CODEX_PLUGIN, CLAUDE_PLUGIN):
    if not required.is_file():
        fail(f"required package file is missing: {required.relative_to(ROOT)}")

package = json.loads(PACKAGE.read_text(encoding="utf-8"))
codex_plugin = json.loads(CODEX_PLUGIN.read_text(encoding="utf-8"))
claude_plugin = json.loads(CLAUDE_PLUGIN.read_text(encoding="utf-8"))
rules = json.loads(RULES.read_text(encoding="utf-8"))
benchmark = json.loads(BENCHMARK.read_text(encoding="utf-8"))
config_schema = json.loads(CONFIG_SCHEMA.read_text(encoding="utf-8"))
voice_schema = json.loads(VOICE_SCHEMA.read_text(encoding="utf-8"))
versions = {package.get("version"), codex_plugin.get("version"), claude_plugin.get("version")}
if len(versions) != 1 or None in versions:
    fail("package and plugin versions must match")
if len(rules.get("patterns", [])) < 15:
    fail("machine-readable pattern catalog is unexpectedly small")
rule_ids = [rule.get("id") for rule in rules["patterns"]]
if len(rule_ids) != len(set(rule_ids)) or None in rule_ids:
    fail("rule ids must be present and unique")
pattern_guide = (ROOT / "references" / "patterns.md").read_text(encoding="utf-8")
for rule_id in rule_ids:
    if f"`{rule_id}`" not in pattern_guide:
        fail(f"pattern guide does not document rule id: {rule_id}")
for rule in rules["patterns"]:
    if rule.get("defaultSeverity", "warning") not in {"info", "warning", "high"}:
        fail(f"invalid default severity for {rule['id']}")
    if rule.get("kind") == "regex":
        for expression in rule.get("values", []):
            try:
                re.compile(expression)
            except re.error as error:
                fail(f"invalid regex for {rule['id']}: {error}")

fixes = rules.get("safeFixes", [])
matches = [fix.get("match", "").casefold() for fix in fixes]
if any(not match for match in matches) or len(matches) != len(set(matches)):
    fail("safe fixes need unique non-empty match strings")
if benchmark.get("humanPreferenceMeasured") is not False or len(benchmark.get("cases", [])) < 8:
    fail("benchmark must disclose its limitation and cover at least eight cases")
if config_schema.get("additionalProperties") is not False:
    fail("project configuration schema must reject unknown keys")
if voice_schema.get("properties", {}).get("rawProseStored", {}).get("const") is not False:
    fail("voice profile schema must forbid raw prose storage")

for reference in REFERENCES:
    relative = reference.relative_to(ROOT).as_posix()
    if relative not in text:
        fail(f"SKILL.md does not route to {relative}")

print("Skill is valid.")
