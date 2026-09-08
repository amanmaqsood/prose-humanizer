const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const cli = path.join(root, "bin", "prose-lint.js");
const packageVersion = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;

function run(args, input = "") {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    input,
    encoding: "utf8",
  });
}

test("analyze reports named patterns with line numbers from stdin", () => {
  const result = run(
    ["analyze", "-"],
    "This pivotal update serves as a testament to our progress.\n",
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /line 1/i);
  assert.match(result.stdout, /tier-1 vocabulary/i);
  assert.match(result.stdout, /significance inflation/i);
});

test("analyze JSON ignores frontmatter and fenced code", () => {
  const input = [
    "---",
    "description: A pivotal configuration",
    "---",
    "Plain prose serves as a testament to nothing.",
    "```text",
    "pivotal",
    "```",
    "> A pivotal quotation",
    "The label `pivotal` appears in documentation.",
  ].join("\n");
  const result = run(["analyze", "-", "--json"], input);

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.ok(report.findings.some((finding) => finding.id === "significance-inflation"));
  assert.ok(report.findings.every((finding) => finding.line === 4));
});

test("score reports pattern density without claiming authorship", () => {
  const flagged = run(
    ["score", "-", "--json"],
    "This pivotal launch serves as a testament to progress.",
  );
  const clean = run(
    ["score", "-", "--json"],
    "The team shipped the invoice export on Tuesday.",
  );

  assert.equal(flagged.status, 0, flagged.stderr);
  assert.equal(clean.status, 0, clean.stderr);
  const flaggedReport = JSON.parse(flagged.stdout);
  const cleanReport = JSON.parse(clean.stdout);
  assert.equal(flaggedReport.kind, "pattern-density");
  assert.equal(flaggedReport.authorshipClaim, false);
  assert.equal(flaggedReport.deprecated, true);
  assert.match(flaggedReport.warning, /uncalibrated/i);
  assert.equal(flaggedReport.confidence, "low");
  assert.ok(flaggedReport.score > cleanReport.score);
  assert.equal(cleanReport.score, 0);
});

test("report is the recommended uncalibrated review interface", () => {
  const result = run(
    ["report", "-", "--json"],
    "This pivotal release serves as a testament to progress.",
  );

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.kind, "prose-review");
  assert.equal(report.authorshipClaim, false);
  assert.equal(report.calibration, "uncalibrated-review-signal");
  assert.ok(report.findings.length > 0);
  assert.ok(report.findings.every((finding) => finding.start < finding.end));
});

test("score can enforce a lint threshold for one file", () => {
  const result = run(
    ["score", "-", "--fail-above", "20"],
    "This pivotal launch serves as a testament to progress.",
  );

  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /not an authorship determination/i);
});

test("options can appear before a named input file", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-options-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "draft.md");
  fs.writeFileSync(file, "The team shipped the invoice export on Tuesday.\n");

  const result = run(["score", "--json", file]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).score, 0);
});

test("threshold flags require a numeric value", () => {
  const result = run(["score", "-", "--fail-above"], "Plain prose.\n");

  assert.equal(result.status, 2);
  assert.match(result.stderr, /--fail-above requires a value/);
});

test("score excludes protected metadata and code from its denominator", () => {
  const prose = "This pivotal launch was late.";
  const wrapped = [
    "---",
    "description: many metadata words that are not prose",
    "---",
    prose,
    "```js",
    "const many = 'code words that are not prose either';",
    "```",
  ].join("\n");
  const plain = JSON.parse(run(["score", "-", "--json"], prose).stdout);
  const protectedText = JSON.parse(run(["score", "-", "--json"], wrapped).stdout);

  assert.equal(protectedText.wordCount, plain.wordCount);
  assert.equal(protectedText.score, plain.score);
});

test("fix applies only declared mechanical substitutions", () => {
  const result = run(
    ["fix", "-"],
    "In order to ship, it is important to note that we use the checklist.\n",
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "To ship, we use the checklist.\n");
});

test("fix preserves sentence capitalization after deleting an opener", () => {
  const result = run(
    ["fix", "-"],
    "It is important to note that the update shipped. Fine. It is worth noting that nobody opted out.\n",
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "The update shipped. Fine. Nobody opted out.\n");
});

