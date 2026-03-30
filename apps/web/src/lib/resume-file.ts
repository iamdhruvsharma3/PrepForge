import type { IngestResumeInput } from "@prepforge/types";

const allowedExtensions = [".txt", ".md", ".markdown"] as const;
const maxResumeSizeBytes = 2 * 1024 * 1024;

export async function readResumeUpload(file: File): Promise<IngestResumeInput> {
  if (!isSupportedResumeFile(file)) {
    throw new Error(
      "Only text-based resume files are supported right now (.txt, .md, .markdown).",
    );
  }

  if (file.size > maxResumeSizeBytes) {
    throw new Error("Resume file is too large. Keep it under 2 MB.");
  }

  const resumeText = (await file.text()).trim();

  if (resumeText.length < 120) {
    throw new Error(
      "Resume file content is too short to parse. Provide a fuller resume or use paste mode.",
    );
  }

  return {
    contentType: file.type || "text/plain",
    fileName: file.name,
    resumeText,
    sizeBytes: file.size,
    source: "upload",
  };
}

function isSupportedResumeFile(file: File): boolean {
  if (file.type.startsWith("text/")) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return allowedExtensions.some((extension) => lowerName.endsWith(extension));
}
