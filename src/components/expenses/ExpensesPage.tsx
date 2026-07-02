import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { IconSearch, IconPlus } from '@tabler/icons-react'
import { AppSelect } from '@/components/ui/AppSelect'
import { useGetExpenses } from '@/store/queries/useExpenses'
import { useGetCeremonies } from '@/store/queries/useCeremonies'
import { useGetMe } from '@/store/queries/useAuth'
import { useReducerSpread } from '@/hooks/useReducerSpread'
import { fCurrency } from '@/lib/format'
import { cerStyle, statusStyle, PENDING_STYLE } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { SlidePanel } from '@/components/layout/SlidePanel'
import { ExpensePanel } from './ExpensePanel'
import type { Expense } from '@/types/expense'
import type { Ceremony } from '@/types/ceremony'

const STATUS_OPTIONS = [
  { value: '',        label: 'All statuses' },
  { value: 'unpaid',  label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid',    label: 'Paid' },
]

export function ExpensesPage() {
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const { data: user } = useGetMe()
  const { data: ceremonies = [] } = useGetCeremonies()
  const currency = user?.base_currency ?? 'NGN'

  // Stable color index per ceremony
  const cerIndexMap = Object.fromEntries(
    (ceremonies as Ceremony[]).map((c, i) => [c.id, i])
  )

  // Separate local input state from committed filter state
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useReducerSpread({
    search:      '',
    ceremony_id: '',
    status:      '',
    page:        1,
    limit:       10,
  })

  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== 0)
  )
  const { data, isLoading } = useGetExpenses(params)
  const items = data?.items ?? []
  const pg    = data?.pagination

  function commitSearch() {
    setFilters({ search: searchInput, page: 1 })
  }

  return (
    <div className="p-8 max-w-[1100px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[20px] font-semibold text-text-primary tracking-[-0.3px]">Expenses</div>

          {pg !== undefined && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span style={{ fontSize: 13, color: '#595650' }}>
                {pg.total} {pg.total === 1 ? 'expense' : 'expenses'}
              </span>
              {filters.ceremony_id && (() => {
                
                const name = (ceremonies as Ceremony[]).find(c => c.id === filters.ceremony_id)?.name
                return name ? (
                  <>
                    <span style={{ fontSize: 13, color: '#C0BEB8' }}>·</span>
                    <span style={{ fontSize: 13, color: '#595650' }}>
                      {name}
                    </span>
                  </>
                ) : null
              })()}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-[5px] cursor-pointer font-medium shrink-0"
          style={{ height: 34, padding: '0 14px', background: '#3A7A5A', color: 'white', border: 'none', borderRadius: 7, fontSize: 13 }}
        >
          <IconPlus size={14} />
          Add expense
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search — takes all remaining space */}
        <div className="relative flex-1 min-w-0">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && commitSearch()}
            placeholder="Search expenses…"
            className="w-full h-8 pl-8 pr-3 text-[13px] bg-surface border border-border rounded-[7px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Ceremony filter */}
        <div style={{ width: 140, flexShrink: 0 }}>
          <AppSelect
            value={filters.ceremony_id}
            onChange={v => setFilters({ ceremony_id: v, page: 1 })}
            placeholder="All ceremonies"
            options={[
              { value: '', label: 'All ceremonies' },
              ...(ceremonies as Ceremony[]).map(c => ({ value: c.id, label: c.name })),
            ]}
            style={{ height: 32, borderRadius: 6, fontSize: 13 }}
          />
        </div>

        {/* Status filter */}
        <div style={{ width: 120, flexShrink: 0 }}>
          <AppSelect
            value={filters.status}
            onChange={v => setFilters({ status: v, page: 1 })}
            options={STATUS_OPTIONS}
            style={{ height: 32, borderRadius: 6, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">

        {/* Header row */}
        <div
          className="grid text-[10px] font-semibold text-text-muted uppercase tracking-[0.07em]"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 100px 100px', padding: '10px 16px', borderBottom: '1px solid #F0EDE6', background: '#FAFAF8' }}
        >
          <div>Expense</div>
          <div>Vendor</div>
          <div>Amount</div>
          <div>Status</div>
          <div className="text-right">Balance</div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-[13px] text-text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-text-muted">No expenses found</div>
        ) : (
          items.map((item: Expense) => {
            const noAmount = !item.actual_amount || Number(item.actual_amount) === 0
            const status   = noAmount ? PENDING_STYLE : statusStyle(item.status)
            const cer      = cerStyle(cerIndexMap[item.ceremony_id] ?? 0)
            const balance  = Number(item.balance)

            return (
              <div
                key={item.id}
                onClick={() => navigate({ to: '/expenses/$expenseId', params: { expenseId: item.id } })}
                className="grid items-center cursor-pointer transition-colors hover:bg-[#FAFAF8]"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 100px 100px', padding: '11px 16px', borderBottom: '1px solid #F0EDE6' }}
              >
                {/* Expense name + ceremony badge */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[13px] font-medium text-text-primary truncate">{item.name}</span>
                  <span
                    className="text-[10px] font-medium self-start px-2 py-0.5 rounded-full"
                    style={{ background: cer.bg, color: cer.color, border: `1px solid ${cer.border}` }}
                  >
                    {item.ceremony_name}
                  </span>
                </div>

                {/* Vendor */}
                <div className="text-[13px] text-text-secondary truncate">
                  {item.vendor_name ?? <span className="text-text-muted">—</span>}
                </div>

                {/* Amount */}
                <div className="text-[13px] text-text-primary tabular-nums">
                  {item.actual_amount != null ? fCurrency(item.actual_amount, currency) : <span className="text-text-muted">—</span>}
                </div>

                {/* Status badge */}
                <div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Balance */}
                <div className="text-[13px] tabular-nums text-right" style={{ color: noAmount ? '#9B9890' : balance <= 0 ? '#3A7A5A' : '#C43C3C' }}>
                  {noAmount ? '—' : balance <= 0 ? 'Paid' : fCurrency(balance, currency)}
                </div>
              </div>
            )
          })
        )}
      </div>

      {pg && (
        <div className="mt-5">
          <Pagination
            pagination={pg}
            limit={filters.limit}
            onPageChange={page => setFilters({ page })}
            onLimitChange={limit => setFilters({ limit, page: 1 })}
          />
        </div>
      )}

      <SlidePanel open={addOpen} onClose={() => setAddOpen(false)}>
        <ExpensePanel onClose={() => setAddOpen(false)} />
      </SlidePanel>

    </div>
  )
}