// ============================================================================
// CornerKit Demo Website - Wrapped in IIFE to prevent global pollution
// ============================================================================
(function() {
'use strict';

// ============================================================================
// Phase 2: Foundational Infrastructure
// ============================================================================

// ----------------------------------------------------------------------------
// T010: Initialize CornerKit
// ----------------------------------------------------------------------------
console.log('🔍 Debug: window.CornerKit =', window.CornerKit);
console.log('🔍 Debug: window.CornerKit.default =', window.CornerKit?.default);

if (!window.CornerKit || !window.CornerKit.default) {
  console.error('❌ CornerKit library not loaded! Check if cornerkit.js is loaded before app.js');
  throw new Error('CornerKit library not available');
}

const ck = new window.CornerKit.default();
console.log('✅ CornerKit instance created:', ck);

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

<script src="https://cdn.jsdelivr.net/npm/@cornerkit/core@1.1.0"></script>
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
 * @param {Object} borderConfig - Optional border configuration
 */
function updateAllCodeSnippets(radius, smoothing, borderConfig = null) {
  console.log('🔍 updateAllCodeSnippets called with radius:', radius, 'smoothing:', smoothing, 'border:', borderConfig);
  const formats = ['vanilla-js', 'html', 'typescript', 'react', 'vue'];

  formats.forEach(format => {
    const codeElement = document.getElementById(`code-${format}`);
    if (codeElement) {
      try {
        const code = generateCodeWithBorder(format, radius, smoothing, borderConfig);
        codeElement.textContent = code;
        console.log(`✅ Generated ${format} code (${code.length} chars)`);
      } catch (error) {
        console.error(`❌ Failed to generate ${format} code:`, error);
        codeElement.textContent = '// Error generating code';
      }
    } else {
      console.warn(`⚠️ Code element #code-${format} not found in DOM`);
    }
  });
}

/**
 * Generates code with optional border configuration
 * @param {string} format - Code format
 * @param {number} radius - Corner radius
 * @param {number} smoothing - Smoothing value
 * @param {Object} borderConfig - Border configuration
 * @returns {string} Generated code
 */
function generateCodeWithBorder(format, radius, smoothing, borderConfig) {
  const hasBorder = borderConfig && borderConfig.enabled;

  const codeTemplatesWithBorder = {
    'vanilla-js': () => {
      if (hasBorder) {
        return `import CornerKit from '@cornerkit/core';

// Create instance
const ck = new CornerKit();

// Apply to element with border
ck.apply('#my-element', {
  radius: ${radius},
  smoothing: ${smoothing},
  borderWidth: ${borderConfig.width},
  borderColor: '${borderConfig.color}'
});`;
      }
      return codeTemplates['vanilla-js'](radius, smoothing);
    },

    'html': () => {
      if (hasBorder) {
        return `<div
  data-squircle
  data-squircle-radius="${radius}"
  data-squircle-smoothing="${smoothing}"
  style="border: none;"
>
  Your content here
</div>

<!-- Note: Border support requires JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/@cornerkit/core@1.1.0"></script>
<script>
  const ck = new CornerKit();
  ck.apply('[data-squircle]', {
    radius: ${radius},
    smoothing: ${smoothing},
    borderWidth: ${borderConfig.width},
    borderColor: '${borderConfig.color}'
  });
</script>`;
      }
      return codeTemplates['html'](radius, smoothing);
    },

    'typescript': () => {
      if (hasBorder) {
        return `import CornerKit, { type SquircleConfig } from '@cornerkit/core';

const ck = new CornerKit();
const config: SquircleConfig = {
  radius: ${radius},
  smoothing: ${smoothing},
  borderWidth: ${borderConfig.width},
  borderColor: '${borderConfig.color}'
};
ck.apply('#my-element', config);`;
      }
      return codeTemplates['typescript'](radius, smoothing);
    },

    'react': () => {
      if (hasBorder) {
        return `import { Squircle } from '@cornerkit/react';

function App() {
  return (
    <Squircle
      radius={${radius}}
      smoothing={${smoothing}}
      borderWidth={${borderConfig.width}}
      borderColor="${borderConfig.color}"
      style={{ border: 'none' }}
    >
      Your content here
    </Squircle>
  );
}`;
      }
      return codeTemplates['react'](radius, smoothing);
    },

    'vue': () => {
      if (hasBorder) {
        return `<template>
  <Squircle
    :radius="${radius}"
    :smoothing="${smoothing}"
    :borderWidth="${borderConfig.width}"
    borderColor="${borderConfig.color}"
    style="border: none"
  >
    Your content here
  </Squircle>
</template>

<script setup>
import { Squircle } from '@cornerkit/vue';
</script>`;
      }
      return codeTemplates['vue'](radius, smoothing);
    }
  };

  return codeTemplatesWithBorder[format]();
}

// ----------------------------------------------------------------------------
// T016: Copy-to-Clipboard with Clipboard API + Fallback
// ----------------------------------------------------------------------------
/**
 * Copies code snippet to clipboard
 * @param {string} formatOrId - Code format (vanilla-js, html, etc.) or element ID (code-vanilla-js)
 * @returns {Promise<void>}
 */
async function copyCode(targetId, button) {
  try {
    const codeElement = document.getElementById(targetId);
    if (!codeElement) {
      throw new Error(`Code element not found: ${targetId}`);
    }

    const code = codeElement.textContent;

    // Modern Clipboard API (Chrome 63+, Firefox 53+, Safari 13.1+)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
      showCopyFeedback(button, 'success');
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
        showCopyFeedback(button, 'success');
      } else {
        showCopyFeedback(button, 'fallback');
      }
    }
  } catch (error) {
    console.error('Copy failed:', error);
    showCopyFeedback(button, 'error');
  }
}

