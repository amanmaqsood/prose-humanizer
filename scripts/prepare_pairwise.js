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

function seededRandom(seed) {
  let state = Number(seed) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function digest(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function main() {
  const directoryA = argument("--a");
  const directoryB = argument("--b");
  const output = argument("--output");
  const seed = argument("--seed") || "1";
  if (!directoryA || !directoryB || !output) throw new Error("--a, --b, and --output are required");
  const random = seededRandom(seed);
  const ballot = {
    version: 1,
    instructions: "Rate meaning preservation first. Then choose the stronger voice fit, naturalness, and clarity. A meaning failure cannot win overall.",
    criteria: ["meaning", "voice-fit", "naturalness", "clarity", "overall"],
    pairs: [],
  };
  const key = { version: 1, seed, pairs: [] };
  for (const entry of benchmark.cases) {
    const file = `${entry.id}.txt`;
    const a = fs.readFileSync(path.join(path.resolve(directoryA), file), "utf8");
    const b = fs.readFileSync(path.join(path.resolve(directoryB), file), "utf8");
    const leftIsA = random() < 0.5;
    ballot.pairs.push({
      caseId: entry.id,
      instruction: entry.instruction,
      source: entry.source,
      left: leftIsA ? a : b,
      right: leftIsA ? b : a,
      rating: { meaning: null, "voice-fit": null, naturalness: null, clarity: null, overall: null, notes: "" },
    });
    key.pairs.push({
      caseId: entry.id,
      left: leftIsA ? "a" : "b",
      right: leftIsA ? "b" : "a",
      aSha256: digest(a),
      bSha256: digest(b),
    });
  }
  const resolvedOutput = path.resolve(output);
  fs.mkdirSync(resolvedOutput, { recursive: true });
  fs.writeFileSync(path.join(resolvedOutput, "ballot.json"), `${JSON.stringify(ballot, null, 2)}\n`);
  fs.writeFileSync(path.join(resolvedOutput, "key.json"), `${JSON.stringify(key, null, 2)}\n`);
  process.stdout.write(`Prepared ${ballot.pairs.length} blinded pair(s). Keep key.json from raters.\n`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`pairwise: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 2;
}
