import { parseEnv } from "@prepforge/config";
import { z } from "zod";

export const mobileEnv = parseEnv({
  context: "@prepforge/mobile",
  runtimeEnv: process.env,
  schema: z.object({
    EXPO_PUBLIC_API_BASE_URL: z
      .string()
      .url()
      .default("http://localhost:4000/api/v1"),
  }),
});

