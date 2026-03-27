# PrepForge

PrepForge is an AI-powered interview practice platform built as a monorepo. The current foundation focuses on package boundaries, type-safe contracts, clean backend layering, and a dedicated AI package so future features do not get trapped inside app-local code.

## Workspace Structure

```text
prepforge/
├── apps/
│   ├── admin/   # Internal operations dashboard (Vite + React)
│   ├── api/     # Backend API (Express + TypeScript)
│   ├── mobile/  # Mobile app shell (Expo + React Native)
│   └── web/     # Consumer product surface (Next.js)
├── docs/
│   └── coding-practices.md
├── packages/
│   ├── ai/         # Centralized AI orchestration and prompt surfaces
│   ├── api-client/ # Typed client used by apps
│   ├── auth/       # Better Auth server/client factories
│   ├── config/     # Shared env parsing and config helpers
│   ├── db/         # Prisma schema and database client
│   ├── tokens/     # Design tokens shared across platforms
│   ├── types/      # Shared Zod schemas and TypeScript contracts
│   ├── ui/         # Shared web UI components
│   └── utils/      # Low-level helpers
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── turbo.json
```

## Principles

- Apps consume packages. Packages provide reusable capability.
- Shared types and validation live in packages, not scattered across apps.
- Backend code follows `controller -> service -> repository`.
- AI logic stays inside `packages/ai`.
- Large files are split by responsibility before they become hard to review.

See [docs/coding-practices.md](./docs/coding-practices.md) for the full working agreement.

## Current Foundation

- `apps/api` exposes typed `health` and `interviews` routes.
- `packages/types` owns the shared interview and health schemas.
- `packages/ai` owns the interview orchestration boundary.
- `packages/auth` owns the authentication integration surface.
- `packages/tokens` owns shared design tokens for web and mobile.
- `apps/web`, `apps/admin`, and `apps/mobile` are thin shells that consume shared packages.

## Next Implementation Steps

1. Install dependencies and generate the Prisma client.
2. Add Better Auth and workspace-aware tenancy to the API.
3. Replace the AI stub with the first real provider integration.
4. Connect the web app to the typed API client and start the real interview flow.
