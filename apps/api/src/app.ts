import cors from "cors";
import express from "express";
import { toNodeHandler } from "@prepforge/auth/node";
import { ZodError } from "zod";

import { corsOrigins, apiEnv } from "./env";
import { auth } from "./lib/auth";
import { createHealthRouter } from "./modules/health/controller/health.controller";
import { createIdentityRouter } from "./modules/identity/controller/identity.controller";
import { createInterviewsRouter } from "./modules/interviews/controller/interviews.controller";
import { createWorkspacesRouter } from "./modules/workspaces/controller/workspaces.controller";
import { HttpError } from "./lib/http-error";

export function createApp() {
  const app = express();
  const authHandler = toNodeHandler(auth);

  app.use(
    cors({
      credentials: true,
      origin: corsOrigins,
    }),
  );
  app.all(`${apiEnv.API_BASE_PATH}/auth`, authHandler);
  app.all(`${apiEnv.API_BASE_PATH}/auth/*`, authHandler);
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      name: "PrepForge API",
      status: "booting",
      version: "0.1.0",
    });
  });

  app.use(`${apiEnv.API_BASE_PATH}/health`, createHealthRouter());
  app.use(`${apiEnv.API_BASE_PATH}/identity`, createIdentityRouter());
  app.use(`${apiEnv.API_BASE_PATH}/interviews`, createInterviewsRouter());
  app.use(`${apiEnv.API_BASE_PATH}/workspaces`, createWorkspacesRouter());

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof HttpError) {
        response.status(error.statusCode).json({
          error: error.name,
          message: error.message,
        });
        return;
      }

      if (error instanceof ZodError) {
        response.status(400).json({
          error: "ValidationError",
          issues: error.flatten(),
        });
        return;
      }

      response.status(500).json({
        error: "InternalServerError",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    },
  );

  return app;
}
