# @cornerkit/vue Examples

Example applications demonstrating how to use the `@cornerkit/vue` package.

## Available Examples

| Example | Description | Tech Stack |
|---------|-------------|------------|
| [vue-basic](./vue-basic/) | Complete demo with Squircle component, useSquircle composable, and v-squircle directive | Vite + Vue 3 + TypeScript |

### vue-basic Features

- **Squircle Component**: Basic usage with various configurations
- **useSquircle Composable**: Imperative usage with ref
- **v-squircle Directive**: Apply squircle directly to elements
- **Polymorphic Components**: Render as button, link, or custom element
- **Interactive Controls**: Real-time radius and smoothing adjustment
- **Border Support**: Toggle borders with width and color controls
- **Live Code Generation**: See generated code update as you adjust parameters

## Running Examples

Each example is a standalone application. To run an example:

```bash
# Navigate to the example directory
cd vue-basic

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

The examples use a local path reference to `@cornerkit/vue` for development.
Before running, ensure you've built the main package:

```bash
# From packages/vue
npm run build

# Then run the example
cd examples/vue-basic
npm install
npm run dev
```

## Related Examples

- **Vanilla JavaScript**: See [`@cornerkit/core` examples](../../core/examples/)
- **React**: See [`@cornerkit/react` examples](../../react/examples/)
- **Svelte**: See [`@cornerkit/svelte` examples](../../svelte/examples/)
