import { Router } from "express";

import {
  getTenantContext,
  requireTenantContext,
} from "../../../middleware/tenant-context.middleware";
import {
  completeInterviewSessionResponseSchema,
  interviewConfigSchema,
  interviewHistoryResponseSchema,
  interviewSessionDetailResponseSchema,
  startInterviewSessionInputSchema,
  startInterviewSessionResponseSchema,
  submitInterviewAnswerInputSchema,
  submitInterviewAnswerResponseSchema,
} from "../schema/interviews.schema";
import { InterviewsService } from "../service/interviews.service";

function requireInterviewId(value: string | undefined): string {
  if (!value) {
    throw new Error("Interview ID is required.");
  }

  return value;
}

export function createInterviewsRouter() {
  const router = Router();
  const service = new InterviewsService();

  router.get("/config", (_request, response) => {
    response.json(interviewConfigSchema.parse(service.getConfig()));
  });

  router.get("/history", requireTenantContext, async (_request, response, next) => {
    try {
      const payload = await service.getHistory(getTenantContext(response));
      response.json(interviewHistoryResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:interviewId", requireTenantContext, async (request, response, next) => {
    try {
      const payload = await service.getSessionDetail(
        requireInterviewId(request.params.interviewId),
        getTenantContext(response),
      );

      response.json(interviewSessionDetailResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  router.post("/sessions", requireTenantContext, async (request, response, next) => {
    try {
      const input = startInterviewSessionInputSchema.parse(request.body);
      const payload = await service.startSession(input, getTenantContext(response));

      response.status(201).json(startInterviewSessionResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/:interviewId/answers",
    requireTenantContext,
    async (request, response, next) => {
      try {
        const input = submitInterviewAnswerInputSchema.parse(request.body);
        const payload = await service.submitAnswer(
          requireInterviewId(request.params.interviewId),
          input,
          getTenantContext(response),
        );

        response
          .status(201)
          .json(submitInterviewAnswerResponseSchema.parse(payload));
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/:interviewId/complete",
    requireTenantContext,
    async (request, response, next) => {
      try {
        const payload = await service.completeSession(
          requireInterviewId(request.params.interviewId),
          getTenantContext(response),
        );

        response.json(completeInterviewSessionResponseSchema.parse(payload));
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
