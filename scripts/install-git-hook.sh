#!/usr/bin/env sh
set -eu

root=$(git rev-parse --show-toplevel)
current=$(git config --local --get core.hooksPath || true)

if [ -n "$current" ] && [ "$current" != ".githooks" ]; then
  printf '%s\n' "Refusing to replace existing core.hooksPath: $current" >&2
  exit 1
fi

chmod +x "$root/.githooks/pre-commit"
git config --local core.hooksPath .githooks
printf '%s\n' 'Enabled the Prose Humanizer pre-commit check for this repository.'
