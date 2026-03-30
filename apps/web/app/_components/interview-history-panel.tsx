"use client";

import type { InterviewHistoryItem } from "@prepforge/types";
import { Button, Card } from "@prepforge/ui";

type InterviewHistoryPanelProps = {
  activeSessionId?: string | null;
  disabled?: boolean;
  error: string | null;
  items: InterviewHistoryItem[];
  onRefresh: () => Promise<void>;
  onSelectSession: (interviewId: string) => Promise<void>;
};

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

export function InterviewHistoryPanel({
  activeSessionId,
  disabled = false,
  error,
  items,
  onRefresh,
  onSelectSession,
}: InterviewHistoryPanelProps) {
  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Protected History
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Interview sessions are now persisted.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {error ??
              "History stays tenant-scoped and reflects every launched interview session for the active workspace."}
          </p>
        </div>

        <Button disabled={disabled} onClick={() => void onRefresh()} variant="secondary">
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-300">
            No interview history yet for the active workspace.
          </div>
        ) : null}

        {items.map((item) => (
          <div
            className={`rounded-2xl border px-4 py-4 ${
              item.id === activeSessionId
                ? "border-cyan-300/40 bg-cyan-400/10"
                : "border-white/10 bg-slate-950/40"
            }`}
            key={item.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-medium text-white">{item.role}</p>
                <p className="text-sm text-slate-300">
                  {item.company ?? item.workspaceName} • {item.difficulty} • {item.mode}
                </p>
              </div>

              <div className="text-right text-sm text-slate-300">
                <p>
                  {item.status}
                  {item.overallScore !== null ? ` • ${item.overallScore}/10` : ""}
                </p>
                <p>{formatTimestamp(item.createdAt)}</p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-200">
              Opening question: {item.firstQuestion}
            </p>

            <div className="mt-4 flex justify-end">
              <Button
                disabled={disabled}
                onClick={() => void onSelectSession(item.id)}
                variant={item.id === activeSessionId ? "primary" : "secondary"}
              >
                {item.id === activeSessionId ? "Open now" : "Open session"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
