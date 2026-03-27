import type { Request, Response } from "express";

import { auth } from "../lib/auth";
import { HttpError } from "../lib/http-error";
import { createWebHeaders } from "../lib/request-headers";
import { WorkspacesRepository } from "../modules/workspaces/repository/workspaces.repository";

export type TenantContext = {
  role: "owner" | "admin" | "member";
  userId: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
};

const repository = new WorkspacesRepository();

export async function requireTenantContext(
  request: Request,
  response: Response,
  next: (error?: unknown) => void,
) {
  try {
    const session = await auth.api.getSession({
      headers: createWebHeaders(request),
    });

    if (!session) {
      throw new HttpError("Authentication is required.", 401);
    }

    const workspaceId =
      request.header("x-workspace-id") ?? session.user.activeWorkspaceId ?? null;

    if (!workspaceId) {
      throw new HttpError("No active workspace was selected.", 400);
    }

    const membership = await repository.findMembership(session.user.id, workspaceId);

    if (!membership) {
      throw new HttpError("You do not have access to this workspace.", 403);
    }

    response.locals.tenantContext = {
      role: membership.role,
      userId: session.user.id,
      workspaceId: membership.workspace.id,
      workspaceName: membership.workspace.name,
      workspaceSlug: membership.workspace.slug,
    } satisfies TenantContext;

    next();
  } catch (error) {
    next(error);
  }
}

export function getTenantContext(response: Response): TenantContext {
  const tenantContext = response.locals.tenantContext as TenantContext | undefined;

  if (!tenantContext) {
    throw new HttpError("Tenant context has not been resolved.", 500);
  }

  return tenantContext;
}

