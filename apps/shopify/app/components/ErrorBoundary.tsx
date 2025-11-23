import { Page, Card, Banner, BlockStack, Button, Text } from "@shopify/polaris";

/**
 * Error Boundary Component
 *
 * Displays user-friendly error messages for various error types.
 * Provides recovery actions where possible.
 *
 * @see FR-014: User-friendly error states
 */

interface ErrorBoundaryProps {
  /** Error title to display */
  title?: string;
  /** Error message or description */
  message?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** HTTP status code if applicable */
  statusCode?: number;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  showRetry = true,
  onRetry,
  statusCode,
}: ErrorBoundaryProps) {
  // Determine error tone based on status code
  const tone = statusCode && statusCode >= 500 ? "critical" : "warning";

  // Get appropriate title based on status code
  const errorTitle = statusCode
    ? getErrorTitle(statusCode)
    : title;

  // Get appropriate message based on status code
  const errorMessage = statusCode
    ? getErrorMessage(statusCode, message)
    : message;

  return (
    <Page title="Error">
      <Card>
        <BlockStack gap="400">
          <Banner title={errorTitle} tone={tone}>
            <p>{errorMessage}</p>
          </Banner>

          {showRetry && (
            <BlockStack gap="200">
              <Text as="p" variant="bodySm" tone="subdued">
                If this problem persists, please contact support.
              </Text>
              <Button
                onClick={onRetry}
                url={onRetry ? undefined : "/app"}
              >
                {onRetry ? "Try Again" : "Return to Dashboard"}
              </Button>
            </BlockStack>
          )}
        </BlockStack>
      </Card>
    </Page>
  );
}

/**
 * Get user-friendly error title based on HTTP status code
 */
function getErrorTitle(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "Invalid Request";
    case 401:
      return "Authentication Required";
    case 403:
      return "Access Denied";
    case 404:
      return "Page Not Found";
    case 429:
      return "Too Many Requests";
    case 500:
      return "Server Error";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
    default:
      return "Something went wrong";
  }
}

/**
 * Get user-friendly error message based on HTTP status code
 */
function getErrorMessage(statusCode: number, fallback: string): string {
  switch (statusCode) {
    case 400:
      return "The request was invalid. Please check your input and try again.";
    case 401:
      return "Your session has expired. Please re-authenticate with Shopify.";
    case 403:
      return "You don't have permission to access this resource.";
    case 404:
      return "The page you're looking for doesn't exist.";
    case 429:
      return "You've made too many requests. Please wait a moment and try again.";
    case 500:
      return "We're experiencing technical difficulties. Please try again later.";
    case 502:
    case 503:
      return "The service is temporarily unavailable. Please try again in a few minutes.";
    default:
      return fallback;
  }
}

/**
 * Authentication Error Component
 *
 * Specialized error display for authentication failures.
 */
export function AuthenticationError() {
  return (
    <ErrorDisplay
      title="Authentication Required"
      message="Please log in to access this app."
      statusCode={401}
      showRetry={false}
    />
  );
}

/**
 * Not Found Error Component
 *
 * Specialized error display for 404 errors.
 */
export function NotFoundError() {
  return (
    <ErrorDisplay
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      statusCode={404}
      showRetry={false}
    />
  );
}
