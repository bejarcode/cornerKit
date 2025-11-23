import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/lib/shopify.server";
import { Dashboard } from "~/components/Dashboard";

/**
 * Main App Entry Route
 *
 * The primary route for the embedded Shopify app. Displays the
 * dashboard after successful authentication.
 *
 * Route: /app
 * Method: GET
 *
 * @see FR-010: Polaris-styled admin interface
 * @see FR-011: App Bridge integration for embedded functionality
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Authenticate the request - redirects to OAuth if not authenticated
  const { session } = await authenticate.admin(request);

  // Only pass non-sensitive session info needed by the client
  return json({
    shop: session.shop,
  });
}

export default function AppIndex() {
  const { shop } = useLoaderData<typeof loader>();

  return <Dashboard shopName={shop} />;
}
