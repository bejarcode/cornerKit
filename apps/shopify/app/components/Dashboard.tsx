import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Box,
} from "@shopify/polaris";

/**
 * Dashboard Component
 *
 * Welcome dashboard for the cornerKit Shopify app.
 * Displays app status and provides navigation to features.
 *
 * @see FR-010: Polaris-styled admin interface
 * @see FR-012: Responsive layout (desktop/tablet)
 */

interface DashboardProps {
  /** The shop's myshopify.com domain */
  shopName: string;
}

export function Dashboard({ shopName }: DashboardProps) {
  // Extract friendly shop name (remove .myshopify.com)
  const friendlyName = shopName.replace(".myshopify.com", "");

  return (
    <Page title="cornerKit">
      <BlockStack gap="500">
        {/* Welcome Card */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingMd">
                Welcome to cornerKit
              </Text>
              <Badge tone="success">Connected</Badge>
            </InlineStack>

            <Text as="p" variant="bodyMd" tone="subdued">
              Add beautiful iOS-style squircle corners to your Shopify store.
              cornerKit uses progressive enhancement to deliver the best
              possible experience across all browsers.
            </Text>

            <Box paddingBlockStart="200">
              <Text as="p" variant="bodySm" tone="subdued">
                Store: <Text as="span" fontWeight="semibold">{friendlyName}</Text>
              </Text>
            </Box>
          </BlockStack>
        </Card>

        {/* Quick Start Card */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Getting Started
            </Text>

            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center">
                <Badge tone="info">1</Badge>
                <Text as="p" variant="bodyMd">
                  Configure your squircle settings in the Settings tab
                </Text>
              </InlineStack>

              <InlineStack gap="200" blockAlign="center">
                <Badge tone="info">2</Badge>
                <Text as="p" variant="bodyMd">
                  Enable cornerKit on your theme via Theme App Extensions
                </Text>
              </InlineStack>

              <InlineStack gap="200" blockAlign="center">
                <Badge tone="info">3</Badge>
                <Text as="p" variant="bodyMd">
                  Preview your store to see squircle corners in action
                </Text>
              </InlineStack>
            </BlockStack>
          </BlockStack>
        </Card>

        {/* Status Card */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              App Status
            </Text>

            <InlineStack gap="400" wrap={false}>
              <Box
                background="bg-surface-secondary"
                padding="400"
                borderRadius="200"
                minWidth="120px"
              >
                <BlockStack gap="100" inlineAlign="center">
                  <Text as="p" variant="headingLg" alignment="center">
                    0
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                    Elements styled
                  </Text>
                </BlockStack>
              </Box>

              <Box
                background="bg-surface-secondary"
                padding="400"
                borderRadius="200"
                minWidth="120px"
              >
                <BlockStack gap="100" inlineAlign="center">
                  <Text as="p" variant="headingLg" alignment="center">
                    -
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                    Theme status
                  </Text>
                </BlockStack>
              </Box>
            </InlineStack>

            <Text as="p" variant="bodySm" tone="subdued">
              Theme configuration coming in a future update.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
