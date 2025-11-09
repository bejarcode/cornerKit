# API Contract: cornerKit Core Library

**Feature**: 001-core-library
**Date**: 2025-01-08
**Status**: Complete
**Version**: 1.0.0

## Overview

This document defines the complete public API contract for the `@cornerkit/core` package. All methods, parameters, return values, and error behaviors are specified to ensure consistent implementation and testing.

---

## CornerKit Class

### Constructor

**Signature**:
```typescript
constructor(config?: Partial<SquircleConfig>)
```

**Purpose**: Create a new CornerKit instance with optional global configuration.

**Parameters**:
- `config` (optional): Partial<SquircleConfig>
  - `radius` (optional, number): Default radius in pixels (default: 20)
  - `smoothing` (optional, number): Default smoothing factor 0-1 (default: 0.8)
  - `tier` (optional, string): Force specific renderer tier (default: auto-detect)

**Returns**: CornerKit instance

**Example**:
```typescript
// With defaults
const ck1 = new CornerKit();

// With custom global config
const ck2 = new CornerKit({ radius: 24, smoothing: 0.9 });

// Force specific tier (testing)
const ck3 = new CornerKit({ tier: 'clippath' });
```

**Specification Mapping**: FR-001, FR-029

---

### apply()

**Signature**:
```typescript
apply(
  element: HTMLElement | string,
  config?: Partial<SquircleConfig>
): void
```

**Purpose**: Apply squircle corners to a single HTML element.

**Parameters**:
- `element`: HTMLElement | string
  - HTMLElement: Direct element reference
  - string: CSS selector (must match exactly one element)
- `config` (optional): Per-element configuration overrides
  - `radius` (optional, number): Override global radius
  - `smoothing` (optional, number): Override global smoothing

**Returns**: void

**Throws**:
- `TypeError`: If element is not HTMLElement or invalid selector
- `Error`: If selector matches 0 or >1 elements

**Behavior**:
1. Validate element (HTMLElement or query single selector)
2. Merge config with global defaults
3. Detect renderer tier (or use cached detection)
4. Check if element already managed:
   - If yes: Update config and re-render
   - If no: Create new ManagedElement entry
5. Generate squircle path based on element dimensions
6. Apply clip-path styling (or border-radius for fallback)
7. Attach ResizeObserver (if CLIPPATH tier)
8. Store in registry

**Examples**:
```typescript
const ck = new CornerKit();

// Apply to element reference
const button = document.getElementById('my-button');
ck.apply(button);

// Apply to CSS selector
ck.apply('#my-button');

// Apply with custom config
ck.apply('#my-button', { radius: 32, smoothing: 0.9 });

// Calling apply() twice updates config (no duplicate entry)
ck.apply('#my-button', { radius: 20 });
ck.apply('#my-button', { radius: 32 }); // Updates to radius=32
```

**Edge Cases**:
- Element dimensions 0×0: Skip rendering, log warning in dev mode
- Radius exceeds element dimensions: Clamp to min(width/2, height/2)
- Element hidden (display: none): Store config, defer rendering to IntersectionObserver
- Element already has clip-path: Override with squircle path
- Invalid selector: Throw Error with helpful message

**Specification Mapping**: FR-002, FR-017, FR-038

---

### applyAll()

**Signature**:
```typescript
applyAll(
  selector: string,
  config?: Partial<SquircleConfig>
): void
```

**Purpose**: Apply squircles to all elements matching a CSS selector.

**Parameters**:
- `selector`: string - CSS selector (e.g., '.button', '[data-squircle]')
- `config` (optional): Shared configuration for all matched elements

**Returns**: void

**Throws**:
- `TypeError`: If selector is not a string
- `Error`: If selector is invalid CSS syntax

**Behavior**:
1. Validate selector (string, valid CSS syntax)
2. Query all matching elements: `document.querySelectorAll(selector)`
3. For each element: Call `apply(element, config)`
4. No lazy loading by default (all elements processed immediately)
   - To enable lazy loading, use `auto()` with data attributes instead

