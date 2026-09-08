# Evaluation results

## v4 release check - 2026-09-08

The deterministic reference suite passes 9 of 9 cases across fidelity, restraint, and voice. This establishes only that the bundled candidates satisfy the declared invariants.

Two independent model evaluators, `gpt-5.6-sol` and `gpt-5.6-terra`, also generated v3 and v4 candidates for the original eight-case suite. Candidate identity was hidden during pairwise comparison, and order was reversed or rerandomized as a bias check.

The first run exposed a v4 regression: on the release-note case, v4 preserved the source unchanged instead of shaping it into the requested form. The skill was changed to define minimum effective editing as the least change that fully satisfies purpose, format, and channel. The changed case was then regenerated and compared again.

Post-fix aggregate across the two evaluators and eight cases each:

| Result | Count |
|---|---:|
| v4 preferred | 1 |
| v3 preferred | 0 |
| Tie | 15 |
| Meaning failures | 0 |

One evaluator narrowly preferred the revised v4 release note for naturalness; the other rated it a tie. Every other case tied. Both versions passed all deterministic checks used in that comparison.

This is a model-evaluator result over synthetic fixtures, not a human-preference result and not evidence of universal superiority. Generation and judging used the same model within each run. The ninth chronology fixture and newer CLI regression tests were added after this comparison. Use [HUMAN_EVALUATION.md](HUMAN_EVALUATION.md) to collect human judgments before making a human-preference claim.
