import { createCandidateProfileOrchestrator } from "@prepforge/ai";
import type {
  CandidateProfileResponse,
  IngestResumeInput,
  IngestResumeResponse,
} from "@prepforge/types";

import { ProfilesRepository } from "../repository/profiles.repository";

const candidateProfileOrchestrator = createCandidateProfileOrchestrator();

export class ProfilesService {
  constructor(private readonly repository = new ProfilesRepository()) {}

  async getProfile(tenantContext: {
    userId: string;
    workspaceId: string;
  }): Promise<CandidateProfileResponse> {
    const profile = await this.repository.findProfileForTenant(tenantContext);
    return {
      item: profile ? this.repository.mapProfile(profile) : null,
    };
  }

  async ingestResume(
    input: IngestResumeInput,
    tenantContext: {
      userId: string;
      workspaceId: string;
    },
  ): Promise<IngestResumeResponse> {
    const draft = candidateProfileOrchestrator.ingestResume(input);
    const profile = await this.repository.upsertResumeIngestion({
      draft,
      input,
      ...tenantContext,
    });

    return {
      item: profile,
    };
  }
}