**Examples**:
```typescript
const ck = new CornerKit();

// Apply to all buttons
ck.applyAll('.button');

// Apply with custom config
ck.applyAll('.card', { radius: 24, smoothing: 0.85 });

// Apply to all elements with data attribute
ck.applyAll('[data-squircle]');
```

**Edge Cases**:
- Selector matches 0 elements: No-op (no error)
- Selector matches 100+ elements: May block main thread (consider using auto() with lazy loading)
- Invalid CSS selector: Throw Error with helpful message

**Specification Mapping**: FR-003, FR-039

---

### auto()

**Signature**:
```typescript
auto(): void
```

**Purpose**: Automatically discover and apply squircles to all elements with `data-squircle` attributes. Uses lazy loading (IntersectionObserver) for off-screen elements.

**Parameters**: None

**Returns**: void

**Behavior**:
1. Query all elements with `data-squircle` attribute
2. For each element:
   - Parse `data-squircle-radius` (optional, number)
   - Parse `data-squircle-smoothing` (optional, number)
   - Merge with global defaults
3. Check if element is in viewport (IntersectionObserver):
   - If visible: Apply immediately
   - If off-screen: Attach IntersectionObserver, apply when enters viewport
4. Invalid data attribute values: Ignore, log warning in dev mode

**Examples**:
```typescript
const ck = new CornerKit();

// Auto-apply to all data-squircle elements
ck.auto();
```

**HTML Examples**:
```html
<!-- Minimal (uses global defaults) -->
<div data-squircle></div>

<!-- Custom radius -->
<div data-squircle data-squircle-radius="32"></div>

<!-- Custom radius and smoothing -->
<div
  data-squircle
  data-squircle-radius="24"
  data-squircle-smoothing="0.9"
></div>

<!-- Invalid values (ignored, uses defaults) -->
<div data-squircle data-squircle-radius="invalid"></div>
```

**Edge Cases**:
- No elements with data-squircle: No-op
- 100+ elements: Only visible ones processed immediately (lazy loading)
- Invalid attribute values: Use defaults, warn in dev mode
- Calling auto() multiple times: Re-scans DOM, processes new elements only

**Specification Mapping**: FR-004, FR-031-034, FR-024-025

---

### update()

**Signature**:
```typescript
update(
  element: HTMLElement | string,
  config: Partial<SquircleConfig>
): void
```

**Purpose**: Update the configuration for an already-managed element and re-render.

**Parameters**:
- `element`: HTMLElement | string
- `config`: Partial<SquircleConfig> - New configuration (merged with existing)

**Returns**: void

**Throws**:
- `TypeError`: If element is not HTMLElement or invalid selector
- `Error`: If element is not currently managed by CornerKit

**Behavior**:
1. Validate element (same as apply())
2. Check if element exists in registry:
   - If no: Throw Error "Element not managed by CornerKit"
   - If yes: Continue
3. Merge new config with existing config (not global defaults)
4. Regenerate squircle path with new dimensions
5. Update clip-path styling
6. Return void (success)

**Examples**:
```typescript
const ck = new CornerKit();

// Apply initially
ck.apply('#my-button', { radius: 20 });

// Update radius only
ck.update('#my-button', { radius: 32 });

// Update both radius and smoothing
ck.update('#my-button', { radius: 24, smoothing: 0.9 });

// Error: Element not managed
const unmanaged = document.getElementById('other-button');
ck.update(unmanaged, { radius: 32 }); // Throws Error
```

**Edge Cases**:
- Element not in registry: Throw Error with helpful message
- No config changes: No-op (re-render with same config)
- Partial config: Only provided properties are updated

**Specification Mapping**: FR-005

---

### remove()

**Signature**:
```typescript
remove(element: HTMLElement | string): void
```

**Purpose**: Remove squircle styling from an element and clean up observers.

**Parameters**:
- `element`: HTMLElement | string

**Returns**: void

**Throws**:
- `TypeError`: If element is not HTMLElement or invalid selector
- `Error`: If element is not currently managed by CornerKit

**Behavior**:
1. Validate element (same as apply())
2. Check if element exists in registry:
   - If no: Throw Error "Element not managed by CornerKit"
   - If yes: Continue
