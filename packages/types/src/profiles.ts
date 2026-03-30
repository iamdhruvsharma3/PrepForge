import { z } from "zod";

export const resumeSourceValues = ["paste", "upload"] as const;
export const resumeSourceSchema = z.enum(resumeSourceValues);
export const resumeParseStatusValues = [
  "completed",
  "needs_review",
  "failed",
] as const;
export const resumeParseStatusSchema = z.enum(resumeParseStatusValues);

export const candidateProfileContextSchema = z.object({
  currentCompany: z.string().min(2).max(120).nullable(),
  focusAreas: z.array(z.string().min(2).max(80)).max(8),
  headline: z.string().min(2).max(160).nullable(),
  resumeHighlights: z.array(z.string().min(4).max(200)).max(6),
  strengths: z.array(z.string().min(2).max(80)).max(8),
  summary: z.string().min(16).max(1_200).nullable(),
  targetRole: z.string().min(2).max(160).nullable(),
  yearsExperience: z.number().int().min(0).max(60).nullable(),
});

export const resumeDocumentSummarySchema = z.object({
  contentType: z.string().min(2).max(120).nullable(),
  fileName: z.string().min(2).max(160),
  id: z.string().min(2),
  isActive: z.boolean(),
  parseConfidence: z.number().int().min(0).max(100).nullable(),
  parserName: z.string().min(2).max(80),
  parserVersion: z.string().min(1).max(40),
  parseStatus: resumeParseStatusSchema,
  parseWarnings: z.array(z.string().min(2).max(160)).max(6),
  sizeBytes: z.number().int().positive().nullable(),
  source: resumeSourceSchema,
  uploadedAt: z.string().datetime(),
  version: z.number().int().positive(),
  wordCount: z.number().int().nonnegative(),
});

export const candidateProfileSchema = candidateProfileContextSchema.extend({
  activeResumeId: z.string().min(2).nullable(),
  createdAt: z.string().datetime(),
  id: z.string().min(2),
  resumeHistory: z.array(resumeDocumentSummarySchema).max(12),
  latestResume: resumeDocumentSummarySchema.nullable(),
  updatedAt: z.string().datetime(),
});

export const candidateProfileResponseSchema = z.object({
  item: candidateProfileSchema.nullable(),
});

export const upsertCandidateProfileInputSchema = candidateProfileContextSchema;

export const upsertCandidateProfileResponseSchema = z.object({
  item: candidateProfileSchema,
});

export const setActiveResumeInputSchema = z.object({
  resumeId: z.string().min(2),
});

export const setActiveResumeResponseSchema = z.object({
  item: candidateProfileSchema,
});

export const ingestResumeInputSchema = z.object({
  contentType: z.string().min(2).max(120).optional(),
  fileName: z.string().min(2).max(160),
  resumeText: z.string().min(120).max(20_000),
  sizeBytes: z.number().int().positive().optional(),
  source: resumeSourceSchema.default("paste"),
});

export const ingestResumeResponseSchema = z.object({
  item: candidateProfileSchema,
});

export type CandidateProfile = z.infer<typeof candidateProfileSchema>;
export type CandidateProfileContext = z.infer<
  typeof candidateProfileContextSchema
>;
export type CandidateProfileResponse = z.infer<typeof candidateProfileResponseSchema>;
export type IngestResumeInput = z.infer<typeof ingestResumeInputSchema>;
export type IngestResumeResponse = z.infer<typeof ingestResumeResponseSchema>;
export type ResumeParseStatus = z.infer<typeof resumeParseStatusSchema>;
export type ResumeDocumentSummary = z.infer<typeof resumeDocumentSummarySchema>;
export type ResumeSource = z.infer<typeof resumeSourceSchema>;
export type SetActiveResumeInput = z.infer<typeof setActiveResumeInputSchema>;
export type SetActiveResumeResponse = z.infer<typeof setActiveResumeResponseSchema>;
export type UpsertCandidateProfileInput = z.infer<
  typeof upsertCandidateProfileInputSchema
>;
export type UpsertCandidateProfileResponse = z.infer<
  typeof upsertCandidateProfileResponseSchema
>;
