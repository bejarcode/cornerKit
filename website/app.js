// ============================================================================
// Phase 2: Foundational Infrastructure
// ============================================================================

// ----------------------------------------------------------------------------
// T010: Initialize CornerKit
// ----------------------------------------------------------------------------
const ck = new window.CornerKit.default();

// ----------------------------------------------------------------------------
// T015: Code Generation Engine (5 format templates)
// ----------------------------------------------------------------------------
const codeTemplates = {
  'vanilla-js': (radius, smoothing) => `import CornerKit from '@cornerkit/core';

const ck = new CornerKit();
ck.apply('#my-element', {
  radius: ${radius},
  smoothing: ${smoothing}
});`,

  'html': (radius, smoothing) => `<div
  data-squircle
  data-squircle-radius="${radius}"
  data-squircle-smoothing="${smoothing}"
>
  Your content here
</div>

<script src="https://cdn.jsdelivr.net/npm/@cornerkit/core"></script>
<script>
  // Auto-init will apply squircles to all [data-squircle] elements
  CornerKit.auto();
</script>`,

  'typescript': (radius, smoothing) => `import CornerKit, { type SquircleConfig } from '@cornerkit/core';

const ck = new CornerKit();
const config: SquircleConfig = {
  radius: ${radius},
  smoothing: ${smoothing}
};
ck.apply('#my-element', config);`,

  'react': (radius, smoothing) => `import { Squircle } from '@cornerkit/react';

function MyComponent() {
  return (
    <Squircle radius={${radius}} smoothing={${smoothing}}>
      <div className="card">
        Your content here
      </div>
    </Squircle>
  );
}`,

  'vue': (radius, smoothing) => `<template>
  <Squircle :radius="${radius}" :smoothing="${smoothing}">
    <div class="card">
      Your content here
    </div>
  </Squircle>
</template>

<script setup>
import { Squircle } from '@cornerkit/vue';
</script>`
};

/**
 * Generates code snippet for the specified format
 * @param {string} format - Code format (vanilla-js, html, typescript, react, vue)
 * @param {number} radius - Corner radius (0-100)
 * @param {number} smoothing - Smoothing parameter (0.0-1.0)
 * @returns {string} Generated code snippet
 * @throws {Error} If format or parameters are invalid
 */
function generateCode(format, radius, smoothing) {
  // Validate format
  if (!codeTemplates[format]) {
    throw new Error(`Invalid format: ${format}. Allowed: vanilla-js, html, typescript, react, vue`);
  }

  // Validate radius
  const radiusInt = parseInt(radius, 10);
  if (isNaN(radiusInt) || radiusInt < 0 || radiusInt > 100) {
    throw new Error(`Invalid radius: ${radius}. Must be integer 0-100`);
  }

  // Validate smoothing
  const smoothingFloat = parseFloat(smoothing);
  if (isNaN(smoothingFloat) || smoothingFloat < 0 || smoothingFloat > 1) {
    throw new Error(`Invalid smoothing: ${smoothing}. Must be float 0.0-1.0`);
  }

  // Generate code (performance target: <50ms)
  const startTime = performance.now();
  const code = codeTemplates[format](radiusInt, smoothingFloat);
  const endTime = performance.now();

  // Warn if generation is slow
  if (endTime - startTime > 50) {
    console.warn(`Code generation took ${(endTime - startTime).toFixed(2)}ms (target: <50ms)`);
  }

  return code;
}

/**
 * Updates all code snippet DOM elements with newly generated code
 * @param {number} radius - Current radius value
 * @param {number} smoothing - Current smoothing value
 */
function updateAllCodeSnippets(radius, smoothing) {
  const formats = ['vanilla-js', 'html', 'typescript', 'react', 'vue'];

  formats.forEach(format => {
    const codeElement = document.getElementById(`code-${format}`);
    if (codeElement) {
      try {
        const code = generateCode(format, radius, smoothing);
        codeElement.textContent = code;
      } catch (error) {
        console.error(`Failed to generate ${format} code:`, error);
        codeElement.textContent = '// Error generating code';
      }
    }
  });
}

