# Munachi Budget Tracker — Frontend Implementation Plan

> This file is a copy of the plan saved at `/Users/sark/.claude/plans/agile-plotting-wind.md`.
> It lives here so it stays with the frontend repo and is easy to reference while building.

---

## Context
Building the Munachi wedding budget tracker frontend from scratch. The design source is the Claude Design file (project `7df7bbcb-4e47-4396-952b-b0d18c668bd9`, file `Munachi.dc.html`). The backend API is complete at `http://localhost:8000/api/v1`. The user will type all code themselves to learn — this plan is a step-by-step build guide with exact commands and code to type.

**Stack confirmed:** Vite + React 18 + TypeScript · TanStack Router · TanStack Query v5 · Axios · React Hook Form + Zod · Tailwind CSS · shadcn/ui · Zustand · Sonner · `@tabler/icons-react`

**Design tokens from Munachi.dc.html:**
- Background: `#F7F6F2` · Sidebar: `#EDECEA` · Surface: `#FFFFFF` · Panel: `#FAFAF8`
- Brand green: `#3A7A5A` · Text primary: `#1C1B18` · Text secondary: `#595650` · Text muted: `#9B9890`
- Border: `#E8E6E0` · Inner border: `#F0EDE6`
- Green (paid): `#3A7A5A` · Red (outstanding): `#C43C3C` · Amber (over budget): `#B87820`
- Font: `DM Sans` · Icons: Tabler Icons

**Screens:** Login · Register · Forgot/Reset Password · Onboard 1–2 · Overview · All Expenses · Expense Detail · Payments · Settings · Add Expense slide-panel · Add Payment slide-panel

---

## Phase 1 — Bootstrap the project

Type these commands in your terminal from `wedding_budget_frontend/`:

```bash
npm create vite@latest . -- --template react-ts
```

When prompted — select nothing (`.` means current directory, template already set).

Then install all dependencies in one shot:

```bash
npm install

npm install \
  @tanstack/react-router \
  @tanstack/react-query \
  axios \
  react-hook-form \
  @hookform/resolvers \
  zod \
  zustand \
  sonner \
  @tabler/icons-react \
  class-variance-authority \
  clsx \
  tailwind-merge \
  @radix-ui/react-dialog \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-label \
  @radix-ui/react-slot

npm install -D \
  @tanstack/router-devtools \
  @tanstack/react-query-devtools \
  tailwindcss \
  @tailwindcss/vite \
  @types/node \
  @vitejs/plugin-react-swc \
  @tanstack/router-plugin
```

---

## Phase 2 — Configure Tailwind + Vite

**`vite.config.ts`** — replace entirely:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173 },
})
```

**`tsconfig.json`** — add path aliases inside `compilerOptions`:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

**`src/index.css`** — replace entirely (Tailwind entry + design tokens):
```css
@import "tailwindcss";

@theme {
  --color-brand: #3A7A5A;
  --color-brand-dark: #2E6348;
  --color-brand-light: #EEF5F1;

  --color-bg: #F7F6F2;
  --color-sidebar: #EDECEA;
  --color-surface: #FFFFFF;
  --color-panel: #FAFAF8;

  --color-text-primary: #1C1B18;
  --color-text-secondary: #595650;
  --color-text-muted: #9B9890;
  --color-text-faint: #C0BEB8;

  --color-border: #E8E6E0;
  --color-border-inner: #F0EDE6;

  --color-paid: #3A7A5A;
  --color-outstanding: #C43C3C;
  --color-over-budget: #B87820;

  --font-sans: 'DM Sans', system-ui, sans-serif;
}

*,*::before,*::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

input, select, button, textarea { font-family: inherit; }
input[type=number] { -moz-appearance: textfield; }
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
input:focus, select:focus, textarea:focus {
  outline: 2px solid var(--color-brand);
  outline-offset: 0;
}

@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
```

**`index.html`** — add DM Sans font in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
```

**.env** (create in project root):
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Phase 3 — Folder Structure

