import type {
  InterviewDifficulty,
  SessionBlueprint,
  StartInterviewSessionInput,
} from "@prepforge/types";

import type { AiTextProvider } from "../contracts";
import { buildInterviewSystemPrompt } from "../prompts/interview";

export class InterviewOrchestrator {
  constructor(private readonly provider: AiTextProvider) {}

  async buildSessionBlueprint(
    input: StartInterviewSessionInput,
  ): Promise<SessionBlueprint> {
    const systemPrompt = buildInterviewSystemPrompt(input);
    const response = await this.provider.generateText({
      systemPrompt,
      userPrompt: `Prepare the opening question for a ${input.difficulty} ${input.role} interview.`,
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

    return {
      feedback: [
        `Assessment after answer ${input.answerCount + 1}.`,
        communicationNote,
        depthNote,
      ].join(" "),
      nextQuestion: input.answerCount >= 2 ? null : followUp.text,
    };
  }
}

export function createInterviewOrchestrator(provider: AiTextProvider) {
  return new InterviewOrchestrator(provider);
}