// ----------------------------------------------------------------------------
// T016: Copy-to-Clipboard with Clipboard API + Fallback
// ----------------------------------------------------------------------------
/**
 * Copies code snippet to clipboard
 * @param {string} formatOrId - Code format (vanilla-js, html, etc.) or element ID (code-vanilla-js)
 * @returns {Promise<void>}
 */
async function copyCode(formatOrId) {
  try {
    // Handle both formats: 'vanilla-js' or 'code-vanilla-js'
    const format = formatOrId.startsWith('code-') ? formatOrId.substring(5) : formatOrId;
    const elementId = formatOrId.startsWith('code-') ? formatOrId : `code-${formatOrId}`;

    const codeElement = document.getElementById(elementId);
    if (!codeElement) {
      throw new Error(`Code element not found: ${elementId}`);
    }

    const code = codeElement.textContent;

    // Modern Clipboard API (Chrome 63+, Firefox 53+, Safari 13.1+)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
      showCopyFeedback(format, 'success');
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        showCopyFeedback(format, 'success');
      } else {
        showCopyFeedback(format, 'fallback');
      }
    }
  } catch (error) {
    console.error('Copy failed:', error);
    const format = formatOrId.startsWith('code-') ? formatOrId.substring(5) : formatOrId;
    showCopyFeedback(format, 'error');
  }
}

/**
 * Shows visual feedback for copy action
 * @param {string} format - Code format
 * @param {string} status - Feedback status (success, fallback, error)
 */
function showCopyFeedback(format, status) {
  const button = document.querySelector(`button[onclick*="copyCode('${format}')"]`);
  if (!button) return;

  const originalText = button.textContent;

  if (status === 'success') {
    button.textContent = 'Copied!';
    button.style.backgroundColor = 'var(--color-success, #10b981)';
  } else if (status === 'fallback') {
    button.textContent = 'Select & copy manually';
    button.style.backgroundColor = 'var(--color-warning, #f59e0b)';
  } else {
    button.textContent = 'Copy failed';
    button.style.backgroundColor = 'var(--color-error, #ef4444)';
  }

  // Reset button after 2 seconds
  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = '';
  }, 2000);
}

// ----------------------------------------------------------------------------
// T017: Browser Tier Detection
// ----------------------------------------------------------------------------
/**
 * Detects browser rendering tier using CornerKit.supports()
 * @returns {string} Browser tier (Tier 1, Tier 2, Tier 3, or Tier 4)
 */
function detectBrowserTier() {
  // Check for Native CSS corner-shape (Tier 1)
  if (CSS.supports && CSS.supports('corner-shape', 'squircle')) {
    return 'Tier 1: Native CSS';
  }

  // Check for Houdini Paint API (Tier 2)
  if ('paintWorklet' in CSS) {
    return 'Tier 2: Houdini Paint API';
  }

  // Check for SVG clip-path (Tier 3)
  // Safari has issues with CSS.supports() for path(), so test both methods
  if (testClipPathSupport()) {
    return 'Tier 3: SVG ClipPath';
  }

  // Fallback to border-radius (Tier 4)
  return 'Tier 4: Border-radius Fallback';
}

/**
 * Tests clip-path path() support via runtime detection
 * Safari's CSS.supports() incorrectly returns false, so we test actual support
 */
function testClipPathSupport() {
  // First try CSS.supports (works in Chrome, Firefox)
  if (CSS.supports && CSS.supports('clip-path', 'path("")')) {
    return true;
  }

  // Safari fallback: Runtime feature test
  // Safari 13.1+ supports clip-path path() but CSS.supports() returns false
  try {
    const testDiv = document.createElement('div');
    testDiv.style.clipPath = "path('M 0,0 L 10,0 L 10,10 L 0,10 Z')";
    // If clip-path was set successfully, it's supported
    return testDiv.style.clipPath !== '';
  } catch {
    return false;
  }
}

