#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  applySafeFixes,
  buildReport,
  buildVoiceProfile,
  findConfig,
  loadConfig,
  matchesAnyGlob,
  statistics,
} = require("../lib/prose-core");

const root = path.resolve(__dirname, "..");
const rules = JSON.parse(fs.readFileSync(path.join(root, "rules", "patterns.json"), "utf8"));
const packageMetadata = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const HELP = `prose-lint ${packageMetadata.version}

Explainable English prose review. This is not an authorship detector.

Usage:
  prose-lint report <file|-> [--json] [--config path] [--fail-above number]
  prose-lint report - --stdin-path path [--json]  Resolve config for staged or piped content
  prose-lint analyze <file|-> [--json] [--config path]
  prose-lint fix <file|-> [--write] [--config path]
  prose-lint stats <file|-> [--json] [--config path]
  prose-lint scan <directory> [--json] [--config path] [--fail-above number]
  prose-lint profile <file...> [--json] [--language tag] [--sample-type type | --sample-types type,...]
  prose-lint score <file|-> [--json] [--fail-above number]  Deprecated

Commands:
  report   Report exact findings, overlap, coverage, and uncalibrated weighted density.
  analyze  List every named finding with an exact line, column, and span.
  fix      Apply only declared mechanical substitutions to editable prose spans.
  stats    Report sentence, paragraph, vocabulary, and repetition measurements.
  scan     Rank configured prose files and optionally enforce a project threshold.
  profile  Build a hash-only, feature-level voice profile from deliberate samples.
  score    Compatibility interface for v3; use report for new integrations.
`;

const VALUE_FLAGS = new Set(["--fail-above", "--config", "--sample-type", "--sample-types", "--stdin-path", "--language"]);

function decodeUtf8(buffer) {
  const hasBom = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  const body = hasBom ? buffer.subarray(3) : buffer;
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    throw new Error("input is not valid UTF-8; no changes were made");
  }
  return { text, hasBom };
}

function readInput(target) {
  const buffer = !target || target === "-" ? fs.readFileSync(0) : fs.readFileSync(path.resolve(target));
  return decodeUtf8(buffer);
}

function optionValue(argv, name) {
  const index = argv.indexOf(name);
  if (index < 0) return null;
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

function positionalValues(argv) {
  const values = [];
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (VALUE_FLAGS.has(argument)) {
      index += 1;
      continue;
    }
    if (argument === "-" || !argument.startsWith("-")) values.push(argument);
  }
  return values;
}

function thresholdOverride(argv) {
  const raw = optionValue(argv, "--fail-above");
  if (raw === null) return null;
  const threshold = Number(raw);
  if (!Number.isFinite(threshold) || threshold < 0) {
    throw new Error("--fail-above must be a non-negative number");
  }
  return threshold;
}

function resolveConfig(target, argv) {
  const configPath = findConfig(target, optionValue(argv, "--config"));
  return { config: loadConfig(configPath, rules), configPath };
}

function effectiveTarget(target, argv) {
  const stdinPath = optionValue(argv, "--stdin-path");
  if (stdinPath && target !== "-") throw new Error("--stdin-path can be used only with stdin");
  return stdinPath || target;
}

function targetIsExcluded(target, config, configPath) {
  if (!target || target === "-" || !config.exclude.length) return false;
  const base = configPath ? path.dirname(configPath) : process.cwd();
  const relative = path.relative(base, path.resolve(target));
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
  return matchesAnyGlob(relative, config.exclude);
}

function compatibilityScore(report) {
  const score = Math.round(Math.min(100, report.metrics.weightedDensityPer100Words * 6));
  const wordCount = report.metrics.wordCount;
  return {
    tool: "prose-lint",
    kind: "pattern-density",
    authorshipClaim: false,
    deprecated: true,
    warning: "This 0-100 score is an uncalibrated compatibility metric. Use report instead.",
    score,
    confidence: wordCount < 80 ? "low" : wordCount < 250 ? "medium" : "high",
    wordCount,
    weightedFindings: report.metrics.weightedSignal,
    findingCount: report.metrics.findingCount,
  };
}

