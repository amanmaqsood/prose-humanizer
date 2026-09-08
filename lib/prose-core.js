"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_CONFIG = Object.freeze({
  version: 1,
  language: "en",
  channel: "general",
  threshold: null,
  disabledRules: [],
  severityOverrides: {},
  exclude: [],
  generatedMarkers: {
    start: ["<!-- generated:start -->", "<!-- auto-generated:start -->"],
    end: ["<!-- generated:end -->", "<!-- auto-generated:end -->"],
  },
});

const CONFIG_KEYS = new Set(["$schema", ...Object.keys(DEFAULT_CONFIG)]);
const CHANNELS = new Set([
  "general", "documentation", "email", "social", "academic", "marketing",
  "fiction", "technical", "legal", "medical",
]);
const SEVERITIES = new Set(["info", "warning", "high"]);

function cloneDefaultConfig() {
  return {
    ...DEFAULT_CONFIG,
    disabledRules: [],
    severityOverrides: {},
    exclude: [],
    generatedMarkers: {
      start: [...DEFAULT_CONFIG.generatedMarkers.start],
      end: [...DEFAULT_CONFIG.generatedMarkers.end],
    },
  };
}

function loadConfig(configPath, rules) {
  const config = cloneDefaultConfig();
  if (!configPath) return config;
  const parsed = JSON.parse(fs.readFileSync(path.resolve(configPath), "utf8"));
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("configuration must be a JSON object");
  }
  for (const key of Object.keys(parsed)) {
    if (!CONFIG_KEYS.has(key)) throw new Error(`unknown configuration key: ${key}`);
  }
  if (parsed.version !== undefined && parsed.version !== 1) {
    throw new Error("configuration version must be 1");
  }
  if (parsed.language !== undefined && (
    typeof parsed.language !== "string" || !/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(parsed.language)
  )) throw new Error("language must be a BCP 47-style language tag");
  if (parsed.channel !== undefined && !CHANNELS.has(parsed.channel)) {
    throw new Error(`channel must be one of: ${[...CHANNELS].join(", ")}`);
  }
  if (parsed.threshold !== undefined && parsed.threshold !== null && (
    typeof parsed.threshold !== "number" || !Number.isFinite(parsed.threshold) || parsed.threshold < 0
  )) throw new Error("threshold must be null or a non-negative number");

  const ruleIds = new Set(rules.patterns.map((rule) => rule.id));
  if (parsed.disabledRules !== undefined) {
    if (!Array.isArray(parsed.disabledRules)
      || new Set(parsed.disabledRules).size !== parsed.disabledRules.length
      || parsed.disabledRules.some((id) => !ruleIds.has(id))) {
      throw new Error("disabledRules must contain known rule ids");
    }
  }
  if (parsed.severityOverrides !== undefined) {
    if (!parsed.severityOverrides || Array.isArray(parsed.severityOverrides) || typeof parsed.severityOverrides !== "object") {
      throw new Error("severityOverrides must be an object");
    }
    for (const [id, severity] of Object.entries(parsed.severityOverrides)) {
      if (!ruleIds.has(id) || !SEVERITIES.has(severity)) {
        throw new Error("severityOverrides must map known rule ids to info, warning, or high");
      }
    }
  }
  if (parsed.exclude !== undefined && (
    !Array.isArray(parsed.exclude)
    || new Set(parsed.exclude).size !== parsed.exclude.length
    || parsed.exclude.some((value) => typeof value !== "string" || !value)
  )) throw new Error("exclude must be an array of non-empty glob strings");
  if (parsed.generatedMarkers !== undefined) {
    const markers = parsed.generatedMarkers;
    const validMarkers = markers && !Array.isArray(markers) && typeof markers === "object"
      && Object.keys(markers).every((key) => key === "start" || key === "end")
      && ["start", "end"].every((key) => Array.isArray(markers[key])
        && markers[key].length > 0
        && markers[key].every((value) => typeof value === "string" && value));
    if (!validMarkers) throw new Error("generatedMarkers needs non-empty start and end string arrays");
  }
  return {
    ...config,
    ...parsed,
    disabledRules: [...(parsed.disabledRules || [])],
    severityOverrides: { ...(parsed.severityOverrides || {}) },
    exclude: [...(parsed.exclude || [])],
    generatedMarkers: parsed.generatedMarkers
      ? { start: [...parsed.generatedMarkers.start], end: [...parsed.generatedMarkers.end] }
      : config.generatedMarkers,
  };
}

