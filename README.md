<p align="center">
  <img src="assets/banner.svg" alt="Prose Humanizer" width="900">
</p>

<p align="center">
  <strong>Turn generic AI prose into specific, truthful writing that sounds like you.</strong>
</p>

<p align="center">
  Works with ChatGPT · Claude · Gemini · Codex · any assistant that can follow a Markdown instruction file
</p>

<p align="center">
  <a href="https://github.com/amanmaqsood/prose-humanizer/actions/workflows/validate.yml"><img src="https://github.com/amanmaqsood/prose-humanizer/actions/workflows/validate.yml/badge.svg" alt="Validate skill"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-172033.svg" alt="MIT License"></a>
  <a href="https://github.com/amanmaqsood/prose-humanizer/stargazers"><img src="https://img.shields.io/github/stars/amanmaqsood/prose-humanizer?style=social" alt="GitHub stars"></a>
</p>

## What is Prose Humanizer?

AI drafts often arrive with the same texture: tidy rectangular paragraphs, repeated transitions, vague authority, inflated vocabulary, automatic optimism and conclusions that say everything twice.

**Prose Humanizer** is an open instruction set that removes those habits without adding fake typos or invented personality. It helps any capable AI assistant draft, rewrite or edit:

- articles and newsletters;
- social posts and video scripts;
- emails, announcements and reports;
- landing pages and product copy;
- essays, explainers and personal writing.

The workflow is built around four things: a real voice, concrete detail, varied rhythm and claims the evidence can support.

> [!IMPORTANT]
> This is not an “undetectable AI” guarantee. Detector scores are inconsistent and cannot prove authorship. Prose Humanizer targets the standard readers actually experience: writing that is specific, credible and recognizably yours.

## Start in 30 seconds — no coding required

1. Download [SKILL.md](SKILL.md) or the ready-to-upload ZIP from the [latest release](https://github.com/amanmaqsood/prose-humanizer/releases/latest).
2. Attach it to a ChatGPT, Claude, Gemini or other AI conversation.
3. Attach or paste your draft. Add two or three samples of your writing if you want voice matching.
4. Send this:

```text
Follow the attached Prose Humanizer skill. Rewrite my draft in my voice, preserve every supported fact and return only the revised copy.
```

That is enough. The platform-specific options below make the skill reusable across future conversations.

## Install for your AI

| Platform | Fastest setup |
|---|---|
| **Claude.ai** | Download the ZIP from the latest release and upload it through **Settings → Features → Skills**. |
| **Claude Code** | Clone the repository into `~/.claude/skills/prose-humanizer`. |
| **Gemini CLI** | Run `gemini skills install https://github.com/amanmaqsood/prose-humanizer`. |
| **ChatGPT / Codex** | Ask `$skill-installer` to install this repository, or clone it into `~/.agents/skills/prose-humanizer`. |
| **Other assistants** | Attach `SKILL.md`, paste it into a reusable prompt/instruction feature or place it in the product's supported skills directory. |

Detailed commands and project-scoped options are in [INSTALL.md](INSTALL.md).

The shared file format is intentional. [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [Gemini CLI](https://geminicli.com/docs/cli/tutorials/skills-getting-started/) and [OpenAI](https://learn.chatgpt.com/docs/build-skills) all document skills built around a directory containing `SKILL.md` with `name` and `description` metadata.

## Example prompts

### Rewrite a draft

```text
Use Prose Humanizer to rewrite this launch post in my voice. Keep every fact, cut the generic phrasing and end on the customer result.
```

### Draft from notes

```text
Use Prose Humanizer to turn these rough notes into a 700-word newsletter. Treat the attached posts as voice samples. Do not invent details.
```

### Edit without flattening the writer

```text
Use Prose Humanizer to edit this article. Preserve the argument and citations, but remove repeated ideas, inflated claims and uniform sentence rhythm.
```

### Audit first

```text
Audit this draft with Prose Humanizer. Return the revised copy first, then list the five changes that mattered most.
```

## What it checks

- Voice fingerprinting from real writing samples
- Sentence and paragraph rhythm
- Generic vocabulary and stock transitions
- Mirrored contrasts, fake suspense and rhetorical Q&A
- Empty previews, recaps and pep-talk endings
- Inflated claims and vague attribution
- Punctuation and formatting residue
- Invented facts, quotations, anecdotes and citations
- Destination-specific formatting for posts, emails, scripts and articles

The complete editorial system lives in [SKILL.md](SKILL.md).

## How it works

1. Resolve the audience, purpose, facts and voice.
2. Build a content spine before polishing sentences.
3. Draft from concrete claims and supplied evidence.
4. Shape rhythm around the thought rather than a formula.
5. Remove recurring structural and lexical tells.
6. Verify names, numbers, quotations, links and citations.
7. Stop on the last earned concrete point.

It never manufactures a personal experience, statistic, quotation, citation or deliberate mistake to make text look human.

## Principles

**Truth beats texture.** A believable lie is still a lie. Missing facts stay missing until the writer supplies them.

**Voice is evidence.** With samples, the skill learns cadence, contractions, humor, directness and formatting. It does not reduce voice to a bag of slang.

**Plain does not mean flat.** Ordinary words, precise nouns and a clear opinion usually carry more personality than inflated synonyms.

**Variation needs a reason.** Sentence length changes with the thought. Random fragments and intentional mistakes create noise, not humanity.

**Detector scores are not authorship tests.** Judge the result by truth, specificity, voice fidelity and reader experience.

## Open and portable

Prose Humanizer has no API dependency, tracking, network call or bundled executable. The core is one readable Markdown file. Inspect it, change it and use it with the assistant you already prefer.

Platform-specific metadata under `agents/` is optional. It improves presentation in OpenAI products without changing the portable core.

## Contributing

Bug reports, before/after examples, translations and focused rule improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

If Prose Humanizer saves you from publishing one painfully generic paragraph, consider starring the repository. It helps other writers find it.

## Credits

The first version was inspired by Ruben Hassid's article [“Can you detect AI?”](https://ruben.substack.com/p/how-to-bypass-ai-detectors), including its catalog of common AI-writing patterns. This repository turns those observations into an original, reusable editorial workflow with additional voice, evidence and verification safeguards.

## License

[MIT](LICENSE) © 2026 Aman Maqsood
