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

install_package() {
  destination=$1
  mkdir -p "$destination"
  cp "$script_dir/SKILL.md" "$script_dir/package.json" "$script_dir/LICENSE" "$script_dir/.prose-humanizer.example.json" "$destination/"
  for directory in agents assets bin evals lib references rules schemas scripts; do
    mkdir -p "$destination/$directory"
    cp -R "$script_dir/$directory/." "$destination/$directory/"
  done
  chmod +x "$destination/bin/prose-lint.js"
}

mkdir -p "$gemini_commands"
install_package "$claude_skill"
install_package "$agent_skill"
cp "$script_dir/commands/gemini/prose-humanizer.toml" "$gemini_commands/prose-humanizer.toml"

printf '%s\n' 'Prose Humanizer is installed globally for this user.'
printf '%s\n' 'Claude Code: /prose-humanizer'
printf '%s\n' 'Gemini CLI:  /prose-humanizer'
printf '%s\n' 'Codex:       $prose-humanizer'
printf '%s\n' "Optional lint CLI: run 'npm install -g .' from the cloned repository."
printf '%s\n' 'Restart the assistant, or run /commands reload in Gemini CLI, if the command is not visible yet.'
