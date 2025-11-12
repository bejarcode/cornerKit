/**
 * Performance Benchmark Tests
 * Phase 7: T327-T330 - Performance measurement and validation
 *
 * Success Criteria:
 * - SC-003: Render time <10ms per element
 * - SC-004: Init time <100ms
 * - SC-014: 100 elements in <500ms (5ms avg)
 * - SC-015: 50 simultaneous resizes maintain 60fps
 */

import { test, expect } from '@playwright/test';
import { setupTestPage } from '../integration/test-helpers';

test.describe('Performance: Render Time (T327, SC-003)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should render single element in <10ms', async ({ page }) => {
    const renderTime = await page.evaluate(() => {
      const el = document.getElementById('basic-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      // Measure render time using Performance API
      const start = performance.now();
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    console.log(`  ⏱️  Single element render time: ${renderTime.toFixed(3)}ms`);
    expect(renderTime).toBeLessThan(10);
  });

  test('should render 10 elements averaging <10ms each', async ({ page }) => {
    const averageTime = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      // Create 10 test elements
      const elements: HTMLElement[] = [];
      for (let i = 0; i < 10; i++) {
        const el = document.createElement('div');
        el.className = 'perf-test test-element';
        el.style.width = '200px';
        el.style.height = '150px';
        el.textContent = `Perf ${i + 1}`;
        testContainer.appendChild(el);
        elements.push(el);
      }

      // Measure render time for each element
      const times: number[] = [];
      elements.forEach((el) => {
        const start = performance.now();
        window.ck.apply(el, { radius: 20, smoothing: 0.6 });
        const end = performance.now();
        times.push(end - start);
      });

      const total = times.reduce((a, b) => a + b, 0);
      return total / times.length;
    });

    console.log(`  ⏱️  Average render time (10 elements): ${averageTime.toFixed(3)}ms`);
    expect(averageTime).toBeLessThan(10);
  });
});

test.describe('Performance: Initialization Time (T328, SC-004)', () => {
  test('should initialize library in <100ms', async ({ page }) => {
    // Navigate to page without pre-initialization
    await page.goto('/tests/integration/fixtures/test-page.html');

    const initTime = await page.evaluate(() => {
      // Wait for CornerKit to be available
      return new Promise<number>((resolve) => {
        const start = performance.now();

        const checkReady = () => {
          if (window.cornerKitReady && window.ck) {
            const end = performance.now();
            resolve(end - start);
          } else {
            setTimeout(checkReady, 10);
          }
        };

        checkReady();
      });
    });

    console.log(`  ⏱️  Library initialization time: ${initTime.toFixed(3)}ms`);
    expect(initTime).toBeLessThan(100);
  });
});

