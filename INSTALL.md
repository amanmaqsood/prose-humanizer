# Install Prose Humanizer

Install Prose Humanizer once at user scope, then call it by name whenever you need to draft, rewrite or edit prose.

## Universal installer

The installer configures three local assistants in one pass:

| Assistant | Installed location | Command |
|---|---|---|
| Claude Code | `~/.claude/skills/prose-humanizer/` | `/prose-humanizer` |
| Gemini CLI | `~/.agents/skills/prose-humanizer/` plus a command adapter in `~/.gemini/commands/` | `/prose-humanizer` |
| Codex | `~/.agents/skills/prose-humanizer/` | `$prose-humanizer` |

### Windows PowerShell

```powershell
git clone https://github.com/amanmaqsood/prose-humanizer.git
cd prose-humanizer
.\install.ps1
```

### macOS and Linux

```bash
git clone https://github.com/amanmaqsood/prose-humanizer.git
cd prose-humanizer
chmod +x install.sh
./install.sh
```

Restart Claude Code or Codex after the first installation. In Gemini CLI, run `/commands reload` or restart the CLI.

### Use it

Claude Code or Gemini CLI:

```text
/prose-humanizer Rewrite this email in my voice. Preserve the dates, prices and links. Return only the revised email.
```

Codex:

```text
$prose-humanizer Rewrite this email in my voice. Preserve the dates, prices and links. Return only the revised email.
```

You can also attach a file, select text or refer to a draft already in the conversation.

## Update

Pull the newest version and rerun the same installer:

```bash
git pull
./install.sh
```

On Windows, replace the second command with `./install.ps1`. The installer overwrites only Prose Humanizer's own files and the matching Gemini command adapter.

## Manual and platform-specific installation

### Claude Code

Personal installation:

```bash
git clone https://github.com/amanmaqsood/prose-humanizer.git ~/.claude/skills/prose-humanizer
```

Project installation:

```bash
git clone https://github.com/amanmaqsood/prose-humanizer.git .claude/skills/prose-humanizer
```

Claude Code discovers personal skills in `~/.claude/skills/` and project skills in `.claude/skills/`. A skill named `prose-humanizer` can be invoked directly as `/prose-humanizer`.

### Gemini CLI

Gemini can install the skill directly from GitHub:

```bash
gemini skills install https://github.com/amanmaqsood/prose-humanizer
```

That installs the skill, but the direct `/prose-humanizer` shortcut also needs the included file at `commands/gemini/prose-humanizer.toml` copied to:

```text
~/.gemini/commands/prose-humanizer.toml
```

The universal installer performs both steps. Run `/commands reload` after changing a custom command.

### Codex

Ask the built-in installer:

```text
$skill-installer install prose-humanizer from https://github.com/amanmaqsood/prose-humanizer
```

Or clone it for your user account:

```bash
git clone https://github.com/amanmaqsood/prose-humanizer.git ~/.agents/skills/prose-humanizer
```

Codex's explicit skill syntax uses `$prose-humanizer`. You can also let Codex select the skill automatically when the request matches its description.

## ChatGPT and Claude.ai

Web and desktop products manage reusable skills through their own interfaces rather than the local CLI folders above.

- In ChatGPT, use the Skills area when it is available for your account, or attach `SKILL.md` to a conversation.
- In Claude.ai, download `prose-humanizer.zip` from the [latest release](https://github.com/amanmaqsood/prose-humanizer/releases/latest) and upload it as a custom Skill on supported plans.

Personal Skills may need to be installed separately on different product surfaces. File upload is still useful here, but it is no longer the primary setup for local assistants.

## Other assistants

If an assistant supports the Agent Skills format, point its installer or user-level skills directory at this repository. Otherwise, add `SKILL.md` to its reusable instructions or prompt library.

Current primary references:

- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Gemini CLI Agent Skills](https://geminicli.com/docs/cli/using-agent-skills/)
- [Gemini CLI custom commands](https://geminicli.com/docs/cli/custom-commands/)
- [OpenAI Skills](https://help.openai.com/en/articles/20001066)
