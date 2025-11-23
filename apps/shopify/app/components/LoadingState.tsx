import {
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
  Card,
  BlockStack,
} from "@shopify/polaris";

/**
 * Loading State Component
 *
 * Displays a skeleton loading state while the app is loading.
 * Uses Polaris SkeletonPage for consistent loading experience.
 *
 * @see FR-013: Loading indicators during async operations
 */

interface LoadingStateProps {
  /** Optional title for the skeleton page */
  title?: string;
  /** Number of skeleton cards to show */
  cardCount?: number;
}

export function LoadingState({
  title = "Loading...",
  cardCount = 2,
}: LoadingStateProps) {
  return (
    <SkeletonPage title={title} primaryAction>
      <BlockStack gap="500">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Card key={index}>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={3} />
            </BlockStack>
          </Card>
        ))}
      </BlockStack>
    </SkeletonPage>
  );
}

/**
 * Inline Loading Spinner
 *
 * A smaller loading indicator for inline use within components.
 * Styles defined in app.css for better separation of concerns.
 */
export function InlineLoading() {
  return (
    <div className="inline-loading">
      <div className="inline-loading__spinner" />
    </div>
  );
}