Create this structure (use `mkdir -p` or your IDE):

```
src/
├── assets/
├── components/
│   ├── ui/              ← shadcn primitives (auto-generated via CLI)
│   ├── layout/
│   │   ├── AppShell.tsx        ← sidebar + main content wrapper
│   │   ├── Sidebar.tsx
│   │   └── SlidePanel.tsx      ← right slide-over overlay
│   ├── auth/
│   ├── overview/
│   ├── expenses/
│   ├── payments/
│   └── settings/
├── hooks/
│   ├── useReducerSpread.ts
│   └── useAuth.ts
├── lib/
│   ├── utils.ts         ← cn() + color helpers
│   └── format.ts        ← currency formatters
├── routes/              ← TanStack Router file-based routes
│   ├── __root.tsx
│   ├── index.tsx        ← redirects to /overview or /login
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   ├── onboarding/
│   │   ├── step-1.tsx
│   │   └── step-2.tsx
│   └── _app/            ← authenticated layout group
│       ├── route.tsx    ← AppShell + auth guard
│       ├── overview.tsx
│       ├── expenses/
│       │   ├── index.tsx
│       │   └── $expenseId.tsx
│       ├── payments.tsx
│       └── settings.tsx
├── services/
│   ├── api.ts           ← ALL endpoint URL constants
│   └── axios.ts         ← Axios instance + interceptors
├── store/
│   ├── queryKeys.ts
│   ├── requests/        ← pure axios functions
│   ├── queries/         ← useQuery hooks
│   └── mutations/       ← useMutation hooks
├── types/               ← TypeScript interfaces (one per domain)
├── validations/         ← Zod schemas (one per domain)
└── main.tsx
```

---

## Phase 4 — Core Infrastructure

### `src/lib/utils.ts`
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cerStyle = (ceremony?: string) => {
  if (ceremony === 'Traditional') return { bg: '#FEF5E4', color: '#92600A', border: '#F5D89A' }
  return { bg: '#F0EEE9', color: '#595650', border: '#DDD9D3' }
}

export const statusStyle = (status?: string) => {
  if (status === 'paid')    return { bg: '#EEF5F1', color: '#2A5C41', label: 'Fully paid' }
  if (status === 'partial') return { bg: '#FDF5E6', color: '#92600A', label: 'Deposit paid' }
  return { bg: '#FDF0F0', color: '#A83030', label: 'Unpaid' }
}

export const progressColor = (p: number) => {
  if (p >= 100) return '#3A7A5A'
  if (p >= 70)  return '#B87820'
  if (p >= 50)  return '#D4891A'
  if (p > 0)    return '#C43C3C'
  return '#E0DDD6'
}

export const badgeStyle = (badge: string) => {
  if (badge === 'Missing info')   return { bg: '#FDF5E6', color: '#92600A' }
  if (badge === 'No vendor')      return { bg: '#FDF0F0', color: '#A83030' }
  if (badge === 'Pending refund') return { bg: '#FDF5E6', color: '#92600A' }
  if (badge === 'Unpaid')         return { bg: '#FDF0F0', color: '#A83030' }
  if (badge === 'Balance due')    return { bg: '#FDF0F0', color: '#A83030' }
  return { bg: '#F0EEE9', color: '#595650' }  // Unconfirmed
}
```

### `src/lib/format.ts`
```ts
export function fNGN(n: number | string | null | undefined): string {
  const num = Number(n)
  if (!num || num === 0) return '—'
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000)     return `₦${Math.round(num / 1_000)}k`
  return `₦${Math.round(num).toLocaleString()}`
}

export function fNGNFull(n: number | string | null | undefined): string {
  const num = Number(n)
  return `₦${Math.round(num).toLocaleString()}`
}

export function pct(paid: number, actual: number): number {
  return actual > 0 ? Math.round((paid / actual) * 100) : 0
}
```

### `src/hooks/useReducerSpread.ts`
```ts
import { useReducer } from 'react'

function spreadReducer<T>(state: T, action: Partial<T>): T {
  return { ...state, ...action }
}

