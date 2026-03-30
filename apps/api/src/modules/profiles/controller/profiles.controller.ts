import { Router } from "express";

import {
  getTenantContext,
  requireTenantContext,
} from "../../../middleware/tenant-context.middleware";
import {
  candidateProfileResponseSchema,
  ingestResumeInputSchema,
  ingestResumeResponseSchema,
  setActiveResumeInputSchema,
  setActiveResumeResponseSchema,
  upsertCandidateProfileInputSchema,
  upsertCandidateProfileResponseSchema,
} from "../schema/profiles.schema";
import { ProfilesService } from "../service/profiles.service";

export function createProfilesRouter() {
  const router = Router();
  const service = new ProfilesService();

  router.get("/me", requireTenantContext, async (_request, response, next) => {
    try {
      const payload = await service.getProfile(getTenantContext(response));
      response.json(candidateProfileResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  router.post("/me", requireTenantContext, async (request, response, next) => {
    try {
      const input = upsertCandidateProfileInputSchema.parse(request.body);
      const payload = await service.upsertProfile(input, getTenantContext(response));
      response.json(upsertCandidateProfileResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  router.post("/resume", requireTenantContext, async (request, response, next) => {
    try {
      const input = ingestResumeInputSchema.parse(request.body);
      const payload = await service.ingestResume(input, getTenantContext(response));
      response.status(201).json(ingestResumeResponseSchema.parse(payload));
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/active-resume",
    requireTenantContext,
    async (request, response, next) => {
      try {
        const input = setActiveResumeInputSchema.parse(request.body);
        const payload = await service.setActiveResume(
          input,
          getTenantContext(response),
        );
        response.json(setActiveResumeResponseSchema.parse(payload));
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
