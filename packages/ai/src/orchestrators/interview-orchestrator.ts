import type {
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
}

export function createInterviewOrchestrator(provider: AiTextProvider) {
  return new InterviewOrchestrator(provider);
}

