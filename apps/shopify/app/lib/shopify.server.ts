import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

/**
 * Environment Configuration
 *
 * @see FR-018: Environment-based settings (dev vs prod)
 */
export const isDevelopment = process.env["NODE_ENV"] !== "production";
export const isProduction = process.env["NODE_ENV"] === "production";

/**
 * Get the app URL from environment
 * The Shopify CLI should inject SHOPIFY_APP_URL automatically
 * For production, this must be set to your deployed app URL
 */
function getAppUrl(): string {
  return process.env["SHOPIFY_APP_URL"] || "";
}

/**
 * Shopify App Configuration
 *
 * This configures the Shopify app with:
 * - OAuth authentication
 * - Session storage via Prisma (SQLite dev, PostgreSQL prod)
 * - Webhook handling
 * - HMAC verification (automatic)
 *
 * @see FR-001: OAuth 2.0 authentication flow
 * @see FR-002: HMAC signature validation
 * @see FR-006: Session persistence
 */
const shopify = shopifyApp({
  apiKey: process.env["SHOPIFY_API_KEY"],
  apiSecretKey: process.env["SHOPIFY_API_SECRET"] || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env["SCOPES"]?.split(",") || ["read_themes", "write_themes"],
  appUrl: getAppUrl(),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  isEmbeddedApp: true,
  // Future flags for new embedded auth strategy
  // @see https://shopify.dev/docs/api/shopify-app-remix#future-flags
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  // Custom domain support (optional)
  ...(process.env["SHOP_CUSTOM_DOMAIN"]
    ? { customShopDomains: [process.env["SHOP_CUSTOM_DOMAIN"]] }
    : {}),
});

export default shopify;

// API version for consistency across the app
export const apiVersion = ApiVersion.October24;

// Re-export commonly used functions
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
