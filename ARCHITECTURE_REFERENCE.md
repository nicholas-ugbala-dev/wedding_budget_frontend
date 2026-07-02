# Architecture Reference — rigour-os-provider Analysis
> Studied from the enterprise Hydra Provider Dashboard (healthcare SaaS EMR).
> This document captures the patterns worth replicating in the wedding budget frontend.

---

## 1. Project Setup & Tooling

| Decision | rigour-os-provider | Adopt? |
|---|---|---|
| Package manager | npm + package-lock.json | Yes — npm |
| Build tool | Next.js 13 Pages Router (SSR globally disabled) | No — use Vite |
| TypeScript | strict: true, baseUrl: "src/", path aliases | Yes — exact same tsconfig pattern |
| Linting | ESLint + @typescript-eslint + prettier | Yes |
| Pre-commit | Husky + lint-staged (prettier then eslint) | Yes |
| Font | next/font/google (Mulish) | Adapt — use Geist or Inter via @fontsource |

**TypeScript aliases to replicate:**
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": "src/",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"]
    }
  }
}
```

**ESLint config pattern:**
```js
// .eslintrc.js
module.exports = {
  extends: ["@typescript-eslint/recommended", "plugin:react/recommended", "prettier"],
  rules: { "@typescript-eslint/no-explicit-any": "warn" }
};
```

**Prettier (exact config):**
```json
{ "semi": true, "singleQuote": false, "tabWidth": 2, "trailingComma": "all", "printWidth": 100 }
```

---

## 2. Folder Structure

The enterprise app organizes by feature within `components/`, not by atomic type. This is the pattern to replicate.

```
src/
├── assets/               # SVGs, images
├── components/           # Feature components (PascalCase folders)
│   ├── ui/               # shadcn/ui primitives (auto-generated)
│   ├── Layout/           # App shell, auth layout, sidebar
│   ├── Dashboard/
│   ├── Expenses/
│   ├── Payments/
│   └── ...
├── constants/            # Static arrays and enum-like values
├── hooks/                # Shared custom hooks
├── lib/
│   ├── utils.ts          # cn() and shared utility functions
│   └── router.ts         # Re-export of router (swappable for tests)
├── services/
│   ├── api.ts            # ALL endpoint URL constants (one file)
│   └── axiosInstance.ts  # Axios instance + interceptors
├── store/
│   ├── requests/         # Pure axios call functions
│   ├── queries/          # useQuery wrappers (one file per domain)
│   ├── mutations/        # useMutation wrappers (one file per domain)
│   └── queryKeys.ts      # ALL cache key strings (one file)
├── tables/               # TanStack Table column definitions
├── types/                # TypeScript interfaces (one file per domain)
├── validations/          # Zod schemas (one file per domain)
└── zustand/              # Global client state stores
```

**Key principle:** Each feature folder may contain:
- `index.tsx` — main component
- `use<Feature>.tsx` — co-located business logic hook
- Sub-folders for modals, forms, sub-sections
- No SCSS modules — Tailwind only

---

## 3. API Layer — The 3-Layer Pattern

This is the most important pattern. Every API interaction follows a strict 3-layer chain:

### Layer 1 — Request functions (`store/requests/*.ts`)
Pure async functions. No React. No hooks. Just Axios calls.

```ts
// src/store/requests/expenses.ts
import { instance } from "@/services/axiosInstance";
import { LIST_EXPENSES, GET_EXPENSE } from "@/services/api";
import type { CreateExpensePayload, ExpenseRow } from "@/types/expenses";

export const fetchExpenses = async (params: Record<string, unknown>) => {
  const res = await instance.get(LIST_EXPENSES, { params });
  return res.data;
};

export const createExpense = async (payload: CreateExpensePayload) => {
  const res = await instance.post(LIST_EXPENSES, payload);
  return res.data;
};

export const fetchExpenseById = async (id: string) => {
  const res = await instance.get(GET_EXPENSE(id));
  return res.data;
};
```

### Layer 2 — Query/Mutation hooks (`store/queries/*.ts`, `store/mutations/*.ts`)
TanStack Query wrappers. Business logic lives here (onSuccess, onError, toast).

```ts
// src/store/queries/useExpenses.ts
import { useQuery } from "@tanstack/react-query";
import { fetchExpenses } from "@/store/requests/expenses";
import { EXPENSES_KEY } from "@/store/queryKeys";

export const useGetExpenses = (params: ExpenseFilters) => {
  return useQuery({
    queryKey: [EXPENSES_KEY, params],
    queryFn: () => fetchExpenses(params),
    select: (res) => res.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
```

```ts
// src/store/mutations/useExpenses.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/store/requests/expenses";
import { EXPENSES_KEY } from "@/store/queryKeys";
import { toast } from "sonner";

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      toast.success("Expense created");
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message ?? "Something went wrong");
    },
  });
};
```

### Layer 3 — Components
Components call hooks, render UI. No direct Axios calls ever in a component.

```tsx
// src/components/Expenses/ExpenseList.tsx
const ExpenseList = () => {
  const [filters, setFilters] = useReducerSpread({ page: 1, limit: 10 });
  const { data, isLoading } = useGetExpenses(filters);
  const { mutate: create, isPending } = useCreateExpense();
  // ...
};
```

---

## 4. Centralized API URL Constants

Single file. All endpoints. Dynamic routes use factory functions.

```ts
// src/services/api.ts
const BASE = import.meta.env.VITE_API_BASE_URL;

// Auth
export const LOGIN = `${BASE}/auth/login`;
export const REGISTER = `${BASE}/auth/register`;
export const ME = `${BASE}/auth/me`;

// Expenses
export const EXPENSES = `${BASE}/expenses`;
export const EXPENSE_BY_ID = (id: string) => `${BASE}/expenses/${id}`;
export const EXPENSE_PAYMENTS = (id: string) => `${BASE}/expenses/${id}/payments`;
export const DELETE_PAYMENT = (expenseId: string, paymentId: string) =>
  `${BASE}/expenses/${expenseId}/payments/${paymentId}`;

// Payments
export const PAYMENTS = `${BASE}/payments`;
export const PAYMENT_SUMMARY = `${BASE}/payments/summary`;
export const PAYMENT_TYPES = `${BASE}/payments/types`;

// Dashboard
export const DASHBOARD = `${BASE}/dashboard`;

// Ceremonies
export const CEREMONIES = `${BASE}/ceremonies`;
export const CEREMONY_BY_ID = (id: string) => `${BASE}/ceremonies/${id}`;

// Currencies
export const CURRENCIES = `${BASE}/currencies`;
export const CURRENCY_BY_CODE = (code: string) => `${BASE}/currencies/${code}`;

// Vendors
export const VENDORS = `${BASE}/vendors`;
export const VENDOR_BY_ID = (id: string) => `${BASE}/vendors/${id}`;

// Categories
export const CATEGORIES = `${BASE}/categories`;
export const CATEGORY_BY_ID = (id: string) => `${BASE}/categories/${id}`;

// Settings
export const SETTINGS_ACCOUNT = `${BASE}/settings/account`;
```

---

## 5. Centralized Query Keys

Single file. One constant per domain. Include param-dependent variants as arrays.

```ts
// src/store/queryKeys.ts

// Auth
export const ME_KEY = "me";

// Expenses
export const EXPENSES_KEY = "expenses";
export const EXPENSE_DETAIL_KEY = "expense-detail";

// Payments
export const PAYMENTS_KEY = "payments";
export const PAYMENT_SUMMARY_KEY = "payment-summary";
export const PAYMENT_TYPES_KEY = "payment-types";

// Dashboard
export const DASHBOARD_KEY = "dashboard";

// Ceremonies
export const CEREMONIES_KEY = "ceremonies";

// Currencies
export const CURRENCIES_KEY = "currencies";

// Vendors
export const VENDORS_KEY = "vendors";

// Categories
export const CATEGORIES_KEY = "categories";
```

---

## 6. Axios Instance & Auth Interceptors

```ts
// src/services/axiosInstance.ts
import axios from "axios";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const instance = axios.create({ baseURL: BASE_URL });

// Attach token on every request (reads from localStorage at call time)
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);
```

**Key difference from rigour-os-provider:** Token is read from `localStorage` on every request via the request interceptor (not set once on `defaults.headers`). This correctly handles token updates without needing to restart the instance.

---

## 7. Auth Flow (localStorage)

```ts
// Login mutation onSuccess
onSuccess: (res) => {
  const token = res.data.token;
  localStorage.setItem("auth_token", token);
  // Redirect to dashboard
  navigate({ to: "/dashboard" });
}

// Logout
const logout = () => {
  localStorage.removeItem("auth_token");
  navigate({ to: "/auth/login" });
};

// useGetUser hook
export const useGetUser = () => {
  return useQuery({
    queryKey: [ME_KEY],
    queryFn: () => instance.get(ME).then(r => r.data.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
```

**Route protection:** Auth guard component or hook checks `localStorage.getItem("auth_token")`. No JWT decoding needed — just presence check. The 401 interceptor handles expiry server-side.

---

## 8. Form Pattern — React Hook Form + Zod

The enterprise codebase is actively migrating to this. Use it from day one.

```ts
// src/validations/expenses.ts
import { z } from "zod";

export const createExpenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ceremony_id: z.uuid(),
  category_id: z.uuid().optional(),
  category_name: z.string().optional(),
  vendor_id: z.uuid().optional(),
  vendor_name: z.string().optional(),
  actual_amount: z.number().int().nonnegative().optional(),
  planned_amount: z.number().int().nonnegative().optional(),
  payment_deadline: z.string().date().optional(),
  is_planned: z.boolean().default(false),
  notes: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
```

```tsx
// src/components/Expenses/AddExpenseForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpenseSchema, CreateExpenseInput } from "@/validations/expenses";

const form = useForm<CreateExpenseInput>({
  resolver: zodResolver(createExpenseSchema),
  defaultValues: { is_planned: false },
});
```

---

## 9. `useReducerSpread` — Adopt This Pattern

Ergonomic state for objects with multiple fields (filters, pagination, form-like local state).

```ts
// src/hooks/useReducerSpread.ts
import { useReducer } from "react";

type Action<T> = Partial<T>;

function spreadReducer<T>(state: T, action: Action<T>): T {
  return { ...state, ...action };
}

export function useReducerSpread<T extends object>(initialState: T) {
  return useReducer(spreadReducer<T>, initialState);
}
```

Usage:
```ts
const [filters, setFilters] = useReducerSpread({ page: 1, limit: 10, ceremony_id: undefined });
setFilters({ page: 2 });          // merges, doesn't replace
setFilters({ ceremony_id: uuid }); // partial update
```

---

## 10. Styling — Design Token Pattern

CSS variables on `:root` → surfaced into Tailwind config. This is the pattern that makes the design system consistent.

```scss
/* src/styles/tokens.css */
:root {
  --color-brand: #your-brand-color;
  --color-brand-light: #lighter;
  --color-text-primary: #070808;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-surface: #f9fafb;
  --color-danger: #fb3640;
  --color-success: #10b981;
  --color-warning: #f59e0b;
}
```

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "var(--color-brand)",
        "brand-light": "var(--color-brand-light)",
        text: {
          primary: "var(--color-text-primary)",
          muted: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        surface: "var(--color-surface)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
      },
    },
  },
};
```

