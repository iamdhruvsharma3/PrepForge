import { Router } from "express";

import { authSessionContextResponseSchema } from "../schema/identity.schema";
import { IdentityService } from "../service/identity.service";

export function createIdentityRouter() {
  const router = Router();
  const service = new IdentityService();

  router.get("/session-context", async (request, response, next) => {
    try {
      const payload = await service.getSessionContext(request);
      response.json(authSessionContextResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

