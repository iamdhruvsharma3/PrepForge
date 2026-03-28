import {
  createInterviewOrchestrator,
  createStubAiTextProvider,
} from "@prepforge/ai";
import type {
  InterviewConfig,
  InterviewSessionDetailResponse,
  InterviewHistoryResponse,
  StartInterviewSessionInput,
  StartInterviewSessionResponse,
  SubmitInterviewAnswerInput,
} from "@prepforge/types";

import { HttpError } from "../../../lib/http-error";
import { InterviewsRepository } from "../repository/interviews.repository";

const orchestrator = createInterviewOrchestrator(
  createStubAiTextProvider("prepforge-foundation"),
);

export class InterviewsService {
  constructor(private readonly repository = new InterviewsRepository()) {}

  getConfig(): InterviewConfig {
    return this.repository.getConfig();
  }

  async startSession(
    input: StartInterviewSessionInput,
    tenantContext: {
      userId: string;
      workspaceId: string;
    },
  ): Promise<StartInterviewSessionResponse> {
    const blueprint = await orchestrator.buildSessionBlueprint(input);
    const interview = await this.repository.createInterviewRecord({
      blueprint,
      input,
      userId: tenantContext.userId,
      workspaceId: tenantContext.workspaceId,
    });

    return {
      blueprint,
      sessionId: interview.id,
      status: interview.status,
    };
  }

  async getHistory(tenantContext: {
    userId: string;
    workspaceId: string;
  }): Promise<InterviewHistoryResponse> {
    const items = await this.repository.listRecentHistory(tenantContext);
    return { items };
  }

  async getSessionDetail(
    interviewId: string,
    tenantContext: {
      userId: string;
      workspaceId: string;
    },
  ): Promise<InterviewSessionDetailResponse> {
    const interview = await this.repository.findInterviewForTenant({
      interviewId,
      ...tenantContext,
    });

    if (!interview) {
      throw new HttpError("Interview session not found.", 404);
    }

    return {
      item: this.repository.mapInterviewDetail(interview),
    };
  }

  async submitAnswer(
    interviewId: string,
    input: SubmitInterviewAnswerInput,
    tenantContext: {
      userId: string;
      workspaceId: string;
    },
  ): Promise<InterviewSessionDetailResponse> {
    const interview = await this.repository.findInterviewForTenant({
      interviewId,
      ...tenantContext,
    });

    if (!interview) {
      throw new HttpError("Interview session not found.", 404);
    }

    if (interview.status === "completed") {
      throw new HttpError("This interview session is already completed.", 409);
    }

    const review = await orchestrator.buildAnswerReview({
      answerCount: interview.answers.length,
      difficulty: interview.difficulty as StartInterviewSessionInput["difficulty"],
      prompt: input.prompt,
      response: input.response,
      role: interview.role,
    });

    const updatedInterview = await this.repository.createAnswer({
      feedback: review.feedback,
      input,
      interviewId,
      nextQuestion: review.nextQuestion,
      orderIndex: interview.answers.length,
    });

    return {
      item: this.repository.mapInterviewDetail(updatedInterview),
    };
  }

  async completeSession(
    interviewId: string,
    tenantContext: {
      userId: string;
      workspaceId: string;
    },
  ): Promise<InterviewSessionDetailResponse> {
    const interview = await this.repository.findInterviewForTenant({
      interviewId,
      ...tenantContext,
    });

    if (!interview) {
      throw new HttpError("Interview session not found.", 404);
    }

    if (interview.status === "completed") {
      return {
        item: this.repository.mapInterviewDetail(interview),
      };
    }

    const updatedInterview = await this.repository.completeInterview(interviewId);

    return {
      item: this.repository.mapInterviewDetail(updatedInterview),
    };
  }
}
