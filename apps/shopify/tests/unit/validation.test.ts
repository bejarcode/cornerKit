/**
 * Shop Domain Validation Unit Tests
 *
 * Tests for shop domain validation functions in session.server.ts
 *
 * @see T044: Create shop domain validation tests
 * @see data-model.md: Validation rules
 */

import { describe, it, expect } from "vitest";

describe("isValidShopDomain", () => {
  it("should accept valid myshopify.com domains", async () => {
    const { isValidShopDomain } = await import("~/lib/session.server");

    expect(isValidShopDomain("my-store.myshopify.com")).toBe(true);
    expect(isValidShopDomain("store123.myshopify.com")).toBe(true);
    expect(isValidShopDomain("test-shop-2024.myshopify.com")).toBe(true);
  });

  it("should accept single character store names", async () => {
    const { isValidShopDomain } = await import("~/lib/session.server");

    expect(isValidShopDomain("a.myshopify.com")).toBe(true);
    expect(isValidShopDomain("1.myshopify.com")).toBe(true);
  });

  it("should reject domains not ending in myshopify.com", async () => {
    const { isValidShopDomain } = await import("~/lib/session.server");

    expect(isValidShopDomain("my-store.com")).toBe(false);
    expect(isValidShopDomain("myshopify.com")).toBe(false);
    expect(isValidShopDomain("store.myshopify.net")).toBe(false);
  });

  it("should reject domains with invalid characters", async () => {
    const { isValidShopDomain } = await import("~/lib/session.server");

    expect(isValidShopDomain("my_store.myshopify.com")).toBe(false);
    expect(isValidShopDomain("my store.myshopify.com")).toBe(false);
    expect(isValidShopDomain("my.store.myshopify.com")).toBe(false);
  });

  it("should reject domains starting with hyphen", async () => {
    const { isValidShopDomain } = await import("~/lib/session.server");

    expect(isValidShopDomain("-mystore.myshopify.com")).toBe(false);
  });

  it("should reject empty strings", async () => {
    const { isValidShopDomain } = await import("~/lib/session.server");

    expect(isValidShopDomain("")).toBe(false);
    expect(isValidShopDomain(".myshopify.com")).toBe(false);
  });
});

describe("sanitizeShopDomain", () => {
  it("should return null for empty input", async () => {
    const { sanitizeShopDomain } = await import("~/lib/session.server");

    expect(sanitizeShopDomain("")).toBeNull();
    expect(sanitizeShopDomain(null as unknown as string)).toBeNull();
    expect(sanitizeShopDomain(undefined as unknown as string)).toBeNull();
  });

  it("should lowercase the domain", async () => {
    const { sanitizeShopDomain } = await import("~/lib/session.server");

    expect(sanitizeShopDomain("MY-STORE.myshopify.com")).toBe(
      "my-store.myshopify.com"
    );
    expect(sanitizeShopDomain("MyStore.MYSHOPIFY.COM")).toBe(
      "mystore.myshopify.com"
    );
  });

  it("should trim whitespace", async () => {
    const { sanitizeShopDomain } = await import("~/lib/session.server");

    expect(sanitizeShopDomain("  my-store.myshopify.com  ")).toBe(
      "my-store.myshopify.com"
    );
    expect(sanitizeShopDomain("\tmy-store.myshopify.com\n")).toBe(
      "my-store.myshopify.com"
    );
  });

  it("should add .myshopify.com if missing", async () => {
    const { sanitizeShopDomain } = await import("~/lib/session.server");

    expect(sanitizeShopDomain("my-store")).toBe("my-store.myshopify.com");
    expect(sanitizeShopDomain("store123")).toBe("store123.myshopify.com");
  });

  it("should not double-add .myshopify.com", async () => {
    const { sanitizeShopDomain } = await import("~/lib/session.server");

    expect(sanitizeShopDomain("my-store.myshopify.com")).toBe(
      "my-store.myshopify.com"
    );
  });

  it("should return null for invalid domains after sanitization", async () => {
    const { sanitizeShopDomain } = await import("~/lib/session.server");

    expect(sanitizeShopDomain("my_store")).toBeNull(); // underscore invalid
    expect(sanitizeShopDomain("-store")).toBeNull(); // starts with hyphen
    expect(sanitizeShopDomain("")).toBeNull();
  });

  it("should handle partial myshopify suffix", async () => {
    const { sanitizeShopDomain } = await import("~/lib/session.server");

    // These don't end in .myshopify.com, so suffix is added
    expect(sanitizeShopDomain("store.myshopify")).toBe(null); // Invalid pattern after suffix added
  });
});

describe("Domain validation edge cases", () => {
  it("should handle very long store names", async () => {
    const { isValidShopDomain, sanitizeShopDomain } = await import(
      "~/lib/session.server"
    );

    const longName = "a".repeat(50);
    const longDomain = `${longName}.myshopify.com`;

    expect(isValidShopDomain(longDomain)).toBe(true);
    expect(sanitizeShopDomain(longName)).toBe(longDomain);
  });

  it("should handle numeric-only store names", async () => {
    const { isValidShopDomain, sanitizeShopDomain } = await import(
      "~/lib/session.server"
    );

    expect(isValidShopDomain("123456.myshopify.com")).toBe(true);
    expect(sanitizeShopDomain("123456")).toBe("123456.myshopify.com");
  });

  it("should handle hyphens in middle of name", async () => {
    const { isValidShopDomain, sanitizeShopDomain } = await import(
      "~/lib/session.server"
    );

    expect(isValidShopDomain("my-cool-store.myshopify.com")).toBe(true);
    expect(sanitizeShopDomain("my-cool-store")).toBe(
      "my-cool-store.myshopify.com"
    );
  });
});