Then use `text-text-muted`, `bg-surface`, `border-border` as Tailwind utilities.

---

## 11. shadcn/ui Component Pattern

- `components.json` config: `style: "new-york"`, `cssVariables: true`
- `src/components/ui/` — shadcn primitives only (auto-generated, do not hand-edit)
- `src/lib/utils.ts` — the `cn()` function (twMerge + clsx)
- Custom components in `src/components/<Feature>/` compose primitives, never copy them

---

## 12. Table Pattern

Column definitions separated from rendering:

```ts
// src/tables/expenses.columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import type { ExpenseRow } from "@/types/expenses";

export const expenseColumns: ColumnDef<ExpenseRow>[] = [
  { accessorKey: "name", header: "Expense" },
  { accessorKey: "vendor_name", header: "Vendor" },
  // ...
];
```

Generic `DataTable` component accepts `columns`, `data`, `isLoading`, `emptyState`, pagination.

---

## 13. Error Handling

```tsx
// src/components/ui/error-boundary.tsx — class component
// Wraps entire app in main.tsx

// API errors — single utility:
// src/lib/toast.ts
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const toastError = (err: AxiosError<{ message: string }>) => {
  const msg = err.response?.data?.message ?? "Something went wrong";
  toast.error(msg);
};

// Every mutation onError calls: toastError(err as AxiosError<...>)
```

