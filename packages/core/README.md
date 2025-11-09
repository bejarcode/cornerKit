# @cornerkit/core

> Lightweight library for iOS-style squircle corners

**Status**: 🚧 Under Development

## Quick Start

Documentation will be completed in Phase 7 (Final Polish).

For now, see the [project specification](../../specs/001-core-library/spec.md) and [quick start guide](../../specs/001-core-library/quickstart.md).

## Installation

```bash
npm install @cornerkit/core
```

## Usage

```javascript
import CornerKit from '@cornerkit/core';

const ck = new CornerKit();
ck.apply('#my-button');
```

## Features

- ✅ Zero dependencies
- ✅ <5KB gzipped
- ✅ TypeScript support
- ✅ 4-tier progressive enhancement
- ✅ iOS-style squircle corners
- ✅ Accessibility-first design
- ✅ Respects prefers-reduced-motion

## Accessibility

### Focus Indicators (T234-T235)

CornerKit is designed with accessibility as a core principle. The library **preserves all focus indicators** and does not interfere with keyboard navigation.

#### ✅ What CornerKit Does

- Only modifies `clip-path` CSS property (for visual shape)
- **Never modifies** `outline`, `border`, or other focus-related properties
- Fully compatible with custom focus styles
- Works seamlessly with `:focus` and `:focus-visible` pseudo-classes

#### 💡 Recommended Focus Indicator Pattern

When applying squircles to interactive elements (buttons, links, inputs), use `outline` instead of `border` for focus indicators:

```css
/* ✅ Recommended: Use outline for focus indicators */
button {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 3px;
}
```

```javascript
// Apply squircle to button
const ck = new CornerKit();
ck.apply('button', { radius: 12, smoothing: 0.85 });

// Focus indicator remains visible - outline is not affected!
```

#### Why `outline` instead of `border`?

- **`outline`**: Drawn outside the element, not affected by `clip-path` ✅
- **`border`**: Part of the element box, may be clipped by squircle shape ❌

#### Example: Accessible Button with Squircle

```html
<button class="squircle-button" data-squircle data-squircle-radius="12">
  Click Me
</button>

<style>
.squircle-button {
  padding: 12px 24px;
  background: #0066cc;
  color: white;
  border: none;
  cursor: pointer;
}

/* Focus indicator - will remain visible with squircle */
.squircle-button:focus-visible {
  outline: 3px solid #ff6b00;
  outline-offset: 2px;
}
</style>

<script>
import CornerKit from '@cornerkit/core';
const ck = new CornerKit();
ck.auto(); // Applies squircle, focus indicator preserved!
</script>
```

### Reduced Motion Support

CornerKit automatically respects the `prefers-reduced-motion` user preference:

```javascript
// Users who prefer reduced motion will have transitions disabled
const ck = new CornerKit();
ck.apply('#button'); // Automatically disables transitions if user prefers reduced motion
```

This ensures a comfortable experience for users with motion sensitivity.

## License

MIT
