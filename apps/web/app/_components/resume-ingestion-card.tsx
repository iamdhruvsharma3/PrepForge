"use client";

import { useRef, useState } from "react";

import type { IngestResumeInput } from "@prepforge/types";
import { readResumeUpload } from "../../src/lib/resume-file";

type ResumeIngestionCardProps = {
  disabled: boolean;
  onIngestResume: (input: IngestResumeInput) => Promise<void>;
};

export function ResumeIngestionCard({
  disabled,
  onIngestResume,
}: ResumeIngestionCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("resume-frontend-engineer.txt");
  const [resumeText, setResumeText] = useState("");
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  async function handlePasteSubmit() {
    setLocalMessage(null);

    await onIngestResume({
      contentType: "text/plain",
      fileName: fileName.trim(),
      resumeText: resumeText.trim(),
      source: "paste",
    });

    setResumeText("");
    setLocalMessage(`Saved pasted resume as ${fileName.trim()}.`);
  }

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setLocalMessage(null);

    try {
      const input = await readResumeUpload(file);
      await onIngestResume(input);
      setFileName(input.fileName);
      setResumeText("");
      setLocalMessage(`Uploaded ${input.fileName} as a new resume version.`);
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : "Unable to read file.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Resume ingestion
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            Upload a text resume or paste one manually.
          </p>
        </div>
        <button
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Upload file
        </button>
      </div>

      <input
        accept=".txt,.md,.markdown,text/plain,text/markdown"
        className="hidden"
        disabled={disabled}
        onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
        ref={fileInputRef}
        type="file"
      />

      <p className="mt-3 text-xs leading-5 text-slate-400">
        File upload currently supports text-based resumes only: `.txt`, `.md`, `.markdown`.
        Paste mode remains available for all other sources.
      </p>

      {localMessage ? (
        <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200">
          {localMessage}
        </p>
      ) : null}

      <label className="mt-4 block text-xs uppercase tracking-[0.22em] text-slate-400">
        Resume file name
      </label>
      <input
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
        disabled={disabled}
        onChange={(event) => setFileName(event.target.value)}
        placeholder="resume-frontend-engineer.txt"
        value={fileName}
      />

      <label className="mt-4 block text-xs uppercase tracking-[0.22em] text-slate-400">
        Paste resume text
      </label>
      <textarea
        className="mt-2 min-h-56 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-6 text-white outline-none transition focus:border-cyan-300/40"
        disabled={disabled}
        onChange={(event) => setResumeText(event.target.value)}
        placeholder="Paste the candidate resume text here. Include headline, experience, achievements, and skills."
        value={resumeText}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Each ingestion creates a versioned resume entry for the active workspace profile.
        </p>
        <button
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || fileName.trim().length < 2 || resumeText.trim().length < 120}
          onClick={() => void handlePasteSubmit()}
          type="button"
        >
          Ingest pasted resume
        </button>
      </div>
    </div>
  );
}
