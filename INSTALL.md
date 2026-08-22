# Install Prose Humanizer

Choose one installation method. The skills CLI is the broadest option; the repository installers configure Claude Code, Gemini CLI, and Codex together without requiring a package registry.

## One-command global installation

Interactive installation for supported agents:

```bash
npx skills add amanmaqsood/prose-humanizer -g
```

Install globally for every detected agent without prompts:

```bash
npx skills add amanmaqsood/prose-humanizer -g --all
```

Target particular agents:

```bash
npx skills add amanmaqsood/prose-humanizer -g -a claude-code -a codex -a gemini-cli -y
```

The skills CLI supports updates:

```bash
npx skills update prose-humanizer -g
```

## Repository installer

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

This installs the complete skill package, including its references and optional linter, at:

| Assistant | User-level location | Invocation |
|---|---|---|
| Claude Code | `~/.claude/skills/prose-humanizer/` | `/prose-humanizer` |
| Codex | `~/.agents/skills/prose-humanizer/` | `$prose-humanizer` |
| Gemini CLI | `~/.agents/skills/prose-humanizer/` plus `~/.gemini/commands/prose-humanizer.toml` | `/prose-humanizer` |

Restart the assistant after the first installation. Gemini CLI can refresh commands with `/commands reload`.

### Update a cloned installation

```bash
git pull
./install.sh
```

On Windows, run `git pull` followed by `.\install.ps1`.

## Install the optional linter command

From the cloned repository:

```bash
npm install -g .
prose-lint --help
```

Node.js 18 or newer is required only for the CLI. The writing skill itself has no Node.js dependency.

To remove the CLI later:

```bash
npm uninstall -g prose-humanizer
```

## Claude Code plugin

Claude Code can install the repository as a marketplace plugin:

```text
/plugin marketplace add amanmaqsood/prose-humanizer
/plugin install prose-humanizer@prose-humanizer
```

The direct skill command remains `/prose-humanizer`.

## Codex and ChatGPT plugin archive

Each GitHub release includes `prose-humanizer-plugin-VERSION.zip`, built from the canonical root skill and validated before publishing. Use the plugin or Skills interface available to your OpenAI account.

Codex can also install the repository as a normal user skill:

```text
$skill-installer install prose-humanizer from https://github.com/amanmaqsood/prose-humanizer
```

## ChatGPT, Claude.ai, Gemini web, and other chat products

Download the complete `prose-humanizer-skill.zip` from the [latest release](https://github.com/amanmaqsood/prose-humanizer/releases/latest). Upload it through the product's Skills interface when supported.

For a one-conversation fallback, attach `SKILL.md` together with the `references/` files. The complete ZIP is preferred because advanced modes use the evaluation, pattern, and file-safety references.

Personal skills may need separate installation on different desktop, web, mobile, and CLI surfaces.

## Manual installation

Clone the complete repository into a supported user-level skills folder:

```bash
# Claude Code
git clone https://github.com/amanmaqsood/prose-humanizer.git ~/.claude/skills/prose-humanizer

# Codex and compatible Agent Skills clients
git clone https://github.com/amanmaqsood/prose-humanizer.git ~/.agents/skills/prose-humanizer
```

Do not copy only `SKILL.md` for a permanent installation. The current skill routes to files in `references/`, and the CLI uses `rules/`.

## Removal

The skills CLI can remove its installation:

```bash
npx skills remove prose-humanizer -g
```

For a manual or repository-script installation, remove only the explicit `prose-humanizer` folder from the assistant's user-level skills directory and remove `~/.gemini/commands/prose-humanizer.toml` if present. Review each resolved path before deleting it.

## Primary references

- [Open skills CLI](https://github.com/vercel-labs/skills)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Gemini CLI Agent Skills](https://geminicli.com/docs/cli/using-agent-skills/)
- [Gemini CLI custom commands](https://geminicli.com/docs/cli/custom-commands/)
- [OpenAI Skills](https://help.openai.com/en/articles/20001066)
