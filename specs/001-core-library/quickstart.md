# Quick Start Guide: cornerKit Core Library

**Target**: Get iOS-style squircle corners working in under 5 minutes

**Audience**: Frontend developers familiar with JavaScript/TypeScript and npm

---

## 1. Installation (30 seconds)

```bash
# Using npm
npm install @cornerkit/core

# Using pnpm
pnpm add @cornerkit/core

# Using yarn
yarn add @cornerkit/core
```

**Requirements**:
- Node.js 16+ (for build tools)
- Modern browser support: Chrome 65+, Firefox (latest 2), Safari 14+, Edge 79+
- Fallback works in IE11 (border-radius only)

---

## 2. Basic Usage (2 minutes)

### Option A: JavaScript (ES Modules)

```javascript
// Import the library
import CornerKit from '@cornerkit/core';

// Create an instance
const ck = new CornerKit();

// Apply to a single element
ck.apply('#my-button');
```

### Option B: TypeScript

```typescript
import CornerKit, { SquircleConfig } from '@cornerkit/core';

const ck = new CornerKit();

// Type-safe configuration
const config: SquircleConfig = {
  radius: 24,
  smoothing: 0.85
};

ck.apply('#my-button', config);
```

### Option C: UMD (Browser <script> tag)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="node_modules/@cornerkit/core/dist/cornerkit.js"></script>
</head>
<body>
  <button id="my-button">Click me</button>

  <script>
    const ck = new CornerKit();
    ck.apply('#my-button');
  </script>
</body>
</html>
```

---

## 3. Complete Example (3 minutes)

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>cornerKit Example</title>
  <style>
    .button {
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.2s;

      /* IMPORTANT: Use outline for focus, not border */
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    .button:hover {
      transform: scale(1.05);
    }

    .button:focus {
      outline-color: #667eea;
    }

    .card {
      width: 300px;
      padding: 24px;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <button class="button" id="my-button">Squircle Button</button>
  <div class="card" id="my-card">
    <h2>Squircle Card</h2>
    <p>This card has iOS-style squircle corners!</p>
  </div>

  <script type="module">
    import CornerKit from './node_modules/@cornerkit/core/dist/cornerkit.esm.js';

    const ck = new CornerKit({
      radius: 20,     // Default radius
      smoothing: 0.8  // iOS-like smoothness
    });

    // Apply to button
    ck.apply('#my-button');

    // Apply to card with custom config
    ck.apply('#my-card', {
      radius: 24,
      smoothing: 0.9
    });
  </script>
</body>
</html>
```

**Expected Result**: Both elements now have smooth, iOS-style squircle corners!

---

## 4. Common Use Cases

### Use Case 1: Batch Application

Apply squircles to multiple elements at once:

```javascript
const ck = new CornerKit({ radius: 20, smoothing: 0.8 });

// Apply to all buttons
ck.applyAll('.button');

// Apply to all cards with custom config
ck.applyAll('.card', { radius: 24, smoothing: 0.85 });
```

### Use Case 2: Declarative HTML (Data Attributes)

Use HTML data attributes for configuration:

```html
<!-- Minimal (uses global defaults) -->
<button data-squircle>Click me</button>

<!-- Custom radius -->
<div data-squircle data-squircle-radius="32">
  Card content
</div>

<!-- Custom radius and smoothing -->
<div
  data-squircle
  data-squircle-radius="24"
  data-squircle-smoothing="0.9"
>
  Smooth card
</div>
```

```javascript
// Auto-detect and apply to all data-squircle elements
const ck = new CornerKit();
ck.auto(); // That's it!
```

### Use Case 3: Dynamic Updates

Update squircle configuration after initial application:

```javascript
const ck = new CornerKit();

// Apply initially
ck.apply('#my-button', { radius: 20 });

// Later: Update radius on hover
const button = document.getElementById('my-button');
button.addEventListener('mouseenter', () => {
  ck.update('#my-button', { radius: 28 });
});

button.addEventListener('mouseleave', () => {
  ck.update('#my-button', { radius: 20 });
});
```

### Use Case 4: Cleanup (SPA)

Clean up when component unmounts (React, Vue, etc.):

```javascript
const ck = new CornerKit();

// Apply squircles
ck.applyAll('.button');

// Later: Route change or component unmount
ck.destroy(); // Removes all squircles, disconnects observers
```

---

## 5. Configuration Reference

### SquircleConfig

| Property | Type | Range | Default | Description |
|----------|------|-------|---------|-------------|
| `radius` | number | >= 0 | 20 | Corner radius in pixels |
| `smoothing` | number | [0, 1] | 0.8 | Smoothing factor (0=square, 1=circle) |
| `tier` | string | 'native' \| 'houdini' \| 'clippath' \| 'fallback' | auto-detect | Force specific renderer tier (optional) |

### Smoothing Guide

- **0.0**: Square corners (exponent n=4)
- **0.5**: Moderate squircle
- **0.6**: Noticeable squircle
- **0.7**: Smooth squircle
- **0.8**: iOS-like appearance (RECOMMENDED)
- **0.9**: Very smooth, almost circular
- **1.0**: Perfect circle (exponent n=2)

### Radius Guide

- **12-16px**: Small buttons, tags, badges
- **20-24px**: Medium buttons, cards (DEFAULT range)
- **32-48px**: Large hero sections, modals
- **>48px**: Extra large elements

