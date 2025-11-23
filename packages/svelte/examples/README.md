# @cornerkit/svelte Examples

Example applications demonstrating how to use the `@cornerkit/svelte` package.

## Available Examples

| Example | Description | Tech Stack |
|---------|-------------|------------|
| [svelte-basic](./svelte-basic/) | Complete demo with Squircle component and use:squircle action | Vite + Svelte + TypeScript |

### svelte-basic Features

- **Squircle Component**: Basic usage with various configurations
- **use:squircle Action**: Apply squircle directly to any element
- **Number Shorthand**: Simplified syntax for radius-only configuration
- **Interactive Controls**: Real-time radius and smoothing adjustment
- **Border Support**: Toggle borders with width and color controls
- **Live Code Generation**: See generated code update as you adjust parameters

## Running Examples

Each example is a standalone application. To run an example:

```bash
# Navigate to the example directory
cd svelte-basic

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

The examples use a local path reference to `@cornerkit/svelte` for development.
Before running, ensure you've built the main package:

```bash
# From packages/svelte
npm run build

# Then run the example
cd examples/svelte-basic
npm install
npm run dev
```

## Related Examples

- **Vanilla JavaScript**: See [`@cornerkit/core` examples](../../core/examples/)
- **React**: See [`@cornerkit/react` examples](../../react/examples/)
- **Vue**: See [`@cornerkit/vue` examples](../../vue/examples/)
