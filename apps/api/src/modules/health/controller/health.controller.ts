import { Router } from "express";

import { apiHealthResponseSchema } from "../schema/health.schema";
import { HealthService } from "../service/health.service";

export function createHealthRouter() {
  const router = Router();
  const service = new HealthService();

  router.get("/", (_request, response) => {
    response.json(apiHealthResponseSchema.parse(service.getSnapshot()));
  });

  return router;
}

