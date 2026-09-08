from pathlib import Path
import json
import subprocess
import sys
import tempfile
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "scripts" / "build_plugin.py"


class PluginPackageTests(unittest.TestCase):
    def test_package_manifests_share_the_release_version(self) -> None:
        package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
        codex = json.loads(
            (ROOT / ".codex-plugin" / "plugin.json").read_text(encoding="utf-8")
        )
        claude = json.loads(
            (ROOT / ".claude-plugin" / "plugin.json").read_text(encoding="utf-8")
        )
        marketplace = json.loads(
            (ROOT / ".claude-plugin" / "marketplace.json").read_text(encoding="utf-8")
        )

        self.assertEqual(package["version"], codex["version"])
        self.assertEqual(package["version"], claude["version"])
        self.assertEqual(claude["skills"], ["./"])
        self.assertEqual(marketplace["plugins"][0]["source"], "./")

    def test_builder_creates_a_valid_plugin_from_canonical_skill_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            result = subprocess.run(
                [sys.executable, str(BUILD), "--output", directory],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)

            package_version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
            archive = Path(directory) / f"prose-humanizer-plugin-{package_version}.zip"
            self.assertTrue(zipfile.is_zipfile(archive))
            with zipfile.ZipFile(archive) as package:
                names = set(package.namelist())
                expected = {
                    "prose-humanizer/.codex-plugin/plugin.json",
                    "prose-humanizer/skills/prose-humanizer/SKILL.md",
                    "prose-humanizer/skills/prose-humanizer/references/eval.md",
                    "prose-humanizer/skills/prose-humanizer/references/file-safety.md",
                    "prose-humanizer/skills/prose-humanizer/references/patterns.md",
                    "prose-humanizer/skills/prose-humanizer/rules/patterns.json",
                    "prose-humanizer/skills/prose-humanizer/bin/prose-lint.js",
                    "prose-humanizer/skills/prose-humanizer/evals/cases.json",
                    "prose-humanizer/skills/prose-humanizer/evals/benchmark.json",
                    "prose-humanizer/skills/prose-humanizer/lib/prose-core.js",
                    "prose-humanizer/skills/prose-humanizer/schemas/prose-humanizer.schema.json",
                    "prose-humanizer/skills/prose-humanizer/schemas/voice-profile.schema.json",
                    "prose-humanizer/skills/prose-humanizer/scripts/run_benchmark.js",
                    "prose-humanizer/skills/prose-humanizer/package.json",
                    "prose-humanizer/assets/icon.svg",
                    "prose-humanizer/LICENSE",
                }
                self.assertTrue(expected.issubset(names), sorted(names))

                manifest = json.loads(
                    package.read("prose-humanizer/.codex-plugin/plugin.json")
                )
                self.assertEqual(manifest["version"], package_version)
                self.assertEqual(manifest["skills"], "./skills/")

                packaged_skill = package.read(
                    "prose-humanizer/skills/prose-humanizer/SKILL.md"
                )
                self.assertEqual(packaged_skill, (ROOT / "SKILL.md").read_bytes())

            skill_archive = Path(directory) / "prose-humanizer-skill.zip"
            self.assertTrue(zipfile.is_zipfile(skill_archive))
            with zipfile.ZipFile(skill_archive) as package:
                names = set(package.namelist())
                self.assertTrue({
                    "SKILL.md",
                    "agents/openai.yaml",
                    "assets/icon.svg",
                    "bin/prose-lint.js",
                    "evals/benchmark.json",
                    "evals/cases.json",
                    "lib/prose-core.js",
                    "references/eval.md",
                    "rules/patterns.json",
                    "schemas/prose-humanizer.schema.json",
                    "schemas/voice-profile.schema.json",
                    "scripts/run_benchmark.js",
                }.issubset(names))
                self.assertEqual(package.read("SKILL.md"), (ROOT / "SKILL.md").read_bytes())


if __name__ == "__main__":
    unittest.main()