---

## 14. Patterns NOT Adopted (from rigour-os-provider)

| Pattern | Why skip |
|---|---|
| Formik + Yup | They're migrating away from it; RHF + Zod is the better starting point |
| SCSS modules | Tailwind-only is cleaner for a greenfield project |
| Cookie-based auth | Using localStorage per product decision |
| `rigour-os-ui` internal package | Not applicable; use shadcn/ui |
| PostHog | Not needed at this stage |
| Next.js (SSR globally disabled) | Use Vite + TanStack Router for a pure SPA — cleaner, faster DX |
| `withProvider` HOC pattern | Overly complex; direct mutation calls are cleaner |
| Antd for complex widgets | Tailwind + shadcn covers all needs |

---

## Summary — Stack Decisions for Wedding Budget Frontend

| Concern | Decision |
|---|---|
| Framework | **Vite + React 18 + TypeScript** |
| Routing | **TanStack Router v1** (file-based optional, type-safe params) |
| Server state | **TanStack Query v5** |
| Client state | **Zustand** (minimal, only for global UI state) |
| Forms | **React Hook Form + Zod** |
| HTTP | **Axios** with request interceptor for token + 401 interceptor for logout |
| UI | **shadcn/ui** (Radix + CVA + Tailwind) |
| Styling | **Tailwind + CSS variable design tokens** |
| Tables | **TanStack Table v8** with separated column definitions |
| Toasts | **Sonner** (shadcn default, simpler than react-toastify) |
| Auth storage | **localStorage** (`auth_token`) |
| Pre-commit | **Husky + lint-staged** (prettier → eslint) |
| Testing | **Vitest + Testing Library + MSW** |
