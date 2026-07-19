export const AUTH_LOGIN = `auth/login`
export const AUTH_REGISTER = `auth/register`
export const AUTH_ME = `auth/me`
export const AUTH_ONBOARDING = `auth/onboarding`
export const AUTH_ONBOARDING_EVENTS = `auth/onboarding/events`
export const AUTH_ONBOARDING_CURS = `auth/onboarding/currencies`
export const AUTH_FORGOT = `auth/forgot-password`
export const AUTH_RESET = `auth/reset-password`

export const EVENTS = `events`
export const EVENT_BY_ID = (id: string) => `events/${id}`

export const CLIENTS = `clients`
export const CLIENT_BY_ID = (id: string) => `clients/${id}`

export const CURRENCIES = `currencies`
export const CURRENCY_BY_CODE = (code: string) => `currencies/${code}`

export const VENDORS = `vendors`
export const VENDOR_BY_ID = (id: string) => `vendors/${id}`

export const CATEGORIES = `categories`
export const CATEGORY_BY_ID = (id: string) => `categories/${id}`

export const EXPENSES = `expenses`
export const EXPENSE_BY_ID = (id: string) => `expenses/${id}`
export const EXPENSE_PAYMENTS = (id: string) => `expenses/${id}/payments`
export const DELETE_PAYMENT = (expId: string, payId: string) =>
  `expenses/${expId}/payments/${payId}`
export const UPDATE_PAYMENT = (expId: string, payId: string) =>
  `expenses/${expId}/payments/${payId}`

export const PAYMENTS = `payments`
export const PAYMENT_SUMMARY = `payments/summary`
export const PAYMENT_TYPES = `payments/types`

export const DASHBOARD = `dashboard`
export const SETTINGS_ACCOUNT = `settings/account`
