import { parseEnv } from "@prepforge/config";
import { z } from "zod";

export const webEnv = parseEnv({
  context: "@prepforge/web",
  runtimeEnv: process.env,
  schema: z.object({
    NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000/api/v1"),
    NEXT_PUBLIC_AUTH_BASE_URL: z
      .string()
      .url()
      .default("http://localhost:4000/api/v1/auth"),
  }),
});