/**
 * Displays browser tier badge in UI
 */
function displayBrowserTier() {
  const tier = detectBrowserTier();
  const tierBadges = [
    document.getElementById('browser-tier'),
    document.getElementById('current-tier-badge')
  ];

  tierBadges.forEach(tierBadge => {
    if (tierBadge) {
      tierBadge.textContent = tier;

      // Color-code tier badge
      if (tier.includes('Tier 1')) {
        tierBadge.style.backgroundColor = '#10b981'; // Green
      } else if (tier.includes('Tier 2')) {
        tierBadge.style.backgroundColor = '#3b82f6'; // Blue
      } else if (tier.includes('Tier 3')) {
        tierBadge.style.backgroundColor = '#8b5cf6'; // Purple
      } else {
        tierBadge.style.backgroundColor = '#6b7280'; // Gray
      }
    }
  });

  console.log('Browser tier detected:', tier);
}

// ----------------------------------------------------------------------------
// T018: Keyboard Shortcuts Handler
// ----------------------------------------------------------------------------
/**
 * Handles keyboard shortcuts
 * R - Reset playground to defaults
 * I - Inspect playground element
 */
document.addEventListener('keydown', (e) => {
  // Ignore if user is typing in input/textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  const key = e.key.toLowerCase();

  if (key === 'r') {
    // Reset to defaults
    resetPlayground();
    console.log('⌨️ Keyboard shortcut: Reset to defaults (R)');
  }

  if (key === 'i') {
    // Inspect playground element
    inspectPlayground();
    console.log('⌨️ Keyboard shortcut: Inspect element (I)');
  }
});

/**
 * Resets playground to default values
 */
function resetPlayground() {
  const radiusSlider = document.getElementById('radius-slider');
  const smoothingSlider = document.getElementById('smoothing-slider');
  const radiusValue = document.getElementById('radius-value');
  const smoothingValue = document.getElementById('smoothing-value');

  if (radiusSlider && smoothingSlider) {
    radiusSlider.value = 20;
    smoothingSlider.value = 0.8;

    if (radiusValue) radiusValue.textContent = '20';
    if (smoothingValue) smoothingValue.textContent = '0.80';

    // Update playground preview
    ck.update('#playground-preview', { radius: 20, smoothing: 0.8 });

    // Update code snippets
    updateAllCodeSnippets(20, 0.8);

    // Update ARIA values
    radiusSlider.setAttribute('aria-valuenow', '20');
    smoothingSlider.setAttribute('aria-valuenow', '0.8');
  }
}

/**
 * Inspects playground element and logs to console
 */
function inspectPlayground() {
  const info = ck.inspect('#playground-preview');
  console.log('🔍 Playground inspection:', info);

  // Also display in UI (optional enhancement)
  const metricsDisplay = document.getElementById('performance-metrics');
  if (metricsDisplay && info) {
    metricsDisplay.textContent = JSON.stringify(info, null, 2);
  }
}

// ============================================================================
// Phase 4: User Story 2 - Visual Examples Gallery
// ============================================================================

/**
 * Gallery example components configuration
 * Each object defines an element to apply squircles to
 */
