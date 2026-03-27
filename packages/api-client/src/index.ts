import { apiHealthResponseSchema } from "@prepforge/types";

import { AuthClient } from "./auth-client";
import { PrepforgeHttpClient } from "./http-client";
import { InterviewsClient } from "./interviews-client";
import { WorkspacesClient } from "./workspaces-client";

export function createPrepforgeApiClient(baseUrl: string) {
  const httpClient = new PrepforgeHttpClient({ baseUrl });

  return {
    auth: new AuthClient(httpClient),
    health: () => httpClient.get("/health", apiHealthResponseSchema),
    interviews: new InterviewsClient(httpClient),
    workspaces: new WorkspacesClient(httpClient),
  };
}

export * from "./auth-client";
export * from "./http-client";
export * from "./interviews-client";
export * from "./workspaces-client";
