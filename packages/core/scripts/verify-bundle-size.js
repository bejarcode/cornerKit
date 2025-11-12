#!/usr/bin/env node

/**
 * Bundle Size Verification Script
 * Verifies SC-002: Bundle size <5KB gzipped
 * Part of T345: Success criteria verification
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARGET_SIZE_KB = 5.0;
const DIST_DIR = join(__dirname, '..', 'dist');

const BUNDLES = [
  { name: 'ESM', file: 'cornerkit.esm.js' },
  { name: 'UMD', file: 'cornerkit.js' },
  { name: 'CJS', file: 'cornerkit.cjs' },
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║          Bundle Size Verification (SC-002)                   ║');
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

  console.log('\n✅ SUCCESS CRITERIA SC-002: PASSED');
  console.log(`\n   All bundles are under ${TARGET_SIZE_KB} KB gzipped target`);
  console.log(`   Average size: ${avgSize} KB`);
  console.log(`   Minimum headroom: ${minHeadroom}%`);
  console.log(`\n   ${results.length}/${BUNDLES.length} bundles verified\n`);
  process.exit(0);
} else {
  console.log('\n❌ SUCCESS CRITERIA SC-002: FAILED');
  console.log(`\n   One or more bundles exceed ${TARGET_SIZE_KB} KB gzipped target\n`);
  process.exit(1);
}