export function useReducerSpread<T extends object>(initialState: T) {
  return useReducer(spreadReducer<T>, initialState)
}
```

### `src/services/api.ts`
```ts
const BASE = import.meta.env.VITE_API_BASE_URL

export const AUTH_LOGIN            = `${BASE}/auth/login`
export const AUTH_REGISTER         = `${BASE}/auth/register`
export const AUTH_ME               = `${BASE}/auth/me`
export const AUTH_ONBOARDING       = `${BASE}/auth/onboarding`
export const AUTH_ONBOARDING_CERS  = `${BASE}/auth/onboarding/ceremonies`
export const AUTH_ONBOARDING_CURS  = `${BASE}/auth/onboarding/currencies`
export const AUTH_FORGOT           = `${BASE}/auth/forgot-password`
export const AUTH_RESET            = `${BASE}/auth/reset-password`

export const CEREMONIES            = `${BASE}/ceremonies`
export const CEREMONY_BY_ID        = (id: string) => `${BASE}/ceremonies/${id}`

export const CURRENCIES            = `${BASE}/currencies`
export const CURRENCY_BY_CODE      = (code: string) => `${BASE}/currencies/${code}`

export const VENDORS               = `${BASE}/vendors`
export const VENDOR_BY_ID          = (id: string) => `${BASE}/vendors/${id}`

export const CATEGORIES            = `${BASE}/categories`
export const CATEGORY_BY_ID        = (id: string) => `${BASE}/categories/${id}`

export const EXPENSES              = `${BASE}/expenses`
export const EXPENSE_BY_ID         = (id: string) => `${BASE}/expenses/${id}`
export const EXPENSE_PAYMENTS      = (id: string) => `${BASE}/expenses/${id}/payments`
export const DELETE_PAYMENT        = (expId: string, payId: string) => `${BASE}/expenses/${expId}/payments/${payId}`

export const PAYMENTS              = `${BASE}/payments`
export const PAYMENT_SUMMARY       = `${BASE}/payments/summary`
export const PAYMENT_TYPES         = `${BASE}/payments/types`

export const DASHBOARD             = `${BASE}/dashboard`
export const SETTINGS_ACCOUNT      = `${BASE}/settings/account`
```

### `src/services/axios.ts`
```ts
import axios from 'axios'

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

### `src/store/queryKeys.ts`
```ts
export const ME_KEY              = 'me'
export const CEREMONIES_KEY      = 'ceremonies'
export const CURRENCIES_KEY      = 'currencies'
export const VENDORS_KEY         = 'vendors'
export const CATEGORIES_KEY      = 'categories'
export const EXPENSES_KEY        = 'expenses'
export const EXPENSE_DETAIL_KEY  = 'expense-detail'
export const PAYMENTS_KEY        = 'payments'
export const PAYMENT_SUMMARY_KEY = 'payment-summary'
export const PAYMENT_TYPES_KEY   = 'payment-types'
export const DASHBOARD_KEY       = 'dashboard'
```

### `src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
})

const router = createRouter({ routeTree })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>
)
```

> `routeTree.gen.ts` is auto-generated on first `npm run dev`.

---

## Phase 5 — shadcn/ui Setup

```bash
npx shadcn@latest init
# Style: New York  |  Base color: Stone  |  CSS variables: Yes