const exampleComponents = [
  // Buttons
  { id: 'button-primary', category: 'button', variant: 'primary', radius: 20, smoothing: 0.8 },
  { id: 'button-secondary', category: 'button', variant: 'secondary', radius: 20, smoothing: 0.8 },
  { id: 'button-ghost', category: 'button', variant: 'ghost', radius: 20, smoothing: 0.8 },
  { id: 'button-disabled', category: 'button', variant: 'disabled', radius: 20, smoothing: 0.8 },

  // Cards
  { id: 'card-product', category: 'card', variant: 'product', radius: 24, smoothing: 0.85 },
  { id: 'card-info', category: 'card', variant: 'info', radius: 20, smoothing: 0.8 },
  { id: 'card-testimonial', category: 'card', variant: 'testimonial', radius: 28, smoothing: 0.9 },

  // Modals
  { id: 'modal-dialog', category: 'modal', variant: 'dialog', radius: 20, smoothing: 0.8 },
  { id: 'modal-alert', category: 'modal', variant: 'alert', radius: 16, smoothing: 0.75 },
  { id: 'modal-confirmation', category: 'modal', variant: 'success', radius: 20, smoothing: 0.85 },

  // Navigation - Tabs
  { id: 'nav-tab-1', category: 'navigation', variant: 'tab', radius: 12, smoothing: 0.8 },
  { id: 'nav-tab-2', category: 'navigation', variant: 'tab', radius: 12, smoothing: 0.8 },
  { id: 'nav-tab-3', category: 'navigation', variant: 'tab', radius: 12, smoothing: 0.8 },

  // Navigation - Pills
  { id: 'nav-pill-1', category: 'navigation', variant: 'pill', radius: 20, smoothing: 0.9 },
  { id: 'nav-pill-2', category: 'navigation', variant: 'pill', radius: 20, smoothing: 0.9 },
  { id: 'nav-pill-3', category: 'navigation', variant: 'pill', radius: 20, smoothing: 0.9 },

  // Navigation - Breadcrumbs
  { id: 'nav-breadcrumbs', category: 'navigation', variant: 'breadcrumbs', radius: 8, smoothing: 0.7 },

  // Images - Avatars
  { id: 'image-avatar-1', category: 'image', variant: 'avatar', radius: 40, smoothing: 0.85 },
  { id: 'image-avatar-2', category: 'image', variant: 'avatar', radius: 40, smoothing: 0.85 },

  // Images - Thumbnails
  { id: 'image-thumbnail-1', category: 'image', variant: 'thumbnail', radius: 16, smoothing: 0.8 },
  { id: 'image-thumbnail-2', category: 'image', variant: 'thumbnail', radius: 16, smoothing: 0.8 },

  // Images - Hero
  { id: 'image-hero', category: 'image', variant: 'hero', radius: 24, smoothing: 0.85 },

  // Forms - Text Inputs
  { id: 'form-text-1', category: 'form', variant: 'text', radius: 12, smoothing: 0.8 },
  { id: 'form-text-2', category: 'form', variant: 'email', radius: 12, smoothing: 0.8 },

  // Forms - Textareas
  { id: 'form-textarea-1', category: 'form', variant: 'textarea', radius: 16, smoothing: 0.85 },
  { id: 'form-textarea-2', category: 'form', variant: 'textarea-large', radius: 16, smoothing: 0.85 }
];

/**
 * Applies squircles to all gallery example components
 * @returns {number} Number of components successfully initialized
 */