test("fix preserves metadata, code, quotations, and inline code", () => {
  const input = [
    "---",
    "description: In order to configure the page",
    "---",
    "In order to ship, we use the checklist.",
    "```text",
    "In order to run the sample",
    "```",
    "> In order to quote the source",
    "Keep `in order to` exactly as written.",
  ].join("\n");
  const result = run(["fix", "-"], input);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.stdout,
    input.replace("In order to ship", "To ship"),
  );
});

test("fix preserves inline quotations, MDX properties, and phrase boundaries", () => {
  const input = [
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
  const result = run(["fix", "-"], input);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, input.replace("In order to continue", "To continue"));
});

test("fix skips non-English and high-stakes configured content", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-fix-gates-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "draft.md");
  fs.writeFileSync(file, "In order to preserve this wording.\n");
  for (const config of [
    { version: 1, language: "es" },
    { version: 1, language: "en", channel: "legal" },
    { version: 1, language: "en", channel: "medical" },
  ]) {
    fs.writeFileSync(path.join(directory, ".prose-humanizer.json"), JSON.stringify(config));
    const result = run(["fix", file]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "In order to preserve this wording.\n");
  }
});

test("analyze explicitly reports a non-English skip", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-language-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const config = path.join(directory, ".prose-humanizer.json");
  fs.writeFileSync(config, JSON.stringify({ version: 1, language: "es" }));
  const result = run(["analyze", "-", "--config", config, "--json"], "Un texto pivotal.\n");

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.match(report.skippedReason, /not English/i);
  assert.deepEqual(report.findings, []);
});

test("stats reports rhythm and repetition measurements", () => {
  const result = run(
    ["stats", "-", "--json"],
    "Short. This sentence has five plain words. Another short line.",
  );

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.kind, "prose-statistics");
  assert.equal(report.sentenceCount, 3);
  assert.deepEqual(report.sentenceLengths, [1, 6, 3]);
  assert.equal(report.minSentenceWords, 1);
  assert.equal(report.maxSentenceWords, 6);
  assert.ok(report.typeTokenRatio > 0 && report.typeTokenRatio <= 1);
});

test("scan ranks prose files and can fail a CI threshold", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-lint-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(directory, "flagged.md"),
    "This pivotal update serves as a testament to progress.\n",
  );
  fs.writeFileSync(
    path.join(directory, "clean.txt"),
    "The team shipped the invoice export on Tuesday.\n",
  );
  fs.writeFileSync(path.join(directory, "ignored.js"), "const pivotal = true;\n");

  const result = run(["scan", directory, "--json", "--fail-above", "20"]);

  assert.equal(result.status, 1, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.kind, "repository-review");
  assert.equal(report.files.length, 2);
  assert.equal(report.files[0].path, "flagged.md");
  assert.ok(report.files[0].weightedDensityPer100Words > report.files[1].weightedDensityPer100Words);
  assert.equal(report.thresholdExceeded, true);
});

test("scan uses strict project config for exclusions and thresholds", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-config-scan-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.mkdirSync(path.join(directory, "generated"));
  fs.writeFileSync(path.join(directory, "draft.md"), "This pivotal update shipped.\n");
  fs.writeFileSync(path.join(directory, "generated", "copy.md"), "Pivotal pivotal pivotal.\n");
  fs.writeFileSync(path.join(directory, ".prose-humanizer.json"), JSON.stringify({
    version: 1,
    language: "en",
    threshold: 1,
    exclude: ["generated/**"],
  }));

  const result = run(["scan", directory, "--json"]);

  assert.equal(result.status, 1, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.files.map((file) => file.path), ["draft.md"]);
  assert.equal(report.threshold, 1);
  assert.equal(report.thresholdSource, "config");
});

test("profile emits privacy-safe feature evidence from deliberate samples", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-profile-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const first = path.join(directory, "first.txt");
  const second = path.join(directory, "second.txt");
  fs.writeFileSync(first, "I tried it. Honestly, it was fine.\n");
  fs.writeFileSync(second, "Would I use it again? Probably.\n");

  const result = run(["profile", first, second, "--json", "--sample-type", "typed"]);

  assert.equal(result.status, 0, result.stderr);
  const profile = JSON.parse(result.stdout);
  assert.equal(profile.sources.length, 2);
  assert.ok(profile.features.sentenceLengthMean.confidence);
  assert.doesNotMatch(result.stdout, /Honestly, it was fine/);
});