/**
 * Shows visual feedback for copy action
 * @param {HTMLElement} button - Button element to show feedback on
 * @param {string} status - Feedback status (success, fallback, error)
 */
function showCopyFeedback(button, status) {
  if (!button) return;

  const originalText = button.textContent;

  // Remove any existing state classes
  button.classList.remove('btn-copy-success', 'btn-copy-error', 'btn-copy-fallback');

  if (status === 'success') {
    button.textContent = 'Copied!';
    button.classList.add('btn-copy-success');
  } else if (status === 'fallback') {
    button.textContent = 'Select & copy manually';
    button.classList.add('btn-copy-fallback');
  } else {
    button.textContent = 'Copy failed';
    button.classList.add('btn-copy-error');
  }

  // Reset button after 2 seconds
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('btn-copy-success', 'btn-copy-error', 'btn-copy-fallback');
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
  // Note: Native CSS corner-shape (Tier 1) and Houdini Paint API (Tier 2) are disabled
  // Chrome falsely reports CSS.supports('corner-shape', 'squircle') as true but doesn't render it
  // Houdini detection only checks for paintWorklet API, not actual squircle worklet registration

  // Check for SVG clip-path (Tier 3) - Current primary implementation
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
  const isDark = document.documentElement.classList.contains('dark') ||
                  document.documentElement.getAttribute('data-theme') === 'dark';
  
  const tierBadges = [
    document.getElementById('browser-tier'),
    document.getElementById('current-tier-badge')
  ];

  tierBadges.forEach(tierBadge => {
    if (tierBadge) {
      tierBadge.textContent = tier;

      // Remove Tailwind classes that might conflict
      tierBadge.classList.remove('bg-blue-100', 'text-blue-800', 'bg-blue-600', 'dark:bg-purple-600', 'dark:text-white');

      // Color-code tier badge with theme-aware colors
      // Inline styles have higher specificity than classes
      if (tier.includes('Tier 1')) {
        tierBadge.style.backgroundColor = '#10b981'; // Green
        tierBadge.style.color = '#ffffff';
      } else if (tier.includes('Tier 2')) {
        tierBadge.style.backgroundColor = '#3b82f6'; // Blue
        tierBadge.style.color = '#ffffff';
      } else if (tier.includes('Tier 3')) {
        tierBadge.style.backgroundColor = '#8b5cf6'; // Purple
        tierBadge.style.color = '#ffffff';
      } else {
        tierBadge.style.backgroundColor = isDark ? '#4b5563' : '#6b7280'; // Gray
        tierBadge.style.color = '#ffffff';
      }
      
      // Ensure styles are applied (force reflow)
      void tierBadge.offsetHeight;
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

  // Ignore if modifier keys are pressed (don't interfere with browser shortcuts)
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
    return;
  }

  const key = e.key.toLowerCase();

  if (key === 'r') {
    // Reset to defaults
    e.preventDefault();
    resetPlayground();
    console.log('⌨️ Keyboard shortcut: Reset to defaults (R)');
  }

  if (key === 'i') {
    // Inspect playground element
    e.preventDefault();
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

  // Bordered Elements
  { id: 'border-card-1', category: 'border', variant: 'card', radius: 20, smoothing: 0.8, borderWidth: 2, borderColor: '#d1d5db' },
  { id: 'border-card-2', category: 'border', variant: 'card-colored', radius: 24, smoothing: 0.85, borderWidth: 3, borderColor: '#3b82f6' },
  { id: 'border-button-1', category: 'border', variant: 'button', radius: 20, smoothing: 0.8, borderWidth: 2, borderColor: '#9ca3af' },
  { id: 'border-button-2', category: 'border', variant: 'button-purple', radius: 20, smoothing: 0.8, borderWidth: 2, borderColor: '#a855f7' },

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

  // Images - Thumbnails
  { id: 'image-thumbnail-1', category: 'image', variant: 'thumbnail', radius: 16, smoothing: 0.8 },
  { id: 'image-thumbnail-2', category: 'image', variant: 'thumbnail', radius: 16, smoothing: 0.8 },

  // Images - Hero
  { id: 'image-hero', category: 'image', variant: 'hero', radius: 24, smoothing: 0.85 },

  // Forms - Text Inputs (with borders applied to wrappers, not inputs directly)
  { id: 'form-text-1-wrapper', category: 'form', variant: 'text', radius: 12, smoothing: 0.8, borderWidth: 2, borderColor: '#d1d5db' },
  { id: 'form-text-2-wrapper', category: 'form', variant: 'email', radius: 12, smoothing: 0.8, borderWidth: 2, borderColor: '#d1d5db' },

  // Forms - Textareas (applying border to wrapper due to textarea overflow restrictions)
  { id: 'form-textarea-wrapper', category: 'form', variant: 'textarea', radius: 16, smoothing: 0.85, borderWidth: 2, borderColor: '#d1d5db' },
  { id: 'form-textarea-2', category: 'form', variant: 'textarea-large', radius: 16, smoothing: 0.85, borderWidth: 2, borderColor: '#d1d5db' }
];

/**
 * Gets appropriate border color based on current theme
 * @param {string} lightColor - Color for light mode
 * @param {string} darkColor - Color for dark mode
 * @returns {string} Appropriate color for current theme
 */
function getThemeBorderColor(lightColor, darkColor) {
  const isDark = document.documentElement.classList.contains('dark') ||
                  document.documentElement.getAttribute('data-theme') === 'dark';
  return isDark ? darkColor : lightColor;
}

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
        const config = {
          radius: component.radius,
          smoothing: component.smoothing
        };

        // Add border properties if they exist
        if (component.borderWidth !== undefined) {
          config.borderWidth = component.borderWidth;
        }
        if (component.borderColor !== undefined) {
          // Use theme-aware border colors
          let borderColor = component.borderColor;
          
          // Map light colors to dark mode equivalents
          if (component.id === 'border-card-1') {
            borderColor = getThemeBorderColor('#d1d5db', '#4b5563'); // Light gray -> Dark gray
          } else if (component.id === 'border-button-1') {
            borderColor = getThemeBorderColor('#9ca3af', '#6b7280'); // Medium gray -> Lighter gray
          } else if (component.id === 'form-text-1-wrapper' ||
                     component.id === 'form-text-2-wrapper' ||
                     component.id === 'form-textarea-wrapper') {
            borderColor = getThemeBorderColor('#d1d5db', '#6b7280'); // Light gray -> gray-500 for better contrast
          }
          // border-card-2 and border-button-2 use blue/purple which work in both modes
          
          config.borderColor = borderColor;
        }

        ck.apply(`#${component.id}`, config);

        // Set form wrapper background color for the ::after pseudo-element
        if (component.id === 'form-text-1-wrapper' ||
            component.id === 'form-text-2-wrapper' ||
            component.id === 'form-textarea-wrapper') {
          const isDark = document.documentElement.classList.contains('dark') ||
                         document.documentElement.getAttribute('data-theme') === 'dark';
          const bgColor = isDark ? '#374151' : '#ffffff'; // gray-700 : white
          element.style.setProperty('--squircle-content-bg-color', bgColor);
        }

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
    const context = this; // Preserve context
    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Updates playground preview with new squircle parameters
 * @param {number} radius - Corner radius
 * @param {number} smoothing - Smoothing parameter
 * @param {Object} borderConfig - Optional border configuration
 * @param {boolean} borderConfig.enabled - Whether border is enabled
 * @param {number} borderConfig.width - Border width in pixels
 * @param {string} borderConfig.color - Border color
 */
function updatePlaygroundPreview(radius, smoothing, borderConfig = null) {
  const startTime = performance.now();

  // Build config object
  const config = { radius, smoothing };

  // Add border properties if enabled
  if (borderConfig && borderConfig.enabled) {
    config.borderWidth = borderConfig.width;
    config.borderColor = borderConfig.color;
  }

  // Update preview element
  ck.update('#playground-preview', config);

  const endTime = performance.now();
  const renderTime = (endTime - startTime).toFixed(2);

  // Update performance metrics
  displayPerformanceMetrics(renderTime);

  // Update code snippets with border info
  updateAllCodeSnippets(radius, smoothing, borderConfig);
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
const debouncedUpdatePreview = debounce((radius, smoothing, borderConfig) => {
  updatePlaygroundPreview(radius, smoothing, borderConfig);
}, 16); // ~60fps for smooth animation

/**
 * Gets current border configuration from UI controls
 * @returns {Object} Border configuration object
 */
function getBorderConfig() {
  const toggle = document.getElementById('border-toggle');
  const widthSlider = document.getElementById('border-width-slider');
  const colorInput = document.getElementById('border-color-input');

  return {
    enabled: toggle ? toggle.checked : false,
    width: widthSlider ? parseInt(widthSlider.value, 10) : 2,
    color: colorInput ? colorInput.value : '#3b82f6'
  };
}

/**
 * Handles radius slider input with immediate visual feedback
 */
function handleRadiusChange(e) {
  const radius = parseInt(e.target.value, 10);
  const smoothing = parseFloat(document.getElementById('smoothing-slider').value);
  const borderConfig = getBorderConfig();

  // Immediate visual feedback (no debounce)
  const radiusValue = document.getElementById('radius-value');
  if (radiusValue) {
    radiusValue.textContent = radius;
  }

  // Update ARIA value immediately
  e.target.setAttribute('aria-valuenow', radius);

  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    debouncedUpdatePreview(radius, smoothing, borderConfig);
  });
}

/**
 * Handles smoothing slider input with immediate visual feedback
 */
function handleSmoothingChange(e) {
  const smoothing = parseFloat(e.target.value);
  const radius = parseInt(document.getElementById('radius-slider').value, 10);
  const borderConfig = getBorderConfig();

  // Immediate visual feedback (no debounce)
  const smoothingValue = document.getElementById('smoothing-value');
  if (smoothingValue) {
    smoothingValue.textContent = smoothing.toFixed(2);
  }

  // Update ARIA value immediately
  e.target.setAttribute('aria-valuenow', smoothing);

  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    debouncedUpdatePreview(radius, smoothing, borderConfig);
  });
}

