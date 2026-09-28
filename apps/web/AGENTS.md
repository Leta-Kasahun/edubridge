# EduBridge — Frontend Web Agent & Developer Guidelines (`apps/web`)

## 1. Scope & Stack

This directory is the EduBridge web application:

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + `globals.css` design tokens |
| **Server State** | TanStack Query v5 (`@tanstack/react-query`) |
| **Global UI State** | Zustand (`src/stores/`) |
| **Forms** | React Hook Form + Zod (`@hookform/resolvers/zod`) |
| **HTTP Client** | Axios via `@/lib/apiClient` |
| **Icons** | `lucide-react` only |

---

## 2. Mandatory Directory Structure

```
src/
├── app/                          # Next.js App Router — pages and layouts only
├── features/<domain>/            # All feature logic lives here
│   ├── components/               # Feature-specific UI components
│   ├── hooks/                    # TanStack Query hooks
│   ├── services/                 # Axios API calls
│   └── types/                    # Domain TypeScript types
├── shared/
│   ├── components/               # Reusable cross-feature components (see §4)
│   ├── hooks/                    # Cross-feature utility hooks
│   ├── utils/                    # Pure utility functions
│   ├── constants/                # Shared constants (page limits, filter options)
│   └── types/                    # Shared TypeScript interfaces (ApiResponse, etc.)
├── components/ui/                # Base UI primitives (shadcn/base-ui — do NOT modify)
├── stores/                       # Zustand global state
├── lib/                          # apiClient, queryClient, utils
├── constants/                    # API endpoints, routes, roles, theme
└── providers/                    # React context providers
```

**Structure rules:**
- Business logic belongs in `features/`, never in `app/`.
- Shared cross-feature components belong in `shared/components/`, not duplicated per feature.
- Never invent new top-level folders outside the above structure.

---

## 3. Component & File Boundaries

### 3.1. Server vs. Client Components
- All pages and layouts in `src/app/` default to **Server Components**.
- Add `'use client'` **only** when the component requires `useState`, `useEffect`, browser APIs, or event handlers.
- Do NOT mark a component `'use client'` just because it imports a client component — use composition instead.

### 3.2. Feature Component Rules
- **View components** (`*View.tsx`): Top-level orchestrators. Manage local filter/modal state, compose sub-components. One per feature page.
- **Table components** (`*Table.tsx`): Receive data as props, emit callbacks. No data fetching inside.
- **Form/Modal components** (`*FormModal.tsx`, `*DetailModal.tsx`): Contain form logic + `SubmitButton`. Emit `onClose` and `onSuccess` callbacks.
- **Never put business logic in components** — components render UI, call hooks, and emit events only.
- **Never fetch data directly in components** — all server data comes through TanStack Query hooks.

### 3.3. Component Placement
- A component used in **one** feature → `features/<domain>/components/`.
- A component used in **two or more** features → `shared/components/`.
- Base UI primitives (buttons, inputs, dialogs) → `components/ui/` — import them, never rewrite them.

---

## 4. Shared Components — Use Before Creating New Ones

Before writing any new component, check if these shared components already cover the need:

| Component | Import path | When to use |
| :--- | :--- | :--- |
| `LoadingSpinner` | `@/shared/components` | All loading states |
| `ErrorAlert` | `@/shared/components` | All error display states |
| `SubmitButton` | `@/shared/components` | All form submit buttons |
| `FormField` | `@/shared/components` | All labeled form inputs |
| `TableToolbar` | `@/shared/components` | Search + filter toolbars above tables |
| `SelectDropdown` | `@/shared/components` | All dropdown selects in forms/filters |
| `ConfirmDeleteModal` | `@/shared/components` | All destructive action confirmations |
| `RoleGuard` | `@/shared/components` | Role-based UI visibility |
| `Breadcrumbs` | `@/shared/components` | All page breadcrumb navigation |

**Rule**: If a shared component already exists, **use it**. Never rewrite or duplicate it inline.

---

## 5. State Management

