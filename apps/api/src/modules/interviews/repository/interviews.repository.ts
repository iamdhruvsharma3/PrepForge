import type { InterviewConfig } from "@prepforge/types";

export class InterviewsRepository {
  getConfig(): InterviewConfig {
    return {
      difficultyLevels: ["foundation", "intermediate", "advanced"],
      focusAreas: [
        "system design",
        "data structures",
        "behavioral storytelling",
        "performance optimization",
        "testing strategy",
      ],
      modes: ["text", "voice"],
    };
  }
}

