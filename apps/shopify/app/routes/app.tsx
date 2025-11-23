import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { authenticate, isDevelopment } from "~/lib/shopify.server";
import { ErrorDisplay } from "~/components/ErrorBoundary";

/**
 * App Layout Route
 *
 * Parent layout for all /app/* routes. Handles:
 * - Authentication verification
 * - App Bridge provider setup
 * - Navigation menu configuration
 *
 * @see FR-011: App Bridge integration for embedded functionality
 */

export const headers: HeadersFunction = () => ({
  "Content-Security-Policy":
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com;",
});

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const apiKey = process.env["SHOPIFY_API_KEY"];

  // Fail fast if API key is missing - this is a configuration error
  if (!apiKey) {
    if (isDevelopment) {
      console.error("SHOPIFY_API_KEY is missing from environment variables");
    }
    throw new Response("App configuration error", { status: 500 });
  }

  return json({ apiKey });
}

export default function AppLayout() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <a href="/app" rel="home">
          Dashboard
        </a>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

/**
 * Error boundary for app routes
 */
export function ErrorBoundary() {
  const error = useRouteError();

  let statusCode = 500;
  let message = "An unexpected error occurred.";

  if (error instanceof Response) {
    statusCode = error.status;
    message = error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return <ErrorDisplay statusCode={statusCode} message={message} />;
}
