import type { Request } from "express";
import type { AuthSessionContextResponse } from "@prepforge/types";

import { auth } from "../../../lib/auth";
import { HttpError } from "../../../lib/http-error";
import { createWebHeaders } from "../../../lib/request-headers";
import { IdentityRepository } from "../repository/identity.repository";
import type { WorkspacesRepository } from "../../workspaces/repository/workspaces.repository";

export class IdentityService {
  private readonly repository: IdentityRepository;

  constructor(workspacesRepository?: WorkspacesRepository) {
    this.repository = new IdentityRepository(workspacesRepository);
  }

  async getSessionContext(request: Request): Promise<AuthSessionContextResponse> {
    const session = await auth.api.getSession({
      headers: createWebHeaders(request),
    });

    if (!session) {
      throw new HttpError("Authentication is required.", 401);
    }

    return this.repository.buildSessionContext(session);
  }
}
