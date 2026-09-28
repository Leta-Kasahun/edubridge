# EduBridge — Backend API Agent & Developer Guidelines (`apps/api`)

## 1. Scope & Stack

This directory is the EduBridge core REST API:

| Layer | Technology |
| :--- | :--- |
| **Runtime & Framework** | Node.js, Express 5, TypeScript (`tsx` dev, `tsc` build) |
| **Database & ORM** | PostgreSQL + Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| **Validation** | Zod v4 — schemas for all request bodies, query params, route params |
| **Auth & AuthZ** | JWT + RBAC (`src/middleware/auth.ts`, `src/middleware/rbac.ts`) |
| **Caching** | Redis via `ioredis` (`src/lib/redis.ts`, `src/lib/redis.keys.ts`) |
| **File Storage** | **Backblaze B2** S3-compatible (`src/lib/storage/b2.storage.ts`) |
| **PDF/OCR Extraction** | `unpdf` + Tesseract.js (`src/lib/extraction/`) |
| **Bulk Import Parsing** | Custom CSV/XLSX parser (`src/shared/utils/import-parser.ts`) |
| **Email** | NodeMailer (`src/lib/email.ts`) |

---

## 2. Mandatory Module Structure

Every domain feature lives in `src/modules/<domain>/` with strict 4-tier layering:

```
src/modules/<domain>/
├── <domain>.route.ts       # Router: middleware chain only (auth → RBAC → validate → handler)
├── <domain>.doc.ts         # Swagger/OpenAPI specification for this domain
├── controllers/            # Unbox req, call service, format JSON response envelope
├── services/               # Business logic, transaction orchestration, throw typed errors
├── repository/             # Prisma queries only — all DB access lives here
├── schemas/                # Zod request validation schemas (input DTOs)
└── types/                  # Domain TypeScript interfaces and inferred types
```

**Shared infrastructure** (never move these, never duplicate them):
```
src/
├── middleware/             # auth.ts, rbac.ts, validate.ts, error-handler.ts, rate-limiter.ts, tenant.ts
├── shared/
│   ├── exceptions/         # AppError, BadRequestError, NotFoundError, ConflictError, ForbiddenError…
│   ├── utils/              # Pure utilities: async-handler, generators, file-validator, import-parser…
│   ├── constants/          # Shared numeric/string constants (page limits, etc.)
│   └── enums/              # Shared TypeScript enums
└── lib/
    ├── prisma.ts           # Prisma client singleton
    ├── redis.ts            # ioredis client singleton
    ├── redis.keys.ts       # Centralised Redis key factory — RedisKeys
    ├── email.ts            # Email service
    ├── extraction/         # PDF/OCR document extractor library
    │   ├── document-extractor.lib.ts
    │   ├── tesseract-ocr.provider.ts
    │   └── extraction.types.ts
    └── storage/
        ├── b2.storage.ts   # Backblaze B2 S3-compatible adapter
        ├── storage.service.ts
        └── storage.types.ts
```

---

## 3. Layering Rules — Single Responsibility Per Layer

### 3.1. Routes (`*.route.ts`) — Middleware Wiring Only
```ts
const router: Router = Router();
router.use(authenticate);                            // 1. Auth
router.get("/", requirePermission("read", "academic-years"), handler);  // 2. RBAC
router.post("/", validate(createSchema), handler);   // 3. Input validation
// NO business logic here — routes wire middleware only
```
- Bind `authenticate`, then `requirePermission(action, resource)` or `requireRoles(...)`, then `validate(schema)`.
- Never write conditional logic or call Prisma from routes.

### 3.2. Controllers (`controllers/`) — Request/Response Only
```ts
getItems = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);              // extract tenant from JWT
  const page = parseInt(req.query.page as string) || 1;
  const result = await this.service.getItems(tenantId, { page });
  res.status(200).json({
    success: true,
    data: result.data,
    pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
  });
});
```
- Wrap every handler in `asyncHandler(...)` from `src/shared/utils/async-handler.ts`.
- Extract `tenantId` strictly from `req.user.tenantId` — never from `req.body`.
- Parse and validate pagination: `page` (default 1), `limit` (default from domain constants).
- Call the service. Format the standard JSON envelope. Return.
- **Zero Prisma imports in controllers.**

### 3.3. Services (`services/`) — Business Logic Only
```ts
async createItem(tenantId: string, input: CreateItemInput): Promise<ItemRecord> {
  // 1. Business rule validation
  const existing = await this.repo.findByCode(tenantId, input.code);
  if (existing) throw new ConflictError(`Code "${input.code}" already exists`);

  // 2. Date / referential integrity checks
  const start = new Date(input.startDate);
  if (isNaN(start.getTime())) throw new BadRequestError("Invalid start date");

  // 3. Transactional mutation when multiple writes are needed
  return prisma.$transaction(async (tx) => {
    const item = await this.repo.create(tenantId, input, tx);
    await auditRepo.log(tenantId, "CREATE", item.id, tx);
    return item;
  });
}
```
- Services own ALL business rules, cross-entity validations, and state machine transitions.
- Always throw typed errors from `src/shared/exceptions/` — never raw `Error`.
- Use `prisma.$transaction(async (tx) => {...})` when two or more writes must be atomic.
- **Zero `console.log` in services.**

