---
name: prose-humanizer
description: Draft, rewrite, voice-match, or audit articles, posts, emails, scripts, reports, and other prose so it is specific, natural, and faithful to the user's evidence. Use for human-sounding writing and named pattern audits; do not use it to decide whether a person used AI.
---

# Prose Humanizer

Edit for reader trust, not detector scores. Preserve the writer's meaning, evidence, voice, register, and destination. Naturalness comes from specific choices and honest perspective, never fabricated details or deliberate mistakes.

## Select the mode

Infer the mode from the request. Ask only when the choice would materially change the result.

- **Draft:** build new prose from the user's brief, facts, sources, examples, and voice samples.
- **Rewrite:** make the minimum effective edit. Keep strong human sentences and useful structure; change only what is generic, unclear, repetitive, inaccurate, or mismatched to the destination.
- **Voice match:** infer recurring choices from supplied writing samples, then draft or rewrite without copying memorable phrases.
- **Detect:** audit without rewriting. Name each matched pattern, quote the shortest useful span, explain the problem, and suggest the smallest fix. Do not score authorship or guess who wrote it.
- **File:** edit prose in a named file. Read [references/file-safety.md](references/file-safety.md) before changing it.
- **Repository audit:** find prose files with the densest configured patterns. Use the bundled `prose-lint scan` command when executable tooling is available. Do not rewrite files until the user selects them.
- **Embedded:** when this skill is one step inside another task, return only the requested final prose unless the caller asks for an audit.

If an edit or detect request has no draft, ask the user to paste, attach, or identify it.

## Establish the evidence boundary

Before writing, make a silent source ledger:

- claims, names, numbers, dates, quotations, citations, links, rankings, and causal statements;
- the writer's stated opinions, uncertainty, and emotional stance;
- facts that may be verified from supplied sources;
- gaps that must remain gaps.

The final prose must preserve every relevant ledger item and add no unsupported one. Do not introduce a narrator such as “we,” “our,” or “told us” unless the source establishes that narrator. Do not strengthen correlation into cause, convert one person's experience into a general claim, or add a comparative, superlative, motive, relationship, outcome, or conclusion that the evidence does not support.

When a necessary fact is absent, ask for it, write around it, or mark a clear placeholder in a draft. Remove placeholders before final delivery. Hypotheticals must be labeled as hypotheticals.

## Resolve the writing brief

Infer what is already clear. Resolve only gaps that affect the result:

- audience, purpose, format, channel, and useful length;
- what the reader should understand, feel, or do;
- facts and sources the piece may use;
- required terminology, citations, brand rules, and exclusions;
- voice samples, when voice fidelity matters.

For procedures, policies, legal, medical, safety-critical, or technical instructions, clarity and accuracy outrank personality.

## Build the voice fingerprint

From the draft and any samples, silently note:

- sentence-length range and paragraph shape;
- contractions, fragments, slang, profanity, and domain terms;
- directness, warmth, humor, skepticism, restraint, and unresolved tension;
- preferred openings, transitions, questions, lists, parentheses, colons, and dashes;
- how the writer explains, disagrees, digresses, and ends.

Samples outrank generic style preferences. Preserve clear quirks that carry identity, including a useful aside, blunt phrase, long spoken sentence, self-correction, or mixed feeling. Do not turn those traits into a caricature.

With no sample, use a direct, modest register suited to the audience.

## Draft or edit from substance

1. State the central purpose in one plain internal sentence.
2. Arrange only the points needed to earn it. Let the piece form an argument, explanation, instruction, or story rather than a disguised listicle.
3. Ground abstractions in supplied details: the actual person, action, mechanism, place, date, amount, tool, constraint, or result.
4. Protect specific facts. Never smooth a useful detail into generic importance.
5. Use the minimum effective edit. Leave a good sentence alone even when another sentence could sound more polished.
6. Apply the **portability test** to generic passages: if a sentence could move unchanged to another person, company, product, or subject, cut it or make it specific with supplied evidence.
7. Keep nuance and technical precision. Plain language is not permission to dumb down the material.

## Shape rhythm around the thought

- Vary sentence and paragraph length because the idea changes, not to imitate randomness.
- Connect related thoughts when a row of short declarations hides their relationship.
- Keep a short sentence when it earns emphasis. Keep a long sentence when its clauses belong together.
- Repeat the clearest noun when cycling through synonyms would reduce clarity.
- Prefer active subjects when the actor matters; passive voice is valid when the actor is unknown, irrelevant, or intentionally backgrounded.
- Keep contractions, ordinary copulas such as “is” and “has,” and natural sentence openings when the register allows.
- Preserve genuine friction, doubt, disagreement, or an unresolved edge. Do not manufacture one.

## Audit the patterns

For every draft, rewrite, or detect request, read [references/patterns.md](references/patterns.md). Apply patterns in context and look for clusters. A watched word or punctuation mark by itself is not proof of anything.

When executable resources are available, the bundled linter can provide a deterministic second pass:

```text
prose-lint analyze <file>
prose-lint stats <file>
```

Treat its output as review leads. It measures configured pattern density and never determines authorship. Automatic fixes are deliberately limited to meaning-preserving substitutions.

## Run the evidence diff

Compare the completed draft against the source ledger:

1. Is every relevant source claim still present with the same scope and certainty?
2. Did the rewrite add any fact, narrator, cause, judgment, implication, or relationship?
3. Are names, numbers, dates, quotations, citations, and links exact?
4. Did compression remove a qualification or exception that changes the meaning?

Any unsupported addition or material omission is a failed edit. Correct it before delivery.

## Pass the editorial evaluation

Read [references/eval.md](references/eval.md) after drafting or editing. Apply every check relevant to the selected mode. Fix failures and rerun the evaluation; do not merely describe them.

## Return the result

- **Draft, rewrite, or voice match:** return only the requested final content unless the user asks for notes, alternatives, or an audit.
- **Detect:** list named findings with quoted spans and small fixes. Do not rewrite, score, or claim AI authorship.
- **File:** write only the approved prose changes and summarize them briefly. Preserve protected material described in the file-safety reference.
- **Repository audit:** rank candidate files and dominant patterns; wait for the user to select files before editing.
- **Embedded:** return only the final content required by the calling task.

Never promise that text is undetectable. The observable standard is specific, truthful, voice-consistent writing without recurring generic patterns.
