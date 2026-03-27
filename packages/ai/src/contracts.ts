export type AiGenerateTextRequest = {
  systemPrompt: string;
  userPrompt: string;
};

export type AiGenerateTextResponse = {
  model: string;
  text: string;
};

export interface AiTextProvider {
  generateText(request: AiGenerateTextRequest): Promise<AiGenerateTextResponse>;
  name: string;
}

export function createStubAiTextProvider(name = "stub"): AiTextProvider {
  return {
    async generateText({ userPrompt }) {
      return {
        model: `${name}-preview`,
        text: `Walk me through a recent project where you improved reliability under pressure. Context seed: ${userPrompt.slice(0, 72)}...`,
      };
    },
    name,
  };
}

