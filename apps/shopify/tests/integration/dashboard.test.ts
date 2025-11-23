/**
 * Dashboard Rendering Integration Tests
 *
 * Tests for the dashboard component and route
 *
 * @see T046: Create dashboard rendering test
 * @see FR-010: Polaris-styled admin interface
 * @see FR-012: Responsive layout (desktop/tablet)
 *
 * Note: Full rendering tests require JSDOM or a browser environment.
 * These tests verify component structure and Polaris integration.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Dashboard Route Configuration", () => {
  it("should have app._index route for dashboard", () => {
    const dashboardRoute = path.join(
      process.cwd(),
      "app",
      "routes",
      "app._index.tsx"
    );
    expect(fs.existsSync(dashboardRoute)).toBe(true);
  });

  it("should import Dashboard component", async () => {
    const dashboardRoute = path.join(
      process.cwd(),
      "app",
      "routes",
      "app._index.tsx"
    );
    const content = fs.readFileSync(dashboardRoute, "utf-8");

    expect(content).toContain("Dashboard");
    expect(content).toContain("~/components/Dashboard");
  });

  it("should pass shop name to Dashboard", async () => {
    const dashboardRoute = path.join(
      process.cwd(),
      "app",
      "routes",
      "app._index.tsx"
    );
    const content = fs.readFileSync(dashboardRoute, "utf-8");

    expect(content).toContain("shopName");
    expect(content).toContain("session.shop");
  });
});

describe("Dashboard Component Structure", () => {
  const componentsDir = path.join(process.cwd(), "app", "components");

  it("should have Dashboard.tsx component", () => {
    const dashboardComponent = path.join(componentsDir, "Dashboard.tsx");
    expect(fs.existsSync(dashboardComponent)).toBe(true);
  });

  it("Dashboard should use Polaris components", async () => {
    const dashboardComponent = path.join(componentsDir, "Dashboard.tsx");
    const content = fs.readFileSync(dashboardComponent, "utf-8");

    // Check for Polaris imports
    expect(content).toContain("@shopify/polaris");
    expect(content).toContain("Page");
    expect(content).toContain("Card");
    expect(content).toContain("Text");
  });

  it("Dashboard should display welcome message", async () => {
    const dashboardComponent = path.join(componentsDir, "Dashboard.tsx");
    const content = fs.readFileSync(dashboardComponent, "utf-8");

    expect(content).toContain("Welcome");
    expect(content).toContain("cornerKit");
  });

  it("Dashboard should show shop name", async () => {
    const dashboardComponent = path.join(componentsDir, "Dashboard.tsx");
    const content = fs.readFileSync(dashboardComponent, "utf-8");

    expect(content).toContain("shopName");
    expect(content).toContain("friendlyName");
  });
});

describe("Loading State Component", () => {
  it("should have LoadingState.tsx component", () => {
    const loadingComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "LoadingState.tsx"
    );
    expect(fs.existsSync(loadingComponent)).toBe(true);
  });

  it("LoadingState should use Polaris SkeletonPage", async () => {
    const loadingComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "LoadingState.tsx"
    );
    const content = fs.readFileSync(loadingComponent, "utf-8");

    expect(content).toContain("SkeletonPage");
    expect(content).toContain("@shopify/polaris");
  });

  it("should export InlineLoading component", async () => {
    const loadingComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "LoadingState.tsx"
    );
    const content = fs.readFileSync(loadingComponent, "utf-8");

    expect(content).toContain("InlineLoading");
    expect(content).toContain("export function InlineLoading");
  });
});

describe("ErrorBoundary Component", () => {
  it("should have ErrorBoundary.tsx component", () => {
    const errorComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "ErrorBoundary.tsx"
    );
    expect(fs.existsSync(errorComponent)).toBe(true);
  });

  it("ErrorBoundary should use Polaris Banner", async () => {
    const errorComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "ErrorBoundary.tsx"
    );
    const content = fs.readFileSync(errorComponent, "utf-8");

    expect(content).toContain("Banner");
    expect(content).toContain("@shopify/polaris");
  });

  it("should handle different HTTP status codes", async () => {
    const errorComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "ErrorBoundary.tsx"
    );
    const content = fs.readFileSync(errorComponent, "utf-8");

    expect(content).toContain("400");
    expect(content).toContain("401");
    expect(content).toContain("404");
    expect(content).toContain("500");
  });
});

describe("Polaris Integration", () => {
  it("root.tsx should import Polaris styles", async () => {
    const rootFile = path.join(process.cwd(), "app", "root.tsx");
    const content = fs.readFileSync(rootFile, "utf-8");

    expect(content).toContain("@shopify/polaris/build/esm/styles.css");
  });

  it("root.tsx should wrap app in AppProvider", async () => {
    const rootFile = path.join(process.cwd(), "app", "root.tsx");
    const content = fs.readFileSync(rootFile, "utf-8");

    expect(content).toContain("AppProvider");
    expect(content).toContain("i18n");
    expect(content).toContain("enTranslations");
  });

  it("should use custom app.css styles", async () => {
    const rootFile = path.join(process.cwd(), "app", "root.tsx");
    const content = fs.readFileSync(rootFile, "utf-8");

    expect(content).toContain("~/styles/app.css");
  });
});

describe("Responsive Layout Support", () => {
  it("Dashboard should use BlockStack for layout", async () => {
    const dashboardComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "Dashboard.tsx"
    );
    const content = fs.readFileSync(dashboardComponent, "utf-8");

    // BlockStack provides responsive stacking
    expect(content).toContain("BlockStack");
  });

  it("Dashboard should use InlineStack for horizontal layouts", async () => {
    const dashboardComponent = path.join(
      process.cwd(),
      "app",
      "components",
      "Dashboard.tsx"
    );
    const content = fs.readFileSync(dashboardComponent, "utf-8");

    // InlineStack provides responsive horizontal layouts
    expect(content).toContain("InlineStack");
  });
});
