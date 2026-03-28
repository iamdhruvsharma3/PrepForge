"use client";

import type { InterviewSessionDetail } from "@prepforge/types";
import { Button, Card } from "@prepforge/ui";

type InterviewWorkspacePanelProps = {
  answerDraft: string;
  detail: InterviewSessionDetail | null;
  detailError: string | null;
  disabled?: boolean;
  onAnswerDraftChange: (value: string) => void;
  onCompleteSession: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
};

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

export function InterviewWorkspacePanel({
  answerDraft,
  detail,
  detailError,
  disabled = false,
  onAnswerDraftChange,
  onCompleteSession,
  onRefresh,
  onSubmitAnswer,
}: InterviewWorkspacePanelProps) {
  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Interview Workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {detail ? detail.role : "Select a session"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {detail
              ? `${detail.workspaceName} • ${detail.difficulty} • ${detail.mode}`
              : detailError ??
                "Open a session from history or create a demo session to start the full workflow."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button disabled={disabled || !detail} onClick={() => void onRefresh()} variant="secondary">
            Refresh
          </Button>
          <Button
            disabled={disabled || !detail || detail.status === "completed"}
            onClick={() => void onCompleteSession()}
            variant="secondary"
          >
            {detail?.status === "completed" ? "Completed" : "Complete session"}
          </Button>
        </div>
      </div>

      {detail ? (
        <div className="mt-6 grid gap-6">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-4">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">
              Current Question
            </p>
            <p className="mt-3 text-base leading-7 text-white">
              {detail.currentQuestion ??
                "This session has been completed. Review the saved answers below."}
            </p>
            {detail.scoreSummary ? (
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-cyan-100">
                <span>Overall {detail.scoreSummary.overall}/10</span>
                <span>Correctness {detail.scoreSummary.correctness}/10</span>
                <span>Communication {detail.scoreSummary.communication}/10</span>
                <span>Depth {detail.scoreSummary.depth}/10</span>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Submit Answer
              </p>
              <p className="text-sm text-slate-300">
                Status: {detail.status} • Started {formatTimestamp(detail.createdAt)}
              </p>
            </div>

            <textarea
              className="mt-3 min-h-36 w-full rounded-3xl border border-white/10 bg-slate-950/50 px-4 py-4 text-base leading-7 text-white outline-none transition focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || !detail.canSubmitAnswer}
              onChange={(event) => onAnswerDraftChange(event.target.value)}
              placeholder="Write your answer with context, tradeoffs, and outcome."
              value={answerDraft}
            />

            <div className="mt-3 flex justify-end">
              <Button
                disabled={disabled || !detail.canSubmitAnswer || answerDraft.trim().length < 4}
                onClick={() => void onSubmitAnswer()}
              >
                Save answer and continue
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Answer Timeline
            </p>

            {detail.answers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-300">
                No answers submitted yet.
              </div>
            ) : null}

            {detail.answers.map((answer) => (
              <div
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
                key={answer.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-medium text-white">
                    Answer {answer.orderIndex + 1}
                  </p>
                  <p className="text-sm text-slate-300">
                    {formatTimestamp(answer.createdAt)}
                  </p>
                </div>

                <p className="mt-3 text-sm font-medium text-cyan-100">{answer.prompt}</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{answer.response}</p>

                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Feedback
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{answer.feedback}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-cyan-100">
                    <span>Overall {answer.scores.overall}/10</span>
                    <span>Correctness {answer.scores.correctness}/10</span>
                    <span>Communication {answer.scores.communication}/10</span>
                    <span>Depth {answer.scores.depth}/10</span>
                  </div>
                </div>

                {answer.nextQuestion ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Next Question
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      {answer.nextQuestion}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
