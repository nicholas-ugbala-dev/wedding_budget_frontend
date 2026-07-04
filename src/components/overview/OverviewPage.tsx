import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useGetDashboard } from '@/store/queries/useDashboard'
import { useGetEvents } from '@/store/queries/useEvents'
import { useGetMe } from '@/store/queries/useAuth'
import { useClientStore } from '@/store/useClientStore'
import { useBaseCurrency } from '@/store/queries/useBaseCurrency'
import { useGetCurrencies } from '@/store/queries/useCurrencies'
import { useExchangeRate } from '@/store/queries/useExchangeRate'
import { fCurrency } from '@/lib/format'
import { SpendingChart } from './SpendingChart'
import { DonutChart } from './DonutChart'
import { PaymentProgress } from './PaymentProgress'
import { NeedsAttention } from './NeedsAttention'
import type { Event } from '@/types/event'

const KPI_CONFIG = [
  { key: 'total_budget',     label: 'Total budget', color: '#1C1B18', note: 'Original estimate', to: '/events'   },
  { key: 'actual_committed', label: 'Total cost',   color: '#B87820', note: null,                 to: '/expenses' },
  { key: 'total_paid',       label: 'Total paid',   color: '#3A7A5A', note: null,                 to: '/payments' },
  { key: 'outstanding',      label: 'Outstanding',  color: '#C43C3C', note: null,                 to: null        },
] as const

export function OverviewPage() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { data: user } = useGetMe()
  const { data: events = [] } = useGetEvents()
  const { data, isLoading } = useGetDashboard(selectedId)
  const { activeClient } = useClientStore()
  const { data: extraCurrencies = [] } = useGetCurrencies()

  const isPlanner = user?.account_type === 'planner'
  const baseCurrency = useBaseCurrency()

  // Override stores { basedOn, code } — automatically invalid when baseCurrency changes
  const [override, setOverride] = useState<{ basedOn: string; code: string } | null>(null)

  const displayCurrency = override?.basedOn === baseCurrency ? override.code : baseCurrency
  const isConverted     = displayCurrency !== baseCurrency

  const { data: fetchedRate, isFetching: rateLoading } = useExchangeRate(baseCurrency, displayCurrency, isConverted)
  const conversionRate = isConverted ? (fetchedRate ?? 1) : 1

  const handleCurrencyChange = (code: string) => {
    setOverride(code === baseCurrency ? null : { basedOn: baseCurrency, code })
  }

  // All currencies available for this user/client (base first, then extras)
  const currencyCodes = [
    baseCurrency,
    ...(extraCurrencies as { currency_code: string }[])
      .filter(c => c.currency_code !== baseCurrency)
      .map(c => c.currency_code),
  ]

  // Convert + format a raw amount, with ~ prefix when rate is applied
  const fmt = (raw: number | string | undefined) => {
    if (raw == null) return '—'
    const n = isConverted ? Math.round(Number(raw) * conversionRate) : Number(raw)
    return (isConverted ? '~' : '') + fCurrency(n, displayCurrency)
  }

  const clientName = isPlanner && activeClient
    ? `${activeClient.first_name}${activeClient.last_name ? ` ${activeClient.last_name}` : ''}`
    : null

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="text-[20px] font-semibold text-text-primary tracking-[-0.3px]">Overview</div>
          <div style={{ fontSize: 13, color: '#595650', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            {clientName && <span>{clientName} ·</span>}
            <select
              value={displayCurrency}
              onChange={e => handleCurrencyChange(e.target.value)}
              disabled={rateLoading || currencyCodes.length <= 1}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 13,
                color: isConverted ? '#B87820' : '#595650',
                cursor: currencyCodes.length > 1 && !rateLoading ? 'pointer' : 'default',
                fontFamily: 'inherit',
                padding: 0,
                outline: 'none',
              }}
            >
              {currencyCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            {isConverted && !rateLoading && (
              <span style={{ fontSize: 11, color: '#C0BEB8' }}>· approx.</span>
            )}
            {rateLoading && (
              <span style={{ fontSize: 11, color: '#C0BEB8' }}>· fetching rate…</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedId(undefined)}
            className="h-7 px-3 rounded-full text-[12px] font-medium border cursor-pointer transition-colors"
            style={{
              background: !selectedId ? '#EEF5F1' : '#FAFAF8',
              color: !selectedId ? '#2A5C41' : '#595650',
              borderColor: !selectedId ? '#B8D9C8' : '#E8E6E0',
            }}
          >
            All
          </button>
          {(events as Event[]).map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelectedId(e.id)}
              className="h-7 px-3 rounded-full text-[12px] font-medium border cursor-pointer transition-colors"
              style={{
                background: selectedId === e.id ? '#EEF5F1' : '#FAFAF8',
                color: selectedId === e.id ? '#2A5C41' : '#595650',
                borderColor: selectedId === e.id ? '#B8D9C8' : '#E8E6E0',
              }}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {KPI_CONFIG.map(({ key, label, color, note, to }) => {
          const raw  = data?.kpis?.[key]
          const kpis = data?.kpis

          const overBudgetPct = key === 'actual_committed' && kpis
            ? Math.round((Number(kpis.over_budget_amount) / Number(kpis.total_budget)) * 100)
            : 0
          const paidPct = key === 'total_paid' && kpis
            ? Math.round((Number(kpis.total_paid) / Number(kpis.actual_committed)) * 100)
            : 0
          const refunds = key === 'outstanding' && Number(kpis?.pending_refunds) > 0

          let subNote: string | null = null
          if (key === 'actual_committed') subNote = overBudgetPct > 0 ? `+${overBudgetPct}% over budget` : 'On track'
          else if (key === 'total_paid') subNote = `${paidPct}% of committed`
          else if (refunds) subNote = `${fmt(kpis?.pending_refunds)} in refunds`
          else if (note) subNote = note

          const cardContent = (
            <>
              <div
                className="uppercase"
                style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', letterSpacing: '0.07em', marginBottom: 8 }}
              >
                {label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color, letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums' }}>
                {isLoading ? '—' : fmt(raw)}
              </div>
              {subNote && (
                <div style={{ fontSize: 11, color: '#9B9890', marginTop: 4 }}>{subNote}</div>
              )}
            </>
          )

          const sharedStyle = { padding: '16px 18px' }
          const sharedClass = 'bg-surface border border-border rounded-[10px]'

          return to ? (
            <button
              key={key}
              type="button"
              onClick={() => navigate({ to })}
              className={`${sharedClass} text-left w-full transition-colors hover:border-[#C8DDD4] hover:bg-[#F7FBF8] cursor-pointer`}
              style={sharedStyle}
            >
              {cardContent}
            </button>
          ) : (
            <div key={key} className={sharedClass} style={sharedStyle}>
              {cardContent}
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[3fr_2fr] gap-5 mb-5">
        <SpendingChart
          data={data?.bar_chart ?? []}
          currency={displayCurrency}
          rate={conversionRate}
          isLoading={isLoading}
        />
        <DonutChart data={data?.donut_chart ?? []} isLoading={isLoading} />
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-2 gap-5">
        <PaymentProgress
          data={data?.payment_progress ?? []}
          currency={displayCurrency}
          rate={conversionRate}
          isLoading={isLoading}
        />
        <NeedsAttention data={data?.needs_attention ?? []} />
      </div>

    </div>
  )
}
