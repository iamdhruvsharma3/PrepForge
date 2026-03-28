import { prisma } from "@prepforge/db";
import type {
  InterviewConfig,
  InterviewDashboardResponse,
  InterviewAxisScore,
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
        answers: true,
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
      overallScore: calculateOverallScore(interview.answers),
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
    scores,
  }: {
    feedback: string;
    input: SubmitInterviewAnswerInput;
    interviewId: string;
    nextQuestion: string | null;
    orderIndex: number;
    scores: InterviewAxisScore;
  }) {
    return prisma.interview.update({
      data: {
        answers: {
          create: {
            communicationScore: scores.communication,
            correctnessScore: scores.correctness,
            depthScore: scores.depth,
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
      communicationScore: number;
      correctnessScore: number;
      createdAt: Date;
      depthScore: number;
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
        : interview.answers.length === 0
          ? interview.firstQuestion
          : lastAnswer?.nextQuestion ?? null;

    return {
      answers: interview.answers.map((answer) => ({
        createdAt: answer.createdAt.toISOString(),
        feedback: answer.feedback,
        id: answer.id,
        nextQuestion: answer.nextQuestion,
        orderIndex: answer.orderIndex,
        prompt: answer.prompt,
        response: answer.response,
        scores: mapAnswerScores(answer),
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
      overallScore: calculateOverallScore(interview.answers),
      role: interview.role,
      scoreSummary: calculateAverageScores(interview.answers),
      status: interview.status,
      workspaceId: interview.workspace.id,
      workspaceName: interview.workspace.name,
    };
  }

  async getDashboard(tenantContext: {
    userId: string;
    workspaceId: string;
  }): Promise<InterviewDashboardResponse> {
    const interviews = await prisma.interview.findMany({
      include: {
        answers: {
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      where: {
        userId: tenantContext.userId,
        workspaceId: tenantContext.workspaceId,
      },
    });

    const allAnswers = interviews.flatMap((interview) => interview.answers);
    const completedInterviews = interviews.filter(
      (interview) => interview.status === "completed",
    );

    return {
      scoreAverages: calculateAverageScores(allAnswers),
      summary: {
        activeSessions: interviews.filter((interview) => interview.status === "active")
          .length,
        averageOverallScore: averageNumbers(
          completedInterviews
            .map((interview) => calculateOverallScore(interview.answers))
            .filter((value): value is number => value !== null),
        ),
        completedSessions: completedInterviews.length,
        latestCompletedScore:
          calculateOverallScore(completedInterviews[0]?.answers ?? []) ?? null,
        totalSessions: interviews.length,
      },
      trend: interviews.map((interview) => ({
        createdAt: interview.createdAt.toISOString(),
        interviewId: interview.id,
        overallScore: calculateOverallScore(interview.answers),
        role: interview.role,
        status: interview.status,
      })),
    };
  }
}

type ScoredAnswerRecord = {
  communicationScore: number;
  correctnessScore: number;
  depthScore: number;
};

function mapAnswerScores(answer: ScoredAnswerRecord): InterviewAxisScore {
  return {
    communication: answer.communicationScore,
    correctness: answer.correctnessScore,
    depth: answer.depthScore,
    overall: clampScore(
      Math.round(
        (answer.communicationScore + answer.correctnessScore + answer.depthScore) / 3,
      ),
    ),
  };
}

function calculateAverageScores(
  answers: ScoredAnswerRecord[],
): InterviewAxisScore | null {
  if (answers.length === 0) {
    return null;
  }

  const communication = averageNumbers(
    answers.map((answer) => answer.communicationScore),
  );
  const correctness = averageNumbers(answers.map((answer) => answer.correctnessScore));
  const depth = averageNumbers(answers.map((answer) => answer.depthScore));

  if (
    communication === null ||
    correctness === null ||
    depth === null
  ) {
    return null;
  }

  return {
    communication,
    correctness,
    depth,
    overall: averageNumbers([communication, correctness, depth]) ?? 0,
  };
}

function calculateOverallScore(answers: ScoredAnswerRecord[]): number | null {
  return calculateAverageScores(answers)?.overall ?? null;
}

function averageNumbers(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return clampScore(Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, value));
}
