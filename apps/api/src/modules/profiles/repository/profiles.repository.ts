import { prisma } from "@prepforge/db";
import type {
  CandidateProfile,
  CandidateProfileContext,
  IngestResumeInput,
  ResumeDocumentSummary,
} from "@prepforge/types";

type CandidateProfileRecord = {
  createdAt: Date;
  currentCompany: string | null;
  focusAreas: string[];
  headline: string | null;
  id: string;
  resumeDocuments: Array<{
    contentType: string | null;
    createdAt: Date;
    fileName: string;
    id: string;
    source: string;
    wordCount: number;
  }>;
  resumeHighlights: string[];
  strengths: string[];
  summary: string | null;
  targetRole: string | null;
  updatedAt: Date;
  yearsExperience: number | null;
};

export class ProfilesRepository {
  findProfileForTenant({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    return prisma.candidateProfile.findUnique({
      include: {
        resumeDocuments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
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

  async getInterviewPersonalization({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<CandidateProfileContext | null> {
    const profile = await this.findProfileForTenant({ userId, workspaceId });
    return profile ? this.mapProfileContext(profile) : null;
  }

  async upsertResumeIngestion({
    draft,
    input,
    userId,
    workspaceId,
  }: {
    draft: CandidateProfileContext;
    input: IngestResumeInput;
    userId: string;
    workspaceId: string;
  }): Promise<CandidateProfile> {
    const profile = await prisma.candidateProfile.upsert({
      create: {
        currentCompany: draft.currentCompany,
        focusAreas: draft.focusAreas,
        headline: draft.headline,
        resumeDocuments: {
          create: {
            contentType: input.contentType ?? null,
            fileName: input.fileName,
            rawText: input.resumeText,
            source: input.source,
            wordCount: countWords(input.resumeText),
          },
        },
        resumeHighlights: draft.resumeHighlights,
        strengths: draft.strengths,
        summary: draft.summary,
        targetRole: draft.targetRole,
        userId,
        workspaceId,
        yearsExperience: draft.yearsExperience,
      },
      include: {
        resumeDocuments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      update: {
        currentCompany: draft.currentCompany,
        focusAreas: draft.focusAreas,
        headline: draft.headline,
        resumeDocuments: {
          create: {
            contentType: input.contentType ?? null,
            fileName: input.fileName,
            rawText: input.resumeText,
            source: input.source,
            wordCount: countWords(input.resumeText),
          },
        },
        resumeHighlights: draft.resumeHighlights,
        strengths: draft.strengths,
        summary: draft.summary,
        targetRole: draft.targetRole,
        yearsExperience: draft.yearsExperience,
      },
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return this.mapProfile(profile);
  }

  mapProfile(profile: CandidateProfileRecord): CandidateProfile {
    return {
      ...this.mapProfileContext(profile),
      createdAt: profile.createdAt.toISOString(),
      id: profile.id,
      latestResume: mapLatestResume(profile.resumeDocuments[0]),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  private mapProfileContext(
    profile: Pick<
      CandidateProfileRecord,
      | "currentCompany"
      | "focusAreas"
      | "headline"
      | "resumeHighlights"
      | "strengths"
      | "summary"
      | "targetRole"
      | "yearsExperience"
    >,
  ): CandidateProfileContext {
    return {
      currentCompany: profile.currentCompany,
      focusAreas: profile.focusAreas,
      headline: profile.headline,
      resumeHighlights: profile.resumeHighlights,
      strengths: profile.strengths,
      summary: profile.summary,
      targetRole: profile.targetRole,
      yearsExperience: profile.yearsExperience,
    };
  }
}

function mapLatestResume(
  resume:
    | {
        contentType: string | null;
        createdAt: Date;
        fileName: string;
        id: string;
        source: string;
        wordCount: number;
      }
    | undefined,
): ResumeDocumentSummary | null {
  if (!resume) {
    return null;
  }

  return {
    contentType: resume.contentType,
    fileName: resume.fileName,
    id: resume.id,
    source: resume.source as ResumeDocumentSummary["source"],
    uploadedAt: resume.createdAt.toISOString(),
    wordCount: resume.wordCount,
  };
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
