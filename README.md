<p align="center">
  <img src="assets/banner.svg" alt="Prose Humanizer" width="900">
</p>

<p align="center">
  <strong>Specific, truthful writing in your voice.</strong>
</p>

<p align="center">
  Draft · Rewrite · Voice match · Detect · File-safe editing · Repository linting
</p>

<p align="center">
  <a href="https://github.com/amanmaqsood/prose-humanizer/actions/workflows/validate.yml"><img src="https://github.com/amanmaqsood/prose-humanizer/actions/workflows/validate.yml/badge.svg" alt="Validate skill"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-172033.svg" alt="MIT License"></a>
  <a href="https://github.com/amanmaqsood/prose-humanizer/stargazers"><img src="https://img.shields.io/github/stars/amanmaqsood/prose-humanizer?style=social" alt="GitHub stars"></a>
</p>

## What is Prose Humanizer?

Prose Humanizer is a portable Agent Skill and optional pattern-lint CLI for people who want writing that sounds authored rather than generated from a template.

It can:

- draft from notes, sources, facts, and voice samples;
- rewrite with the minimum effective edit;
- match a writer without copying memorable phrases;
- audit named writing patterns without rewriting or guessing authorship;
- protect facts, code, frontmatter, quotations, data, and link targets;
- scan documentation repositories with explainable line-number findings.

Its first rule is evidence. It will not invent an anecdote, statistic, quotation, citation, narrator, cause, or conclusion to make prose feel more human.

> [!IMPORTANT]
> Prose Humanizer is not an AI detector and does not promise "undetectable" writing. Detector scores cannot prove authorship. Judge the result by factual fidelity, voice, specificity, clarity, and reader experience.

## Install globally with one command

The open [skills CLI](https://github.com/vercel-labs/skills) can discover this repository's root `SKILL.md` and install it for supported assistants:

```bash
npx skills add amanmaqsood/prose-humanizer -g
```

The installer lets you choose Claude Code, Codex, Gemini CLI, Cursor, and many other supported agents. To skip prompts and target every detected agent:

```bash
npx skills add amanmaqsood/prose-humanizer -g --all
```

Then invoke the skill with your assistant's native syntax:

| Assistant | Command |
|---|---|
| Claude Code | `/prose-humanizer Rewrite this draft in my voice...` |
| Gemini CLI | `/prose-humanizer Rewrite this draft in my voice...` |
| Codex | `$prose-humanizer Rewrite this draft in my voice...` |

Our own offline-friendly installers configure Claude Code, Gemini CLI, and Codex together:

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

See [INSTALL.md](INSTALL.md) for updates, manual paths, web products, plugin archives, and removal.

## Use it

### Rewrite without flattening the writer

```text
$prose-humanizer Rewrite this article with the minimum effective edit. Preserve my argument, citations, technical terms, humor, and every supported fact. Return only the article.
```

### Draft from evidence

```text
$prose-humanizer Turn these notes into a 700-word newsletter. Treat the attached posts as voice samples. Use only the supplied facts and links.
```

### Detect without rewriting

```text
$prose-humanizer Audit this draft. Name each generic-writing pattern, quote the shortest relevant span, and suggest the smallest fix. Do not rewrite it or guess who wrote it.
```

### Edit a file safely

```text
$prose-humanizer Edit docs/launch.md. Preserve its frontmatter, code blocks, quoted text, data, anchors, and link destinations.
```

## The pattern-lint CLI

The optional CLI finds configured review signals. It reports exactly which rule matched, where it matched, and what kind of edit to consider. It never labels text as human or AI.

Install it from a clone:

```bash
npm install -g .
```

Commands:

```bash
prose-lint analyze draft.md
prose-lint score draft.md
prose-lint stats draft.md --json
prose-lint fix draft.md --write
prose-lint scan docs/ --fail-above 70
```

| Command | Purpose |
|---|---|
| `analyze` | Named findings with line numbers, matched text, categories, and suggested edits |
| `score` | Configured pattern density on a 0-100 lint scale, explicitly not authorship |
| `stats` | Sentence lengths, paragraph sizes, vocabulary ratio, and repeated trigrams |
| `fix` | Only declared meaning-preserving mechanical substitutions |
| `scan` | Repository ranking, JSON output, and optional CI thresholds |

The linter ignores YAML frontmatter, fenced code, Markdown quotations, inline code, and link destinations. Short samples receive a low-confidence label. The machine-readable rules live in [rules/patterns.json](rules/patterns.json).

The score is transparent: `min(100, 600 × total matched-rule weight / prose word count)`. It is a review-priority signal, not a probability and not evidence of authorship.

## How the editorial workflow works

1. Select Draft, Rewrite, Voice match, Detect, File, Repository audit, or Embedded mode.
2. Build a source ledger of every claim, name, number, quotation, citation, link, and stated opinion.
3. Infer the writer's voice from actual evidence.
4. Draft from substance or make the minimum effective edit.
5. Audit structural, lexical, rhythm, communication, and formatting patterns in context.
6. Compare the result against the source ledger to catch omissions and inventions.
7. Run the pass/fail editorial evaluation before returning the result.

The core contract is in [SKILL.md](SKILL.md). Detailed guidance is disclosed only when needed through [patterns](references/patterns.md), [file safety](references/file-safety.md), and the [editorial evaluation](references/eval.md).

## Repository checks and automation

Every push and pull request verifies:

- skill structure, references, metadata, and synchronized versions;
- CLI behavior through public-interface tests;
- behavior-evaluation fixtures for every public mode and safety boundary;
- plugin archive contents and canonical-file equality;
- PowerShell and shell installer behavior;
- npm package contents and shell syntax.

An optional pre-commit check is included:

```bash
./scripts/install-git-hook.sh
```

Set `PROSE_LINT_THRESHOLD` to change its default threshold of 70.

## Principles

**Truth beats texture.** A believable invention is still an error.

**Voice is evidence.** Real samples outrank a generic idea of what human writing sounds like.

**Edit proportionally.** Leave good human sentences alone.

**Patterns need context.** One watched word or punctuation mark proves nothing.

**Variation needs a reason.** Random mistakes and forced fragments create another artificial fingerprint.

**Transparent tools beat mystery scores.** Every CLI point traces back to a readable rule and matched span.

## Open and portable

The skill has no API dependency, tracking, network call, or bundled binary. The CLI uses Node.js built-ins and has zero runtime dependencies. The files are readable, editable, testable, and MIT licensed.

## Contributing

Reproducible failure cases, before-and-after examples, translations, rules, tests, and destination-specific guidance are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

If Prose Humanizer improves something you publish, consider starring the repository. It helps other writers find it.

## Credits

The first version was inspired by Ruben Hassid's article ["Can you detect AI?"](https://ruben.substack.com/p/how-to-bypass-ai-detectors). Later versions were informed by a comparative review of other open writing skills. See [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) for project-specific credit and licensing notes.

## License

[MIT](LICENSE) © 2026 Aman Maqsood