---

## 6. Important Notes

### Accessibility: Focus Indicators

**⚠️ CRITICAL**: Use `outline` instead of `border` for focus indicators!

The `clip-path` property clips borders but NOT outlines. This ensures focus indicators remain visible for keyboard navigation.

```css
/* ✅ RECOMMENDED: Use outline */
.button {
  outline: 2px solid blue;
  outline-offset: 2px; /* Push outline outside clip-path */
}

.button:focus {
  outline-color: blue;
}

/* ❌ AVOID: border will be clipped and invisible */
.button {
  border: 2px solid blue; /* Will be invisible with squircle! */
}
```

### Reduced Motion

The library automatically respects `prefers-reduced-motion`:

```css
/* User has enabled "Reduce Motion" in OS settings */
@media (prefers-reduced-motion: reduce) {
  /* cornerKit disables transitions automatically */
}
```

### Performance Tips

**For 100+ elements**: Use `auto()` with data attributes instead of `applyAll()`

```javascript
// ❌ SLOW: Blocks main thread
ck.applyAll('.item'); // 100+ elements processed immediately

// ✅ FAST: Lazy loading with IntersectionObserver
ck.auto(); // Only visible elements processed initially
```

**For responsive designs**: Let ResizeObserver handle updates automatically

```javascript
// ❌ Manual updates on resize
window.addEventListener('resize', () => {
  ck.update('#my-button', { radius: newRadius });
});

// ✅ Automatic updates (ResizeObserver built-in)
ck.apply('#my-button'); // Handles resize automatically
```

---

## 7. Troubleshooting

### Squircle not appearing?

1. **Check element dimensions**: Elements with 0×0 dimensions are skipped
   ```javascript
   const element = document.getElementById('my-element');
   console.log(element.offsetWidth, element.offsetHeight); // Must be > 0
   ```

2. **Check element visibility**: Hidden elements (`display: none`) are deferred
   ```javascript
   const info = ck.inspect('#my-element');
   console.log(info); // null if not managed yet
   ```

3. **Check browser support**: Verify tier detection
   ```javascript
   const support = CornerKit.supports();
   console.log(support); // { clippath: true, ... }
   ```

### Focus ring clipped?

Use `outline` instead of `border` (see Accessibility section above)

### Performance issues?

1. Use `auto()` for lazy loading with many elements
2. Check ResizeObserver debouncing (automatic via RAF)
3. Verify element count: `ck.inspect()` returns info per element

### TypeScript errors?

Ensure types are imported:

```typescript
import CornerKit, { SquircleConfig, RendererTier } from '@cornerkit/core';
```

---

## 8. Next Steps

### Framework Integrations

Once you're comfortable with the core library, explore framework-specific wrappers:

- **React**: `@cornerkit/react` (Coming in Phase 3)
- **Vue**: `@cornerkit/vue` (Coming in Phase 3)
- **Web Component**: `@cornerkit/web-component` (Coming in Phase 3)

### Advanced Usage

- Custom renderer tiers (Houdini Paint API - Phase 2)
- Native CSS `corner-shape` (Phase 2, Chrome 139+)
- Animation and transitions
- Integration with design systems

### API Documentation

See [api.md](./contracts/api.md) for complete API reference with all methods, parameters, and error handling.

### Type Definitions

See [types.ts](./contracts/types.ts) for complete TypeScript type definitions.

---

## 9. Example Projects

### Vanilla JavaScript
```
examples/vanilla-js/
├── index.html
├── styles.css
└── main.js
```

### React (TypeScript)
```
examples/react-app/
├── src/
│   ├── App.tsx
│   └── components/SquircleButton.tsx
└── package.json
```

### Vue 3 (Composition API)
```
examples/vue-app/
├── src/
│   ├── App.vue
│   └── components/SquircleCard.vue
└── package.json
```

---

## 10. Support & Resources

### Documentation
- [Feature Specification](../spec.md)
- [Implementation Plan](../plan.md)
- [API Reference](./contracts/api.md)
- [Type Definitions](./contracts/types.ts)

### Community
- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions, share examples
- **Twitter**: Follow @cornerkit for updates

### Performance Monitoring
- **Bundle Size**: <5KB gzipped (verified via bundlephobia)
- **Lighthouse**: 100/100 performance, >95 accessibility
- **Browser Support**: Chrome 65+, Firefox, Safari 14+, Edge 79+, IE11 fallback

---

## Quick Reference Card

```javascript
import CornerKit from '@cornerkit/core';

// 1. Create instance
const ck = new CornerKit({ radius: 20, smoothing: 0.8 });

// 2. Apply to single element
ck.apply('#my-button');
ck.apply(element, { radius: 32 });

// 3. Apply to multiple elements
ck.applyAll('.button');

// 4. Auto-detect data attributes
ck.auto();

// 5. Update existing squircle
ck.update('#my-button', { radius: 28 });

// 6. Remove squircle
ck.remove('#my-button');

// 7. Inspect configuration
const info = ck.inspect('#my-button');

// 8. Clean up everything
ck.destroy();

// 9. Check browser support
const support = CornerKit.supports();
```

---

**Time to First Squircle**: < 5 minutes ✅

**Questions?** See [API Reference](./contracts/api.md) or open a GitHub issue.
