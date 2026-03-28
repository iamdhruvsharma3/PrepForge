import { z } from "zod";

export const resumeSourceValues = ["paste"] as const;
export const resumeSourceSchema = z.enum(resumeSourceValues);

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
  source: resumeSourceSchema,
  uploadedAt: z.string().datetime(),
  wordCount: z.number().int().nonnegative(),
});

export const candidateProfileSchema = candidateProfileContextSchema.extend({
  createdAt: z.string().datetime(),
  id: z.string().min(2),
  latestResume: resumeDocumentSummarySchema.nullable(),
  updatedAt: z.string().datetime(),
});

export const candidateProfileResponseSchema = z.object({
  item: candidateProfileSchema.nullable(),
});

export const ingestResumeInputSchema = z.object({
  contentType: z.string().min(2).max(120).optional(),
  fileName: z.string().min(2).max(160),
  resumeText: z.string().min(120).max(20_000),
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
export type ResumeDocumentSummary = z.infer<typeof resumeDocumentSummarySchema>;
export type ResumeSource = z.infer<typeof resumeSourceSchema>;
