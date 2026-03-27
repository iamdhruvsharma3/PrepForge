# Phase 1 Setup

## Summary

The PrepForge monorepo foundation is now in place. The repo was scaffolded with clear app/package boundaries, shared type-safe contracts, environment validation, an initial backend module structure, and thin app shells for web, admin, API, and mobile.

## What Was Done

- Set up the root workspace with `pnpm`, `Turborepo`, shared TypeScript config, and cacheable scripts.
- Created app shells for:
  - `apps/web`
  - `apps/admin`
  - `apps/api`
  - `apps/mobile`
- Created shared packages for:
  - `packages/ai`
  - `packages/api-client`
  - `packages/config`
  - `packages/db`
  - `packages/tokens`
  - `packages/types`
  - `packages/ui`
  - `packages/utils`
- Added shared Zod schemas and TypeScript contracts for health and interview session flows.
- Added shared environment parsing with validation so apps do not read raw env values everywhere.
- Added Prisma schema and Prisma client scaffolding in the DB package.
- Added the first API modules using the required layered structure:
  - `controller`
  - `service`
  - `repository`
- Added the AI orchestration boundary in `packages/ai` with a stub provider so AI logic stays centralized.
- Added initial token-driven UI foundations and thin starter screens for web, admin, and mobile.
- Added root documentation and coding standards:
  - `README.md`
  - `docs/coding-practices.md`

## Knowledge Transfer

### Architecture Baseline

- Apps consume packages.
- Packages provide reusable capabilities.
- Shared types live in `packages/types`.
- Shared env parsing lives in `packages/config`.
- Shared AI logic lives in `packages/ai`.
- Shared DB ownership lives in `packages/db`.

### Backend Pattern

The API already follows the required modular layering:

- controllers handle HTTP concerns
- services handle business logic
- repositories handle data access or retrieval boundaries

This pattern should be followed for every future backend module.

### Type Safety

- Zod is used for runtime validation.
- Shared contracts are exported from packages instead of being duplicated in apps.
- The API client validates responses against shared schemas.

### Frontend and Mobile Direction

- Web uses `Next.js`.
- Admin uses `Vite + React`.
- Mobile uses `Expo + React Native`.
- Tokens are centralized so visual changes can be made from one place.
- Logic should be shared across platforms where appropriate, but UI should not be forced to be identical.

### Versioning Note

The workspace was aligned on React 18 for compatibility across the current web, admin, and Expo/mobile setup. This avoids JSX and dependency conflicts during the foundation phase.

## Current Status

- Workspace scaffold is complete.
- Dependencies are installed.
- Prisma client generation is working.
- Strict workspace typecheck passes.
- Workspace build passes for the current build targets.
- Foundation phase is ready for real feature work.

## Next

The next recommended task is:

- implement auth and tenancy foundations

That should include:

- Better Auth integration
- user and session data model expansion
- workspace-aware request scoping
- tenant-safe API boundaries
