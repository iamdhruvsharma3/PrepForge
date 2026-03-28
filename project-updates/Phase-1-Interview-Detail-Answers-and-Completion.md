# Phase 1 Interview Detail, Answers, and Completion

## Summary

PrepForge now has a real interview workflow beyond session creation. A user can open a persisted interview session, submit answers, receive saved feedback plus a follow-up question, and explicitly complete the session. The web app now has a protected interview workspace for this flow.

## What Was Done

- Expanded shared interview contracts in `packages/types` to support:
  - interview answer items
  - interview session detail
  - answer submission input
  - completion/detail responses
- Fixed the session ID contract so persisted interview IDs are no longer incorrectly treated as UUIDs.
- Extended `packages/ai` with answer-review orchestration so:
  - answer feedback is generated in the AI package
  - next-question generation is also centralized there
- Expanded the Prisma schema to support:
  - `InterviewAnswer`
  - interview `completedAt`
  - interview `updatedAt`
  - answer ordering per interview
- Expanded the interview repository to:
  - fetch tenant-scoped interview detail
  - create persisted answers
  - mark sessions completed
  - map DB records into shared detail contracts
- Expanded the interview service to support:
  - session detail retrieval
  - answer submission
  - session completion
- Added protected API endpoints for:
  - `GET /api/v1/interviews/:interviewId`
  - `POST /api/v1/interviews/:interviewId/answers`
  - `POST /api/v1/interviews/:interviewId/complete`
- Expanded the shared API client to support:
  - `getSessionDetail`
  - `submitAnswer`
  - `completeSession`
- Added a new protected web panel for interview execution and review:
  - current question
  - answer composer
  - saved answer timeline
  - follow-up questions
  - session completion
- Made persisted sessions selectable from history so the web app now has:
  - session context
  - history
  - active interview workspace

## Knowledge Transfer

### Workflow Shape

The product flow is now:

1. create session
2. open session detail
3. submit answer
4. persist feedback and next question
5. repeat
6. complete session

This is the first version of the actual mock interview loop.

### AI Boundary

Answer feedback and next-question generation were intentionally added to `packages/ai`.

This keeps the API layer focused on orchestration and persistence, not prompt logic.

### Persistence Model

Interview answers are now their own records instead of being embedded into the interview row.

That matters because it keeps the system extensible for:

- per-answer scoring
- transcript chunks
- richer analytics
- detailed answer review pages

### Tenant Boundary

Interview detail, answer submission, and completion all remain tenant-scoped.

That means a user can only read or mutate interview sessions that belong to:

- the authenticated user
- the active workspace context

### Frontend Structure

The protected web experience stays split into focused components:

- history list
- interview workspace
- access/session orchestration

This keeps the file sizes under control and avoids mixing auth, history, and answer-writing concerns into one large component.

## Current Status

- Interview sessions can be opened individually.
- Answers are persisted.
- Feedback is persisted.
- Follow-up questions are persisted.
- Sessions can be completed.
- Workspace typecheck passes.
- Workspace build passes.

## Next

The next recommended task is:

- richer scoring and dashboard outcomes

That should include:

- per-answer scoring dimensions
- overall interview score
- dashboard summary cards
- improvement trends across sessions

## Verification

Verified with:

- `pnpm --filter @prepforge/db db:generate`
- `pnpm typecheck`
- `pnpm build`

