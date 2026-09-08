# Human evaluation kit

Use this only after both candidate sets pass the deterministic fidelity checks.

1. Put one output per benchmark case in two folders, such as `candidate-a/` and `candidate-b/`.
2. Run `node scripts/prepare_pairwise.js --a candidate-a --b candidate-b --output local-ballot --seed 41`.
3. Give raters `local-ballot/ballot.json`. Keep `local-ballot/key.json` hidden until ratings are complete.
4. Rate meaning first. A candidate with a meaning failure cannot win overall.
5. Then rate voice fit, naturalness, clarity, and overall preference. Use left, right, tie, or fail.
6. Reverse the display order for a second ballot or use a new seed to check position sensitivity.
7. Report the number of raters, cases, ties, meaning failures, wins, and the evaluation date. Do not convert these judgments into an authorship or detector claim.

The repository does not contain a completed human-preference result. The bundled references are benchmark fixtures, not proof that one model or version writes better in every domain.
