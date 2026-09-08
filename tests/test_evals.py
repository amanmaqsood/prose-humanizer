import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class EvaluationFixtureTests(unittest.TestCase):
    def test_behavior_cases_cover_every_public_mode_and_safety_boundary(self):
        cases = json.loads((ROOT / "evals" / "cases.json").read_text(encoding="utf-8"))
        ids = {case["id"] for case in cases}

        self.assertEqual(len(ids), len(cases))
        self.assertGreaterEqual(len(cases), 6)
        self.assertTrue({
            "draft-fact-fidelity",
            "rewrite-minimum-edit",
            "voice-match",
            "detect-only-contract",
            "file-protection",
            "repository-audit-contract",
        }.issubset(ids))

        for case in cases:
            self.assertIn(case["mode"], {
                "draft", "rewrite", "voice-match", "detect-only", "file", "repository-audit"
            })
            self.assertTrue(case["input"])
            self.assertTrue(case["assertions"])
            self.assertIn("must_not", case["assertions"])

    def test_executable_benchmark_uses_shareable_fixtures_and_separate_axes(self):
        benchmark = json.loads((ROOT / "evals" / "benchmark.json").read_text(encoding="utf-8"))
        cases = benchmark["cases"]
        ids = [case["id"] for case in cases]

        self.assertFalse(benchmark["humanPreferenceMeasured"])
        self.assertEqual(len(ids), len(set(ids)))
        self.assertGreaterEqual(len(cases), 8)
        self.assertEqual({case["axis"] for case in cases}, {"fidelity", "restraint", "voice"})
        for case in cases:
            self.assertTrue(case["source"])
            self.assertTrue(case["instruction"])
            self.assertIsInstance(case["required"], list)
            self.assertIsInstance(case["forbidden"], list)
            self.assertIsInstance(case["protected"], list)

    def test_precommit_hook_checks_staged_blob_without_an_invented_default_threshold(self):
        hook = (ROOT / ".githooks" / "pre-commit").read_text(encoding="utf-8")
        self.assertIn('git show ":$file"', hook)
        self.assertIn("report -", hook)
        self.assertNotIn("${PROSE_LINT_THRESHOLD:-70}", hook)


if __name__ == "__main__":
    unittest.main()
