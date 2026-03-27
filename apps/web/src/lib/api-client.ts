import { createPrepforgeApiClient } from "@prepforge/api-client";

import { webEnv } from "../env";

export const prepforgeApiClient = createPrepforgeApiClient(
  webEnv.NEXT_PUBLIC_API_BASE_URL,
);