3. Disconnect ResizeObserver (if exists)
4. Disconnect IntersectionObserver (if exists)
5. Remove clip-path styling (reset to original styles)
6. Delete from WeakMap registry
7. Return void (success)

**Examples**:
```typescript
const ck = new CornerKit();

// Apply and remove
ck.apply('#my-button');
ck.remove('#my-button');

// Error: Element not managed
ck.remove('#other-button'); // Throws Error
```

**Edge Cases**:
- Element not in registry: Throw Error
- Element already removed from DOM: No-op (WeakMap handles cleanup)
- Calling remove() twice: Second call throws Error (element not managed)

**Specification Mapping**: FR-006

---

### inspect()

**Signature**:
```typescript
inspect(element: HTMLElement | string): ManagedElementInfo | null
```

**Purpose**: Get the current configuration and metadata for a managed element.

**Parameters**:
- `element`: HTMLElement | string

**Returns**: ManagedElementInfo | null
- Returns object if element is managed
- Returns null if element is not managed (no error thrown)

**Return Type**:
```typescript
interface ManagedElementInfo {
  config: SquircleConfig;      // Current configuration
  tier: RendererTier;          // Renderer tier being used
  dimensions: {                // Current element dimensions
    width: number;
    height: number;
  };
  isManaged: true;             // Always true if returned
}
```

**Examples**:
```typescript
const ck = new CornerKit();

// Apply and inspect
ck.apply('#my-button', { radius: 20, smoothing: 0.8 });
const info = ck.inspect('#my-button');

console.log(info);
// {
//   config: { radius: 20, smoothing: 0.8 },
//   tier: 'clippath',
//   dimensions: { width: 120, height: 40 },
//   isManaged: true
// }

// Element not managed
const other = ck.inspect('#other-button');
console.log(other); // null
```

**Edge Cases**:
- Element not in registry: Return null (no error)
- Useful for debugging and integration tests

**Specification Mapping**: FR-007

---

### destroy()

**Signature**:
```typescript
destroy(): void
```

**Purpose**: Remove all squircles, disconnect all observers, and clear the registry. Used for cleanup (e.g., SPA route changes).

**Parameters**: None

**Returns**: void

**Behavior**:
1. Iterate through all managed elements in registry
2. For each element:
   - Disconnect ResizeObserver
   - Disconnect IntersectionObserver
   - Remove clip-path styling
3. Clear WeakMap registry (set to new WeakMap instance)
4. Reset internal state
5. Return void (success)

**Examples**:
```typescript
const ck = new CornerKit();

// Apply to multiple elements
ck.applyAll('.button');

// Later: Clean up everything
ck.destroy();

// Can re-initialize after destroy
ck.apply('#my-button'); // Works (fresh start)
```

**Edge Cases**:
- No managed elements: No-op (no error)
- Calling destroy() multiple times: No-op (idempotent)
- After destroy(), instance can still be used (re-initialization)

**Specification Mapping**: FR-008

---

## Static Methods

### CornerKit.supports()

**Signature**:
```typescript
static supports(): {
  native: boolean;
  houdini: boolean;
  clippath: boolean;
  fallback: boolean;
}
```

**Purpose**: Check which renderer tiers are supported in the current browser (without creating instance).

**Parameters**: None

**Returns**: Object with boolean flags for each tier

**Example**:
```typescript
const support = CornerKit.supports();

console.log(support);
// {
//   native: false,      // Chrome 139+ only
//   houdini: true,      // Chrome 65+, Edge 79+
//   clippath: true,     // Modern browsers
//   fallback: true      // Always true
// }

// Use for feature detection
if (support.houdini) {
  console.log('Houdini Paint API available!');
}
```

**Specification Mapping**: FR-009-013 (capability detection)

---

## Error Handling

### Error Types

**TypeError**:
- Thrown when: Invalid parameter type (not HTMLElement, not string, not valid selector)
- Message format: `"cornerKit: Expected HTMLElement or string, got [type]"`

**Error**:
- Thrown when: Element not managed, selector matches 0 or >1 elements (for apply()), invalid CSS selector
- Message format: `"cornerKit: [specific error message]"`

