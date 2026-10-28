# EduBridge

EduBridge is an **AI-enabled Progressive Web Application (PWA)** for competency-based education, designed for private schools. Built as a multi-tenant monorepo, the platform supports school-scoped data management, academic operations, automated and manual assessment evaluation, offline study capabilities, and curriculum-grounded AI assistance.

---

## High-Level System Overview

The platform organizes data by tenant (`tenantId`), allowing private schools to manage their own curricula, users, and academic records within a shared database.

```mermaid
graph TD
    Client["Client Browsers / PWA"] --> Web["Web Application (Next.js 16)"]
    Web --> API["REST API (Express 5 / TypeScript)"]
    
    API --> Security["Auth & RBAC Middleware"]
    Security --> Modules["Domain Modules"]
    
    Modules --> Prisma["Prisma ORM"]
    Prisma --> PostgreSQL[("PostgreSQL + pgvector")]
    
    Modules --> Redis[("Redis (Cache, Sessions, SSE Pub/Sub)")]
    Modules --> Storage["Backblaze B2 (Cloud Object Storage)"]
    Modules --> AI["Google Gemini API (LLM & Embeddings / RAG)"]
    Modules --> Email["Brevo (Transactional Email)"]
```

- **Backend API (`apps/api`)**: Built on Express 5, Prisma 7, PostgreSQL with `pgvector`, Redis (`ioredis`), and Google Gemini. Implements layered domain modules (Controller → Service → Repository), tenant-scoped queries, dynamic RBAC, and Server-Sent Events (SSE) for real-time notifications.
- **Web Frontend (`apps/web`)**: Built on Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Features feature-sliced architecture, TanStack Query v5 for server state, Zustand for client state, and Dexie (IndexedDB) for offline PWA capabilities.

---

## Monorepo & Module Structure

The repository separates domain logic on the backend and feature slices on the frontend.

```text
edubridge/
├── apps/
│   ├── api/                              # Backend Express 5 REST API
│   │   ├── prisma/                       # Prisma schema, migrations & seed scripts
│   │   └── src/
│   │       ├── config/                   # Environment, CORS, and security configuration
│   │       ├── docs/                     # Swagger / OpenAPI setup and configuration
│   │       ├── lib/                      # Singletons: Prisma, Redis, Backblaze B2 storage
│   │       ├── middleware/               # Auth, tenant isolation, dynamic RBAC, rate limiter
│   │       ├── modules/                  # Domain Modules (Controller -> Service -> Repository)
│   │       │   ├── academic/             # Years, terms, grades, sections & enrollments
│   │       │   ├── ai/                   # RAG pipeline, ingestion, AI tutor, questions & content gen
│   │       │   ├── assessment/           # Timed tests, exams, submissions & auto-grading
│   │       │   ├── auth/                 # Login, System Admin OTP (2FA), Google SSO, session management
│   │       │   ├── bookmarks/            # Student learning bookmarks & personal notes
│   │       │   ├── curriculum/           # Curricula, versions, subjects, units, topics & competencies
│   │       │   ├── evaluation/           # Evaluation metrics & student performance logs
│   │       │   ├── grading/              # Teacher manual grading workflows & attempt feedback
│   │       │   ├── health/               # API & database liveness/readiness healthchecks
│   │       │   ├── learning-content/     # Educational materials, attachments & AI ingestion
│   │       │   ├── lookup/               # Tenant lookup tables & dynamic configuration
│   │       │   ├── mastery/              # Competency evidence tracking & student mastery profiles
│   │       │   ├── notifications/        # Real-time SSE dispatch, templates & inbox management
│   │       │   ├── permissions/          # Dynamic RBAC roles, actions & permission cache
│   │       │   ├── provisioning/         # Tenant, teacher invitation & bulk student imports
│   │       │   ├── question-bank/        # Versioned multi-type questions, banks & practice mode
│   │       │   ├── security-policy/      # Tenant-level authentication policies & lockout rules
│   │       │   ├── students/             # Student records, status & roster administration
│   │       │   └── teacher-profile/      # Teacher profiles, academic qualifications & experience
│   │       └── shared/                   # Typed exceptions, domain events, utilities & enums
│   │
│   └── web/                              # Frontend Next.js 16 Application (PWA)
│       ├── public/                       # Static assets & PWA manifest
│       └── src/
│           ├── app/                      # Next.js App Router (pages, nested layouts, routes)
│           ├── components/               # Domain-agnostic reusable UI components (shadcn/ui)
│           ├── config/                   # Application constants & navigation route definitions
│           ├── constants/                # App-wide fixed constants
│           ├── features/                 # Feature-Sliced Domain Modules (UI, Hooks, Services)
│           │   ├── academic/             # Academic structure, section assignments & roster UI
│           │   ├── ai/                   # AI tutor interface, content generation & review queues
│           │   ├── assessments/          # Assessment builder, student test runner & results
│           │   ├── auth/                 # Login forms, OTP verification & password recovery
│           │   ├── bookmarks/            # Bookmarks list, filter & offline cache
│           │   ├── classes/              # Class section management & teacher allocations
│           │   ├── curriculum/           # Curriculum tree editor, versions & learning objectives
│           │   ├── evaluations-feedback/ # Teacher manual grading & feedback interfaces
│           │   ├── learning-content/     # Content viewer, file attachments & reading state
│           │   ├── lookups/              # Institution settings & lookup management
│           │   ├── mastery/              # Competency radar & student mastery analytics
│           │   ├── notifications/        # Real-time notification bell, dropdown & inbox
│           │   ├── offline/              # Dexie IndexedDB manager, outbox sync & network status
│           │   ├── permissions/          # Role management & permission matrix
│           │   ├── provisioning/         # School onboarding & bulk CSV/XLSX imports
│           │   ├── question-bank/        # Question authoring, bank repository & practice mode
│           │   ├── security/             # Security policy settings & audit event logs
│           │   ├── staff-qualifications/ # Teacher qualifications & experience forms
│           │   ├── students/             # Student directory, profile & status control
│           │   └── teacher-profile/      # Teacher profile editor & career history
│           ├── lib/                      # Axios client, IndexedDB setup & utility helpers
│           ├── providers/                # React Query, Theme, and Auth context providers
│           └── stores/                   # Zustand global state stores
│
├── docs/                                 # Project documentation & specifications
├── data/                                 # Shared assets and templates
├── docker-compose.yml                    # Local multi-service container orchestration
├── package.json                          # Monorepo root scripts & shared dependencies
└── pnpm-workspace.yaml                   # PNPM workspace definition
```

