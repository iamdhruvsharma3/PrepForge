import { prisma } from "@prepforge/db";
import type {
  InterviewConfig,
  InterviewSessionDetail,
  InterviewHistoryItem,
  SessionBlueprint,
  StartInterviewSessionInput,
  SubmitInterviewAnswerInput,
} from "@prepforge/types";

export class InterviewsRepository {
  getConfig(): InterviewConfig {
    return {
      difficultyLevels: ["foundation", "intermediate", "advanced"],
      focusAreas: [
        "system design",
        "data structures",
        "behavioral storytelling",
        "performance optimization",
        "testing strategy",
      ],
      modes: ["text", "voice"],
    };
  }

  createInterviewRecord({
    blueprint,
    input,
    userId,
    workspaceId,
  }: {
    blueprint: SessionBlueprint;
    input: StartInterviewSessionInput;
    userId: string;
    workspaceId: string;
  }) {
    return prisma.interview.create({
      data: {
        company: input.company ?? null,
        difficulty: input.difficulty,
        firstQuestion: blueprint.firstQuestion,
        mode: input.mode,
        role: input.role,
        status: "initialized",
        userId,
        workspaceId,
      },
    });
  }

  findInterviewForTenant({
    interviewId,
    userId,
    workspaceId,
  }: {
    interviewId: string;
    userId: string;
    workspaceId: string;
  }) {
    return prisma.interview.findFirst({
      include: {
        answers: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        workspace: true,
      },
      where: {
        id: interviewId,
        userId,
        workspaceId,
      },
    });
  }

  async listRecentHistory({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<InterviewHistoryItem[]> {
    const interviews = await prisma.interview.findMany({
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      where: {
        userId,
        workspaceId,
      },
    });

    return interviews.map((interview) => ({
      company: interview.company ?? null,
      createdAt: interview.createdAt.toISOString(),
      difficulty: interview.difficulty as InterviewHistoryItem["difficulty"],
      firstQuestion: interview.firstQuestion,
      id: interview.id,
      mode: interview.mode,
      role: interview.role,
      status: interview.status,
      workspaceId: interview.workspaceId,
      workspaceName: interview.workspace.name,
    }));
  }

  createAnswer({
    feedback,
    input,
    interviewId,
    nextQuestion,
    orderIndex,
  }: {
    feedback: string;
    input: SubmitInterviewAnswerInput;
    interviewId: string;
    nextQuestion: string | null;
    orderIndex: number;
  }) {
    return prisma.interview.update({
      data: {
        answers: {
          create: {
            feedback,
            nextQuestion,
            orderIndex,
            prompt: input.prompt,
            response: input.response,
          },
        },
        status: "active",
      },
      include: {
        answers: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        workspace: true,
      },
      where: {
        id: interviewId,
      },
    });
  }

  completeInterview(interviewId: string) {
    return prisma.interview.update({
      data: {
        completedAt: new Date(),
        status: "completed",
      },
      include: {
        answers: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        workspace: true,
      },
      where: {
        id: interviewId,
      },
    });
  }

  mapInterviewDetail(interview: {
    answers: Array<{
      createdAt: Date;
      feedback: string;
      id: string;
      nextQuestion: string | null;
      orderIndex: number;
      prompt: string;
      response: string;
    }>;
    company: string | null;
    completedAt: Date | null;
    createdAt: Date;
    difficulty: string;
    firstQuestion: string;
    id: string;
    mode: "text" | "voice";
    role: string;
    status: "initialized" | "active" | "completed";
    workspace: {
      id: string;
      name: string;
    };
  }): InterviewSessionDetail {
    const lastAnswer = interview.answers.at(-1);
    const currentQuestion =
      interview.status === "completed"
        ? null
        : lastAnswer?.nextQuestion ?? interview.firstQuestion;

    return {
      answers: interview.answers.map((answer) => ({
        createdAt: answer.createdAt.toISOString(),
        feedback: answer.feedback,
        id: answer.id,
        nextQuestion: answer.nextQuestion,
        orderIndex: answer.orderIndex,
        prompt: answer.prompt,
        response: answer.response,
      })),
      canSubmitAnswer: interview.status !== "completed" && Boolean(currentQuestion),
      company: interview.company ?? null,
      completedAt: interview.completedAt?.toISOString() ?? null,
      createdAt: interview.createdAt.toISOString(),
      currentQuestion,
      difficulty: interview.difficulty as InterviewSessionDetail["difficulty"],
      firstQuestion: interview.firstQuestion,
      id: interview.id,
      mode: interview.mode,
      role: interview.role,
      status: interview.status,
      workspaceId: interview.workspace.id,
      workspaceName: interview.workspace.name,
    };
  }
}
