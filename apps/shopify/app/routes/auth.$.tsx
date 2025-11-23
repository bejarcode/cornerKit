import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify.server";

/**
 * OAuth Callback Handler (Splat Route)
 *
 * Handles OAuth callbacks from Shopify during the authentication flow.
 * This splat route catches all /auth/* paths not handled by other routes.
 *
 * Route: /auth/*
 * Method: GET
 *
 * Handles:
 * - /auth/callback - OAuth callback with authorization code
 * - /auth/shopify/callback - Alternative callback path
 *
 * @see FR-001: OAuth 2.0 authentication flow
 * @see FR-002: HMAC signature validation (automatic via shopify-app-remix)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // authenticate.admin handles the entire OAuth callback flow:
  // 1. Validates HMAC signature
  // 2. Exchanges authorization code for access token
  // 3. Creates/updates session in storage
  // 4. Redirects to the app automatically
  //
  // Note: This function throws a redirect response internally,
  // so the code below only executes if something unexpected happens.
  return authenticate.admin(request);
}
