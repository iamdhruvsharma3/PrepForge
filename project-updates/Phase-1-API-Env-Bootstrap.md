# Phase 1 API Env Bootstrap

## Summary

The API dev server env loading is now more robust, and a local `apps/api/.env.local` file was created so the service can start without immediately failing env validation.

## What Was Done

- Updated `apps/api/src/env.ts` to search for env files in both:
  - app-local execution context
  - repo-root execution context
- Added fallback loading for:
  - `.env.local`
  - `apps/api/.env.local`
  - `.env.local.example`
  - `apps/api/.env.local.example`
- Created `apps/api/.env.local` with local development defaults for:
  - API origin
  - CORS origins
  - Better Auth secret
  - local PostgreSQL database URL

## Knowledge Transfer

### Why This Was Needed

The API env parsing is strict by design. That is good, but it also means local dev fails immediately if the env file is missing or loaded from the wrong working directory.

Turbo and direct app execution can use different working directories, so env resolution should not rely on only one relative path.

### Local Dev Note

The API can now load local defaults, but the configured `DATABASE_URL` still expects a local PostgreSQL instance at:

- `postgresql://postgres:postgres@localhost:5432/prepforge?schema=public`

If that database is not running, startup may succeed but database-backed routes will still fail until Postgres is available or the URL is replaced with a real database.

## Current Status

- API env validation no longer depends on one fragile path assumption.
- Local API env defaults are present.
- Dev startup can proceed past the previous missing-env error.

## Next

- either start a local PostgreSQL instance or point `DATABASE_URL` at Neon
- then continue with the next product milestone