function findConfig(target, explicitPath) {
  if (explicitPath) return path.resolve(explicitPath);
  const resolved = target && target !== "-" ? path.resolve(target) : process.cwd();
  const directory = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()
    ? resolved
    : path.dirname(resolved);
  const candidates = [path.join(directory, ".prose-humanizer.json")];
  if (directory !== process.cwd()) candidates.push(path.join(process.cwd(), ".prose-humanizer.json"));
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function lineRecords(text) {
  const records = [];
  const expression = /[^\r\n]*(?:\r\n|\n|\r|$)/g;
  let match;
  while ((match = expression.exec(text)) && match[0] !== "") {
    const raw = match[0];
    const content = raw.replace(/(?:\r\n|\n|\r)$/, "");
    records.push({ content, start: match.index, number: records.length + 1 });
  }
  if (text === "") records.push({ content: "", start: 0, number: 1 });
  return records;
}

function inlineProtectedRanges(line) {
  const ranges = [];
  const collect = (expression, mapper = (match) => [match.index, match.index + match[0].length]) => {
    let match;
    while ((match = expression.exec(line))) {
      ranges.push(mapper(match));
      if (match[0].length === 0) expression.lastIndex += 1;
    }
  };
  collect(/(`+)[^\n]*?\1/g);
  collect(/!?\[[^\]]*\]\([^\n)]*\)/g, (match) => {
    const open = match[0].lastIndexOf("(");
    return [match.index + open + 1, match.index + match[0].length - 1];
  });
  for (let start = line.indexOf("<"); start >= 0; start = line.indexOf("<", start + 1)) {
    if (!/[A-Za-z/!?]/.test(line[start + 1] || "")) continue;
    let quote = null;
    let braceDepth = 0;
    let escaped = false;
    for (let index = start + 1; index < line.length; index += 1) {
      const character = line[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (["\"", "'", "`"].includes(character)) quote = character;
      else if (character === "{") braceDepth += 1;
      else if (character === "}") braceDepth = Math.max(0, braceDepth - 1);
      else if (character === ">" && braceDepth === 0) {
        ranges.push([start, index + 1]);
        start = index;
        break;
      }
    }
  }
  collect(/https?:\/\/[^\s)>]+/g);
  ranges.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
  const merged = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

function quotationRanges(line, initialCloser = null) {
  const ranges = [];
  const closerFor = { '"': '"', "'": "'", "“": "”", "‘": "’" };
  let closer = initialCloser;
  let cursor = 0;
  if (closer) {
    const end = line.indexOf(closer);
    if (end < 0) return { ranges: [[0, line.length]], closer };
    ranges.push([0, end + 1]);
    cursor = end + 1;
    closer = null;
  }
  for (let index = cursor; index < line.length; index += 1) {
    const open = line[index];
    const expected = closerFor[open];
    if (!expected) continue;
    if ((open === '"' || open === "'") && index > 0 && !/[\s([{,:;-]/.test(line[index - 1])) continue;
    const end = line.indexOf(expected, index + 1);
    if (end < 0) {
      if (open === "'") continue;
      ranges.push([index, line.length]);
      closer = expected;
      break;
    }
    ranges.push([index, end + 1]);
    index = end;
  }
  return { ranges, closer };
}

function continueOpenTag(line, state = { quote: null, braceDepth: 0 }) {
  const next = { ...state };
  let escaped = false;
  for (const character of line) {
    if (next.quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === next.quote) next.quote = null;
      continue;
    }
    if (["\"", "'", "`"].includes(character)) {
      next.quote = character;
      continue;
    }
    if (character === "{") {
      next.braceDepth += 1;
      continue;
    }
    if (character === "}") {
      next.braceDepth = Math.max(0, next.braceDepth - 1);
      continue;
    }
    if (character === ">" && next.braceDepth === 0) return null;
  }
  return next;
}

function parseProseSegments(text, suppliedConfig = {}) {
  const config = { ...cloneDefaultConfig(), ...suppliedConfig };
  const records = lineRecords(text);
  const segments = [];
  let frontmatter = ["---", "+++"].includes(records[0]?.content.trim())
    ? records[0].content.trim()
    : null;
  let fence = null;
  let generated = false;
  let htmlBlock = null;
  let openTagState = null;
  let quoteCloser = null;

  for (const record of records) {
    const line = record.content;
    const trimmed = line.trim();
    if (frontmatter) {
      if (record.number > 1 && trimmed === frontmatter) frontmatter = null;
      continue;
    }
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = { character: fenceMatch[1][0], length: fenceMatch[1].length };
      else if (fenceMatch[1][0] === fence.character && fenceMatch[1].length >= fence.length) fence = null;
      continue;
    }
    if (fence) continue;
    if (config.generatedMarkers.start.some((marker) => line.includes(marker))) {
      generated = true;
      continue;
    }
    if (config.generatedMarkers.end.some((marker) => line.includes(marker))) {
      generated = false;
      continue;
    }
    if (generated) continue;
    if (openTagState) {
      openTagState = continueOpenTag(line, openTagState);
      continue;
    }
    if (/^\s*<[A-Za-z][\w.:-]*(?:\s|$)/.test(line)) {
      openTagState = continueOpenTag(line);
      if (openTagState) continue;
    }
    if (htmlBlock) {
      if (line.toLowerCase().includes(htmlBlock)) htmlBlock = null;
      continue;
    }
    const htmlOpen = trimmed.match(/^<(script|style|pre|code)(?:\s|>)/i);
    if (htmlOpen && !new RegExp(`</${htmlOpen[1]}>`, "i").test(trimmed)) {
      htmlBlock = `</${htmlOpen[1].toLowerCase()}>`;
      continue;
    }
    if (trimmed.startsWith("<!--")) {
      if (!trimmed.includes("-->")) htmlBlock = "-->";
      continue;
    }
    if (!trimmed || /^\s*>/.test(line) || /^ {4}\S/.test(line)
      || /^ {0,3}\[[^\]]+\]:\s*\S/.test(line)
      || ((line.match(/\|/g) || []).length >= 2)
      || (/^\s*<[^>]+>\s*$/.test(line))) continue;

    const quotation = quotationRanges(line, quoteCloser);
    quoteCloser = quotation.closer;
    const ranges = [...inlineProtectedRanges(line), ...quotation.ranges]
      .sort((left, right) => left[0] - right[0] || left[1] - right[1]);
    const mergedRanges = [];
    for (const range of ranges) {
      const previous = mergedRanges.at(-1);
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else mergedRanges.push([...range]);
    }
    let cursor = 0;
    for (const [start, end] of [...mergedRanges, [line.length, line.length]]) {
      if (start > cursor) {
        const value = line.slice(cursor, start);
        if (/\S/.test(value)) {
          segments.push({
            text: value,
            start: record.start + cursor,
            end: record.start + start,
            line: record.number,
            column: cursor + 1,
          });
        }
      }
      cursor = Math.max(cursor, end);
    }
  }
  return segments;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function expressionFor(rule, value) {
  const source = rule.kind === "word"
    ? `\\b${escapeRegex(value)}\\b`
    : rule.kind === "regex" ? value : escapeRegex(value);
  return new RegExp(source, "giu");
}

function defaultSeverity(rule) {
  if (rule.defaultSeverity) return rule.defaultSeverity;
  if (rule.weight >= 5) return "high";
  if (rule.weight >= 3) return "warning";
  return "info";
}

function analyzeText(text, rules, suppliedConfig = {}) {
  const config = { ...cloneDefaultConfig(), ...suppliedConfig };
  if (!config.language.toLowerCase().startsWith("en")) return [];
  const disabled = new Set(config.disabledRules || []);
  const findings = [];
  const seen = new Set();
  for (const segment of parseProseSegments(text, config)) {
    for (const rule of rules.patterns) {
      if (disabled.has(rule.id)) continue;
      for (const value of rule.values) {
        for (const match of segment.text.matchAll(expressionFor(rule, value))) {
          const start = segment.start + match.index;
          const end = start + match[0].length;
          const key = `${rule.id}:${start}:${end}`;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push({
            id: rule.id,
            label: rule.label,
            category: rule.category,
            severity: config.severityOverrides?.[rule.id] || defaultSeverity(rule),
            weight: rule.weight,
            line: segment.line,
            column: segment.column + match.index,
            start,
            end,
            match: match[0],
            suggestion: rule.suggestion,
          });
        }
      }
    }
  }
  return findings.sort((left, right) => left.start - right.start || right.weight - left.weight || left.id.localeCompare(right.id));
}

function words(text) {
  return text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];
}

function proseOnly(text, config = {}) {
  return parseProseSegments(text, config).map((segment) => segment.text).join("\n");
}

function overlapGroups(findings) {
  const groups = [];
  for (const finding of findings) {
    const previous = groups.at(-1);
    if (previous && finding.start < previous.end) {
      previous.end = Math.max(previous.end, finding.end);
      previous.findingIds.push(finding.id);
      previous.weights.push(finding.weight);
    } else {
      groups.push({
        start: finding.start,
        end: finding.end,
        findingIds: [finding.id],
        weights: [finding.weight],
      });
    }
  }
  return groups;
}

function buildReport(text, rules, config = {}) {
  const findings = analyzeText(text, rules, config);
  const prose = proseOnly(text, config);
  const wordCount = words(prose).length;
  const allGroups = overlapGroups(findings);
  const weightedSignal = allGroups.reduce((sum, group) => sum + Math.max(...group.weights), 0);
  const affectedCharacters = allGroups.reduce((sum, group) => sum + group.end - group.start, 0);
  return {
    tool: "prose-lint",
    kind: "prose-review",
    authorshipClaim: false,
    calibration: "uncalibrated-review-signal",
    language: config.language || "en",
    languageScope: "rules are English-only",
    channel: config.channel || "general",
    skippedReason: (config.language || "en").toLowerCase().startsWith("en")
      ? null
      : "Pattern analysis skipped because the configured language is not English.",
    metrics: {
      wordCount,
      findingCount: findings.length,
      weightedSignal,
      weightedDensityPer100Words: wordCount ? Number(((weightedSignal / wordCount) * 100).toFixed(2)) : 0,
      proseCharacters: prose.length,
      affectedCharacters,
      affectedCoveragePercent: prose.length
        ? Number(((affectedCharacters / prose.length) * 100).toFixed(2))
        : 0,
    },
    overlapGroups: allGroups
      .filter((group) => group.findingIds.length > 1)
      .map(({ weights, ...group }) => group),
    findings,
  };
}

function applyFixesToText(text, safeFixes) {
  let result = text;
  for (const fix of safeFixes) {
    const trimmed = fix.match.trim();
    const trailingSpace = /\s$/.test(fix.match);
    if (!fix.replacement) {
      const sentenceOpener = new RegExp(
        `(^|[.!?]\\s+)${escapeRegex(trimmed)}\\s+([a-z])`,
        "giu",
      );
      result = result.replace(sentenceOpener, (_, prefix, letter) => prefix + letter.toUpperCase());
    }
    const expression = new RegExp(
      `\\b${escapeRegex(trimmed)}\\b${trailingSpace ? "\\s*" : ""}`,
      "giu",
    );
    result = result.replace(expression, (matched) => {
      if (!fix.replacement) return "";
      return /^[A-Z]/.test(matched)
        ? fix.replacement[0].toUpperCase() + fix.replacement.slice(1)
        : fix.replacement;
    });
  }
  return result;
}

function applySafeFixes(text, safeFixes, config = {}) {
  if (!(config.language || "en").toLowerCase().startsWith("en")) return text;
  if (new Set(["legal", "medical"]).has(config.channel || "general")) return text;
  const segments = parseProseSegments(text, config);
  let result = text;
  for (const segment of [...segments].reverse()) {
    const fixed = applyFixesToText(segment.text, safeFixes);
    result = result.slice(0, segment.start) + fixed + result.slice(segment.end);
  }
  return result;
}

function statistics(text, config = {}) {
  const prose = proseOnly(text, config);
  const sentenceTexts = prose.split(/(?<=[.!?])\s+/).map((value) => value.trim()).filter(Boolean);
  const sentenceLengths = sentenceTexts.map((sentence) => words(sentence).length);
  const allWords = words(prose);
  const mean = sentenceLengths.length
    ? sentenceLengths.reduce((sum, value) => sum + value, 0) / sentenceLengths.length : 0;
  const variance = sentenceLengths.length
    ? sentenceLengths.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / sentenceLengths.length : 0;
  const trigrams = new Map();
  for (let index = 0; index <= allWords.length - 3; index += 1) {
    const trigram = allWords.slice(index, index + 3).join(" ");
    trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
  }
  const paragraphWordCounts = prose.split(/\r?\n\s*\r?\n/)
    .map((paragraph) => words(paragraph).length).filter((length) => length > 0);
  return {
    tool: "prose-lint",
    kind: "prose-statistics",
    authorshipClaim: false,
    wordCount: allWords.length,
    sentenceCount: sentenceLengths.length,
    sentenceLengths,
    minSentenceWords: sentenceLengths.length ? Math.min(...sentenceLengths) : 0,
    maxSentenceWords: sentenceLengths.length ? Math.max(...sentenceLengths) : 0,
    meanSentenceWords: Number(mean.toFixed(2)),
    sentenceLengthVariation: mean ? Number((Math.sqrt(variance) / mean).toFixed(3)) : 0,
    typeTokenRatio: allWords.length ? Number((new Set(allWords).size / allWords.length).toFixed(3)) : 0,
    repeatedTrigrams: [...trigrams.entries()].filter(([, count]) => count > 1)
      .map(([trigram, count]) => ({ trigram, count })),
    paragraphWordCounts,
  };
}

function feature(value, confidence, evidence) {
  return { value, confidence, evidence };
}

function buildVoiceProfile(samples, language = "en") {
  if (!Array.isArray(samples) || samples.length === 0) throw new Error("at least one deliberate voice sample is required");
  if (typeof language !== "string" || !/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(language)) {
    throw new Error("voice profile language must be a BCP 47-style language tag");
  }
  const validTypes = new Set(["typed", "dictated", "ai-edited", "translated", "collaborative", "unknown"]);
  if (samples.some((sample) => !sample || typeof sample.text !== "string" || !validTypes.has(sample.type || "unknown"))) {
    throw new Error("voice samples need text and a valid source type");
  }
  const sourceCount = samples.length;
  const evidenceWeights = {
    typed: { sentence: 1, paragraph: 1, lexical: 1, punctuation: 1 },
    dictated: { sentence: 1, paragraph: 0.4, lexical: 0.85, punctuation: 0.2 },
    collaborative: { sentence: 0.6, paragraph: 0.6, lexical: 0.6, punctuation: 0.6 },
    translated: { sentence: 0.5, paragraph: 0.5, lexical: 0.25, punctuation: 0.6 },
    unknown: { sentence: 0.65, paragraph: 0.65, lexical: 0.65, punctuation: 0.65 },
    "ai-edited": { sentence: 0.25, paragraph: 0.25, lexical: 0.35, punctuation: 0.2 },
  };
  const rows = samples.map((sample) => {
    const type = sample.type || "unknown";
    const stats = statistics(sample.text);
    return {
      sample,
      type,
      weights: evidenceWeights[type],
      stats,
      words: words(sample.text),
      paragraphs: stats.paragraphWordCounts,
      contractions: (sample.text.match(/\b\p{L}+[’']\p{L}+\b/gu) || []).length,
      firstPerson: (sample.text.match(/\b(?:I|me|my|mine|we|us|our|ours)\b/gi) || []).length,
      questions: (sample.text.match(/\?/g) || []).length,
      exclamations: (sample.text.match(/!/g) || []).length,
    };
  });
  const weightedSum = (group, value) => rows.reduce(
    (sum, row) => sum + (value(row) * row.weights[group]), 0,
  );
  const effectiveWords = weightedSum("lexical", (row) => row.words.length);
  const effectiveSentences = weightedSum("sentence", (row) => row.stats.sentenceCount);
  const effectivePunctuationSentences = weightedSum("punctuation", (row) => row.stats.sentenceCount);
  const effectiveParagraphs = weightedSum("paragraph", (row) => row.paragraphs.length);
  const confidenceFor = (units, medium, high) => sourceCount >= 3 && units >= high
    ? "high" : sourceCount >= 2 && units >= medium ? "medium" : "low";
  const wordConfidence = confidenceFor(effectiveWords, 100, 500);
  const sentenceConfidence = confidenceFor(effectiveSentences, 10, 30);
  const paragraphConfidence = confidenceFor(effectiveParagraphs, 3, 10);
  const evidence = (units, label) => `${sourceCount} sample(s); ${Number(units.toFixed(1))} weighted ${label}`;
  const sentenceMean = effectiveSentences ? weightedSum("sentence", (row) => (
    row.stats.sentenceLengths.reduce((sum, length) => sum + length, 0)
  )) / effectiveSentences : 0;
  const sentenceVariance = effectiveSentences ? weightedSum("sentence", (row) => (
    row.stats.sentenceLengths.reduce((sum, length) => sum + ((length - sentenceMean) ** 2), 0)
  )) / effectiveSentences : 0;
  const paragraphMean = effectiveParagraphs ? weightedSum("paragraph", (row) => (
    row.paragraphs.reduce((sum, length) => sum + length, 0)
  )) / effectiveParagraphs : 0;
  const wordRate = (value) => effectiveWords ? (weightedSum("lexical", value) / effectiveWords) * 100 : 0;
  const punctuationRate = (value) => effectivePunctuationSentences
    ? weightedSum("punctuation", value) / effectivePunctuationSentences : 0;
  const lexicalFeatures = language.toLowerCase().startsWith("en") ? {
    contractionRatePer100Words: feature(
      Number(wordRate((row) => row.contractions).toFixed(2)), wordConfidence, evidence(effectiveWords, "word(s)"),
    ),
    firstPersonRatePer100Words: feature(
      Number(wordRate((row) => row.firstPerson).toFixed(2)), wordConfidence, evidence(effectiveWords, "word(s)"),
    ),
  } : {};
  return {
    version: 1,
    kind: "voice-profile",
    language,
    rawProseStored: false,
    learningPolicy: "user-confirmed",
    sources: rows.map((row) => ({
      name: path.basename(row.sample.name || "sample"),
      type: row.type,
      evidenceWeights: row.weights,
      sha256: crypto.createHash("sha256").update(row.sample.text, "utf8").digest("hex"),
      wordCount: row.words.length,
    })),
    features: {
      sentenceLengthMean: feature(Number(sentenceMean.toFixed(2)), sentenceConfidence, evidence(effectiveSentences, "sentence(s)")),
      sentenceLengthVariation: feature(
        sentenceMean ? Number((Math.sqrt(sentenceVariance) / sentenceMean).toFixed(3)) : 0,
        sentenceConfidence,
        evidence(effectiveSentences, "sentence(s)"),
      ),
      paragraphWordsMean: feature(Number(paragraphMean.toFixed(2)), paragraphConfidence, evidence(effectiveParagraphs, "paragraph(s)")),
      typeTokenRatio: feature(
        effectiveWords ? Number((weightedSum("lexical", (row) => row.stats.typeTokenRatio * row.words.length) / effectiveWords).toFixed(3)) : 0,
        wordConfidence,
        evidence(effectiveWords, "word(s)"),
      ),
      ...lexicalFeatures,
      questionRatePerSentence: feature(
        Number(punctuationRate((row) => row.questions).toFixed(3)),
        confidenceFor(effectivePunctuationSentences, 10, 30),
        evidence(effectivePunctuationSentences, "punctuation sentence(s)"),
      ),
      exclamationRatePerSentence: feature(
        Number(punctuationRate((row) => row.exclamations).toFixed(3)),
        confidenceFor(effectivePunctuationSentences, 10, 30),
        evidence(effectivePunctuationSentences, "punctuation sentence(s)"),
      ),
    },
  };
}

function globToRegExp(glob) {
  let source = "";
  for (let index = 0; index < glob.length; index += 1) {
    const character = glob[index];
    if (character === "*" && glob[index + 1] === "*") {
      if (glob[index + 2] === "/") {
        source += "(?:.*/)?";
        index += 2;
      } else {
        source += ".*";
        index += 1;
      }
    } else if (character === "*") source += "[^/]*";
    else if (character === "?") source += "[^/]";
    else source += escapeRegex(character);
  }
  return new RegExp(`^${source}$`, "i");
}

function matchesAnyGlob(relativePath, globs) {
  const normalized = relativePath.split(path.sep).join("/");
  return globs.some((glob) => globToRegExp(glob).test(normalized));
}

module.exports = {
  analyzeText,
  applySafeFixes,
  buildReport,
  buildVoiceProfile,
  findConfig,
  loadConfig,
  matchesAnyGlob,
  parseProseSegments,
  proseOnly,
  statistics,
  words,
};