| State type | Where it lives | How to use |
| :--- | :--- | :--- |
| **Data from the server** | TanStack Query | `useQuery` / `useMutation` in feature hooks |
| **Filter/modal/selection state** | `useState` in View component | Local, scoped to the feature view |
| **Global UI state** (sidebar, theme) | Zustand `src/stores/ui.store.ts` | `useUIStore()` |
| **Auth session state** | Zustand `src/stores/auth.store.ts` | `useAuthStore()` |
| **Notification/toast state** | Zustand `src/stores/notification.store.ts` | `useNotificationStore()` |
| **Form values** | React Hook Form | `useForm()` with Zod resolver |

---

## 6. TanStack Query Patterns

Every feature must follow this query hook structure:

```ts
// 1. Define query keys as constants at the top of the hook file
export const EXAMPLE_QUERY_KEYS = {
  all: ["example"] as const,
  list: (filters: ExampleFilters) => [...EXAMPLE_QUERY_KEYS.all, "list", filters] as const,
  detail: (id: string) => [...EXAMPLE_QUERY_KEYS.all, "detail", id] as const,
};

// 2. Query hooks return useQuery directly
export function useExamples(filters: ExampleFilters = {}) {
  return useQuery({
    queryKey: EXAMPLE_QUERY_KEYS.list(filters),
    queryFn: () => exampleService.getExamples(filters),
  });
}

// 3. Mutation hooks invalidate the full domain key on success
export function useCreateExample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamplePayload) => exampleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMPLE_QUERY_KEYS.all });
    },
  });
}
```

- Always invalidate at the domain `all` key after mutations.
- Never call `apiClient` directly in components — always through a service → hook.

---

## 7. Service Layer Patterns

All API calls are made via `@/lib/apiClient` (Axios instance with auth interceptors):

```ts
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";

export const exampleService = {
  async getExamples(filters: ExampleFilters): Promise<PaginatedExamplesResponse> {
    const params = new URLSearchParams();
    // build params...
    const response = await apiClient.get<ApiResponse<ExampleItem[]>>(
      `${API_ENDPOINTS.EXAMPLES.BASE}?${params}`
    );
    return { data: response.data.data, pagination: response.data.pagination };
  },
};
```

- All endpoints are defined in `@/constants/api-endpoints`. Never hardcode URL strings.
- Always type the Axios generic with `ApiResponse<T>`.

---

## 8. Form Pattern

Use React Hook Form + Zod for all forms. No exceptions:

```ts
const schema = z.object({ name: z.string().min(1, "Name is required") });
type FormValues = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

- Use `<FormField>` from `@/shared/components` for labeled inputs with error messages.
- Use `<SubmitButton isLoading={mutation.isPending}>` for form submission — never a raw `<button>`.
- Reset the form on modal close. Never leave stale form data when a modal reopens.

---

## 9. Styling & Theme Rules

### 9.1. Use Design Tokens — Never Hardcode Colors
Use CSS variables from `globals.css`. Never use Tailwind raw colors (e.g., `bg-blue-500`):

| Token | Usage |
| :--- | :--- |
| `bg-background`, `bg-card` | Page and card backgrounds |
| `text-foreground`, `text-muted-foreground` | Primary and secondary text |
| `bg-primary`, `text-primary-foreground` | Brand action buttons |
| `border-border` | All borders and dividers |
| `bg-destructive` | Destructive/delete actions only |

### 9.2. Typography — Font & Sizing
- Font family: **Inter** (`--font-sans`) — already set globally. Never override with another font.
- Follow the type scale defined in `globals.css`: `text-h1`, `text-h2`, `text-body`, `text-small`, `text-label`.
- Page headings use `font-semibold` (`--font-weight-heading: 600`). Body text uses `font-normal`.

### 9.3. Layout & Responsiveness (Mobile-First)
- All layouts must be responsive. Design for mobile first, then add `sm:`, `md:`, `lg:` breakpoints.
- Standard page wrapper: `max-w-7xl mx-auto w-full`.
- Standard card: `bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs`.
- Standard content spacing: `space-y-4` between major sections.

### 9.4. Icons
- Use `lucide-react` only. Never introduce another icon library.
- Icon sizes: `size={14}` for inline/toolbar icons, `size={16}`–`size={20}` for standard icons, `size={32}` for large loading states.

### 9.5. Forbidden Styling Patterns
- ❌ Do NOT hardcode hex colors or raw Tailwind palette colors (`text-blue-500`, `bg-green-400`).
- ❌ Do NOT introduce a new theme, new color palette, or override existing design tokens.
- ❌ Do NOT use inline `style={{}}` for theming properties — use Tailwind utility classes.
- ❌ Do NOT add decorative stat cards, empty descriptions, or irrelevant information blocks.
- ✅ UI must be **clean, minimal, and functional** — show only what the user for their role needs to act on.

---

## 10. Language & User-Facing Text

Use plain, educational language understood by all users — teachers, students, and school administrators:

| ❌ Avoid (jargon / technical) | ✅ Use instead (plain / educational) |
| :--- | :--- |
| "Mutate record" | "Save changes" |
| "Fetch data" | "Load" |
| "Invalidate cache" | — (never shown in UI) |
| "RBAC permissions" | "Access level" |
| "Tenant" | "School" |
| "Provisioning" | "Adding" / "Enrolling" |
| "Repository" | — (never shown in UI) |
| "Unauthenticated" | "Please sign in to continue" |

- Labels, button text, placeholders, and error messages must all use plain language.
- Error messages must be actionable: tell the user what went wrong and what to do next.

---

## 11. Performance Rules

- **`useMemo`**: Use to memoize expensive derived data (e.g., formatted table rows, filtered lists computed from large arrays). Do NOT use it prematurely on simple values.
- **`useCallback`**: Use for callback props passed to memoized child components.
- **Lazy loading**: Use `React.lazy` + `Suspense` for heavy components (e.g., PDF viewers, rich text editors, chart panels) that are not needed on initial render.
- **`useDebounce`** from `@/shared/hooks`: Use for all search inputs before triggering API queries.

---

## 12. Role-Based UI

Respect user roles in UI rendering. Use `<RoleGuard>` from `@/shared/components` or check roles from `useAuthStore()`:

```ts
import { APP_ROLES } from "@/constants/roles";
// APP_ROLES: SYSTEM_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT
```

- Actions available only to admins must be hidden (not just disabled) from teachers and students.
- Never display administrative controls to students. Keep each role's view clean and focused on their tasks.

---

## 13. Hydration Safety

- Avoid rendering dynamic values (dates, random IDs, window dimensions) during SSR without a client guard.
- Wrap browser-only logic in `useEffect` or check `typeof window !== "undefined"`.
- Components with client-only data (auth state, local storage) must be `'use client'` and wrapped with a loading guard to prevent hydration mismatches.

---

## 14. Coding Guardrails (Non-Negotiable)

1. **Zero `any` types** — use `z.infer<typeof schema>`, explicit interfaces, or `unknown` with narrowing.
2. **Zero `console.log`** — no debug output in production code.
3. **No unused imports** — enforced by ESLint.
4. **No unapproved libraries** — use only packages already in `apps/web/package.json`.
5. **No inline logic in JSX** — extract handlers and computed values to named variables above the return.
6. **Zero blast radius** — never modify unrelated files. Confine changes to the target feature.
7. **Pre-task check**: Run `pnpm typecheck` and `pnpm lint` before marking any task complete.

---

## 15. Responsive Design — Mobile-First (Mandatory)

### 15.1. Breakpoint System
All layouts must be built mobile-first using Tailwind breakpoint prefixes. These match the project's `THEME_BREAKPOINTS` in [`@/constants/theme.ts`](src/constants/theme.ts):

| Prefix | Min-width | Target |
| :--- | :--- | :--- |
| *(none)* | 320px | Mobile (base, always write this first) |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptop / desktop |
| `xl:` | 1280px | Wide desktop |
| `2xl:` | 1536px | Ultra-wide |

### 15.2. Standard Responsive Patterns

**Page wrapper** — always use this on every page:
```tsx
<div className="max-w-7xl mx-auto w-full px-3 sm:px-4 pb-10">
```

**Content card:**
```tsx
<div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
```

**Grid layouts:**
```tsx
// 1 col mobile → 2 col tablet → 3 col desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// 1 col mobile → 2 col desktop (for forms)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Flex toolbars (used in TableToolbar):**
```tsx
// Stack vertically on mobile, row on desktop
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
```

**Buttons in toolbars:**
```tsx
// Full width on mobile, auto width on desktop
<button className="w-full sm:w-auto h-9 px-3.5 ...">
```

