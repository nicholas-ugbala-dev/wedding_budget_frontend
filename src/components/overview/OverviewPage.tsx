import { useState } from 'react'
import { useGetDashboard } from '@/store/queries/useDashboard'
import { useGetCeremonies } from '@/store/queries/useCeremonies'
import { useGetMe } from '@/store/queries/useAuth'
import { fCurrency } from '@/lib/format'
import { SpendingChart } from './SpendingChart'
import { DonutChart } from './DonutChart'
import { PaymentProgress } from './PaymentProgress'
import { NeedsAttention } from './NeedsAttention'
import type { Ceremony } from '@/types/ceremony'

const KPI_CONFIG = [
  { key: 'total_budget',     label: 'Total budget',     color: '#1C1B18', note: 'Original estimate' },
  { key: 'actual_committed', label: 'Actual committed', color: '#B87820', note: null },
  { key: 'total_paid',       label: 'Total paid',       color: '#3A7A5A', note: null },
  { key: 'outstanding',      label: 'Outstanding',      color: '#C43C3C', note: null },
] as const

export function OverviewPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { data: user } = useGetMe()
  const { data: ceremonies = [] } = useGetCeremonies()
  const { data, isLoading } = useGetDashboard(selectedId)

  const currency = user?.base_currency ?? 'NGN'

  return (
    <div className="p-8 max-w-[1100px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="text-[20px] font-semibold text-text-primary tracking-[-0.3px]">Overview</div>
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
          {(ceremonies as Ceremony[]).map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className="h-7 px-3 rounded-full text-[12px] font-medium border cursor-pointer transition-colors"
              style={{
                background: selectedId === c.id ? '#EEF5F1' : '#FAFAF8',
                color: selectedId === c.id ? '#2A5C41' : '#595650',
                borderColor: selectedId === c.id ? '#B8D9C8' : '#E8E6E0',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {KPI_CONFIG.map(({ key, label, color, note }) => {
          const raw = data?.kpis?.[key]
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
          else if (refunds) subNote = `${fCurrency(kpis?.pending_refunds, currency)} in refunds`
          else if (note) subNote = note

          return (
            <div key={key} className="bg-surface border border-border rounded-[10px]" style={{ padding: '16px 18px' }}>
              <div
                className="uppercase"
                style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', letterSpacing: '0.07em', marginBottom: 8 }}
              >
                {label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color, letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums' }}>
                {isLoading ? '—' : fCurrency(raw, currency)}
              </div>
              {subNote && (
                <div style={{ fontSize: 11, color: '#9B9890', marginTop: 4 }}>{subNote}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[3fr_2fr] gap-5 mb-5">
        <SpendingChart data={data?.bar_chart ?? []} currency={currency} isLoading={isLoading} />
        <DonutChart data={data?.donut_chart ?? []} isLoading={isLoading} />
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-2 gap-5">
        <PaymentProgress data={data?.payment_progress ?? []} currency={currency} isLoading={isLoading} />
        <NeedsAttention data={data?.needs_attention ?? []} />
      </div>

    </div>
  )
}