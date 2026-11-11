/**
 * SHIV YOGI ASSISTANT - V3.0.0
 * Strict Syntax and Code Quality Auditor
 * Verifies syntax of worker.js, all modules, and test files using node --check.
 */

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const rootDir = process.cwd();
const filesToCheck = [];

function collectJsFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        collectJsFiles(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      filesToCheck.push(fullPath);
    }
  }
}

// 1. Add worker.js
if (fs.existsSync(path.join(rootDir, "worker.js"))) {
  filesToCheck.push(path.join(rootDir, "worker.js"));
}

// 2. Add modules, test, scripts
collectJsFiles(path.join(rootDir, "modules"));
collectJsFiles(path.join(rootDir, "test"));
collectJsFiles(path.join(rootDir, "scripts"));

console.log("==================================================");
console.log(`🔍 CHECKING SYNTAX FOR ${filesToCheck.length} JAVASCRIPT FILES`);
console.log("==================================================");

let failed = false;

for (const file of filesToCheck) {
  const relPath = path.relative(rootDir, file);
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    console.log(`✅ [SYNTAX OK] ${relPath}`);
  } catch (err) {
    console.error(`❌ [SYNTAX ERROR] ${relPath}`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    failed = true;
  }
}

console.log("==================================================");
if (failed) {
  console.error("❌ SYNTAX CHECK FAILED! Please resolve syntax errors above.");
  process.exit(1);
} else {
  console.log("✨ ALL JAVASCRIPT FILES PASSED SYNTAX VALIDATION (100%)");
  process.exit(0);
}
