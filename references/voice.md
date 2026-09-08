# Voice evidence

Read this reference for voice matching, reusable profiles, or disputed style corrections.

## Accept deliberate evidence only

Use samples the user supplies or explicitly identifies. Do not search parent folders, messages, repositories, or accounts for writing samples without an explicit request.

Record provenance for each source:

- source label and date when known;
- typed, dictated, AI-edited, translated, collaborative, or unknown;
- complete piece or excerpt;
- destination, audience, and topic;
- whether the user says it represents their desired voice.

Complete, deliberate, typed pieces usually support more features than fragments. Dictation supports spoken cadence but not necessarily written punctuation. AI-edited or collaborative text is weak evidence unless the user confirms specific choices. Weight each source by feature rather than assigning one global reliability score.

## Build a feature-level profile

Keep confidence separate for each feature:

- sentence range, clause density, and paragraph shape;
- directness, formality, warmth, skepticism, humor, and emotional restraint;
- contractions, fragments, repetition, questions, asides, and transitions;
- ordinary and domain vocabulary, preferred nouns, profanity, and code-switching;
- punctuation, headings, lists, openings, explanations, disagreement, digressions, and endings.

Label a feature high-confidence only when it recurs across multiple relevant samples. Conflicting evidence is a range or context rule, not permission to average the writer into neutrality.

## Separate voice from content

Voice samples supply choices, not facts. Never transfer their people, events, products, numbers, quotations, opinions, anecdotes, or memorable phrases into a new piece. Compare samples from different topics when possible so topic vocabulary is not mistaken for style.

For a difficult match, create two internal candidates. Prefer the candidate that improves supported voice features while moving fewer claims and copying fewer phrases.

## Respect variation and identity

Do not stereotype dialect, nationality, age, gender, profession, or education level. Preserve code-switching and non-standard forms when they are evidenced and clear. A writer may use different voices by channel; keep email, social, academic, technical, and personal profiles distinct when evidence supports the difference.

## Learn corrections conservatively

A user’s “stet,” rejection, or correction applies to the current text. Promote it into a reusable preference only after it recurs and the user confirms it. Record the positive choice and its context rather than a growing list of bans.

## Privacy-safe profiles

Create or save a profile only when requested. Prefer feature summaries and source hashes over raw prose. The optional CLI command below produces a local JSON profile that contains no sample text:

```text
prose-lint profile sample-1.txt sample-2.txt --sample-types typed,ai-edited --language en --json
```

The output follows `schemas/voice-profile.schema.json`. Hashes establish which samples informed the profile; they do not identify an author or prove authorship.
