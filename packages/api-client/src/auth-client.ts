import type { AuthSessionContextResponse } from "@prepforge/types";
import { authSessionContextResponseSchema } from "@prepforge/types";

import type { PrepforgeHttpClient } from "./http-client";

export class AuthClient {
  constructor(private readonly httpClient: PrepforgeHttpClient) {}

  getSessionContext(): Promise<AuthSessionContextResponse> {
    return this.httpClient.get(
      "/identity/session-context",
      authSessionContextResponseSchema,
    );
  }
}
