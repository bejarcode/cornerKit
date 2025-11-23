import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify.server";
import { deleteSessionsByShop } from "~/lib/session.server";

/**
 * Webhook Handler Route
 *
 * Handles all incoming Shopify webhooks with automatic HMAC verification.
 * Supports app lifecycle and GDPR compliance webhooks.
 *
 * Route: POST /webhooks
 *
 * @see FR-004: Webhook handling for app lifecycle events
 * @see FR-009: Clean session removal on app uninstall
 * @see FR-024: GDPR compliance webhooks
 * @see T035-T041: Webhook implementation tasks
 */

/**
 * Webhook action handler
 * All webhooks are verified via HMAC before processing
 */
const isDev = process.env["NODE_ENV"] === "development";

export async function action({ request }: ActionFunctionArgs) {
  // authenticate.webhook() handles HMAC verification automatically
  // Throws 401 if verification fails
  const { topic, shop, payload } = await authenticate.webhook(request);

  if (isDev) {
    console.log(`Received webhook: ${topic} for shop: ${shop}`);
  }

  switch (topic) {
    // =========================================================================
    // App Lifecycle Webhooks
    // =========================================================================

    case "APP_UNINSTALLED":
      /**
       * App Uninstalled Handler
       *
       * Triggered when a merchant uninstalls the app.
       * Cleans up all session data for the shop.
       *
       * @see FR-009: Clean session removal on app uninstall
       * @see SC-007: Session cleanup within 60 seconds
       * @see T036, T037
       */
      await handleAppUninstalled(shop);
      break;

    // =========================================================================
    // GDPR Compliance Webhooks (Mandatory)
    // =========================================================================

    case "CUSTOMERS_DATA_REQUEST":
      /**
       * Customer Data Request Handler
       *
       * Triggered when a customer requests their data under GDPR/CCPA.
       * cornerKit stores no customer data, so we acknowledge but return nothing.
       *
       * @see FR-024: GDPR compliance
       * @see T038
       */
      handleCustomersDataRequest(shop, payload as CustomerDataRequestPayload);
      break;

    case "CUSTOMERS_REDACT":
      /**
       * Customer Data Redaction Handler
       *
       * Triggered when a customer requests deletion of their data.
       * cornerKit stores no customer data, so we acknowledge only.
       *
       * @see FR-024: GDPR compliance
       * @see T039
       */
      handleCustomersRedact(shop, payload as CustomersRedactPayload);
      break;

    case "SHOP_REDACT":
      /**
       * Shop Data Redaction Handler
       *
       * Triggered 48 hours after app uninstall.
       * Final cleanup - should already be done by APP_UNINSTALLED.
       *
       * @see FR-024: GDPR compliance
       * @see T040
       */
      await handleShopRedact(shop);
      break;

    default:
      if (isDev) {
        console.log(`Unhandled webhook topic: ${topic}`);
      }
  }

  // Return 200 to acknowledge receipt
  // Shopify will retry if we return 4xx/5xx
  return new Response(null, { status: 200 });
}

// =============================================================================
// Webhook Handlers
// =============================================================================

/**
 * Handle app/uninstalled webhook
 * Deletes all session data for the shop
 *
 * @param shop - The shop's myshopify.com domain
 */
async function handleAppUninstalled(shop: string): Promise<void> {
  if (isDev) {
    console.log(`Processing app uninstall for: ${shop}`);
  }

  try {
    const deletedCount = await deleteSessionsByShop(shop);
    if (isDev) {
      console.log(`Deleted ${deletedCount} sessions for shop: ${shop}`);
    }
  } catch (error) {
    // Log errors even in production for debugging
    console.error(`Error cleaning up sessions for ${shop}:`, error);
    // Don't throw - we want to return 200 to Shopify
    // The data will be cleaned up by shop/redact later if needed
  }
}

/**
 * Handle customers/data_request GDPR webhook
 * cornerKit stores no customer data, so we acknowledge but don't return data
 *
 * @param shop - The shop's myshopify.com domain
 * @param payload - The webhook payload containing customer info
 */
function handleCustomersDataRequest(
  shop: string,
  payload: CustomerDataRequestPayload
): void {
  if (isDev) {
    console.log(
      `Customer data request for shop: ${shop}, customer: ${payload.customer?.email || "unknown"}`
    );
  }

  // cornerKit stores no customer-specific data
  // We only store session data tied to the shop, not individual customers
  // Nothing to return
}

/**
 * Handle customers/redact GDPR webhook
 * cornerKit stores no customer data, so we acknowledge only
 *
 * @param shop - The shop's myshopify.com domain
 * @param payload - The webhook payload containing customer info
 */
function handleCustomersRedact(
  shop: string,
  payload: CustomersRedactPayload
): void {
  if (isDev) {
    console.log(
      `Customer redact request for shop: ${shop}, customer: ${payload.customer?.email || "unknown"}`
    );
  }

  // cornerKit stores no customer-specific data
  // Nothing to delete
}

/**
 * Handle shop/redact GDPR webhook
 * Final cleanup 48 hours after uninstall
 *
 * @param shop - The shop's myshopify.com domain
 */
async function handleShopRedact(shop: string): Promise<void> {
  if (isDev) {
    console.log(`Shop redact request for: ${shop}`);
  }

  try {
    // This should be a no-op if APP_UNINSTALLED was processed correctly
    // But we run it anyway as a safety net
    const deletedCount = await deleteSessionsByShop(shop);

    if (deletedCount > 0 && isDev) {
      console.log(
        `Shop redact cleaned up ${deletedCount} remaining sessions for: ${shop}`
      );
    }
  } catch (error) {
    // Log errors even in production for debugging
    console.error(`Error in shop redact for ${shop}:`, error);
    // Don't throw - acknowledge receipt
  }
}

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Payload for customers/data_request webhook
 */
interface CustomerDataRequestPayload {
  shop_id: number;
  shop_domain: string;
  orders_requested: number[];
  customer: {
    id: number;
    email: string;
    phone?: string;
  };
  data_request: {
    id: number;
  };
}

/**
 * Payload for customers/redact webhook
 */
interface CustomersRedactPayload {
  shop_id: number;
  shop_domain: string;
  customer: {
    id: number;
    email: string;
    phone?: string;
  };
  orders_to_redact: number[];
}
