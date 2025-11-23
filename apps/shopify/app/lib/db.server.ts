import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 *
 * Ensures a single PrismaClient instance is used across the app
 * to prevent connection pool exhaustion in development.
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances during hot reload in development
export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__prisma = prisma;
}
