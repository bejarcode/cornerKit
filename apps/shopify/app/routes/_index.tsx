import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

/**
 * Index Route
 *
 * Redirects all requests to /app which handles authentication.
 * For embedded apps, the auth query params (embedded, shop, host, etc.)
 * are preserved in the redirect.
 *
 * @see FR-001: OAuth 2.0 authentication flow
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Preserve query string when redirecting to /app
  const queryString = url.search;
  return redirect(`/app${queryString}`);
}
