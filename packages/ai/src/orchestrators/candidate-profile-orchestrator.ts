import type {
  CandidateProfileContext,
  IngestResumeInput,
} from "@prepforge/types";

const strengthMatchers = [
  { label: "React", pattern: /\breact(?:\.js)?\b/i },
  { label: "TypeScript", pattern: /\btypescript\b/i },
  { label: "Node.js", pattern: /\bnode(?:\.js)?\b/i },
  { label: "Testing", pattern: /\bjest\b|\bvitest\b|\btesting library\b|\bcypress\b/i },
  { label: "System design", pattern: /\bsystem design\b|\bdistributed systems?\b|\bscalab/i },
  { label: "Performance", pattern: /\bperformance\b|\blatency\b|\bcaching\b|\boptimization\b/i },
  { label: "Leadership", pattern: /\bled\b|\bmentored\b|\bmanaged\b|\bownership\b/i },
  { label: "Product collaboration", pattern: /\bproduct\b|\bstakeholder\b|\bcross-functional\b/i },
  { label: "Cloud infrastructure", pattern: /\baws\b|\bgcp\b|\bazure\b|\bcloudflare\b/i },
  { label: "Data", pattern: /\bsql\b|\bpostgres\b|\bwarehouse\b|\bdata pipeline\b/i },
  { label: "Mobile", pattern: /\breact native\b|\bexpo\b|\bios\b|\bandroid\b/i },
  { label: "API design", pattern: /\bgraphql\b|\brest\b|\bapi\b/i },
] as const;

const focusAreaMatchers = [
  {
    label: "system design",
    pattern: /\bsystem design\b|\barchitecture\b|\bdistributed\b|\bscalab/i,
  },
  {
    label: "testing strategy",
    pattern: /\btest\b|\bqa\b|\bjest\b|\bvitest\b|\bplaywright\b|\bcypress\b/i,
  },
  {
    label: "performance optimization",
    pattern: /\bperformance\b|\blatency\b|\bcaching\b|\boptimization\b/i,
  },
  {
    label: "behavioral storytelling",
    pattern: /\bled\b|\bowned\b|\blaunched\b|\bdelivered\b|\bimpact\b|\bmentored\b/i,
  },
  {
    label: "frontend architecture",
    pattern: /\breact\b|\bfrontend\b|\bdesign system\b|\bui platform\b/i,
  },
  {
    label: "backend systems",
    pattern: /\bnode\b|\bjava\b|\bgo\b|\bbackend\b|\bapi\b|\bmicroservice\b/i,
  },
  {
    label: "data structures",
    pattern: /\balgorithm\b|\bdata structures?\b|\bcomplexity\b/i,
  },
  {
    label: "leadership",
    pattern: /\bled\b|\bmanaged\b|\bmanager\b|\btech lead\b|\bstaff\b/i,
  },
] as const;

const rolePatterns = [
  /\bstaff software engineer\b/i,
  /\bsenior software engineer\b/i,
  /\bsoftware engineer\b/i,
  /\bfrontend engineer\b/i,
  /\bfrontend developer\b/i,
  /\bbackend engineer\b/i,
  /\bfull[- ]stack engineer\b/i,
  /\bfull[- ]stack developer\b/i,
  /\bmobile engineer\b/i,
  /\bproduct engineer\b/i,
  /\bengineering manager\b/i,
  /\btech lead\b/i,
  /\bproduct manager\b/i,
  /\bdesigner\b/i,
] as const;

export class CandidateProfileOrchestrator {
  ingestResume(input: IngestResumeInput): CandidateProfileContext {
    const normalizedText = normalizeText(input.resumeText);
    const lines = normalizedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const targetRole = extractTargetRole(lines, normalizedText);
    const headline = extractHeadline(lines, targetRole);
    const strengths = extractMatches(normalizedText, strengthMatchers, 6);
    const focusAreas = extractMatches(normalizedText, focusAreaMatchers, 5);
    const resumeHighlights = extractResumeHighlights(lines);

    return {
      currentCompany: extractCurrentCompany(lines),
      focusAreas,
      headline,
      resumeHighlights,
      strengths,
      summary: extractSummary(normalizedText, resumeHighlights),
      targetRole,
      yearsExperience: extractYearsExperience(normalizedText),
    };
  }
}

export function createCandidateProfileOrchestrator() {
  return new CandidateProfileOrchestrator();
}

function normalizeText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\u2022/g, "-").trim();
}

function extractTargetRole(lines: string[], text: string): string | null {
  const lineMatch = lines
    .slice(0, 8)
    .find((line) => rolePatterns.some((pattern) => pattern.test(line)));

  if (lineMatch) {
    return toTitleCase(lineMatch);
  }

  const textMatch = rolePatterns.find((pattern) => pattern.test(text));
  return textMatch ? toTitleCase(text.match(textMatch)?.[0] ?? "") : null;
}

function extractHeadline(lines: string[], targetRole: string | null): string | null {
  const headlineCandidate = lines
    .slice(0, 10)
    .find(
      (line) =>
        line.length >= 8 &&
        line.length <= 90 &&
        /engineer|developer|manager|designer|architect/i.test(line),
    );

  return headlineCandidate ? trimPunctuation(headlineCandidate) : targetRole;
}

function extractCurrentCompany(lines: string[]): string | null {
  const atMatch = lines
    .slice(0, 20)
    .flatMap((line) => {
      const directMatch = line.match(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,})/);
      if (directMatch?.[1]) {
        return [trimPunctuation(directMatch[1])];
      }

      const pipeMatch = line.match(
        /(?:engineer|developer|manager|designer|architect)[^|]*\|\s*([A-Z][A-Za-z0-9&.\- ]{2,})/i,
      );
      return pipeMatch?.[1] ? [trimPunctuation(pipeMatch[1])] : [];
    })[0];

  return atMatch ?? null;
}

function extractYearsExperience(text: string): number | null {
  const explicitMatch = text.match(/(\d{1,2})\+?\s+years?\s+of\s+experience/i);
  if (explicitMatch?.[1]) {
    return clampYears(Number(explicitMatch[1]));
  }

  const shorterMatch = text.match(/(\d{1,2})\+?\s+years?\s+(?:experience|in)/i);
  if (shorterMatch?.[1]) {
    return clampYears(Number(shorterMatch[1]));
  }

  return null;
}

function extractMatches(
  text: string,
  matchers: ReadonlyArray<{ label: string; pattern: RegExp }>,
  limit: number,
): string[] {
  return matchers
    .filter((matcher) => matcher.pattern.test(text))
    .map((matcher) => matcher.label)
    .slice(0, limit);
}

function extractResumeHighlights(lines: string[]): string[] {
  const candidates = lines.filter(
    (line) =>
      line.length >= 30 &&
      line.length <= 180 &&
      !/@|https?:\/\//i.test(line),
  );

  const numericHighlights = candidates.filter((line) => /\d|%/.test(line));
  const selected = [...numericHighlights, ...candidates].slice(0, 4);

  return Array.from(new Set(selected.map(trimPunctuation)));
}

function extractSummary(text: string, resumeHighlights: string[]): string | null {
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24);

  const summary = sentences.slice(0, 2).join(" ");
  if (summary.length >= 32) {
    return summary.slice(0, 1_200);
  }

  return resumeHighlights[0] ?? null;
}

function trimPunctuation(value: string): string {
  return value.replace(/^[\s\-|,.;:]+|[\s\-|,.;:]+$/g, "");
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
    .replace(/\bUi\b/g, "UI")
    .replace(/\bApi\b/g, "API");
}

function clampYears(value: number): number {
  return Math.max(0, Math.min(60, value));
}
