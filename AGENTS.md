# EduBridge — AI Agent & Developer Guidelines

## 1. Project Overview

EduBridge is a **national-scale, multi-tenant school management platform** built as a `pnpm` monorepo:

| App | Stack |
| :--- | :--- |
| **`apps/api`** | Express 5, TypeScript, Prisma 7 (PostgreSQL), Zod, JWT, RBAC, Redis (`ioredis`), Backblaze B2 (AWS S3 SDK) |
| **`apps/web`** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query v5, Zustand, React Hook Form + Zod |

---

## 2. Essential Commands

```bash
# Development
pnpm dev                  # Run both api and web in parallel
pnpm api:dev              # Run api only (tsx watch)
pnpm web:dev              # Run web only (Next.js)

# Verification — run BEFORE marking any task complete
pnpm typecheck            # Strict typecheck across all packages
pnpm lint                 # Lint all packages
pnpm build                # Full production build verification

# Database (Prisma — run from root)
pnpm db:generate          # Regenerate Prisma client after schema change
pnpm db:migrate           # Apply new migration (dev only)
pnpm db:validate          # Validate schema.prisma syntax
```

---

## 3. Multi-Tenancy & Security (CRITICAL — Non-Negotiable)

### 3.1. Zero-Trust Tenant Isolation
- **Every** database query and mutation targeting tenant data **must** explicitly filter by `tenantId` or `institutionId`.
- **Always** extract the tenant identity from the authenticated JWT session context (`req.user.tenantId`). Never trust unverified client-supplied tenant IDs from request bodies or query strings.
- Apply proper pagination (`page`, `limit`) and index-backed `orderBy` on every list/search endpoint — the platform must handle massive national-scale rosters without performance degradation.

### 3.2. RBAC & Authentication
- All protected routes must bind `authenticate` middleware and the appropriate `requireRoles(...)` or `requirePermission(action, resource)` guard **before** reaching the controller.
- Permission checks are cached in Redis (`RedisKeys.permission.userPermissions`) for 300 seconds — do not bypass or duplicate this caching logic.
- `SYSTEM_ADMIN` role is a global bypass; all other roles go through tenant-scoped membership validation.

### 3.3. Sensitive Data
- Never return passwords, tokens, or internal secrets in API responses.
- Always use Prisma `select` projections to strip sensitive fields from query results.

---

## 4. Architecture & Directory Structure

### 4.1. Backend — `apps/api/src/`

```
src/
├── modules/<domain>/           # One folder per domain (academic, provisioning, auth…)
│   ├── <domain>.route.ts       # Router: middleware chain (auth → RBAC → validate), no business logic
│   ├── <domain>.doc.ts         # Swagger/OpenAPI specification for this domain
│   ├── controllers/            # Unbox req, call service, format JSON response
│   ├── services/               # Business logic, transactions (prisma.$transaction), throw errors
│   ├── repository/             # Prisma queries only — all DB access lives here
│   ├── schemas/                # Zod validation schemas (request DTOs)
│   └── types/                  # Domain TypeScript interfaces and types
├── middleware/                  # auth.ts, rbac.ts, validate.ts, error-handler.ts, rate-limiter.ts
├── shared/
│   ├── exceptions/             # Typed error classes: AppError, BadRequestError, NotFoundError…
│   ├── utils/                  # Pure utility functions: async-handler, generators, file-upload…
│   ├── constants/              # Shared numeric/string constants
│   └── enums/                  # Shared TypeScript enums
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── redis.ts                # ioredis client singleton
│   ├── redis.keys.ts           # Centralised Redis key factory (RedisKeys)
│   └── storage/
│       ├── b2.storage.ts       # Backblaze B2 S3-compatible upload/delete adapter
│       └── storage.service.ts  # Storage abstraction used by modules
└── config/                     # env.ts, cors.ts, security.ts
```

**Layering rules:**
- `*.route.ts` → middleware wiring only. No logic.
- `controllers/` → parse request, call service, return `{ success, data, pagination }`. No Prisma.
- `services/` → business rules, validation logic, transaction orchestration. Throw typed errors.
- `repository/` → Prisma queries only. Use `select` to project fields. Always scope by `tenantId`.

### 4.2. Frontend — `apps/web/src/`

