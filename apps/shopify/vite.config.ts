import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Declare Shopify's Future flags for Remix
declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

/**
 * Workaround from official Shopify template:
 * Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break
 * the remix server. The CLI will eventually stop passing in HOST, so we can
 * remove this workaround after the next major release.
 */
if (
  process.env["HOST"] &&
  (!process.env["SHOPIFY_APP_URL"] ||
    process.env["SHOPIFY_APP_URL"] === process.env["HOST"])
) {
  process.env["SHOPIFY_APP_URL"] = process.env["HOST"];
  delete process.env["HOST"];
}

const host = new URL(
  process.env["SHOPIFY_APP_URL"] || "http://localhost"
).hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env["FRONTEND_PORT"] || "8002"),
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    port: Number(process.env["PORT"] || 3000),
    hmr: hmrConfig,
    fs: {
      // Allow serving files from the monorepo root
      allow: [".."],
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
});
