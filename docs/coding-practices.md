# PrepForge Coding Practices

This document defines the engineering rules for PrepForge. The goal is simple: keep the system scalable, readable, and easy to extend without turning the monorepo into a pile of tightly coupled apps and oversized files.

## Core Principles

### 1. Treat It Like a Platform, Not a Project

PrepForge is not a single app. It is a platform with multiple consumers:

- `apps/web`
- `apps/admin`
- `apps/api`
- `apps/mobile`

Shared logic must live in packages, not inside app folders. Apps should stay thin and focus on composition, delivery, and user-facing behavior.

### 2. Hard Rule: Apps Consume, Packages Provide

Apps are allowed to consume packages.
Packages must not depend on apps.

This is a non-negotiable boundary. If logic is reused by more than one app, it belongs in a package.

Examples of package-owned concerns:

- database client and schema
- shared types and validation
- AI orchestration
- API client
- auth contracts
- feature flags
- design tokens
- shared utilities

## Architecture Rules

### 3. Type Safety Across Everything

Type safety must exist across:

- API request and response contracts
- database models
- environment variables
- AI input and output payloads
- shared domain models between web, API, and mobile

Use:

- TypeScript everywhere
- Zod for runtime validation
- shared schemas in packages

Never trust unvalidated external input:

- request bodies
- query params
- uploaded file metadata
- AI model responses
- environment variables

### 4. Build System and Caching Are Critical

The repo must be optimized for fast local development and CI from the beginning.

Use:

- `Turborepo` for task orchestration and caching
- clear package boundaries
- incremental builds
- per-package scripts for `build`, `lint`, `test`, and `typecheck`

Rules:

- avoid circular dependencies between packages
- keep package public APIs explicit
- do not import deep internals across package boundaries
- configure cacheable tasks early
- keep slow tasks isolated so one app does not block the whole repo

### 5. Backend Modules Must Use Clear Layers

Do not dump logic into Express route files.

Each backend module should follow this structure:

```text
src/modules/<module-name>/
  controller/
  service/
  repository/
  schema/
  types/
```

Responsibilities:

- `controller`: HTTP mapping, auth checks, request parsing, response formatting
- `service`: business logic and orchestration
- `repository`: database access only
- `schema`: Zod validation for inputs and outputs
- `types`: module-local types when needed

Rules:

- controllers should stay thin
- services should not know about Express
- repositories should not contain business rules
- database queries should not leak into controllers

### 6. AI Must Live in a Dedicated Package

AI logic must not be scattered across apps or backend modules.

Create a dedicated package:

```text
packages/ai/
```

Suggested responsibilities:

- provider adapters
- prompt builders
- structured output parsing
- model routing
- rate limiting hooks
- token accounting
- retry and fallback policies
- evaluation helpers

Rules:

- app code should call AI through package APIs
- prompts should be versioned and organized
- AI outputs must be schema-validated
- provider switching should not require app rewrites

## UI and Design System

### 7. Build a UI System With Cross-Platform Thinking

Web and mobile should share logic, tokens, and conventions, but not force identical UI primitives.

Use:

- shared design tokens for colors, spacing, radii, typography, and motion
- shared package-level UI foundations where it makes sense
- `Next.js + Tailwind` for web
- `React Native` for mobile

Rules:

- share logic, not brittle platform-specific UI
- mobile may reuse domain logic and hooks, but not web-only components
- centralize tokens so visual changes do not require app-by-app edits

## Environment Management

### 8. No `.env` Chaos

Environment configuration must be predictable and validated.

Use:

- `.env.local` per app
- shared environment schema validation with Zod
- a small package or module for loading and validating env values

Rules:

- do not read raw `process.env` throughout the codebase
- validate env values at startup
- document required variables per app
- separate public and server-only variables clearly

## Testing Strategy

### 9. Test at the Right Level

Testing should be layered, fast, and targeted.

Use:

- `Vitest` for unit and integration tests
- `Playwright` for critical end-to-end flows

Strategy:

- unit tests: per package
- integration tests: per app
- E2E tests: only business-critical user journeys

Rules:

- do not rely on E2E tests to cover basic business logic
- prefer package-level tests for shared logic
- keep integration tests close to app boundaries
- reserve Playwright for critical flows such as auth, interview sessions, and resume upload

## Readability and File Size Rules

Large files become unclear, harder to review, and harder to change safely. Keep files focused.

Rules:

- one file should usually have one primary responsibility
- split files when they start mixing transport, business logic, persistence, and formatting
- prefer composition over giant utility files
- prefer feature folders over dumping unrelated code into shared directories

Soft limits:

- UI components: aim for under 250 lines
- route/controller files: aim for under 200 lines
- service files: aim for under 300 to 400 lines
- package entrypoints: keep minimal and explicit

If a file grows because it contains multiple concerns, split by concern first, not by arbitrary line count.

## Package Design Guidance

Suggested package layout:

```text
packages/
  ai/
  api-client/
  config/
  db/
  tokens/
  types/
  ui/
  utils/
```

Guidelines:

- `types` owns shared schemas and contracts
- `db` owns Prisma schema, migrations, and database access foundations
- `api-client` owns typed client logic used by web and mobile
- `config` can own shared env validation and configuration helpers
- `tokens` owns design tokens
- `ui` owns shared web UI primitives only where reuse is real and healthy

## Mistakes to Avoid

Do not allow these patterns into the codebase:

- tight coupling between apps
- no boundaries between packages
- copy-pasting instead of extracting shared logic
- AI logic scattered across routes, pages, and components
- weak or missing cache configuration
- giant files that hide multiple responsibilities
- direct database access from controllers
- raw unvalidated external input flowing into the system

## Default Decision Filter

When adding new code, ask:

1. Is this app-specific or package-worthy?
2. Is the boundary clear?
3. Is the input validated?
4. Is the type shared from the right place?
5. Will this make builds slower or coupling worse?
6. Is this file still readable six months from now?

If the answer is unclear, stop and refactor before adding more.