function applyToGalleryExamples() {
  let successCount = 0;
  let errorCount = 0;

  exampleComponents.forEach(component => {
    try {
      const element = document.getElementById(component.id);
      if (element) {
        ck.apply(`#${component.id}`, {
          radius: component.radius,
          smoothing: component.smoothing
        });
        successCount++;
      } else {
        console.warn(`Gallery element not found: ${component.id}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`Failed to apply squircle to ${component.id}:`, error);
      errorCount++;
    }
  });

  console.log(`✅ Gallery initialized: ${successCount} components, ${errorCount} errors`);
  return successCount;
}

// ============================================================================
// Phase 6: User Story 4 - Browser Compatibility Information
// ============================================================================

/**
 * Tier definitions with characteristics
 */
const tierDefinitions = {
  tier1: {
    name: 'Native CSS',
    description: 'GPU-accelerated corner-shape: squircle',
    performance: 'Native (0ms JS overhead)',
    browsers: ['Chrome 139+'],
    features: ['Zero JavaScript', 'GPU-accelerated', 'Future-proof']
  },
  tier2: {
    name: 'Houdini Paint API',
    description: 'CSS Paint Worklet on dedicated thread',
    performance: 'Near-native (~2ms init)',
    browsers: ['Chrome 65+', 'Edge 79+'],
    features: ['Off main thread', 'High performance', 'Dynamic']
  },
  tier3: {
    name: 'SVG ClipPath',
    description: 'Dynamic SVG path generation',
    performance: 'Excellent (<10ms per element)',
    browsers: ['All modern browsers', 'Firefox 60+', 'Safari 13.1+'],
    features: ['Wide compatibility', 'Responsive', 'Performant']
  },
  tier4: {
    name: 'Border-Radius Fallback',
    description: 'Standard CSS border-radius',
    performance: 'Native (not true squircles)',
    browsers: ['IE11', 'Legacy browsers'],
    features: ['Universal compatibility', 'Graceful degradation', 'Standard CSS']
  }
};

/**
 * Displays current tier information in the compatibility section
 * This function is called after detectBrowserTier() and displayBrowserTier()
 */
function displayCurrentTier() {
  // Tier is already displayed by displayBrowserTier()
  // This function is for potential future enhancements like showing
  // detailed tier information in a modal or tooltip
  const tier = detectBrowserTier();
  console.log('✅ Compatibility section updated with tier:', tier);
}

// ============================================================================
// Phase 5: User Story 3 - Side-by-Side Comparison
// ============================================================================

/**
 * Current comparison mode (split or overlay)
 */
let comparisonMode = 'split';

/**
 * Toggles between split and overlay comparison modes
 */
function toggleComparisonMode() {
  const comparisonContainer = document.querySelector('.comparison-split');
  const toggleButton = document.getElementById('comparison-toggle');

  if (!comparisonContainer) return;

  if (comparisonMode === 'split') {
    comparisonMode = 'overlay';
    comparisonContainer.classList.add('overlay-mode');
    if (toggleButton) {
      toggleButton.textContent = 'Switch to Split View';
    }
    console.log('🔄 Comparison mode: Overlay');
  } else {
    comparisonMode = 'split';
    comparisonContainer.classList.remove('overlay-mode');
    if (toggleButton) {
      toggleButton.textContent = 'Switch to Overlay View';
    }
    console.log('🔄 Comparison mode: Split');
  }
}

/**
 * Initializes the comparison section
 */
function initializeComparison() {
  // Apply squircle to left comparison element
  ck.apply('#comparison-squircle', { radius: 32, smoothing: 0.8 });

  // Apply border-radius to right comparison element via CSS
  const borderRadiusElement = document.getElementById('comparison-border-radius');
  if (borderRadiusElement) {
    borderRadiusElement.style.borderRadius = '32px';
  }

  // Attach toggle button click handler
  const toggleButton = document.getElementById('comparison-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleComparisonMode);
    toggleButton.textContent = 'Switch to Overlay View';
  }

  console.log('✅ Comparison section initialized');
}

// ============================================================================
// Phase 3: User Story 1 - Live Interactive Playground
// ============================================================================

/**
 * Debounce helper to limit function call frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Updates playground preview with new squircle parameters
 * @param {number} radius - Corner radius
 * @param {number} smoothing - Smoothing parameter
 */
function updatePlaygroundPreview(radius, smoothing) {
  const startTime = performance.now();

  // Update preview element
  ck.update('#playground-preview', { radius, smoothing });

  const endTime = performance.now();
  const renderTime = (endTime - startTime).toFixed(2);

  // Update performance metrics
  displayPerformanceMetrics(renderTime);

  // Update code snippets
  updateAllCodeSnippets(radius, smoothing);
}

/**
 * Displays performance metrics in the UI
 * @param {string} renderTime - Render time in milliseconds
 */
function displayPerformanceMetrics(renderTime) {
  const renderTimeElement = document.getElementById('render-time');
  const dimensionsElement = document.getElementById('dimensions');
  const previewElement = document.getElementById('playground-preview');

  if (renderTimeElement) {
    renderTimeElement.textContent = renderTime;

    // Color-code based on performance target (<100ms)
    if (parseFloat(renderTime) < 100) {
      renderTimeElement.style.color = '#10b981'; // Green
    } else {
      renderTimeElement.style.color = '#f59e0b'; // Orange
    }
  }

  if (dimensionsElement && previewElement) {
    const rect = previewElement.getBoundingClientRect();
    dimensionsElement.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}px`;
  }
}

// Debounced update functions for expensive operations
const debouncedUpdatePreview = debounce((radius, smoothing) => {
  updatePlaygroundPreview(radius, smoothing);
}, 16); // ~60fps for smooth animation

/**
 * Handles radius slider input with immediate visual feedback
 */
function handleRadiusChange(e) {
  const radius = parseInt(e.target.value, 10);
  const smoothing = parseFloat(document.getElementById('smoothing-slider').value);

  // Immediate visual feedback (no debounce)
  const radiusValue = document.getElementById('radius-value');
  if (radiusValue) {
    radiusValue.textContent = radius;
  }

  // Update ARIA value immediately
  e.target.setAttribute('aria-valuenow', radius);

  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    debouncedUpdatePreview(radius, smoothing);
  });
}

/**
 * Handles smoothing slider input with immediate visual feedback
 */
function handleSmoothingChange(e) {
  const smoothing = parseFloat(e.target.value);
  const radius = parseInt(document.getElementById('radius-slider').value, 10);

  // Immediate visual feedback (no debounce)
  const smoothingValue = document.getElementById('smoothing-value');
  if (smoothingValue) {
    smoothingValue.textContent = smoothing.toFixed(2);
  }

  // Update ARIA value immediately
  e.target.setAttribute('aria-valuenow', smoothing);

  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    debouncedUpdatePreview(radius, smoothing);
  });
}

