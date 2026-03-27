import { Router } from "express";

import { requireTenantContext } from "../../../middleware/tenant-context.middleware";
import {
  interviewConfigSchema,
  startInterviewSessionInputSchema,
  startInterviewSessionResponseSchema,
} from "../schema/interviews.schema";
import { InterviewsService } from "../service/interviews.service";

export function createInterviewsRouter() {
  const router = Router();
  const service = new InterviewsService();

  router.get("/config", (_request, response) => {
    response.json(interviewConfigSchema.parse(service.getConfig()));
  });

  router.post("/sessions", requireTenantContext, async (request, response, next) => {
    try {
      const input = startInterviewSessionInputSchema.parse(request.body);
      const payload = await service.startSession(input);

      response.status(201).json(startInterviewSessionResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
