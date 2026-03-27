import { z } from "zod";

export const workspacePlanValues = ["free", "pro", "team"] as const;
export const workspaceRoleValues = ["owner", "admin", "member"] as const;
export const workspacePlanSchema = z.enum(workspacePlanValues);
export const workspaceRoleSchema = z.enum(workspaceRoleValues);

export const workspaceSummarySchema = z.object({
  id: z.string().min(2).max(64),
  memberCount: z.number().int().nonnegative(),
  name: z.string().min(2).max(120),
  plan: workspacePlanSchema,
  slug: z.string().min(2).max(140),
});

export type WorkspacePlan = z.infer<typeof workspacePlanSchema>;
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;
