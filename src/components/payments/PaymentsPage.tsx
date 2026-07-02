import { useNavigate } from '@tanstack/react-router'
import { useGetPayments } from '@/store/queries/usePayments'
import { useGetPaymentSummary } from '@/store/queries/usePayments'
import { useGetCeremonies } from '@/store/queries/useCeremonies'
import { useGetMe } from '@/store/queries/useAuth'
import { useReducerSpread } from '@/hooks/useReducerSpread'
import { fCurrency, fCurrencyFull, fDate } from '@/lib/format'
import { cerStyle } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import type { PaymentListItem } from '@/types/payment'
import type { Ceremony } from '@/types/ceremony'

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  deposit:      'Deposit',
  balance:      'Balance',
  full_payment: 'Full payment',
}

const PAYMENT_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  deposit:      { bg: '#F0EEE9', color: '#595650' },
  balance:      { bg: '#FDF5E6', color: '#92600A' },
  full_payment: { bg: '#EEF5F1', color: '#2A5C41' },
}

export function PaymentsPage() {
  const navigate = useNavigate()
  const { data: user }        = useGetMe()
  const { data: ceremonies = [] } = useGetCeremonies()
  const currency = user?.base_currency ?? 'NGN'

  const cerIndexMap = Object.fromEntries(
    (ceremonies as Ceremony[]).map((c, i) => [c.id, i])
  )

  const [filters, setFilters] = useReducerSpread({ page: 1, limit: 10 })

  const { data, isLoading } = useGetPayments(filters)
  const { data: summary }   = useGetPaymentSummary()

  const items = data?.items ?? []
  const pg    = data?.pagination

  return (
    <div className="px-8 py-7 flex flex-col gap-5">

      {/* Header */}
      <div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px' }}>Payments</div>
        <div style={{ fontSize: 13, color: '#595650', marginTop: 2 }}>All recorded payments across your event</div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-[10px]">
        <div className="bg-surface border border-border rounded-[10px]" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Total paid</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#3A7A5A', letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums' }}>
            {summary ? fCurrency(summary.total_paid, currency) : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#9B9890', marginTop: 4 }}>Across all vendors</div>
        </div>

        <div className="bg-surface border border-border rounded-[10px]" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Outstanding</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#C43C3C', letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums' }}>
            {summary ? fCurrency(summary.outstanding, currency) : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#9B9890', marginTop: 4 }}>Still to be paid</div>
        </div>

        <div className="bg-surface border border-border rounded-[10px]" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Fully paid</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#1C1B18', letterSpacing: '-0.3px', fontVariantNumeric: 'tabular-nums' }}>
            {summary ? `${summary.fully_paid_count} of ${summary.total_expenses}` : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#9B9890', marginTop: 4 }}>Expenses complete</div>
        </div>
      </div>

      {/* Payment list */}
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-[13px] text-text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-text-muted">No payments recorded yet</div>
        ) : (
          items.map((pay: PaymentListItem) => {
            const pt      = PAYMENT_TYPE_STYLE[pay.payment_type] ?? PAYMENT_TYPE_STYLE.deposit
            const ptLabel = PAYMENT_TYPE_LABEL[pay.payment_type] ?? pay.payment_type
            const cerIdx  = cerIndexMap[pay.ceremony_id] ?? 0
            const cer     = cerStyle(cerIdx)
            const isForeign = pay.wallet_currency_code !== currency
            const rateInfo = isForeign && pay.exchange_rate
              ? `1 ${pay.wallet_currency_code} = ${fCurrencyFull(pay.exchange_rate, currency)}`
              : null

            return (
              <div
                key={pay.id}
                onClick={() => navigate({ to: '/expenses/$expenseId', params: { expenseId: pay.expense_id } })}
                className="flex items-center justify-between cursor-pointer transition-colors hover:bg-[#FAFAF8]"
                style={{ padding: '14px 18px', borderBottom: '1px solid #F0EDE6' }}
              >
                {/* Left: name + tags */}
                <div className="flex-1 min-w-0">
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18', marginBottom: 5 }}>
                    {pay.expense_name}
                    {pay.vendor_name && (
                      <span style={{ fontWeight: 400, color: '#595650' }}> — {pay.vendor_name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-[6px] flex-wrap">
                    <span
                      className="inline-flex items-center rounded-full font-medium"
                      style={{ padding: '1px 7px', fontSize: 10, background: cer.bg, color: cer.color, border: `1px solid ${cer.border}` }}
                    >
                      {pay.ceremony_name}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full font-medium"
                      style={{ padding: '1px 7px', fontSize: 10, background: pt.bg, color: pt.color }}
                    >
                      {ptLabel}
                    </span>
                    {rateInfo && (
                      <span style={{ fontSize: 11, color: '#9B9890' }}>{rateInfo}</span>
                    )}
                  </div>
                </div>

                {/* Right: amount + date */}
                <div className="text-right shrink-0 ml-4">
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1B18', fontVariantNumeric: 'tabular-nums' }}>
                    {fCurrencyFull(pay.base_amount, currency)}
                  </div>
                  <div style={{ fontSize: 11, color: '#9B9890', marginTop: 2 }}>{fDate(pay.payment_date)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {pg && (
        <Pagination
          pagination={pg}
          limit={filters.limit}
          onPageChange={page => setFilters({ page })}
          onLimitChange={limit => setFilters({ limit, page: 1 })}
          limitOptions={[5, 10, 25, 50]}
        />
      )}

    </div>
  )
}