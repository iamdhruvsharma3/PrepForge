import type {
  InterviewConfig,
  StartInterviewSessionInput,
  StartInterviewSessionResponse,
} from "@prepforge/types";
import {
  interviewConfigSchema,
  startInterviewSessionInputSchema,
  startInterviewSessionResponseSchema,
} from "@prepforge/types";

import type { PrepforgeHttpClient } from "./http-client";

export class InterviewsClient {
  constructor(private readonly httpClient: PrepforgeHttpClient) {}

  getConfig(): Promise<InterviewConfig> {
    return this.httpClient.get("/interviews/config", interviewConfigSchema);
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
}

