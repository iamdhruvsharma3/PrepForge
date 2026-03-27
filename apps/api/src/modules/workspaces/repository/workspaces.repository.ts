import { prisma } from "@prepforge/db";

export class WorkspacesRepository {
  findMembership(userId: string, workspaceId: string) {
    return prisma.workspaceMember.findUnique({
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
  }

  listMemberships(userId: string) {
    return prisma.workspaceMember.findMany({
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      where: {
        userId,
      },
    });
  }

  setActiveWorkspace(userId: string, workspaceId: string) {
    return prisma.user.update({
      data: {
        activeWorkspaceId: workspaceId,
      },
      where: {
        id: userId,
      },
    });
  }
}
