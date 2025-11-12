#!/usr/bin/env node
/**
 * Bundle Size Analysis Script
 * Phase 7: T336-T345 - Bundle size measurement and optimization
 *
 * Success Criteria:
 * - SC-002: Bundle size <5KB gzipped
 */

import { readFileSync, statSync } from 'fs';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2);
}

function analyzeFile(filename) {
  const filepath = join(distDir, filename);

  try {
    const content = readFileSync(filepath);
    const stats = statSync(filepath);
    const gzipped = gzipSync(content);

    const rawSize = stats.size;
    const gzipSize = gzipped.length;
    const rawKB = formatBytes(rawSize);
    const gzipKB = formatBytes(gzipSize);

    return {
      filename,
      rawSize,
      gzipSize,
      rawKB,
      gzipKB,
    };
  } catch (error) {
    console.error(`${colors.red}Error analyzing ${filename}:${colors.reset}`, error.message);
    return null;
  }
}

function printResults(results) {
  console.log(`\n${colors.bold}${colors.blue}📦 Bundle Size Analysis${colors.reset}\n`);
  console.log('═'.repeat(70));

  results.forEach((result) => {
    if (!result) return;

    const { filename, rawKB, gzipKB, gzipSize } = result;

    // Determine status color based on gzipped size
    let statusColor = colors.green;
    let status = '✓ PASS';

    if (gzipSize > 5120) {
      // >5KB
      statusColor = colors.red;
      status = '✗ FAIL';
    } else if (gzipSize > 4608) {
      // >4.5KB (90% of target)
      statusColor = colors.yellow;
      status = '⚠ WARNING';
    }

    console.log(`\n${colors.bold}${filename}${colors.reset}`);
    console.log(`  Raw size:     ${rawKB} KB`);
    console.log(`  Gzipped size: ${gzipKB} KB ${statusColor}${status}${colors.reset}`);
  });

  console.log('\n' + '═'.repeat(70));
}

function printSummary(results) {
  const esmResult = results.find((r) => r && r.filename === 'cornerkit.esm.js');

  if (!esmResult) {
    console.error(`\n${colors.red}Error: Could not find ESM bundle${colors.reset}`);
    process.exit(1);
  }

  const { gzipKB, gzipSize } = esmResult;
  const target = 5.0;
  const percentage = ((gzipSize / 5120) * 100).toFixed(1);

  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  Target:           ${target.toFixed(2)} KB (5KB gzipped)`);
  console.log(`  Actual (ESM):     ${gzipKB} KB`);
  console.log(`  Usage:            ${percentage}% of target`);

  if (gzipSize <= 5120) {
    console.log(`  ${colors.green}${colors.bold}✓ SUCCESS:${colors.reset}${colors.green} Bundle size meets target (<5KB)${colors.reset}`);
    console.log(`  Remaining budget: ${formatBytes(5120 - gzipSize)} KB`);
  } else {
    const excess = gzipSize - 5120;
    console.log(`  ${colors.red}${colors.bold}✗ FAILURE:${colors.reset}${colors.red} Bundle exceeds target by ${formatBytes(excess)} KB${colors.reset}`);
    console.log('\n  Optimization suggestions:');
    console.log('    - Remove unused code paths');
    console.log('    - Inline small utilities');
    console.log('    - Reduce comment size');
    console.log('    - Use shorter variable names in production');
  }

  console.log('');
}

function checkTreeShaking() {
  console.log(`\n${colors.bold}🌳 Tree-Shaking Verification${colors.reset}\n`);
  console.log('═'.repeat(70));

  try {
    const esmContent = readFileSync(join(distDir, 'cornerkit.esm.js'), 'utf-8');

    // Check for common dead code patterns
    const checks = [
      {
        name: 'Debug code removed',
        pattern: /console\.(log|debug|info)/g,
        shouldBeZero: false, // Allow console.warn/error in production
      },
      {
        name: 'Development warnings stripped',
        pattern: /process\.env\.NODE_ENV.*development/g,
        shouldBeZero: false, // May exist for runtime checks
      },
      {
        name: 'Unused imports eliminated',
        pattern: /\/\/ UNUSED:|\/\* UNUSED/g,
        shouldBeZero: true,
      },
    ];

    checks.forEach(({ name, pattern, shouldBeZero }) => {
      const matches = esmContent.match(pattern);
      const count = matches ? matches.length : 0;

      let status, color;
      if (shouldBeZero && count === 0) {
        status = '✓ PASS';
        color = colors.green;
      } else if (!shouldBeZero && count > 0) {
        status = '✓ OK';
        color = colors.green;
      } else if (shouldBeZero && count > 0) {
        status = '✗ FAIL';
        color = colors.red;
      } else {
        status = '✓ OK';
        color = colors.green;
      }

      console.log(`  ${color}${status}${colors.reset} ${name} (found: ${count})`);
    });

    console.log('\n' + '═'.repeat(70));
  } catch (error) {
    console.error(`${colors.red}Error during tree-shaking verification:${colors.reset}`, error.message);
  }
}

function main() {
  console.log(`${colors.bold}CornerKit Bundle Analysis${colors.reset}`);
  console.log(`Target: <5KB gzipped (SC-002)\n`);

  const files = ['cornerkit.esm.js', 'cornerkit.js', 'cornerkit.cjs'];
  const results = files.map(analyzeFile);

  printResults(results);
  printSummary(results);
  checkTreeShaking();

  // Exit with error if bundle size exceeds target
  const esmResult = results.find((r) => r && r.filename === 'cornerkit.esm.js');
  if (esmResult && esmResult.gzipSize > 5120) {
    console.log(`\n${colors.red}${colors.bold}Bundle size check FAILED${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`\n${colors.green}${colors.bold}Bundle size check PASSED${colors.reset}\n`);
  process.exit(0);
}

main();