function printFindings(findings) {
  if (findings.length === 0) {
    process.stdout.write("No configured English prose patterns found.\n");
    return;
  }
  for (const finding of findings) {
    process.stdout.write(
      `line ${finding.line}, column ${finding.column}: ${finding.label} (${finding.match}) - ${finding.suggestion}\n`,
    );
  }
}

function proseFiles(directory, config) {
  const extensions = new Set([".md", ".mdx", ".txt", ".rst"]);
  const ignoredDirectories = new Set([".git", "node_modules", "dist", "coverage"]);
  const files = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relative = path.relative(directory, fullPath).split(path.sep).join("/");
      if (matchesAnyGlob(relative, config.exclude)) continue;
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
    }
  }
  visit(directory);
  return files;
}

function runScan(target, argv, json) {
  const absolute = path.resolve(target);
  const { config, configPath } = resolveConfig(absolute, argv);
  const override = thresholdOverride(argv);
  const threshold = override ?? config.threshold;
  const thresholdSource = override !== null ? "command-line" : config.threshold !== null ? "config" : null;
  const files = proseFiles(absolute, config).map((file) => {
    const report = buildReport(fs.readFileSync(file, "utf8"), rules, config);
    return {
      path: path.relative(absolute, file).split(path.sep).join("/"),
      weightedDensityPer100Words: report.metrics.weightedDensityPer100Words,
      weightedSignal: report.metrics.weightedSignal,
      wordCount: report.metrics.wordCount,
      findingCount: report.metrics.findingCount,
    };
  });
  files.sort((left, right) => right.weightedDensityPer100Words - left.weightedDensityPer100Words
    || left.path.localeCompare(right.path));
  const maximum = files.length ? files[0].weightedDensityPer100Words : 0;
  const thresholdExceeded = threshold !== null && maximum > threshold;
  const report = {
    tool: "prose-lint",
    kind: "repository-review",
    authorshipClaim: false,
    calibration: "uncalibrated-review-signal",
    root: absolute,
    configPath,
    threshold,
    thresholdSource,
    thresholdExceeded,
    files,
  };
  if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else for (const file of files) {
    process.stdout.write(`${String(file.weightedDensityPer100Words).padStart(7)}  ${file.path}\n`);
  }
  return thresholdExceeded ? 1 : 0;
}

function runProfile(files, argv, json) {
  if (files.length === 0) throw new Error("profile requires at least one deliberate sample file");
  const validTypes = new Set(["typed", "dictated", "ai-edited", "translated", "collaborative", "unknown"]);
  const uniformType = optionValue(argv, "--sample-type");
  const listedTypes = optionValue(argv, "--sample-types")?.split(",").map((value) => value.trim());
  if (uniformType && listedTypes) throw new Error("use --sample-type or --sample-types, not both");
  if (listedTypes && listedTypes.length !== files.length) {
    throw new Error("--sample-types must contain one comma-separated type per file");
  }
  const types = listedTypes || files.map(() => uniformType || "unknown");
  if (types.some((type) => !validTypes.has(type))) {
    throw new Error("sample types: typed, dictated, ai-edited, translated, collaborative, or unknown");
  }
  const language = optionValue(argv, "--language") || "en";
  const profile = buildVoiceProfile(files.map((file, index) => ({
    name: file,
    type: types[index],
    text: readInput(file).text,
  })), language);
  if (json) process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
  else {
    process.stdout.write(`Voice profile: ${profile.sources.length} source(s), raw prose stored: no\n`);
    for (const [name, value] of Object.entries(profile.features)) {
      process.stdout.write(`${name}: ${value.value} (${value.confidence} confidence)\n`);
    }
  }
  return 0;
}

