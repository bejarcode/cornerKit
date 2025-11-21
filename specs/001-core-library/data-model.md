# Data Model: cornerKit Core Library

**Feature**: 001-core-library
**Date**: 2025-01-08
**Status**: Complete

## Overview

This document defines the core data structures used by the cornerKit library. All entities are designed to be:
- **Lightweight**: Minimal memory footprint (contributes to <5KB bundle goal)
- **Type-safe**: Full TypeScript support with strict mode
- **Immutable where possible**: Prevent unintended mutations
- **Memory-efficient**: Use WeakMap for element tracking (automatic garbage collection)

---

## Entity Definitions

### 1. SquircleConfig

**Purpose**: User-provided configuration for squircle appearance

**Type Definition**:
```typescript
interface SquircleConfig {
  /**
   * Corner radius in pixels
   * @minimum 0
   * @default 20
   */
  radius: number;

  /**
   * Smoothing factor (0 = square corners, 1 = circle)
   * Controls superellipse exponent: n = 2 + (4-2) * (1-smoothing)
   * @minimum 0
   * @maximum 1
   * @default 0.8
   */
  smoothing: number;

  /**
   * Optional: Force specific renderer tier
   * Normally auto-detected, but can be overridden for testing
   * @optional
   */
  tier?: 'native' | 'houdini' | 'clippath' | 'fallback';
}
```

**Validation Rules**:
- `radius` MUST be >= 0 (non-negative)
  - If invalid: Default to 20, warn in development mode
- `smoothing` MUST be in range [0, 1]
  - If invalid: Clamp to [0, 1], warn in development mode
- `tier` MUST be one of the enum values if provided
  - If invalid: Ignore, use auto-detected tier

**Default Values**:
```typescript
const DEFAULT_CONFIG: SquircleConfig = {
  radius: 20,    // iOS-typical size for buttons
  smoothing: 0.8 // iOS-like appearance (n ≈ 2.4)
};
```

**Example Usage**:
```typescript
// Minimal config (uses defaults)
const config1: SquircleConfig = {
  radius: 20,
  smoothing: 0.8
};

// Custom config
const config2: SquircleConfig = {
  radius: 32,
  smoothing: 0.9 // Smoother, more circular
};

// Override tier (for testing)
const config3: SquircleConfig = {
  radius: 20,
  smoothing: 0.8,
  tier: 'clippath' // Force clip-path even if Houdini available
};
```

**Specification Mapping**:
- FR-027: Configuration object MUST support radius, smoothing, tier
- FR-028: Default configuration MUST be radius: 20, smoothing: 0.8
- FR-035: Validate radius >= 0
- FR-036: Clamp smoothing to [0, 1]

---

### 2. RendererTier

**Purpose**: Enumeration of available rendering methods (4-tier progressive enhancement)

**Type Definition**:
```typescript
enum RendererTier {
  /**
   * Tier 1: Native CSS corner-shape: squircle
   * Chrome 139+ (when available)
   * GPU-accelerated, zero JavaScript overhead
   */
  NATIVE = 'native',

  /**
   * Tier 2: CSS Houdini Paint API
   * Chrome 65+, Edge 79+
   * Runs on paint thread (off main thread)
   * Requires worklet registration
   * NOTE: Deferred to Phase 2
   */
  HOUDINI = 'houdini',

  /**
   * Tier 3: SVG clip-path (PRIMARY IMPLEMENTATION)
   * All modern browsers (Firefox, Safari, Chrome, Edge)
   * Dynamic path generation via JavaScript
   * ResizeObserver integration
   */
  CLIPPATH = 'clippath',

  /**
   * Tier 4: border-radius fallback
   * Universal compatibility (IE11+)
   * Standard rounded corners (not true squircles)
   * Graceful degradation
   */
  FALLBACK = 'fallback'
}
```

**Detection Logic** (from detector.ts):
```typescript
function detectTier(): RendererTier {
  // Tier 1: Native CSS (future-proofing for Chrome 139+)
  if (CSS.supports('corner-shape', 'squircle')) {
    return RendererTier.NATIVE;
  }

  // Tier 2: Houdini Paint API (Phase 2 - not implemented in Phase 1)
  if ('paintWorklet' in CSS) {
    return RendererTier.HOUDINI;
  }

  // Tier 3: SVG clip-path (PRIMARY)
  if (CSS.supports('clip-path', 'path("")')) {
    return RendererTier.CLIPPATH;
  }

  // Tier 4: Fallback (always available)
  return RendererTier.FALLBACK;
}
```

**Browser Support Matrix**:

| Tier | Chrome | Firefox | Safari | Edge | IE11 |
|------|--------|---------|--------|------|------|
| NATIVE | 139+ | ❌ | ❌ | ❌ | ❌ |
| HOUDINI | 65+ | ❌ | ❌ | 79+ | ❌ |
| CLIPPATH | 65+ | ✅ | 14+ | 79+ | ❌ |
| FALLBACK | ✅ | ✅ | ✅ | ✅ | ✅ |

