#!/usr/bin/env node

/**
 * Bundle Size Verification Script
 * Verifies SC-004: Bundle size <6.5KB gzipped (borders + hover hooks)
 * Part of T345: Success criteria verification
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Budget history: <5 KB (v1.1 core) -> <6 KB (Feature 006 SVG borders) ->
// <6.5 KB (border CSS-variable hover hooks, issue #4, + v1.3.0 correctness
// fixes). Keep in sync with .github/workflows/bundle-size.yml and the
// constitution (docs/core-library-review/REMEDIATION-PLAN.md, WP5/F6).
const TARGET_SIZE_KB = 6.5;
const DIST_DIR = join(__dirname, '..', 'dist');

const BUNDLES = [
  { name: 'ESM', file: 'cornerkit.esm.js' },
  { name: 'UMD', file: 'cornerkit.js' },
  { name: 'CJS', file: 'cornerkit.cjs' },
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║          Bundle Size Verification (SC-004)                   ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

let allPassed = true;
const results = [];

for (const bundle of BUNDLES) {
  const filePath = join(DIST_DIR, bundle.file);

  if (!existsSync(filePath)) {
    console.error(`❌ ERROR: Bundle file not found: ${bundle.file}`);
    allPassed = false;
    continue;
  }

  try {
    // Measure gzipped size
    const gzipCommand = `gzip -c "${filePath}" | wc -c`;
    const sizeBytes = parseInt(execSync(gzipCommand, { encoding: 'utf-8' }).trim(), 10);
    const sizeKB = sizeBytes / 1024;
    const passed = sizeKB < TARGET_SIZE_KB;

    const percentage = ((TARGET_SIZE_KB - sizeKB) / TARGET_SIZE_KB * 100).toFixed(1);
    const status = passed ? '✅ PASS' : '❌ FAIL';

    results.push({
      name: bundle.name,
      sizeBytes,
      sizeKB,
      passed,
      percentage,
    });

    console.log(`${status}  ${bundle.name.padEnd(6)} ${sizeKB.toFixed(2)} KB (${sizeBytes} bytes)`);
    console.log(`       Target: < ${TARGET_SIZE_KB.toFixed(2)} KB`);
    console.log(`       Headroom: ${percentage}% under target\n`);

    if (!passed) {
      allPassed = false;
    }
  } catch (error) {
    console.error(`❌ ERROR: Failed to measure ${bundle.name}: ${error.message}`);
    allPassed = false;
  }
}

console.log('─────────────────────────────────────────────────────────────────');

if (allPassed && results.length === BUNDLES.length) {
  const avgSize = (results.reduce((sum, r) => sum + r.sizeKB, 0) / results.length).toFixed(2);
  const minHeadroom = Math.min(...results.map(r => parseFloat(r.percentage))).toFixed(1);

  console.log('\n✅ SUCCESS CRITERIA SC-004: PASSED');
  console.log(`\n   All bundles are under ${TARGET_SIZE_KB} KB gzipped target (with border support)`);
  console.log(`   Average size: ${avgSize} KB`);
  console.log(`   Minimum headroom: ${minHeadroom}%`);
  console.log(`\n   ${results.length}/${BUNDLES.length} bundles verified\n`);
  process.exit(0);
} else {
  console.log('\n❌ SUCCESS CRITERIA SC-004: FAILED');
  console.log(`\n   One or more bundles exceed ${TARGET_SIZE_KB} KB gzipped target\n`);
  process.exit(1);
}
