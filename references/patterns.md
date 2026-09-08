# Prose pattern guide

Use this guide for drafting, rewriting, voice matching, and detection. Patterns are editing signals, not evidence of authorship. Look for repeated or clustered habits and preserve a demonstrated writer preference when it remains clear and accurate.

## Preserve before changing

Do not flag these by themselves:

- polished grammar, a consistent style, formal vocabulary, or dry prose;
- one transition word, em dash, semicolon, curly quotation mark, rhetorical question, or short emphatic sentence;
- passive voice where the actor is unknown or irrelevant;
- a real objection, disclaimer, safety notice, FAQ answer, or comparison developed with evidence;
- repeated openings used deliberately for rhythm;
- watched language inside a quotation, title, proper name, code sample, or historical source.

Preserve specific odd details, mixed feelings, era-bound references, defensible first-person choices, genuine asides, self-corrections, and uneven but clear cadence.

## High-confidence structural patterns

| Pattern | Common shape | Better move |
|---|---|---|
| Significance inflation | “pivotal moment,” “testament to,” arbitrary legacy claims | State the event and consequence at the scale the evidence supports. |
| Promotional varnish | “world-class,” “breathtaking,” “unparalleled” | Name the feature, place, result, or limitation. |
| Superficial analysis | a trailing “highlighting,” “showcasing,” or “underscoring” clause | Delete it or make it a supported claim. |
| Vague authority | “experts say,” “studies show,” “many believe” | Name and cite the source, own the view, or cut it. |
| Copula avoidance | “serves as,” “stands as,” “boasts” | Prefer “is,” “has,” or the actual action. |
| Negative parallelism | “not X but Y,” “Not X. Not Y. Just Z.” | State Y directly; keep only a concrete, necessary contrast. |
| Forced grouping | repeated threes or identical parallel lists | Use the number of items the material actually contains. |
| Rhetorical Q&A | “The result? Devastating.” | State the answer unless the reader would genuinely ask. |
| False suspense | “here's the kicker,” “the best part” | Deliver the information without ceremony. |
| Fake-candid opener | “Honestly?” “Here's the thing:” | Remove the staged pause and state the point. |
| Imaginary objection | “Some might argue,” followed by an objection nobody raised | Keep a real sourced objection; remove a drafting ghost. |
| Fake alternative | an option introduced only to reject it immediately | Explain the actual choice or constraint. |
| Colon reveal | “The key: it learns.” | Write a direct sentence. Keep colons for real lists, labels, and explanations. |
| False agency | decisions “emerge,” data “tells us,” markets “reward” without an actor | Name the responsible person, system, event, or mechanism. |
| Synonym cycling | the same subject renamed every sentence | Repeat the clearest term. |
| False range | “from X to Y” without a meaningful scale | Name the actual items or relationship. |
| Formulaic saying | “X is the currency/language/architecture of Y” | Describe the mechanism or consequence. |
| Diff-anchored prose | ordinary documentation narrates what an older version did | Describe the current behavior; keep change history in changelogs and migrations. |
| Prompt echo | “This article will explore...” | Begin with the subject. |
| Fractal summary | previews and recaps inside every section | Remove local scaffolding. |
| Generic uplift | conclusion recap, bright-future promise, or pep talk | End on the last earned fact or next action. |
| Hollow content | topical nouns arranged around no testable or paraphrasable claim | State the actual claim, mechanism, evidence, or decision; otherwise cut it. |
| Humanizer signature | every edit gains the same fragments, asides, contractions, blunt opener, or “honestly” beat | Use only features evidenced for this writer and channel. |

## Rhythm and sentence patterns

- Break uniform mid-length sentences and rectangular paragraphs only where the thought supports a different shape.
- Combine stacked fragments when their causal or qualifying relationship matters.
- Keep one short beat when it earns emphasis; remove repeated manufactured punchlines.
- Use active voice when the actor matters. Do not ban passive voice mechanically.
- Avoid stacked qualifiers. Keep the one hedge that represents actual uncertainty.
- Do not add run-ons, fragments, unusual synonyms, dropped punctuation, or typos merely to create variation.

## Vocabulary controls

Treat vocabulary as a context-sensitive warning. A technical term, quotation, title, or established voice can justify any word.

