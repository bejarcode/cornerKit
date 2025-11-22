# CornerKit Examples

This directory contains example implementations of CornerKit in various environments.

## Available Examples

### Vanilla JavaScript ([vanilla-js/](vanilla-js/))

A complete standalone example demonstrating CornerKit with pure HTML, CSS, and JavaScript.

**Features**:
- Basic squircle examples with different configurations
- Interactive controls for real-time parameter adjustment
- Keyboard shortcuts
- Complete usage demonstrations

**To run**:
```bash
# From packages/core directory
npm run build
cd examples/vanilla-js
open index.html  # macOS
# or
xdg-open index.html  # Linux
# or simply open the file in your browser
```

## Framework Examples

Framework-specific examples are available in their respective packages:

- **React** - See [`@cornerkit/react` examples](../../react/examples/)
- **Vue** (coming soon) - Will be at `packages/vue/examples/`

## Future Examples

The following examples are planned for future releases:

- **Web Components** - Custom elements using CornerKit
- **Next.js** - Server-side rendering example
- **Shopify Theme** - Theme integration example

## Contributing Examples

We welcome example contributions! If you'd like to add an example:

1. Create a new directory: `examples/your-framework/`
2. Include a README with setup instructions
3. Ensure the example demonstrates core CornerKit features
4. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.