### 15.3. Touch & Tap Targets
- All interactive elements (buttons, links, dropdown items) must have a minimum height of `h-9` (36px) on mobile.
- Form inputs: use `h-10` (`40px`) on all screen sizes for comfortable touch interaction.
- Never make tap targets smaller than 36px — users on phones cannot tap tiny elements.

### 15.4. Text Responsiveness
Follow the type scale from `globals.css` — font sizes step up automatically via media queries:

| Element | Mobile size | Desktop size (`md:+`) |
| :--- | :--- | :--- |
| `h1` / `.text-h1` | `24px` | `30px` |
| `h2` / `.text-h2` | `20px` | `24px` |
| `h3` / `.text-h3` | `18px` | `20px` |
| `h4` / `.text-h4` | `16px` | `18px` |
| Body text | `16px` | `16px` |
| Labels / small | `14px` | `14px` |

Never override these with arbitrary `text-[13px]` or `text-base` on headings.

---

## 16. Theme Consistency — Color, Spacing, Radius, Shadows, Z-index, Transitions

### 16.1. Color Tokens (Use CSS variables — NEVER raw colors)

All colors are defined in `globals.css` as CSS variables and exported in [`@/constants/theme.ts`](src/constants/theme.ts). **Never use raw Tailwind palette colors** (`bg-blue-500`, `text-slate-400`).

| Intent | Tailwind token to use | CSS variable |
| :--- | :--- | :--- |
| Page background | `bg-background` | `--background: #F8FAFC` |
| Card / panel surface | `bg-card` | `--card: #FFFFFF` |
| Primary text | `text-foreground` | `--foreground: #334155` |
| Heading text | `text-card-foreground` | `--card-foreground: #0F172A` |
| Secondary / muted text | `text-muted-foreground` | `--muted-foreground: #64748B` |
| Disabled text | — | `--text-disabled: #94A3B8` |
| Brand action (CTA) | `bg-primary text-primary-foreground` | `--primary: #0EA5E9` |
| Brand hover | `hover:bg-primary/90` | `--primary-hover: #0284C7` |
| Destructive / delete | `bg-destructive text-destructive-foreground` | `--destructive: #DC2626` |
| Success | — | `--success: #10B981` |
| Accent / highlight | `bg-accent text-accent-foreground` | `--accent: #F97316` |
| Dividers / borders | `border-border` | `--border: #E2E8F0` |
| Input borders | `border-input` | `--input: #E2E8F0` |
| Muted backgrounds | `bg-muted` | `--muted: #F1F5F9` |
| Sidebar background | `bg-sidebar` | `--sidebar: #0F172A` |
| Focus ring | `ring-ring` | `--ring: #38BDF8` |

### 16.2. Border Radius
Use Tailwind radius utilities that map to the project's design tokens (`THEME_RADIUS`):

| Token | Value | Use on |
| :--- | :--- | :--- |
| `rounded-md` | `8px` | Inputs, small buttons, badges, tags |
| `rounded-lg` | `12px` | Cards, dropdowns, popovers, table rows |
| `rounded-xl` | — | Form buttons (`SubmitButton` default) |
| `rounded-2xl` | — | Page-level cards and panel containers |
| `rounded-full` | — | Avatar images, pills, status badges |

### 16.3. Shadows
Use only these shadow utilities (mapped to `THEME_SHADOWS`):

| Class | Use on |
| :--- | :--- |
| `shadow-xs` | Cards, toolbar containers, table panels |
| `shadow-sm` | Dropdown menus, popover panels |
| `shadow-md` | Modals, elevated panels |
| `shadow-2xs` | Small inline elements (toolbar action buttons) |

Never use `shadow-lg` or higher on page-level cards — keep surfaces clean.

### 16.4. Spacing
Use Tailwind spacing that maps to `THEME_SPACING`. The standard scale is: `1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px`.

- Section gaps: `space-y-4` (16px)
- Card inner padding: `p-3.5 sm:p-4` (14px mobile → 16px desktop)
- Form field gaps: `gap-4` (16px)
- Inline icon gaps: `gap-1.5` (6px) for small, `gap-2` (8px) for standard

### 16.5. Z-index Layers (from `THEME_Z_INDEX`)
Never use arbitrary z-index values. Only use:

| Layer | Value | Used by |
| :--- | :--- | :--- |
| `z-[1000]` | 1000 | Dropdown menus |
| `z-[1100]` | 1100 | Sticky headers |
| `z-[1200]` | 1200 | Overlay backdrops |
| `z-[1300]` | 1300 | Modal dialogs |
| `z-[1400]` | 1400 | Popovers, tooltips |
| `z-[1500]` | 1500 | Toast notifications |

### 16.6. Transitions
Use only these transition durations (from `THEME_TRANSITIONS`):
- `transition-colors duration-150` — hover color changes on buttons, links
- `transition-all duration-200` — standard interactive element transitions (`SubmitButton` default)
- `transition-all duration-300` — sidebar open/close, panel expand/collapse

Never use arbitrary `duration-500` or higher — keep interactions snappy.

---

## 17. shadcn / base-ui Component Usage Rules

### 17.1. Available Components (`src/components/ui/`)
The following are the only pre-built UI primitives. **Always use them — never write raw HTML equivalents:**

| Component | Use for |
| :--- | :--- |
| `Button` | All clickable actions (import from `@/components/ui/button`) |
| `Dialog` + `DialogContent` | All modals and overlays |
| `Select` | Native-style select inputs (when `SelectDropdown` is not needed) |
| `Input` | All text input fields |
| `Textarea` | Multi-line inputs |
| `Label` | All form labels (never use raw `<label>`) |
| `Badge` | Status indicators, count pills |
| `Checkbox` | All checkbox controls |
| `RadioGroup` | All radio button groups |
| `Switch` | Toggle on/off settings |
| `Tabs` + `TabsList` | Tab navigation within pages |
| `Table` + `TableRow` | All data tables |
| `Skeleton` | Loading placeholder states |
| `Tooltip` | Icon-only buttons and abbreviated labels |
| `Sheet` | Slide-in side panels on mobile |
| `Accordion` | Collapsible content sections |
| `Popover` | Contextual floating panels |
| `ScrollArea` | Custom scrollable containers |
| `Pagination` | Table and list pagination controls |
| `Progress` | Progress bars for uploads, steps |
| `Alert` | Inline alert banners (distinct from `ErrorAlert` toast) |
| `Toast` | System-level toast notifications |

### 17.2. shadcn Component Rules
- **Never copy-paste** shadcn component code into feature files. Import from `@/components/ui/*`.
- **Never override** component internals by modifying files in `src/components/ui/`. Extend via `className` prop and `cn()` only.
- **Never re-implement** a dropdown, modal, tooltip, or popover from scratch. A shadcn/base-ui primitive already exists.
- **Always use `cn()`** from `@/lib/utils` to merge Tailwind classes conditionally. Never concatenate class strings manually.

### 17.3. Dropdown & Select Consistency

Choose the correct component based on context:

| Situation | Use |
| :--- | :--- |
| Form field — user selects one option | `<SelectDropdown>` from `@/shared/components` |
| Toolbar filter — simple status/type filter | `<TableToolbar filterGroups={...}>` |
| Action menu — right-click / kebab menu | `<DropdownMenu>` from `@/components/ui/dropdown-menu` |
| Combobox with search (large list > 7 items) | `<SelectDropdown searchable>` (auto-enables search) |
| Native HTML select (never) | ❌ Never use raw `<select>` |

**All dropdowns must:**
- Open on click, close on outside click (`useClickOutside` already built into `SelectDropdown`).
- Be fully keyboard-navigable (shadcn base-ui handles this automatically).
- Show a checkmark (✓) next to the selected option.
- Use `bg-popover border border-border rounded-lg shadow-sm` for the dropdown panel.
- Never overlap page headers or modals (z-index `1000` for dropdowns, `1300` for modals).
- On mobile: full-width dropdown panels, min-height `h-9` per item.

---

## 18. UI Consistency Standards

### 18.1. Page Structure — Always Follow This Pattern
```tsx
// Standard feature page layout
<div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
  {/* 1. Toolbar card */}
  <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
    <TableToolbar ... />
  </div>

  {/* 2. Content (table, list, or grid) */}
  <FeatureTable items={items} ... />

  {/* 3. Modals — always at bottom of the view component */}
  <FeatureFormModal ... />
  <FeatureDetailModal ... />
</div>
```