**Specification Mapping**:
- FR-009: Detect Native CSS support
- FR-010: Detect Houdini support
- FR-011: Detect clip-path support
- FR-012: Default to border-radius fallback
- FR-013: Cache detection results

---

### 3. ManagedElement

**Purpose**: Internal registry entry tracking an element, its configuration, and its observers

**Type Definition**:
```typescript
interface ManagedElement {
  /**
   * Reference to the DOM element
   * Note: Stored in WeakMap, this is redundant but kept for clarity
   */
  element: HTMLElement;

  /**
   * Current configuration for this element
   * Merged from global defaults + per-element overrides
   */
  config: SquircleConfig;

  /**
   * Detected renderer tier for this element
   * Cached to avoid repeated detection
   */
  tier: RendererTier;

  /**
   * ResizeObserver instance for this element
   * Tracks dimension changes, triggers clip-path updates
   * Only used for CLIPPATH tier
   */
  resizeObserver?: ResizeObserver;

  /**
   * IntersectionObserver instance for this element
   * Used for lazy loading (auto() with many elements)
   * Disconnected after element enters viewport
   */
  intersectionObserver?: IntersectionObserver;

  /**
   * Current element dimensions (cached)
   * Used to detect 1px threshold changes for updates
   */
  lastDimensions?: {
    width: number;
    height: number;
  };
}
```

**Storage Strategy**:
```typescript
// WeakMap for automatic garbage collection
const registry = new WeakMap<HTMLElement, ManagedElement>();

// Usage:
function registerElement(element: HTMLElement, config: SquircleConfig): void {
  const tier = detectTier();
  const managed: ManagedElement = {
    element,
    config,
    tier,
    resizeObserver: tier === RendererTier.CLIPPATH ? createResizeObserver(element) : undefined,
    lastDimensions: { width: element.offsetWidth, height: element.offsetHeight }
  };

  registry.set(element, managed);
}

function unregisterElement(element: HTMLElement): void {
  const managed = registry.get(element);
  if (managed) {
    // Disconnect observers
    managed.resizeObserver?.disconnect();
    managed.intersectionObserver?.disconnect();

    // Remove from registry (WeakMap handles garbage collection)
    registry.delete(element);
  }
}
```

**Memory Management**:
- WeakMap allows garbage collection when element removed from DOM (even without explicit `remove()` call)
- Observers are explicitly disconnected to prevent memory leaks
- lastDimensions is small (16 bytes per element)

**Specification Mapping**:
- FR-023: Maintain internal registry (WeakMap)
- FR-019: Use ResizeObserver for dimension changes
- FR-024: Use IntersectionObserver for lazy loading
- FR-026: Prevent duplicate entries (update config instead)

---

### 4. SuperellipsePoint

**Purpose**: Coordinate pair representing a point on the superellipse curve

**Type Definition**:
```typescript
interface SuperellipsePoint {
  /**
   * X coordinate relative to element center
   * Range: [-width/2, width/2]
   */
  x: number;

  /**
   * Y coordinate relative to element center
   * Range: [-height/2, height/2]
   */
  y: number;
}
```

**Usage in Path Generation**:
```typescript
/**
 * Generate points on superellipse curve for a single corner
 * @param width Element width in pixels
 * @param height Element height in pixels
 * @param radius Corner radius in pixels
 * @param exponent Superellipse exponent (n)
 * @param corner Which corner (0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left)
 * @returns Array of points for bezier curve approximation
 */
function generateCornerPoints(
  width: number,
  height: number,
  radius: number,
  exponent: number,
  corner: 0 | 1 | 2 | 3
): SuperellipsePoint[] {
  const points: SuperellipsePoint[] = [];

  // Rotation angles for each corner
  const rotations = [0, 90, 180, 270]; // degrees
  const angleOffset = rotations[corner] * (Math.PI / 180);

  // Generate bezier control points (8 points per corner for smooth curve)
  for (let i = 0; i < 8; i++) {
    const t = i / 7; // Parametric value [0, 1]
    const theta = (Math.PI / 2) * t + angleOffset; // Angle from 0 to 90 degrees

    // Superellipse formula:
    // x = a * sign(cos(θ)) * |cos(θ)|^(2/n)
    // y = b * sign(sin(θ)) * |sin(θ)|^(2/n)
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const x = radius * Math.sign(cosTheta) * Math.pow(Math.abs(cosTheta), 2 / exponent);
    const y = radius * Math.sign(sinTheta) * Math.pow(Math.abs(sinTheta), 2 / exponent);

    points.push({ x, y });
  }

  return points;
}
```

**Coordinate System**:
- Origin (0, 0) is at element center
- X-axis: Positive right, negative left
- Y-axis: Positive down, negative up (standard DOM coordinates)
- Points are transformed to absolute coordinates before SVG path generation

**Specification Mapping**:
- FR-014: Convert smoothing to exponent
- FR-015: Generate superellipse coordinates with rotation angles
- FR-017: Clamp radius to min(width/2, height/2)

---

### 5. GlobalConfig (internal)

**Purpose**: Instance-level global configuration (set via constructor)

