#!/usr/bin/env python3
"""Build and validate the distributable Prose Humanizer plugin."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / ".codex-plugin" / "plugin.json"
PACKAGE = ROOT / "package.json"
SKILL_FILES = ("SKILL.md", "package.json", "LICENSE", ".prose-humanizer.example.json")
SKILL_DIRECTORIES = ("agents", "assets", "bin", "evals", "lib", "references", "rules", "schemas", "scripts")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "dist")
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def load_metadata() -> tuple[dict, dict]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    package = json.loads(PACKAGE.read_text(encoding="utf-8"))
    if manifest.get("version") != package.get("version"):
        raise SystemExit("Plugin and package versions must match")
    required = ("name", "version", "description", "author", "skills", "interface")
    missing = [key for key in required if not manifest.get(key)]
    if missing:
        raise SystemExit(f"Missing plugin fields: {', '.join(missing)}")
    return manifest, package


def copy_skill(skill_root: Path) -> None:
    skill_root.mkdir(parents=True)
    for filename in SKILL_FILES:
        shutil.copy2(ROOT / filename, skill_root / filename)
    for directory in SKILL_DIRECTORIES:
        shutil.copytree(
            ROOT / directory,
            skill_root / directory,
            ignore=shutil.ignore_patterns("__pycache__", "*.pyc"),
        )


def build(output: Path, manifest: dict) -> Path:
    output.mkdir(parents=True, exist_ok=True)
    package_root = output / "prose-humanizer"
    if package_root.exists():
        shutil.rmtree(package_root)

    (package_root / ".codex-plugin").mkdir(parents=True)
    (package_root / "assets").mkdir(parents=True)
    shutil.copy2(MANIFEST, package_root / ".codex-plugin" / "plugin.json")
    shutil.copy2(ROOT / "assets" / "icon.svg", package_root / "assets" / "icon.svg")
    copy_skill(package_root / "skills" / "prose-humanizer")
    for filename in ("LICENSE", "PRIVACY.md", "TERMS.md"):
        shutil.copy2(ROOT / filename, package_root / filename)

    archive = output / f"prose-humanizer-plugin-{manifest['version']}.zip"
    if archive.exists():
        archive.unlink()
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for file in sorted(package_root.rglob("*")):
            if file.is_file():
                package.write(file, file.relative_to(output))
    shutil.rmtree(package_root)
    return archive


def validate_archive(archive: Path) -> None:
    if not zipfile.is_zipfile(archive):
        raise SystemExit("Plugin output is not a valid ZIP archive")
    with zipfile.ZipFile(archive) as package:
        packaged_skill = package.read("prose-humanizer/skills/prose-humanizer/SKILL.md")
    if packaged_skill != (ROOT / "SKILL.md").read_bytes():
        raise SystemExit("Packaged SKILL.md differs from the canonical file")


def build_skill_archive(output: Path) -> Path:
    archive = output / "prose-humanizer-skill.zip"
    if archive.exists():
        archive.unlink()
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for filename in SKILL_FILES:
            package.write(ROOT / filename, filename)
        for directory in SKILL_DIRECTORIES:
            for file in sorted((ROOT / directory).rglob("*")):
                if file.is_file() and "__pycache__" not in file.parts and file.suffix != ".pyc":
                    package.write(file, file.relative_to(ROOT))
    return archive


def validate_skill_archive(archive: Path) -> None:
    if not zipfile.is_zipfile(archive):
        raise SystemExit("Skill output is not a valid ZIP archive")
    with zipfile.ZipFile(archive) as package:
        names = set(package.namelist())
        required = {
            "SKILL.md", "references/eval.md", "rules/patterns.json",
            "lib/prose-core.js", "schemas/voice-profile.schema.json",
        }
        if not required.issubset(names):
            raise SystemExit("Skill output is incomplete")
        packaged_skill = package.read("SKILL.md")
    if packaged_skill != (ROOT / "SKILL.md").read_bytes():
        raise SystemExit("Skill archive SKILL.md differs from the canonical file")


def main() -> None:
    args = parse_args()
    manifest, _ = load_metadata()
    if args.check:
        with tempfile.TemporaryDirectory() as directory:
            archive = build(Path(directory), manifest)
            skill_archive = build_skill_archive(Path(directory))
            validate_archive(archive)
            validate_skill_archive(skill_archive)
        print("Plugin and skill packages are valid.")
        return
    archive = build(args.output.resolve(), manifest)
    skill_archive = build_skill_archive(args.output.resolve())
    validate_archive(archive)
    validate_skill_archive(skill_archive)
    print(f"Built {archive}")
    print(f"Built {skill_archive}")


if __name__ == "__main__":
    main()
