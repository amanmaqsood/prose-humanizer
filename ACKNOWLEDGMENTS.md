# Acknowledgments

Prose Humanizer is independently written and maintained under the MIT License.

The first version was inspired by Ruben Hassid's article ["Can you detect AI?"](https://ruben.substack.com/p/how-to-bypass-ai-detectors), especially its catalog of recurring generated-writing habits.

Version 3 was informed by a comparative review of:

- [blader/humanizer](https://github.com/blader/humanizer), MIT licensed, for its broad pattern taxonomy and false-positive guidance.
- [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop), MIT licensed, for minimum-effective editing and a separate evaluation pass.
- [aashaexo/soundshuman](https://github.com/aashaexo/soundshuman), with MIT and upstream notices, for transparent rules, repository linting, CI gates, and behavioral tests.
- [jalaalrd/anti-ai-slop-writing](https://github.com/jalaalrd/anti-ai-slop-writing), reviewed for comparison only. At review time its README stated MIT but the repository had no license file, so no wording or code was copied.

Version 4 added a clean-room review of:

- [hannsxpeter/humanizer](https://github.com/hannsxpeter/humanizer), MIT licensed, for voice precedence, edit intensity, local corrections, and restraint.
- [HopLittleBunny/write-like-me](https://github.com/HopLittleBunny/write-like-me), MIT licensed, for separating semantic content, authorial decisions, and expression; voice provenance; dialect safeguards; and phrase-leakage checks.
- [milock/humanizer](https://github.com/milock/humanizer), MIT licensed, for channel-aware review, hollow-content checks, and explicit detect-versus-rewrite output contracts.
- [AshwinSathian/humanize-writing-skill](https://github.com/AshwinSathian/humanize-writing-skill), MIT licensed, for lean routing, scope gates, and research honesty.

Detector limitations, style measurement, factual consistency, editing evaluation, and pairwise position bias were checked against primary sources. The evidence ledger and design consequences are documented in [references/research.md](references/research.md).

Concepts were reimplemented in original language and code. No project or researcher listed here endorses Prose Humanizer.
