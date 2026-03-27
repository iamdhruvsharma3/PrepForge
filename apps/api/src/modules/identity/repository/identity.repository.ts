import {
  workspacePlanSchema,
  type AuthSessionContextResponse,
  type WorkspaceSummary,
} from "@prepforge/types";

import { WorkspacesRepository } from "../../workspaces/repository/workspaces.repository";

type SessionPayload = {
  session: {
    expiresAt: Date;
    id: string;
  };
  user: {
    activeWorkspaceId?: string | null | undefined;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: string | null | undefined;
    name: string;
  };
};

function mapWorkspaceSummary(
  workspace: {
    _count: {
      members: number;
    };
    id: string;
    name: string;
    plan: string;
    slug: string;
  },
): WorkspaceSummary {
  return {
    id: workspace.id,
    memberCount: workspace._count.members,
    name: workspace.name,
    plan: workspacePlanSchema.catch("free").parse(workspace.plan),
    slug: workspace.slug,
  };
}

export class IdentityRepository {
  constructor(private readonly workspacesRepository = new WorkspacesRepository()) {}

  async buildSessionContext(
    session: SessionPayload,
  ): Promise<AuthSessionContextResponse> {
    const memberships = await this.workspacesRepository.listMemberships(session.user.id);

    const normalizedMemberships = memberships.map((membership) => ({
      role: membership.role,
      workspace: mapWorkspaceSummary(membership.workspace),
    }));

    const fallbackWorkspace = normalizedMemberships[0]?.workspace ?? null;
    const activeWorkspace =
      normalizedMemberships.find(
        (membership) => membership.workspace.id === session.user.activeWorkspaceId,
      )?.workspace ?? fallbackWorkspace;

    if (!session.user.activeWorkspaceId && fallbackWorkspace) {
      await this.workspacesRepository.setActiveWorkspace(
        session.user.id,
        fallbackWorkspace.id,
      );
    }

    return {
      activeWorkspace,
      memberships: normalizedMemberships,
      session: {
        expiresAt: session.session.expiresAt.toISOString(),
        id: session.session.id,
      },
      user: {
        activeWorkspaceId: activeWorkspace?.id ?? null,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        id: session.user.id,
        image: session.user.image ?? null,
        name: session.user.name,
      },
    };
  }
}