**Type Definition**:
```typescript
interface GlobalConfig extends SquircleConfig {
  /**
   * Enable lazy loading with IntersectionObserver
   * @default true
   */
  lazyLoad?: boolean;

  /**
   * Debounce delay for ResizeObserver (in milliseconds)
   * Uses requestAnimationFrame if not specified
   * @default undefined (uses RAF)
   */
  debounceResize?: number;

  /**
   * Enable debug logging (tier selection, performance metrics)
   * @default false (only in development mode)
   */
  debug?: boolean;
}
```

**Default Values**:
```typescript
const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  radius: 20,
  smoothing: 0.8,
  lazyLoad: true,
  debounceResize: undefined, // Uses RAF
  debug: process.env.NODE_ENV === 'development'
};
```

**Specification Mapping**:
- FR-029: Accept global configuration at instantiation
- FR-030: Per-element config overrides global defaults
- FR-024-025: Lazy loading with IntersectionObserver
- FR-020: ResizeObserver debouncing

---

## Data Flow

### Element Application Flow

```
User calls apply(element, config)
         ↓
Merge config with global defaults
         ↓
Detect renderer tier (cache in singleton)
         ↓
Create ManagedElement entry
         ↓
Store in WeakMap registry
         ↓
Attach ResizeObserver (if CLIPPATH tier)
         ↓
Generate squircle path
         ↓
Apply clip-path styling
         ↓
Return void (success)
```

### Update Flow

```
User calls update(element, newConfig)
         ↓
Retrieve ManagedElement from registry
         ↓
Merge newConfig with global defaults
         ↓
Update ManagedElement.config
         ↓
Regenerate squircle path
         ↓
Update clip-path styling
         ↓
Return void (success)
```

### Remove Flow

```
User calls remove(element)
         ↓
Retrieve ManagedElement from registry
         ↓
Disconnect ResizeObserver
         ↓
Disconnect IntersectionObserver (if exists)
         ↓
Remove clip-path styling
         ↓
Delete from WeakMap registry
         ↓
Return void (success)
```

---

## Relationships

```
CornerKit Instance
    ├── has one: GlobalConfig
    ├── has one: CapabilityDetector (singleton)
    └── manages many: ManagedElement (via WeakMap)

ManagedElement
    ├── has one: HTMLElement (weak reference)
    ├── has one: SquircleConfig
    ├── has one: RendererTier
    ├── has zero or one: ResizeObserver
    └── has zero or one: IntersectionObserver

SquircleConfig
    ├── has one: radius (number)
    ├── has one: smoothing (number)
    └── has zero or one: tier (override)

SuperellipsePoint
    ├── has one: x (number)
    └── has one: y (number)
```

---

## Constraints

### Memory Constraints
- **WeakMap usage**: Prevents memory leaks in SPAs (elements garbage collected when removed from DOM)
- **Observer cleanup**: Explicitly disconnect observers on `remove()` and `destroy()`
- **Cache dimensions**: Store lastDimensions to prevent excessive recalculation (1px threshold)

### Validation Constraints
- **radius**: MUST be >= 0 (clamped to element dimensions: min(width/2, height/2))
- **smoothing**: MUST be in [0, 1] (clamped automatically)
- **tier**: MUST be valid enum value if provided (ignored if invalid)
- **element**: MUST be HTMLElement instance (validated before processing)

### Performance Constraints
- **Registry lookups**: O(1) via WeakMap
- **Tier detection**: O(1) after first call (cached in singleton)
- **Path generation**: O(1) per corner (fixed 8 bezier points)
- **ResizeObserver**: Debounced via RAF (max 60fps)

---

## Type Guards

```typescript
/**
 * Type guard for SquircleConfig validation
 */
function isValidConfig(config: unknown): config is SquircleConfig {
  if (typeof config !== 'object' || config === null) return false;

  const c = config as any;
  return (
    typeof c.radius === 'number' &&
    c.radius >= 0 &&
    typeof c.smoothing === 'number' &&
    c.smoothing >= 0 &&
    c.smoothing <= 1 &&
    (c.tier === undefined || ['native', 'houdini', 'clippath', 'fallback'].includes(c.tier))
  );
}

/**
 * Type guard for HTMLElement validation
 */
function isHTMLElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}
```

---

## Testing Considerations

### Unit Test Coverage
- ✅ SquircleConfig validation (invalid radius, smoothing, tier)
- ✅ RendererTier detection (mock CSS.supports)
- ✅ ManagedElement registry (add, update, remove)
- ✅ SuperellipsePoint generation (math accuracy)
- ✅ WeakMap garbage collection (Chrome DevTools memory profiling)

### Integration Test Coverage
- ✅ End-to-end flow (apply → resize → update → remove)
- ✅ Multiple elements (registry isolation)
- ✅ Lazy loading (IntersectionObserver triggers)
- ✅ Observer cleanup (no memory leaks)

---

## Next Steps

1. Implement TypeScript interfaces in `src/core/types.ts`
2. Create validation functions in `src/utils/validator.ts`
3. Implement CapabilityDetector singleton in `src/core/detector.ts`
4. Implement WeakMap registry in `src/core/registry.ts`
5. Write unit tests for each entity and validation rule
