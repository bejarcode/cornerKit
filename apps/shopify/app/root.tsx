import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import type { HeadersFunction, LinksFunction } from "@remix-run/node";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { Banner, Page } from "@shopify/polaris";
import styles from "~/styles/app.css?url";

/**
 * Root Layout
 *
 * Sets up:
 * - Polaris AppProvider for Shopify admin UI
 * - Document response headers for embedded app
 * - Global styles
 */

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://cdn.shopify.com" },
];

export const headers: HeadersFunction = () => ({
  "Content-Security-Policy":
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com;",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={enTranslations}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Error Boundary for uncaught errors
 * Uses Remix v2 error handling with useRouteError
 */
export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred.";
  let errorTitle = "Something went wrong";

  if (isRouteErrorResponse(error)) {
    errorTitle = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider i18n={enTranslations}>
          <Page title={errorTitle}>
            <Banner tone="critical">
              <p>{errorMessage}</p>
            </Banner>
          </Page>
        </AppProvider>
        <Scripts />
      </body>
    </html>
  );
}