/**
 * Handles code tab switching
 * @param {string} tabName - Tab name (vanilla-js, html, typescript, react, vue)
 */
function switchCodeTab(tabName) {
  // Update tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-gray-700', 'hover:bg-white');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.add('text-gray-700', 'hover:bg-white');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Update code blocks
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    if (block.getAttribute('data-content') === tabName) {
      block.classList.remove('hidden');
    } else {
      block.classList.add('hidden');
    }
  });
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes the demo website on DOMContentLoaded
 */
function initializeDemo() {
  console.log('🚀 CornerKit Demo Website initialized');

  // Display browser tier
  displayBrowserTier();

  // Initialize hero section
  initializeHero();

  // Initialize playground
  const radiusSlider = document.getElementById('radius-slider');
  const smoothingSlider = document.getElementById('smoothing-slider');

  if (radiusSlider && smoothingSlider) {
    const initialRadius = parseInt(radiusSlider.value, 10);
    const initialSmoothing = parseFloat(smoothingSlider.value);

    // Apply squircle to playground preview
    ck.apply('#playground-preview', { radius: initialRadius, smoothing: initialSmoothing });

    // Initialize code snippets with default values
    updateAllCodeSnippets(initialRadius, initialSmoothing);

    // Display initial performance metrics
    displayPerformanceMetrics('0.00');

    // Attach slider event listeners
    radiusSlider.addEventListener('input', handleRadiusChange);
    smoothingSlider.addEventListener('input', handleSmoothingChange);

    console.log('✅ Playground initialized with radius:', initialRadius, 'smoothing:', initialSmoothing);
  }

  // Initialize code tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchCodeTab(tabName);
    });
  });

  // Initialize gallery examples
  const galleryCount = applyToGalleryExamples();
  console.log(`📸 Gallery ready with ${galleryCount} examples`);

  // Initialize comparison section
  initializeComparison();

  // Log available keyboard shortcuts
  console.log('⌨️ Keyboard shortcuts:');
  console.log('  R - Reset playground to defaults (radius: 20, smoothing: 0.8)');
  console.log('  I - Inspect playground element');
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDemo);
} else {
  initializeDemo();
}

// ============================================================================
// Phase 8: User Story 6 - Landing Page & Hero Section
// ============================================================================

/**
 * Initializes the hero section
 */
