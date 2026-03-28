import type {
  CandidateProfileResponse,
  IngestResumeInput,
  IngestResumeResponse,
} from "@prepforge/types";
import {
  candidateProfileResponseSchema,
  ingestResumeInputSchema,
  ingestResumeResponseSchema,
} from "@prepforge/types";

import type { PrepforgeHttpClient } from "./http-client";

export class ProfilesClient {
  constructor(private readonly httpClient: PrepforgeHttpClient) {}

  getProfile(): Promise<CandidateProfileResponse> {
    return this.httpClient.get("/profiles/me", candidateProfileResponseSchema);
  }

  ingestResume(input: IngestResumeInput): Promise<IngestResumeResponse> {
    const validatedInput = ingestResumeInputSchema.parse(input);

    return this.httpClient.post(
      "/profiles/resume",
      validatedInput,
      ingestResumeResponseSchema,
    );
  }
}
