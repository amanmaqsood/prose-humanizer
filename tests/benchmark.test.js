const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const benchmark = path.join(root, "scripts", "run_benchmark.js");
const pairwise = path.join(root, "scripts", "prepare_pairwise.js");
const reference = path.join(root, "evals", "reference");

test("reference candidates pass every deterministic invariant", () => {
  const result = spawnSync(process.execPath, [benchmark, "--candidates", reference, "--json"], {
    cwd: root,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.kind, "prose-humanizer-benchmark");
  assert.equal(report.passed, report.total);
  assert.equal(report.humanPreferenceMeasured, false);
  assert.ok(report.axes.fidelity.total > 0);
  assert.ok(report.candidateHashes.every((item) => /^[a-f0-9]{64}$/.test(item.sha256)));
  assert.doesNotMatch(result.stdout, /Northline shipped/);
});

test("benchmark fails an invented literal and reports the exact invariant", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-benchmark-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.cpSync(reference, directory, { recursive: true });
  fs.appendFileSync(path.join(directory, "fact-fidelity.txt"), " Revenue rose by 37%.");

  const result = spawnSync(process.execPath, [benchmark, "--candidates", directory, "--json"], {
    cwd: root,
    encoding: "utf8",
  });

  assert.equal(result.status, 1, result.stderr);
  const report = JSON.parse(result.stdout);
  const factCase = report.cases.find((item) => item.id === "fact-fidelity");
  assert.ok(factCase.failures.some((failure) => failure.includes("37%")));
});

test("benchmark rejects an explicit contradiction and reversed chronology", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-benchmark-adversarial-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.cpSync(reference, directory, { recursive: true });
  fs.appendFileSync(path.join(directory, "fact-fidelity.txt"), " It does not support CSV.");
  fs.writeFileSync(
    path.join(directory, "chronology-and-unknown-cause.txt"),
    "Service recovered at 9:26 a.m. The alert fired at 9:10 a.m. Priya restarted the worker at 9:18 a.m. The cause is still unknown.",
  );

  const result = spawnSync(process.execPath, [benchmark, "--candidates", directory, "--json"], {
    cwd: root, encoding: "utf8",
  });
  assert.equal(result.status, 1, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.ok(report.cases.find((item) => item.id === "fact-fidelity").failures.some((failure) => /does not support/i.test(failure)));
  assert.ok(report.cases.find((item) => item.id === "chronology-and-unknown-cause").failures.some((failure) => /required order/i.test(failure)));
});

test("pairwise kit blinds candidate identity and writes a separate key", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prose-pairwise-"));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const candidateB = path.join(directory, "candidate-b");
  fs.cpSync(reference, candidateB, { recursive: true });
  const output = path.join(directory, "study");

  const result = spawnSync(process.execPath, [
    pairwise,
    "--a", reference,
    "--b", candidateB,
    "--output", output,
    "--seed", "47",
  ], { cwd: root, encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  const ballot = JSON.parse(fs.readFileSync(path.join(output, "ballot.json"), "utf8"));
  const key = JSON.parse(fs.readFileSync(path.join(output, "key.json"), "utf8"));
  assert.ok(ballot.pairs.length > 0);
  assert.equal(JSON.stringify(ballot).includes(reference), false);
  assert.equal(JSON.stringify(ballot).includes(candidateB), false);
  assert.ok(key.pairs.every((pair) => ["a", "b"].includes(pair.left)));
});
