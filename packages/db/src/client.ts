import { PrismaClient } from "@prisma/client";

declare global {
  var __prepforgePrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prepforgePrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prepforgePrisma__ = prisma;
}

