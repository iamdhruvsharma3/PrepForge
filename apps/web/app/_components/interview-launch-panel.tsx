"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type {
  CandidateProfile,
  InterviewConfig,
  StartInterviewSessionInput,
} from "@prepforge/types";
import {
  interviewDifficultyValues,
  interviewModeValues,
} from "@prepforge/types";
import { Card } from "@prepforge/ui";

type InterviewLaunchPanelProps = {
  companyName: string | null;
  config: InterviewConfig | null;
  configError: string | null;
  disabled: boolean;
  onLaunch: (input: StartInterviewSessionInput) => Promise<void>;
  profile: CandidateProfile | null;
};

type LaunchDraft = {
  company: string;
  difficulty: StartInterviewSessionInput["difficulty"];
  focusAreas: string;
  mode: StartInterviewSessionInput["mode"];
  role: string;
};

export function InterviewLaunchPanel({
  companyName,
  config,
  configError,
  disabled,
  onLaunch,
  profile,
}: InterviewLaunchPanelProps) {
  const [draft, setDraft] = useState<LaunchDraft>(() =>
    createLaunchDraft(profile, companyName),
  );

  useEffect(() => {
    setDraft(createLaunchDraft(profile, companyName));
  }, [companyName, profile]);

  const suggestedFocusAreas =
    profile?.focusAreas.length && profile.focusAreas.length > 0
      ? profile.focusAreas
      : (config?.focusAreas ?? []);

  async function handleLaunch() {
    const focusAreas = parseFocusAreas(draft.focusAreas);
    const payload: StartInterviewSessionInput = {
      difficulty: draft.difficulty,
      focusAreas,
      mode: draft.mode,
      role: draft.role.trim(),
      ...(draft.company.trim() ? { company: draft.company.trim() } : {}),
    };

    await onLaunch(payload);
  }

  return (
    <Card className="rounded-[var(--pf-radius-lg)] border-white/15 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Interview Launch
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Start from the candidate profile, not a generic demo.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {configError ??
              "Defaults are prefilled from the active workspace and candidate profile. The server still injects stored profile context when the session is created."}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {profile?.targetRole
            ? `Grounded by ${profile.targetRole}`
            : "No stored target role yet"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              disabled={disabled}
              label="Role"
              onChange={(value) => updateDraft(setDraft, "role", value)}
              placeholder="Frontend Engineer"
              value={draft.role}
            />
            <Field
              disabled={disabled}
              label="Target company"
              onChange={(value) => updateDraft(setDraft, "company", value)}
              placeholder="Acme"
              value={draft.company}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              disabled={disabled}
              label="Difficulty"
              onChange={(value) =>
                updateDraft(
                  setDraft,
                  "difficulty",
                  value as LaunchDraft["difficulty"],
                )
              }
              options={config?.difficultyLevels ?? [...interviewDifficultyValues]}
              value={draft.difficulty}
            />
            <SelectField
              disabled={disabled}
              label="Mode"
              onChange={(value) =>
                updateDraft(setDraft, "mode", value as LaunchDraft["mode"])
              }
              options={config?.modes ?? [...interviewModeValues]}
              value={draft.mode}
            />
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Focus areas
            </span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-6 text-white outline-none transition focus:border-cyan-300/40"
              disabled={disabled}
              onChange={(event) => updateDraft(setDraft, "focusAreas", event.target.value)}
              placeholder="system design, behavioral storytelling, testing strategy"
              value={draft.focusAreas}
            />
          </label>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Recommended defaults
          </p>
          <div className="mt-4 grid gap-4 text-sm text-slate-200">
            <p>
              Role default: <span className="font-medium text-white">{draft.role}</span>
            </p>
            <p>
              Difficulty default:{" "}
              <span className="font-medium text-white">{draft.difficulty}</span>
            </p>
            <p>
              Mode default: <span className="font-medium text-white">{draft.mode}</span>
            </p>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Suggested focus areas
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedFocusAreas.length > 0 ? (
                  suggestedFocusAreas.map((item) => (
                    <button
                      className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-60"
                      disabled={disabled}
                      key={item}
                      onClick={() => insertFocusArea(setDraft, item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-300">
                    Add a candidate profile or type focus areas manually.
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            className="mt-6 w-full rounded-full bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled || draft.role.trim().length < 2}
            onClick={() => void handleLaunch()}
            type="button"
          >
            Launch interview session
          </button>
        </div>
      </div>
    </Card>
  );
}

type FieldProps = {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
};

function Field({ disabled, label, onChange, placeholder, value }: FieldProps) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <input
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

type SelectFieldProps = {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
};

function SelectField({
  disabled,
  label,
  onChange,
  options,
  value,
}: SelectFieldProps) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <select
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function createLaunchDraft(
  profile: CandidateProfile | null,
  companyName: string | null,
): LaunchDraft {
  return {
    company: companyName ?? "",
    difficulty: suggestDifficulty(profile?.yearsExperience ?? null),
    focusAreas: (profile?.focusAreas ?? [
      "system design",
      "behavioral storytelling",
    ]).join(", "),
    mode: "text",
    role: profile?.targetRole ?? "Frontend Engineer",
  };
}

function suggestDifficulty(
  yearsExperience: number | null,
): StartInterviewSessionInput["difficulty"] {
  if (yearsExperience === null) {
    return "intermediate";
  }

  if (yearsExperience >= 7) {
    return "advanced";
  }

  if (yearsExperience >= 2) {
    return "intermediate";
  }

  return "foundation";
}

function parseFocusAreas(value: string): string[] {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return ["system design", "behavioral storytelling"];
  }

  return Array.from(new Set(items)).slice(0, 5);
}

function insertFocusArea(
  setDraft: Dispatch<SetStateAction<LaunchDraft>>,
  value: string,
) {
  setDraft((current) => {
    const next = Array.from(new Set([...parseFocusAreas(current.focusAreas), value]));
    return {
      ...current,
      focusAreas: next.join(", "),
    };
  });
}

function updateDraft(
  setDraft: Dispatch<SetStateAction<LaunchDraft>>,
  key: keyof LaunchDraft,
  value: string,
) {
  setDraft((current) => ({
    ...current,
    [key]: value,
  }));
}
