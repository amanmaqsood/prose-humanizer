<p align="center">
  <img src="assets/banner.svg" alt="Prose Humanizer" width="900">
</p>

<p align="center">
  <strong>Specific, truthful writing in your voice.</strong>
</p>

<p align="center">
  Draft · Rewrite · Voice match · Audit · File-safe editing · Repository linting
</p>

<p align="center">
  <a href="https://github.com/amanmaqsood/prose-humanizer/actions/workflows/validate.yml"><img src="https://github.com/amanmaqsood/prose-humanizer/actions/workflows/validate.yml/badge.svg" alt="Validate skill"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-172033.svg" alt="MIT License"></a>
  <a href="https://github.com/amanmaqsood/prose-humanizer/releases/latest"><img src="https://img.shields.io/github/v/release/amanmaqsood/prose-humanizer" alt="Latest release"></a>
  <a href="https://github.com/amanmaqsood/prose-humanizer/stargazers"><img src="https://img.shields.io/github/stars/amanmaqsood/prose-humanizer?style=social" alt="GitHub stars"></a>
</p>

## What it is

Prose Humanizer is a portable Agent Skill for drafting and editing prose that sounds authored because it is grounded in real evidence and a real voice. It works with Claude, Codex, Gemini CLI, Cursor, and other clients that support Agent Skills. The optional local CLI audits recurring writing patterns without guessing whether a person or model wrote the text.

It can:

- draft articles, posts, emails, scripts, reports, documentation, and other prose;
- rewrite with the minimum effective edit instead of flattening the writer;
- match a voice without copying sample facts or memorable phrases;
- preserve uncertainty, defined terms, chronology, causality, citations, and numbers;
- protect frontmatter, code, quotations, tables, HTML, MDX, generated sections, and link destinations;
- create privacy-safe voice profiles that retain hashes and feature evidence, not source prose;
- scan repositories with exact positions, overlap-aware density, and configurable exclusions.

Its first rule is evidence. It will not invent an anecdote, statistic, quotation, citation, narrator, cause, result, or customer reaction to make prose feel more human.

> [!IMPORTANT]
> Prose Humanizer is not an AI detector and does not promise detector evasion. Detector scores do not establish authorship. Judge writing by factual fidelity, voice fit, specificity, clarity, and reader experience.

## Install once, use anywhere