```
src/
├── app/                        # Next.js App Router pages and layouts (Server Components by default)
├── features/<domain>/          # One folder per feature domain
│   ├── components/             # Feature-scoped UI components
│   ├── hooks/                  # TanStack Query hooks: use[Entity]Query, use[Action]Mutation
│   ├── services/               # Axios API client functions
│   └── types/                  # Domain TypeScript interfaces
├── components/                 # Globally shared, domain-agnostic UI components
├── stores/                     # Zustand global UI state stores
├── lib/                        # Utility functions, axios config
├── providers/                  # React context providers (QueryClient, Theme…)
└── config/                     # App-level config (routes, constants)
```

**State ownership:**
- **Server/async state** → TanStack Query (`use[Entity]Query` / `use[Action]Mutation`)
- **Global UI state** → Zustand (`src/stores/`)
- **Form state** → React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Component-local state** → `useState` / `useReducer`

**Component boundaries:**
- Default to Server Components in `src/app/`. Add `'use client'` only when lifecycle hooks, browser APIs, or interactive state are genuinely required.

---

## 5. Storage — Backblaze B2 (Mandatory)

- All file operations (profile photos, qualification documents, bulk import templates, credential exports) **must** use `apps/api/src/lib/storage/b2.storage.ts` or the `storage.service.ts` abstraction.
- **Strictly forbidden**: Do not introduce Cloudinary, S3 direct calls outside the adapter, or any unapproved storage provider.

---

## 6. Error Handling Standard

Use typed exceptions from `src/shared/exceptions/`:

| Class | HTTP | When to Use |
| :--- | :---: | :--- |
| `BadRequestError` | 400 | Invalid input that passed Zod but fails business rules |
| `UnauthorizedError` | 401 | Missing or invalid authentication |
| `ForbiddenError` | 403 | Authenticated but lacks permission |
| `NotFoundError` | 404 | Record does not exist (in tenant scope) |
| `ConflictError` | 409 | Unique constraint or state conflict |
| `ValidationError` | 422 | Programmatic validation failure |
| `InternalServerError` | 500 | Unexpected failures |

The global `errorHandler` middleware handles all of the above plus Zod and Prisma errors (`P2002`, `P2025`). Never return raw error objects directly from controllers.

---

## 7. Engineering Principles (Non-Negotiable)

### 7.1. Code Quality
1. **Zero `any` types** — Use explicit interfaces, `z.infer<typeof schema>`, or `unknown` + type narrowing.
2. **Zero `console.log`** — No debug statements in production code.
3. **No unused imports or variables** — Keep code clean; enforced by `eslint-plugin-unused-imports`.
4. **Strictly use existing dependencies** — Do not add unfamiliar or redundant third-party libraries without explicit requirement.

### 7.2. Design Principles
- **SOLID**: Each module, class, and function has a single, clearly-defined responsibility.
- **DRY**: Extract genuinely shared logic into `shared/utils/` or `shared/` — not per-module duplicates.
- **YAGNI**: Build exactly what is required. No speculative abstractions, no premature generalisations.
- **No boilerplate**: Write concise, high-density code. Avoid wrapper classes or factory functions that add no value.

### 7.3. Zero Blast Radius
- **Never break working features** — All existing functionality must remain intact after every change.
- **Never touch unrelated files** — Confine modifications strictly to the files required for the task.
- **Never scatter code** — Do not create ad-hoc files or folders outside the established structure.

### 7.4. Database Safety
- Never edit applied migration files under `prisma/migrations/`.
- Use `pnpm db:migrate` (dev) or `pnpm db:deploy` (production) for schema changes.
- Run `pnpm db:validate` and `pnpm db:generate` after every schema edit.

---

## 8. Pre-Completion Checklist

Before marking **any** coding task as complete, verify all of the following:

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero warnings or errors
- [ ] All tenant-scoped queries filter by `tenantId`
- [ ] New routes bind `authenticate` + appropriate RBAC guard
- [ ] No `any` types introduced
- [ ] No `console.log` statements left in code
- [ ] No unrelated files were modified
- [ ] All new Zod schemas use `z.infer<>` for derived types

---

## 9. Commit Convention

```
feat(scope):     New feature or capability
fix(scope):      Bug fix for a regression or defect
refactor(scope): Code restructure without behaviour change
chore(scope):    Tooling, dependency, config, or build changes
docs(scope):     Documentation changes only
```

Examples:
```
feat(provisioning): add bulk student import with xlsx validation
fix(rbac): enforce tenant scope on permission cache key lookup
refactor(academic): extract pagination helper to shared utils
chore(prisma): add index on enrollments.tenantId for performance
```
