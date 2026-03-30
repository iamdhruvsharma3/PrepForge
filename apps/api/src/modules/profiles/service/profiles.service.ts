import { createCandidateProfileOrchestrator } from "@prepforge/ai";
import type {
  CandidateProfileResponse,
  IngestResumeInput,
  IngestResumeResponse,
  SetActiveResumeInput,
  SetActiveResumeResponse,
  UpsertCandidateProfileInput,
  UpsertCandidateProfileResponse,
} from "@prepforge/types";
import { HttpError } from "../../../lib/http-error";

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
    const parseResult = candidateProfileOrchestrator.parseResume(input);
    const profile = await this.repository.upsertResumeIngestion({
      input,
      parseResult,
      ...tenantContext,
    });

    return {
      item: profile,
    };
  }

  async setActiveResume(
    input: SetActiveResumeInput,
    tenantContext: {
      userId: string;
      workspaceId: string;
    },
  ): Promise<SetActiveResumeResponse> {
    const resume = await this.repository.findResumeForTenant({
      resumeId: input.resumeId,
      ...tenantContext,
    });

    if (!resume) {
      throw new HttpError("Resume version not found.", 404);
    }

    const parseResult = candidateProfileOrchestrator.parseResume({
      contentType: resume.contentType ?? undefined,
      fileName: resume.fileName,
      resumeText: resume.rawText,
      ...(resume.sizeBytes ? { sizeBytes: resume.sizeBytes } : {}),
      source: resume.source as IngestResumeInput["source"],
    });
    const profile = await this.repository.setActiveResume({
      parseResult,
      resumeId: resume.id,
      ...tenantContext,
    });

    return {
      item: profile,
    };
  }

  async upsertProfile(
    input: UpsertCandidateProfileInput,
    tenantContext: {
      userId: string;
      workspaceId: string;
    },
  ): Promise<UpsertCandidateProfileResponse> {
    const profile = await this.repository.upsertProfileContext({
      input,
      ...tenantContext,
    });

    return {
      item: profile,
    };
  }
}