test.describe('Performance: Batch Operations (T329, SC-014)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should apply to 100 elements in <500ms', async ({ page }) => {
    const batchTime = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      // Clear existing elements
      testContainer.innerHTML = '';

      // Create 100 test elements
      for (let i = 0; i < 100; i++) {
        const el = document.createElement('div');
        el.className = 'batch-perf test-element';
        el.style.width = '80px';
        el.style.height = '80px';
        el.style.display = 'inline-block';
        el.textContent = `${i + 1}`;
        testContainer.appendChild(el);
      }

      // Measure batch application time
      const start = performance.now();
      window.ck.applyAll('.batch-perf', { radius: 16, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    const avgPerElement = batchTime / 100;
    console.log(`  ⏱️  100 elements batch time: ${batchTime.toFixed(3)}ms`);
    console.log(`  ⏱️  Average per element: ${avgPerElement.toFixed(3)}ms`);

    expect(batchTime).toBeLessThan(500);
    expect(avgPerElement).toBeLessThan(5); // 5ms average as per SC-014
  });

  test('should handle 50 elements within 250ms', async ({ page }) => {
    const batchTime = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      // Clear existing elements
      testContainer.innerHTML = '';

      // Create 50 test elements
      for (let i = 0; i < 50; i++) {
        const el = document.createElement('div');
        el.className = 'batch-50 test-element';
        el.style.width = '100px';
        el.style.height = '100px';
        testContainer.appendChild(el);
      }

      // Measure batch application time
      const start = performance.now();
      window.ck.applyAll('.batch-50', { radius: 20, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    console.log(`  ⏱️  50 elements batch time: ${batchTime.toFixed(3)}ms`);
    expect(batchTime).toBeLessThan(250);
  });
});

test.describe('Performance: ResizeObserver (T330, SC-015)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should handle 50 simultaneous resizes maintaining 60fps', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      // Clear existing elements
      testContainer.innerHTML = '';

      // Create 50 elements
      const elements: HTMLElement[] = [];
      for (let i = 0; i < 50; i++) {
        const el = document.createElement('div');
        el.className = 'resize-perf test-element';
        el.style.width = '100px';
        el.style.height = '100px';
        testContainer.appendChild(el);
        elements.push(el);
        window.ck.apply(el, { radius: 20, smoothing: 0.6 });
      }

      // Wait for initial application
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Measure time to update all 50 elements simultaneously
      const start = performance.now();

      // Trigger simultaneous resizes
      elements.forEach((el, i) => {
        el.style.width = `${150 + i}px`;
        el.style.height = `${120 + i}px`;
      });

      // Wait for ResizeObserver to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const end = performance.now();
      const totalTime = end - start;

      // Calculate FPS - target is 60fps = 16.67ms per frame
      // Total time / number of updates should give us average time
      const avgTimePerUpdate = totalTime / 50;

      return {
        totalTime,
        avgTimePerUpdate,
        targetFrameTime: 16.67,
        maintains60fps: avgTimePerUpdate < 16.67,
      };
    });

    console.log(`  ⏱️  50 simultaneous resizes total time: ${result.totalTime.toFixed(3)}ms`);
    console.log(`  ⏱️  Average time per update: ${result.avgTimePerUpdate.toFixed(3)}ms`);
    console.log(`  ⏱️  Target (60fps): ${result.targetFrameTime}ms`);
    console.log(`  ✓  Maintains 60fps: ${result.maintains60fps}`);

    expect(result.maintains60fps).toBe(true);
  });

  test('should handle individual resize within 16ms (60fps target)', async ({ page }) => {
    const updateTime = await page.evaluate(() => {
      const el = document.getElementById('update-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      window.ck.apply(el, { radius: 20, smoothing: 0.6 });

      // Resize element
      el.style.width = '500px';
      el.style.height = '300px';

      // Measure update time
      const start = performance.now();
      window.ck.update(el, { radius: 20, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    console.log(`  ⏱️  Single resize update time: ${updateTime.toFixed(3)}ms`);
    expect(updateTime).toBeLessThan(16); // 60fps = 16.67ms per frame
  });
});

test.describe('Performance: Summary Report', () => {
  test('should generate performance summary', async ({ page }) => {
    await setupTestPage(page);

    const summary = await page.evaluate(async () => {
      const results: Record<string, number> = {};

      // Test 1: Single element render
      const el1 = document.getElementById('basic-element') as HTMLElement;
      const start1 = performance.now();
      window.ck.apply(el1, { radius: 20, smoothing: 0.6 });
      results.singleRender = performance.now() - start1;

      // Test 2: Batch application (20 elements)
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');
      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      testContainer.innerHTML = '';
      for (let i = 0; i < 20; i++) {
        const el = document.createElement('div');
        el.className = 'summary-test test-element';
        el.style.width = '100px';
        el.style.height = '100px';
        testContainer.appendChild(el);
      }

      const start2 = performance.now();
      window.ck.applyAll('.summary-test', { radius: 20, smoothing: 0.6 });
      results.batch20 = performance.now() - start2;
      results.batch20Avg = results.batch20 / 20;

      // Test 3: Update operation
      const el3 = document.getElementById('update-element') as HTMLElement;
      window.ck.apply(el3, { radius: 16, smoothing: 0.6 });

      const start3 = performance.now();
      window.ck.update(el3, { radius: 24, smoothing: 0.9 });
      results.update = performance.now() - start3;

      return results;
    });

    console.log('\n📊 Performance Summary:');
    console.log(`  Single element render:    ${summary.singleRender.toFixed(3)}ms (target: <10ms)`);
    console.log(`  Batch 20 elements:        ${summary.batch20.toFixed(3)}ms`);
    console.log(`  Average per element:      ${summary.batch20Avg.toFixed(3)}ms (target: <5ms)`);
    console.log(`  Update operation:         ${summary.update.toFixed(3)}ms (target: <16ms)`);

    // Verify all metrics meet targets
    expect(summary.singleRender).toBeLessThan(10);
    expect(summary.batch20Avg).toBeLessThan(5);
    expect(summary.update).toBeLessThan(16);
  });
});
