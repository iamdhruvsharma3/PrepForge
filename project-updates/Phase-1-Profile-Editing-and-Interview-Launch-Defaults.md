# Phase 1 Profile Editing and Interview Launch Defaults

## Summary

PrepForge now lets users edit the candidate profile directly after resume ingestion and launch interviews from an explicit profile-aware session form. The interview-start flow is no longer hidden behind a generic demo button.

## What Was Done

- Expanded shared profile contracts in `packages/types` to support:
  - direct candidate profile upserts
  - typed profile-save responses
- Expanded the profiles API module to support:
  - `POST /api/v1/profiles/me`
- Expanded the typed profiles client with:
  - `saveProfile`
- Added a dedicated editable profile form on web for:
  - target role
  - current company
  - headline
  - years of experience
  - summary
  - strengths
  - focus areas
  - resume highlights
- Added a new explicit interview launch panel that:
  - pre-fills role, company, difficulty, mode, and focus areas
  - derives defaults from the stored candidate profile
  - still lets the user adjust inputs before creating the session
- Simplified the history panel so it focuses on:
  - refresh
  - session list
  - session selection

## Knowledge Transfer

### Why This Matters

Resume ingestion alone is not enough. Extracted data is never perfect, so the product needs a clean correction path.

The new profile-save contract gives us that correction path without mixing manual edits into the resume-ingestion endpoint.

### Launch Flow Shape

Interview launch is now its own UI concern.

That matters because session setup has become a real product surface, not just a developer test hook. The user can now see and edit the launch defaults before creating the interview.

### Boundary Discipline

The responsibilities stay clean:

- profile extraction still lives in `packages/ai`
- profile persistence still lives in `apps/api/modules/profiles`
- launch-state UX lives in dedicated web components
- interview creation still consumes a typed `StartInterviewSessionInput`

This keeps the repo aligned with the `apps consume, packages provide` rule.

### Data Ownership

The server still owns candidate-profile context.

The client edits the canonical profile through a dedicated API contract, and interview creation continues to read stored profile data on the server side for grounding.

## Current Status

- Candidate profiles can be edited manually.
- Resume-derived fields can be corrected without re-ingesting a resume.
- Interview start defaults are visible and editable.
- History is no longer overloaded with session-creation concerns.
- Workspace typecheck passes.
- Workspace build passes.

## Next

The next recommended task is:

- resume workflow and file-ingestion polish

That should include:

- actual file-upload support instead of paste-only resume ingestion
- ingestion history view
- resume version awareness
- better parsing confidence and review UX

## Verification

Verified with:

- `pnpm typecheck`
- `pnpm build`
