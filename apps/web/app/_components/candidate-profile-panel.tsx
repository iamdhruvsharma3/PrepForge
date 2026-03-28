"use client";

import { useState } from "react";

import type { CandidateProfile, IngestResumeInput } from "@prepforge/types";
import { Card } from "@prepforge/ui";

type CandidateProfilePanelProps = {
  disabled: boolean;
  error: string | null;
  onIngestResume: (input: IngestResumeInput) => Promise<void>;
  onRefresh: () => Promise<void>;
  profile: CandidateProfile | null;
};

function formatUpdatedAt(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "No profile yet";
}

export function CandidateProfilePanel({
  disabled,
  error,
  onIngestResume,
  onRefresh,
  profile,
}: CandidateProfilePanelProps) {
  const [fileName, setFileName] = useState("resume-frontend-engineer.txt");
  const [resumeText, setResumeText] = useState("");

  async function handleSubmit() {
    await onIngestResume({
      contentType: "text/plain",
      fileName: fileName.trim(),
      resumeText: resumeText.trim(),
      source: "paste",
    });
    setResumeText("");
  }

  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Candidate Grounding
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Turn resume context into interview signal.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {error ??
              "Paste resume text to create a tenant-scoped candidate profile. PrepForge will extract role context, strengths, and interview focus areas from it."}
          </p>
        </div>
        <button
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={() => void onRefresh()}
          type="button"
        >
          Refresh profile
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <label className="text-xs uppercase tracking-[0.22em] text-slate-400">
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
            Resume text
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
              Resume text stays inside the workspace profile boundary and feeds future interview personalization.
            </p>
            <button
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled || fileName.trim().length < 2 || resumeText.trim().length < 120}
              onClick={() => void handleSubmit()}
              type="button"
            >
              Ingest resume
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Profile snapshot
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {profile?.targetRole ?? "No target role extracted yet"}
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Updated {formatUpdatedAt(profile?.updatedAt ?? null)}
            </p>
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Headline
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {profile?.headline ?? "Resume ingestion will extract the working headline from the resume."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Experience
                </p>
                <p className="mt-2 text-sm text-white">
                  {profile?.yearsExperience !== null && profile?.yearsExperience !== undefined
                    ? `${profile.yearsExperience} years`
                    : "Not detected yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Current company
                </p>
                <p className="mt-2 text-sm text-white">
                  {profile?.currentCompany ?? "Not detected yet"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Summary
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {profile?.summary ?? "Summary will appear after the first resume ingestion."}
              </p>
            </div>

            <TagGroup
              emptyState="Strengths will populate from technologies and patterns mentioned in the resume."
              items={profile?.strengths ?? []}
              title="Strengths"
            />
            <TagGroup
              emptyState="Focus areas will map the resume to interview-prep categories."
              items={profile?.focusAreas ?? []}
              title="Interview focus areas"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Resume highlights
              </p>
              <div className="mt-3 grid gap-2">
                {(profile?.resumeHighlights.length ?? 0) > 0 ? (
                  profile?.resumeHighlights.map((highlight) => (
                    <div
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 text-slate-200"
                      key={highlight}
                    >
                      {highlight}
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-300">
                    High-signal bullet points will show up here after ingestion.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Latest resume
              </p>
              <p className="mt-2 text-sm text-white">
                {profile?.latestResume
                  ? `${profile.latestResume.fileName} • ${profile.latestResume.wordCount} words`
                  : "No resume ingested yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

type TagGroupProps = {
  emptyState: string;
  items: string[];
  title: string;
};

function TagGroup({ emptyState, items, title }: TagGroupProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100"
              key={item}
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm leading-6 text-slate-300">{emptyState}</p>
        )}
      </div>
    </div>
  );
}
