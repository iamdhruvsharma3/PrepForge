# Phase 1 Resume Ingestion and Candidate Grounding

## Summary

PrepForge now has a tenant-scoped candidate profile flow. A signed-in user can paste resume text, store a parsed profile for the active workspace, and use that stored profile to ground future interview session generation.

## What Was Done

- Added shared profile contracts in `packages/types` for:
  - candidate profile context
  - latest resume metadata
  - resume ingestion input/output
- Expanded the Prisma schema with:
  - `CandidateProfile`
  - `ResumeDocument`
  - user/workspace relations for tenant-scoped profile ownership
- Added a dedicated profile extraction orchestrator in `packages/ai`:
  - resume text normalization
  - role detection
  - years-of-experience extraction
  - strengths extraction
  - interview focus-area mapping
  - resume-highlight extraction
- Added a new API module at `apps/api/src/modules/profiles` with:
  - controller
  - service
  - repository
- Added protected profile endpoints for:
  - `GET /api/v1/profiles/me`
  - `POST /api/v1/profiles/resume`
- Added a typed profile client in `packages/api-client`.
- Updated interview session creation so stored candidate profile context is injected into the interview orchestration prompt.
- Added a new protected web panel for:
  - resume text ingestion
  - extracted profile review
  - latest resume metadata

## Knowledge Transfer

### Boundary Shape

Resume ingestion is intentionally isolated in the new `profiles` module.

That keeps the system clean:

- `packages/ai` handles extraction logic
- `apps/api/modules/profiles` handles persistence and tenant enforcement
- `apps/api/modules/interviews` only consumes profile context when it needs interview personalization

This avoids coupling resume parsing directly into interview routes.

### Tenant Scope

Candidate profiles are unique per `(userId, workspaceId)`.

That means the same user can eventually maintain different prep profiles across different workspaces without leaking state between them.

### Storage Shape

The system stores:

- one canonical `CandidateProfile` per tenant context
- one `ResumeDocument` record per ingestion event

This gives us a clean upgrade path for:

- versioned resumes
- future storage-provider integration
- parsing retries
- richer ingestion history

### Interview Personalization

Interview creation does not ask the client to send profile data back.

Instead, the API reads the stored candidate profile for the active workspace and passes that into the interview orchestrator. That keeps the profile as server-owned context instead of trusting the client to resend it.

### Current Parsing Quality

Resume extraction is heuristic right now, even though it lives in `packages/ai`.

That is deliberate for this phase:

- no provider lock-in yet
- deterministic local behavior
- clean place to swap in a real LLM or structured parser later

## Current Status

- Candidate profile retrieval works.
- Resume ingestion works with pasted resume text.
- Parsed strengths, focus areas, summary, and highlights are persisted.
- Interview session creation now consumes stored candidate context.
- Workspace typecheck passes.
- Workspace build passes.

## Next

The next recommended task is:

- richer interview personalization and resume workflow polish

That should include:

- editable candidate profile fields
- real file-upload/storage integration
- ingestion history view
- using profile context in session defaults and dashboard recommendations

## Verification

Verified with:

- `pnpm --filter @prepforge/db db:generate`
- `pnpm typecheck`
- `pnpm build`

## Important Note

The Prisma client is generated for the new profile models, but the actual database schema still needs a real migration applied against your Postgres database before these tables exist outside local code generation.