---

## Core Features (Brief Overview)

- **Multi-Tenancy & Access Control**: School-scoped data access (`tenantId`) and role-based access control (RBAC). System Admin logins are secured with email OTP (2FA); teachers and students log in directly with their credentials (students can sign in with username or email).
- **Curriculum & Competency Framework**: Multi-level hierarchy (Curriculum → Subject → Unit → Topic → Learning Objective) with Draft/Published/Archived versioning and scope support (System vs. Tenant).
- **Academic Structure & Management**: Academic years, terms, grade levels, and class sections. Homeroom and subject teacher allocations, section capacity tracking, student enrollments, transfers, withdrawals, and year-end promotions.
- **Hierarchical Provisioning**: System Admins provision school tenants. School Admins onboard teachers via email invitations and students via individual entry or bulk CSV/XLSX import with auto-generated credentials. First-time users log in and complete their profile.
- **Learning Content & Question Bank**: Rich educational content with cloud file storage. Comprehensive question banks supporting Multiple Choice, True/False, Short Answer, Numeric, and Manual questions with full version history and resumable practice sessions.
- **Assessments, Grading & Mastery**: Timed assessments, automated grading for objective questions, teacher manual evaluation workflow with feedback, and competency evidence tracking with student mastery calculations.
- **AI-Powered Capabilities (RAG)**: Human-in-the-loop review queue for AI-generated learning materials and questions. Student AI tutor grounded in curriculum embeddings, plus on-demand step-by-step explanations.
- **Offline-First PWA**: Client-side storage (Dexie / IndexedDB) allowing offline reading, practice exam completion, and bookmarking, paired with an offline outbox queue and automated background sync upon reconnection.
- **Real-Time Notifications**: Server-Sent Events (SSE) backed by Redis Pub/Sub for immediate delivery of academic assignments, grading results, invitations, and security alerts.

---

## Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Backend API** | Express 5, TypeScript, Prisma 7, Zod, Redis (`ioredis`), Backblaze B2 (AWS S3 SDK) |
| **Database & Vector** | PostgreSQL 15+ with `pgvector` extension (768-dimensional embeddings) |
| **Frontend Web** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| **State & Data Fetching** | TanStack Query v5 (Server state), Zustand (Global UI state), React Hook Form + Zod |
| **Offline Storage** | Dexie.js (IndexedDB) with outbox queue and background synchronization |
| **AI & LLM Services** | Google Gemini 2.5 Flash (LLM), Google Gemini Embedding 001, Semantic chunking RAG |
| **Email & Auth** | Brevo (Transactional email API), Google OAuth2, JWT with Redis session tracking |
| **Infrastructure** | Docker, Docker Compose, PNPM Workspaces, GitHub Actions (CI/CD) |

---

## Prerequisites

- **Node.js**: `v20.x` or higher
- **PNPM**: `v10.x` or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL**: `v15+` with the `vector` extension installed (or via Docker Compose)
- **Redis**: `v7+` (or via Docker Compose)

---

## Configuration & Environment Variables

EduBridge uses environment variables for service orchestration. A template is provided in `.env.example`.

Create `.env` in the root (used by Docker Compose) and configure the app-specific environment files:

### Backend Configuration (`apps/api/.env`)