Exclude by default in ordinary prose: delve, leverage, underscore, harness, foster, utilize, facilitate, streamline, bolster, illuminate, showcase, embark, elevate, empower, unleash, optimize, garner, elucidate, transcend, reimagine, tapestry, realm, paradigm, synergy, testament, beacon, interplay, intricacies, kaleidoscope, myriad, plethora, pivotal, seamless, robust, vibrant, meticulous, transformative, groundbreaking, unparalleled, multifaceted, indelible, timeless.

Watch for clusters rather than isolated use: comprehensive, significant, essential, critical, dynamic, innovative, powerful, notable, vital, deep, explore, enhance, ensure, reveal, engage, insights, perspective, framework, strategy, opportunities, impactful, genuinely, truly, remarkably, resilience, sustainable.

Prefer the exact ordinary word or rewrite the sentence. Useful direct substitutions include:

| Inflated wording | Direct option |
|---|---|
| leverage / utilize | use |
| facilitate | help, run, make easier |
| streamline | simplify, cut steps |
| robust | solid, sturdy, or the failure it resists |
| seamless | smooth, painless, or what did not break |
| empower | let, enable, give access |
| optimize | tune, improve, reduce the named cost |
| transformative / game-changing | state what changed |
| myriad / plethora | the number, dozens, many |
| in conclusion / in summary | delete and end on the concrete point |

## Communication and formatting residue

Remove assistant scaffolding, question restatements, knowledge-cutoff boilerplate, reasoning narration, fake citations, tracking parameters, placeholders, and offers to continue. Match the destination: Markdown syntax in Markdown, plain text in email or form fields, restrained hashtags on social platforms, and headings only when they help navigation.

Formatting is not personality. Decorative bold labels, emoji bullets, hashtag stacks, excessive micro-headings, and repeated title-case sections usually need reduction. Preserve formatting required by the user, publication, accessibility needs, or house style.

## Channel checks

- **Email:** preserve the actual relationship, request, deadline, greeting, and sign-off. Direct does not mean abrupt.
- **Social:** respect character limits, platform syntax, mentions, and the writer’s demonstrated use of hashtags or line breaks. Do not manufacture engagement bait.
- **Documentation and technical prose:** preserve repeated terms, commands, literals, and stable current-state descriptions. Variation is not worth ambiguity.
- **Academic prose:** retain calibrated claims, field terminology, citations, and legitimate signposting. Do not simplify away method or limitation.
- **Marketing:** require evidence for comparisons, rankings, performance, adoption, and customer outcomes.
- **Fiction:** treat dialogue, repetition, metaphor, viewpoint, and genre conventions as authored choices rather than default lint findings.

## Stop condition

Stop editing when the piece is specific, supported, clear for its channel, and consistent with the strongest available voice evidence. A residual watched word, polished sentence, or uneven paragraph is not a reason to continue. Repeatedly applying the same “human” moves creates another template.

The machine-readable catalog used by `prose-lint` lives in `rules/patterns.json`. It intentionally covers only patterns that can be reported transparently and leaves contextual judgment to the editor.

## CLI rule map

These IDs keep automated findings tied to this contextual guidance:

| Rule ID | Review signal |
|---|---|
| `tier1-vocabulary` | Inflated vocabulary from the exclusion list |
| `significance-inflation` | Unsupported importance or legacy framing |
| `filler-phrase` | Removable setup that delays the claim |
| `copula-avoidance` | Inflated substitutes for is or has |
| `participial-tail` | Superficial trailing analysis |
| `negative-parallelism` | Formulaic rejected contrast |
| `rhetorical-question-answer` | Question immediately answered for effect |
| `false-suspense` | A drumroll before ordinary information |
| `fake-candid-opener` | Staged honesty or conversational pause |
| `imaginary-objection` | An undeveloped objection nobody raised |
| `fake-alternative` | A choice introduced only to reject it |
| `colon-reveal` | A dramatic label-and-reveal construction |
| `false-agency` | An action with the real actor hidden |
| `aphorism-formula` | A prefabricated metaphorical saying |
| `vague-attribution` | An unnamed source presented as authority |
| `hedge-stack` | Multiple qualifiers doing one job |
| `prompt-echo` | An announcement of what the text will do |
| `chatbot-artifact` | Assistant scaffolding left in the artifact |
| `knowledge-disclaimer` | Generic training or knowledge-limit boilerplate |
| `generic-ending` | Recap, uplift, or empty future promise |
| `decorative-formatting` | Formatting that adds ceremony, not navigation |
| `dash-cluster` | Repeated decorative dash framing |
