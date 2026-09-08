# Research basis and limits

This file records evidence that materially changes Prose Humanizer’s design. It is not a claim that a prompt or linter can prove authorship, semantic equivalence, or universal writing quality.

## Detector scores are excluded from the objective

- OpenAI withdrew its text classifier because of low accuracy. Its published evaluation found 26% of AI-written text correctly identified and 9% of human-written text incorrectly labeled as AI-written. [OpenAI, “New AI classifier for indicating AI-written text,” updated July 20, 2023](https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/).
- Detection methods are vulnerable to paraphrasing and distribution shifts. [Sadasivan et al., TMLR 2025](https://openreview.net/forum?id=00gsAZdF0t).
- Detector error can disproportionately affect non-native English writers. [Liang et al., Patterns 2023](https://doi.org/10.1016/j.patter.2023.100779).

Design consequence: improve observable prose quality, preserve identity and evidence, and never optimize for or promise detector evasion.

## Fidelity is a hard gate

- A study of commercial text “humanizers” found frequent meaning distortion, poor prose, and hallucinated material, although its small evaluation set and detector-vendor affiliation limit generalization. [Masrour et al., GenAIDetect 2025](https://aclanthology.org/2025.genaidetect-1.9/).
- Factual-consistency research finds complementary value in proposition-oriented entailment and question-answering checks rather than surface similarity alone. [Honovich et al., NAACL 2022](https://aclanthology.org/2022.naacl-main.287/).

Design consequence: extract claims, literals, modality, attribution, chronology, and causality before editing; compare them again after editing; treat an unsupported addition as failure.

## Voice is multidimensional and content can leak into style measures

- Style factors co-vary, so adjusting one dimension without context can produce an inappropriate combination. [Kang and Hovy, ACL 2021](https://aclanthology.org/2021.acl-long.185/).
- Style representations can encode topic or content; controlled comparisons are needed to separate them. [Patel et al., NAACL 2025](https://aclanthology.org/2025.naacl-long.436/).

Design consequence: profile features independently, use samples from different topics, record source provenance, and prohibit sample-fact and phrase leakage.

## Evaluation needs separate axes and blinded comparisons

- Text style transfer has measurable tradeoffs among transfer strength, content preservation, and naturalness. One combined score can hide failure. [Mir et al., NAACL 2019](https://aclanthology.org/N19-1049/).
- Editing results and metrics vary by task, model, and prompt. [Dwivedi-Yu et al., CoNLL 2024](https://aclanthology.org/2024.conll-1.7/).
- Pairwise model judges can exhibit position bias, so candidate order should be swapped or randomized and calibrated against humans. [Li et al., EMNLP 2024](https://aclanthology.org/2024.emnlp-main.621/).

Design consequence: gate fidelity first, then assess voice fit, naturalness, and clarity separately. Blind candidate identity, randomize order, use multiple judges or raters, and state when human preference has not been measured.

## Skill-design guidance

Current provider guidance favors concise routing, explicit preservation requirements, progressive disclosure, realistic evaluation, and observed-use iteration. See [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.5) and [Anthropic skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

## Evidence status

The deterministic benchmark in `evals/benchmark.json` tests explicit invariants on synthetic fixtures. It cannot judge authorship or replace human evaluation. `scripts/prepare_pairwise.js` creates randomized ballots for independent ratings. Published quality claims must identify the evaluated models, fixtures, dates, axes, raters, and unresolved limitations.
