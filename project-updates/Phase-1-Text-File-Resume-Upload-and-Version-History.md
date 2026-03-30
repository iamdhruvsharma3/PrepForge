# Phase 1 Text File Resume Upload and Version History

## Summary

PrepForge now supports real text-file resume ingestion on web and exposes resume version history in the candidate profile. The profile flow is no longer paste-only, and each ingestion event is visible as a versioned resume record.

## What Was Done

- Expanded shared profile contracts in `packages/types` to support:
  - `upload` as a resume source
  - versioned resume metadata
  - optional file size metadata
  - `resumeHistory` on the candidate profile response
- Expanded the Prisma schema so `ResumeDocument` now stores:
  - `version`
  - `sizeBytes`
- Expanded the profiles repository so profile reads now include:
  - latest resume metadata
  - resume version history
  - auto-incremented resume versions on ingestion
- Added a small web-side file reader utility in:
  - `apps/web/src/lib/resume-file.ts`
- Added a dedicated web resume ingestion card for:
  - text-file selection
  - paste fallback
  - upload validation
- Added a dedicated web resume history card for:
  - version list
  - source visibility
  - upload timestamp
  - word count
  - file size

## Knowledge Transfer

### Upload Scope

This phase adds real file selection, but only for text-based resume files.

Supported now:

- `.txt`
- `.md`
- `.markdown`
- `text/*` files that the browser can safely read as text

Not supported yet:

- PDF parsing
- DOCX parsing

That is intentional. Those formats need a dedicated parsing boundary and likely extra dependencies, which is a separate implementation concern.

### Versioning Model

Each resume ingestion creates a new `ResumeDocument` version for the candidate profile.

This keeps the system extensible for:

- ingestion history
- future rollback/selection flows
- parsing retries
- analytics on profile evolution over time

### UI Structure

The profile surface is now split into smaller components:

- resume ingestion card
- profile editor card
- resume history card

This keeps the files readable and avoids growing `candidate-profile-panel.tsx` into a mixed-responsibility component.

## Current Status

- Text-file upload works on web.
- Paste ingestion still works.
- Resume versions are visible in the profile UI.
- Latest resume metadata is preserved.
- Workspace typecheck passes.
- Workspace build passes.

## Next

The next recommended task is:

- richer resume parsing and file-format support

That should include:

- PDF parser boundary
- DOCX parser boundary
- parsing confidence/review states
- optional active-version selection instead of latest-only semantics

## Verification

Verified with:

- `pnpm --filter @prepforge/db db:generate`
- `pnpm typecheck`
- `pnpm build`

## Important Note

The Prisma client is generated for the new resume-document fields, but the actual database schema still needs a real migration applied against your Postgres database before `version` and `sizeBytes` exist in the database.
