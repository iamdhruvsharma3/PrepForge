import { createPrepforgeAuth, prepforgeAuthBasePath } from "@prepforge/auth";
import { prisma } from "@prepforge/db";

import { apiEnv, corsOrigins } from "../env";

export const auth = createPrepforgeAuth({
  basePath: prepforgeAuthBasePath,
  baseURL: apiEnv.APP_ORIGIN,
  googleClientId: apiEnv.GOOGLE_CLIENT_ID,
  googleClientSecret: apiEnv.GOOGLE_CLIENT_SECRET,
  prisma,
  secret: apiEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [apiEnv.APP_ORIGIN, ...corsOrigins],
});

