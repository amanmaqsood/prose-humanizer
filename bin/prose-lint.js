#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const rules = JSON.parse(
  fs.readFileSync(path.join(root, "rules", "patterns.json"), "utf8"),
);
const packageMetadata = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

const HELP = `prose-lint ${packageMetadata.version}

Explainable prose-pattern linting. This is not an authorship detector.

Usage:
  prose-lint analyze <file|-> [--json]
  prose-lint score <file|-> [--json] [--fail-above 0-100]
  prose-lint fix <file|-> [--write]
  prose-lint stats <file|-> [--json]
  prose-lint scan <directory> [--json] [--fail-above 0-100]

Commands:
  analyze  Report named patterns with line numbers and suggested edits.
  score    Summarize configured pattern density on a 0-100 lint scale.
  fix      Apply only declared meaning-preserving substitutions.
  stats    Report sentence, paragraph, vocabulary, and repetition measurements.
  scan     Rank prose files and optionally enforce a CI lint threshold.
`;

function readInput(target) {
  if (!target || target === "-") {
    return fs.readFileSync(0, "utf8");
  }
  return fs.readFileSync(path.resolve(target), "utf8");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findingsForLine(line, lineNumber) {
  const findings = [];
  for (const pattern of rules.patterns) {
    for (const value of pattern.values) {
      const source = pattern.kind === "word"
        ? `\\b${escapeRegex(value)}\\b`
        : pattern.kind === "regex"
          ? value
          : escapeRegex(value);
      const matched = line.match(new RegExp(source, "i"));
      if (matched) {
        findings.push({
          id: pattern.id,
          label: pattern.label,
          category: pattern.category,
          weight: pattern.weight,
          line: lineNumber,
          match: matched[0],
          suggestion: pattern.suggestion,
        });
      }
    }
  }
  return findings;
}

function proseLines(text) {
  const lines = text.split(/\r?\n/);
  let inFence = false;
  let inFrontmatter = lines[0]?.trim() === "---";
  return lines.flatMap((line, index) => {
    const trimmed = line.trim();
    if (index === 0 && inFrontmatter) return [];
    if (inFrontmatter) {
      if (trimmed === "---") inFrontmatter = false;
      return [];
    }
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      return [];
    }
    if (inFence || trimmed.startsWith(">")) return [];
    const prose = line
      .replace(/`[^`]*`/g, "")
      .replace(/\]\([^)]+\)/g, "]");
    return [{ text: prose, line: index + 1 }];
  });
}

function analyze(text) {
  return proseLines(text).flatMap((entry) => findingsForLine(entry.text, entry.line));
}

function proseOnly(text) {
  return proseLines(text).map((entry) => entry.text).join("\n");
}

function printAnalysis(findings) {
  if (findings.length === 0) {
    process.stdout.write("No configured prose patterns found.\n");
    return;
  }
  for (const finding of findings) {
    process.stdout.write(
      `line ${finding.line}: ${finding.label} (${finding.match}) - ${finding.suggestion}\n`,
    );
  }
}

function score(text) {
  const findings = analyze(text);
  const wordCount = words(proseOnly(text)).length;
  const weightedFindings = findings.reduce((sum, finding) => sum + finding.weight, 0);
  const density = wordCount === 0 ? 0 : (weightedFindings / wordCount) * 100;
  return {
    tool: "prose-lint",
    kind: "pattern-density",
    authorshipClaim: false,
    score: Math.round(Math.min(100, density * 6)),
    confidence: wordCount < 80 ? "low" : wordCount < 250 ? "medium" : "high",
    wordCount,
    weightedFindings,
    findingCount: findings.length,
  };
}

function applyFixesToSegment(text) {
  let result = text;
  for (const fix of rules.safeFixes) {
    if (!fix.replacement) {
      const sentenceOpener = new RegExp(
        `(^|[.!?]\\s+)${escapeRegex(fix.match)}([a-z])`,
        "gi",
      );
      result = result.replace(
        sentenceOpener,
        (_, prefix, nextLetter) => prefix + nextLetter.toUpperCase(),
      );
    }
    const expression = new RegExp(escapeRegex(fix.match), "gi");
    result = result.replace(expression, (matched) => {
      if (!fix.replacement) return "";
      return /^[A-Z]/.test(matched)
        ? fix.replacement[0].toUpperCase() + fix.replacement.slice(1)
        : fix.replacement;
    });
  }
  return result;
}

function applySafeFixes(text) {
  const parts = text.split(/(\r\n|\n|\r)/);
  let inFence = false;
  let inFrontmatter = parts[0]?.trim() === "---";

  for (let index = 0, lineNumber = 0; index < parts.length; index += 2, lineNumber += 1) {
    const line = parts[index];
    const trimmed = line.trim();
    if (lineNumber === 0 && inFrontmatter) continue;
    if (inFrontmatter) {
      if (trimmed === "---") inFrontmatter = false;
      continue;
    }
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || trimmed.startsWith(">")) continue;

    parts[index] = line
      .split(/(`[^`]*`)/g)
      .map((segment, segmentIndex) => (
        segmentIndex % 2 === 0 ? applyFixesToSegment(segment) : segment
      ))
      .join("");
  }

  return parts.join("");
}

function words(text) {
  return (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []);
}

