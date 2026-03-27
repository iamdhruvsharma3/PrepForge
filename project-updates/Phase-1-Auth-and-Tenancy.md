# Phase 1 Auth and Tenancy

## Summary

Better Auth is now integrated into PrepForge, and tenancy primitives are in place. Authentication lives behind a shared package boundary, workspace membership is modeled in the database, the API can resolve the active workspace from the authenticated session, and the web app has a minimal auth and workspace-switching surface.

## What Was Done

- Added a dedicated shared auth package:
  - `packages/auth`
- Added Better Auth server and client factories so apps consume auth through package APIs rather than importing framework internals directly.
- Expanded the Prisma schema to support:
  - Better Auth core tables
  - workspace memberships
  - user active workspace selection
- Updated the `User` model to support:
  - Better Auth fields
  - `activeWorkspaceId`
- Added `WorkspaceMember` with tenant roles:
  - `owner`
  - `admin`
  - `member`
- Added Better Auth bootstrap logic so new users automatically get:
  - a personal workspace
  - owner membership
  - active workspace assignment
- Added typed auth and tenancy contracts in `packages/types`.
- Added typed auth and workspace API client methods in `packages/api-client`.
- Integrated Better Auth into the API under:
  - `/api/v1/auth/*`
- Added identity/session context endpoint:
  - `/api/v1/identity/session-context`
- Added active workspace switching endpoint:
  - `/api/v1/workspaces/active`
- Added tenant resolution middleware for protected API flows.
- Protected interview session creation with authenticated tenant context.
- Added a minimal web auth surface that supports:
  - sign up
  - sign in
  - sign out
  - active workspace inspection
  - workspace switching

## Knowledge Transfer

### Auth Boundary

Auth is not wired directly inside apps. The shared package `packages/auth` is the boundary.

This package now provides:

- Better Auth server creation
- browser client creation
- React client creation
- node integration re-exports

That means future apps should depend on `@prepforge/auth`, not directly on Better Auth internals.

### Tenancy Model

PrepForge is now modeled for multi-workspace membership rather than a single `workspaceId` on the user record.

Core rules:

- a user can belong to multiple workspaces
- a user has one `activeWorkspaceId`
- request scoping should resolve tenant context from:
  - explicit workspace header when needed
  - otherwise the active workspace on the authenticated user

### Backend Pattern

New tenant-aware flows still follow the layered backend model:

- controller
- service
- repository

Even auth-adjacent custom endpoints such as session context and active workspace switching follow this structure.

### API Contract Direction

The interview session input no longer accepts workspace ID from the client body.

This is intentional.

Tenant selection should come from authenticated session context, not from arbitrary body input, otherwise tenant isolation becomes too easy to bypass accidentally.

### Web Surface

The web app is still a thin surface. It now demonstrates:

- Better Auth client usage
- typed API client usage
- authenticated session-context fetching
- workspace switching through typed endpoints

It is not yet a full product dashboard. It is a verified auth/tenancy foundation surface.

## Current Status

- Better Auth integration is wired into the API.
- Shared auth package exists and is reusable.
- Prisma schema reflects auth and workspace membership structure.
- Prisma client generation succeeds.
- Workspace typecheck passes.
- Workspace build passes.
- The web app has a minimal auth and workspace control surface.

## Next

The next recommended task is:

- real persistence for user interview sessions under tenant scope

That should include:

- saving created sessions to the database
- linking interviews to authenticated users and active workspaces
- replacing placeholder interview session startup with persisted records
- adding the first protected dashboard/history view

## Verification

Verified with:

- `pnpm install`
- `pnpm --filter @prepforge/db db:generate`
- `pnpm typecheck`
- `pnpm build`
