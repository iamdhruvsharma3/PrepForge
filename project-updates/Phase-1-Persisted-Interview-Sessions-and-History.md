# Phase 1 Persisted Interview Sessions and History

## Summary

Interview session creation is now persisted to the database under authenticated tenant scope, and the web app has its first protected history/dashboard view for signed-in users.

## What Was Done

- Expanded shared interview contracts in `packages/types` to support:
  - interview status
  - persisted history items
  - typed history responses
- Expanded the shared API client in `packages/api-client` to support:
  - `getHistory`
  - existing `startSession` against persisted records
- Updated the interview repository to:
  - create interview records in Prisma
  - fetch recent tenant-scoped interview history
- Updated the interview service to:
  - persist interview sessions
  - return the real database record ID as the session ID
  - return typed history data
- Updated the interview controller to expose:
  - `GET /api/v1/interviews/history`
  - `POST /api/v1/interviews/sessions` with tenant context
- Kept interview creation protected by workspace-aware tenant middleware.
- Added a protected web history panel that:
  - fetches tenant-scoped interview history
  - creates a demo interview session
  - refreshes history after session creation
- Kept the signed-in surface split into small components for readability:
  - auth/session context card
  - interview history card
  - orchestrating access panel

## Knowledge Transfer

### Persistence Rule

Interview sessions are no longer just generated in memory.

They now write to Prisma through the interview repository, and the returned `sessionId` is the actual database record ID.

### Tenant Safety

The history endpoint and session creation endpoint both rely on resolved tenant context.

That means:

- the authenticated user must belong to the active workspace
- the workspace scope comes from session context
- clients do not send workspace ID in the interview creation body

This is an important safety boundary and should stay that way.

### Web Dashboard Direction

The first protected dashboard surface now exists inside the signed-in web state.

It currently focuses on:

- active workspace context
- persisted interview history
- creating a demo interview session

This is intentionally narrow and validates the authenticated product loop before a larger dashboard is built.

### File Size / Readability

The web dashboard was kept split into focused components instead of turning the signed-in view into one large file.

Current structure:

- `access-panel` orchestrates state and calls
- `session-context-card` renders auth/workspace state
- `interview-history-panel` renders persisted history

## Current Status

- Interview sessions persist to the database layer.
- Interview history is available through a protected typed API.
- Signed-in web users can trigger and view persisted sessions.
- Workspace typecheck passes.
- Workspace build passes.

## Next

The next recommended task is:

- move from demo session persistence into real interview session workflow

That should include:

- answer/transcript persistence
- interview detail view
- per-session progress or completion flow
- first dashboard metrics summary

## Verification

Verified with:

- `pnpm typecheck`
- `pnpm build`
