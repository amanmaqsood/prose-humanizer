# File safety

Read this reference for file and repository modes.

## Protect non-prose content

Change only prose the user placed in scope. Preserve exactly unless the user asks otherwise:

- YAML or TOML frontmatter and document metadata;
- code blocks, inline code, commands, configuration, formulas, and data;
- URLs, Markdown link destinations, anchors, image paths, and reference identifiers;
- quotations and cited excerpts, including watched phrases inside them;
- tables whose cell values are data rather than prose;
- generated files, vendored content, lockfiles, and build output.

Markdown link labels may be edited when they are ordinary prose and the destination remains unchanged.

## Keep changes reviewable

- Inspect the working tree before editing a tracked file.
- Preserve unrelated user changes and the file's encoding and newline convention.
- Do not reformat the whole file to change a few sentences.
- Use a normal diff to verify that only intended prose changed.
- Never discard, reset, or overwrite unrelated work.

For a repository audit, report candidates first. Editing authorization for one file does not authorize rewriting every flagged file.

## Verify the result

After editing, confirm that frontmatter still parses when a parser is available, code fences remain balanced, link targets are unchanged, and names, numbers, citations, and commands still match the source.
