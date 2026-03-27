import type { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

import { slugify } from "@prepforge/utils";

import {
  prepforgeAuthAdditionalFields,
  prepforgeAuthBasePath,
} from "./constants";

type CreatePrepforgeAuthOptions = {
  appName?: string;
  basePath?: string;
  baseURL: string;
  googleClientId?: string | undefined;
  googleClientSecret?: string | undefined;
  prisma: PrismaClient;
  secret: string;
  trustedOrigins: string[];
};

function buildWorkspaceSlug(userId: string, fallbackName: string): string {
  const seed = slugify(fallbackName) || "workspace";
  return `${seed}-${userId.slice(0, 6)}`;
}

export function createPrepforgeAuth({
  appName = "PrepForge",
  basePath = prepforgeAuthBasePath,
  baseURL,
  googleClientId,
  googleClientSecret,
  prisma,
  secret,
  trustedOrigins,
}: CreatePrepforgeAuthOptions) {
  const socialProviders =
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined;

  return betterAuth({
    advanced: {
      cookiePrefix: "prepforge",
      defaultCookieAttributes: {
        sameSite: "lax",
      },
      useSecureCookies: baseURL.startsWith("https://"),
    },
    appName,
    basePath,
    baseURL,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const workspace = await prisma.workspace.create({
              data: {
                members: {
                  create: {
                    role: "owner",
                    userId: user.id,
                  },
                },
                name: `${user.name}'s Workspace`,
                slug: buildWorkspaceSlug(user.id, user.name || user.email),
              },
            });

            await prisma.user.update({
              data: {
                activeWorkspaceId: workspace.id,
              },
              where: {
                id: user.id,
              },
            });
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    secret,
    trustedOrigins,
    user: {
      additionalFields: prepforgeAuthAdditionalFields.user,
    },
    ...(socialProviders ? { socialProviders } : {}),
  });
}