```ini
PORT=5000
NODE_ENV=development

# Database (PostgreSQL + pgvector)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/edubridge_db"

# Cache & Message Broker (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_URL="redis://:your_redis_password@localhost:6379"

# Authentication & Security
JWT_SECRET="your_secure_jwt_secret"
JWT_REFRESH_SECRET="your_secure_refresh_secret"
CORS_ORIGIN="http://localhost:3000"

# Email Delivery (Brevo)
BREVO_API_KEY="your_brevo_api_key"
EMAIL_FROM="noreply@edubridge.com"
EMAIL_FROM_NAME="EduBridge"

# Google OAuth2 (SSO)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Object Storage (Backblaze B2 / S3-compatible)
B2_ENDPOINT="https://s3.eu-central-003.backblazeb2.com"
B2_REGION="eu-central-003"
B2_BUCKET_NAME="edubridge-files-prod"
B2_KEY_ID="your_b2_key_id"
B2_APPLICATION_KEY="your_b2_application_key"

# AI & RAG Configuration (Google Gemini)
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_LLM_MODEL="gemini-2.5-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"
GEMINI_EMBEDDING_DIMENSIONS=768
```

### Frontend Configuration (`apps/web/.env.local`)

```ini
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_APP_NAME="EduBridge"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
```

---

## Installation & Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Leta-Kasahun/edubridge.git
cd edubridge
pnpm install
```

### 2. Start PostgreSQL & Redis (Docker Compose)

If you don't have local PostgreSQL and Redis instances running, start them with Docker Compose:

```bash
pnpm docker:up
```

### 3. Initialize the Database

Generate the Prisma client and apply database migrations:

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed the database with initial lookup and academic data
pnpm db:seed
```

### 4. Run the Development Servers

Start both the backend API and Next.js frontend in parallel:

```bash
pnpm dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Interactive Swagger Documentation**: [http://localhost:5000/docs](http://localhost:5000/docs)

---

## Usage & Core Workflows

- **Authentication Flow**:
  - **System Admin**: Logs in with email and password, followed by an email OTP verification code (2FA).
  - **School Admin & Teacher**: Log in directly with their email and temporary or permanent password.
  - **Student**: Logs in directly using either **username or email** and password (no 2FA required).
- **Provisioning & Onboarding Hierarchy**:
  1. **System Admin** creates and provisions the private school tenant and sets up the School Admin.
  2. **School Admin** provisions teachers via email invitations and adds students individually or via bulk CSV/XLSX import with auto-generated credentials.
  3. **Teachers & Students** sign in with their provided credentials and complete their profile upon initial login.
- **Academic & Curriculum Setup**: School Admins set up academic years, terms, grade levels, class sections, and curriculum trees (Subject → Unit → Topic → Learning Objective).
- **Teaching & Content Delivery**: Teachers create curriculum-linked notes under `Learning Content`, manage questions under `Question Bank`, and schedule timed tests under `Assessments`.
- **Student Learning & Evaluation**: Students access study materials, practice online or offline, and complete assessments with auto-grading; teachers evaluate open-ended answers under `Grading` to update competency mastery.
- **API Exploration**: Explore and test REST API endpoints with JWT authorization via Swagger UI at `http://localhost:5000/docs`.

---

## Command Reference

All commands are executed from the workspace root using `pnpm`.

### Development & Build Lifecycle

| Command | Scope | Description |
| :--- | :--- | :--- |
| `pnpm dev` | Monorepo | Runs both `api` and `web` concurrently with hot reload |
| `pnpm build` | Monorepo | Compiles and builds all applications for production |
| `pnpm start` | Monorepo | Starts all production builds concurrently |
| `pnpm api:dev` | Backend | Starts Express API development server (`tsx watch`) |
| `pnpm api:build` | Backend | Transpiles TypeScript backend to production bundle |
| `pnpm web:dev` | Frontend | Starts Next.js development server on port 3000 |
| `pnpm web:build` | Frontend | Creates an optimized production build of Next.js |

### Code Quality & Validation

| Command | Description |
| :--- | :--- |
| `pnpm typecheck` | Runs TypeScript type checking across all workspace packages |
| `pnpm lint` | Runs ESLint across all workspace packages |
| `pnpm format` | Formats all files using Prettier |

### Database & Prisma Management

| Command | Description |
| :--- | :--- |
| `pnpm db:generate` | Generates the Prisma client from `schema.prisma` |
| `pnpm db:migrate` | Runs pending migrations in development mode |
| `pnpm db:deploy` | Applies all pending migrations in production |
| `pnpm db:push` | Pushes the schema directly to the database without migrations |
| `pnpm db:seed` | Seeds database with lookup tables and demo data |
| `pnpm db:studio` | Opens Prisma Studio visual database editor |
| `pnpm db:validate` | Validates `schema.prisma` syntax and references |

### Docker Operations

| Command | Description |
| :--- | :--- |
| `pnpm docker:up` | Starts all container services in detached mode |
| `pnpm docker:down` | Stops and removes running containers |
| `pnpm docker:logs` | Streams real-time logs from all running containers |
| `pnpm docker:clean` | Stops containers and removes persistent volumes (`down -v`) |

---

## License

Private & Proprietary. All rights reserved.