function initializeHero() {
  // Apply animated squircle to hero demo element
  ck.apply('#hero-demo', {
    radius: 40,
    smoothing: 0.85
  });

  // Setup smooth scroll for CTA buttons
  const playgroundCTA = document.querySelector('a[href="#playground"]');
  if (playgroundCTA) {
    playgroundCTA.addEventListener('click', (e) => {
      e.preventDefault();
      const playgroundSection = document.getElementById('playground');
      if (playgroundSection) {
        playgroundSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  console.log('✅ Hero section initialized');
}

/**
 * Copies the npm install command to clipboard
 */
function copyInstallCommand() {
  const command = 'npm install @cornerkit/core';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(command).then(() => {
      console.log('📋 Install command copied to clipboard');
      showInstallCopyFeedback('success');
    }).catch(error => {
      console.error('Copy failed:', error);
      showInstallCopyFeedback('error');
    });
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = command;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (success) {
      showInstallCopyFeedback('success');
    } else {
      showInstallCopyFeedback('fallback');
    }
  }
}

/**
 * Shows feedback for install command copy
 * @param {string} status - Status (success, fallback, error)
 */
function showInstallCopyFeedback(status) {
  const button = document.querySelector('.hero-quickstart button');
  if (!button) return;

  const originalText = button.textContent;
  const originalBg = button.style.backgroundColor;

  if (status === 'success') {
    button.textContent = 'Copied!';
    button.style.backgroundColor = '#10b981';
  } else if (status === 'fallback') {
    button.textContent = 'Select & copy manually';
    button.style.backgroundColor = '#f59e0b';
  } else {
    button.textContent = 'Copy failed';
    button.style.backgroundColor = '#ef4444';
  }

  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = originalBg;
  }, 2000);
}

// ============================================================================
// Phase 7: User Story 5 - Code Examples & Installation
// ============================================================================

/**
 * Copy code from static code examples in the Code Examples section
 * @param {string} exampleType - Type of example (example-vanilla, example-html, etc.)
 */
function copyStaticExample(exampleType) {
  try {
    // Find the code example by button context
    const button = event.target;
    const codeExample = button.closest('.code-example');

    if (!codeExample) {
      throw new Error('Could not find code example container');
    }

    const codeElement = codeExample.querySelector('code');
    if (!codeElement) {
      throw new Error('Could not find code element');
    }

    const code = codeElement.textContent;

    // Use modern Clipboard API or fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        showCopyFeedbackForButton(button, 'success');
      }).catch(error => {
        console.error('Copy failed:', error);
        showCopyFeedbackForButton(button, 'error');
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        showCopyFeedbackForButton(button, 'success');
      } else {
        showCopyFeedbackForButton(button, 'fallback');
      }
    }
  } catch (error) {
    console.error('Static example copy failed:', error);
    if (event.target) {
      showCopyFeedbackForButton(event.target, 'error');
    }
  }
}

/**
 * Shows visual feedback directly on a button element
 * @param {HTMLElement} button - Button element
 * @param {string} status - Feedback status (success, fallback, error)
 */
function showCopyFeedbackForButton(button, status) {
  const originalText = button.textContent;
  const originalBg = button.style.backgroundColor;

  if (status === 'success') {
    button.textContent = 'Copied!';
    button.style.backgroundColor = '#10b981';
  } else if (status === 'fallback') {
    button.textContent = 'Select & copy manually';
    button.style.backgroundColor = '#f59e0b';
  } else {
    button.textContent = 'Copy failed';
    button.style.backgroundColor = '#ef4444';
  }

  // Reset button after 2 seconds
  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = originalBg;
  }, 2000);
}

// ============================================================================
// Global API (for inline onclick handlers and debugging)
// ============================================================================
window.copyCode = copyCode;
window.copyStaticExample = copyStaticExample;
window.resetPlayground = resetPlayground;
window.inspectPlayground = inspectPlayground;

// ============================================================================
// Initialize AOS (Animate On Scroll)
// ============================================================================
if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });
}
