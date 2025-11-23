/**
 * OAuth Flow Integration Tests
 *
 * Tests for the OAuth authentication flow
 *
 * @see T045: Create OAuth flow integration test
 * @see FR-001: OAuth 2.0 authentication flow
 *
 * Note: Full OAuth integration tests require a running Shopify test environment.
 * These tests verify route configuration and expected behavior patterns.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("OAuth Route Configuration", () => {
  const routesDir = path.join(process.cwd(), "app", "routes");

  it("should have auth.login route for OAuth initiation", () => {
    const loginRoute = path.join(routesDir, "auth.login.tsx");
    expect(fs.existsSync(loginRoute)).toBe(true);
  });

  it("should have auth.$ splat route for OAuth callback", () => {
    const callbackRoute = path.join(routesDir, "auth.$.tsx");
    expect(fs.existsSync(callbackRoute)).toBe(true);
  });

  it("should have app.tsx layout route for authenticated pages", () => {
    const appLayout = path.join(routesDir, "app.tsx");
    expect(fs.existsSync(appLayout)).toBe(true);
  });

  it("should have _index.tsx for root redirect", () => {
    const indexRoute = path.join(routesDir, "_index.tsx");
    expect(fs.existsSync(indexRoute)).toBe(true);
  });
});

describe("OAuth Route Content", () => {
  const routesDir = path.join(process.cwd(), "app", "routes");

  it("auth.login should import login function", async () => {
    const loginRoute = path.join(routesDir, "auth.login.tsx");
    const content = fs.readFileSync(loginRoute, "utf-8");

    expect(content).toContain("import");
    expect(content).toContain("login");
    expect(content).toContain("shopify.server");
  });

  it("auth.$ callback should use authenticate.admin", async () => {
    const callbackRoute = path.join(routesDir, "auth.$.tsx");
    const content = fs.readFileSync(callbackRoute, "utf-8");

    expect(content).toContain("authenticate");
    expect(content).toContain("admin");
  });

  it("app.tsx should configure App Bridge", async () => {
    const appLayout = path.join(routesDir, "app.tsx");
    const content = fs.readFileSync(appLayout, "utf-8");

    expect(content).toContain("AppProvider");
    expect(content).toContain("apiKey");
    expect(content).toContain("isEmbeddedApp");
  });
});

describe("OAuth Security Configuration", () => {
  it("should have CSP header configuration", async () => {
    const appLayout = path.join(process.cwd(), "app", "routes", "app.tsx");
    const content = fs.readFileSync(appLayout, "utf-8");

    expect(content).toContain("Content-Security-Policy");
    expect(content).toContain("frame-ancestors");
    expect(content).toContain("myshopify.com");
  });

  it("should validate shop parameter in _index route", async () => {
    const indexRoute = path.join(process.cwd(), "app", "routes", "_index.tsx");
    const content = fs.readFileSync(indexRoute, "utf-8");

    expect(content).toContain("sanitizeShopDomain");
  });

  it("should not expose API secret in client code", async () => {
    const appLayout = path.join(process.cwd(), "app", "routes", "app.tsx");
    const content = fs.readFileSync(appLayout, "utf-8");

    // Should only pass apiKey (public), not apiSecret
    expect(content).not.toContain("apiSecret");
    expect(content).not.toContain("API_SECRET");
  });
});

describe("Shopify App Configuration", () => {
  it("should have shopify.server.ts configuration", () => {
    const shopifyConfig = path.join(
      process.cwd(),
      "app",
      "lib",
      "shopify.server.ts"
    );
    expect(fs.existsSync(shopifyConfig)).toBe(true);
  });

  it("should configure PrismaSessionStorage", async () => {
    const shopifyConfig = path.join(
      process.cwd(),
      "app",
      "lib",
      "shopify.server.ts"
    );
    const content = fs.readFileSync(shopifyConfig, "utf-8");

    expect(content).toContain("PrismaSessionStorage");
    expect(content).toContain("sessionStorage");
  });

  it("should configure correct auth path prefix", async () => {
    const shopifyConfig = path.join(
      process.cwd(),
      "app",
      "lib",
      "shopify.server.ts"
    );
    const content = fs.readFileSync(shopifyConfig, "utf-8");

    expect(content).toContain('authPathPrefix: "/auth"');
  });
});