/**
 * Handles border toggle checkbox change
 */
function handleBorderToggle(e) {
  const borderControls = document.getElementById('border-controls');
  if (borderControls) {
    if (e.target.checked) {
      borderControls.classList.remove('hidden');
    } else {
      borderControls.classList.add('hidden');
    }
  }

  // Update preview with current values
  const radius = parseInt(document.getElementById('radius-slider').value, 10);
  const smoothing = parseFloat(document.getElementById('smoothing-slider').value);
  const borderConfig = getBorderConfig();

  requestAnimationFrame(() => {
    debouncedUpdatePreview(radius, smoothing, borderConfig);
  });
}

/**
 * Handles border width slider change
 */
function handleBorderWidthChange(e) {
  const widthValue = document.getElementById('border-width-value');
  if (widthValue) {
    widthValue.textContent = e.target.value;
  }

  const radius = parseInt(document.getElementById('radius-slider').value, 10);
  const smoothing = parseFloat(document.getElementById('smoothing-slider').value);
  const borderConfig = getBorderConfig();

  requestAnimationFrame(() => {
    debouncedUpdatePreview(radius, smoothing, borderConfig);
  });
}

/**
 * Handles border color change
 */
function handleBorderColorChange(color) {
  const colorValue = document.getElementById('border-color-value');
  const colorPicker = document.getElementById('border-color-picker');
  const colorInput = document.getElementById('border-color-input');

  if (colorValue) colorValue.textContent = color;
  if (colorPicker && colorPicker.value !== color) colorPicker.value = color;
  if (colorInput && colorInput.value !== color) colorInput.value = color;

  const radius = parseInt(document.getElementById('radius-slider').value, 10);
  const smoothing = parseFloat(document.getElementById('smoothing-slider').value);
  const borderConfig = getBorderConfig();

  requestAnimationFrame(() => {
    debouncedUpdatePreview(radius, smoothing, borderConfig);
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
  console.log('🔍 DOM ready state:', document.readyState);
  console.log('🔍 CornerKit instance:', ck);

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

    // Mark as ready to prevent FOUC - swap pending class for ready class
    const preview = document.getElementById('playground-preview');
    if (preview) {
      preview.classList.remove('squircle-pending');
      preview.classList.add('squircle-ready');
    }

    // Initialize code snippets with default values
    updateAllCodeSnippets(initialRadius, initialSmoothing);

    // Display initial performance metrics
    displayPerformanceMetrics('0.00');

    // Attach slider event listeners
    radiusSlider.addEventListener('input', handleRadiusChange);
    smoothingSlider.addEventListener('input', handleSmoothingChange);

    // Attach border control event listeners
    const borderToggle = document.getElementById('border-toggle');
    const borderWidthSlider = document.getElementById('border-width-slider');
    const borderColorPicker = document.getElementById('border-color-picker');
    const borderColorInput = document.getElementById('border-color-input');

    if (borderToggle) {
      borderToggle.addEventListener('change', handleBorderToggle);
    }
    if (borderWidthSlider) {
      borderWidthSlider.addEventListener('input', handleBorderWidthChange);
    }
    if (borderColorPicker) {
      borderColorPicker.addEventListener('input', (e) => handleBorderColorChange(e.target.value));
    }
    if (borderColorInput) {
      borderColorInput.addEventListener('input', (e) => handleBorderColorChange(e.target.value));
    }

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

  // Ensure first tab (vanilla-js) is visible and active
  switchCodeTab('vanilla-js');

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
  // Use a small delay to ensure all scripts are loaded
  function startInitialization() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeDemo);
    } else {
      // DOM is already ready, but wait a tick to ensure scripts are fully loaded
      setTimeout(initializeDemo, 0);
    }
  }

  startInitialization();

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

  // Mark as ready to prevent FOUC
  const heroDemo = document.getElementById('hero-demo');
  if (heroDemo) {
    heroDemo.classList.remove('squircle-pending');
    heroDemo.classList.add('squircle-ready');
  }

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
 * @param {HTMLElement} button - Button that triggered the copy
 */
