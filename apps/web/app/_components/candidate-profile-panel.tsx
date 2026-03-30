"use client";

import type {
  CandidateProfile,
  IngestResumeInput,
  UpsertCandidateProfileInput,
} from "@prepforge/types";
import { Card } from "@prepforge/ui";
import { CandidateProfileEditorCard } from "./candidate-profile-editor-card";
import { ResumeHistoryCard } from "./resume-history-card";
import { ResumeIngestionCard } from "./resume-ingestion-card";

type CandidateProfilePanelProps = {
  disabled: boolean;
  error: string | null;
  onIngestResume: (input: IngestResumeInput) => Promise<void>;
  onRefresh: () => Promise<void>;
  onSetActiveResume: (resumeId: string) => Promise<void>;
  onSaveProfile: (input: UpsertCandidateProfileInput) => Promise<void>;
  profile: CandidateProfile | null;
};

export function CandidateProfilePanel({
  disabled,
  error,
  onIngestResume,
  onRefresh,
  onSetActiveResume,
  onSaveProfile,
  profile,
}: CandidateProfilePanelProps) {
  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Candidate Grounding
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Turn resume context into a durable candidate record.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {error ??
              "Upload or paste resume content, keep version history visible, and maintain a candidate profile that future interviews can consume."}
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
        <ResumeIngestionCard disabled={disabled} onIngestResume={onIngestResume} />

        <CandidateProfileEditorCard
          disabled={disabled}
          onSaveProfile={onSaveProfile}
          profile={profile}
        />
      </div>

      <div className="mt-4">
        <ResumeHistoryCard
          disabled={disabled}
          onSetActiveResume={onSetActiveResume}
          profile={profile}
        />
      </div>
    </Card>
  );
}
