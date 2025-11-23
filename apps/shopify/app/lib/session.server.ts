import { prisma } from "./db.server";
import type { Session } from "@prisma/client";

/**
 * Session Management Utilities
 *
 * Additional session management functions beyond what
 * @shopify/shopify-app-session-storage-prisma provides.
 *
 * @see FR-006: Session persistence in storage
 * @see FR-007: File-based dev storage, database for production
 * @see FR-008: Automatic token refresh
 * @see SC-004: 24-hour session persistence
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Session lifetime in milliseconds (24 hours)
 * @see SC-004: Merchants remain authenticated for 24 hours
 */
export const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Session lifetime in seconds (for Shopify API)
 */
export const SESSION_LIFETIME_SECONDS = 24 * 60 * 60;

// ============================================================================
// Session Retrieval (T028: Shop domain lookup with index)
// ============================================================================

/**
 * Get all sessions for a shop
 * Uses the shop index for efficient lookup
 *
 * @param shop - The shop's myshopify.com domain
 * @returns Array of sessions for the shop
 */
export async function getSessionsByShop(shop: string): Promise<Session[]> {
  return prisma.session.findMany({
    where: { shop },
    orderBy: { expires: "desc" }, // Latest session first
  });
}

/**
 * Get the most recent active session for a shop
 * Useful for getting the current valid session
 *
 * @param shop - The shop's myshopify.com domain
 * @returns The most recent non-expired session, or null
 */
export async function getActiveSessionByShop(
  shop: string
): Promise<Session | null> {
  const now = new Date();

  return prisma.session.findFirst({
    where: {
      shop,
      OR: [
        { expires: null }, // Offline tokens don't expire
        { expires: { gt: now } }, // Not expired
      ],
    },
    orderBy: { expires: "desc" },
  });
}

/**
 * Get offline session for a shop
 * Offline sessions are used for background tasks
 *
 * @param shop - The shop's myshopify.com domain
 * @returns The offline session, or null
 */
export async function getOfflineSessionByShop(
  shop: string
): Promise<Session | null> {
  return prisma.session.findFirst({
    where: {
      shop,
      isOnline: false,
    },
  });
}

// ============================================================================
// Session Validation (T026: 24hr expiry handling)
// ============================================================================

/**
 * Check if a session exists and is valid (not expired)
 *
 * @param sessionId - The session ID to check
 * @returns True if session exists and is not expired
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return false;
  }

  return isSessionExpired(session) === false;
}

/**
 * Check if a session is expired
 *
 * @param session - The session to check
 * @returns True if session is expired
 */
export function isSessionExpired(session: Session): boolean {
  // Offline tokens don't expire
  if (!session.isOnline || !session.expires) {
    return false;
  }

  return session.expires <= new Date();
}

/**
 * Calculate session expiry time (24 hours from now)
 *
 * @returns Date object representing 24 hours from now
 */
export function calculateSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_LIFETIME_MS);
}

/**
 * Get time until session expires in milliseconds
 *
 * @param session - The session to check
 * @returns Milliseconds until expiry, or null if no expiry
 */
export function getTimeUntilExpiry(session: Session): number | null {
  if (!session.expires) {
    return null;
  }

  return Math.max(0, session.expires.getTime() - Date.now());
}

/**
 * Check if session needs refresh (within 5 minutes of expiry)
 *
 * @param session - The session to check
 * @returns True if session should be refreshed
 */
export function sessionNeedsRefresh(session: Session): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(session);

  if (timeUntilExpiry === null) {
    return false; // Offline tokens don't need refresh
  }

  // Refresh if less than 5 minutes remaining
  const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;
  return timeUntilExpiry < REFRESH_THRESHOLD_MS;
}

// ============================================================================
// Session Cleanup (T029: Concurrent session handling)
// ============================================================================

/**
 * Delete all sessions for a shop (used on app uninstall)
 *
 * @param shop - The shop's myshopify.com domain
 * @returns Number of sessions deleted
 */
export async function deleteSessionsByShop(shop: string): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { shop },
  });
  return result.count;
}

/**
 * Clean up expired sessions (background job)
 *
 * @returns Number of sessions deleted
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

/**
 * Handle concurrent sessions - keep only the latest session per shop
 * This implements "latest takes precedence" for concurrent installs
 *
 * @see T029: Concurrent session edge case handling
 * @param shop - The shop's myshopify.com domain
 * @returns Number of old sessions deleted
 */
export async function cleanupConcurrentSessions(shop: string): Promise<number> {
  // Get all sessions for the shop
  const sessions = await getSessionsByShop(shop);

  if (sessions.length <= 1) {
    return 0;
  }

  // Keep the most recent session (first after orderBy desc)
  const sessionsToDelete = sessions.slice(1);
  const idsToDelete = sessionsToDelete.map((s) => s.id);

  const result = await prisma.session.deleteMany({
    where: {
      id: { in: idsToDelete },
    },
  });

  return result.count;
}

/**
 * Clean up old online sessions when a new one is created
 * Called after successful OAuth to ensure only one active online session
 *
 * @param shop - The shop's myshopify.com domain
 * @param currentSessionId - The new session ID to keep
 * @returns Number of old sessions deleted
 */
export async function cleanupOldOnlineSessions(
  shop: string,
  currentSessionId: string
): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      shop,
      isOnline: true,
      id: { not: currentSessionId },
    },
  });

  return result.count;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate shop domain format
 * Returns true if domain matches *.myshopify.com pattern
 *
 * @param domain - The domain to validate
 * @returns True if valid myshopify.com domain
 */
export function isValidShopDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(domain);
}

/**
 * Sanitize shop domain
 * Ensures domain is lowercase and has .myshopify.com suffix
 *
 * @param domain - The domain to sanitize
 * @returns Sanitized domain or null if invalid
 */
export function sanitizeShopDomain(domain: string): string | null {
  if (!domain) {
    return null;
  }

  let sanitized = domain.toLowerCase().trim();

  // Add .myshopify.com if missing
  if (!sanitized.endsWith(".myshopify.com")) {
    sanitized = `${sanitized}.myshopify.com`;
  }

  // Validate the sanitized domain
  if (!isValidShopDomain(sanitized)) {
    return null;
  }

  return sanitized;
}

// ============================================================================
// Token Refresh Helpers (T027: Automatic token refresh)
// ============================================================================

/**
 * Note: Token refresh is handled automatically by @shopify/shopify-app-remix
 * These utilities help with refresh-related logic
 */

/**
 * Check if session has refresh token capability
 * Only online tokens can be refreshed
 *
 * @param session - The session to check
 * @returns True if session can be refreshed
 */
export function canRefreshToken(session: Session): boolean {
  return session.isOnline && session.expires !== null;
}

/**
 * Get session info for debugging (without sensitive data)
 *
 * @param session - The session to summarize
 * @returns Safe session summary for logging
 */
export function getSessionSummary(session: Session): {
  id: string;
  shop: string;
  isOnline: boolean;
  isExpired: boolean;
  expiresIn: string | null;
} {
  const timeUntilExpiry = getTimeUntilExpiry(session);

  return {
    id: session.id.substring(0, 8) + "...", // Truncate for security
    shop: session.shop,
    isOnline: session.isOnline,
    isExpired: isSessionExpired(session),
    expiresIn: timeUntilExpiry
      ? `${Math.round(timeUntilExpiry / 1000 / 60)} minutes`
      : null,
  };
}
