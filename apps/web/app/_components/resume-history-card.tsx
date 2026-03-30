"use client";

import type { CandidateProfile } from "@prepforge/types";

type ResumeHistoryCardProps = {
  disabled: boolean;
  onSetActiveResume: (resumeId: string) => Promise<void>;
  profile: CandidateProfile | null;
};

function formatSize(sizeBytes: number | null): string {
  if (sizeBytes === null) {
    return "Unknown size";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  return `${(sizeBytes / 1024).toFixed(1)} KB`;
}

function formatParseStatus(status: CandidateProfile["resumeHistory"][number]["parseStatus"]) {
  return status.replace("_", " ");
}

function statusTone(status: CandidateProfile["resumeHistory"][number]["parseStatus"]) {
  if (status === "completed") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "needs_review") {
    return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-400/10 text-rose-100";
}

export function ResumeHistoryCard({
  disabled,
  onSetActiveResume,
  profile,
}: ResumeHistoryCardProps) {
  const items = profile?.resumeHistory ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Resume versions
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {items.length > 0 ? `${items.length} saved versions` : "No resume history yet"}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          {profile?.latestResume
            ? `Latest: v${profile.latestResume.version}`
            : "Ingest a resume to start versioning"}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              key={item.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    v{item.version} • {item.fileName}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(item.uploadedAt).toLocaleString()} • {item.wordCount} words •{" "}
                    {formatSize(item.sizeBytes)} • {item.source}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusTone(item.parseStatus)}`}
                  >
                    {formatParseStatus(item.parseStatus)}
                  </span>
                  {item.isActive ? (
                    <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">
                      Active
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Parser: {item.parserName} {item.parserVersion}
                  {item.parseConfidence !== null ? ` • ${item.parseConfidence}% confidence` : ""}
                </div>
                {!item.isActive ? (
                  <button
                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={disabled}
                    onClick={() => void onSetActiveResume(item.id)}
                    type="button"
                  >
                    Use for interviews
                  </button>
                ) : null}
              </div>

              {item.parseWarnings.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {item.parseWarnings.map((warning) => (
                    <p
                      className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3 text-xs leading-5 text-slate-300"
                      key={warning}
                    >
                      {warning}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-slate-300">
            Resume uploads and pasted ingestions will appear here as versioned history.
          </p>
        )}
      </div>
    </div>
  );
}
