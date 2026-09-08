#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const benchmark = JSON.parse(fs.readFileSync(path.join(root, "evals", "benchmark.json"), "utf8"));

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1];
}

function normalize(text) {
  return text.normalize("NFC").replace(/\s+/g, " ").trim();
}

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function normalizedEditRatio(source, candidate) {
  const left = normalize(source);
  const right = normalize(candidate);
  return Math.max(left.length, right.length) === 0
    ? 0 : editDistance(left, right) / Math.max(left.length, right.length);
}

function numericLiterals(text) {
  return new Set(text.match(/(?:[$€£])?\b\d+(?:[.,:]\d+)*(?:%|\s?(?:a\.m\.|p\.m\.))?/gi) || []);
}

function evaluate(entry, candidate) {
  const failures = [];
  for (const literal of entry.required || []) {
    if (!candidate.includes(literal)) failures.push(`missing required literal: ${literal}`);
  }
  for (const literal of entry.forbidden || []) {
    if (candidate.toLowerCase().includes(literal.toLowerCase())) failures.push(`contains forbidden literal: ${literal}`);
  }
  for (const literal of entry.protected || []) {
    if (!candidate.includes(literal)) failures.push(`changed protected literal: ${literal}`);
  }
  if (entry.requiredOrder) {
    let previous = -1;
    for (const literal of entry.requiredOrder) {
      const index = candidate.indexOf(literal);
      if (index < 0 || index <= previous) {
        failures.push(`required order was not preserved at: ${literal}`);
        break;
      }
      previous = index;
    }
  }
  if (entry.forbidUnexpectedNumbers) {
    const allowed = numericLiterals(entry.source);
    for (const value of numericLiterals(candidate)) {
      if (!allowed.has(value)) failures.push(`introduced numeric literal: ${value}`);
    }
  }
  if (entry.forbidFirstPerson && /\b(?:I|me|my|mine|we|us|our|ours)\b/i.test(candidate)) {
    failures.push("introduced an unsupported first-person narrator");
  }
  const editRatio = normalizedEditRatio(entry.source, candidate);
  if (entry.maxEditRatio !== undefined && editRatio > entry.maxEditRatio) {
    failures.push(`edit ratio ${editRatio.toFixed(3)} exceeds ${entry.maxEditRatio}`);
  }
  return { failures, editRatio: Number(editRatio.toFixed(3)) };
}

function main() {
  const candidateDirectory = argument("--candidates");
  if (!candidateDirectory) throw new Error("--candidates directory is required");
  const resolved = path.resolve(candidateDirectory);
  const cases = [];
  const hashes = [];
  for (const entry of benchmark.cases) {
    const candidatePath = path.join(resolved, `${entry.id}.txt`);
    if (!fs.existsSync(candidatePath)) {
      cases.push({ id: entry.id, axis: entry.axis, passed: false, failures: ["candidate file is missing"] });
      continue;
    }
    const candidate = fs.readFileSync(candidatePath, "utf8");
    const result = evaluate(entry, candidate);
    cases.push({
      id: entry.id,
      axis: entry.axis,
      passed: result.failures.length === 0,
      editRatio: result.editRatio,
      failures: result.failures,
    });
    hashes.push({ id: entry.id, sha256: crypto.createHash("sha256").update(candidate).digest("hex") });
  }
  const axes = {};
  for (const entry of cases) {
    axes[entry.axis] ||= { passed: 0, total: 0 };
    axes[entry.axis].total += 1;
    if (entry.passed) axes[entry.axis].passed += 1;
  }
  const passed = cases.filter((entry) => entry.passed).length;
  const report = {
    kind: "prose-humanizer-benchmark",
    version: benchmark.version,
    candidateDirectory: path.basename(resolved),
    humanPreferenceMeasured: false,
    passed,
    total: cases.length,
    axes,
    candidateHashes: hashes,
    cases,
  };
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    process.stdout.write(`Deterministic invariants: ${passed}/${cases.length} passed\n`);
    for (const entry of cases.filter((item) => !item.passed)) {
      process.stdout.write(`${entry.id}: ${entry.failures.join("; ")}\n`);
    }
    process.stdout.write("Human preference measured: no\n");
  }
  return passed === cases.length ? 0 : 1;
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`benchmark: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 2;
}