### 18.2. Loading States — Always Use `LoadingSpinner`
```tsx
if (isLoading) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <LoadingSpinner size={32} />
    </div>
  );
}
```
Never use a `Skeleton` loader in place of `LoadingSpinner` for full-page data loading — use `Skeleton` only for partial inline placeholder states (e.g., individual table cell shimmer).

### 18.3. Empty States
When a data list returns zero results, show a simple, clean empty state:
```tsx
<div className="py-12 text-center">
  <p className="text-muted-foreground text-sm">No results found.</p>
</div>
```
Never show stat cards, promotional copy, or descriptions in empty state views.

### 18.4. Modal Consistency
- All modals use `<Dialog>` from `@/components/ui/dialog`.
- Modal width: `max-w-md` for simple forms, `max-w-2xl` for complex multi-field forms.
- Always show a close button (X icon) in the top-right corner.
- Footer: action buttons right-aligned — Cancel (ghost/outline) on the left, primary action on the right.
- Never put more than one primary action button in a modal footer.

### 18.5. Table Consistency
- Use `<Table>` from `@/components/ui/table` for all data tables.
- All tables must support horizontal scroll on mobile: wrap in `<div className="overflow-x-auto">`.
- Column headers: `text-xs font-semibold text-muted-foreground uppercase tracking-wide`.
- Row hover: `hover:bg-muted/50 transition-colors duration-150`.
- Action column: always the last column, right-aligned, using icon buttons with `Tooltip`.

### 18.6. Button Hierarchy
Use exactly one primary action per view. Secondary actions use outline or ghost:

| Variant | When to use |
| :--- | :--- |
| `default` (primary) | Main action: Save, Add, Submit — one per modal/view |
| `outline` | Secondary actions: Cancel, Edit |
| `ghost` | Tertiary actions: Close, Dismiss |
| `destructive` | Delete / remove actions only |

---

## 19. Error Handling — User Experience First

### 19.1. Always Use `<ErrorAlert>` — Never Show Raw Error Objects

Import `ErrorAlert` from `@/shared/components`. It is the **only** component for displaying errors to users:

```tsx
import { ErrorAlert } from "@/shared/components";

if (error) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ErrorAlert message={getErrorMessage(error, "Unable to load this information. Please try again.")} />
    </div>
  );
}
```

Always pass the error through `getErrorMessage()` from `@/shared/utils`. This utility extracts a safe, readable string from Axios errors, API responses, or unknown error objects.

### 19.2. User-Friendly Error Messages — Non-Technical Language

Never expose internal error details, stack traces, HTTP status codes, or technical identifiers to users:

| ❌ Never show this | ✅ Show this instead |
| :--- | :--- |
| "Error 404: Not Found" | "This record could not be found. It may have been removed." |
| "Request failed with status 500" | "Something went wrong on our end. Please try again." |
| "Unauthorized 401" | "Your session has expired. Please sign in again." |
| "Network Error" | "Could not connect. Please check your internet connection." |
| "Unique constraint failed" | "This record already exists. Please use a different name." |
| "P2025: Record not found" | "This item no longer exists." |
| "Failed to fetch" | "Unable to load this page. Please refresh and try again." |

### 19.3. Mutation Error Handling (Forms)
For form submission errors, display the error below the form — never as a browser `alert()`:

```tsx
const mutation = useCreateExample();

onSubmit = async (values) => {
  try {
    await mutation.mutateAsync(values);
    onClose();
  } catch (error) {
    // ErrorAlert renders inline — no alert(), no console.log
  }
};

// In JSX, below the form fields:
{mutation.error && (
  <ErrorAlert message={getErrorMessage(mutation.error, "Could not save. Please check your entries and try again.")} />
)}
```

### 19.4. Error Message Rules
- Always use plain language — as if explaining to a teacher or student who has no technical background.
- Messages must be **actionable**: tell the user what happened AND what they can do next.
- Keep messages concise — one or two sentences maximum.
- Never use technical terms: no "HTTP", "API", "server", "fetch", "null", "undefined", "500", "404".
- Form validation errors (from Zod) display inline below each field via `FormField`. Do not duplicate them in `ErrorAlert`.
