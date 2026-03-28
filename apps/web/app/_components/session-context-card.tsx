"use client";

import type { AuthSessionContextResponse } from "@prepforge/types";
import { Button, Card } from "@prepforge/ui";

type SessionContextCardProps = {
  context: AuthSessionContextResponse | null;
  contextError: string | null;
  disabled?: boolean;
  onRefresh: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSwitchWorkspace: (workspaceId: string) => Promise<void>;
  statusMessage?: string | null;
};

export function SessionContextCard({
  context,
  contextError,
  disabled = false,
  onRefresh,
  onSignOut,
  onSwitchWorkspace,
  statusMessage,
}: SessionContextCardProps) {
  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-cyan-400/20 bg-cyan-400/8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">
            Session Context
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {context?.activeWorkspace?.name ?? "Loading workspace"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {context
              ? `${context.user.email} • active workspace: ${context.activeWorkspace?.slug ?? "none"}`
              : contextError ?? "Fetching workspace memberships from the API."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button disabled={disabled} onClick={() => void onRefresh()} variant="secondary">
            Refresh
          </Button>
          <Button disabled={disabled} onClick={() => void onSignOut()} variant="secondary">
            Sign out
          </Button>
        </div>
      </div>

      <p className="mt-4 min-h-6 text-sm text-slate-300">{statusMessage}</p>

      <div className="mt-6 grid gap-3">
        {context?.memberships.map((membership) => {
          const isActive =
            membership.workspace.id === context.activeWorkspace?.id;

          return (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
              key={membership.workspace.id}
            >
              <div>
                <p className="text-base font-medium text-white">
                  {membership.workspace.name}
                </p>
                <p className="text-sm text-slate-300">
                  {membership.role} • {membership.workspace.memberCount} members •{" "}
                  {membership.workspace.plan}
                </p>
              </div>

              <Button
                disabled={disabled}
                onClick={() => void onSwitchWorkspace(membership.workspace.id)}
                variant={isActive ? "primary" : "secondary"}
              >
                {isActive ? "Active workspace" : "Set active"}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
