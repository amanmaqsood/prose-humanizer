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

function Copy-SkillPackage {
    param([Parameter(Mandatory)] [string]$Destination)

    foreach ($filename in @("SKILL.md", "package.json", "LICENSE", ".prose-humanizer.example.json")) {
        Copy-SkillFile -Source (Join-Path $sourceRoot $filename) -Destination (Join-Path $Destination $filename)
    }
    foreach ($directory in @("agents", "assets", "bin", "evals", "lib", "references", "rules", "schemas", "scripts")) {
        $sourceDirectory = Join-Path $sourceRoot $directory
        Get-ChildItem -LiteralPath $sourceDirectory -File -Recurse |
            Where-Object { $_.Extension -ne ".pyc" -and $_.FullName -notmatch "[\\/]__pycache__[\\/]" } |
            ForEach-Object {
            $relativePath = [System.IO.Path]::GetRelativePath($sourceRoot, $_.FullName)
            Copy-SkillFile -Source $_.FullName -Destination (Join-Path $Destination $relativePath)
            }
    }
}

Copy-SkillPackage -Destination $claudeSkill
Copy-SkillPackage -Destination $agentSkill

Copy-SkillFile -Source (Join-Path $sourceRoot "commands\gemini\prose-humanizer.toml") -Destination (Join-Path $geminiCommands "prose-humanizer.toml")

Write-Host "Prose Humanizer is installed globally for this user."
Write-Host "Claude Code: /prose-humanizer"
Write-Host "Gemini CLI:  /prose-humanizer"
Write-Host 'Codex:       $prose-humanizer'
Write-Host "Optional lint CLI: run 'npm install -g .' from the cloned repository."
Write-Host "Restart the assistant, or run /commands reload in Gemini CLI, if the command is not visible yet."
