# File safety

Read this reference for file and repository modes.

## Protect non-prose content

Change only prose the user placed in scope. Preserve exactly unless the user asks otherwise:

- YAML or TOML frontmatter and document metadata;
- code blocks, inline code, commands, configuration, formulas, and data;
- URLs, Markdown link destinations, anchors, image paths, and reference identifiers;
- quotations and cited excerpts, including watched phrases inside them;
- tables whose cell values are data rather than prose;
- HTML or MDX tags, component props, embedded scripts and styles, and reference definitions;
- generated files, vendored content, lockfiles, and build output.

Markdown link labels may be edited when they are ordinary prose and the destination remains unchanged.

Treat invisible Unicode conservatively. Remove a character only when it is clearly stray formatting residue and its function is understood. Preserve script joiners, bidirectional controls, variation selectors, locale spacing, mathematical symbols, and any code or exact-value span. Report ambiguous characters instead of normalizing them blindly.

## Keep changes reviewable

- Inspect the working tree before editing a tracked file.
- Preserve unrelated user changes and the file's newline convention. The optional CLI accepts UTF-8, preserves a UTF-8 byte-order mark, and refuses other encodings without writing; use an encoding-aware editor for other files.
- Do not reformat the whole file to change a few sentences.
- Use a normal diff to verify that only intended prose changed.
- Honor `.prose-humanizer.json` exclusions and generated-section markers when present.
- Never discard, reset, or overwrite unrelated work.

For a repository audit, report candidates first. Editing authorization for one file does not authorize rewriting every flagged file.

## Verify the result

After editing, confirm that frontmatter still parses when a parser is available, code fences remain balanced, link targets are unchanged, HTML or MDX structure still parses when tooling exists, and names, numbers, citations, commands, newlines, and supported encoding still match the source.
