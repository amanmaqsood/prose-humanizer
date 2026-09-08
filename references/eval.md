# Evaluation

Use this pass after drafting or editing. Evaluate the axes separately. Fidelity is a hard gate: a voice or fluency improvement cannot compensate for changed meaning.

## Axis 1: fidelity - hard gate

Pass only when all apply:

1. Every relevant source proposition remains with the same scope, certainty, attribution, chronology, and qualification.
2. Every output proposition is supported or clearly labeled as fiction, hypothesis, opinion, or placeholder.
3. Entities, names, numbers, dates, defined terms, quotations, citations, links, and literal values are exact where required.
4. Correlation did not become causation; possibility did not become certainty; one experience did not become a general rule.
5. The output adds no narrator, experience, motive, relationship, comparison, outcome, customer reaction, or sourced-looking detail.
6. Voice-sample facts and memorable phrases did not leak into the new content.

If any item fails, repair the output before evaluating the other axes.

## Axis 2: voice fit and restraint

Evaluate each supported feature independently:

- cadence, paragraph shape, and clause density;
- formality, directness, warmth, skepticism, humor, and emotional restraint;
- contractions, questions, asides, fragments, repetition, and transitions;
- vocabulary, domain terms, code-switching, punctuation, and formatting;
- characteristic openings, explanations, disagreement, digressions, and endings.

Pass when the writer’s evidenced choices survived and the edit did not introduce a generic substitute persona. Strong source sentences remain unchanged. The depth of editing is proportional to actual problems. Dialect and non-native English are preserved without stereotyping or forced standardization.

The result must also satisfy the requested purpose, format, and channel. Restraint is not permission to leave source notes unshaped when the task requires a release note, email, thread, script, or another transformed artifact. If the source already satisfies that form, naming the channel alone is not a reason to reformat it.

## Axis 3: naturalness and clarity

Pass when:

1. The opening reaches the subject without empty setup.
2. Every sentence makes a recoverable claim, does necessary connective work, or contributes intentional voice.
3. Concrete material comes from evidence rather than fabricated specificity.
4. Sentence and paragraph shapes follow the thought instead of a repeated template.
5. Transitions, questions, lists, headings, punctuation, and formatting fit the channel.
6. The ending stops on an earned fact, implication, decision, image, or action.
7. No random error, unusual synonym, fake intimacy, or mandatory “human marker” was added.

## Mode contracts

- **Detect:** name the pattern, quote the shortest useful span, explain it in context, and propose the smallest fix. Do not rewrite or estimate authorship.
- **File:** protected content and unrelated diffs are unchanged; encoding and newline convention remain stable.
- **Repository audit:** honor configured exclusions and generated paths; rank review signals without editing.
- **Profile:** show feature-level confidence and provenance; do not claim identity or retain raw prose without permission.
- **Embedded:** return only the artifact requested by the caller.

## Audit notes

When notes are requested, distinguish:

- **changed:** the problem and specific benefit;
- **left alone:** distinctive text deliberately preserved;
- **uncertain:** a choice needing author input.

Do not attach this report to ordinary short-form output.

## Reproducible evaluation

The repository’s automated benchmark checks explicit synthetic invariants:

```text
npm run benchmark
```

It does not measure human preference. Use `scripts/prepare_pairwise.js` to create blinded, randomized ballots and rate meaning before voice fit, naturalness, clarity, and overall preference. Swap or randomize candidate order, use multiple raters or judges, and report each axis rather than hiding tradeoffs in one number.

See [research](research.md) for the evidence and limitations behind this evaluation design.