The open [skills CLI](https://github.com/vercel-labs/skills) can install the skill globally for supported assistants:

```bash
npx skills add amanmaqsood/prose-humanizer -g
```

Install it for every detected client without prompts:

```bash
npx skills add amanmaqsood/prose-humanizer -g --all
```

Then invoke it with the syntax your assistant uses:

| Assistant | Example |
|---|---|
| Claude Code | `/prose-humanizer Rewrite this in my voice.` |
| Gemini CLI | `/prose-humanizer Rewrite this in my voice.` |
| Codex | `$prose-humanizer Rewrite this in my voice.` |
| Other Agent Skills clients | Select or invoke `prose-humanizer` through the client interface. |

Repository installers configure Claude Code, Gemini CLI, and Codex together:

```powershell
# Windows
git clone https://github.com/amanmaqsood/prose-humanizer.git
cd prose-humanizer
.\install.ps1
```

```bash
# macOS and Linux
git clone https://github.com/amanmaqsood/prose-humanizer.git
cd prose-humanizer
./install.sh
```

See [INSTALL.md](INSTALL.md) for updates, exact locations, plugin packages, web products, and removal.

## Use it

### Rewrite without flattening the writer

```text
$prose-humanizer Rewrite this article with the minimum effective edit. Preserve my argument, citations, technical terms, humor, uncertainty, and every supported fact. Return only the article.
```

### Draft from evidence

```text
$prose-humanizer Turn these notes into a 700-word newsletter. Treat the attached posts as voice samples. Use only the supplied facts and links.
```

### Match a voice safely

```text
$prose-humanizer Use these three samples for cadence and diction, not for facts. Draft the new announcement from the supplied launch notes. Do not reuse memorable phrases.
```

### Audit without rewriting

```text
$prose-humanizer Audit this draft. Name each generic-writing pattern, quote the shortest relevant span, and suggest the smallest fix. Do not rewrite it or guess who wrote it.
```

### Edit a file safely

```text
$prose-humanizer Edit docs/launch.md. Preserve frontmatter, code, quoted text, data, anchors, generated sections, and link destinations.
```

## Why the workflow is different

The skill edits three layers in order:

1. **Semantic content** - claims, facts, uncertainty, attribution, chronology, and causality.
2. **Authorial decisions** - stance, emphasis, ordering, omissions, and unresolved edges.
3. **Expression** - syntax, diction, cadence, punctuation, and formatting.

It changes the lowest layer necessary. A surface rewrite cannot silently move facts or replace the writer's decisions.

"Minimum effective edit" means the least change that fully satisfies the requested purpose and format. It does not excuse returning raw notes unchanged when the user asked for a release note, email, thread, or script.

For voice work, explicit instructions outrank deliberate samples, which outrank a confirmed profile, the current draft, and destination defaults. Confidence is tracked per feature. Confidence in cadence does not become confidence in humor or stance. Samples are never discovered by scanning nearby folders.

For difficult deep rewrites, the skill can create two candidates internally and return the one with better voice fit and less semantic movement. Ordinary work uses one restrained pass.

## Optional transparent CLI

Install the zero-dependency Node.js CLI from a clone:

```bash
npm install -g .
```

```bash
prose-lint report draft.md
prose-lint analyze draft.md
prose-lint stats draft.md --json
prose-lint fix draft.md --write
prose-lint scan docs/
prose-lint profile sample-1.txt sample-2.txt --sample-types typed,ai-edited --language en --json
```

| Command | Purpose |
|---|---|
| `report` | Exact findings, overlap groups, coverage, and uncalibrated density |
| `analyze` | Human-readable findings with positions and smallest-fix guidance |
| `stats` | Descriptive prose statistics without quality or authorship claims |
| `fix` | Declared meaning-preserving substitutions in prose spans only |
| `scan` | Repository review with exclusions and optional project thresholds |
| `profile` | Hash-only source provenance and feature-level voice evidence |
| `score` | Deprecated v3 compatibility alias, scheduled for removal in v5 |

The automated pattern catalog is English-only. Configure another language and pattern checks are skipped instead of applying English assumptions to it. Mechanical fixes are also disabled for non-English, legal, and medical content. The editorial skill itself preserves the input language, dialect, and code-switching.

### Project configuration

Copy [.prose-humanizer.example.json](.prose-humanizer.example.json) to `.prose-humanizer.json`, then set the language, channel, exclusions, disabled rules, severity overrides, and an optional project-specific density threshold. The schema is [schemas/prose-humanizer.schema.json](schemas/prose-humanizer.schema.json).

The CLI checks configuration next to the target and in the current working directory. It does not walk parent folders looking for hidden instructions or voice samples.

## Evaluation, not theater

`npm run benchmark` executes shareable fixtures across three separate axes: fidelity, restraint, and voice. The hard checks catch missing or invented literals, narrator drift, phrase leakage, changed protected spans, and excessive editing. CI runs these checks on Node.js 18, 20, and 22, plus an installed CLI smoke test on Windows.

The repository also includes a blinded pairwise [human evaluation kit](evals/HUMAN_EVALUATION.md). It keeps candidate identity separate, checks meaning first, and recommends order reversal to expose position bias.

The [v4 evaluation record](evals/RESULTS.md) also preserves a regression found during cross-version testing, the fix, and the limited post-fix outcome instead of presenting a polished-only success story.

The bundled benchmark does **not** measure human preference, universal writing quality, or detector performance. Its reports say so. That limitation is part of the test contract, not a footnote.

## Design principles

**Truth beats texture.** A believable invention is still an error.

**Voice is evidence.** Relevant samples outrank a generic idea of human writing.

**Edit proportionally.** Leave effective, distinctive sentences alone.

**Patterns need context.** One watched word or punctuation mark proves nothing.

**Dialect is not a defect.** Do not anglicize, standardize, or stereotype a speaker.

**Transparent findings beat mystery scores.** Every CLI finding traces to a rule and an exact span.

## Open, portable, and private by design

The skill has no API dependency, telemetry, network call, or bundled binary. The CLI uses Node.js built-ins and has zero runtime dependencies. Voice profiles store source basenames, types, hashes, word counts, feature-group evidence weights, and derived features. They do not store the source passages.

The files are readable, editable, testable, and MIT licensed. See [PRIVACY.md](PRIVACY.md) and [TERMS.md](TERMS.md).

## Research and credits

The workflow was rebuilt through clean-room comparison with eight open writing skills and a review of primary research on detector reliability, style, factual consistency, text editing, and evaluation bias. No compared project endorses Prose Humanizer. See [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) for project licenses and [references/research.md](references/research.md) for the evidence ledger.

## Contributing

Reproducible failure cases, benchmark fixtures with clear provenance, translations, rules, and destination-specific guidance are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

If Prose Humanizer improves something you publish, consider starring the repository. It helps other writers find it.

## License

[MIT](LICENSE) © 2026 Aman Maqsood