function runSingle(command, target, argv, json) {
  const configTarget = effectiveTarget(target, argv);
  const { config, configPath } = resolveConfig(configTarget, argv);
  const input = readInput(target);
  const text = input.text;
  if (targetIsExcluded(configTarget, config, configPath)) {
    const skipped = {
      tool: "prose-lint", kind: "skipped", authorshipClaim: false,
      path: path.resolve(configTarget), configPath, skippedReason: "path is excluded by project configuration",
    };
    if (command === "fix" && !argv.includes("--write")) process.stdout.write(text);
    else if (json) process.stdout.write(`${JSON.stringify(skipped, null, 2)}\n`);
    else process.stdout.write(`Skipped ${configTarget}: excluded by project configuration\n`);
    return 0;
  }
  if (command === "fix") {
    const fixed = applySafeFixes(text, rules.safeFixes, config);
    if (argv.includes("--write")) {
      if (target === "-") throw new Error("--write requires a file path");
      const encoded = Buffer.from(fixed, "utf8");
      fs.writeFileSync(
        path.resolve(target),
        input.hasBom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), encoded]) : encoded,
      );
      process.stdout.write(`Updated ${target}\n`);
    } else process.stdout.write(fixed);
    return 0;
  }
  if (command === "stats") {
    const report = statistics(text, config);
    if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else process.stdout.write(
      `Words: ${report.wordCount}; sentences: ${report.sentenceCount}; sentence-length variation: ${report.sentenceLengthVariation}; repeated trigrams: ${report.repeatedTrigrams.length}\n`,
    );
    return 0;
  }
  if (command === "analyze") {
    const analysis = buildReport(text, rules, config);
    const findings = analysis.findings;
    if (json) process.stdout.write(`${JSON.stringify({
      tool: "prose-lint", kind: "pattern-lint", authorshipClaim: false, configPath,
      language: analysis.language, skippedReason: analysis.skippedReason, findings,
    }, null, 2)}\n`);
    else if (analysis.skippedReason) process.stdout.write(`${analysis.skippedReason}\n`);
    else printFindings(findings);
    return 0;
  }
  const report = buildReport(text, rules, config);
  report.configPath = configPath;
  const override = thresholdOverride(argv);
  const threshold = override ?? config.threshold;
  report.threshold = threshold;
  report.thresholdSource = override !== null ? "command-line" : config.threshold !== null ? "config" : null;
  report.thresholdExceeded = threshold !== null && report.metrics.weightedDensityPer100Words > threshold;
  if (command === "score") {
    const legacy = compatibilityScore(report);
    legacy.threshold = threshold;
    legacy.thresholdExceeded = threshold !== null && legacy.score > threshold;
    if (json) process.stdout.write(`${JSON.stringify(legacy, null, 2)}\n`);
    else process.stdout.write(
      `Deprecated uncalibrated score: ${legacy.score}/100 (${legacy.confidence} sample-size label; not an authorship determination). Use prose-lint report.\n`,
    );
    return legacy.thresholdExceeded ? 1 : 0;
  }
  if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    process.stdout.write(
      `Weighted density: ${report.metrics.weightedDensityPer100Words} per 100 words (uncalibrated review signal; not authorship)\n`,
    );
    printFindings(report.findings);
  }
  return report.thresholdExceeded ? 1 : 0;
}

function main(argv) {
  const command = argv[0];
  if (["--help", "-h", "help"].includes(command)) {
    process.stdout.write(HELP);
    return 0;
  }
  if (["--version", "-v"].includes(command)) {
    process.stdout.write(`${packageMetadata.version}\n`);
    return 0;
  }
  const commands = new Set(["report", "analyze", "score", "fix", "stats", "scan", "profile"]);
  if (!commands.has(command)) {
    process.stderr.write("Usage: prose-lint <report|analyze|fix|stats|scan|profile|score> [input] [options]\n");
    return 2;
  }
  const json = argv.includes("--json");
  const values = positionalValues(argv);
  if (command === "profile") return runProfile(values, argv, json);
  const target = values[0] || "-";
  if (command === "scan") return runScan(target, argv, json);
  return runSingle(command, target, argv, json);
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`prose-lint: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 2;
}