### 3.4. Repositories (`repository/`) — Prisma Queries Only
```ts
async findMany(params: FilterParams): Promise<PaginatedResult> {
  const { tenantId, page = 1, limit = DEFAULT_LIMIT } = params;
  const skip = (page - 1) * limit;
  const where: Prisma.ItemWhereInput = { tenantId };   // tenantId ALWAYS first

  const [total, records] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit, select: { ... } }),
  ]);

  return { data: records, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```
- **Every query must begin with `{ tenantId }` in the `where` clause.**
- Use `Promise.all` for concurrent count + data queries on list endpoints.
- Use `select` to project only the fields needed — never return `password`, `refreshToken`, or internal secrets.
- Use `_count` for efficient relational count aggregations.
- Never import service or controller code from repositories.

---

## 4. Validation — Zod Schemas (`schemas/`)

Every request must be validated with a Zod schema **before** reaching the controller:

```ts
// schemas/example.schema.ts
import { z } from "zod";

export const createExampleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().min(1).max(20).toUpperCase(),
  startDate: z.string().datetime({ message: "Invalid date format" }),
});

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
```

- Use `validate(schema)` middleware from `src/middleware/validate.ts` in routes.
- Always derive TypeScript types from schemas with `z.infer<typeof schema>`.
- Never re-validate inside services what Zod already validated in the route.
- For query params: use `z.coerce.number()` for numeric pagination params.

---

## 5. Shared Utilities — Use Before Writing New Code

Check these **before** writing any utility function from scratch:

| Utility | Path | Use for |
| :--- | :--- | :--- |
| `asyncHandler` | `src/shared/utils/async-handler.ts` | Wrap every controller handler |
| `validateUploadedMedia` | `src/shared/utils/file-validator.util.ts` | Validate file type, size, category |
| `sanitizeFileName` | `src/shared/utils/file-validator.util.ts` | Clean filenames before storage |
| `parseCsvText<T>` | `src/shared/utils/import-parser.ts` | Parse CSV bulk import with Zod row validation |
| `generateTenantCode` | `src/shared/utils/generators.ts` | Generate school codes |
| `generateStudentUsername` | `src/shared/utils/generators.ts` | Generate student usernames |
| `generateTeacherUsername` | `src/shared/utils/generators.ts` | Generate teacher usernames |
| `generateOtp` | `src/shared/utils/generators.ts` | Generate OTP codes |
| `RedisKeys.*` | `src/lib/redis.keys.ts` | All Redis key construction |
| `DocumentExtractorLib` | `src/lib/extraction/document-extractor.lib.ts` | PDF/image text extraction |

**Rule**: If the utility already exists, use it. Never duplicate it in a module folder.

---

## 6. File Upload & Storage

### 6.1. Backblaze B2 — The Only Storage Provider
All file operations (profile photos, qualification documents, certificates, bulk import exports) must go through:
- `src/lib/storage/b2.storage.ts` — the B2 S3-compatible adapter
- `src/lib/storage/storage.service.ts` — the storage abstraction used by modules

**Strictly forbidden**: Cloudinary, direct S3 calls outside the adapter, local disk as permanent storage.

### 6.2. File Validation Before Upload
Always validate before uploading using `validateUploadedMedia` from `file-validator.util.ts`:

```ts
import { validateUploadedMedia } from "../../shared/utils/file-validator.util.js";

const validation = validateUploadedMedia(
  file.originalname,
  file.mimetype,
  file.size,
  { allowedCategories: ["image", "pdf"] }   // restrict to context-appropriate types
);
if (!validation.isValid) {
  throw new BadRequestError(validation.error ?? "Invalid file");
}
const sanitizedName = validation.sanitizedFileName;
// then upload via storageService.upload(...)
```

File size limits (from `file-validator.util.ts`):
- Images: 10 MB
- PDFs: 100 MB
- Documents: 20 MB
- Spreadsheets: 15 MB
- Videos: 100 MB

### 6.3. PDF / Document Extraction
Use `DocumentExtractorLib` from `src/lib/extraction/document-extractor.lib.ts`:

```ts
import { DocumentExtractorLib } from "../../lib/extraction/index.js";

const extractor = new DocumentExtractorLib();
const extracted = await extractor.extract(file.buffer, file.mimetype, file.originalname);
// extracted.fullText, extracted.pages[], extracted.isScanned
```

- Handles both selectable-text PDFs (`unpdf`) and scanned image-PDFs (Tesseract OCR fallback).
- Never import `unpdf` or `tesseract.js` directly in modules — always use the extractor lib.

---

## 7. Caching with Redis

