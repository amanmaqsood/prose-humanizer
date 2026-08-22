# Prose Humanizer evaluation

Use this pass after drafting or editing. Treat every applicable item as pass or fail. Fix failures before returning the content.

## Evidence

1. Every relevant source claim remains, with the same scope, certainty, attribution, and qualification.
2. No fact, example, statistic, quotation, citation, narrator, motive, cause, comparison, or conclusion was invented.
3. Names, numbers, dates, links, quotations, and citations match the supplied evidence exactly.
4. Hypotheticals are labeled, and uncertainty remains uncertainty.

## Voice and editing restraint

1. The writer would recognize the vocabulary, cadence, directness, humor, uncertainty, and level of polish.
2. Strong human sentences were left alone; the edit is proportional to the actual problems.
3. Useful edge, technical precision, digressions, and mixed feelings survived.
4. The rewrite did not add fake intimacy, slang, profanity, anecdotes, typos, or quirks.

## Substance and structure

1. The opening reaches the subject without generic throat-clearing.
2. Every paragraph advances the purpose rather than previewing or recapping it.
3. Generic sentences pass the portability test or were removed or grounded in supplied detail.
4. Paragraph and sentence shapes fit the ideas instead of repeating a template.
5. The ending stops on an earned fact, consequence, choice, image, or next action.

## Pattern and format pass

1. High-confidence structural patterns from `patterns.md` are removed unless the source voice or context justifies them.
2. Watched vocabulary was evaluated in context rather than mechanically replaced with unusual synonyms.
3. Formatting matches the destination; Markdown, headings, lists, emoji, hashtags, and sign-offs appear only where useful.
4. Punctuation serves the sentence and does not imitate arbitrary human variation.

## Mode-specific checks

- **Detect:** every finding names a pattern, quotes the shortest useful span, and proposes a small fix. The response does not rewrite, score authorship, or guess who wrote the draft.
- **File:** protected code, metadata, data, quotations, and link targets are unchanged, and unrelated diffs are absent.
- **Repository audit:** files are ranked by review signals, not labeled as AI-authored, and no file was rewritten without selection.
- **Embedded:** only the requested final content is returned.

The evaluation is complete only when every applicable item passes.
