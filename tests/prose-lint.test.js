const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const cli = path.join(root, "bin", "prose-lint.js");

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
  assert.equal(flaggedReport.confidence, "low");
  assert.ok(flaggedReport.score > cleanReport.score);
  assert.equal(cleanReport.score, 0);
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
  assert.match(result.stderr, /--fail-above must be a number from 0 to 100/);
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
  assert.equal(report.kind, "repository-scan");
  assert.equal(report.files.length, 2);
  assert.equal(report.files[0].path, "flagged.md");
  assert.ok(report.files[0].score > report.files[1].score);
  assert.equal(report.thresholdExceeded, true);
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
  assert.match(help.stdout, /not an authorship detector/i);
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), "3.0.0");
});

test("missing paths fail cleanly without a stack trace", () => {
  const result = run(["analyze", "definitely-missing-draft.md"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /definitely-missing-draft\.md/);
  assert.doesNotMatch(result.stderr, /\n\s+at\s/);
});
