import type {
  CandidateProfileContext,
  StartInterviewSessionInput,
} from "@prepforge/types";

export function buildInterviewSystemPrompt(
  input: StartInterviewSessionInput,
  candidateProfile?: CandidateProfileContext | null,
): string {
  const companyContext = input.company
    ? `Target company: ${input.company}.`
    : "No target company specified.";

  const focusAreas =
    input.focusAreas.length > 0
      ? `Focus areas: ${input.focusAreas.join(", ")}.`
      : "Use broad fundamentals and communication depth.";

  const candidateContext = candidateProfile
    ? buildCandidateContext(candidateProfile)
    : "No stored candidate profile is available.";

  return [
    "You are PrepForge's interview orchestrator.",
    "Generate concise, high-signal prompts for realistic mock interviews.",
    `Role: ${input.role}.`,
    `Difficulty: ${input.difficulty}.`,
    `Mode: ${input.mode}.`,
    companyContext,
    focusAreas,
    candidateContext,
  ].join(" ");
}

function buildCandidateContext(candidateProfile: CandidateProfileContext): string {
  const sections = [
    candidateProfile.targetRole
      ? `Candidate target role: ${candidateProfile.targetRole}.`
      : null,
    candidateProfile.yearsExperience !== null
      ? `Years of experience: ${candidateProfile.yearsExperience}.`
      : null,
    candidateProfile.currentCompany
      ? `Current company: ${candidateProfile.currentCompany}.`
      : null,
    candidateProfile.summary ? `Candidate summary: ${candidateProfile.summary}` : null,
    candidateProfile.strengths.length > 0
      ? `Strengths: ${candidateProfile.strengths.join(", ")}.`
      : null,
    candidateProfile.resumeHighlights.length > 0
      ? `Resume highlights: ${candidateProfile.resumeHighlights.join(" | ")}.`
      : null,
  ].filter(Boolean);

  return sections.join(" ");
}