test("profile accepts per-file provenance and a non-English language", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-profile-types-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const first = path.join(directory, "first.txt");
  const second = path.join(directory, "second.txt");
  fs.writeFileSync(first, "Escribo directo.\n");
  fs.writeFileSync(second, "No quiero adornos.\n");
  const result = run([
    "profile", first, second, "--json", "--sample-types", "typed,translated", "--language", "es",
  ]);

  assert.equal(result.status, 0, result.stderr);
  const profile = JSON.parse(result.stdout);
  assert.deepEqual(profile.sources.map((source) => source.type), ["typed", "translated"]);
  assert.equal(profile.language, "es");
  assert.equal(Object.hasOwn(profile.features, "firstPersonRatePer100Words"), false);
});

test("named-file commands honor project exclusions through stdin paths", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-excluded-file-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const nested = path.join(directory, "generated");
  fs.mkdirSync(nested);
  const virtual = path.join(nested, "copy.md");
  fs.writeFileSync(path.join(directory, ".prose-humanizer.json"), JSON.stringify({
    version: 1, exclude: ["generated/**"],
  }));
  const result = run(
    ["report", "-", "--stdin-path", virtual, "--config", path.join(directory, ".prose-humanizer.json"), "--json"],
    "This pivotal copy serves as a testament to progress.\n",
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).kind, "skipped");
});

test("fix preserves a UTF-8 BOM and refuses invalid UTF-8", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-encoding-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const bomFile = path.join(directory, "bom.md");
  fs.writeFileSync(bomFile, Buffer.concat([
    Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("In order to ship.\r\n", "utf8"),
  ]));
  const bomResult = run(["fix", bomFile, "--write"]);
  assert.equal(bomResult.status, 0, bomResult.stderr);
  const after = fs.readFileSync(bomFile);
  assert.deepEqual([...after.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.match(after.toString("utf8"), /To ship\.\r\n/);

  const invalidFile = path.join(directory, "invalid.md");
  const original = Buffer.from([0xff, 0xfe, 0x49, 0x00]);
  fs.writeFileSync(invalidFile, original);
  const invalidResult = run(["fix", invalidFile, "--write"]);
  assert.equal(invalidResult.status, 2);
  assert.match(invalidResult.stderr, /not valid UTF-8/i);
  assert.deepEqual(fs.readFileSync(invalidFile), original);
});

test("fix --write updates a named file and reports the change", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-fix-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "draft.md");
  fs.writeFileSync(file, "In order to ship, we use the checklist.\n");

  const result = run(["fix", file, "--write"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /updated/i);
  assert.equal(fs.readFileSync(file, "utf8"), "To ship, we use the checklist.\n");
});

test("analyze covers high-signal structural patterns", () => {
  const input = [
    "Honestly? The release was late.",
    "Some might argue the delay was harmless, but nobody raised that objection.",
    "The best part: it learns.",
    "The decision emerged after lunch.",
  ].join("\n");
  const result = run(["analyze", "-", "--json"], input);

  assert.equal(result.status, 0, result.stderr);
  const ids = new Set(JSON.parse(result.stdout).findings.map((finding) => finding.id));
  assert.ok(ids.has("fake-candid-opener"));
  assert.ok(ids.has("imaginary-objection"));
  assert.ok(ids.has("colon-reveal"));
  assert.ok(ids.has("false-agency"));
});

test("help and version describe the public CLI", () => {
  const help = run(["--help"]);
  const version = run(["--version"]);

  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /analyze/);
  assert.match(help.stdout, /scan/);
  assert.match(help.stdout, /report/);
  assert.match(help.stdout, /profile/);
  assert.match(help.stdout, /not an authorship detector/i);
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), packageVersion);
});

test("missing paths fail cleanly without a stack trace", () => {
  const result = run(["analyze", "definitely-missing-draft.md"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /definitely-missing-draft\.md/);
  assert.doesNotMatch(result.stderr, /\n\s+at\s/);
});
