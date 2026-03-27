"use client";

import { Button, Card } from "@prepforge/ui";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  disabled: boolean;
  email: string;
  mode: AuthMode;
  name: string;
  onEmailChange: (value: string) => void;
  onModeChange: (mode: AuthMode) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  password: string;
  statusMessage: string | null;
};

export function AuthForm({
  disabled,
  email,
  mode,
  name,
  onEmailChange,
  onModeChange,
  onNameChange,
  onPasswordChange,
  onSubmit,
  password,
  statusMessage,
}: AuthFormProps) {
  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Access</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {mode === "sign-up" ? "Create your workspace" : "Resume your prep"}
          </h2>
        </div>
        <div className="flex rounded-full border border-white/10 bg-slate-950/50 p-1">
          {(["sign-up", "sign-in"] as const).map((entry) => (
            <button
              className={`rounded-full px-4 py-2 text-sm transition ${
                entry === mode
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
              key={entry}
              onClick={() => onModeChange(entry)}
              type="button"
            >
              {entry === "sign-up" ? "Sign up" : "Sign in"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {mode === "sign-up" ? (
          <label className="grid gap-2 text-sm text-slate-200">
            Name
            <input
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Asha Singh"
              value={name}
            />
          </label>
        ) : null}

        <label className="grid gap-2 text-sm text-slate-200">
          Email
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300"
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="asha@example.com"
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-200">
          Password
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300"
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="At least 8 characters"
            type="password"
            value={password}
          />
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          className="w-full justify-center"
          disabled={disabled}
          onClick={() => void onSubmit()}
        >
          {disabled
            ? "Working..."
            : mode === "sign-up"
              ? "Create account"
              : "Sign in"}
        </Button>
      </div>

      <p className="mt-4 min-h-6 text-sm text-slate-300">
        {statusMessage ??
          "Signing up creates a personal workspace automatically and sets it active for the session."}
      </p>
    </Card>
  );
}

