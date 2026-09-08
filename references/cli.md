# CLI and project configuration

The optional CLI provides deterministic English-language review signals. It does not rewrite with a model, determine authorship, or prove semantic equivalence.

## Recommended commands

```text
prose-lint report draft.md
prose-lint analyze draft.md --json
prose-lint stats draft.md --json
prose-lint fix draft.md --write
prose-lint scan docs/ --json
prose-lint profile sample-1.txt sample-2.txt --sample-types typed,ai-edited --language en --json
```

`report` returns exact spans, every occurrence, overlap groups, affected coverage, and weighted density per 100 prose words. The density is an uncalibrated review-priority signal. `score` remains a deprecated v3 compatibility command for one major release.

The parser excludes YAML and TOML frontmatter, fenced and indented code, block and inline quotations, tables, reference definitions, HTML or MDX tags and properties, generated sections, inline code, URLs, and link destinations. Link labels remain editable prose.

`fix` runs only when the configured language is English and the channel is not legal or medical. It accepts valid UTF-8, preserves a UTF-8 byte-order mark and existing newlines, and refuses other encodings without writing. These limits keep a mechanical cleanup from pretending to be a high-stakes or multilingual editor.

## Configuration

Create `.prose-humanizer.json` beside the target file or in the command’s working directory. The CLI does not search arbitrary parent directories. Pass `--config path` to use another explicit file.

```json
{
  "version": 1,
  "language": "en",
  "channel": "documentation",
  "threshold": 8,
  "disabledRules": ["dash-cluster"],
  "severityOverrides": {
    "tier1-vocabulary": "info"
  },
  "exclude": ["generated/**", "vendor/**"],
  "generatedMarkers": {
    "start": ["<!-- generated:start -->"],
    "end": ["<!-- generated:end -->"]
  }
}
```

The schema is `schemas/prose-humanizer.schema.json`. Unknown keys, invalid severities, and unknown rule IDs fail closed.

`language` describes the input. When it does not begin with `en`, the CLI skips English pattern matching and reports the reason. The agent skill can still edit other languages while preserving them.

Thresholds are local policy, not universal quality levels. A command-line `--fail-above` value overrides the project value. With neither, reports never fail because of density.

## Privacy

`profile` reads only the files named on the command line. Use `--sample-type` when all sources share a provenance type, or `--sample-types` with one comma-separated type per file. Supported types are typed, dictated, AI-edited, translated, collaborative, and unknown. A source-type-by-feature matrix weights sentence shape, paragraph shape, lexical choices, and punctuation separately. For example, dictation is strong cadence evidence but weak written-punctuation evidence. These weights affect both feature values and feature-specific confidence. English lexical features are omitted when `--language` is not English.

The output contains feature summaries, sample type, word count, feature-group evidence weights, basename, and SHA-256 hash, not raw prose. Saving or sharing the profile is the user’s decision.
