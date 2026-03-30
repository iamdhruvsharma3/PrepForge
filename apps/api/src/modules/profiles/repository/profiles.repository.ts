import { prisma } from "@prepforge/db";
import type { ResumeParseResult } from "@prepforge/ai";
import type {
  CandidateProfile,
  CandidateProfileContext,
  IngestResumeInput,
  ResumeDocumentSummary,
  UpsertCandidateProfileInput,
} from "@prepforge/types";

type ResumeDocumentRecord = {
  contentType: string | null;
  createdAt: Date;
  fileName: string;
  id: string;
  parseConfidence: number | null;
  parserName: string;
  parserVersion: string;
  parseStatus: "completed" | "needs_review" | "failed";
  parseWarnings: string[];
  sizeBytes: number | null;
  source: string;
  version: number;
  wordCount: number;
};

type CandidateProfileRecord = {
  activeResumeDocumentId: string | null;
  createdAt: Date;
  currentCompany: string | null;
  focusAreas: string[];
  headline: string | null;
  id: string;
  resumeDocuments: ResumeDocumentRecord[];
  resumeHighlights: string[];
  strengths: string[];
  summary: string | null;
  targetRole: string | null;
  updatedAt: Date;
  yearsExperience: number | null;
};

export class ProfilesRepository {
  private readonly resumeHistoryLimit = 8;

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
          take: this.resumeHistoryLimit,
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
    input,
    parseResult,
    userId,
    workspaceId,
  }: {
    input: IngestResumeInput;
    parseResult: ResumeParseResult;
    userId: string;
    workspaceId: string;
  }): Promise<CandidateProfile> {
    const profile = await prisma.$transaction(async (transaction) => {
      const existingProfile = await transaction.candidateProfile.findUnique({
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
      const nextVersion = this.getNextResumeVersion(existingProfile);
      const baseProfile = await transaction.candidateProfile.upsert({
        create: {
          ...parseResult.profile,
          userId,
          workspaceId,
        },
        update: {
          ...parseResult.profile,
        },
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });
      const resumeDocument = await transaction.resumeDocument.create({
        data: {
          candidateProfileId: baseProfile.id,
          contentType: input.contentType ?? null,
          fileName: input.fileName,
          parseConfidence: parseResult.metadata.confidence,
          parserName: parseResult.metadata.parserName,
          parserVersion: parseResult.metadata.parserVersion,
          parseStatus: parseResult.metadata.status,
          parseWarnings: parseResult.metadata.warnings,
          rawText: input.resumeText,
          sizeBytes: input.sizeBytes ?? null,
          source: input.source,
          version: nextVersion,
          wordCount: countWords(input.resumeText),
        },
      });

      return transaction.candidateProfile.update({
        data: {
          activeResumeDocumentId: resumeDocument.id,
        },
        include: {
          resumeDocuments: {
            orderBy: {
              createdAt: "desc",
            },
            take: this.resumeHistoryLimit,
          },
        },
        where: {
          id: baseProfile.id,
        },
      });
    });

    return this.mapProfile(profile);
  }

  async upsertProfileContext({
    input,
    userId,
    workspaceId,
  }: {
    input: UpsertCandidateProfileInput;
    userId: string;
    workspaceId: string;
  }): Promise<CandidateProfile> {
    const profile = await prisma.candidateProfile.upsert({
      create: {
        currentCompany: input.currentCompany,
        focusAreas: input.focusAreas,
        headline: input.headline,
        resumeHighlights: input.resumeHighlights,
        strengths: input.strengths,
        summary: input.summary,
        targetRole: input.targetRole,
        userId,
        workspaceId,
        yearsExperience: input.yearsExperience,
      },
      include: {
        resumeDocuments: {
          orderBy: {
            createdAt: "desc",
          },
          take: this.resumeHistoryLimit,
        },
      },
      update: {
        currentCompany: input.currentCompany,
        focusAreas: input.focusAreas,
        headline: input.headline,
        resumeHighlights: input.resumeHighlights,
        strengths: input.strengths,
        summary: input.summary,
        targetRole: input.targetRole,
        yearsExperience: input.yearsExperience,
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

  findResumeForTenant({
    resumeId,
    userId,
    workspaceId,
  }: {
    resumeId: string;
    userId: string;
    workspaceId: string;
  }) {
    return prisma.resumeDocument.findFirst({
      where: {
        candidateProfile: {
          userId,
          workspaceId,
        },
        id: resumeId,
      },
    });
  }

  async setActiveResume({
    parseResult,
    resumeId,
    userId,
    workspaceId,
  }: {
    parseResult: ResumeParseResult;
    resumeId: string;
    userId: string;
    workspaceId: string;
  }): Promise<CandidateProfile> {
    const profile = await prisma.$transaction(async (transaction) => {
      await transaction.resumeDocument.update({
        data: {
          parseConfidence: parseResult.metadata.confidence,
          parserName: parseResult.metadata.parserName,
          parserVersion: parseResult.metadata.parserVersion,
          parseStatus: parseResult.metadata.status,
          parseWarnings: parseResult.metadata.warnings,
        },
        where: {
          id: resumeId,
        },
      });

      return transaction.candidateProfile.update({
        data: {
          activeResumeDocumentId: resumeId,
          ...parseResult.profile,
        },
        include: {
          resumeDocuments: {
            orderBy: {
              createdAt: "desc",
            },
            take: this.resumeHistoryLimit,
          },
        },
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });
    });

    return this.mapProfile(profile);
  }

  mapProfile(profile: CandidateProfileRecord): CandidateProfile {
    const activeResumeId =
      profile.activeResumeDocumentId ?? profile.resumeDocuments[0]?.id ?? null;

    return {
      activeResumeId,
      ...this.mapProfileContext(profile),
      createdAt: profile.createdAt.toISOString(),
      id: profile.id,
      latestResume: mapLatestResume(profile.resumeDocuments[0], activeResumeId),
      resumeHistory: profile.resumeDocuments.map((resume) =>
        mapResumeDocumentSummary(resume, activeResumeId),
      ),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  private getNextResumeVersion(profile: CandidateProfileRecord | null): number {
    return (profile?.resumeDocuments[0]?.version ?? 0) + 1;
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
  resume: ResumeDocumentRecord | undefined,
  activeResumeId: string | null,
): ResumeDocumentSummary | null {
  if (!resume) {
    return null;
  }

  return mapResumeDocumentSummary(resume, activeResumeId);
}

function mapResumeDocumentSummary(
  resume: ResumeDocumentRecord,
  activeResumeId: string | null,
): ResumeDocumentSummary {
  return {
    contentType: resume.contentType,
    fileName: resume.fileName,
    id: resume.id,
    isActive: resume.id === activeResumeId,
    parseConfidence: resume.parseConfidence,
    parserName: resume.parserName,
    parserVersion: resume.parserVersion,
    parseStatus: resume.parseStatus,
    parseWarnings: resume.parseWarnings,
    sizeBytes: resume.sizeBytes,
    source: resume.source as ResumeDocumentSummary["source"],
    uploadedAt: resume.createdAt.toISOString(),
    version: resume.version,
    wordCount: resume.wordCount,
  };
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
