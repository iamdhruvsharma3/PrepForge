import type {
  InterviewConfig,
  InterviewSessionDetailResponse,
  InterviewHistoryResponse,
  StartInterviewSessionInput,
  StartInterviewSessionResponse,
  SubmitInterviewAnswerInput,
} from "@prepforge/types";
import {
  interviewConfigSchema,
  interviewHistoryResponseSchema,
  interviewSessionDetailResponseSchema,
  startInterviewSessionInputSchema,
  startInterviewSessionResponseSchema,
  submitInterviewAnswerInputSchema,
} from "@prepforge/types";

import type { PrepforgeHttpClient } from "./http-client";

export class InterviewsClient {
  constructor(private readonly httpClient: PrepforgeHttpClient) {}

  getConfig(): Promise<InterviewConfig> {
    return this.httpClient.get("/interviews/config", interviewConfigSchema);
  }

  getHistory(): Promise<InterviewHistoryResponse> {
    return this.httpClient.get("/interviews/history", interviewHistoryResponseSchema);
  }

  getSessionDetail(interviewId: string): Promise<InterviewSessionDetailResponse> {
    return this.httpClient.get(
      `/interviews/${interviewId}`,
      interviewSessionDetailResponseSchema,
    );
  }

  startSession(
    input: StartInterviewSessionInput,
  ): Promise<StartInterviewSessionResponse> {
    const validatedInput = startInterviewSessionInputSchema.parse(input);

    return this.httpClient.post(
      "/interviews/sessions",
      validatedInput,
      startInterviewSessionResponseSchema,
    );
  }

  submitAnswer(
    interviewId: string,
    input: SubmitInterviewAnswerInput,
  ): Promise<InterviewSessionDetailResponse> {
    const validatedInput = submitInterviewAnswerInputSchema.parse(input);

    return this.httpClient.post(
      `/interviews/${interviewId}/answers`,
      validatedInput,
      interviewSessionDetailResponseSchema,
    );
  }

  completeSession(interviewId: string): Promise<InterviewSessionDetailResponse> {
    return this.httpClient.post(
      `/interviews/${interviewId}/complete`,
      undefined,
      interviewSessionDetailResponseSchema,
    );
  }
}
