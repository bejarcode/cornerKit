/**
 * Session Management Unit Tests
 *
 * Tests for session utility functions in session.server.ts
 *
 * @see T042: Create session management tests
 * @see FR-006: Session persistence
 * @see SC-004: 24-hour session persistence
 */

import { describe, it, expect } from "vitest";
import type { Session } from "@prisma/client";

// Mock the session functions (since they depend on Prisma)
// We're testing the pure utility functions

/**
 * Helper to create a mock session
 */
function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "test-session-id",
    shop: "test-shop.myshopify.com",
    state: null,
    isOnline: true,
    scope: "read_themes,write_themes",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    accessToken: "test-access-token",
    userId: null,
    ...overrides,
  };
}

describe("Session Constants", () => {
  it("SESSION_LIFETIME_MS should be 24 hours", async () => {
    // Import the constant
    const { SESSION_LIFETIME_MS } = await import("~/lib/session.server");

    expect(SESSION_LIFETIME_MS).toBe(24 * 60 * 60 * 1000);
  });

  it("SESSION_LIFETIME_SECONDS should be 24 hours in seconds", async () => {
    const { SESSION_LIFETIME_SECONDS } = await import("~/lib/session.server");

    expect(SESSION_LIFETIME_SECONDS).toBe(24 * 60 * 60);
  });
});

describe("isSessionExpired", () => {
  it("should return false for offline sessions (no expiry)", async () => {
    const { isSessionExpired } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: false,
      expires: null,
    });

    expect(isSessionExpired(session)).toBe(false);
  });

  it("should return false for online sessions with null expires", async () => {
    const { isSessionExpired } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: true,
      expires: null,
    });

    expect(isSessionExpired(session)).toBe(false);
  });

  it("should return false for non-expired online sessions", async () => {
    const { isSessionExpired } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    expect(isSessionExpired(session)).toBe(false);
  });

  it("should return true for expired online sessions", async () => {
    const { isSessionExpired } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: true,
      expires: new Date(Date.now() - 1000), // 1 second ago
    });

    expect(isSessionExpired(session)).toBe(true);
  });
});

describe("calculateSessionExpiry", () => {
  it("should return a date 24 hours in the future", async () => {
    const { calculateSessionExpiry, SESSION_LIFETIME_MS } = await import(
      "~/lib/session.server"
    );

    const before = Date.now();
    const expiry = calculateSessionExpiry();
    const after = Date.now();

    // Expiry should be approximately 24 hours from now
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + SESSION_LIFETIME_MS);
    expect(expiry.getTime()).toBeLessThanOrEqual(after + SESSION_LIFETIME_MS);
  });
});

describe("getTimeUntilExpiry", () => {
  it("should return null for sessions without expiry", async () => {
    const { getTimeUntilExpiry } = await import("~/lib/session.server");

    const session = createMockSession({ expires: null });

    expect(getTimeUntilExpiry(session)).toBeNull();
  });

  it("should return positive value for non-expired sessions", async () => {
    const { getTimeUntilExpiry } = await import("~/lib/session.server");

    const session = createMockSession({
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    const result = getTimeUntilExpiry(session);

    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(60 * 60 * 1000);
  });

  it("should return 0 for expired sessions", async () => {
    const { getTimeUntilExpiry } = await import("~/lib/session.server");

    const session = createMockSession({
      expires: new Date(Date.now() - 1000), // 1 second ago
    });

    expect(getTimeUntilExpiry(session)).toBe(0);
  });
});

describe("sessionNeedsRefresh", () => {
  it("should return false for offline sessions", async () => {
    const { sessionNeedsRefresh } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: false,
      expires: null,
    });

    expect(sessionNeedsRefresh(session)).toBe(false);
  });

  it("should return false when more than 5 minutes remaining", async () => {
    const { sessionNeedsRefresh } = await import("~/lib/session.server");

    const session = createMockSession({
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    });

    expect(sessionNeedsRefresh(session)).toBe(false);
  });

  it("should return true when less than 5 minutes remaining", async () => {
    const { sessionNeedsRefresh } = await import("~/lib/session.server");

    const session = createMockSession({
      expires: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
    });

    expect(sessionNeedsRefresh(session)).toBe(true);
  });

  it("should return true for expired sessions", async () => {
    const { sessionNeedsRefresh } = await import("~/lib/session.server");

    const session = createMockSession({
      expires: new Date(Date.now() - 1000), // expired
    });

    expect(sessionNeedsRefresh(session)).toBe(true);
  });
});

describe("canRefreshToken", () => {
  it("should return false for offline sessions", async () => {
    const { canRefreshToken } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: false,
      expires: null,
    });

    expect(canRefreshToken(session)).toBe(false);
  });

  it("should return false for online sessions without expiry", async () => {
    const { canRefreshToken } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: true,
      expires: null,
    });

    expect(canRefreshToken(session)).toBe(false);
  });

  it("should return true for online sessions with expiry", async () => {
    const { canRefreshToken } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: true,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    expect(canRefreshToken(session)).toBe(true);
  });
});

describe("getSessionSummary", () => {
  it("should truncate session ID for security", async () => {
    const { getSessionSummary } = await import("~/lib/session.server");

    const session = createMockSession({
      id: "1234567890abcdef",
    });

    const summary = getSessionSummary(session);

    expect(summary.id).toBe("12345678...");
    expect(summary.id).not.toContain("90abcdef");
  });

  it("should include shop and isOnline", async () => {
    const { getSessionSummary } = await import("~/lib/session.server");

    const session = createMockSession({
      shop: "my-store.myshopify.com",
      isOnline: true,
    });

    const summary = getSessionSummary(session);

    expect(summary.shop).toBe("my-store.myshopify.com");
    expect(summary.isOnline).toBe(true);
  });

  it("should include expiry info for online sessions", async () => {
    const { getSessionSummary } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const summary = getSessionSummary(session);

    expect(summary.expiresIn).toContain("minutes");
  });

  it("should return null expiresIn for offline sessions", async () => {
    const { getSessionSummary } = await import("~/lib/session.server");

    const session = createMockSession({
      isOnline: false,
      expires: null,
    });

    const summary = getSessionSummary(session);

    expect(summary.expiresIn).toBeNull();
  });
});
