import { parseEnv } from "@prepforge/config";
import { z } from "zod";

export const adminEnv = parseEnv({
  context: "@prepforge/admin",
  runtimeEnv: import.meta.env,
  schema: z.object({
    VITE_API_BASE_URL: z.string().url().default("http://localhost:4000/api/v1"),
  }),
});

