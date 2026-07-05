export const CURRENCY_META: Record<string, { symbol: string; locale: string; name: string }> = {
  NGN: { symbol: '₦',   locale: 'en-NG', name: 'Nigerian Naira' },
  USD: { symbol: '$',   locale: 'en-US', name: 'US Dollar' },
  GBP: { symbol: '£',   locale: 'en-GB', name: 'British Pound' },
  EUR: { symbol: '€',   locale: 'en-DE', name: 'Euro' },
  GHS: { symbol: 'GH₵', locale: 'en-GH', name: 'Ghanaian Cedi' },
  KES: { symbol: 'KSh', locale: 'en-KE', name: 'Kenyan Shilling' },
  ZAR: { symbol: 'R',   locale: 'en-ZA', name: 'South African Rand' },
  CAD: { symbol: 'C$',  locale: 'en-CA', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$',  locale: 'en-AU', name: 'Australian Dollar' },
  AED: { symbol: 'د.إ', locale: 'ar-AE', name: 'UAE Dirham' },
  UGX: { symbol: 'USh', locale: 'en-UG', name: 'Ugandan Shilling' },
  TZS: { symbol: 'TSh', locale: 'en-TZ', name: 'Tanzanian Shilling' },
}

function getMeta(currency = 'NGN') {
  return CURRENCY_META[currency] ?? { symbol: currency, locale: 'en-US', name: currency }
}

export function fCurrency(n: number | string | null | undefined, currency = 'NGN'): string {
  const { symbol, locale } = getMeta(currency)
  const num = Number(n)
  if (!num) return '—'
  if (num >= 1_000_000) return `${symbol}${parseFloat((num / 1_000_000).toFixed(2))}M`
  if (num >= 1_000)     return `${symbol}${parseFloat((num / 1_000).toFixed(1))}K`
  return `${symbol}${num.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function fCurrencyFull(n: number | string | null | undefined, currency = 'NGN'): string {
  const { symbol, locale } = getMeta(currency)
  const num = Number(n)
  return `${symbol}${num.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function fRate(n: number | string | null | undefined): string {
  const num = Number(n)
  if (!num) return '—'
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6 })
}

export function pct(paid: number | string, actual: number | string): number {
  const p = Number(paid)
  const a = Number(actual)
  return a > 0 ? Math.min(100, Math.round((p / a) * 100)) : 0
}


export function fDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  // append local midnight so 'YYYY-MM-DD' isn't shifted by UTC offset
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

