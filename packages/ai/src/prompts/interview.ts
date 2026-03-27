import type { StartInterviewSessionInput } from "@prepforge/types";

export function buildInterviewSystemPrompt(
  input: StartInterviewSessionInput,
): string {
  const companyContext = input.company
    ? `Target company: ${input.company}.`
    : "No target company specified.";

  const focusAreas =
    input.focusAreas.length > 0
      ? `Focus areas: ${input.focusAreas.join(", ")}.`
      : "Use broad fundamentals and communication depth.";

  return [
    "You are PrepForge's interview orchestrator.",
    "Generate concise, high-signal prompts for realistic mock interviews.",
    `Role: ${input.role}.`,
    `Difficulty: ${input.difficulty}.`,
    `Mode: ${input.mode}.`,
    companyContext,
    focusAreas,
  ].join(" ");
}
