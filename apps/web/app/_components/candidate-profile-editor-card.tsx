"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type {
  CandidateProfile,
  UpsertCandidateProfileInput,
} from "@prepforge/types";

type CandidateProfileEditorCardProps = {
  disabled: boolean;
  onSaveProfile: (input: UpsertCandidateProfileInput) => Promise<void>;
  profile: CandidateProfile | null;
};

type CandidateProfileDraftState = {
  currentCompany: string;
  focusAreas: string;
  headline: string;
  resumeHighlights: string;
  strengths: string;
  summary: string;
  targetRole: string;
  yearsExperience: string;
};

export function CandidateProfileEditorCard({
  disabled,
  onSaveProfile,
  profile,
}: CandidateProfileEditorCardProps) {
  const [draft, setDraft] = useState<CandidateProfileDraftState>(() =>
    createDraftState(profile),
  );

  useEffect(() => {
    setDraft(createDraftState(profile));
  }, [profile]);

  async function handleSubmit() {
    await onSaveProfile(buildProfileInput(draft));
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Editable profile
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {draft.targetRole || "Shape the candidate profile manually"}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          {profile?.latestResume
            ? `Last resume: ${profile.latestResume.fileName}`
            : "Manual profile is supported too"}
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            disabled={disabled}
            label="Target role"
            onChange={(value) => updateDraft(setDraft, "targetRole", value)}
            placeholder="Senior Frontend Engineer"
            value={draft.targetRole}
          />
          <Field
            disabled={disabled}
            label="Current company"
            onChange={(value) => updateDraft(setDraft, "currentCompany", value)}
            placeholder="Acme"
            value={draft.currentCompany}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
          <Field
            disabled={disabled}
            label="Headline"
            onChange={(value) => updateDraft(setDraft, "headline", value)}
            placeholder="Frontend platform engineer focused on resilient UI systems"
            value={draft.headline}
          />
          <Field
            disabled={disabled}
            label="Years of experience"
            onChange={(value) => updateDraft(setDraft, "yearsExperience", value)}
            placeholder="6"
            type="number"
            value={draft.yearsExperience}
          />
        </div>

        <TextAreaField
          disabled={disabled}
          label="Summary"
          minHeightClassName="min-h-28"
          onChange={(value) => updateDraft(setDraft, "summary", value)}
          placeholder="Summarize the candidate's background, strengths, and the style of interview PrepForge should bias toward."
          value={draft.summary}
        />

        <div className="grid gap-3 lg:grid-cols-3">
          <TextAreaField
            disabled={disabled}
            helperText="One item per line."
            label="Strengths"
            minHeightClassName="min-h-36"
            onChange={(value) => updateDraft(setDraft, "strengths", value)}
            placeholder="React&#10;TypeScript&#10;Testing"
            value={draft.strengths}
          />
          <TextAreaField
            disabled={disabled}
            helperText="One item per line."
            label="Focus areas"
            minHeightClassName="min-h-36"
            onChange={(value) => updateDraft(setDraft, "focusAreas", value)}
            placeholder="system design&#10;behavioral storytelling&#10;performance optimization"
            value={draft.focusAreas}
          />
          <TextAreaField
            disabled={disabled}
            helperText="One item per line."
            label="Resume highlights"
            minHeightClassName="min-h-36"
            onChange={(value) => updateDraft(setDraft, "resumeHighlights", value)}
            placeholder="Reduced checkout latency by 38%&#10;Led migration to typed UI platform"
            value={draft.resumeHighlights}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-5 text-slate-400">
            Saving here updates the canonical candidate profile for the active workspace. Future interview sessions read these values server-side.
          </p>
          <button
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onClick={() => void handleSubmit()}
            type="button"
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "number" | "text";
  value: string;
};

function Field({
  disabled,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label>
      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <input
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

type TextAreaFieldProps = {
  disabled: boolean;
  helperText?: string;
  label: string;
  minHeightClassName: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
};

function TextAreaField({
  disabled,
  helperText,
  label,
  minHeightClassName,
  onChange,
  placeholder,
  value,
}: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</span>
      {helperText ? <span className="ml-2 text-xs text-slate-500">{helperText}</span> : null}
      <textarea
        className={`mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-sm leading-6 text-white outline-none transition focus:border-cyan-300/40 ${minHeightClassName}`}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function createDraftState(profile: CandidateProfile | null): CandidateProfileDraftState {
  return {
    currentCompany: profile?.currentCompany ?? "",
    focusAreas: (profile?.focusAreas ?? []).join("\n"),
    headline: profile?.headline ?? "",
    resumeHighlights: (profile?.resumeHighlights ?? []).join("\n"),
    strengths: (profile?.strengths ?? []).join("\n"),
    summary: profile?.summary ?? "",
    targetRole: profile?.targetRole ?? "",
    yearsExperience:
      profile?.yearsExperience !== null && profile?.yearsExperience !== undefined
        ? String(profile.yearsExperience)
        : "",
  };
}

function buildProfileInput(
  draft: CandidateProfileDraftState,
): UpsertCandidateProfileInput {
  const yearsExperience = draft.yearsExperience.trim();

  return {
    currentCompany: normalizeNullableText(draft.currentCompany),
    focusAreas: parseList(draft.focusAreas, 8),
    headline: normalizeNullableText(draft.headline),
    resumeHighlights: parseList(draft.resumeHighlights, 6),
    strengths: parseList(draft.strengths, 8),
    summary: normalizeNullableText(draft.summary),
    targetRole: normalizeNullableText(draft.targetRole),
    yearsExperience: yearsExperience ? Number(yearsExperience) : null,
  };
}

function parseList(value: string, limit: number): string[] {
  return Array.from(
    new Set(
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, limit);
}

function normalizeNullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function updateDraft(
  setDraft: Dispatch<SetStateAction<CandidateProfileDraftState>>,
  key: keyof CandidateProfileDraftState,
  value: string,
) {
  setDraft((current) => ({
    ...current,
    [key]: value,
  }));
}
