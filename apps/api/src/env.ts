import { existsSync } from "node:fs";
import { resolve } from "node:path";

import dotenv from "dotenv";
import { parseEnv } from "@prepforge/config";
import { environmentSchema } from "@prepforge/types";
import { z } from "zod";

const envCandidates = [
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "apps/api/.env.local"),
  resolve(process.cwd(), ".env.local.example"),
  resolve(process.cwd(), "apps/api/.env.local.example"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenv.config({ override: false, path: envPath });
  }
}

const optionalSecretSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

export const apiEnvSchema = z.object({
  API_BASE_PATH: z.string().default("/api/v1"),
  APP_ORIGIN: z.string().url().default("http://localhost:4000"),
  BETTER_AUTH_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: optionalSecretSchema,
  GOOGLE_CLIENT_SECRET: optionalSecretSchema,
  NODE_ENV: environmentSchema.default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
});

export const apiEnv = parseEnv({
  context: "@prepforge/api",
  runtimeEnv: process.env,
  schema: apiEnvSchema,
});

export const corsOrigins = apiEnv.CORS_ORIGIN.split(",").map((origin) =>
  origin.trim(),
);

export const googleAuthEnabled =
  Boolean(apiEnv.GOOGLE_CLIENT_ID) && Boolean(apiEnv.GOOGLE_CLIENT_SECRET);
