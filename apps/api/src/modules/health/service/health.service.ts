import type { ApiHealthResponse } from "@prepforge/types";

import { HealthRepository } from "../repository/health.repository";

export class HealthService {
  constructor(private readonly repository = new HealthRepository()) {}

  getSnapshot(): ApiHealthResponse {
    const startedAt = this.repository.getStartedAt();

    return {
      service: "prepforge-api",
      status: "ready",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - startedAt.getTime()) / 1000),
    };
  }
}

