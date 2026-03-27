import { z } from "zod";

import { workspaceRoleSchema, workspaceSummarySchema } from "./workspaces";

export const authSessionSummarySchema = z.object({
  expiresAt: z.string().datetime(),
  id: z.string().min(2),
});

export const authUserSummarySchema = z.object({
  activeWorkspaceId: z.string().min(2).nullable(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  id: z.string().min(2),
  image: z.string().url().nullable().optional(),
  name: z.string().min(1).max(120),
});

export const workspaceMembershipSchema = z.object({
  role: workspaceRoleSchema,
  workspace: workspaceSummarySchema,
});

export const authSessionContextResponseSchema = z.object({
  activeWorkspace: workspaceSummarySchema.nullable(),
  memberships: z.array(workspaceMembershipSchema),
  session: authSessionSummarySchema,
  user: authUserSummarySchema,
});

export const setActiveWorkspaceInputSchema = z.object({
  workspaceId: z.string().min(2).max(64),
});

export type AuthSessionContextResponse = z.infer<
  typeof authSessionContextResponseSchema
>;
export type AuthSessionSummary = z.infer<typeof authSessionSummarySchema>;
export type AuthUserSummary = z.infer<typeof authUserSummarySchema>;
export type SetActiveWorkspaceInput = z.infer<
  typeof setActiveWorkspaceInputSchema
>;
export type WorkspaceMembership = z.infer<typeof workspaceMembershipSchema>;

