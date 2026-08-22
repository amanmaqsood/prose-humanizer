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


if __name__ == "__main__":
    unittest.main()