Always use `RedisKeys` from `src/lib/redis.keys.ts` for all cache key construction. Never hardcode key strings:

```ts
import { redis, RedisKeys } from "../../lib/redis.js";

// Read
const cacheKey = RedisKeys.permission.userPermissions(tenantId, userId);
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Write with TTL
await redis.set(cacheKey, JSON.stringify(data), "EX", 300);  // 300s = 5 minutes

// Invalidate on mutation
await redis.del(cacheKey);
```

**TTL standards**:
- Permission/RBAC cache: `300s` (5 min)
- Tenant data cache: `600s` (10 min)
- Auth tokens/OTPs: Set explicit short TTLs matching business requirements

Never cache sensitive data (raw passwords, tokens) in Redis.

---

## 8. Error Handling

### 8.1. Always Use Typed Exceptions

| Class | HTTP | When to throw |
| :--- | :---: | :--- |
| `BadRequestError` | 400 | Input passes Zod but fails a business rule |
| `UnauthorizedError` | 401 | Missing or invalid authentication |
| `ForbiddenError` | 403 | Authenticated but lacking permission |
| `NotFoundError` | 404 | Record does not exist in tenant scope |
| `ConflictError` | 409 | Unique constraint or state conflict |
| `ValidationError` | 422 | Programmatic validation failure |
| `InternalServerError` | 500 | Unexpected unrecoverable errors |

The global `errorHandler` middleware (`src/middleware/error-handler.ts`) handles all of these automatically plus Zod errors and Prisma `P2002`/`P2025` codes. **Never `try/catch` in controllers to format errors manually.**

### 8.2. Error Messages
- Error messages in service exceptions must be plain, clear, and actionable.
- Never expose database column names, Prisma model names, or internal identifiers in messages.
- Good: `"An academic year with this code already exists"` — Bad: `"Unique constraint failed on field: AcademicYear.code"`

---

## 9. Multi-Tenancy Security (Non-Negotiable)

1. **Every repository query** must begin its `where` clause with `tenantId`.
2. **Every controller** must call a `getTenantId(req)` helper that reads from `req.user.tenantId`.
3. **Never trust** client-supplied `tenantId` from request body or query string without authentication.
4. **RBAC on every protected route**: `authenticate` + `requirePermission(action, resource)` or `requireRoles(...)`.
5. **SYSTEM_ADMIN bypass**: `req.user.roles.includes("SYSTEM_ADMIN")` skips tenant checks — do not replicate this logic in modules; it is handled by `rbac.ts`.
6. **Permission caching**: Use `RedisKeys.permission.userPermissions(tenantId, userId)` with TTL 300s — never bypass this pattern.

---

## 10. Bulk Import Pattern

For CSV/XLSX bulk operations (teacher import, student import, curriculum import):

```ts
import { parseCsvText } from "../../shared/utils/import-parser.js";

const rowSchema = z.object({ firstName: z.string().min(1), email: z.string().email() });
const result = parseCsvText(csvContent, rowSchema, { "first_name": "firstName" });

// result.validRows — safe to process
// result.invalidRows — return as validation errors in response, never silently skip
```

- Never build a custom CSV parser — use `parseCsvText<T>` which already handles RFC-4180 quoting.
- Always return `invalidRows` in the API response so the frontend can display row-level errors.
- Process `validRows` in a `prisma.$transaction` for atomicity, or in batches for large imports.

---

## 11. Code Quality Guardrails (Non-Negotiable)

1. **Zero `any` types**: Use `z.infer<typeof schema>`, explicit interfaces, or `unknown` + type narrowing.
2. **Zero `console.log`**: Use the global error handler and typed exceptions — never debug-log in production.
3. **No unused imports**: Enforced by `eslint-plugin-unused-imports`.
4. **No unapproved packages**: Only use what is listed in `apps/api/package.json`.
5. **DRY**: Before writing any utility function, check `src/shared/utils/` — it likely already exists.
6. **YAGNI**: Build exactly what is required. No speculative features, no unnecessary abstractions.
7. **Zero blast radius**: Confine changes strictly to the target module. Never modify unrelated files.
8. **No boilerplate**: Do not write wrapper classes or factory functions that add zero business value.
9. **Database integrity**: Never edit applied migration files under `prisma/migrations/`.

---

## 12. Pre-Completion Checklist

Before marking any task complete:

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero warnings
- [ ] All new repository queries include `tenantId` in `where`
- [ ] New routes bind `authenticate` + RBAC guard before the handler
- [ ] File uploads use `validateUploadedMedia` before calling the storage adapter
- [ ] PDF extraction uses `DocumentExtractorLib`, not raw `unpdf`/`tesseract.js`
- [ ] All Redis keys use `RedisKeys.*` — no hardcoded strings
- [ ] CSV parsing uses `parseCsvText<T>` — no custom parsers
- [ ] No `any` types, no `console.log`, no unused imports
- [ ] No unrelated files modified
