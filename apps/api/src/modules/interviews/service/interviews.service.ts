import { randomUUID } from "node:crypto";

import {
  createInterviewOrchestrator,
  createStubAiTextProvider,
} from "@prepforge/ai";
import type {
  InterviewConfig,
  StartInterviewSessionInput,
  StartInterviewSessionResponse,
} from "@prepforge/types";

import { InterviewsRepository } from "../repository/interviews.repository";

const orchestrator = createInterviewOrchestrator(
  createStubAiTextProvider("prepforge-foundation"),
);

export class InterviewsService {
  constructor(private readonly repository = new InterviewsRepository()) {}

  getConfig(): InterviewConfig {
    return this.repository.getConfig();
  }

  async startSession(
    input: StartInterviewSessionInput,
  ): Promise<StartInterviewSessionResponse> {
    const blueprint = await orchestrator.buildSessionBlueprint(input);

    return {
      blueprint,
      sessionId: randomUUID(),
      status: "initialized",
    };
  }
}

