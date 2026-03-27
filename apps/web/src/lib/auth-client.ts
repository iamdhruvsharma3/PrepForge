import { createPrepforgeReactAuthClient } from "@prepforge/auth";

import { webEnv } from "../env";

export const prepforgeAuthClient = createPrepforgeReactAuthClient({
  baseURL: webEnv.NEXT_PUBLIC_AUTH_BASE_URL,
});

