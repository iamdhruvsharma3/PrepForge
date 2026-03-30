# Phase 1 Resume Parse State and Active Version Selection

## Summary

PrepForge now tracks resume parsing quality and lets the user choose which resume version is active for interview grounding. Resume history is no longer just a log of uploads; it now controls the canonical resume context used by the profile.

## What Was Done

- Expanded shared profile contracts in `packages/types` to support:
  - resume parse status
  - parser confidence
  - parser warnings
  - parser metadata
  - `activeResumeId`
  - explicit active-resume selection input/output
- Expanded the Prisma schema so `CandidateProfile` and `ResumeDocument` now support:
  - active resume selection
  - parse status
  - parse confidence
  - parser name/version
  - parse warnings
- Upgraded the resume parser boundary in `packages/ai` so resume parsing now returns:
  - extracted profile context
  - parser status
  - parser confidence
  - parse warnings
- Expanded the profiles API module to support:
  - `POST /api/v1/profiles/active-resume`
- Expanded the profiles repository so:
  - ingested resumes persist parser metadata
  - the active resume is explicit instead of implicit
  - selecting an older resume reparses it and reapplies that resume to the canonical profile
- Expanded the web resume history surface so users can:
  - see parser quality state
  - see parser warnings
  - switch the active resume version

## Knowledge Transfer

### Why Active Resume Matters

Without an active-resume concept, version history is only cosmetic.

Now the system has a clear rule:

- one candidate profile per tenant
- many resume versions
- one active resume version that defines the canonical resume-backed profile context

### Parser-State Semantics

Resume parsing is still synchronous, but it is no longer opaque.

Each resume document now carries:

- parse status
- confidence score
- parser identity
- warnings

That gives us a clean bridge to future async parsing, retry workflows, and human review states.

### Selection Behavior

Choosing an older resume version is not just a UI toggle.

When a user selects a resume version as active, PrepForge reparses that version and reapplies the parsed result to the canonical candidate profile. That makes the selection meaningful for later interview generation.

### Boundary Discipline

The parser logic still lives in `packages/ai`.

The profiles module owns:

- storage
- active selection
- tenant enforcement
- profile updates

The web app only drives the typed API contracts.

## Current Status

- Resume documents now expose parse status and confidence.
- Resume documents can carry warnings for manual review.
- The active resume version is explicit.
- Users can switch active resume versions from the UI.
- Workspace typecheck passes.
- Workspace build passes.

## Next

The next recommended task is:

- broader parser support and review workflows

That should include:

- PDF parser boundary
- DOCX parser boundary
- explicit parse-failed review UX
- optional side-by-side comparison between resume versions before activation

## Verification

Verified with:

- `pnpm --filter @prepforge/db db:generate`
- `pnpm typecheck`
- `pnpm build`

## Important Note

The Prisma client is generated for the new active-resume and parse-state fields, but the actual database schema still needs a real migration applied against your Postgres database before those fields exist in the database.
