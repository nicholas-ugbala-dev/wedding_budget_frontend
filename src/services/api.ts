const BASE = import.meta.env.VITE_API_BASE_URL

export const AUTH_LOGIN           = `${BASE}/auth/login`
export const AUTH_REGISTER        = `${BASE}/auth/register`
export const AUTH_ME              = `${BASE}/auth/me`
export const AUTH_ONBOARDING      = `${BASE}/auth/onboarding`
export const AUTH_ONBOARDING_EVENTS = `${BASE}/auth/onboarding/events`
export const AUTH_ONBOARDING_CURS = `${BASE}/auth/onboarding/currencies`
export const AUTH_FORGOT          = `${BASE}/auth/forgot-password`
export const AUTH_RESET           = `${BASE}/auth/reset-password`

export const EVENTS               = `${BASE}/events`
export const EVENT_BY_ID          = (id: string) => `${BASE}/events/${id}`

export const CLIENTS              = `${BASE}/clients`
export const CLIENT_BY_ID         = (id: string) => `${BASE}/clients/${id}`

export const CURRENCIES           = `${BASE}/currencies`
export const CURRENCY_BY_CODE     = (code: string) => `${BASE}/currencies/${code}`

export const VENDORS              = `${BASE}/vendors`
export const VENDOR_BY_ID         = (id: string) => `${BASE}/vendors/${id}`

export const CATEGORIES           = `${BASE}/categories`
export const CATEGORY_BY_ID       = (id: string) => `${BASE}/categories/${id}`

export const EXPENSES             = `${BASE}/expenses`
export const EXPENSE_BY_ID        = (id: string) => `${BASE}/expenses/${id}`
export const EXPENSE_PAYMENTS     = (id: string) => `${BASE}/expenses/${id}/payments`
export const DELETE_PAYMENT       = (expId: string, payId: string) => `${BASE}/expenses/${expId}/payments/${payId}`
export const UPDATE_PAYMENT       = (expId: string, payId: string) => `${BASE}/expenses/${expId}/payments/${payId}`

export const PAYMENTS             = `${BASE}/payments`
export const PAYMENT_SUMMARY      = `${BASE}/payments/summary`
export const PAYMENT_TYPES        = `${BASE}/payments/types`

export const DASHBOARD            = `${BASE}/dashboard`
export const SETTINGS_ACCOUNT     = `${BASE}/settings/account`