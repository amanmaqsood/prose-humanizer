# Contributing

Thanks for helping make this skill more useful.

## Good contributions

- A reproducible example where the skill produces generic, inaccurate or voice-inconsistent prose
- A focused instruction change tied to an observed failure
- A clearer trigger description
- A correction to installation or compatibility documentation
- A before/after example that does not expose private or copyrighted material
- A machine-readable rule with an explainable category, weight, suggestion and public-interface test
- A behavioral eval case that catches lost facts, invented claims, voice flattening or unsafe file edits

Avoid adding universal rules based on one personal preference. A new instruction should change behavior in a useful range of real writing tasks.

## Pull requests

1. Fork the repository and create a focused branch.
2. Update `SKILL.md` or the relevant documentation.
3. Run `python scripts/validate_skill.py`, `npm test` and `python -m unittest discover -s tests -p "test_*.py"`.
4. Explain the failure you observed and why the change fixes it.
5. Keep unrelated formatting changes out of the pull request.

Do not contribute fabricated quotations, statistics, citations or personal anecdotes as examples.

Rules must describe review signals, never claim to determine authorship. Automatic fixes are accepted only when they preserve meaning mechanically. New CLI behavior needs a failing public-interface test before implementation.

## Discussion

Open an issue before a broad rewrite. Small corrections can go directly to a pull request.
