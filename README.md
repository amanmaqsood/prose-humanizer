<p align="center">
  <img src="assets/banner.svg" alt="Human Written Content" width="900">
</p>

<p align="center">
  <strong>A reusable Codex skill for specific, truthful, voice-consistent writing.</strong>
</p>

<p align="center">
  <a href="https://github.com/amanmaqsood/human-written-content/actions/workflows/validate.yml"><img src="https://github.com/amanmaqsood/human-written-content/actions/workflows/validate.yml/badge.svg" alt="Validate skill"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-172033.svg" alt="MIT License"></a>
  <a href="https://github.com/amanmaqsood/human-written-content/stargazers"><img src="https://img.shields.io/github/stars/amanmaqsood/human-written-content?style=social" alt="GitHub stars"></a>
</p>

## Why this exists

Generic AI prose has a recognizable texture: tidy paragraphs, repeated transitions, vague authority, inflated vocabulary, automatic optimism and conclusions that say the same thing twice.

`human-written-content` replaces that texture with an editorial workflow built around four things:

- a real voice;
- concrete details;
- varied rhythm;
- claims the evidence can support.

It can draft new material, rewrite an existing piece, match a writer from samples or clean up content that feels generic.

This is not a detector-bypass promise. AI detectors are inconsistent and a score cannot prove authorship. The skill aims at the more useful standard: writing that is specific, credible and recognizably yours.

## What the skill checks

- Voice fingerprinting from writing samples
- Sentence and paragraph rhythm
- Generic AI vocabulary and stock transitions
- Mirrored contrasts, fake suspense and rhetorical Q&A
- Empty previews, recaps and pep-talk endings
- Inflated claims and vague attribution
- Punctuation and formatting residue
- Invented facts, quotations, anecdotes and citations
- Destination-specific formatting for posts, emails, scripts and articles

The full workflow lives in [SKILL.md](SKILL.md).

## Install

### With Codex Skill Installer

Ask Codex:

```text
$skill-installer install human-written-content from https://github.com/amanmaqsood/human-written-content
```

Codex can install skills from external repositories. If the skill does not appear immediately, restart Codex.

### Manual user installation

Clone the repository into your personal skill directory:

```bash
git clone https://github.com/amanmaqsood/human-written-content.git ~/.agents/skills/human-written-content
```

On PowerShell:

```powershell
git clone https://github.com/amanmaqsood/human-written-content.git "$env:USERPROFILE\.agents\skills\human-written-content"
```

### Repository-scoped installation

To make the skill available only inside one project, place it at:

```text
your-project/.agents/skills/human-written-content/
```

Codex discovers repository skills from `.agents/skills` directories between the current directory and repository root. See the [official OpenAI skill documentation](https://learn.chatgpt.com/docs/build-skills).

## Use

Invoke it directly:

```text
$human-written-content rewrite this launch post in my voice. Keep every fact, cut the generic phrasing and end on the customer result.
```

Or let Codex activate it automatically for a matching writing task.

Useful prompts:

```text
$human-written-content turn these rough notes into a 700-word newsletter. Use the attached posts as voice samples.
```

```text
$human-written-content edit this article. Preserve the argument and citations, but remove repeated ideas, inflated claims and uniform sentence rhythm.
```

```text
$human-written-content write a concise product update for existing customers. Use only the supplied release notes and metrics.
```

```text
$human-written-content audit this draft. Return the revised copy first, then list the five changes that mattered most.
```

## How it works

The skill runs a substance-first editorial pass:

1. Resolve the audience, purpose, facts and voice.
2. Build a content spine before polishing sentences.
3. Draft from concrete claims and supplied evidence.
4. Shape rhythm around the thought rather than a formula.
5. Remove recurring structural and lexical tells.
6. Verify names, numbers, quotations, links and citations.
7. Stop on the last earned concrete point.

It never adds fake typos or fabricated personal details to imitate a person.

## Principles

**Truth beats texture.** A believable lie is still a lie. Missing facts stay missing until the writer supplies them.

**Voice is evidence.** When samples are available, the skill learns recurring choices: cadence, contractions, humor, directness and formatting. It does not reduce voice to a bag of slang.

**Plain does not mean flat.** Ordinary words, precise nouns and a clear opinion usually carry more personality than inflated synonyms.

**Variation must have a reason.** Sentence length changes with the thought. Random fragments and intentional mistakes create noise, not humanity.

**Detector scores are not authorship tests.** The output is judged by truth, specificity, voice fidelity and reader experience.

## Compatibility

The skill follows the open agent skill directory format: a folder containing a `SKILL.md` file with `name` and `description` frontmatter. It is designed for Codex and may also work with other agents that support the same format.

## Contributing

Bug reports, before/after examples and focused rule improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

If this saves you from publishing one painfully generic paragraph, consider starring the repository. It helps other writers find it.

## Credits

The first version was inspired by Ruben Hassid's article [“Can you detect AI?”](https://ruben.substack.com/p/how-to-bypass-ai-detectors), including its catalog of common AI-writing patterns. The repository turns those observations into an original, reusable editorial workflow with additional voice, evidence and verification safeguards.

## License

[MIT](LICENSE) © 2026 Aman Maqsood