npx shadcn@latest add button input label select dialog separator skeleton
```

---

## Phase 6 — TanStack Router File Routes

### `src/routes/__root.tsx`
```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
export const Route = createRootRoute({ component: () => <Outlet /> })
```

### `src/routes/index.tsx`
```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')
    if (token) throw redirect({ to: '/overview' })
    throw redirect({ to: '/login' })
  },
})
```

### `src/routes/_app/route.tsx`
```tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')
    if (!token) throw redirect({ to: '/login' })
  },
  component: () => <AppShell><Outlet /></AppShell>,
})
```

---

## Phase 7 — Types (`src/types/`)

### `auth.ts`
```ts
export interface User {
  id: string; first_name: string; last_name: string; email: string
  base_currency: string; wedding_location: string | null
  event_name: string | null; event_date: string | null
  account_type: 'couple' | 'planner'; created_at: string
}
export interface AuthResponse { token: string; user: User }
```

### `expense.ts`
```ts
export type ExpenseStatus = 'unpaid' | 'partial' | 'paid'
export interface Expense {
  id: string; name: string; ceremony_id: string; ceremony_name: string
  category_id: string; category_name: string; vendor_id: string | null
  vendor_name: string | null; planned_amount: number | null
  actual_amount: number | null; base_currency: string
  refundable_amount: number; is_refunded: boolean; refunded_at: string | null
  is_planned: boolean; payment_deadline: string | null; notes: string | null
  total_paid: number; balance: number; status: ExpenseStatus
  created_at: string; updated_at: string
}
export interface ExpenseDetail extends Expense { payments: Payment[] }
```

### `payment.ts`
```ts
export type PaymentType = 'deposit' | 'balance' | 'full_payment'
export interface Payment {
  id: string; expense_id: string; expense_name: string
  ceremony_id: string; ceremony_name: string; payment_type: PaymentType
  user_currency_id: string; wallet_currency_code: string
  wallet_amount: string; exchange_rate: string | null
  base_amount: string; payment_date: string; notes: string | null
  created_at: string; updated_at: string
}
export interface PaymentSummary {
  total_paid: string; outstanding: string
  fully_paid_count: number; total_expenses: number
}
```

### `dashboard.ts`
```ts
export interface DashboardKpis {
  total_budget: string; actual_committed: string; total_paid: string
  outstanding: string; over_budget_amount: string; pending_refunds: string
}
export interface BarChartItem { category: string; actual_amount: string; total_paid: string }
export interface DonutItem { category: string; amount: string; pct: string }
export interface PaymentProgressItem {
  expense_id: string; name: string; actual_amount: string
  total_paid: string; balance: string; pct: string
}
export type NeedsAttentionBadge = 'Missing info' | 'No vendor' | 'Unconfirmed' | 'Pending refund' | 'Unpaid' | 'Balance due'
export interface NeedsAttentionItem {
  expense_id: string; name: string; vendor_name: string | null
  ceremony_name: string | null; badge: NeedsAttentionBadge
}
export interface DashboardData {
  kpis: DashboardKpis; bar_chart: BarChartItem[]
  donut_chart: DonutItem[]; payment_progress: PaymentProgressItem[]
  needs_attention: NeedsAttentionItem[]
}
```

---

## Phase 8 — Validations (`src/validations/`)

### `auth.ts`
```ts
import { z } from 'zod'
export const loginSchema = z.object({ email: z.email(), password: z.string().min(1) })
export const registerSchema = z.object({
  first_name: z.string().min(1), last_name: z.string().min(1),
  email: z.email(), password: z.string().min(8),
  account_type: z.enum(['couple', 'planner']).default('couple'),
})
export const onboard1Schema = z.object({
  event_name: z.string().min(1), event_date: z.string().date(),
  wedding_location: z.string().min(1), base_currency: z.string().length(3),
})
export const forgotSchema = z.object({ email: z.email() })
export const resetSchema = z.object({
  password: z.string().min(8), confirm_password: z.string().min(8), token: z.string().min(1),
}).refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type Onboard1Input = z.infer<typeof onboard1Schema>
```

### `expense.ts`
```ts
import { z } from 'zod'
export const createExpenseSchema = z.object({
  name: z.string().min(1), ceremony_id: z.uuid(),
  category_id: z.uuid().optional(), category_name: z.string().optional(),
  vendor_id: z.uuid().optional(), vendor_name: z.string().optional(),
  vendor_phone: z.string().optional(),
  vendor_email: z.email().optional().or(z.literal('')),
  actual_amount: z.number().int().nonnegative().optional(),
  planned_amount: z.number().int().nonnegative().optional(),
  payment_deadline: z.string().date().optional().or(z.literal('')),
  is_planned: z.boolean().default(false),
  notes: z.string().optional(),
}).refine(d => d.category_id || d.category_name, { message: 'Category is required' })
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
```

### `payment.ts`
```ts
import { z } from 'zod'
export const createPaymentSchema = z.object({
  payment_type: z.enum(['deposit', 'balance', 'full_payment']),
  user_currency_id: z.uuid(),
  wallet_amount: z.number().int().positive(),
  exchange_rate: z.number().int().positive().optional(),
  base_amount: z.number().int().positive().optional(),
  payment_date: z.string().min(1),
  notes: z.string().optional(),
})
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
```

---

## Phase 9 — API Layer (`src/store/`)

### `requests/auth.ts`
```ts
import { instance } from '@/services/axios'
import * as api from '@/services/api'
export const loginRequest        = (data: any) => instance.post(api.AUTH_LOGIN, data).then(r => r.data.data)
export const registerRequest     = (data: any) => instance.post(api.AUTH_REGISTER, data).then(r => r.data.data)
export const getMeRequest        = ()           => instance.get(api.AUTH_ME).then(r => r.data.data)
export const onboard1Request     = (data: any) => instance.patch(api.AUTH_ONBOARDING, data).then(r => r.data.data)
export const onboardCeremRequest = (data: any) => instance.post(api.AUTH_ONBOARDING_CERS, data).then(r => r.data.data)
export const onboardCurrRequest  = (data: any) => instance.post(api.AUTH_ONBOARDING_CURS, data).then(r => r.data.data)
export const forgotRequest       = (data: any) => instance.post(api.AUTH_FORGOT, data).then(r => r.data)
export const resetRequest        = (data: any) => instance.post(api.AUTH_RESET, data).then(r => r.data)
```

### `requests/expenses.ts`
```ts
import { instance } from '@/services/axios'; import * as api from '@/services/api'
export const fetchExpenses    = (params: any) => instance.get(api.EXPENSES, { params }).then(r => r.data.data)
export const fetchExpenseById = (id: string) => instance.get(api.EXPENSE_BY_ID(id)).then(r => r.data.data)
export const createExpense    = (data: any)  => instance.post(api.EXPENSES, data).then(r => r.data.data)
export const updateExpense    = ({id, ...data}: any) => instance.patch(api.EXPENSE_BY_ID(id), data).then(r => r.data.data)
export const deleteExpense    = (id: string) => instance.delete(api.EXPENSE_BY_ID(id)).then(r => r.data)
```

### `requests/payments.ts`
```ts
import { instance } from '@/services/axios'; import * as api from '@/services/api'
export const fetchPayments       = (params: any)  => instance.get(api.PAYMENTS, { params }).then(r => r.data.data)
export const fetchPaymentSummary = (params?: any) => instance.get(api.PAYMENT_SUMMARY, { params }).then(r => r.data.data)
export const fetchPaymentTypes   = ()             => instance.get(api.PAYMENT_TYPES).then(r => r.data.data)
export const createPayment       = ({expenseId, ...data}: any) =>
  instance.post(api.EXPENSE_PAYMENTS(expenseId), data).then(r => r.data.data)
