"use client";

import type { InterviewDashboardResponse } from "@prepforge/types";
import { Card } from "@prepforge/ui";

type InterviewDashboardPanelProps = {
  data: InterviewDashboardResponse | null;
  error: string | null;
};

const summaryLabels = [
  { key: "totalSessions", label: "Total sessions" },
  { key: "completedSessions", label: "Completed" },
  { key: "activeSessions", label: "Active" },
  { key: "averageOverallScore", label: "Avg. overall score" },
] as const;

function formatScore(value: number | null): string {
  return value === null ? "n/a" : `${value}/10`;
}

export function InterviewDashboardPanel({
  data,
  error,
}: InterviewDashboardPanelProps) {
  const latestCompletedScore = data?.summary.latestCompletedScore ?? null;

  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Dashboard Outcomes
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Scores start to tell the story.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {error ??
              "This panel summarizes session volume, average score, and the recent trend for the active workspace."}
          </p>
        </div>

        {latestCompletedScore !== null ? (
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">
              Latest completed score
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatScore(latestCompletedScore)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryLabels.map((item) => (
          <div
            className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
            key={item.key}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {item.key === "averageOverallScore"
                ? formatScore(data?.summary[item.key] ?? null)
                : String(data?.summary[item.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Average score axes
          </p>
          <div className="mt-4 grid gap-3">
            {data?.scoreAverages ? (
              Object.entries(data.scoreAverages).map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-200">
                    <span className="capitalize">{label}</span>
                    <span>{value}/10</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-cyan-300"
                      style={{ width: `${value * 10}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">
                Scores appear after at least one answer is submitted.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Recent trend
          </p>
          <div className="mt-4 grid gap-3">
            {data?.trend.length ? (
              data.trend.map((item) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                  key={item.interviewId}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.role}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()} • {item.status}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-cyan-100">
                    {formatScore(item.overallScore)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">
                Complete a session to start building score trends.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
