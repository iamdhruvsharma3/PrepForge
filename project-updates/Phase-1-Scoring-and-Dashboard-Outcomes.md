# Phase 1 Scoring and Dashboard Outcomes

## Summary

PrepForge now scores interview answers, carries those scores through persistence, and exposes the first dashboard outcomes view for the active workspace. The web app now shows score summaries, average scoring axes, and recent session trends instead of only raw history.

## What Was Done

- Expanded shared interview contracts in `packages/types` to support:
  - per-answer score objects
  - session-level overall score and score summary
  - dashboard summary metrics
  - dashboard trend items
- Extended `packages/ai` so answer review now returns:
  - feedback
  - next question
  - scoring axes for correctness, communication, depth, and overall
- Expanded the Prisma schema so `InterviewAnswer` stores:
  - `correctnessScore`
  - `communicationScore`
  - `depthScore`
- Expanded the interview repository to:
  - persist answer scores
  - compute per-session overall score
  - compute score averages across answers
  - aggregate dashboard summary and trend data for the active tenant
- Expanded the interview service and controller to support:
  - `GET /api/v1/interviews/dashboard`
- Expanded the shared API client with:
  - `getDashboard`
- Updated the protected web experience to show:
  - dashboard outcome cards
  - average score-axis bars
  - recent score trend rows
  - score badges in history
  - score summaries inside the active interview workspace

## Knowledge Transfer

### Scoring Boundary

Scoring remains centralized in `packages/ai`.

The API does not invent scores on its own. It receives reviewed output from the AI orchestration layer, persists it, and aggregates it. That keeps scoring logic in one place and avoids the exact “AI scattered everywhere” problem we wanted to avoid.

### Persistence Model

Scores are persisted at the answer level, not only at the interview level.

That decision matters because it gives us a clean path to:

- richer transcript analytics
- answer-level review UIs
- trend calculations over time
- future rubric changes without reshaping the whole interview model

### Dashboard Shape

The first dashboard intentionally stays small:

- total sessions
- active sessions
- completed sessions
- average overall score
- latest completed score
- recent session trend list
- average score axes

This is enough to validate the analytics model without overbuilding the dashboard too early.

### Frontend Structure

The signed-in experience is still split into focused panels instead of one oversized authenticated page:

- session/workspace context
- dashboard outcomes
- interview history
- interview workspace

That keeps the files readable and makes later dashboard growth safer.

## Current Status

- Answers now receive persisted scores.
- Session detail exposes score summaries.
- History exposes overall score.
- The API exposes tenant-scoped dashboard metrics.
- The web app renders dashboard summary cards and trends.
- Workspace typecheck passes.
- Workspace build passes.

## Next

The next recommended task is:

- resume ingestion and candidate profile grounding

That should include:

- resume upload storage flow
- parsing pipeline boundary
- candidate profile persistence
- interview personalization inputs wired from stored candidate context

## Verification

Verified with:

- `pnpm typecheck`
- `pnpm build`
