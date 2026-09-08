const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const rules = JSON.parse(fs.readFileSync(path.join(root, "rules", "patterns.json"), "utf8"));
const {
  analyzeText,
  applySafeFixes,
  buildReport,
  buildVoiceProfile,
  loadConfig,
  matchesAnyGlob,
  parseProseSegments,
} = require("../lib/prose-core");

test("Markdown parser exposes prose and protects structural content", () => {
  const source = [
    "+++",
    "title = \"A pivotal title\"",
    "+++",
    "Visible pivotal prose with [a pivotal label](https://example.com/pivotal).",
    "| pivotal | data |",
    "|---|---|",
    "| 43 | pivotal |",
    "<Component pivotal=\"true\" />",
    "<!-- generated:start -->",
    "pivotal generated prose",
    "<!-- generated:end -->",
    "A `pivotal` code word and pivotal prose.",
    "[ref]: https://example.com/pivotal",
  ].join("\n");

  const segments = parseProseSegments(source, {});
  const prose = segments.map((segment) => segment.text).join(" ");

  assert.match(prose, /Visible pivotal prose/);
  assert.match(prose, /a pivotal label/);
  assert.match(prose, /and pivotal prose/);
  assert.doesNotMatch(prose, /pivotal title/);
  assert.doesNotMatch(prose, /pivotal generated/);
  assert.doesNotMatch(prose, /example\.com/);
  assert.doesNotMatch(prose, /pivotal code word/);
  assert.doesNotMatch(prose, /43/);
});

test("analysis reports every occurrence with exact positions and overlaps", () => {
  const source = "Pivotal work is pivotal. It serves as a testament to progress.";
  const findings = analyzeText(source, rules, {});
  const pivotal = findings.filter((finding) => finding.match.toLowerCase() === "pivotal");

  assert.equal(pivotal.length, 2);
  assert.ok(pivotal.every((finding) => finding.severity === "info"));
  assert.deepEqual(pivotal.map((finding) => finding.column), [1, 17]);
  assert.ok(findings.every((finding) => Number.isInteger(finding.start)));
  assert.ok(findings.every((finding) => Number.isInteger(finding.end)));

  const report = buildReport(source, rules, {});
  assert.equal(report.kind, "prose-review");
  assert.equal(report.authorshipClaim, false);
  assert.equal(report.calibration, "uncalibrated-review-signal");
  assert.ok(report.overlapGroups.length >= 1);
  assert.ok(report.metrics.weightedDensityPer100Words > 0);
  assert.ok(report.metrics.affectedCoveragePercent > 0);
  assert.equal(Object.hasOwn(report, "score"), false);
  assert.equal(Object.hasOwn(report, "confidence"), false);
});

test("double-star globs match both root and nested files", () => {
  assert.equal(matchesAnyGlob("bundle.min.js", ["**/*.min.js"]), true);
  assert.equal(matchesAnyGlob("assets/bundle.min.js", ["**/*.min.js"]), true);
  assert.equal(matchesAnyGlob("assets/bundle.js", ["**/*.min.js"]), false);
});

test("safe fixes preserve links, tables, HTML, generated sections, and code", () => {
  const source = [
    "In order to read [in order to](https://example.com/in-order-to), start here.",
    "| in order to | keep |",
    "<Thing label=\"in order to\" />",
    "<!-- generated:start -->",
    "in order to preserve",
    "<!-- generated:end -->",
    "Use `in order to` literally.",
  ].join("\n");

  const fixed = applySafeFixes(source, rules.safeFixes, {});

  assert.equal(fixed.split("\n")[0], "To read [to](https://example.com/in-order-to), start here.");
  assert.match(fixed, /\| in order to \| keep \|/);
  assert.match(fixed, /label="in order to"/);
  assert.match(fixed, /\nin order to preserve\n/);
  assert.match(fixed, /`in order to`/);
});

