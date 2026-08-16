# EduBridge

EduBridge is a multi-tenant educational platform engineered for schools, administrators, teachers, and students. The platform provides tenant-isolated academic management, hierarchical account provisioning, class & student administration, exam preparation tools, progress analytics, and AI-driven educational support.

---

## Architecture Overview

EduBridge is architected as a modular, full-stack monorepo managed via **PNPM Workspaces**.

```mermaid
graph TD
    Client["Client Browsers"] --> Web["Web Application (Next.js 16)"]
    Web --> API["Backend API (Express 5 / Node.js)"]
    API --> Auth["Dynamic RBAC & Tenant Isolation Middleware"]
    Auth --> Modules["Domain Modules (Classes, Students, Exam-Prep, etc.)"]
    Modules --> Prisma["Prisma ORM"]
    Modules --> Redis[("Redis (Rate Limiting & Cache)")]
    Prisma --> Postgres[("PostgreSQL Database")]
```

### Monorepo Structure

```text
edubridge/
├── apps/
│   ├── api/                 # Node.js / Express 5 REST API
│   │   ├── prisma/          # Prisma schema & database migrations
│   │   └── src/
│   │       ├── config/      # Environment, CORS, and JWT configurations
│   │       ├── middleware/  # Auth, validation, error handling, rate limiting
│   │       ├── modules/     # Domain-driven feature modules
│   │       │   ├── classes/
│   │       │   ├── exam-prep/
│   │       │   ├── health/
│   │       │   ├── permissions/
│   │       │   ├── provisioning/
│   │       │   └── students/
│   │       └── shared/      # Shared enums, types, utilities, exceptions
│   └── web/                 # Next.js App Router Frontend
│       ├── public/          # Static assets
│       └── src/
│           ├── app/         # Next.js App Router (pages & layouts)
│           ├── features/    # Feature-scoped components, hooks & state
│           ├── components/  # Reusable UI component library
│           ├── providers/   # React context & client-side providers
│           └── stores/      # Client-side state stores
├── docs/                    # Software Requirement Specifications & Epics
├── infrastructure/          # Infrastructure configurations & deployment manifests
├── docker-compose.yml       # Container orchestration for local development
├── package.json             # Root workspace orchestration & shared scripts
└── pnpm-workspace.yaml      # PNPM workspace definition
```

---

## Component Architectures

### 1. Backend API (`apps/api`)
Built with **Node.js**, **Express 5**, and **TypeScript**.

- **Pattern**: Modular Layered Architecture (Controller -> Service -> Repository -> Data Source).
- **Domain Modules**: Each module under `src/modules/` isolates its own routes, schemas (Zod/express-validator), controllers, business logic services, data access repositories, and domain types.
- **Database & Data Layer**: **PostgreSQL** accessed through **Prisma ORM**, handling migrations, models, and type-safe database queries.
- **Caching & Rate Limiting**: **Redis** (`ioredis`) for session management, dynamic permission caching, and request rate limiting (`express-rate-limit`).
- **Security & Authorization**:
  - Top-down tenant isolation scoping all academic data to the authenticated tenant.
  - Dynamic RBAC engine with role × action × tenant-override permission evaluation.
  - JWT token verification and Helmet security header middleware.

### 2. Web Frontend (`apps/web`)
Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

- **Pattern**: Feature-Sliced Component Architecture.
- **App Router**: File-system-based routing with nested layouts, route handlers, and server/client component boundaries.
- **Feature Modules**: Encapsulated under `src/features/` (e.g., `auth`, `classes`, `students`, `exam-prep`), grouping UI views, domain hooks, and API clients.
- **Styling**: Tailwind CSS v4 design system with responsive layouts and component styling.

---

## Prerequisites

- **Node.js**: `v20.x` or higher
- **PNPM**: `v10.x` or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL**: `v15+` (or via Docker Compose)
- **Redis**: `v7+` (or via Docker Compose)

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Leta-Kasahun/edubridge.git
cd edubridge
pnpm install
```

### 2. Environment Configuration

Create `.env` files in both `apps/api` and `apps/web` based on their respective configurations:

```bash
# apps/api/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/edubridge?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secure-jwt-secret"
PORT=5000
```

### 3. Initialize Database & Start Services

```bash
# Generate Prisma client and push schema to DB
pnpm setup

# Run all applications concurrently in development mode
pnpm dev
```

- Web application: `http://localhost:3000`
- REST API: `http://localhost:5000`

---

## Command Reference

All commands are executed from the workspace root using `pnpm`.

### Project Setup & Lifecycle

| Command | Description |
| :--- | :--- |
| `pnpm setup` | Installs dependencies, generates Prisma client, and syncs database schema |
| `pnpm dev` | Starts all applications (`api` and `web`) concurrently in dev mode |
| `pnpm build` | Builds all packages and applications for production |
| `pnpm start` | Runs all production builds concurrently |

---

### Application-Specific Commands

| Command | Scope | Description |
| :--- | :--- | :--- |
| `pnpm web:dev` | Frontend | Starts Next.js development server on `localhost:3000` |
| `pnpm web:build` | Frontend | Creates an optimized production build of the Next.js app |
| `pnpm web:start` | Frontend | Starts Next.js production server |
| `pnpm web:lint` | Frontend | Runs ESLint on the Next.js codebase |
| `pnpm api:dev` | Backend | Starts Express API development server with hot-reload |
| `pnpm api:build` | Backend | Transpiles TypeScript backend to production bundle |
| `pnpm api:start` | Backend | Starts the compiled Express API server |
| `pnpm api:lint` | Backend | Runs linter on backend API codebase |

---

### Code Quality & Validation

| Command | Description |
| :--- | :--- |
| `pnpm lint` | Runs linters across all workspace packages |
| `pnpm typecheck` | Executes TypeScript type checking across all workspace packages |
| `pnpm format` | Formats all files using Prettier |

---

### Database & Prisma Operations

| Command | Description |
| :--- | :--- |
| `pnpm db:generate` | Generates the Prisma client from schema definition |
| `pnpm db:migrate` | Runs pending migrations in development mode |
| `pnpm db:deploy` | Applies all pending migrations in production |
| `pnpm db:push` | Pushes the schema state directly to the database without creating migrations |
| `pnpm db:pull` | Pulls database schema into `schema.prisma` from an existing database |
| `pnpm db:reset` | Resets the database and reapplies all migrations |
| `pnpm db:seed` | Seeds the database with initial seed data |
| `pnpm db:studio` | Opens Prisma Studio visual database editor in your browser |
| `pnpm db:format` | Formats the `schema.prisma` file |
| `pnpm db:validate` | Validates the `schema.prisma` syntax and references |

---

### Docker & Infrastructure

| Command | Description |
| :--- | :--- |
| `pnpm docker:up` | Starts all services in the background using Docker Compose |
| `pnpm docker:down` | Stops and removes running Docker containers |
| `pnpm docker:build` | Builds or rebuilds Docker images |
| `pnpm docker:rebuild` | Builds images and starts containers in detached mode |
| `pnpm docker:logs` | Follows logs from all running containers |
| `pnpm docker:logs:api` | Streams logs specifically from the API service container |
| `pnpm docker:logs:web` | Streams logs specifically from the Web service container |
| `pnpm docker:ps` | Lists status of running containerized services |
| `pnpm docker:clean` | Stops containers and removes associated volumes (`down -v`) |
| `pnpm docker:reset` | Full teardown removing volumes and orphan containers |

---

## License

Private & Proprietary. All rights reserved.
