# Install Prose Humanizer

The repository is a portable Agent Skill: the root `SKILL.md` contains the instructions and required metadata. Choose the setup that matches your assistant.

## No-code: any assistant with file uploads

Download [SKILL.md](SKILL.md), attach it to a conversation and say:

```text
Follow the attached Prose Humanizer skill for this conversation.
```

Then provide your draft, brief and optional writing samples. This works as a one-conversation setup in ChatGPT, Claude, Gemini and other assistants that can read Markdown files.

## Claude.ai

1. Download `prose-humanizer.zip` from the [latest GitHub release](https://github.com/amanmaqsood/prose-humanizer/releases/latest).
2. Open Claude **Settings → Features**.
3. Upload the ZIP as a custom Skill.

Anthropic documents custom ZIP uploads for supported Claude.ai plans with code execution enabled. Custom Skills are stored separately on each Claude surface, so a Claude.ai upload does not automatically install the Claude Code version.

## Claude Code

Personal installation:

```bash
git clone https://github.com/amanmaqsood/prose-humanizer.git ~/.claude/skills/prose-humanizer
```

Project installation:

```bash
git clone https://github.com/amanmaqsood/prose-humanizer.git .claude/skills/prose-humanizer
```

Claude Code discovers custom skills in `~/.claude/skills/` for personal use and `.claude/skills/` for a project.

## Gemini CLI

Install directly from GitHub:

```bash
gemini skills install https://github.com/amanmaqsood/prose-humanizer
```

For workspace scope:

```bash
gemini skills install https://github.com/amanmaqsood/prose-humanizer --scope workspace
```

Verify or refresh inside Gemini CLI:

```text
/skills list
/skills reload
```

Gemini also discovers user skills under `~/.gemini/skills/` or `~/.agents/skills/`, and workspace skills under `.gemini/skills/` or `.agents/skills/`.

## ChatGPT and Codex

Ask the built-in installer:

```text
$skill-installer install prose-humanizer from https://github.com/amanmaqsood/prose-humanizer
```

Or clone it manually for your user account:

```bash
git clone https://github.com/amanmaqsood/prose-humanizer.git ~/.agents/skills/prose-humanizer
```

PowerShell:

```powershell
git clone https://github.com/amanmaqsood/prose-humanizer.git "$env:USERPROFILE\.agents\skills\prose-humanizer"
```

For one repository:

```text
your-project/.agents/skills/prose-humanizer/
```

If a newly installed skill does not appear, restart the app or CLI.

## Other tools

If your assistant supports the Agent Skills format, point its skill installer or skills directory at this repository. Otherwise, use the no-code file-upload method or paste `SKILL.md` into the product's reusable instructions feature.

Platform behavior changes over time. The current primary references are:

- [Anthropic Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Gemini CLI Agent Skills](https://geminicli.com/docs/cli/using-agent-skills/)
- [OpenAI Build Skills](https://learn.chatgpt.com/docs/build-skills)
