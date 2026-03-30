import type {
  CandidateProfileResponse,
  IngestResumeInput,
  IngestResumeResponse,
  SetActiveResumeInput,
  SetActiveResumeResponse,
  UpsertCandidateProfileInput,
  UpsertCandidateProfileResponse,
} from "@prepforge/types";
import {
  candidateProfileResponseSchema,
  ingestResumeInputSchema,
  ingestResumeResponseSchema,
  setActiveResumeInputSchema,
  setActiveResumeResponseSchema,
  upsertCandidateProfileInputSchema,
  upsertCandidateProfileResponseSchema,
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

  saveProfile(
    input: UpsertCandidateProfileInput,
  ): Promise<UpsertCandidateProfileResponse> {
    const validatedInput = upsertCandidateProfileInputSchema.parse(input);

    return this.httpClient.post(
      "/profiles/me",
      validatedInput,
      upsertCandidateProfileResponseSchema,
    );
  }

  setActiveResume(
    input: SetActiveResumeInput,
  ): Promise<SetActiveResumeResponse> {
    const validatedInput = setActiveResumeInputSchema.parse(input);

    return this.httpClient.post(
      "/profiles/active-resume",
      validatedInput,
      setActiveResumeResponseSchema,
    );
  }
}
