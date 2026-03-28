import { z } from "zod";

export const interviewDifficultyValues = [
  "foundation",
  "intermediate",
  "advanced",
] as const;

export const interviewModeValues = ["text", "voice"] as const;
export const interviewStatusValues = [
  "initialized",
  "active",
  "completed",
] as const;

export const interviewDifficultySchema = z.enum(interviewDifficultyValues);
export const interviewModeSchema = z.enum(interviewModeValues);
export const interviewStatusSchema = z.enum(interviewStatusValues);

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
  sessionId: z.string().min(2),
  status: interviewStatusSchema,
});

export const interviewAnswerItemSchema = z.object({
  createdAt: z.string().datetime(),
  feedback: z.string().min(8),
  id: z.string().min(2),
  nextQuestion: z.string().min(8).nullable(),
  orderIndex: z.number().int().nonnegative(),
  prompt: z.string().min(8),
  response: z.string().min(4),
});

export const interviewHistoryItemSchema = z.object({
  company: z.string().nullable(),
  createdAt: z.string().datetime(),
  difficulty: interviewDifficultySchema,
  firstQuestion: z.string().min(8),
  id: z.string().min(2),
  mode: interviewModeSchema,
  role: z.string().min(2).max(120),
  status: interviewStatusSchema,
  workspaceId: z.string().min(2),
  workspaceName: z.string().min(2).max(120),
});

export const interviewHistoryResponseSchema = z.object({
  items: z.array(interviewHistoryItemSchema),
});

export const interviewSessionDetailSchema = z.object({
  answers: z.array(interviewAnswerItemSchema),
  canSubmitAnswer: z.boolean(),
  company: z.string().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  currentQuestion: z.string().min(8).nullable(),
  difficulty: interviewDifficultySchema,
  firstQuestion: z.string().min(8),
  id: z.string().min(2),
  mode: interviewModeSchema,
  role: z.string().min(2).max(120),
  status: interviewStatusSchema,
  workspaceId: z.string().min(2),
  workspaceName: z.string().min(2).max(120),
});

export const interviewSessionDetailResponseSchema = z.object({
  item: interviewSessionDetailSchema,
});

export const submitInterviewAnswerInputSchema = z.object({
  prompt: z.string().min(8),
  response: z.string().min(4).max(4_000),
});

export const completeInterviewSessionResponseSchema =
  interviewSessionDetailResponseSchema;
export const submitInterviewAnswerResponseSchema =
  interviewSessionDetailResponseSchema;

export type InterviewConfig = z.infer<typeof interviewConfigSchema>;
export type InterviewAnswerItem = z.infer<typeof interviewAnswerItemSchema>;
export type InterviewDifficulty = z.infer<typeof interviewDifficultySchema>;
export type InterviewHistoryItem = z.infer<typeof interviewHistoryItemSchema>;
export type InterviewHistoryResponse = z.infer<typeof interviewHistoryResponseSchema>;
export type InterviewMode = z.infer<typeof interviewModeSchema>;
export type InterviewSessionDetail = z.infer<typeof interviewSessionDetailSchema>;
export type InterviewSessionDetailResponse = z.infer<
  typeof interviewSessionDetailResponseSchema
>;
export type InterviewStatus = z.infer<typeof interviewStatusSchema>;
export type SessionBlueprint = z.infer<typeof sessionBlueprintSchema>;
export type StartInterviewSessionInput = z.infer<
  typeof startInterviewSessionInputSchema
>;
export type StartInterviewSessionResponse = z.infer<
  typeof startInterviewSessionResponseSchema
>;
export type SubmitInterviewAnswerInput = z.infer<
  typeof submitInterviewAnswerInputSchema
>;
