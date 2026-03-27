import type { Request } from "express";
import type { AuthSessionContextResponse, SetActiveWorkspaceInput } from "@prepforge/types";

import { HttpError } from "../../../lib/http-error";
import { createWebHeaders } from "../../../lib/request-headers";
import { auth } from "../../../lib/auth";
import { IdentityService } from "../../identity/service/identity.service";
import { WorkspacesRepository } from "../repository/workspaces.repository";

export class WorkspacesService {
  constructor(
    private readonly repository = new WorkspacesRepository(),
    private readonly identityService = new IdentityService(repository),
  ) {}

  async setActiveWorkspace(
    request: Request,
    input: SetActiveWorkspaceInput,
  ): Promise<AuthSessionContextResponse> {
    const session = await auth.api.getSession({
      headers: createWebHeaders(request),
    });

    if (!session) {
      throw new HttpError("Authentication is required.", 401);
    }

    const membership = await this.repository.findMembership(
      session.user.id,
      input.workspaceId,
    );

    if (!membership) {
      throw new HttpError("You do not have access to this workspace.", 403);
    }

    await this.repository.setActiveWorkspace(session.user.id, input.workspaceId);

    return this.identityService.getSessionContext(request);
  }
}
