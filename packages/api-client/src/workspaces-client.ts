import type {
  AuthSessionContextResponse,
  SetActiveWorkspaceInput,
} from "@prepforge/types";
import {
  authSessionContextResponseSchema,
  setActiveWorkspaceInputSchema,
} from "@prepforge/types";

import type { PrepforgeHttpClient } from "./http-client";

export class WorkspacesClient {
  constructor(private readonly httpClient: PrepforgeHttpClient) {}

  setActiveWorkspace(
    input: SetActiveWorkspaceInput,
  ): Promise<AuthSessionContextResponse> {
    const validatedInput = setActiveWorkspaceInputSchema.parse(input);

    return this.httpClient.post(
      "/workspaces/active",
      validatedInput,
      authSessionContextResponseSchema,
    );
  }
}