### Error Examples

```typescript
const ck = new CornerKit();

// TypeError: Invalid element type
ck.apply(123); // "cornerKit: Expected HTMLElement or string, got number"

// Error: Selector matches multiple elements
ck.apply('.button'); // "cornerKit: Selector '.button' matches 5 elements, expected 1"

// Error: Element not managed
ck.remove('#other-button'); // "cornerKit: Element not managed by CornerKit"

// Error: Invalid CSS selector
ck.applyAll('div > > p'); // "cornerKit: Invalid CSS selector 'div > > p'"
```

---

## Type Definitions

See [types.ts](./types.ts) for complete TypeScript type definitions.

**Key Exports**:
```typescript
export interface SquircleConfig { ... }
export enum RendererTier { ... }
export interface ManagedElementInfo { ... }
export class CornerKit { ... }
```

---

## Versioning and Compatibility

**Current Version**: 1.0.0

**Semantic Versioning Promise**:
- MAJOR (2.0.0): Breaking API changes (method removal, parameter changes)
- MINOR (1.1.0): New methods, backward-compatible features
- PATCH (1.0.1): Bug fixes, no API changes

**Deprecation Policy**:
- Deprecated features announced in MINOR version
- console.warn() in development mode for deprecated usage
- Removed in next MAJOR version (1 version grace period)
- Migration guide provided in CHANGELOG

**Example Deprecation**:
```typescript
// v1.5.0: Deprecate oldMethod(), introduce newMethod()
ck.oldMethod(); // Works, but warns in dev mode

// v1.6.0 - v1.9.x: Both methods work
ck.oldMethod(); // Still works, warns
ck.newMethod(); // New recommended method

// v2.0.0: Remove oldMethod()
ck.oldMethod(); // TypeError: oldMethod is not a function
ck.newMethod(); // Only this works
```

---

## Testing Contract

### Unit Test Coverage

All public methods MUST have:
- ✅ Happy path tests (valid inputs, expected outputs)
- ✅ Edge case tests (boundary values, empty inputs)
- ✅ Error case tests (invalid inputs, verify throws)
- ✅ Type guard tests (TypeScript types validated)

**Example Test Suite**:
```typescript
describe('CornerKit.apply()', () => {
  it('should apply squircle to element', () => {
    const ck = new CornerKit();
    const element = document.createElement('div');
    ck.apply(element);
    expect(element.style.clipPath).toContain('path');
  });

  it('should throw TypeError for invalid element', () => {
    const ck = new CornerKit();
    expect(() => ck.apply(123 as any)).toThrow(TypeError);
  });

  it('should update config when called twice on same element', () => {
    const ck = new CornerKit();
    const element = document.createElement('div');
    ck.apply(element, { radius: 20 });
    ck.apply(element, { radius: 32 });
    const info = ck.inspect(element);
    expect(info?.config.radius).toBe(32);
  });
});
```

### Integration Test Coverage

- ✅ Cross-browser compatibility (Playwright: Chrome, Firefox, Safari, Edge)
- ✅ Visual regression (screenshot comparison)
- ✅ Performance benchmarks (render time, bundle size)
- ✅ Accessibility (focus indicators, screen readers)

---

## Migration Guide (Future Breaking Changes)

**This section will be populated when MAJOR version changes occur.**

Currently: v1.0.0 (initial release, no migrations needed)

---

## Notes

- All methods are instance methods except `CornerKit.supports()` (static)
- Calling methods on unmanaged elements throws Error (except inspect() which returns null)
- WeakMap registry ensures automatic garbage collection
- ResizeObserver and IntersectionObserver are automatically managed
- Development mode (process.env.NODE_ENV === 'development') enables additional warnings
- Production build strips all warnings for minimal bundle size

---

## References

- [spec.md](../spec.md) - Feature specification with 60 functional requirements
- [data-model.md](../data-model.md) - Entity definitions and validation rules
- [types.ts](./types.ts) - TypeScript type definitions

---

**Last Updated**: 2025-01-08
**Next Review**: Before v2.0.0 (breaking changes)
