# @cornerkit/react

[![npm version](https://img.shields.io/npm/v/@cornerkit/react)](https://www.npmjs.com/package/@cornerkit/react)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@cornerkit/react)](https://bundlephobia.com/package/@cornerkit/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React components and hooks for iOS-style squircle corners. A thin wrapper around `@cornerkit/core` with full TypeScript support.

**[Live Demo](https://bejarcode.github.io/cornerKit/)** | **[GitHub](https://github.com/bejarcode/cornerKit)** | **[Core Package](https://www.npmjs.com/package/@cornerkit/core)**

## Installation

```bash
npm install @cornerkit/react @cornerkit/core
```

## Quick Start

### Using the Squircle Component

```tsx
import { Squircle } from '@cornerkit/react';

function App() {
  return (
    <Squircle radius={24} smoothing={0.9}>
      <p>Squircle content</p>
    </Squircle>
  );
}
```

### Using the useSquircle Hook

```tsx
import { useSquircle } from '@cornerkit/react';

function Card() {
  const squircleRef = useSquircle<HTMLDivElement>({
    radius: 20,
    smoothing: 0.8,
  });

  return <div ref={squircleRef}>Card content</div>;
}
```

## API Reference

### `<Squircle>` Component

Declarative component for applying squircle corners to any HTML element.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `radius` | `number` | `20` | Corner radius in pixels |
| `smoothing` | `number` | `0.8` | Curve smoothness (0.0-1.0) |
| `border` | `{ width: number; color: string }` | - | Optional border |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | HTML element to render |
| `children` | `ReactNode` | - | Child content |
| `ref` | `Ref<HTMLElement>` | - | Forwarded ref |

Plus all valid HTML attributes for the chosen element type.

#### Examples

```tsx
// Basic usage
<Squircle radius={24}>Content</Squircle>

// As a button
<Squircle as="button" radius={16} onClick={handleClick}>
  Click me
</Squircle>

// With border
<Squircle
  radius={20}
  smoothing={0.9}
  border={{ width: 2, color: '#3b82f6' }}
>
  Styled content
</Squircle>

// As an input
<Squircle
  as="input"
  radius={8}
  type="text"
  placeholder="Enter text..."
/>
```

### `useSquircle()` Hook

Imperative hook for applying squircle corners to a ref.

#### Signature

```ts
function useSquircle<T extends HTMLElement = HTMLDivElement>(
  options?: UseSquircleOptions
): RefObject<T | null>;
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `radius` | `number` | `20` | Corner radius in pixels |
| `smoothing` | `number` | `0.8` | Curve smoothness (0.0-1.0) |
| `border` | `{ width: number; color: string }` | - | Optional border |

#### Example

```tsx
function MyCard() {
  const squircleRef = useSquircle<HTMLDivElement>({
    radius: 24,
    smoothing: 0.9,
    border: { width: 1, color: 'gray' },
  });

  return (
    <div ref={squircleRef} className="card">
      Card content
    </div>
  );
}
```

## TypeScript Support

Full TypeScript support with:
- Polymorphic `as` prop with proper typing
- Generic type parameter for `useSquircle`
- IntelliSense for all props and options

```tsx
// TypeScript knows this is an HTMLButtonElement
<Squircle as="button" onClick={(e) => console.log(e.currentTarget)}>
  Button
</Squircle>

// Type-safe hook usage
const buttonRef = useSquircle<HTMLButtonElement>({ radius: 16 });
```

## SSR Compatibility

Both the component and hook are SSR-compatible:
- No DOM access during server render
- Squircle effect applied on client hydration
- Works with Next.js, Remix, Gatsby, etc.

```tsx
// Works in Next.js App Router
export default function Page() {
  return (
    <Squircle radius={20}>
      Server-rendered content with client-side squircle
    </Squircle>
  );
}
```

## Form Elements

Squircle works with form elements while preserving accessibility:

```tsx
// Input with squircle - focus styles preserved
<Squircle
  as="input"
  radius={12}
  type="text"
  placeholder="Email"
  className="focus:outline-2 focus:outline-blue-500"
/>

// Textarea
<Squircle as="textarea" radius={16} rows={4}>
  Initial text
</Squircle>
```

**Tip**: Use `outline` for focus styles instead of `border` since the squircle uses `clip-path`.

## Re-exports

For convenience, the package re-exports these from `@cornerkit/core`:

```ts
import {
  DEFAULT_CONFIG,    // { radius: 20, smoothing: 0.8 }
  RendererTier,      // Enum: NATIVE, HOUDINI, CLIPPATH, FALLBACK
} from '@cornerkit/react';
```

## Peer Dependencies

- `react`: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
- `@cornerkit/core`: ^1.1.0

## License

MIT
