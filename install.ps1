[CmdletBinding()]
param(
    [string]$InstallRoot = $env:USERPROFILE
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($InstallRoot)) {
    throw "InstallRoot is empty. Pass -InstallRoot or make sure USERPROFILE is set."
}

$sourceRoot = $PSScriptRoot
$resolvedRoot = [System.IO.Path]::GetFullPath($InstallRoot)
$claudeSkill = Join-Path $resolvedRoot ".claude\skills\prose-humanizer"
$agentSkill = Join-Path $resolvedRoot ".agents\skills\prose-humanizer"
$geminiCommands = Join-Path $resolvedRoot ".gemini\commands"

function Copy-SkillFile {
    param(
        [Parameter(Mandatory)] [string]$Source,
        [Parameter(Mandatory)] [string]$Destination
    )

    $destinationParent = Split-Path -Parent $Destination
    New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

Copy-SkillFile -Source (Join-Path $sourceRoot "SKILL.md") -Destination (Join-Path $claudeSkill "SKILL.md")

Copy-SkillFile -Source (Join-Path $sourceRoot "SKILL.md") -Destination (Join-Path $agentSkill "SKILL.md")
Copy-SkillFile -Source (Join-Path $sourceRoot "agents\openai.yaml") -Destination (Join-Path $agentSkill "agents\openai.yaml")
Copy-SkillFile -Source (Join-Path $sourceRoot "assets\icon.svg") -Destination (Join-Path $agentSkill "assets\icon.svg")
Copy-SkillFile -Source (Join-Path $sourceRoot "assets\banner.svg") -Destination (Join-Path $agentSkill "assets\banner.svg")

Copy-SkillFile -Source (Join-Path $sourceRoot "commands\gemini\prose-humanizer.toml") -Destination (Join-Path $geminiCommands "prose-humanizer.toml")

Write-Host "Prose Humanizer is installed globally for this user."
Write-Host "Claude Code: /prose-humanizer"
Write-Host "Gemini CLI:  /prose-humanizer"
Write-Host 'Codex:       $prose-humanizer'
Write-Host "Restart the assistant, or run /commands reload in Gemini CLI, if the command is not visible yet."
