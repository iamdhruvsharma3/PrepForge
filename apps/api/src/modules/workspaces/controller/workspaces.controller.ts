import { Router } from "express";

import {
  authSessionContextResponseSchema,
  setActiveWorkspaceInputSchema,
} from "../schema/workspaces.schema";
import { WorkspacesService } from "../service/workspaces.service";

export function createWorkspacesRouter() {
  const router = Router();
  const service = new WorkspacesService();

  router.post("/active", async (request, response, next) => {
    try {
      const input = setActiveWorkspaceInputSchema.parse(request.body);
      const payload = await service.setActiveWorkspace(request, input);

      response.json(authSessionContextResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

