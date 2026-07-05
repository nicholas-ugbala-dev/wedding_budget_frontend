import { useNavigate } from '@tanstack/react-router'
import { fCurrency } from '@/lib/format'
import { progressColor } from '@/lib/utils'

interface ProgressItem {
  expense_id: string; name: string
  actual_amount: string; total_paid: string; balance: string; pct: string
}
interface Props { data: ProgressItem[]; currency: string; rate?: number; isLoading: boolean }

export function PaymentProgress({ data, currency, rate = 1, isLoading }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-surface border border-border rounded-[10px] px-5 py-[18px]">
      <div className="text-[13px] font-medium text-text-primary mb-3.5">Payment progress</div>

      {isLoading ? (
        <div className="text-[13px] text-text-muted">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-[13px] text-text-muted">No expenses yet</div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 260 }}>
          {data.map(item => {
            const noAmount      = !item.actual_amount || Number(item.actual_amount) === 0
            const p             = Math.min(Number(item.pct), 100)
            const balance       = Number(item.balance)
            const displayBalance = rate !== 1 ? Math.round(balance * rate) : balance
            const color         = progressColor(p)
            const balanceColor  = noAmount ? '#9B9890' : balance <= 0 ? '#3A7A5A' : '#C43C3C'

            return (
              <div
                key={item.expense_id}
                onClick={() => navigate({ to: '/expenses/$expenseId', params: { expenseId: item.expense_id } })}
                className="cursor-pointer"
                style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px 72px', alignItems: 'center', gap: 8 }}
              >
                {/* Name */}
                <div className="text-[12px] text-text-primary truncate">{item.name}</div>

                {/* Progress bar */}
                <div style={{ height: 5, background: '#F2F1EC', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: color, width: `${p}%` }} />
                </div>

                {/* Pct */}
                <div className="text-[10px] text-text-muted text-right tabular-nums">
                  {noAmount ? '—' : `${p}%`}
                </div>

                {/* Balance */}
                <div className="text-[10px] text-right tabular-nums" style={{ color: balanceColor }}>
                  {noAmount ? '—' : balance <= 0 ? 'Paid' : (rate !== 1 ? '~' : '') + fCurrency(displayBalance, currency)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