function statistics(text) {
  const prose = proseOnly(text);
  const sentenceTexts = prose
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const sentenceLengths = sentenceTexts.map((sentence) => words(sentence).length);
  const allWords = words(prose);
  const mean = sentenceLengths.length
    ? sentenceLengths.reduce((sum, length) => sum + length, 0) / sentenceLengths.length
    : 0;
  const variance = sentenceLengths.length
    ? sentenceLengths.reduce((sum, length) => sum + ((length - mean) ** 2), 0) / sentenceLengths.length
    : 0;
  const trigrams = new Map();
  for (let index = 0; index <= allWords.length - 3; index += 1) {
    const trigram = allWords.slice(index, index + 3).join(" ");
    trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
  }
  const repeatedTrigrams = [...trigrams.entries()]
    .filter(([, count]) => count > 1)
    .map(([trigram, count]) => ({ trigram, count }));
  const paragraphWordCounts = prose
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => words(paragraph).length)
    .filter((length) => length > 0);

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
    typeTokenRatio: allWords.length
      ? Number((new Set(allWords).size / allWords.length).toFixed(3))
      : 0,
    repeatedTrigrams,
    paragraphWordCounts,
  };
}

function proseFiles(directory) {
  const extensions = new Set([".md", ".mdx", ".txt", ".rst"]);
  const ignoredDirectories = new Set([".git", "node_modules", "dist", "coverage"]);
  const files = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }
  visit(directory);
  return files;
}

function scan(directory) {
  const absolute = path.resolve(directory);
  const files = proseFiles(absolute).map((file) => {
    const report = score(fs.readFileSync(file, "utf8"));
    return {
      path: path.relative(absolute, file).split(path.sep).join("/"),
      score: report.score,
      confidence: report.confidence,
      wordCount: report.wordCount,
      findingCount: report.findingCount,
    };
  });
  files.sort((left, right) => right.score - left.score || left.path.localeCompare(right.path));
  return files;
}

function positionalTarget(argv) {
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--fail-above") {
      index += 1;
      continue;
    }
    if (argument === "-" || !argument.startsWith("-")) return argument;
  }
  return "-";
}

function thresholdValue(argv) {
  const index = argv.indexOf("--fail-above");
  if (index < 0) return null;
  const raw = argv[index + 1];
  const threshold = raw === undefined ? Number.NaN : Number(raw);
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
    throw new Error("--fail-above must be a number from 0 to 100");
  }
  return threshold;
}

function main(argv) {
  const command = argv[0];
  const target = positionalTarget(argv);
  if (command === "--help" || command === "-h" || command === "help") {
    process.stdout.write(HELP);
    return 0;
  }
  if (command === "--version" || command === "-v") {
    process.stdout.write(`${packageMetadata.version}\n`);
    return 0;
  }
  const json = argv.includes("--json");
  if (!new Set(["analyze", "score", "fix", "stats", "scan"]).has(command)) {
    process.stderr.write("Usage: prose-lint <analyze|score|fix|stats|scan> [file|directory|-] [--json]\n");
    return 2;
  }
  if (command === "scan") {
    const threshold = thresholdValue(argv);
    const files = scan(target);
    const maxScore = files.length ? files[0].score : 0;
    const thresholdExceeded = threshold !== null && maxScore > threshold;
    const report = {
      tool: "prose-lint",
      kind: "repository-scan",
      authorshipClaim: false,
      root: path.resolve(target),
      threshold,
      thresholdExceeded,
      files,
    };
    if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else {
      for (const file of files) {
        process.stdout.write(`${String(file.score).padStart(3)}  ${file.path}\n`);
      }
    }
    return thresholdExceeded ? 1 : 0;
  }
  const text = readInput(target);
  if (command === "fix") {
    const fixed = applySafeFixes(text);
    if (argv.includes("--write")) {
      if (!target || target === "-") {
        process.stderr.write("--write requires a file path\n");
        return 2;
      }
      fs.writeFileSync(path.resolve(target), fixed, "utf8");
      process.stdout.write(`Updated ${target}\n`);
    } else {
      process.stdout.write(fixed);
    }
    return 0;
  }
  if (command === "stats") {
    const report = statistics(text);
    if (json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      process.stdout.write(
        `Words: ${report.wordCount}; sentences: ${report.sentenceCount}; sentence-length variation: ${report.sentenceLengthVariation}; repeated trigrams: ${report.repeatedTrigrams.length}\n`,
      );
    }
    return 0;
  }
  if (command === "score") {
    const report = score(text);
    const threshold = thresholdValue(argv);
    report.threshold = threshold;
    report.thresholdExceeded = threshold !== null && report.score > threshold;
    if (json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      process.stdout.write(
        `Pattern-density score: ${report.score}/100 (${report.confidence} confidence; not an authorship determination)\n`,
      );
    }
    return report.thresholdExceeded ? 1 : 0;
  }
  const findings = analyze(text);
  if (json) {
    process.stdout.write(`${JSON.stringify({
      tool: "prose-lint",
      kind: "pattern-lint",
      authorshipClaim: false,
      findings,
    }, null, 2)}\n`);
  } else {
    printAnalysis(findings);
  }
  return 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`prose-lint: ${message}\n`);
  process.exitCode = 2;
}
