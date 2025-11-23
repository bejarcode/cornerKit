import type { LoaderFunctionArgs } from "@remix-run/node";
import { login } from "~/lib/shopify.server";

/**
 * OAuth Login Route
 *
 * Initiates the Shopify OAuth flow by redirecting to Shopify's
 * authorization page with the configured scopes.
 *
 * Route: /auth/login
 * Method: GET
 *
 * Query Parameters:
 * - shop: The shop's myshopify.com domain (required)
 *
 * @see FR-001: OAuth 2.0 authentication flow
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // If no shop parameter, show login form
  if (!shop) {
    throw new Response("Missing shop parameter", { status: 400 });
  }

  // Initiate OAuth flow - redirects to Shopify
  return login(request);
}
