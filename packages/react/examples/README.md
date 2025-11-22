# @cornerkit/react Examples

Example applications demonstrating how to use the `@cornerkit/react` package.

## Available Examples

| Example | Description | Tech Stack |
|---------|-------------|------------|
| [react-basic](./react-basic/) | Complete demo with Squircle component and useSquircle hook | Vite + React + TypeScript |

### react-basic Features

- **Squircle Component**: Basic usage with various configurations
- **useSquircle Hook**: Imperative usage with ref
- **Polymorphic Components**: Render as button, link, or input
- **Interactive Controls**: Real-time radius and smoothing adjustment
- **Border Support**: Toggle borders with width and color controls
- **Live Code Generation**: See generated code update as you adjust parameters

## Running Examples

Each example is a standalone application. To run an example:

```bash
# Navigate to the example directory
cd react-basic

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## Creating New Examples

To add a new example:

1. Create a new directory: `examples/your-example/`
2. Include a `package.json` with the required dependencies
3. Add the example to the table above

## Note on Local Development

The examples use a local path reference to `@cornerkit/react` for development.
Before running, ensure you've built the main package:

```bash
# From packages/react
npm run build

# Then run the example
cd examples/react-basic
npm install
npm run dev
```

## Related Examples

- **Vanilla JavaScript**: See [`@cornerkit/core` examples](../../core/examples/)
- **Vue** (coming soon): Will be at `packages/vue/examples/`
