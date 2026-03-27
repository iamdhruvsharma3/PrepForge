import { z } from "zod";

export const environmentSchema = z.enum(["development", "test", "production"]);
export const healthStatusSchema = z.enum(["ready", "degraded"]);
export const workspaceIdSchema = z.string().min(2).max(64);

export const apiHealthResponseSchema = z.object({
  service: z.literal("prepforge-api"),
  status: healthStatusSchema,
  timestamp: z.string().datetime(),
  uptimeSeconds: z.number().nonnegative(),
});

export type ApiHealthResponse = z.infer<typeof apiHealthResponseSchema>;
export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type WorkspaceId = z.infer<typeof workspaceIdSchema>;

