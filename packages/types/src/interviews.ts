import { z } from "zod";

export const interviewDifficultyValues = [
  "foundation",
  "intermediate",
  "advanced",
] as const;

export const interviewModeValues = ["text", "voice"] as const;

export const interviewDifficultySchema = z.enum(interviewDifficultyValues);
export const interviewModeSchema = z.enum(interviewModeValues);

export const interviewConfigSchema = z.object({
  difficultyLevels: z.array(interviewDifficultySchema),
  focusAreas: z.array(z.string().min(2)),
  modes: z.array(interviewModeSchema),
});

export const startInterviewSessionInputSchema = z.object({
  company: z.string().min(2).max(120).optional(),
  difficulty: interviewDifficultySchema,
  focusAreas: z.array(z.string().min(2)).max(5).default([]),
  mode: interviewModeSchema,
  role: z.string().min(2).max(120),
});

export const sessionBlueprintSchema = z.object({
  evaluationAxes: z.array(z.string().min(2)).min(1),
  firstQuestion: z.string().min(8),
  suggestedDurationMinutes: z.number().int().positive(),
  systemPromptPreview: z.string().min(16),
});

export const startInterviewSessionResponseSchema = z.object({
  blueprint: sessionBlueprintSchema,
  sessionId: z.string().uuid(),
  status: z.literal("initialized"),
});

export type InterviewConfig = z.infer<typeof interviewConfigSchema>;
export type InterviewDifficulty = z.infer<typeof interviewDifficultySchema>;
export type InterviewMode = z.infer<typeof interviewModeSchema>;
export type SessionBlueprint = z.infer<typeof sessionBlueprintSchema>;
export type StartInterviewSessionInput = z.infer<
  typeof startInterviewSessionInputSchema
>;
export type StartInterviewSessionResponse = z.infer<
  typeof startInterviewSessionResponseSchema
>;