function copyInstallCommand(button) {
  const command = 'npm install @cornerkit/core';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(command).then(() => {
      console.log('📋 Install command copied to clipboard');
      showCopyFeedback(button, 'success');
    }).catch(error => {
      console.error('Copy failed:', error);
      showCopyFeedback(button, 'error');
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
      showCopyFeedback(button, 'success');
    } else {
      showCopyFeedback(button, 'fallback');
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
function copyStaticExample(button) {
  try {
    // Find the code example by button context
    const codeExample = button.closest('.code-example, .bg-gray-50, .relative');

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
        showCopyFeedback(button, 'success');
      }).catch(error => {
        console.error('Copy failed:', error);
        showCopyFeedback(button, 'error');
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
        showCopyFeedback(button, 'success');
      } else {
        showCopyFeedback(button, 'fallback');
      }
    }
  } catch (error) {
    console.error('Static example copy failed:', error);
    showCopyFeedback(button, 'error');
  }
}

// ============================================================================
// Event Delegation (instead of inline onclick handlers)
// ============================================================================
document.addEventListener('click', function(e) {
  const target = e.target;
  const action = target.getAttribute('data-action');

  if (!action) return;

  // Handle different actions
  if (action === 'copy-code') {
    e.preventDefault();
    const targetId = target.getAttribute('data-target');
    if (targetId) {
      copyCode(targetId, target);
    }
  } else if (action === 'copy-install') {
    e.preventDefault();
    copyInstallCommand(target);
  } else if (action === 'copy-static-example') {
    e.preventDefault();
    copyStaticExample(target);
  }
});

// ============================================================================
// Dark Mode Toggle - Safari Optimized
// ============================================================================
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
  // Detect Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Toggle dark mode on click
  darkModeToggle.addEventListener('click', function() {
    const html = document.documentElement;
    const body = document.body;
    
    // Toggle dark class
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    
    // Save preference
    localStorage.setItem('darkMode', isDark.toString());
    
    // Set data attribute
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Set color-scheme CSS property for all browsers
    html.style.colorScheme = isDark ? 'dark' : 'light';

    // Update browser tier badge colors immediately
    displayBrowserTier();

    // Force browser to recalculate styles (applies to ALL browsers, not just Safari)
    const forceRepaint = () => {
      // Method 1: Trigger reflow on html element
      void html.offsetHeight;

      // Method 2: Temporarily modify display to force full recalculation
      const originalDisplay = body.style.display;
      body.style.display = 'none';
      void body.offsetHeight; // Force reflow
      body.style.display = originalDisplay;

      // Method 3: Force style recalculation on key container elements
      const containers = document.querySelectorAll('main, section, header, footer');
      containers.forEach(el => void el.offsetHeight);
    };

    // Execute repaint immediately
    forceRepaint();

    // Also trigger after a microtask to ensure styles fully apply
    Promise.resolve().then(() => {
      forceRepaint();
    });

    // Reapply borders with theme-appropriate colors
    // Use double requestAnimationFrame to ensure styles have fully recalculated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        exampleComponents.forEach(component => {
          if (component.borderWidth !== undefined && component.borderColor !== undefined) {
            try {
              const element = document.getElementById(component.id);
              if (element) {
                // Get current config or use defaults
                const currentConfig = ck.inspect(`#${component.id}`);
                const config = {
                  radius: component.radius,
                  smoothing: component.smoothing,
                  borderWidth: component.borderWidth
                };

                // Determine border color based on theme
                let borderColor = component.borderColor;
                if (component.id === 'border-card-1') {
                  borderColor = isDark ? '#4b5563' : '#d1d5db';
                } else if (component.id === 'border-button-1') {
                  borderColor = isDark ? '#6b7280' : '#9ca3af';
                } else if (component.id === 'form-text-1-wrapper' ||
                           component.id === 'form-text-2-wrapper' ||
                           component.id === 'form-textarea-wrapper') {
                  borderColor = isDark ? '#6b7280' : '#d1d5db'; // gray-500 for better contrast
                }
                // border-card-2 and border-button-2 keep their colors (blue/purple work in both)

                config.borderColor = borderColor;

                // Reapply the full config to ensure it updates
                ck.apply(`#${component.id}`, config);

                // Update form wrapper background color for the ::after pseudo-element
                if (component.id === 'form-text-1-wrapper' ||
                    component.id === 'form-text-2-wrapper' ||
                    component.id === 'form-textarea-wrapper') {
                  const bgColor = isDark ? '#374151' : '#ffffff'; // gray-700 : white
                  element.style.setProperty('--squircle-content-bg-color', bgColor);
                }
              }
            } catch (error) {
              console.warn(`Failed to update border color for ${component.id}:`, error);
            }
          }
        });

        // Reinitialize Lucide icons after all updates
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      });
    });
  });
}

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

// ============================================================================
// Initialize Lucide Icons
// ============================================================================
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

})(); // End IIFE
