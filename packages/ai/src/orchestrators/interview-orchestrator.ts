import type {
  CandidateProfileContext,
  InterviewDifficulty,
  InterviewAxisScore,
  SessionBlueprint,
  StartInterviewSessionInput,
} from "@prepforge/types";

import type { AiTextProvider } from "../contracts";
import { buildInterviewSystemPrompt } from "../prompts/interview";

export class InterviewOrchestrator {
  constructor(private readonly provider: AiTextProvider) {}

  async buildSessionBlueprint(
    input: StartInterviewSessionInput,
    options?: {
      candidateProfile?: CandidateProfileContext | null;
    },
  ): Promise<SessionBlueprint> {
    const systemPrompt = buildInterviewSystemPrompt(
      input,
      options?.candidateProfile ?? null,
    );
    const candidateSummary = options?.candidateProfile
      ? [
          options.candidateProfile.targetRole,
          options.candidateProfile.yearsExperience !== null
            ? `${options.candidateProfile.yearsExperience} years experience`
            : null,
          options.candidateProfile.strengths.slice(0, 3).join(", "),
        ]
          .filter(Boolean)
          .join(" | ")
      : "No stored candidate profile";
    const response = await this.provider.generateText({
      systemPrompt,
      userPrompt: `Prepare the opening question for a ${input.difficulty} ${input.role} interview. Candidate context: ${candidateSummary}.`,
    });

    return {
      evaluationAxes: ["correctness", "communication", "depth"],
      firstQuestion: response.text,
      suggestedDurationMinutes: input.mode === "voice" ? 25 : 20,
      systemPromptPreview: systemPrompt,
    };
  }

  async buildAnswerReview(input: {
    answerCount: number;
    difficulty: InterviewDifficulty;
    prompt: string;
    response: string;
    role: string;
  }): Promise<{
    feedback: string;
    nextQuestion: string | null;
    scores: InterviewAxisScore;
  }> {
    const responseLength = input.response.trim().split(/\s+/).length;
    const communicationNote =
      responseLength > 40
        ? "You gave enough detail to show structure and ownership."
        : "Add a clearer structure and one concrete example to strengthen the answer.";
    const depthNote =
      responseLength > 70
        ? "The depth is solid, but tighten the signal so the strongest point lands earlier."
        : "Go one layer deeper on tradeoffs, constraints, and outcome.";

    const followUp = await this.provider.generateText({
      systemPrompt:
        "You generate concise follow-up interview questions for PrepForge. Keep the question under 28 words and make it feel like a natural continuation.",
      userPrompt: `Role: ${input.role}. Difficulty: ${input.difficulty}. Previous prompt: ${input.prompt}. Candidate answer summary: ${input.response.slice(
        0,
        220,
      )}. Produce one follow-up question.`,
    });

    const scores = scoreAnswer({
      answerCount: input.answerCount,
      difficulty: input.difficulty,
      responseLength,
      responseText: input.response,
    });

    return {
      feedback: [
        `Assessment after answer ${input.answerCount + 1}.`,
        communicationNote,
        depthNote,
      ].join(" "),
      nextQuestion: input.answerCount >= 2 ? null : followUp.text,
      scores,
    };
  }
}

export function createInterviewOrchestrator(provider: AiTextProvider) {
  return new InterviewOrchestrator(provider);
}

function scoreAnswer(input: {
  answerCount: number;
  difficulty: InterviewDifficulty;
  responseLength: number;
  responseText: string;
}): InterviewAxisScore {
  const difficultyBoost =
    input.difficulty === "advanced"
      ? 1
      : input.difficulty === "intermediate"
        ? 0
        : -1;
  const mentionsTradeoff = /tradeoff|constraint|decision|risk/i.test(input.responseText);
  const mentionsOutcome = /result|outcome|impact|improved|reduced|increased/i.test(
    input.responseText,
  );

  const correctness = clampScore(
    5 + difficultyBoost + (mentionsTradeoff ? 2 : 0) + (mentionsOutcome ? 1 : 0),
  );
  const communication = clampScore(
    4 + Math.floor(input.responseLength / 30) + (input.answerCount > 0 ? 1 : 0),
  );
  const depth = clampScore(
    4 + Math.floor(input.responseLength / 35) + (mentionsTradeoff ? 1 : 0),
  );
  const overall = clampScore(
    Math.round((correctness + communication + depth) / 3),
  );

  return {
    communication,
    correctness,
    depth,
    overall,
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, value));
}