export const deletePayment       = ({expenseId, paymentId}: any) =>
  instance.delete(api.DELETE_PAYMENT(expenseId, paymentId)).then(r => r.data)
```

### `requests/dashboard.ts`
```ts
import { instance } from '@/services/axios'; import * as api from '@/services/api'
export const fetchDashboard = (params?: any) => instance.get(api.DASHBOARD, { params }).then(r => r.data.data)
```

### `requests/ceremonies.ts`
```ts
import { instance } from '@/services/axios'; import * as api from '@/services/api'
export const fetchCeremonies = ()                  => instance.get(api.CEREMONIES).then(r => r.data.data)
export const createCeremony  = (data: any)        => instance.post(api.CEREMONIES, data).then(r => r.data.data)
export const updateCeremony  = ({id, ...data}: any) => instance.patch(api.CEREMONY_BY_ID(id), data).then(r => r.data.data)
export const deleteCeremony  = (id: string)        => instance.delete(api.CEREMONY_BY_ID(id)).then(r => r.data)
```

### `requests/currencies.ts`
```ts
import { instance } from '@/services/axios'; import * as api from '@/services/api'
export const fetchCurrencies = ()           => instance.get(api.CURRENCIES).then(r => r.data.data)
export const addCurrency     = (data: any) => instance.post(api.CURRENCIES, data).then(r => r.data.data)
export const removeCurrency  = (code: str) => instance.delete(api.CURRENCY_BY_CODE(code)).then(r => r.data)
```

### Query hook pattern (repeat for each domain):
```ts
// src/store/queries/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '@/store/requests/dashboard'
import { DASHBOARD_KEY } from '@/store/queryKeys'
import type { DashboardData } from '@/types/dashboard'

