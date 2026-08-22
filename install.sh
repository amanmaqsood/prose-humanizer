#!/usr/bin/env sh
set -eu

if [ -n "${PROSE_HUMANIZER_HOME:-}" ]; then
  install_root=$PROSE_HUMANIZER_HOME
elif [ -n "${HOME:-}" ]; then
  install_root=$HOME
else
  printf '%s\n' 'HOME is empty. Set HOME or PROSE_HUMANIZER_HOME.' >&2
  exit 1
fi

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
claude_skill="$install_root/.claude/skills/prose-humanizer"
agent_skill="$install_root/.agents/skills/prose-humanizer"
gemini_commands="$install_root/.gemini/commands"

mkdir -p "$claude_skill" "$agent_skill/agents" "$agent_skill/assets" "$gemini_commands"

cp "$script_dir/SKILL.md" "$claude_skill/SKILL.md"
cp "$script_dir/SKILL.md" "$agent_skill/SKILL.md"
cp "$script_dir/agents/openai.yaml" "$agent_skill/agents/openai.yaml"
cp "$script_dir/assets/icon.svg" "$agent_skill/assets/icon.svg"
cp "$script_dir/assets/banner.svg" "$agent_skill/assets/banner.svg"
cp "$script_dir/commands/gemini/prose-humanizer.toml" "$gemini_commands/prose-humanizer.toml"

printf '%s\n' 'Prose Humanizer is installed globally for this user.'
printf '%s\n' 'Claude Code: /prose-humanizer'
printf '%s\n' 'Gemini CLI:  /prose-humanizer'
printf '%s\n' 'Codex:       $prose-humanizer'
printf '%s\n' 'Restart the assistant, or run /commands reload in Gemini CLI, if the command is not visible yet.'