test("safe fixes protect inline quotations and multiline tag properties", () => {
  const source = [
    'She wrote, "in order to keep this exact".',
    "She added, 'in order to keep this exact'.",
    "<Card",
    "  onClick={() => run()}",
    "  pivotal",
    '  title="in order to ship"',
    ">",
    "In order to continue, read this.",
    "</Card>",
    "She put the files in order together with Lee.",
  ].join("\n");

  const fixed = applySafeFixes(source, rules.safeFixes, {});
  assert.match(fixed, /"in order to keep this exact"/);
  assert.match(fixed, /'in order to keep this exact'/);
  assert.match(fixed, /title="in order to ship"/);
  assert.equal(analyzeText(source, rules, {}).some((finding) => finding.match === "pivotal"), false);
  assert.match(fixed, /\nTo continue, read this\./);
  assert.match(fixed, /in order together/);
});

test("safe fixes are disabled for non-English, legal, and medical input", () => {
  const source = "In order to preserve this exact wording.";
  assert.equal(applySafeFixes(source, rules.safeFixes, { language: "es" }), source);
  assert.equal(applySafeFixes(source, rules.safeFixes, { language: "en", channel: "legal" }), source);
  assert.equal(applySafeFixes(source, rules.safeFixes, { language: "en", channel: "medical" }), source);
});

test("strict project config validates keys, rule ids, severity, and thresholds", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-config-"));
  const valid = path.join(directory, ".prose-humanizer.json");
  fs.writeFileSync(valid, JSON.stringify({
    version: 1,
    language: "en",
    channel: "documentation",
    threshold: 8,
    disabledRules: ["dash-cluster"],
    severityOverrides: { "tier1-vocabulary": "info" },
    exclude: ["generated/**"],
  }));

  const config = loadConfig(valid, rules);
  assert.equal(config.threshold, 8);
  assert.equal(config.severityOverrides["tier1-vocabulary"], "info");

  fs.writeFileSync(valid, JSON.stringify({ version: 1, mystery: true }));
  assert.throws(() => loadConfig(valid, rules), /unknown configuration key/i);
  fs.rmSync(directory, { recursive: true, force: true });
});

test("the shipped example configuration is accepted", () => {
  const config = loadConfig(path.join(root, ".prose-humanizer.example.json"), rules);
  assert.equal(config.channel, "documentation");
  assert.equal(config.language, "en");
});

test("voice profiles contain feature confidence and hashes but no source prose", () => {
  const samples = [
    { name: "typed-note.txt", type: "typed", text: "I tried it. Honestly, it was fine. Would I use it again? Probably." },
    { name: "dictation.txt", type: "dictated", text: "I think we should wait, because the timing still feels wrong." },
  ];
  const profile = buildVoiceProfile(samples);
  const serialized = JSON.stringify(profile);

  assert.equal(profile.version, 1);
  assert.equal(profile.sources.length, 2);
  assert.equal(profile.sources[0].evidenceWeights.punctuation, 1);
  assert.equal(profile.sources[1].evidenceWeights.sentence, 1);
  assert.equal(profile.sources[1].evidenceWeights.punctuation, 0.2);
  assert.ok(profile.sources.every((source) => /^[a-f0-9]{64}$/.test(source.sha256)));
  assert.ok(profile.features.sentenceLengthMean.confidence);
  assert.doesNotMatch(serialized, /Honestly, it was fine/);
  assert.doesNotMatch(serialized, /timing still feels wrong/);
});

test("voice-profile confidence and values use feature-specific weighted evidence", () => {
  const longSentence = Array.from({ length: 80 }, () => "word").join(" ") + ".";
  const profile = buildVoiceProfile([
    { name: "typed.txt", type: "typed", text: `I I I. ${longSentence}` },
    { name: "edited.txt", type: "ai-edited", text: longSentence },
  ]);

  assert.equal(profile.features.typeTokenRatio.confidence, "medium");
  assert.equal(profile.features.sentenceLengthMean.confidence, "low");
  assert.ok(profile.features.firstPersonRatePer100Words.value > 2);
  assert.match(profile.features.typeTokenRatio.evidence, /weighted word/);
});

test("non-English voice profiles omit English lexical features", () => {
  const profile = buildVoiceProfile([
    { name: "sample.txt", type: "translated", text: "Quiero escribir con calma." },
  ], "es");

  assert.equal(profile.language, "es");
  assert.equal(profile.sources[0].evidenceWeights.lexical, 0.25);
  assert.equal(Object.hasOwn(profile.features, "firstPersonRatePer100Words"), false);
  assert.equal(Object.hasOwn(profile.features, "contractionRatePer100Words"), false);
});