export const useGetDashboard = (ceremonyId?: string) =>
  useQuery<DashboardData>({
    queryKey: [DASHBOARD_KEY, ceremonyId],
    queryFn:  () => fetchDashboard(ceremonyId ? { ceremony_id: ceremonyId } : undefined),
  })
```

### Mutation hook pattern:
```ts
// src/store/mutations/useAuth.ts
import { useMutation } from '@tanstack/react-query'
import { loginRequest } from '@/store/requests/auth'
import { toast } from 'sonner'

export const useLogin = () =>
  useMutation({
    mutationFn: loginRequest,
    onSuccess: (res) => { localStorage.setItem('auth_token', res.token) },
    onError: (err: any) => { toast.error(err.response?.data?.message ?? 'Login failed') },
  })
```

---

## Phase 10 — Layout Components

### AppShell (`src/components/layout/AppShell.tsx`)
- Flex row: `<Sidebar />` (56px fixed) + `<main>` (flex-1, scroll)
- Sidebar bg: `#EDECEA`, border-right: `1px solid #E0DDD6`
- Logo: 36×36 green square, white "M"
- Nav: `IconLayoutDashboard` / `IconList` / `IconReceipt`
- Active: white bg pill, `#3A7A5A`; Inactive: `#9B9890`
- Bottom: green + button (add expense), settings icon, avatar → logout

### SlidePanel (`src/components/layout/SlidePanel.tsx`)
- Fixed inset-0 backdrop (semi-transparent), click to dismiss
- Panel: fixed top-0 right-0 h-full w-[480px], `animation: slideIn 200ms ease`
- Bg: `#FAFAF8`

---

## Phase 11 — Screens (build in this order)

1. **Login** → `useLogin` → redirect `/overview`
2. **Register** → `useRegister` → redirect `/onboarding/step-1`
3. **Forgot/Reset Password**
4. **Onboarding step-1** → event name, date, location, base currency
5. **Onboarding step-2** → ceremony toggles + currency toggles
6. **Overview** → KPI cards + bar chart + donut + payment progress + needs attention
7. **All Expenses** → table + search/filter + pagination
8. **Expense Detail** → info + payments list + add payment panel
9. **Payments** → KPI + paginated list
10. **Settings** → 3-tab (Account / Ceremonies / Currencies)

---

## Phase 12 — Verification Checklist

1. `npm run dev` — no TS errors
2. Auth flow: register → onboarding → app shell appears
3. Overview: real API data, ceremony filter changes data
4. All Expenses: search/filter/pagination work, row click navigates
5. Expense Detail: add payment → list refreshes
6. Payments: KPI + list
7. Settings: all 3 tabs, save works

---

## Implementation rules (for the learner)

- Never call Axios directly in a component — always `store/requests/` → `store/queries/` or `store/mutations/`
- `useReducerSpread` for any local state with 3+ fields
- All API money values are BIGINT strings → `Number()` before math, `fNGN()` before display
- After every mutation: `queryClient.invalidateQueries({ queryKey: [KEY] })`
- Route protection only in `_app/route.tsx`
- Slide panels: local `open` state on the parent screen, not a global store
